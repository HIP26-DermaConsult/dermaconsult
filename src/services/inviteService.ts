import { mockInvites } from "@/data/mockPortal";
import type { PatientInvite } from "@/types/portal";
import { uid } from "@/utils/formatters";

const STORAGE_KEY = "derma_consult_invites";
const INVITE_TTL_DAYS = 7;

function load(): PatientInvite[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PatientInvite[];
  } catch {
    /* ignore */
  }
  return mockInvites;
}

function save(invites: PatientInvite[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(invites));
}

/** Returns the invite with its status reconciled against the current time. */
function withDerivedStatus(invite: PatientInvite): PatientInvite {
  if (invite.status === "pending" && new Date(invite.expiresAt).getTime() < Date.now()) {
    return { ...invite, status: "expired" };
  }
  return invite;
}

// Backend integration: replace with /api/invites calls
export const inviteService = {
  async create(
    patientId: string,
    by: { id: string; name: string }
  ): Promise<PatientInvite> {
    await wait();
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + INVITE_TTL_DAYS);
    const invite: PatientInvite = {
      id: uid("inv"),
      token: uid("tok"),
      patientId,
      createdByUserId: by.id,
      createdByName: by.name,
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      status: "pending",
    };
    save([invite, ...load()]);
    return invite;
  },
  async getByToken(token: string): Promise<PatientInvite | undefined> {
    await wait();
    const invite = load().find((i) => i.token === token);
    return invite ? withDerivedStatus(invite) : undefined;
  },
  async accept(token: string): Promise<PatientInvite> {
    await wait();
    const all = load();
    const idx = all.findIndex((i) => i.token === token);
    if (idx === -1) throw new Error("Einladung nicht gefunden");
    all[idx] = { ...all[idx], status: "accepted" };
    save(all);
    return all[idx];
  },
  async listForPatient(patientId: string): Promise<PatientInvite[]> {
    await wait();
    return load()
      .filter((i) => i.patientId === patientId)
      .map(withDerivedStatus);
  },
};

function wait() {
  return new Promise((r) => setTimeout(r, 150));
}

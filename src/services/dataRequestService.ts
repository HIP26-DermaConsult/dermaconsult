import { mockDataRequests } from "@/data/mockPortal";
import type { ImageAttachment } from "@/types/konsil";
import type { DataRequest, PatientUpload } from "@/types/portal";
import { uid } from "@/utils/formatters";

const STORAGE_KEY = "derma_consult_data_requests";
const REQUEST_TTL_DAYS = 7;

function load(): DataRequest[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as DataRequest[];
  } catch {
    /* ignore */
  }
  return mockDataRequests;
}

function save(requests: DataRequest[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(requests));
}

function withDerivedStatus(req: DataRequest): DataRequest {
  if (req.status === "pending" && new Date(req.expiresAt).getTime() < Date.now()) {
    return { ...req, status: "expired" };
  }
  return req;
}

// Backend integration: replace with /api/data-requests calls
export const dataRequestService = {
  async create(input: {
    patientId: string;
    konsilId?: string;
    message: string;
    by: { id: string; name: string };
  }): Promise<DataRequest> {
    await wait();
    const now = new Date();
    const expires = new Date(now);
    expires.setDate(expires.getDate() + REQUEST_TTL_DAYS);
    const request: DataRequest = {
      id: uid("dr"),
      token: uid("tok"),
      patientId: input.patientId,
      konsilId: input.konsilId,
      requestedByUserId: input.by.id,
      requestedByName: input.by.name,
      message: input.message,
      status: "pending",
      createdAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      uploads: [],
    };
    save([request, ...load()]);
    return request;
  },
  async getByToken(token: string): Promise<DataRequest | undefined> {
    await wait();
    const req = load().find((r) => r.token === token);
    return req ? withDerivedStatus(req) : undefined;
  },
  async submitUpload(
    token: string,
    upload: { images: ImageAttachment[]; note?: string }
  ): Promise<DataRequest> {
    await wait();
    const all = load();
    const idx = all.findIndex((r) => r.token === token);
    if (idx === -1) throw new Error("Anfrage nicht gefunden");
    const entry: PatientUpload = {
      id: uid("up"),
      submittedAt: new Date().toISOString(),
      note: upload.note,
      images: upload.images,
    };
    all[idx] = {
      ...all[idx],
      status: "submitted",
      uploads: [...all[idx].uploads, entry],
    };
    save(all);
    return all[idx];
  },
  async listForKonsil(konsilId: string): Promise<DataRequest[]> {
    await wait();
    return load()
      .filter((r) => r.konsilId === konsilId)
      .map(withDerivedStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
  async listForPatient(patientId: string): Promise<DataRequest[]> {
    await wait();
    return load()
      .filter((r) => r.patientId === patientId)
      .map(withDerivedStatus)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },
};

function wait() {
  return new Promise((r) => setTimeout(r, 150));
}

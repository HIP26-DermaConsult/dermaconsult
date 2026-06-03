import { mockPatients } from "@/data/mockPatients";
import type { Patient, PortalStatus } from "@/types/patient";
import { uid } from "@/utils/formatters";

const STORAGE_KEY = "derma_consult_patients";

function load(): Patient[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Patient[];
  } catch {
    /* ignore */
  }
  return mockPatients;
}

function save(patients: Patient[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(patients));
}

// Backend integration: swap these for fetch() calls to /api/patients
export const patientService = {
  async list(): Promise<Patient[]> {
    await wait();
    return load();
  },
  async get(id: string): Promise<Patient | undefined> {
    await wait();
    return load().find((p) => p.id === id);
  },
  async create(input: Omit<Patient, "id">): Promise<Patient> {
    await wait();
    const patient: Patient = { ...input, id: uid("p") };
    const all = [patient, ...load()];
    save(all);
    return patient;
  },
  async update(id: string, patch: Partial<Patient>): Promise<Patient> {
    await wait();
    const all = load();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Patient not found");
    all[idx] = { ...all[idx], ...patch };
    save(all);
    return all[idx];
  },
  async remove(id: string): Promise<void> {
    await wait();
    save(load().filter((p) => p.id !== id));
  },
  async setPortalStatus(
    id: string,
    status: PortalStatus,
    portalUserId?: string
  ): Promise<Patient> {
    await wait();
    const all = load();
    const idx = all.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Patient not found");
    all[idx] = {
      ...all[idx],
      portalStatus: status,
      ...(portalUserId ? { portalUserId } : {}),
    };
    save(all);
    return all[idx];
  },
};

function wait() {
  return new Promise((r) => setTimeout(r, 150));
}

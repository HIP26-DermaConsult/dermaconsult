import { mockPatientSummaries } from "@/data/mockPortal";
import type { PatientSummary } from "@/types/portal";

const STORAGE_KEY = "derma_consult_summaries";

function load(): PatientSummary[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PatientSummary[];
  } catch {
    /* ignore */
  }
  return mockPatientSummaries;
}

function save(summaries: PatientSummary[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(summaries));
}

// Backend integration: replace with /api/patient-summaries calls
export const patientSummaryService = {
  async getForKonsil(konsilId: string): Promise<PatientSummary | undefined> {
    await wait();
    return load().find((s) => s.konsilId === konsilId);
  },
  async listForPatient(patientId: string): Promise<PatientSummary[]> {
    await wait();
    return load()
      .filter((s) => s.patientId === patientId)
      .sort((a, b) => b.sharedAt.localeCompare(a.sharedAt));
  },
  /** Create or update the patient-facing summary for a konsil. */
  async upsert(
    input: Omit<PatientSummary, "sharedAt" | "updatedAt"> &
      Partial<Pick<PatientSummary, "sharedAt">>
  ): Promise<PatientSummary> {
    await wait();
    const all = load();
    const nowIso = new Date().toISOString();
    const idx = all.findIndex((s) => s.konsilId === input.konsilId);
    if (idx === -1) {
      const summary: PatientSummary = {
        ...input,
        sharedAt: input.sharedAt ?? nowIso,
        updatedAt: nowIso,
      };
      save([summary, ...all]);
      return summary;
    }
    all[idx] = { ...all[idx], ...input, updatedAt: nowIso };
    save(all);
    return all[idx];
  },
};

function wait() {
  return new Promise((r) => setTimeout(r, 150));
}

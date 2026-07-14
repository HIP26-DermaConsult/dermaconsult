import type { AiAssessment, BodyRegionId, ImageAttachment } from "@/types/konsil";
import type { Patient } from "@/types/patient";

const API_BASE = import.meta.env.VITE_UPLOAD_API_BASE ?? "";

// The fields Claude needs to produce an assessment. A persisted Konsil
// satisfies this; a not-yet-created draft from the new-Konsil wizard does
// too (with no `id` yet — the id is only used to namespace the request).
export interface AiAssessmentInput {
  id?: string;
  reason: string;
  clinicalDescription: string;
  symptomDuration: string;
  suspectedDiagnosis?: string;
  previousTreatments?: string;
  additionalInfo?: string;
  selectedBodyRegions: BodyRegionId[];
  images: ImageAttachment[];
}

export const aiAssessmentService = {
  async generate(konsil: AiAssessmentInput, patient: Patient | undefined): Promise<AiAssessment> {
    const id = konsil.id ?? "draft";
    const res = await fetch(`${API_BASE}/api/konsile/${encodeURIComponent(id)}/ai-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ konsil, patient }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.error || `KI-Einschätzung fehlgeschlagen: ${res.status}`);
    }
    return res.json() as Promise<AiAssessment>;
  },
};

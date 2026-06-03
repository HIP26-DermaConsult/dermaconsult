import type { ImageAttachment } from "./konsil";

export type InviteStatus = "pending" | "accepted" | "expired";
export type DataRequestStatus = "pending" | "submitted" | "expired";

/** A doctor-generated invite that lets a patient register for portal access. */
export interface PatientInvite {
  id: string;
  token: string;
  patientId: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  expiresAt: string;
  status: InviteStatus;
}

/**
 * Doctor-curated, patient-facing summary of a consultation. Keyed per Konsil.
 * Deliberately separate from the clinical Konsil so patients never see raw
 * clinical fields or internal notes — only what the doctor chooses to share.
 */
export interface PatientSummary {
  konsilId: string;
  patientId: string;
  treatmentPlan: string;
  diseaseInfo: string;
  doctorNote: string;
  sharedByName: string;
  sharedAt: string;
  updatedAt: string;
}

/** A single patient submission against a DataRequest. */
export interface PatientUpload {
  id: string;
  submittedAt: string;
  note?: string;
  images: ImageAttachment[];
}

/**
 * A doctor's request for additional data from a patient, fulfilled via a
 * temporary upload link. Visible to both doctors on the related Konsil.
 */
export interface DataRequest {
  id: string;
  token: string;
  patientId: string;
  konsilId?: string;
  requestedByUserId: string;
  requestedByName: string;
  message: string;
  status: DataRequestStatus;
  createdAt: string;
  expiresAt: string;
  uploads: PatientUpload[];
}

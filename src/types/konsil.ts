import type { UserRole } from "./auth";

export type KonsilStatus =
  | "draft"
  | "submitted"
  | "in_review"
  | "rueckfrage"
  | "answered"
  | "closed";

export type Urgency = "routine" | "soon" | "urgent";

export type BodyRegionId =
  | "head"
  | "neck"
  | "chest"
  | "abdomen"
  | "back"
  | "arm-left"
  | "arm-right"
  | "hand-left"
  | "hand-right"
  | "leg-left"
  | "leg-right"
  | "foot-left"
  | "foot-right";

export interface ImageAttachment {
  id: string;
  filename: string;
  source: "desktop" | "mobile";
  previewUrl?: string;
  url?: string;
  uploadedAt: string;
  label?: string;
}

export type KonsilUploadSource = "hausarzt" | "patient" | "unknown";

export interface KonsilUpload {
  id: string;
  konsilId: string;
  source: KonsilUploadSource;
  submittedAt: string;
  note?: string;
  images: ImageAttachment[];
  reviewedByHausarzt: boolean;
}

export interface Message {
  id: string;
  senderRole: UserRole;
  senderName: string;
  createdAt: string;
  body: string;
}

export interface ExpertAssessment {
  assessment: string;
  recommendedDiagnosis: string;
  differentialDiagnoses: string[];
  recommendedTreatment: string;
  nextSteps: string;
  inPersonAppointmentRecommended: boolean;
  urgencyRecommendation: Urgency;
  authoredAt: string;
  authoredBy: string;
}

export interface ReferralForm {
  referringPractice: string;
  patientDisplay: string;
  patientDateOfBirth: string;
  insuranceName: string;
  insuranceFundNumber: string;
  insuranceNumber: string;
  insuranceStatus: string;
  bsnr: string;
  lanr: string;
  issueDate: string;
  kurativ: boolean;
  praeventiv: boolean;
  otherPayer: boolean;
  accident: boolean;
  accidentConsequences: boolean;
  limitedEntitlement: boolean;
  asv: boolean;
  inpatientTreatment: boolean;
  referralTo: string;
  orderService: boolean;
  consultantExamination: boolean;
  coTreatment: boolean;
  furtherTreatment: boolean;
  auUntil: string;
  surgeryDate: string;
  diagnosis: string;
  findingsMedication: string;
  order: string;
  signature: string;
}

export interface TimelineEvent {
  id: string;
  type:
    | "created"
    | "submitted"
    | "assigned"
    | "in_review"
    | "rueckfrage"
    | "answered"
    | "closed"
    | "message"
    | "note";
  at: string;
  by: string;
  description: string;
}

export interface Konsil {
  id: string;
  patientId: string;
  createdByUserId: string;
  assignedExpertId?: string;
  createdAt: string;
  updatedAt: string;
  uploadToken: string;
  status: KonsilStatus;
  urgency: Urgency;
  reason: string;
  clinicalDescription: string;
  symptomDuration: string;
  suspectedDiagnosis?: string;
  previousTreatments?: string;
  additionalInfo?: string;
  referralForm?: ReferralForm;
  selectedBodyRegions: BodyRegionId[];
  images: ImageAttachment[];
  messages: Message[];
  expertAssessment?: ExpertAssessment;
  timeline: TimelineEvent[];
}

export interface NewKonsilInput {
  patientId: string;
  urgency: Urgency;
  reason: string;
  clinicalDescription: string;
  symptomDuration: string;
  suspectedDiagnosis?: string;
  previousTreatments?: string;
  additionalInfo?: string;
  referralForm?: ReferralForm;
  selectedBodyRegions: BodyRegionId[];
  images: ImageAttachment[];
}

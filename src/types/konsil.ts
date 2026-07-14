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
  | "head-front"
  | "head-back"
  | "ear-left-front"
  | "ear-left-back"
  | "ear-right-front"
  | "ear-right-back"
  | "neck-front"
  | "neck-back"
  | "chest"
  | "abdomen"
  | "groin"
  | "upper-back"
  | "lower-back"
  | "shoulder-left-front"
  | "shoulder-left-back"
  | "shoulder-right-front"
  | "shoulder-right-back"
  | "upper-arm-left-front"
  | "upper-arm-left-back"
  | "upper-arm-right-front"
  | "upper-arm-right-back"
  | "forearm-left-front"
  | "forearm-left-back"
  | "forearm-right-front"
  | "forearm-right-back"
  | "hand-left-front"
  | "hand-left-back"
  | "hand-right-front"
  | "hand-right-back"
  | "thigh-left-front"
  | "thigh-left-back"
  | "thigh-right-front"
  | "thigh-right-back"
  | "lower-leg-left-front"
  | "lower-leg-left-back"
  | "lower-leg-right-front"
  | "lower-leg-right-back"
  | "foot-left-front"
  | "foot-left-back"
  | "foot-right-front"
  | "foot-right-back";

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

export interface AiAssessment {
  content: string;
  model: string;
  generatedAt: string;
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
  selectedBodyRegions: BodyRegionId[];
  images: ImageAttachment[];
}

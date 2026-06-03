export type UserRole = "hausarzt" | "dermatologist" | "patient";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  practiceName?: string;
  department?: string;
  avatarColor?: string;
  /** Set for patient accounts — links the user to their Patient record. */
  patientId?: string;
}

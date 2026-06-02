export type UserRole = "hausarzt" | "dermatologist";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  practiceName?: string;
  department?: string;
  avatarColor?: string;
}

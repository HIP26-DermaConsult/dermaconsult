export type Gender = "weiblich" | "männlich" | "divers";
export type InsuranceType = "gesetzlich" | "privat" | "selbstzahler";

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO yyyy-mm-dd
  gender: Gender;
  insuranceType: InsuranceType;
  phone?: string;
  email?: string;
  address?: string;
  allergies: string[];
  medications: string[];
  diagnoses: string[];
  skinHistory: string[];
  notes?: string;
}

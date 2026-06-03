import type { User } from "@/types/auth";
import type { PatientInvite, PatientSummary, DataRequest } from "@/types/portal";

const iso = (daysAgo: number) => {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString();
};

/** Demo patient account, linked to Anna Becker (p_001). */
export const demoPatientUser: User = {
  id: "u_patient_1",
  name: "Anna Becker",
  email: "anna.becker@example.de",
  role: "patient",
  patientId: "p_001",
  avatarColor: "bg-violet-600",
};

export const mockPatientUsers: User[] = [demoPatientUser];

export const mockInvites: PatientInvite[] = [
  {
    id: "inv_demo_1",
    token: "demo-invite-anna",
    patientId: "p_001",
    createdByUserId: "u_hausarzt_1",
    createdByName: "Dr. med. Lena Hofmann",
    createdAt: iso(10),
    expiresAt: iso(-360), // far in the future
    status: "accepted",
  },
];

/** Patient-facing summary shared for the answered konsil K-2026-0001. */
export const mockPatientSummaries: PatientSummary[] = [
  {
    konsilId: "K-2026-0001",
    patientId: "p_001",
    diseaseInfo:
      "Bei Ihnen besteht der Verdacht auf ein Kontaktekzem der Hände. Dabei reagiert die Haut " +
      "gereizt auf bestimmte Stoffe (z. B. häufiges Wasser, Reinigungsmittel oder Nickel). Das ist " +
      "nicht ansteckend und bessert sich meist deutlich, wenn die auslösenden Reize gemieden werden.",
    treatmentPlan:
      "1. Hände konsequent mit einer rückfettenden Creme pflegen (mehrmals täglich).\n" +
      "2. Bei Hautkontakt mit Wasser oder Reinigungsmitteln Schutzhandschuhe tragen.\n" +
      "3. Die verschriebene Kortison-Creme wie besprochen für die nächsten 10 Tage anwenden.\n" +
      "4. Kontrolle in der Praxis in 2 Wochen.",
    doctorNote:
      "Bitte melden Sie sich, falls sich die Beschwerden verschlimmern oder offene Stellen auftreten. " +
      "Fotos vom Verlauf können Sie jederzeit über die Plattform hochladen.",
    sharedByName: "Dr. med. Lena Hofmann",
    sharedAt: iso(2),
    updatedAt: iso(2),
  },
];

export const mockDataRequests: DataRequest[] = [];

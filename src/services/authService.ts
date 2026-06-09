import { findUserByRole, mockUsers } from "@/data/mockUsers";
import { demoPatientUser, mockPatientUsers } from "@/data/mockPortal";
import type { User, UserRole } from "@/types/auth";
import { inviteService } from "@/services/inviteService";
import { patientService } from "@/services/patientService";
import { uid } from "@/utils/formatters";

const STORAGE_KEY = "derma_consult_user";
const PATIENT_USERS_KEY = "derma_consult_patient_users";

// NOTE: This service layer is intentionally async so a real backend
// (e.g. /api/auth/login) can replace these implementations later.
export const authService = {
  async loginWithCredentials(email: string, _password: string): Promise<User> {
    await delay(400);
    const all = [...mockUsers, ...loadPatientUsers()];
    const user =
      all.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? mockUsers[0];
    persist(user);
    return user;
  },

  async loginAs(role: UserRole): Promise<User> {
    await delay(250);
    const user = role === "patient" ? demoPatientUser : findUserByRole(role);
    persist(user);
    return user;
  },

  async loginAsDemoUser(user: User): Promise<User> {
    await delay(250);
    persist(user);
    return user;
  },

  /** Accept a portal invite, create the patient account and start a session. */
  async registerPatient(
    token: string,
    input: { email: string; password: string; dobConfirm: string }
  ): Promise<User> {
    await delay(400);
    const invite = await inviteService.getByToken(token);
    if (!invite) throw new Error("Einladung ungültig.");
    if (invite.status === "expired") throw new Error("Einladung abgelaufen.");

    const patient = await patientService.get(invite.patientId);
    if (!patient) throw new Error("Patientendaten nicht gefunden.");
    if (input.dobConfirm !== patient.dateOfBirth) {
      throw new Error("Das Geburtsdatum stimmt nicht mit unseren Daten überein.");
    }

    const user: User = {
      id: uid("u_patient"),
      name: `${patient.firstName} ${patient.lastName}`,
      email: input.email,
      role: "patient",
      patientId: patient.id,
      avatarColor: "bg-violet-600",
    };

    savePatientUsers([user, ...loadPatientUsers().filter((u) => u.id !== user.id)]);
    await inviteService.accept(token);
    await patientService.setPortalStatus(patient.id, "active", user.id);
    persist(user);
    return user;
  },

  async logout(): Promise<void> {
    await delay(100);
    localStorage.removeItem(STORAGE_KEY);
  },

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  },
};

function loadPatientUsers(): User[] {
  try {
    const raw = localStorage.getItem(PATIENT_USERS_KEY);
    if (raw) return JSON.parse(raw) as User[];
  } catch {
    /* ignore */
  }
  return mockPatientUsers;
}

function savePatientUsers(users: User[]) {
  localStorage.setItem(PATIENT_USERS_KEY, JSON.stringify(users));
}

function persist(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

import { findUserByRole, mockUsers } from "@/data/mockUsers";
import type { User, UserRole } from "@/types/auth";

const STORAGE_KEY = "derma_consult_user";

// NOTE: This service layer is intentionally async so a real backend
// (e.g. /api/auth/login) can replace these implementations later.
export const authService = {
  async loginWithCredentials(email: string, _password: string): Promise<User> {
    await delay(400);
    const user =
      mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase()) ??
      mockUsers[0];
    persist(user);
    return user;
  },

  async loginAs(role: UserRole): Promise<User> {
    await delay(250);
    const user = findUserByRole(role);
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

function persist(user: User) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

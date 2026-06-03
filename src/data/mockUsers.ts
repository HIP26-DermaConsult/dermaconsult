import type { User } from "@/types/auth";

export const mockUsers: User[] = [
  {
    id: "u_hausarzt_1",
    name: "Dr. med. Lena Hofmann",
    email: "hofmann@hausarztpraxis-mitte.de",
    role: "hausarzt",
    practiceName: "Hausarztpraxis Mitte",
    avatarColor: "bg-brand-600",
  },
  {
    id: "u_derm_1",
    name: "Dr. med. Markus Weber",
    email: "weber@derma-klinik-tum.de",
    role: "dermatologist",
    department: "Klinik für Dermatologie, TUM",
    avatarColor: "bg-emerald-600",
  },
];

export const findUserByRole = (role: "hausarzt" | "dermatologist") =>
  mockUsers.find((u) => u.role === role)!;

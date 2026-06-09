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
    id: "u_hausarzt_2",
    name: "Dr. med. Jonas Richter",
    email: "richter@praxis-isartor.de",
    role: "hausarzt",
    practiceName: "Praxis am Isartor",
    avatarColor: "bg-sky-600",
  },
  {
    id: "u_hausarzt_3",
    name: "Dr. med. Miriam Seidel",
    email: "seidel@mvz-nord.de",
    role: "hausarzt",
    practiceName: "MVZ Muenchen Nord",
    avatarColor: "bg-indigo-600",
  },
  {
    id: "u_derm_1",
    name: "Dr. med. Markus Weber",
    email: "weber@derma-klinik-tum.de",
    role: "dermatologist",
    department: "Klinik für Dermatologie, TUM",
    avatarColor: "bg-emerald-600",
  },
  {
    id: "u_derm_2",
    name: "Dr. med. Clara Neumann",
    email: "neumann@derma-zentrum.de",
    role: "dermatologist",
    department: "Dermatologisches Zentrum Muenchen",
    avatarColor: "bg-teal-600",
  },
  {
    id: "u_derm_3",
    name: "Prof. Dr. Sabine Keller",
    email: "keller@uniklinik-derma.de",
    role: "dermatologist",
    department: "Universitaetsklinik Dermatologie",
    avatarColor: "bg-emerald-700",
  },
];

export const findUserByRole = (role: "hausarzt" | "dermatologist") =>
  mockUsers.find((u) => u.role === role)!;

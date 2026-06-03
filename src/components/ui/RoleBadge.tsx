import type { UserRole } from "@/types/auth";
import { Badge } from "./Badge";
import { Stethoscope, ScanEye, UserRound } from "lucide-react";

export function RoleBadge({ role, size = "md" }: { role: UserRole; size?: "sm" | "md" }) {
  if (role === "hausarzt") {
    return (
      <Badge size={size} className="bg-brand-50 text-brand-700 ring-brand-200">
        <Stethoscope className="w-3 h-3" /> Hausarzt
      </Badge>
    );
  }
  if (role === "patient") {
    return (
      <Badge size={size} className="bg-violet-50 text-violet-700 ring-violet-200">
        <UserRound className="w-3 h-3" /> Patient:in
      </Badge>
    );
  }
  return (
    <Badge size={size} className="bg-emerald-50 text-emerald-700 ring-emerald-200">
      <ScanEye className="w-3 h-3" /> Dermatologie-Expert:in
    </Badge>
  );
}

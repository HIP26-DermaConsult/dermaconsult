import type { UserRole } from "@/types/auth";
import { Badge } from "./Badge";
import { Stethoscope, ScanEye } from "lucide-react";

export function RoleBadge({ role, size = "md" }: { role: UserRole; size?: "sm" | "md" }) {
  if (role === "hausarzt") {
    return (
      <Badge size={size} className="bg-brand-50 text-brand-700 ring-brand-200">
        <Stethoscope className="w-3 h-3" /> Hausarzt
      </Badge>
    );
  }
  return (
    <Badge size={size} className="bg-emerald-50 text-emerald-700 ring-emerald-200">
      <ScanEye className="w-3 h-3" /> Dermatologie-Expert:in
    </Badge>
  );
}

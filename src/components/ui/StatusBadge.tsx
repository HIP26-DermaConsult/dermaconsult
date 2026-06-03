import type { KonsilStatus, Urgency } from "@/types/konsil";
import { STATUS_COLORS, STATUS_LABELS, URGENCY_COLORS, URGENCY_LABELS } from "@/utils/constants";
import { Badge } from "./Badge";
import { AlertTriangle, CircleDot, Clock } from "lucide-react";

export function StatusBadge({ status, size = "md" }: { status: KonsilStatus; size?: "sm" | "md" }) {
  return (
    <Badge className={STATUS_COLORS[status]} size={size}>
      <CircleDot className="w-3 h-3" />
      {STATUS_LABELS[status]}
    </Badge>
  );
}

export function UrgencyBadge({ urgency, size = "md" }: { urgency: Urgency; size?: "sm" | "md" }) {
  const icon =
    urgency === "urgent" ? (
      <AlertTriangle className="w-3 h-3" />
    ) : (
      <Clock className="w-3 h-3" />
    );
  return (
    <Badge className={URGENCY_COLORS[urgency]} size={size}>
      {icon}
      {URGENCY_LABELS[urgency]}
    </Badge>
  );
}

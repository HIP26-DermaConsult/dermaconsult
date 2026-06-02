import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn } from "@/utils/formatters";

export function DashboardCard({
  label,
  value,
  icon: Icon,
  hint,
  tone = "default",
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  hint?: string;
  tone?: "default" | "warn" | "danger" | "good";
}) {
  const tones: Record<string, string> = {
    default: "bg-brand-50 text-brand-700",
    warn: "bg-amber-50 text-amber-700",
    danger: "bg-rose-50 text-rose-700",
    good: "bg-emerald-50 text-emerald-700",
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-ink-600">{label}</div>
          <div className="mt-2 text-3xl font-semibold text-ink-900 tracking-tight tabular-nums">
            {value}
          </div>
          {hint && <div className="text-xs text-ink-500 mt-1">{hint}</div>}
        </div>
        <div className={cn("p-2.5 rounded-lg", tones[tone])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}

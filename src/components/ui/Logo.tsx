import { cn } from "@/utils/formatters";

export function Logo({ className, withText = true }: { className?: string; withText?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white grid place-items-center font-bold shadow-card">
        DC
      </div>
      {withText && (
        <div className="leading-tight">
          <div className="font-semibold text-ink-900 tracking-tight">Derma Consult</div>
          <div className="text-[11px] text-ink-500">Dermatologie-Konsile</div>
        </div>
      )}
    </div>
  );
}

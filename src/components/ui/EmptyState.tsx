import type { ReactNode } from "react";
import { cn } from "@/utils/formatters";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center px-6 py-12 rounded-xl border border-dashed border-ink-200 bg-ink-50/40",
        className
      )}
    >
      {icon && (
        <div className="w-12 h-12 rounded-full bg-white border border-ink-200 flex items-center justify-center text-ink-500 mb-3">
          {icon}
        </div>
      )}
      <div className="font-medium text-ink-900">{title}</div>
      {description && <div className="text-sm text-ink-600 mt-1 max-w-md">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/utils/formatters";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-white border border-ink-200 rounded-xl shadow-card",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  description,
  action,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4 p-5 border-b border-ink-100", className)}>
      <div>
        <div className="font-semibold text-ink-900">{title}</div>
        {description && <div className="text-sm text-ink-600 mt-0.5">{description}</div>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...props} />;
}

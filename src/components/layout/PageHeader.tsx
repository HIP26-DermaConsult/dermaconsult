import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  action,
  breadcrumbs,
}: {
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  breadcrumbs?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {breadcrumbs && <div className="text-xs text-ink-500 mb-1">{breadcrumbs}</div>}
        <h1 className="text-2xl font-semibold text-ink-900 tracking-tight">{title}</h1>
        {description && <p className="text-sm text-ink-600 mt-1 max-w-2xl">{description}</p>}
      </div>
      {action && <div className="flex gap-2">{action}</div>}
    </div>
  );
}

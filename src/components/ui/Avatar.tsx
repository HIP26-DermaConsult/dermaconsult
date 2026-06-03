import { cn, initials } from "@/utils/formatters";

export function Avatar({
  name,
  color = "bg-brand-600",
  size = 36,
}: {
  name: string;
  color?: string;
  size?: number;
}) {
  return (
    <div
      className={cn(
        "rounded-full text-white flex items-center justify-center font-semibold select-none",
        color
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      aria-hidden
    >
      {initials(name)}
    </div>
  );
}

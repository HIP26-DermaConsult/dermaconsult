import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/utils/formatters";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-700 active:bg-brand-800 disabled:bg-brand-300",
  secondary:
    "bg-ink-100 text-ink-800 hover:bg-ink-200 active:bg-ink-300 disabled:opacity-60",
  ghost: "text-ink-700 hover:bg-ink-100 disabled:opacity-60",
  outline:
    "border border-ink-200 bg-white text-ink-800 hover:bg-ink-50 disabled:opacity-60",
  danger:
    "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 disabled:bg-rose-300",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-md gap-2",
  lg: "h-11 px-5 text-base rounded-lg gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, className, children, disabled, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center font-medium transition-colors focus-ring",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && (
        <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
});

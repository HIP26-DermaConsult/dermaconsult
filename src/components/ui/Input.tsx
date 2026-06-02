import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes, type SelectHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/utils/formatters";

export function Label({
  children,
  htmlFor,
  required,
  hint,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  hint?: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block">
      <span className="text-sm font-medium text-ink-800">
        {children}
        {required && <span className="text-rose-600 ml-0.5">*</span>}
      </span>
      {hint && <span className="block text-xs text-ink-500 mt-0.5">{hint}</span>}
    </label>
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-sm text-ink-900",
          "placeholder:text-ink-400 focus-ring",
          "focus:border-brand-500 transition-colors",
          "disabled:bg-ink-50 disabled:text-ink-500",
          className
        )}
        {...props}
      />
    );
  }
);

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full min-h-[88px] px-3 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900",
          "placeholder:text-ink-400 focus-ring focus:border-brand-500 transition-colors",
          className
        )}
        {...props}
      />
    );
  }
);

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...props }, ref) {
    return (
      <select
        ref={ref}
        className={cn(
          "w-full h-10 px-3 rounded-md border border-ink-200 bg-white text-sm text-ink-900",
          "focus-ring focus:border-brand-500 transition-colors",
          className
        )}
        {...props}
      >
        {children}
      </select>
    );
  }
);

export function Field({
  label,
  children,
  required,
  hint,
  htmlFor,
  error,
}: {
  label: ReactNode;
  children: ReactNode;
  required?: boolean;
  hint?: ReactNode;
  htmlFor?: string;
  error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} required={required} hint={hint}>
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}

import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white",
  secondary:
    "bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]",
  ghost: "hover:bg-[var(--color-surface-hover)]",
  danger: "bg-[var(--color-danger)] hover:opacity-90 text-white",
};

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 disabled:pointer-events-none",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}

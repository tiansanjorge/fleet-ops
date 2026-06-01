import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tooltip?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-surface text-zinc-800 hover:bg-zinc-200 dark:text-zinc-200 dark:hover:bg-zinc-700",
  primary:
    "bg-foreground text-background hover:bg-zinc-700 dark:hover:bg-zinc-300",
  danger:
    "bg-red-500/10 text-red-500 hover:bg-red-500/20 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25",
  ghost: "bg-transparent text-muted hover:bg-zinc-100 dark:hover:bg-zinc-800",
};

export function Button({
  variant = "default",
  tooltip,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const disabledStyles = disabled
    ? "opacity-40 cursor-default pointer-events-none"
    : "cursor-pointer";

  return (
    <button
      title={tooltip}
      disabled={disabled}
      className={`
        inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium
        transition-colors duration-150
        ${variantStyles[variant]}
        ${disabledStyles}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

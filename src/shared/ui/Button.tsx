import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "default" | "primary" | "danger" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  tooltip?: string;
  children: ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  default:
    "bg-zinc-100 text-zinc-800 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700",
  primary:
    "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300",
  danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
  ghost:
    "bg-transparent text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800",
};

export function Button({
  variant = "default",
  tooltip,
  disabled,
  children,
  className = "",
  ...props
}: ButtonProps) {
  const disabledStyles = disabled ? "opacity-40 cursor-not-allowed" : "";

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

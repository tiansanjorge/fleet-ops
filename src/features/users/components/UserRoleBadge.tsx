import type { UserRole } from "../types";

interface UserRoleBadgeProps {
  role: UserRole;
}

const roleStyles: Record<
  UserRole,
  { bg: string; text: string; label: string }
> = {
  admin: { bg: "bg-red-500/15", text: "text-red-400", label: "admin" },
  operator: { bg: "bg-blue-500/15", text: "text-blue-400", label: "operator" },
  viewer: { bg: "bg-zinc-500/15", text: "text-zinc-400", label: "viewer" },
};

export function UserRoleBadge({ role }: UserRoleBadgeProps) {
  const { bg, text, label } = roleStyles[role];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${bg} ${text}`}
    >
      {label}
    </span>
  );
}

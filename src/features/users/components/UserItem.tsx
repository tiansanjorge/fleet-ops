"use client";

import { usePermission } from "@/core/permissions/usePermission";
import type { User, UserRole } from "../types";
import { UserRoleBadge } from "./UserRoleBadge";

const ALL_ROLES: UserRole[] = ["admin", "operator", "viewer"];

interface UserItemProps {
  user: User;
  isCurrentUser: boolean;
  onRoleChange: (id: string, role: UserRole) => void;
  isPending: boolean;
}

export function UserItem({
  user,
  isCurrentUser,
  onRoleChange,
  isPending,
}: UserItemProps) {
  const { can } = usePermission();
  const canManage = can("manage:users");

  function getInitials(name: string): string {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }

  const avatarColors: Record<UserRole, { bg: string; text: string }> = {
    admin: { bg: "bg-red-500/15", text: "text-red-400" },
    operator: { bg: "bg-blue-500/15", text: "text-blue-400" },
    viewer: { bg: "bg-zinc-500/15", text: "text-zinc-400" },
  };

  const { bg, text } = avatarColors[user.role];

  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0">
      {/* Avatar */}
      <div
        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-medium ${bg} ${text}`}
      >
        {getInitials(user.name)}
      </div>

      {/* Name + current user indicator */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground truncate">
            {user.name}
          </span>
          {isCurrentUser && (
            <span className="text-[10px] font-medium text-muted">(you)</span>
          )}
        </div>
      </div>

      {/* Role — editable if can manage:users AND not the current admin's own row */}
      {canManage && !(isCurrentUser && user.role === "admin") ? (
        <select
          value={user.role}
          disabled={isPending}
          onChange={(e) => onRoleChange(user.id, e.target.value as UserRole)}
          className="cursor-pointer rounded-md border border-border bg-surface-raised px-2 py-0.5 text-xs font-medium text-foreground transition-colors duration-150 hover:border-zinc-400 dark:hover:border-zinc-500 disabled:opacity-40 disabled:cursor-default disabled:pointer-events-none focus:outline-none"
        >
          {ALL_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      ) : (
        <UserRoleBadge role={user.role} />
      )}
    </div>
  );
}

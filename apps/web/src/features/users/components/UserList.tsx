"use client";

import { useState } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useUsers } from "../hooks/useUsers";
import { UserItem } from "./UserItem";
import type { UserRole } from "@fleetops/types";

interface UserListProps {
  onClose: () => void;
}

export function UserList({ onClose }: UserListProps) {
  const { users, isLoading, changeRole, isChangingRole } = useUsers();
  const currentUser = useAuthStore((state) => state.currentUser);

  // Staged changes: id → new role. Empty = nothing pending.
  const [draft, setDraft] = useState<Record<string, UserRole>>({});

  const hasDraft = Object.keys(draft).length > 0;

  function handleRoleChange(id: string, role: UserRole) {
    setDraft((prev) => ({ ...prev, [id]: role }));
  }

  function handleCancel() {
    setDraft({});
    onClose();
  }

  function handleAccept() {
    for (const [id, role] of Object.entries(draft)) {
      const original = users.find((u) => u.id === id)?.role;
      if (original !== role) changeRole({ id, role });
    }
    setDraft({});
    onClose();
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card border border-border max-h-[80vh]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <PanelHeader
          title="Manage users"
          subtitle={`${users.length} member${users.length !== 1 ? "s" : ""}`}
          onClose={handleCancel}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4">
        {isLoading ? (
          <div className="flex flex-col gap-3 pt-1">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 py-3">
                <div className="w-8 h-8 rounded-full bg-surface-raised animate-pulse" />
                <div className="flex-1 h-3 rounded bg-surface-raised animate-pulse" />
                <div className="w-16 h-5 rounded bg-surface-raised animate-pulse" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          <EmptyState message="No users found" />
        ) : (
          users.map((user) => (
            <UserItem
              key={user.id}
              user={user}
              draftRole={draft[user.id] ?? user.role}
              isCurrentUser={currentUser?.id === user.id}
              onRoleChange={handleRoleChange}
              isPending={isChangingRole}
            />
          ))
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 flex gap-2 px-4 py-3 border-t border-border/60">
        <button
          onClick={handleCancel}
          className="flex-1 cursor-pointer rounded-lg border border-border/60 bg-transparent px-3 py-1.5 text-xs font-medium text-muted hover:bg-surface-raised hover:text-foreground transition-colors duration-150"
        >
          Cancel
        </button>
        <button
          onClick={handleAccept}
          disabled={isChangingRole}
          className="flex-1 cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        >
          <span className={`absolute inset-0 transition-opacity duration-150 ${hasDraft ? "bg-blue-600 group-hover:bg-blue-500" : "bg-zinc-600 group-hover:bg-zinc-500"}`} />
          <span className="relative z-10">
            {isChangingRole ? "Saving…" : hasDraft ? "Accept" : "Accept"}
          </span>
        </button>
      </div>
    </div>
  );
}

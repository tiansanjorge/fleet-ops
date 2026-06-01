"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { useUsers } from "../hooks/useUsers";
import { UserItem } from "./UserItem";

interface UserListProps {
  onClose: () => void;
}

export function UserList({ onClose }: UserListProps) {
  const { users, isLoading, changeRole, isChangingRole } = useUsers();
  const currentUser = useAuthStore((state) => state.currentUser);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card border border-border max-h-[80vh]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <PanelHeader
          title="Manage users"
          subtitle={`${users.length} member${users.length !== 1 ? "s" : ""}`}
          onClose={onClose}
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4">
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
              isCurrentUser={currentUser?.id === user.id}
              onRoleChange={(id, role) => changeRole({ id, role })}
              isPending={isChangingRole}
            />
          ))
        )}
      </div>
    </div>
  );
}

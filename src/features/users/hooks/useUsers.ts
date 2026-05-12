import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "../store/userStore";
import type { User, UserRole } from "../types";

async function fetchUsers(): Promise<User[]> {
  const res = await fetch("/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  return res.json();
}

async function patchUserRole(id: string, role: UserRole): Promise<User> {
  const res = await fetch(`/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ role }),
  });
  if (!res.ok) throw new Error("Failed to update role");
  return res.json();
}

export function useUsers() {
  const setUsers = useUserStore((state) => state.setUsers);
  const updateUserRole = useUserStore((state) => state.updateUserRole);
  const users = useUserStore((state) => state.users);
  const queryClient = useQueryClient();

  const { isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Sync React Query cache → Zustand store
  useEffect(() => {
    const cached = queryClient.getQueryData<User[]>(["users"]);
    if (cached) setUsers(cached);
  }, [queryClient, setUsers]);

  // Also subscribe to query cache updates
  useEffect(() => {
    return queryClient.getQueryCache().subscribe((event) => {
      if (
        event.type === "updated" &&
        JSON.stringify(event.query.queryKey) === JSON.stringify(["users"])
      ) {
        const data = event.query.state.data as User[] | undefined;
        if (data) setUsers(data);
      }
    });
  }, [queryClient, setUsers]);

  const { mutate: changeRole, isPending: isChangingRole } = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      patchUserRole(id, role),
    onMutate: ({ id, role }) => {
      // Optimistic update
      updateUserRole(id, role);
    },
    onSuccess: (updated) => {
      queryClient.setQueryData<User[]>(["users"], (prev) =>
        prev ? prev.map((u) => (u.id === updated.id ? updated : u)) : [updated],
      );
    },
    onError: (_err, _vars, _ctx) => {
      // Re-fetch to restore correct state on error
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });

  return { users, isLoading, changeRole, isChangingRole };
}

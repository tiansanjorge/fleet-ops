import type { User } from "@/features/users/types";
import { useAuthStore } from "@/core/auth/authStore";

const FAKE_USERS: User[] = [
  { id: "u1", name: "Ana (Admin)", role: "admin" },
  { id: "u2", name: "Carlos (Operator)", role: "operator" },
  { id: "u3", name: "Laura (Viewer)", role: "viewer" },
];

export function RoleSelector() {
  const setUser = useAuthStore((state) => state.setUser);

  return (
    <div>
      <p>Select a role to continue:</p>
      {FAKE_USERS.map((user) => (
        <button
          key={user.id}
          onClick={() => setUser(user)}
          className="cursor-pointer"
        >
          {user.name}
        </button>
      ))}
    </div>
  );
}

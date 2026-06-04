import { useAlertStore } from "../store/alertStore";
import { apiFetch } from "@/core/api/client";

const IS_MOCK = process.env.NEXT_PUBLIC_API_MOCK === "true";

export function useAlertMutations() {
  const markAsReadStore = useAlertStore((state) => state.markAsRead);
  const markAsUnreadStore = useAlertStore((state) => state.markAsUnread);
  const dismissAlertStore = useAlertStore((state) => state.dismissAlert);

  async function markAsRead(id: string): Promise<void> {
    markAsReadStore(id);
    if (!IS_MOCK) {
      await apiFetch(`/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      });
    }
  }

  async function markAsUnread(id: string): Promise<void> {
    markAsUnreadStore(id);
    if (!IS_MOCK) {
      await apiFetch(`/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: false }),
      });
    }
  }

  async function dismissAlert(id: string): Promise<void> {
    dismissAlertStore(id);
    if (!IS_MOCK) {
      await apiFetch(`/alerts/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ read: true, dismissed: true }),
      });
    }
  }

  return { markAsRead, markAsUnread, dismissAlert };
}

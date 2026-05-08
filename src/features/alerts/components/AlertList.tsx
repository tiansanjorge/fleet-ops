"use client";

import { useState } from "react";
import { useAlertStore } from "../store/alertStore";
import type { AlertSeverity } from "../types";
import { usePermission } from "@/core/permissions/usePermission";
import { PanelHeader } from "@/shared/ui/PanelHeader";
import { EmptyState } from "@/shared/ui/EmptyState";
import { AlertItem } from "./AlertItem";

type Tab = "active" | "history";
type SeverityFilter = AlertSeverity | "all";

const SEVERITY_FILTERS: SeverityFilter[] = ["all", "low", "medium", "critical"];

interface AlertListProps {
  onClose: () => void;
}

export default function AlertList({ onClose }: AlertListProps) {
  const alerts = useAlertStore((state) => state.alerts);
  const [tab, setTab] = useState<Tab>("active");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");
  const { can } = usePermission();

  const unread = alerts.filter((a) => !a.read && !a.dismissed).length;
  const activeCount = alerts.filter((a) => !a.dismissed).length;

  const filtered = alerts
    .filter((a) => (tab === "active" ? !a.dismissed : true))
    .filter((a) =>
      severityFilter === "all" ? true : a.severity === severityFilter,
    );

  return (
    <div className="flex flex-col overflow-hidden rounded-lg bg-card/70 backdrop-blur-md max-h-[calc(100vh-6.5rem)]">
      {/* Header */}
      <div className="shrink-0 px-4 pt-4 pb-3">
        <PanelHeader
          title="Alerts"
          subtitle={`${unread} unread · ${activeCount} active · ${alerts.length} total`}
          onClose={onClose}
        />

        {/* Tabs */}
        <div className="mt-3 flex gap-1">
          {(["active", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`relative cursor-pointer overflow-hidden rounded-full px-3 py-1 text-xs font-medium transition-colors duration-150 ${
                tab === t
                  ? "text-orange-700 dark:text-zinc-100"
                  : "text-muted hover:text-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              {tab === t && (
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-blue-500/20 dark:from-orange-500/30 dark:to-blue-500/30" />
              )}
              <span className="relative z-10">
                {t === "active" ? "Active" : "History"}
              </span>
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="mt-2 flex flex-wrap gap-1">
          {SEVERITY_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setSeverityFilter(s)}
              className={`relative cursor-pointer overflow-hidden rounded-full px-2 py-0.5 text-xs capitalize transition-colors duration-150 ${
                severityFilter === s
                  ? "text-orange-700 dark:text-zinc-100"
                  : "text-muted hover:text-zinc-800 dark:hover:text-zinc-50"
              }`}
            >
              {severityFilter === s && (
                <span className="absolute inset-0 bg-gradient-to-r from-orange-500/15 to-blue-500/15 dark:from-orange-500/25 dark:to-blue-500/25" />
              )}
              <span className="relative z-10">{s}</span>
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="relative flex-1 min-h-0">
        {/* Fade mask bottom */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 z-10 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent rounded-b-lg" />
        <div className="h-full overflow-y-auto space-y-2 px-3 pt-3 pb-6 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-600">
          {filtered.length === 0 ? (
            <EmptyState
              message={
                tab === "active" ? "No active alerts" : "No alerts in history"
              }
            />
          ) : (
            filtered.map((alert) => (
              <AlertItem
                key={alert.id}
                alert={alert}
                showDismiss={tab === "active" && can("dismiss:alert")}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useAlertStore } from "../store/alertStore";
import type { AlertSeverity } from "@fleetops/types";
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

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showTopGrad, setShowTopGrad] = useState(false);
  const [showBottomGrad, setShowBottomGrad] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setShowTopGrad(el.scrollTop > 0);
    setShowBottomGrad(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    checkScroll();
  }, [filtered.length, tab, severityFilter, checkScroll]);

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
        <div className="flex h-full flex-col px-3 pt-3 pb-6">
          {filtered.length === 0 ? (
            <EmptyState
              message={
                tab === "active" ? "No active alerts" : "No alerts in history"
              }
            />
          ) : (
            <div className="relative flex-1 min-h-0">
              {showTopGrad && (
                <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-6 bg-gradient-to-b from-zinc-100/70 to-zinc-100/0 dark:from-zinc-700/50 dark:to-zinc-700/0" />
              )}
              {showBottomGrad && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-6 bg-gradient-to-t from-zinc-100/70 to-zinc-100/0 dark:from-zinc-700/50 dark:to-zinc-700/0" />
              )}
              <div
                ref={scrollRef}
                onScroll={checkScroll}
                className="h-full overflow-y-auto space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-400 dark:[&::-webkit-scrollbar-thumb]:bg-zinc-500 [&::-webkit-scrollbar-thumb:hover]:bg-zinc-500 dark:[&::-webkit-scrollbar-thumb:hover]:bg-zinc-400"
              >
                {filtered.map((alert) => (
                  <AlertItem
                    key={alert.id}
                    alert={alert}
                    showDismiss={tab === "active" && can("dismiss:alert")}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

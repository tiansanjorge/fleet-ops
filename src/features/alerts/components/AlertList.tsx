"use client";

import { useState } from "react";
import { useAlerts } from "../hooks/useAlerts";
import { useAlertStore } from "../store/alertStore";
import { useVehicleStore } from "@/features/vehicles/store/vehicleStore";
import { Alert, AlertSeverity } from "../types";

const SEVERITY_ROW: Record<AlertSeverity, string> = {
  low: "border-l-4 border-yellow-400 bg-yellow-50",
  medium: "border-l-4 border-orange-400 bg-orange-50",
  critical: "border-l-4 border-red-500 bg-red-50",
};

const SEVERITY_BADGE: Record<AlertSeverity, string> = {
  low: "bg-yellow-100 text-yellow-700",
  medium: "bg-orange-100 text-orange-700",
  critical: "bg-red-100 text-red-700",
};

type Tab = "active" | "history";
type SeverityFilter = AlertSeverity | "all";

function AlertItem({
  alert,
  showDismiss,
}: {
  alert: Alert;
  showDismiss: boolean;
}) {
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const dismissAlert = useAlertStore((state) => state.dismissAlert);
  const selectVehicle = useVehicleStore((state) => state.selectVehicle);

  const dimmed = alert.read || alert.dismissed;

  return (
    <div
      className={`p-3 rounded ${SEVERITY_ROW[alert.severity]} ${dimmed ? "opacity-50" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide ${SEVERITY_BADGE[alert.severity]}`}
        >
          {alert.severity}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(alert.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <p className="text-sm text-gray-700 mt-1 leading-snug">{alert.message}</p>

      <button
        onClick={() => selectVehicle(alert.vehicleId)}
        className="text-xs text-blue-500 hover:underline mt-0.5 cursor-pointer block"
      >
        Vehicle: {alert.vehicleId}
      </button>

      {!alert.dismissed && (
        <div className="flex gap-3 mt-1">
          {!alert.read && (
            <button
              onClick={() => markAsRead(alert.id)}
              className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              Mark as read
            </button>
          )}
          {showDismiss && (
            <button
              onClick={() => dismissAlert(alert.id)}
              className="text-xs text-red-400 hover:text-red-600 cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}

interface AlertListProps {
  onClose: () => void;
}

export default function AlertList({ onClose }: AlertListProps) {
  const { alerts } = useAlerts();
  const [tab, setTab] = useState<Tab>("active");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  const unread = alerts.filter((a) => !a.read && !a.dismissed).length;
  const activeCount = alerts.filter((a) => !a.dismissed).length;

  const filtered = alerts
    .filter((a) => (tab === "active" ? !a.dismissed : true))
    .filter((a) =>
      severityFilter === "all" ? true : a.severity === severityFilter,
    );

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-2">
              Alerts
              {unread > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {unread}
                </span>
              )}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {unread} unread · {activeCount} active · {alerts.length} total
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none cursor-pointer"
            aria-label="Close panel"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mt-3">
          {(["active", "history"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`text-xs px-3 py-1 rounded-full font-medium cursor-pointer transition-colors ${
                tab === t
                  ? "bg-gray-800 text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
              }`}
            >
              {t === "active" ? "Active" : "History"}
            </button>
          ))}
        </div>

        {/* Severity filter */}
        <div className="flex gap-1 mt-2 flex-wrap">
          {(["all", "low", "medium", "critical"] as SeverityFilter[]).map(
            (s) => (
              <button
                key={s}
                onClick={() => setSeverityFilter(s)}
                className={`text-xs px-2 py-0.5 rounded-full cursor-pointer transition-colors capitalize ${
                  severityFilter === s
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {s}
              </button>
            ),
          )}
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center mt-10">
            {tab === "active" ? "No active alerts" : "No alerts in history"}
          </p>
        ) : (
          filtered.map((alert) => (
            <AlertItem
              key={alert.id}
              alert={alert}
              showDismiss={tab === "active"}
            />
          ))
        )}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import StatCards from "@/components/dashboard/StatCards";
import ReservationCalendar from "@/components/dashboard/ReservationCalendar";
import CleaningQueue from "@/components/dashboard/CleaningQueue";
import RevenueChart from "@/components/dashboard/RevenueChart";
import AiAssistant from "@/components/dashboard/AiAssistant";
import RecentActivity from "@/components/dashboard/RecentActivity";
import NewReservationModal from "@/components/dashboard/NewReservationModal";
import { IconPlus, IconDownload, IconShield } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";

export default function DashboardPage() {
  const { currentUser, currentRole, hasPermission } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [timeframe, setTimeframe] = useState("MTD");
  const [autoConcierge, setAutoConcierge] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Failed to load dashboard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const todayStr = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const handleExport = () => {
    if (!dashboardData) return;
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(dashboardData, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute(
      "download",
      `str_enterprise_metrics_${new Date().toISOString().split("T")[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const hasNoData =
    dashboardData &&
    dashboardData.recentReservations?.length === 0 &&
    dashboardData.propertyCount === 0;

  return (
    <>
      {/* Executive Command Header */}
      <div className="page-header">
        <div className="page-header-left">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
            <h1 className="page-title">Operations Command Center</h1>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--maroon-50)",
                color: "var(--color-primary)",
                border: "1px solid var(--maroon-100)",
              }}
            >
              <IconShield size={12} />
              Enterprise v2.4
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                backgroundColor: "var(--bg-surface)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
                boxShadow: "var(--shadow-xs)",
              }}
              title={`Simulated Persona: ${currentUser.title} (${currentUser.department})`}
            >
              Role: <strong style={{ color: "var(--color-primary)" }}>{currentUser.role}</strong> &middot; {currentUser.name}
            </span>
          </div>
          <p className="page-subtitle">
            {todayStr} &mdash; Multi-Unit Real-Time Performance &amp; Turnover Logistics
          </p>
        </div>

        <div className="page-header-actions">
          {/* Executive Segmented Control / Timeframe Toggle */}
          <div className="segmented-control" role="group" aria-label="Timeframe selection">
            <button
              type="button"
              className={`segmented-item ${timeframe === "TODAY" ? "active" : ""}`}
              onClick={() => setTimeframe("TODAY")}
            >
              Today
            </button>
            <button
              type="button"
              className={`segmented-item ${timeframe === "MTD" ? "active" : ""}`}
              onClick={() => setTimeframe("MTD")}
            >
              MTD
            </button>
            <button
              type="button"
              className={`segmented-item ${timeframe === "QTD" ? "active" : ""}`}
              onClick={() => setTimeframe("QTD")}
            >
              QTD
            </button>
            <button
              type="button"
              className={`segmented-item ${timeframe === "YTD" ? "active" : ""}`}
              onClick={() => setTimeframe("YTD")}
            >
              YTD
            </button>
          </div>

          {/* Action Buttons */}
          {hasPermission(PERMISSIONS.EXPORT_AUDIT) && (
            <button
              className="btn btn-secondary btn-sm"
              onClick={handleExport}
              title="Export analytical dataset in JSON format"
            >
              <IconDownload size={14} />
              Export Audit
            </button>
          )}
          {hasPermission(PERMISSIONS.MANAGE_RESERVATIONS) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <IconPlus size={14} />
              New Reservation
            </button>
          )}
        </div>
      </div>

      {/* Corporate Controls Strip */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 16px",
          backgroundColor: "var(--bg-surface)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-md)",
          marginBottom: "var(--space-5)",
          flexWrap: "wrap",
          gap: "var(--space-3)",
          boxShadow: "var(--shadow-xs)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px", fontSize: "var(--font-size-xs)" }}>
          <span style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>SYSTEM CONTROLS:</span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <label className="toggle-switch" style={{ opacity: hasPermission(PERMISSIONS.MANAGE_AI_CONCIERGE) ? 1 : 0.5 }}>
              <input
                type="checkbox"
                checked={autoConcierge}
                disabled={!hasPermission(PERMISSIONS.MANAGE_AI_CONCIERGE)}
                onChange={(e) => setAutoConcierge(e.target.checked)}
              />
              <span className="toggle-slider" />
            </label>
            <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
              AI Auto-Concierge Dispatch:{" "}
              <strong style={{ color: autoConcierge ? "var(--accent-green)" : "var(--text-muted)" }}>
                {autoConcierge ? "Enabled" : "Paused"}
              </strong>
              {!hasPermission(PERMISSIONS.MANAGE_AI_CONCIERGE) && (
                <span style={{ marginLeft: 6, fontSize: "10px", color: "var(--accent-amber)" }}>
                  (Restricted)
                </span>
              )}
            </span>
          </div>
        </div>

        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontWeight: 500 }}>
          Database Sync: <strong style={{ color: "var(--accent-green)" }}>Active (0ms latency)</strong>
        </div>
      </div>

      {/* Onboarding Readiness Strip for Empty Workspace */}
      {hasNoData && !loading && (
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-primary)",
            borderRadius: "var(--radius-lg)",
            padding: "var(--space-5) var(--space-6)",
            marginBottom: "var(--space-5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "var(--space-4)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <div>
            <h3
              style={{
                fontSize: "var(--font-size-base)",
                fontWeight: 700,
                color: "var(--color-primary)",
                marginBottom: 3,
                letterSpacing: "-0.015em",
              }}
            >
              Enterprise Deployment Workspace Ready
            </h3>
            <p
              style={{
                fontSize: "var(--font-size-xs)",
                color: "var(--text-secondary)",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              The system is primed for your live property portfolio. No demo or synthetic records are pre-populated. Register your rental units or record your first booking to activate live telemetry.
            </p>
          </div>
          {hasPermission(PERMISSIONS.MANAGE_RESERVATIONS) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <IconPlus size={14} />
              Register Initial Booking
            </button>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <StatCards data={dashboardData} loading={loading} />

      {/* Content Grid */}
      <div className="content-grid">
        <ReservationCalendar data={dashboardData} />
        <CleaningQueue data={dashboardData} loading={loading} />
        <RevenueChart data={dashboardData} loading={loading} />
        <AiAssistant data={dashboardData} onMessageSent={fetchDashboard} />
      </div>

      {/* Booking Feed Audit */}
      <div style={{ marginTop: "var(--space-5)" }}>
        <RecentActivity data={dashboardData} loading={loading} />
      </div>

      {/* Modal Dialog */}
      <NewReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReservationCreated={fetchDashboard}
      />
    </>
  );
}

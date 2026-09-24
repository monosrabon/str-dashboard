"use client";

import { useState, useEffect } from "react";
import { IconCleaning, IconCheck } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";
import AccessDenied from "@/components/AccessDenied";

const statusConfig = {
  PENDING: { label: "Pending", badge: "badge-amber" },
  ASSIGNED: { label: "Assigned", badge: "badge-blue" },
  IN_PROGRESS: { label: "In Progress", badge: "badge-blue" },
  COMPLETED: { label: "Completed", badge: "badge-green" },
};

export default function CleaningPage() {
  const { hasPermission } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/cleaning");
      const data = await res.json();
      setTasks(data.tasks || []);
    } catch (err) {
      console.error("Failed to load cleaning tasks:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch("/api/cleaning", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (!hasPermission(PERMISSIONS.VIEW_CLEANING)) {
    return (
      <AccessDenied
        requiredPermission={PERMISSIONS.VIEW_CLEANING}
        moduleName="Housekeeping & Turnover Logistics"
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Housekeeping Logistics</h1>
          <p className="page-subtitle">Turnover task scheduling, room readiness validation, and cleaning staff dispatch.</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">
              <IconCleaning size={16} />
            </div>
            Active Turnovers ({tasks.length})
          </div>
        </div>
        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "var(--space-6)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: 50, marginBottom: 12 }} />
              ))}
            </div>
          ) : tasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--space-8)" }}>
              <div className="empty-state-icon">
                <IconCheck size={20} />
              </div>
              <div className="empty-state-title">Turnovers Complete</div>
              <div className="empty-state-text">
                All property units are sanitized and staged. Turnovers generate automatically upon guest departures.
              </div>
            </div>
          ) : (
            tasks.map((task) => {
              const status = statusConfig[task.status] || statusConfig.PENDING;

              return (
                <div
                  key={task.id}
                  className="task-item"
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: "var(--space-3)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 240 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--maroon-50)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--maroon-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "12px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {task.assigneeInitials || "ST"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                        {task.unitName}
                      </div>
                      <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--text-secondary)" }}>
                        {task.propertyName} · Assigned: {task.assignee || "Staff"}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>Target Due Time</div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                      {formatDate(task.dueBy)}
                    </div>
                  </div>

                  <div>
                    <span className={`badge ${status.badge}`}>
                      <span className="badge-dot" />
                      {status.label}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {task.status !== "IN_PROGRESS" && task.status !== "COMPLETED" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        disabled={updatingId === task.id}
                        onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                      >
                        Start Turnover
                      </button>
                    )}
                    {task.status !== "COMPLETED" && (
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={updatingId === task.id}
                        onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                      >
                        <IconCheck size={13} />
                        Validate Ready
                      </button>
                    )}
                    {task.status === "COMPLETED" && (
                      <span style={{ fontSize: "12px", color: "var(--accent-green)", fontWeight: 600 }}>
                        &check; Ready for Check-in
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

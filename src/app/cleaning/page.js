"use client";

import { useState, useEffect } from "react";
import { IconCleaning, IconCheck, IconPlus } from "@/components/icons";
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
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    unitId: "",
    priority: "HIGH",
    assignee: "Staff Cleaner",
    notes: "Manual turnover dispatch",
  });

  async function fetchTasks() {
    try {
      setLoading(true);
      const res = await fetch("/api/cleaning");
      const data = await res.json();
      setTasks(data.tasks || []);

      const pRes = await fetch("/api/properties");
      const pData = await pRes.json();
      setProperties(pData.properties || []);
      const allUnits = (pData.properties || []).flatMap((p) => p.units || []);
      if (allUnits.length > 0) {
        setForm((prev) => ({ ...prev, unitId: allUnits[0].id }));
      }
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

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!form.unitId) return;

    try {
      await fetch("/api/cleaning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setIsModalOpen(false);
      setForm({
        unitId: properties[0]?.units[0]?.id || "",
        priority: "HIGH",
        assignee: "Staff Cleaner",
        notes: "Manual turnover dispatch",
      });
      fetchTasks();
    } catch (err) {
      console.error("Failed to dispatch turnover:", err);
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

  const allUnits = properties.flatMap((p) =>
    (p.units || []).map((u) => ({ ...u, propertyName: p.name }))
  );

  const filterTabs = [
    { id: "ALL", label: "All Tasks" },
    { id: "ACTIVE", label: "Active Turnovers" },
    { id: "PENDING", label: "Pending" },
    { id: "IN_PROGRESS", label: "In Progress" },
    { id: "COMPLETED", label: "Completed" },
  ];

  const filteredTasks = tasks.filter((t) => {
    if (filter === "ALL") return true;
    if (filter === "ACTIVE") return t.status !== "COMPLETED";
    return t.status === filter;
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Housekeeping Logistics</h1>
          <p className="page-subtitle">Turnover task scheduling, room readiness validation, and cleaning staff dispatch.</p>
        </div>
        <div className="page-header-actions">
          {hasPermission(PERMISSIONS.MANAGE_CLEANING) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <IconPlus size={14} />
              Dispatch Manual Turnover
            </button>
          )}
        </div>
      </div>

      {/* Manual Dispatch Drawer */}
      {isModalOpen && (
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconCleaning size={16} />
              </div>
              Dispatch Ad-hoc Housekeeping Turnover
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateTask} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "14px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Target Unit *
                </label>
                <select
                  className="input"
                  value={form.unitId}
                  onChange={(e) => setForm({ ...form, unitId: e.target.value })}
                  required
                >
                  {allUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.propertyName} &mdash; {u.unitName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Turnover Urgency
                </label>
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="HIGH">High (Immediate Turnover)</option>
                  <option value="NORMAL">Normal</option>
                  <option value="LOW">Low (Routine Refresh)</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Assignee
                </label>
                <input
                  className="input"
                  value={form.assignee}
                  onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                  placeholder="e.g. Maria Santos"
                />
              </div>
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Special Staging Instructions
              </label>
              <input
                className="input"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="e.g. Full linen swap, replenish Nespresso pods, sanitize bathroom"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-sm">
              <IconPlus size={14} />
              Queue Turnover Task
            </button>
          </form>
        </div>
      )}

      {/* Segmented Control Filter */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div className="segmented-control">
          {filterTabs.map((tab) => {
            const count =
              tab.id === "ALL"
                ? tasks.length
                : tab.id === "ACTIVE"
                ? tasks.filter((t) => t.status !== "COMPLETED").length
                : tasks.filter((t) => t.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`segmented-item ${filter === tab.id ? "active" : ""}`}
              >
                {tab.label}
                <span className="segmented-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">
              <IconCleaning size={16} />
            </div>
            Turnover Work Queue ({filteredTasks.length})
          </div>
        </div>
        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "var(--space-6)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: 50, marginBottom: 12 }} />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--space-8)" }}>
              <div className="empty-state-icon">
                <IconCheck size={20} />
              </div>
              <div className="empty-state-title">Turnovers Complete</div>
              <div className="empty-state-text">
                All property units are sanitized and staged. Turnovers generate automatically upon guest departures from the Reservations section.
              </div>
            </div>
          ) : (
            filteredTasks.map((task) => {
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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 260 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: task.status === "COMPLETED" ? "var(--accent-green-bg)" : "var(--maroon-50)",
                        color: task.status === "COMPLETED" ? "var(--accent-green)" : "var(--color-primary)",
                        border: task.status === "COMPLETED" ? "1px solid var(--accent-green-border)" : "1px solid var(--maroon-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {task.status === "COMPLETED" ? "✓" : task.assigneeInitials || "SC"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                        {task.unitName}
                        {task.priority === "HIGH" && (
                          <span className="badge badge-red" style={{ marginLeft: 8, fontSize: "10px" }}>
                            Priority Turnover
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--text-secondary)" }}>
                        {task.propertyName} &middot; Assigned: <strong>{task.assignee || "Staff"}</strong>
                      </div>
                      {task.guestName && (
                        <div style={{ fontSize: "11px", color: "var(--color-primary)", fontWeight: 500, marginTop: 2 }}>
                          Pipeline: Guest <strong>{task.guestName}</strong>
                        </div>
                      )}
                      {task.notes && (
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: 2, fontStyle: "italic" }}>
                          &ldquo;{task.notes}&rdquo;
                        </div>
                      )}
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

                  {/* Operational Progression Buttons */}
                  {hasPermission(PERMISSIONS.MANAGE_CLEANING) && (
                    <div style={{ display: "flex", gap: "8px" }}>
                      {task.status === "PENDING" && (
                        <button
                          className="btn btn-secondary btn-sm"
                          disabled={updatingId === task.id}
                          onClick={() => handleUpdateStatus(task.id, "IN_PROGRESS")}
                        >
                          Start Turnover
                        </button>
                      )}
                      {task.status === "IN_PROGRESS" && (
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={updatingId === task.id}
                          onClick={() => handleUpdateStatus(task.id, "COMPLETED")}
                        >
                          <IconCheck size={13} />
                          Mark Sanitized &amp; Ready
                        </button>
                      )}
                      {task.status === "COMPLETED" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ fontSize: "12px", color: "var(--text-tertiary)" }}
                          disabled={updatingId === task.id}
                          onClick={() => handleUpdateStatus(task.id, "PENDING")}
                          title="Re-open this turnover task if unit needs re-inspection"
                        >
                          Re-open
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

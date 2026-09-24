"use client";

import { IconCleaning, IconCheck } from "@/components/icons";

const statusConfig = {
  PENDING: { label: "Pending", badge: "badge-amber" },
  ASSIGNED: { label: "Assigned", badge: "badge-blue" },
  IN_PROGRESS: { label: "In Progress", badge: "badge-blue" },
  COMPLETED: { label: "Completed", badge: "badge-green" },
  INSPECTED: { label: "Inspected", badge: "badge-green" },
};

function formatDueDate(isoDate) {
  if (!isoDate) return "";
  const due = new Date(isoDate);
  const now = new Date();
  const diff = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diff < 0) return `${Math.abs(diff)}d overdue`;
  if (diff === 0) return "Target: Today";
  if (diff === 1) return "Target: Tomorrow";
  return `Target: ${diff} days`;
}

export default function CleaningQueue({ data, loading }) {
  const tasks = data?.cleaningTasks || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">
            <IconCleaning size={16} />
          </div>
          Housekeeping Queue
        </div>
        <div className="card-actions">
          <span className="badge badge-maroon">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"}
          </span>
        </div>
      </div>
      <div className="card-body-flush">
        {loading ? (
          <div style={{ padding: "var(--space-5)" }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "14px",
                }}
              >
                <div
                  className="skeleton"
                  style={{ width: 32, height: 32, borderRadius: "6px" }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{ width: "60%", height: 13, marginBottom: 6 }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "40%", height: 11 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconCheck size={20} />
            </div>
            <div className="empty-state-title">Turnovers Up to Date</div>
            <div className="empty-state-text">
              Zero pending turnover tickets. Cleaning jobs are generated automatically as reservations conclude.
            </div>
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="task-item">
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--maroon-50)",
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
              <div className="task-item-content">
                <div className="task-item-title">{task.unit}</div>
                <div className="task-item-subtitle">
                  {task.property} · {task.assignee} · {formatDueDate(task.dueBy)}
                </div>
              </div>
              <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                {task.priority === "URGENT" && (
                  <span className="badge badge-red">Urgent</span>
                )}
                <span className={`badge ${statusConfig[task.status]?.badge || "badge-gray"}`}>
                  <span className="badge-dot" />
                  {statusConfig[task.status]?.label || task.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

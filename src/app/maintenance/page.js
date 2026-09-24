"use client";

import { useState, useEffect } from "react";
import { IconMaintenance, IconPlus, IconCheck } from "@/components/icons";

const priorityConfig = {
  LOW: { label: "Low", badge: "badge-cyan" },
  MEDIUM: { label: "Medium", badge: "badge-amber" },
  HIGH: { label: "High", badge: "badge-amber" },
  CRITICAL: { label: "Critical", badge: "badge-red" },
};

const statusConfig = {
  REPORTED: { label: "Reported", badge: "badge-blue" },
  IN_PROGRESS: { label: "In Progress", badge: "badge-amber" },
  RESOLVED: { label: "Resolved", badge: "badge-green" },
};

export default function MaintenancePage() {
  const [issues, setIssues] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [form, setForm] = useState({
    unitId: "",
    title: "",
    description: "",
    priority: "MEDIUM",
    category: "General",
    cost: "",
  });

  async function fetchIssues() {
    try {
      setLoading(true);
      const res = await fetch("/api/maintenance");
      const data = await res.json();
      setIssues(data.issues || []);
    } catch (err) {
      console.error("Failed to load maintenance issues:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchProperties() {
    try {
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data.properties || []);
      const allUnits = (data.properties || []).flatMap((p) => p.units || []);
      if (allUnits.length > 0) {
        setForm((prev) => ({ ...prev, unitId: allUnits[0].id }));
      }
    } catch (err) {
      console.error("Failed to load units:", err);
    }
  }

  useEffect(() => {
    fetchIssues();
    fetchProperties();
  }, []);

  const handleCreateIssue = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.unitId) return;

    try {
      await fetch("/api/maintenance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setIsModalOpen(false);
      setForm({
        unitId: form.unitId,
        title: "",
        description: "",
        priority: "MEDIUM",
        category: "General",
        cost: "",
      });
      fetchIssues();
    } catch (err) {
      console.error("Failed to log maintenance issue:", err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await fetch("/api/maintenance", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "RESOLVED" }),
      });
      fetchIssues();
    } catch (err) {
      console.error("Failed to resolve issue:", err);
    }
  };

  const allUnits = properties.flatMap((p) =>
    (p.units || []).map((u) => ({ ...u, propertyName: p.name }))
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Facilities &amp; Maintenance</h1>
          <p className="page-subtitle">Asset servicing tickets, repair logs, contractor allocations, and remediation status.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setIsModalOpen(true)}>
            <IconPlus size={14} />
            Log Work Order
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconMaintenance size={16} />
              </div>
              Issue Work Order Ticket
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateIssue} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
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
                  {allUnits.length === 0 && <option value="">No units configured</option>}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Urgency / Priority
                </label>
                <select
                  className="input"
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                >
                  <option value="LOW">Low (Routine servicing)</option>
                  <option value="MEDIUM">Medium (Non-critical defect)</option>
                  <option value="HIGH">High (Guest impacting)</option>
                  <option value="CRITICAL">Critical (Immediate shut-off)</option>
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "12px" }}>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                Issue Synopsis *
              </label>
              <input
                className="input"
                placeholder="e.g. Primary HVAC system refrigerant recharge required"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Trade Category
                </label>
                <input
                  className="input"
                  placeholder="HVAC / Plumbing / Electrical"
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Cost Estimate ($)
                </label>
                <input
                  type="number"
                  className="input"
                  placeholder="120"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Issue Work Order
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "var(--space-6)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: 50, marginBottom: 12 }} />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--space-8)" }}>
              <div className="empty-state-icon">
                <IconCheck size={20} />
              </div>
              <div className="empty-state-title">No Open Maintenance Work Orders</div>
              <div className="empty-state-text">
                All property systems and appliances are operating normally. Click &quot;Log Work Order&quot; to file a repair ticket.
              </div>
            </div>
          ) : (
            issues.map((issue) => {
              const priority = priorityConfig[issue.priority] || priorityConfig.MEDIUM;
              const status = statusConfig[issue.status] || statusConfig.REPORTED;

              return (
                <div
                  key={issue.id}
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
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                      {issue.title}
                    </div>
                    <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--text-secondary)" }}>
                      {issue.propertyName} &middot; {issue.unitName} &middot; Trade: {issue.category}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`badge ${priority.badge}`}>{priority.label}</span>
                    <span className={`badge ${status.badge}`}>
                      <span className="badge-dot" />
                      {status.label}
                    </span>
                  </div>

                  {issue.status !== "RESOLVED" && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleResolve(issue.id)}
                    >
                      <IconCheck size={13} />
                      Sign Off / Resolved
                    </button>
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

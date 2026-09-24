"use client";

import { useState, useEffect } from "react";
import { IconUsers, IconSearch } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";
import AccessDenied from "@/components/AccessDenied";

export default function GuestsPage() {
  const { hasPermission } = useAuth();
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchGuests() {
    try {
      setLoading(true);
      const res = await fetch("/api/guests");
      const data = await res.json();
      setGuests(data.guests || []);
    } catch (err) {
      console.error("Failed to load guests:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchGuests();
  }, []);

  const filtered = guests.filter((g) => {
    const q = search.toLowerCase();
    return (
      g.name.toLowerCase().includes(q) ||
      (g.email && g.email.toLowerCase().includes(q)) ||
      (g.phone && g.phone.includes(q))
    );
  });

  if (!hasPermission(PERMISSIONS.VIEW_GUESTS)) {
    return (
      <AccessDenied
        requiredPermission={PERMISSIONS.VIEW_GUESTS}
        moduleName="Guest Directory & CRM Records"
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Guest Directory &amp; CRM</h1>
          <p className="page-subtitle">Profiles, historical booking volume, communication contact cards, and preferences.</p>
        </div>
        <div className="page-header-actions">
          <div style={{ position: "relative" }}>
            <input
              className="input"
              style={{ width: "260px", paddingLeft: "34px" }}
              placeholder="Search guests by name or contact..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span
              style={{
                position: "absolute",
                left: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-muted)",
                pointerEvents: "none",
                display: "flex",
              }}
            >
              <IconSearch size={15} />
            </span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body-flush">
          {loading ? (
            <div style={{ padding: "var(--space-6)" }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton" style={{ width: "100%", height: 50, marginBottom: 12 }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: "var(--space-8)" }}>
              <div className="empty-state-icon">
                <IconUsers size={20} />
              </div>
              <div className="empty-state-title">
                {search ? "No Matching Guest Profiles" : "No Guest Records Registered"}
              </div>
              <div className="empty-state-text">
                Guest CRM records are auto-indexed as reservations are processed into the system.
              </div>
            </div>
          ) : (
            filtered.map((guest) => (
              <div
                key={guest.id}
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--maroon-50)",
                      color: "var(--color-primary)",
                      border: "1px solid var(--maroon-100)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "14px",
                    }}
                  >
                    {guest.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                      {guest.name}
                    </div>
                    <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--text-secondary)" }}>
                      {guest.email || "No email documented"} &middot; {guest.phone || "No phone documented"}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 700, color: "var(--color-primary)" }}>
                      {guest.totalStays} {guest.totalStays === 1 ? "Stay" : "Stays"}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)" }}>
                      {guest.reservations?.length || 0} active records
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}

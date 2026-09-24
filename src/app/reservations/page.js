"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import NewReservationModal from "@/components/dashboard/NewReservationModal";
import EditReservationModal from "@/components/dashboard/EditReservationModal";
import { IconPlus, IconCheckIn, IconCheckOut, IconCalendar } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";
import AccessDenied from "@/components/AccessDenied";

const platformConfig = {
  AIRBNB: { label: "Airbnb", badge: "badge-maroon" },
  VRBO: { label: "VRBO", badge: "badge-blue" },
  BOOKING_COM: { label: "Booking.com", badge: "badge-cyan" },
  DIRECT: { label: "Direct Channel", badge: "badge-green" },
};

const statusConfig = {
  CONFIRMED: { label: "Confirmed", badge: "badge-blue" },
  CHECKED_IN: { label: "Checked In", badge: "badge-green" },
  CHECKED_OUT: { label: "Checked Out", badge: "badge-gray" },
  CANCELLED: { label: "Cancelled", badge: "badge-red" },
};

export default function ReservationsPage() {
  const { hasPermission } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [pipelineAlert, setPipelineAlert] = useState(null);

  async function fetchReservations() {
    try {
      setLoading(true);
      const res = await fetch("/api/reservations");
      const data = await res.json();
      setReservations(data.reservations || []);
    } catch (err) {
      console.error("Failed to load reservations:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });

      if (status === "CHECKED_OUT") {
        setPipelineAlert("🚪 Checkout confirmed! Active turnover task has been pipelined to Operations > Housekeeping.");
      } else if (status === "CHECKED_IN") {
        setPipelineAlert("➔ Guest checked in! Unit status updated to Occupied.");
      } else if (status === "CANCELLED") {
        setPipelineAlert("✕ Reservation marked Cancelled. Unit released to Available.");
      } else {
        setPipelineAlert("✓ Reservation status updated to Confirmed.");
      }
      setTimeout(() => setPipelineAlert(null), 5000);

      fetchReservations();
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered =
    filter === "ALL"
      ? reservations
      : reservations.filter((r) => r.status === filter);

  const formatDate = (iso) => {
    if (!iso) return "";
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const statusFilters = [
    { id: "ALL", label: "All Bookings" },
    { id: "CONFIRMED", label: "Confirmed" },
    { id: "CHECKED_IN", label: "Checked In" },
    { id: "CHECKED_OUT", label: "Checked Out" },
    { id: "CANCELLED", label: "Cancelled" },
  ];

  if (!hasPermission(PERMISSIONS.VIEW_RESERVATIONS)) {
    return (
      <AccessDenied
        requiredPermission={PERMISSIONS.VIEW_RESERVATIONS}
        moduleName="Central Reservation Calendar & Folios"
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Reservations &amp; Folios</h1>
          <p className="page-subtitle">Multi-channel reservation registry, guest arrival processing, and lifecycle tracking.</p>
        </div>
        <div className="page-header-actions">
          {hasPermission(PERMISSIONS.MANAGE_RESERVATIONS) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsModalOpen(true)}
            >
              <IconPlus size={14} />
              Register Reservation
            </button>
          )}
        </div>
      </div>

      {/* Pipeline Alert Banner */}
      {pipelineAlert && (
        <div
          style={{
            padding: "10px 16px",
            backgroundColor: "var(--maroon-50)",
            border: "1px solid var(--maroon-200)",
            borderRadius: "var(--radius-md)",
            fontSize: "12px",
            fontWeight: 600,
            color: "var(--color-primary)",
            marginBottom: "var(--space-4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <span>{pipelineAlert}</span>
          <Link
            href="/cleaning"
            style={{
              color: "var(--color-primary)",
              textDecoration: "underline",
              fontSize: "11px",
              fontWeight: 700,
            }}
          >
            View in Housekeeping &rarr;
          </Link>
        </div>
      )}

      {/* Corporate Segmented Control Tabs */}
      <div style={{ marginBottom: "var(--space-5)" }}>
        <div className="segmented-control">
          {statusFilters.map((st) => {
            const count =
              st.id === "ALL"
                ? reservations.length
                : reservations.filter((r) => r.status === st.id).length;

            return (
              <button
                key={st.id}
                onClick={() => setFilter(st.id)}
                className={`segmented-item ${filter === st.id ? "active" : ""}`}
              >
                {st.label}
                <span className="segmented-count">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reservations List */}
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
                <IconCalendar size={20} />
              </div>
              <div className="empty-state-title">No Records Found</div>
              <div className="empty-state-text">
                {filter === "ALL"
                  ? "No reservation records exist in your database. Register an initial booking to begin."
                  : `No reservations currently categorized under "${filter}".`}
              </div>
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: "var(--space-4)" }}
                onClick={() => setIsModalOpen(true)}
              >
                <IconPlus size={14} />
                Register Reservation
              </button>
            </div>
          ) : (
            filtered.map((res) => {
              const platform = platformConfig[res.platform] || platformConfig.DIRECT;
              const status = statusConfig[res.status] || statusConfig.CONFIRMED;

              return (
                <div
                  key={res.id}
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
                  {/* Guest Identity & Unit Info */}
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 240 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: "var(--radius-sm)",
                        backgroundColor: "var(--maroon-50)",
                        color: "var(--color-primary)",
                        border: "1px solid var(--maroon-100)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "13px",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {res.guestName ? res.guestName.charAt(0).toUpperCase() : "G"}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--font-size-base)", color: "var(--text-primary)" }}>
                        {res.guestName}
                      </div>
                      <div style={{ fontSize: "var(--font-size-2xs)", color: "var(--text-secondary)" }}>
                        {res.propertyName} &middot; {res.unitName} &middot; {res.guestCount} guest(s)
                      </div>
                    </div>
                  </div>

                  {/* Stay Window */}
                  <div style={{ minWidth: 170 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                      Stay Window
                    </div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                      {formatDate(res.checkIn)} &rarr; {formatDate(res.checkOut)}
                    </div>
                  </div>

                  {/* Valuation */}
                  <div style={{ minWidth: 90 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                      Valuation
                    </div>
                    <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
                      ${Number(res.totalPrice).toLocaleString()}
                    </div>
                  </div>

                  {/* Housekeeping Pipeline Column */}
                  <div style={{ minWidth: 140 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                      Housekeeping Pipeline
                    </div>
                    {res.cleaningTask ? (
                      <Link
                        href="/cleaning"
                        style={{ textDecoration: "none", display: "inline-block", marginTop: "3px" }}
                        title="Click to view and manage task in Housekeeping"
                      >
                        {res.cleaningTask.status === "COMPLETED" ? (
                          <span className="badge badge-green" style={{ cursor: "pointer" }}>
                            ✓ Sanitized &amp; Ready
                          </span>
                        ) : res.cleaningTask.status === "IN_PROGRESS" ? (
                          <span className="badge badge-blue" style={{ cursor: "pointer" }}>
                            ⚡ In Progress
                          </span>
                        ) : (
                          <span className="badge badge-amber" style={{ cursor: "pointer" }}>
                            🧹 Turnover Queued
                          </span>
                        )}
                      </Link>
                    ) : res.status === "CHECKED_OUT" ? (
                      <Link
                        href="/cleaning"
                        className="badge badge-red"
                        style={{ textDecoration: "none", display: "inline-block", marginTop: "3px", cursor: "pointer" }}
                        title="Checked out unit requires room turnover"
                      >
                        ⚠️ Turnover Required
                      </Link>
                    ) : (
                      <div style={{ fontSize: "11px", color: "var(--text-tertiary)", fontStyle: "italic", marginTop: "3px" }}>
                        Triggers at checkout
                      </div>
                    )}
                  </div>

                  {/* Channel & Status Badge */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <span className={`badge ${platform.badge}`}>{platform.label}</span>
                    <span className={`badge ${status.badge}`}>
                      <span className="badge-dot" />
                      {status.label}
                    </span>
                  </div>

                  {/* Admin Lifecycle Toggle & Edit Controls */}
                  {hasPermission(PERMISSIONS.MANAGE_RESERVATIONS) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Fast Status Selector */}
                      <select
                        className="input"
                        style={{
                          width: "auto",
                          padding: "5px 8px",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          backgroundColor: "var(--bg-surface)",
                        }}
                        value={res.status}
                        disabled={updatingId === res.id}
                        onChange={(e) => handleStatusChange(res.id, e.target.value)}
                        title="Admin Status Override: Instantly change state & trigger housekeeping turnover"
                      >
                        <option value="CONFIRMED">✓ Confirmed</option>
                        <option value="CHECKED_IN">➔ Checked In</option>
                        <option value="CHECKED_OUT">🚪 Checked Out</option>
                        <option value="CANCELLED">✕ Cancelled</option>
                      </select>

                      {/* Edit Details Button */}
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        onClick={() => setEditingReservation(res)}
                        title="Edit customer information, stay window, pricing, and notes"
                      >
                        Edit Folio
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* New Reservation Modal */}
      <NewReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReservationCreated={fetchReservations}
      />

      {/* Edit Reservation & Customer Modal */}
      <EditReservationModal
        isOpen={!!editingReservation}
        onClose={() => setEditingReservation(null)}
        reservation={editingReservation}
        onUpdated={fetchReservations}
      />
    </>
  );
}

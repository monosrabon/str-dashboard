"use client";

import { useState, useEffect } from "react";
import NewReservationModal from "@/components/dashboard/NewReservationModal";
import { IconPlus, IconCheckIn, IconCheckOut, IconCalendar } from "@/components/icons";

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
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);

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

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Reservations &amp; Folios</h1>
          <p className="page-subtitle">Multi-channel reservation registry, guest arrival processing, and lifecycle tracking.</p>
        </div>
        <div className="page-header-actions">
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsModalOpen(true)}
          >
            <IconPlus size={14} />
            Register Reservation
          </button>
        </div>
      </div>

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
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 260 }}>
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
                        {res.propertyName} · {res.unitName} · {res.guestCount} guest(s)
                      </div>
                    </div>
                  </div>

                  <div style={{ minWidth: 190 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                      Stay Window
                    </div>
                    <div style={{ fontSize: "var(--font-size-sm)", fontWeight: 500, color: "var(--text-primary)" }}>
                      {formatDate(res.checkIn)} &rarr; {formatDate(res.checkOut)}
                    </div>
                  </div>

                  <div style={{ minWidth: 100 }}>
                    <div style={{ fontSize: "11px", color: "var(--text-tertiary)", textTransform: "uppercase", fontWeight: 600 }}>
                      Valuation
                    </div>
                    <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
                      ${Number(res.totalPrice).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span className={`badge ${platform.badge}`}>{platform.label}</span>
                    <span className={`badge ${status.badge}`}>
                      <span className="badge-dot" />
                      {status.label}
                    </span>
                  </div>

                  {/* Lifecycle Actions */}
                  <div style={{ display: "flex", gap: "6px" }}>
                    {res.status === "CONFIRMED" && (
                      <button
                        className="btn btn-primary btn-sm"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        disabled={updatingId === res.id}
                        onClick={() => handleStatusChange(res.id, "CHECKED_IN")}
                      >
                        <IconCheckIn size={13} />
                        Process Check-In
                      </button>
                    )}
                    {res.status === "CHECKED_IN" && (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: "5px 10px", fontSize: "12px" }}
                        disabled={updatingId === res.id}
                        onClick={() => handleStatusChange(res.id, "CHECKED_OUT")}
                      >
                        <IconCheckOut size={13} />
                        Execute Checkout
                      </button>
                    )}
                    {res.status !== "CANCELLED" && res.status !== "CHECKED_OUT" && (
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: "5px 8px", fontSize: "12px", color: "var(--accent-red)" }}
                        disabled={updatingId === res.id}
                        onClick={() => handleStatusChange(res.id, "CANCELLED")}
                      >
                        Void
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <NewReservationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onReservationCreated={fetchReservations}
      />
    </>
  );
}

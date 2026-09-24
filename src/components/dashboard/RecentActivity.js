"use client";

import Link from "next/link";
import { IconActivity } from "@/components/icons";

const statusConfig = {
  CONFIRMED: { label: "Confirmed", badge: "badge-blue" },
  CHECKED_IN: { label: "Checked In", badge: "badge-green" },
  CHECKED_OUT: { label: "Checked Out", badge: "badge-gray" },
  CANCELLED: { label: "Cancelled", badge: "badge-red" },
};

const platformConfig = {
  AIRBNB: { label: "Airbnb", badge: "badge-maroon" },
  VRBO: { label: "VRBO", badge: "badge-blue" },
  BOOKING_COM: { label: "Booking.com", badge: "badge-cyan" },
  DIRECT: { label: "Direct Channel", badge: "badge-green" },
};

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function RecentActivity({ data, loading }) {
  const reservations = data?.recentReservations || [];

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">
            <IconActivity size={16} />
          </div>
          Active Booking Feed
        </div>
        <div className="card-actions">
          <Link href="/reservations" className="btn btn-ghost btn-sm">
            View All
          </Link>
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
                  style={{ width: 34, height: 34, borderRadius: "6px" }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    className="skeleton"
                    style={{ width: "65%", height: 13, marginBottom: 6 }}
                  />
                  <div
                    className="skeleton"
                    style={{ width: "40%", height: 11 }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : reservations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconActivity size={20} />
            </div>
            <div className="empty-state-title">No Recent Booking Events</div>
            <div className="empty-state-text">
              Real-time reservations and booking modifications will be recorded in this audit feed.
            </div>
          </div>
        ) : (
          reservations.map((res) => {
            const status = statusConfig[res.status] || statusConfig.CONFIRMED;
            const platform = platformConfig[res.platform] || platformConfig.DIRECT;

            return (
              <div key={res.id} className="task-item">
                <div
                  style={{
                    width: 34,
                    height: 34,
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
                  {res.guestName ? res.guestName.charAt(0).toUpperCase() : "G"}
                </div>
                <div className="task-item-content">
                  <div className="task-item-title">
                    {res.guestName} — {res.unit}
                  </div>
                  <div className="task-item-subtitle">
                    {res.property} · {formatDate(res.checkIn)} → {formatDate(res.checkOut)} · ${Number(res.totalPrice).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "var(--space-2)", alignItems: "center" }}>
                  <span className={`badge ${platform.badge}`}>
                    {platform.label}
                  </span>
                  <span className={`badge ${status.badge}`}>
                    <span className="badge-dot" />
                    {status.label}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

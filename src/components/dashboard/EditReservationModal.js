"use client";

import { useState, useEffect } from "react";
import { IconCheck, IconCheckIn, IconCheckOut, IconShield } from "@/components/icons";

const statusOptions = [
  { id: "CONFIRMED", label: "Confirmed", icon: IconCheck, color: "var(--accent-blue)", bg: "var(--accent-blue-bg)", border: "var(--accent-blue-border)" },
  { id: "CHECKED_IN", label: "Checked In", icon: IconCheckIn, color: "var(--accent-green)", bg: "var(--accent-green-bg)", border: "var(--accent-green-border)" },
  { id: "CHECKED_OUT", label: "Checked Out", icon: IconCheckOut, color: "var(--color-primary)", bg: "var(--maroon-50)", border: "var(--maroon-200)", hint: "Pipelines to Housekeeping" },
  { id: "CANCELLED", label: "Cancelled", icon: null, color: "var(--accent-red)", bg: "var(--accent-red-bg)", border: "var(--accent-red-border)" },
];

export default function EditReservationModal({ isOpen, onClose, reservation, onUpdated }) {
  const [formData, setFormData] = useState({
    status: "CONFIRMED",
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    checkIn: "",
    checkOut: "",
    totalPrice: "",
    platform: "DIRECT",
    guestCount: 1,
    notes: "",
  });

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (reservation) {
      setFormData({
        status: reservation.status || "CONFIRMED",
        guestName: reservation.guestName || "",
        guestEmail: reservation.guestEmail || "",
        guestPhone: reservation.guestPhone || "",
        checkIn: reservation.checkIn ? reservation.checkIn.split("T")[0] : "",
        checkOut: reservation.checkOut ? reservation.checkOut.split("T")[0] : "",
        totalPrice: reservation.totalPrice ?? "",
        platform: reservation.platform || "DIRECT",
        guestCount: reservation.guestCount || 1,
        notes: reservation.notes || "",
      });
      setFeedback(null);
    }
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/reservations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: reservation.id,
          ...formData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update reservation");
      }

      setFeedback({ type: "success", text: "Reservation & housekeeping pipeline updated successfully!" });
      setTimeout(() => {
        if (onUpdated) onUpdated();
        onClose();
      }, 700);
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(17, 24, 39, 0.55)",
        backdropFilter: "blur(3px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        padding: "var(--space-4)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "600px",
          width: "100%",
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        {/* Modal Header */}
        <div className="card-header">
          <div className="card-title" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div className="card-title-icon" style={{ backgroundColor: "var(--maroon-50)", color: "var(--color-primary)" }}>
              <IconShield size={16} />
            </div>
            <div>
              <div>Admin Folio &amp; Customer Management</div>
              <div style={{ fontSize: "11px", fontWeight: 500, color: "var(--text-tertiary)" }}>
                Unit: {reservation.unitName} &middot; Asset: {reservation.propertyName}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: "18px", padding: "2px 8px" }}
          >
            &times;
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit} style={{ overflowY: "auto", padding: "20px 24px" }}>
          {/* Status Toggle Bar */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "8px",
              }}
            >
              Reservation Lifecycle Status (Admin Override)
            </label>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "8px",
              }}
            >
              {statusOptions.map((opt) => {
                const isSelected = formData.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, status: opt.id })}
                    style={{
                      padding: "10px 8px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? `2px solid ${opt.color}` : "1px solid var(--border-primary)",
                      backgroundColor: isSelected ? opt.bg : "var(--bg-surface)",
                      color: isSelected ? opt.color : "var(--text-secondary)",
                      fontWeight: isSelected ? 700 : 500,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "4px",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <span>{opt.label}</span>
                    {opt.id === "CHECKED_OUT" && (
                      <span style={{ fontSize: "9px", opacity: 0.85, fontWeight: 600 }}>
                        Auto-Turnover
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Housekeeping Pipeline Notification Box */}
          {formData.status === "CHECKED_OUT" && (
            <div
              style={{
                padding: "10px 14px",
                backgroundColor: "var(--maroon-50)",
                border: "1px solid var(--maroon-200)",
                borderRadius: "var(--radius-md)",
                fontSize: "12px",
                color: "var(--color-primary)",
                marginBottom: "16px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>🧹</span>
              <div>
                <strong>Housekeeping Turnover Trigger:</strong> Marking this folio as Checked Out will immediately queue an active sanitization &amp; turnover task in the Housekeeping module.
              </div>
            </div>
          )}

          {/* Guest Information */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
              Customer / Guest Name *
            </label>
            <input
              className="input"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              required
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Email Address
              </label>
              <input
                type="email"
                className="input"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Phone Number
              </label>
              <input
                className="input"
                value={formData.guestPhone}
                onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              />
            </div>
          </div>

          {/* Dates & Capacity */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Check-in Date *
              </label>
              <input
                type="date"
                className="input"
                value={formData.checkIn}
                onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Check-out Date *
              </label>
              <input
                type="date"
                className="input"
                value={formData.checkOut}
                onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Guests
              </label>
              <input
                type="number"
                min="1"
                className="input"
                value={formData.guestCount}
                onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
              />
            </div>
          </div>

          {/* Financials & Platform */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Total Valuation ($) *
              </label>
              <input
                type="number"
                min="0"
                step="any"
                className="input"
                value={formData.totalPrice}
                onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                required
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
                Acquisition Channel
              </label>
              <select
                className="input"
                value={formData.platform}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
              >
                <option value="DIRECT">Direct Channel</option>
                <option value="AIRBNB">Airbnb</option>
                <option value="VRBO">VRBO</option>
                <option value="BOOKING_COM">Booking.com</option>
              </select>
            </div>
          </div>

          {/* Guest Notes */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: "5px" }}>
              Customer Notes &amp; Special Directives
            </label>
            <textarea
              className="input"
              rows={2}
              style={{ resize: "none" }}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Sea facing balcony preference, early luggage drop, extra towels..."
            />
          </div>

          {/* Status Feedback */}
          {feedback && (
            <div
              style={{
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                fontSize: "12px",
                fontWeight: 600,
                marginBottom: "16px",
                backgroundColor: feedback.type === "success" ? "var(--accent-green-bg)" : "var(--accent-red-bg)",
                color: feedback.type === "success" ? "var(--accent-green)" : "var(--accent-red)",
                border: `1px solid ${feedback.type === "success" ? "var(--accent-green-border)" : "var(--accent-red-border)"}`,
              }}
            >
              {feedback.text}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving ? "Updating..." : "Commit Folio & Pipeline Updates"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

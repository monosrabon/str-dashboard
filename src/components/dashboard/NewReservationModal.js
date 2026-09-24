"use client";

import { useState, useEffect } from "react";
import { IconCalendar, IconPlus } from "@/components/icons";

export default function NewReservationModal({ isOpen, onClose, onReservationCreated }) {
  const [properties, setProperties] = useState([]);
  const [loadingProps, setLoadingProps] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    propertyId: "",
    unitId: "",
    checkIn: "",
    checkOut: "",
    totalPrice: "",
    platform: "AIRBNB",
    guestCount: 2,
    notes: "",
    newPropertyName: "",
    newUnitName: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      const today = new Date().toISOString().split("T")[0];
      const future = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
      setFormData((prev) => ({
        ...prev,
        checkIn: prev.checkIn || today,
        checkOut: prev.checkOut || future,
      }));
    }
  }, [isOpen]);

  async function fetchProperties() {
    try {
      setLoadingProps(true);
      const res = await fetch("/api/properties");
      const data = await res.json();
      const list = data.properties || [];
      setProperties(list);

      if (list.length > 0) {
        const firstProp = list[0];
        setFormData((prev) => ({
          ...prev,
          propertyId: firstProp.id,
          unitId: firstProp.units?.[0]?.id || "",
        }));
      }
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoadingProps(false);
    }
  }

  const selectedProperty = properties.find((p) => p.id === formData.propertyId);
  const availableUnits = selectedProperty?.units || [];

  const handlePropertyChange = (propId) => {
    const prop = properties.find((p) => p.id === propId);
    setFormData((prev) => ({
      ...prev,
      propertyId: propId,
      unitId: prop?.units?.[0]?.id || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.guestName.trim()) {
      setError("Guest identification name is required.");
      return;
    }
    if (!formData.checkIn || !formData.checkOut) {
      setError("Please specify valid check-in and departure dates.");
      return;
    }

    setSaving(true);
    try {
      let targetUnitId = formData.unitId;

      if (!targetUnitId && properties.length === 0) {
        const propName = formData.newPropertyName.trim() || "Primary Property";
        const unitName = formData.newUnitName.trim() || "Unit 101";

        const propRes = await fetch("/api/properties", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: propName,
            units: [{ unitName, basePrice: Number(formData.totalPrice) || 150 }],
          }),
        });
        const propData = await propRes.json();
        targetUnitId = propData.property?.units?.[0]?.id;

        const refreshRes = await fetch("/api/properties");
        const refreshData = await refreshRes.json();
        setProperties(refreshData.properties || []);
      }

      if (!targetUnitId) {
        setError("Please associate this booking with a valid property unit.");
        setSaving(false);
        return;
      }

      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestName: formData.guestName,
          guestEmail: formData.guestEmail,
          guestPhone: formData.guestPhone,
          unitId: targetUnitId,
          checkIn: formData.checkIn,
          checkOut: formData.checkOut,
          totalPrice: Number(formData.totalPrice) || 0,
          platform: formData.platform,
          guestCount: Number(formData.guestCount) || 1,
          notes: formData.notes,
        }),
      });

      if (!res.ok) {
        const errJson = await res.json();
        throw new Error(errJson.error || "Failed to commit reservation");
      }

      onReservationCreated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const platforms = [
    { id: "AIRBNB", label: "Airbnb" },
    { id: "VRBO", label: "VRBO" },
    { id: "BOOKING_COM", label: "Booking.com" },
    { id: "DIRECT", label: "Direct Channel" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(17, 24, 39, 0.4)",
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
          width: "100%",
          maxWidth: "540px",
          maxHeight: "92vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-lg)",
        }}
      >
        <div className="card-header">
          <div className="card-title">
            <div className="card-title-icon">
              <IconCalendar size={16} />
            </div>
            Register Reservation
          </div>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm"
            style={{ padding: "4px 8px" }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: "20px" }}>
          {error && (
            <div
              style={{
                backgroundColor: "var(--accent-red-bg)",
                border: "1px solid var(--accent-red-border)",
                color: "var(--accent-red)",
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                marginBottom: "16px",
                fontSize: "var(--font-size-xs)",
                fontWeight: 500,
              }}
            >
              {error}
            </div>
          )}

          {/* Booking Channel Segmented Pill Selector */}
          <div style={{ marginBottom: "18px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Booking Channel Source
            </label>
            <div className="segmented-control" style={{ width: "100%", display: "grid", gridTemplateColumns: "repeat(4, 1fr)" }}>
              {platforms.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className={`segmented-item ${formData.platform === p.id ? "active" : ""}`}
                  style={{ justifyContent: "center" }}
                  onClick={() => setFormData({ ...formData, platform: p.id })}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Guest Information */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Guest Identification
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <input
                className="input"
                placeholder="Full Name *"
                value={formData.guestName}
                onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
                required
              />
              <input
                className="input"
                type="email"
                placeholder="Email Address"
                value={formData.guestEmail}
                onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              />
            </div>
            <input
              className="input"
              placeholder="Phone Number (+1 555-0100)"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
            />
          </div>

          {/* Property Unit Allocation */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Property &amp; Unit Assignment
            </label>

            {properties.length === 0 && !loadingProps ? (
              <div
                style={{
                  backgroundColor: "var(--bg-subtle)",
                  padding: "12px",
                  borderRadius: "var(--radius-md)",
                  border: "1px dashed var(--border-primary)",
                }}
              >
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginBottom: 8 }}>
                  No existing properties. Register initial property to allocate unit:
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input
                    className="input"
                    placeholder="Property Name"
                    value={formData.newPropertyName}
                    onChange={(e) => setFormData({ ...formData, newPropertyName: e.target.value })}
                  />
                  <input
                    className="input"
                    placeholder="Unit Designation"
                    value={formData.newUnitName}
                    onChange={(e) => setFormData({ ...formData, newUnitName: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <select
                  className="input"
                  value={formData.propertyId}
                  onChange={(e) => handlePropertyChange(e.target.value)}
                >
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>

                <select
                  className="input"
                  value={formData.unitId}
                  onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}
                >
                  {availableUnits.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.unitName} ({u.status})
                    </option>
                  ))}
                  {availableUnits.length === 0 && <option value="">No units available</option>}
                </select>
              </div>
            )}
          </div>

          {/* Dates & Financials */}
          <div style={{ marginBottom: "16px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Dates &amp; Rate Realization
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "8px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>
                  Check-in Date:
                </span>
                <input
                  type="date"
                  className="input"
                  value={formData.checkIn}
                  onChange={(e) => setFormData({ ...formData, checkIn: e.target.value })}
                  required
                />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>
                  Departure Date:
                </span>
                <input
                  type="date"
                  className="input"
                  value={formData.checkOut}
                  onChange={(e) => setFormData({ ...formData, checkOut: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>
                  Gross Valuation ($):
                </span>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 750"
                  className="input"
                  value={formData.totalPrice}
                  onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                  required
                />
              </div>
              <div>
                <span style={{ fontSize: "11px", color: "var(--text-tertiary)", display: "block", marginBottom: 3 }}>
                  Headcount:
                </span>
                <input
                  type="number"
                  min="1"
                  className="input"
                  value={formData.guestCount}
                  onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--text-tertiary)",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                marginBottom: "6px",
              }}
            >
              Operational Notes &amp; Guest Requests
            </label>
            <textarea
              className="input"
              rows={2}
              style={{ resize: "none" }}
              placeholder="e.g. Corporate travel, early access required..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          {/* Action Footer */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary btn-sm"
              disabled={saving}
            >
              {saving ? "Commiting..." : "Commit Reservation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { IconProperties, IconPlus } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";
import AccessDenied from "@/components/AccessDenied";

export default function PropertiesPage() {
  const { hasPermission } = useAuth();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingProperty, setIsAddingProperty] = useState(false);
  const [isAddingUnit, setIsAddingUnit] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  const [propForm, setPropForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    type: "APARTMENT",
    description: "",
    unitName: "Unit 101",
    basePrice: 150,
  });

  const [unitForm, setUnitForm] = useState({
    unitName: "",
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    basePrice: 150,
  });

  async function fetchProperties() {
    try {
      setLoading(true);
      const res = await fetch("/api/properties");
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error("Failed to load properties:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchProperties();
  }, []);

  const handleCreateProperty = async (e) => {
    e.preventDefault();
    if (!propForm.name.trim()) return;

    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: propForm.name,
          address: propForm.address,
          city: propForm.city,
          state: propForm.state,
          zipCode: propForm.zipCode,
          type: propForm.type,
          description: propForm.description,
          units: propForm.unitName
            ? [{ unitName: propForm.unitName, basePrice: Number(propForm.basePrice) || 100 }]
            : [],
        }),
      });
      setIsAddingProperty(false);
      setPropForm({
        name: "",
        address: "",
        city: "",
        state: "",
        zipCode: "",
        type: "APARTMENT",
        description: "",
        unitName: "Unit 101",
        basePrice: 150,
      });
      fetchProperties();
    } catch (err) {
      console.error("Failed to create property:", err);
    }
  };

  const handleCreateUnit = async (e) => {
    e.preventDefault();
    if (!unitForm.unitName.trim() || !selectedPropertyId) return;

    try {
      await fetch("/api/properties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "unit",
          propertyId: selectedPropertyId,
          unitName: unitForm.unitName,
          maxGuests: Number(unitForm.maxGuests) || 2,
          bedrooms: Number(unitForm.bedrooms) || 1,
          bathrooms: Number(unitForm.bathrooms) || 1,
          basePrice: Number(unitForm.basePrice) || 100,
        }),
      });
      setIsAddingUnit(false);
      setUnitForm({
        unitName: "",
        maxGuests: 2,
        bedrooms: 1,
        bathrooms: 1,
        basePrice: 150,
      });
      fetchProperties();
    } catch (err) {
      console.error("Failed to create unit:", err);
    }
  };

  if (!hasPermission(PERMISSIONS.VIEW_PROPERTIES)) {
    return (
      <AccessDenied
        requiredPermission={PERMISSIONS.VIEW_PROPERTIES}
        moduleName="Portfolio Assets & Unit Registry"
      />
    );
  }

  return (
    <>
      <div className="page-header">
        <div className="page-header-left">
          <h1 className="page-title">Portfolio Assets</h1>
          <p className="page-subtitle">Real estate inventory, unit configurations, and base tariff management.</p>
        </div>
        <div className="page-header-actions">
          {hasPermission(PERMISSIONS.MANAGE_PROPERTIES) && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setIsAddingProperty(true)}
            >
              <IconPlus size={14} />
              Register Property Asset
            </button>
          )}
        </div>
      </div>

      {/* Add Property Form Drawer */}
      {isAddingProperty && (
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconProperties size={16} />
              </div>
              Register Property Entity
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsAddingProperty(false)}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateProperty} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "12px", marginBottom: "12px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Property Name *
                </label>
                <input
                  className="input"
                  placeholder="e.g. Alpine Grand Chalet"
                  value={propForm.name}
                  onChange={(e) => setPropForm({ ...propForm, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Asset Class
                </label>
                <select
                  className="input"
                  value={propForm.type}
                  onChange={(e) => setPropForm({ ...propForm, type: e.target.value })}
                >
                  <option value="APARTMENT">Apartment / Flat</option>
                  <option value="HOUSE">Single-Family / Villa</option>
                  <option value="CONDO">Condominium</option>
                  <option value="STUDIO">Studio</option>
                </select>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: "12px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Physical Address
                </label>
                <input
                  className="input"
                  placeholder="Street address"
                  value={propForm.address}
                  onChange={(e) => setPropForm({ ...propForm, address: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  City
                </label>
                <input
                  className="input"
                  placeholder="City"
                  value={propForm.city}
                  onChange={(e) => setPropForm({ ...propForm, city: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  State / Region
                </label>
                <input
                  className="input"
                  placeholder="State"
                  value={propForm.state}
                  onChange={(e) => setPropForm({ ...propForm, state: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Postal Code
                </label>
                <input
                  className="input"
                  placeholder="Zip"
                  value={propForm.zipCode}
                  onChange={(e) => setPropForm({ ...propForm, zipCode: e.target.value })}
                />
              </div>
            </div>

            <div style={{ backgroundColor: "var(--bg-subtle)", padding: "14px", borderRadius: "var(--radius-md)", marginBottom: "18px" }}>
              <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 8 }}>
                Primary Rental Unit Configuration
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: 3 }}>
                    Unit Designation / Room Code
                  </label>
                  <input
                    className="input"
                    value={propForm.unitName}
                    onChange={(e) => setPropForm({ ...propForm, unitName: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "11px", color: "var(--text-tertiary)", marginBottom: 3 }}>
                    Base Nightly Tariff ($)
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={propForm.basePrice}
                    onChange={(e) => setPropForm({ ...propForm, basePrice: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingProperty(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Commit Property Asset
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add Unit Modal */}
      {isAddingUnit && (
        <div className="card" style={{ marginBottom: "var(--space-5)" }}>
          <div className="card-header">
            <div className="card-title">
              <div className="card-title-icon">
                <IconPlus size={16} />
              </div>
              Provision Additional Unit
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setIsAddingUnit(false)}>
              Cancel
            </button>
          </div>
          <form onSubmit={handleCreateUnit} style={{ padding: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Unit Code / Name *
                </label>
                <input
                  className="input"
                  placeholder="Suite 201"
                  value={unitForm.unitName}
                  onChange={(e) => setUnitForm({ ...unitForm, unitName: e.target.value })}
                  required
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Rate ($)
                </label>
                <input
                  type="number"
                  className="input"
                  value={unitForm.basePrice}
                  onChange={(e) => setUnitForm({ ...unitForm, basePrice: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Max Guests
                </label>
                <input
                  type="number"
                  className="input"
                  value={unitForm.maxGuests}
                  onChange={(e) => setUnitForm({ ...unitForm, maxGuests: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Beds
                </label>
                <input
                  type="number"
                  className="input"
                  value={unitForm.bedrooms}
                  onChange={(e) => setUnitForm({ ...unitForm, bedrooms: e.target.value })}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", marginBottom: 5 }}>
                  Baths
                </label>
                <input
                  type="number"
                  step="0.5"
                  className="input"
                  value={unitForm.bathrooms}
                  onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })}
                />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => setIsAddingUnit(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Commit Unit
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Properties List */}
      {loading ? (
        <div className="card">
          <div style={{ padding: "var(--space-6)" }}>
            <div className="skeleton" style={{ width: "40%", height: 24, marginBottom: 12 }} />
            <div className="skeleton" style={{ width: "100%", height: 60 }} />
          </div>
        </div>
      ) : properties.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: "var(--space-8)" }}>
            <div className="empty-state-icon">
              <IconProperties size={20} />
            </div>
            <div className="empty-state-title">No Property Assets Registered</div>
            <div className="empty-state-text">
              Begin by registering your real estate units, apartments, or private residences.
            </div>
            {hasPermission(PERMISSIONS.MANAGE_PROPERTIES) && (
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: "var(--space-4)" }}
                onClick={() => setIsAddingProperty(true)}
              >
                <IconPlus size={14} />
                Register Property Asset
              </button>
            )}
          </div>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "var(--space-4)" }}>
          {properties.map((prop) => (
            <div key={prop.id} className="card">
              <div className="card-header">
                <div className="card-title">
                  <div className="card-title-icon">
                    <IconProperties size={16} />
                  </div>
                  {prop.name}
                  <span className="badge badge-maroon" style={{ marginLeft: 6 }}>
                    {prop.type}
                  </span>
                </div>
                {hasPermission(PERMISSIONS.MANAGE_PROPERTIES) && (
                  <div className="card-actions">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setSelectedPropertyId(prop.id);
                        setIsAddingUnit(true);
                      }}
                    >
                      <IconPlus size={13} />
                      Add Unit
                    </button>
                  </div>
                )}
              </div>
              <div className="card-body">
                <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)", marginBottom: "var(--space-3)" }}>
                  {prop.address ? `${prop.address}, ${prop.city} ${prop.state} ${prop.zipCode}` : "No physical address provided"}
                </div>

                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>
                  Units Allocated ({prop.units?.length || 0})
                </div>

                {prop.units?.length === 0 ? (
                  <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-tertiary)", fontStyle: "italic" }}>
                    No rental units attached to this property.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "10px" }}>
                    {prop.units.map((unit) => (
                      <div
                        key={unit.id}
                        style={{
                          border: "1px solid var(--border-primary)",
                          borderRadius: "var(--radius-md)",
                          padding: "12px",
                          backgroundColor: "var(--bg-surface)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                          <span style={{ fontWeight: 600, fontSize: "var(--font-size-sm)", color: "var(--text-primary)" }}>
                            {unit.unitName}
                          </span>
                          <span
                            className={`badge ${
                              unit.status === "AVAILABLE"
                                ? "badge-green"
                                : unit.status === "OCCUPIED"
                                ? "badge-blue"
                                : "badge-amber"
                            }`}
                          >
                            <span className="badge-dot" />
                            {unit.status}
                          </span>
                        </div>
                        <div style={{ fontSize: "var(--font-size-xs)", color: "var(--text-secondary)" }}>
                          ${unit.basePrice}/night &middot; {unit.maxGuests} guests max
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", marginTop: 2 }}>
                          {unit.bedrooms} bed &middot; {unit.bathrooms} bath
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";
import {
  IconDashboard,
  IconProperties,
  IconCalendar,
  IconUsers,
  IconCleaning,
  IconMaintenance,
  IconRevenue,
  IconBot,
  IconShield,
} from "@/components/icons";

const allNavSections = [
  {
    label: "Platform",
    items: [
      { name: "Dashboard", href: "/", icon: IconDashboard, permission: PERMISSIONS.VIEW_DASHBOARD },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { name: "Properties & Units", href: "/properties", icon: IconProperties, permission: PERMISSIONS.VIEW_PROPERTIES },
      { name: "Reservations", href: "/reservations", icon: IconCalendar, permission: PERMISSIONS.VIEW_RESERVATIONS },
      { name: "Guest Directory", href: "/guests", icon: IconUsers, permission: PERMISSIONS.VIEW_GUESTS },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Housekeeping", href: "/cleaning", icon: IconCleaning, permission: PERMISSIONS.VIEW_CLEANING },
      { name: "Maintenance", href: "/maintenance", icon: IconMaintenance, permission: PERMISSIONS.VIEW_MAINTENANCE },
    ],
  },
  {
    label: "Analytics & Intelligence",
    items: [
      { name: "Financial Yield", href: "/revenue", icon: IconRevenue, permission: PERMISSIONS.VIEW_REVENUE },
      { name: "AI Concierge", href: "/ai-assistant", icon: IconBot, permission: PERMISSIONS.VIEW_AI_CONCIERGE },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, currentRole, personas, switchPersona, hasPermission } = useAuth();
  const [showRoleModal, setShowRoleModal] = useState(false);

  // Dynamically filter sections and items based on RBAC permissions
  const visibleSections = allNavSections
    .map((sec) => ({
      ...sec,
      items: sec.items.filter((item) => hasPermission(item.permission)),
    }))
    .filter((sec) => sec.items.length > 0);

  return (
    <>
      <aside className="sidebar">
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">A</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-brand-text">AURA STR</div>
            <div className="sidebar-brand-sub">Enterprise Suite</div>
          </div>
          <span
            style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              backgroundColor: "var(--accent-green-bg)",
              color: "var(--accent-green)",
              border: "1px solid var(--accent-green-border)",
              letterSpacing: "0.03em",
            }}
          >
            LIVE
          </span>
        </div>

        {/* Dynamic RBAC Navigation */}
        <nav className="sidebar-nav">
          {visibleSections.map((sec) => (
            <div key={sec.label} style={{ marginBottom: "12px" }}>
              <div className="sidebar-section-label">{sec.label}</div>
              {sec.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`sidebar-link ${isActive ? "active" : ""}`}
                  >
                    <span className="sidebar-link-icon">
                      <Icon size={17} />
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Interactive Persona & Role Switcher Footer */}
        <div className="sidebar-footer">
          <div
            onClick={() => setShowRoleModal(true)}
            style={{
              cursor: "pointer",
              padding: "8px",
              borderRadius: "var(--radius-md)",
              transition: "background-color 0.15s ease",
              border: "1px solid var(--border-light)",
              backgroundColor: "var(--bg-subtle)",
            }}
            title="Click to switch simulated enterprise persona (RBAC test)"
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="sidebar-avatar" style={{ backgroundColor: "var(--maroon-100)", color: "var(--color-primary)" }}>
                {currentUser.initials}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div className="sidebar-user-name" style={{ fontSize: "13px" }}>
                    {currentUser.name}
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--color-primary)", fontWeight: 700 }}>
                    SWITCH &rsaquo;
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "5px", marginTop: "2px" }}>
                  <span className={`badge ${currentUser.badgeColor}`} style={{ fontSize: "9px", padding: "1px 5px" }}>
                    {currentUser.role}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Interactive RBAC Persona Switcher Dialog */}
      {showRoleModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(17, 24, 39, 0.45)",
            backdropFilter: "blur(3px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "var(--space-4)",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowRoleModal(false);
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: "500px",
              width: "100%",
              boxShadow: "var(--shadow-lg)",
            }}
          >
            <div className="card-header">
              <div className="card-title">
                <div className="card-title-icon">
                  <IconShield size={16} />
                </div>
                Simulate Enterprise Role (RBAC)
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="btn btn-ghost btn-sm"
                style={{ padding: "4px 8px" }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: "20px" }}>
              <p
                style={{
                  fontSize: "var(--font-size-xs)",
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  marginBottom: "16px",
                }}
              >
                Select a persona below to instantly simulate their permissions. The sidebar navigation, operational action buttons, and page access controls will dynamically adapt.
              </p>

              <div style={{ display: "grid", gap: "10px" }}>
                {personas.map((p) => {
                  const isSelected = p.id === currentUser.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        switchPersona(p.id);
                        setShowRoleModal(false);
                      }}
                      style={{
                        padding: "12px 14px",
                        borderRadius: "var(--radius-md)",
                        border: isSelected
                          ? "2px solid var(--color-primary)"
                          : "1px solid var(--border-primary)",
                        backgroundColor: isSelected ? "var(--maroon-50)" : "white",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                      }}
                    >
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "var(--radius-sm)",
                          backgroundColor: isSelected ? "var(--color-primary)" : "var(--bg-subtle)",
                          color: isSelected ? "white" : "var(--text-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 700,
                          fontSize: "12px",
                          flexShrink: 0,
                        }}
                      >
                        {p.initials}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2px" }}>
                          <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)" }}>
                            {p.name}
                          </span>
                          <span className={`badge ${p.badgeColor}`} style={{ fontSize: "10px" }}>
                            {p.role}
                          </span>
                        </div>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                          {p.title} &middot; {p.department}
                        </div>
                        <div style={{ fontSize: "11px", color: "var(--text-tertiary)", lineHeight: 1.4 }}>
                          {p.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: "18px", textAlign: "right" }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowRoleModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

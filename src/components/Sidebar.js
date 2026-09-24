"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  IconDashboard,
  IconProperties,
  IconCalendar,
  IconUsers,
  IconCleaning,
  IconMaintenance,
  IconRevenue,
  IconBot,
} from "@/components/icons";

const navSections = [
  {
    label: "Platform",
    items: [
      { name: "Dashboard", href: "/", icon: IconDashboard },
    ],
  },
  {
    label: "Portfolio",
    items: [
      { name: "Properties & Units", href: "/properties", icon: IconProperties },
      { name: "Reservations", href: "/reservations", icon: IconCalendar },
      { name: "Guest Directory", href: "/guests", icon: IconUsers },
    ],
  },
  {
    label: "Operations",
    items: [
      { name: "Housekeeping", href: "/cleaning", icon: IconCleaning },
      { name: "Maintenance", href: "/maintenance", icon: IconMaintenance },
    ],
  },
  {
    label: "Analytics & Intelligence",
    items: [
      { name: "Financial Yield", href: "/revenue", icon: IconRevenue },
      { name: "AI Concierge", href: "/ai-assistant", icon: IconBot },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Executive Brand Header */}
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

      {/* Navigation Sections */}
      <nav className="sidebar-nav">
        {navSections.map((sec) => (
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

      {/* User / Workspace Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">HQ</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="sidebar-user-name">Central Operations</div>
            <div className="sidebar-user-role">US-East · Enterprise</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

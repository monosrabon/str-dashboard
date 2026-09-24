"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { IconShield } from "@/components/icons";

export default function AccessDenied({ requiredPermission, moduleName = "this operational module" }) {
  const { currentUser, switchPersona, personas } = useAuth();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "65vh",
        padding: "var(--space-6)",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "520px",
          width: "100%",
          textAlign: "center",
          padding: "36px 30px",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "50%",
            backgroundColor: "var(--accent-red-bg)",
            color: "var(--accent-red)",
            border: "1px solid var(--accent-red-border)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "18px",
          }}
        >
          <IconShield size={28} />
        </div>

        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "var(--accent-red)",
            marginBottom: "6px",
          }}
        >
          403 Access Restricted &middot; RBAC Governance
        </div>

        <h2
          style={{
            fontSize: "var(--font-size-xl)",
            fontWeight: 800,
            color: "var(--text-primary)",
            marginBottom: "10px",
            letterSpacing: "-0.02em",
          }}
        >
          Permission Denied
        </h2>

        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--text-secondary)",
            lineHeight: 1.55,
            marginBottom: "20px",
          }}
        >
          Your current persona (<strong>{currentUser.name}</strong> &mdash; <em>{currentUser.title}</em>) does not hold the required enterprise entitlement (<code>{requiredPermission}</code>) to access {moduleName}.
        </p>

        {/* Persona Switcher Quick Action for Training */}
        <div
          style={{
            backgroundColor: "var(--bg-subtle)",
            padding: "16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border-light)",
            marginBottom: "22px",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              fontWeight: 700,
              color: "var(--text-tertiary)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              marginBottom: "8px",
            }}
          >
            Enterprise Training Simulator &mdash; Switch Role:
          </div>
          <div style={{ display: "grid", gap: "6px" }}>
            {personas.map((p) => (
              <button
                key={p.id}
                onClick={() => switchPersona(p.id)}
                className="btn btn-secondary btn-sm"
                style={{
                  justifyContent: "space-between",
                  backgroundColor: p.id === currentUser.id ? "var(--maroon-50)" : "white",
                  borderColor: p.id === currentUser.id ? "var(--color-primary-border)" : "var(--border-primary)",
                }}
              >
                <span>
                  <strong>{p.name}</strong> ({p.role})
                </span>
                <span className={`badge ${p.badgeColor}`} style={{ fontSize: "10px" }}>
                  {p.title}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
          <Link href="/" className="btn btn-primary btn-sm">
            Return to Command Center
          </Link>
        </div>
      </div>
    </div>
  );
}

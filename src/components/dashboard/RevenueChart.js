"use client";

import { useEffect, useRef } from "react";
import { IconRevenue, IconTrendUp, IconShield } from "@/components/icons";
import { useAuth } from "@/lib/authContext";
import { PERMISSIONS } from "@/lib/rbac";

export default function RevenueChart({ data, loading }) {
  const { hasPermission } = useAuth();
  const canViewRevenue = hasPermission(PERMISSIONS.VIEW_REVENUE);
  const canvasRef = useRef(null);
  const chartData = data?.revenueHistory || [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext("2d");
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;
    const padding = { top: 20, right: 20, bottom: 36, left: 52 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    ctx.clearRect(0, 0, width, height);

    const allValues = chartData.flatMap((d) => [d.revenue, d.expenses]);
    const maxVal = Math.max(...allValues, 1) * 1.15;

    // Y-axis labels & gridlines
    const ySteps = 4;
    ctx.textAlign = "right";
    ctx.textBaseline = "middle";
    ctx.font = "500 11px 'Plus Jakarta Sans', sans-serif";

    for (let i = 0; i <= ySteps; i++) {
      const val = (maxVal * i) / ySteps;
      const y = padding.top + chartH - (chartH * i) / ySteps;

      ctx.strokeStyle = "#E5E7EB";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();

      ctx.fillStyle = "#9CA3AF";
      ctx.fillText(`$${(val / 1000).toFixed(0)}k`, padding.left - 8, y);
    }

    // X-axis labels
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    chartData.forEach((d, i) => {
      const x = padding.left + (chartW * i) / (chartData.length - 1 || 1);
      ctx.fillStyle = "#6B7280";
      ctx.font = "600 11px 'Plus Jakarta Sans', sans-serif";
      ctx.fillText(d.month, x, height - padding.bottom + 10);
    });

    // Area fill — executive burgundy gradient
    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartH);
    gradient.addColorStop(0, "rgba(112, 26, 47, 0.12)");
    gradient.addColorStop(1, "rgba(112, 26, 47, 0.0)");

    ctx.beginPath();
    chartData.forEach((d, i) => {
      const x = padding.left + (chartW * i) / (chartData.length - 1 || 1);
      const y = padding.top + chartH - (d.revenue / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.lineTo(padding.left + chartW, padding.top + chartH);
    ctx.lineTo(padding.left, padding.top + chartH);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();

    // Revenue line — burgundy
    ctx.beginPath();
    ctx.strokeStyle = "#701A2F";
    ctx.lineWidth = 2.25;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";

    chartData.forEach((d, i) => {
      const x = padding.left + (chartW * i) / (chartData.length - 1 || 1);
      const y = padding.top + chartH - (d.revenue / maxVal) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Subtle Dots on revenue line
    chartData.forEach((d, i) => {
      const x = padding.left + (chartW * i) / (chartData.length - 1 || 1);
      const y = padding.top + chartH - (d.revenue / maxVal) * chartH;

      ctx.beginPath();
      ctx.arc(x, y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#701A2F";
      ctx.fill();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [chartData]);

  const totalRevenue = chartData.reduce((s, d) => s + d.revenue, 0);
  const totalExpenses = chartData.reduce((s, d) => s + d.expenses, 0);
  const netProfit = totalRevenue - totalExpenses;
  const hasData = chartData.length > 0 && totalRevenue > 0;

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">
            <IconRevenue size={16} />
          </div>
          Revenue Trajectory
        </div>
        {hasData && canViewRevenue && (
          <div className="card-actions">
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                fontSize: "11px",
                color: "var(--accent-green)",
                fontWeight: 600,
                backgroundColor: "var(--accent-green-bg)",
                padding: "2px 7px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--accent-green-border)",
              }}
            >
              <IconTrendUp size={12} />
              Realized Yield
            </span>
          </div>
        )}
      </div>
      <div className="card-body">
        {!canViewRevenue ? (
          <div className="empty-state" style={{ padding: "var(--space-6) var(--space-4)" }}>
            <div
              className="empty-state-icon"
              style={{
                backgroundColor: "var(--accent-red-bg)",
                color: "var(--accent-red)",
                border: "1px solid var(--accent-red-border)",
              }}
            >
              <IconShield size={20} />
            </div>
            <div className="empty-state-title">Executive Yield Restricted</div>
            <div className="empty-state-text">
              Realized P&amp;L performance charts and profit distributions are restricted to Executive Suite (OWNER) credentials.
            </div>
          </div>
        ) : loading ? (
          <div className="skeleton" style={{ width: "100%", height: 200 }} />
        ) : !hasData ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <IconRevenue size={20} />
            </div>
            <div className="empty-state-title">No Financial Data Recorded</div>
            <div className="empty-state-text">
              Realized booking revenue and platform payout metrics will plot dynamically as reservations are created.
            </div>
          </div>
        ) : (
          <>
            <div className="chart-container">
              <canvas
                ref={canvasRef}
                className="chart-canvas"
                style={{ width: "100%", height: "200px" }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "var(--space-3)",
                marginTop: "var(--space-4)",
                paddingTop: "var(--space-3)",
                borderTop: "1px solid var(--border-light)",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Total Realized
                </div>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--color-primary)", fontVariantNumeric: "tabular-nums" }}>
                  ${totalRevenue.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Disbursements
                </div>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--accent-amber)", fontVariantNumeric: "tabular-nums" }}>
                  ${totalExpenses.toLocaleString()}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-tertiary)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  Net Margin
                </div>
                <div style={{ fontSize: "var(--font-size-base)", fontWeight: 700, color: "var(--accent-green)", fontVariantNumeric: "tabular-nums" }}>
                  ${netProfit.toLocaleString()}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

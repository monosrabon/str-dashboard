"use client";

import {
  IconCheckIn,
  IconCheckOut,
  IconOccupancy,
  IconRevenue,
} from "@/components/icons";

export default function StatCards({ data, loading }) {
  const stats = data?.stats || {
    todayCheckIns: 0,
    todayCheckOuts: 0,
    occupancyRate: 0,
    monthlyRevenue: 0,
  };

  const cards = [
    {
      label: "Today's Check-ins",
      value: stats.todayCheckIns,
      icon: IconCheckIn,
      tint: "maroon",
      subtext: "Scheduled guest arrivals",
      format: "number",
    },
    {
      label: "Today's Check-outs",
      value: stats.todayCheckOuts,
      icon: IconCheckOut,
      tint: "amber",
      subtext: "Pending room turnovers",
      format: "number",
    },
    {
      label: "Portfolio Occupancy",
      value: stats.occupancyRate,
      icon: IconOccupancy,
      tint: "green",
      subtext: "Active capacity utilized",
      format: "percent",
    },
    {
      label: "Revenue (MTD)",
      value: stats.monthlyRevenue,
      icon: IconRevenue,
      tint: "blue",
      subtext: "Net realized earnings",
      format: "currency",
    },
  ];

  const formatValue = (value, format) => {
    switch (format) {
      case "currency":
        return `$${Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}`;
      case "percent":
        return `${Math.round(value)}%`;
      default:
        return value;
    }
  };

  return (
    <div className="stats-grid">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="stat-card">
            <div className="stat-card-top">
              <div className="stat-card-label">{card.label}</div>
              <div className={`stat-card-icon-wrap ${card.tint}`}>
                <Icon size={18} />
              </div>
            </div>

            {loading ? (
              <div>
                <div
                  className="skeleton"
                  style={{ width: "90px", height: "32px", marginBottom: "8px" }}
                />
                <div
                  className="skeleton"
                  style={{ width: "130px", height: "14px" }}
                />
              </div>
            ) : (
              <>
                <div className="stat-card-value">
                  {formatValue(card.value, card.format)}
                </div>
                <div className="stat-card-meta">{card.subtext}</div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

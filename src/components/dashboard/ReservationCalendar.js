"use client";

import { useState } from "react";
import Link from "next/link";
import { IconCalendar } from "@/components/icons";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function ReservationCalendar({ data }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();
  const reservations = data?.recentReservations || [];

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const isToday = (day) =>
    day === today.getDate() &&
    month === today.getMonth() &&
    year === today.getFullYear();

  const getEventForDay = (day) => {
    const checkDate = new Date(year, month, day);
    for (const res of reservations) {
      const checkIn = new Date(res.checkIn);
      const checkOut = new Date(res.checkOut);

      if (
        checkDate.getFullYear() === checkIn.getFullYear() &&
        checkDate.getMonth() === checkIn.getMonth() &&
        checkDate.getDate() === checkIn.getDate()
      ) {
        return res.status === "CHECKED_IN" ? "checked-in" : "confirmed";
      }
      if (
        checkDate.getFullYear() === checkOut.getFullYear() &&
        checkDate.getMonth() === checkOut.getMonth() &&
        checkDate.getDate() === checkOut.getDate()
      ) {
        return "checkout";
      }
      if (checkDate > checkIn && checkDate < checkOut && res.status === "CHECKED_IN") {
        return "occupied";
      }
    }
    return null;
  };

  const getEventColor = (type) => {
    switch (type) {
      case "checked-in": return "var(--accent-green)";
      case "confirmed": return "var(--accent-blue)";
      case "checkout": return "var(--accent-amber)";
      case "occupied": return "var(--color-primary)";
      default: return null;
    }
  };

  const calendarDays = [];

  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({ day: daysInPrevMonth - i, isCurrentMonth: false });
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      isToday: isToday(i),
      eventType: getEventForDay(i),
    });
  }

  const remaining = 42 - calendarDays.length;
  for (let i = 1; i <= remaining; i++) {
    calendarDays.push({ day: i, isCurrentMonth: false });
  }

  return (
    <div className="card">
      <div className="card-header">
        <div className="card-title">
          <div className="card-title-icon">
            <IconCalendar size={16} />
          </div>
          Occupancy Schedule
        </div>
        <div className="card-actions">
          <Link href="/reservations" className="btn btn-ghost btn-sm">
            View All
          </Link>
        </div>
      </div>
      <div className="card-body">
        <div className="calendar">
          <div className="calendar-header">
            <span className="calendar-month">
              {MONTHS[month]} {year}
            </span>
            <div className="calendar-nav">
              <button className="calendar-nav-btn" onClick={prevMonth} aria-label="Previous month">
                &lsaquo;
              </button>
              <button className="calendar-nav-btn" onClick={nextMonth} aria-label="Next month">
                &rsaquo;
              </button>
            </div>
          </div>
          <div className="calendar-grid">
            {DAYS.map((day) => (
              <div key={day} className="calendar-day-label">{day}</div>
            ))}
            {calendarDays.map((d, idx) => {
              const eventColor = d.eventType ? getEventColor(d.eventType) : null;
              return (
                <div
                  key={idx}
                  className={`calendar-day ${d.isToday ? "today" : ""} ${
                    !d.isCurrentMonth ? "other-month" : ""
                  }`}
                  style={
                    d.eventType && d.isCurrentMonth && !d.isToday
                      ? {
                          backgroundColor: `${eventColor}14`,
                          borderColor: `${eventColor}40`,
                          color: eventColor,
                          fontWeight: 600,
                        }
                      : undefined
                  }
                >
                  {d.day}
                </div>
              );
            })}
          </div>

          {/* Micro Legend */}
          <div
            style={{
              display: "flex",
              gap: "var(--space-4)",
              marginTop: "var(--space-4)",
              paddingTop: "var(--space-3)",
              borderTop: "1px solid var(--border-light)",
              justifyContent: "center",
            }}
          >
            {[
              { label: "Arrival", color: "var(--accent-green)" },
              { label: "Confirmed", color: "var(--accent-blue)" },
              { label: "Departure", color: "var(--accent-amber)" },
              { label: "Occupied", color: "var(--color-primary)" },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  fontSize: "11px",
                  color: "var(--text-tertiary)",
                  fontWeight: 500,
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    backgroundColor: item.color,
                  }}
                />
                {item.label}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

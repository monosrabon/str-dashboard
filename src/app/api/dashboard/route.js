import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dataStore";

export async function GET() {
  try {
    const data = await getDashboardData();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Dashboard API error:", error);
    return NextResponse.json(
      {
        stats: {
          todayCheckIns: 0,
          todayCheckOuts: 0,
          occupancyRate: 0,
          monthlyRevenue: 0,
        },
        cleaningTasks: [],
        maintenanceIssues: [],
        revenueHistory: [],
        recentMessages: [],
        recentReservations: [],
        unitCount: 0,
        propertyCount: 0,
      },
      { status: 200 }
    );
  }
}

import { NextResponse } from "next/server";
import {
  getMaintenanceIssues,
  createMaintenanceIssue,
  updateMaintenanceStatus,
} from "@/lib/dataStore";

export async function GET() {
  try {
    const issues = await getMaintenanceIssues();
    return NextResponse.json({ issues });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.title || !body.unitId) {
      return NextResponse.json(
        { error: "Title and unit ID are required" },
        { status: 400 }
      );
    }
    const issue = await createMaintenanceIssue(body);
    return NextResponse.json({ issue }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, status } = body;
    if (!id || !status) {
      return NextResponse.json(
        { error: "Issue ID and status are required" },
        { status: 400 }
      );
    }
    const issue = await updateMaintenanceStatus(id, status);
    return NextResponse.json({ issue });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

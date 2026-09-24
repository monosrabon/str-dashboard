import { NextResponse } from "next/server";
import { getCleaningTasks, updateCleaningStatus } from "@/lib/dataStore";

export async function GET() {
  try {
    const tasks = await getCleaningTasks();
    return NextResponse.json({ tasks });
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
        { error: "Task ID and status are required" },
        { status: 400 }
      );
    }

    const task = await updateCleaningStatus(id, status);
    return NextResponse.json({ task });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getGuests } from "@/lib/dataStore";

export async function GET() {
  try {
    const guests = await getGuests();
    return NextResponse.json({ guests });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

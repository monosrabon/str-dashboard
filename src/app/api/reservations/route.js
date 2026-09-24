import { NextResponse } from "next/server";
import {
  getReservations,
  createReservation,
  updateReservationStatus,
} from "@/lib/dataStore";

export async function GET() {
  try {
    const reservations = await getReservations();
    return NextResponse.json({ reservations });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.guestName || !body.unitId || !body.checkIn || !body.checkOut) {
      return NextResponse.json(
        { error: "Guest name, unit, check-in, and check-out dates are required" },
        { status: 400 }
      );
    }

    const reservation = await createReservation(body);
    return NextResponse.json({ reservation }, { status: 201 });
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
        { error: "Reservation ID and status are required" },
        { status: 400 }
      );
    }

    const reservation = await updateReservationStatus(id, status);
    return NextResponse.json({ reservation });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

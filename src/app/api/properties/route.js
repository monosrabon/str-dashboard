import { NextResponse } from "next/server";
import { getProperties, createProperty, createUnit } from "@/lib/dataStore";

export async function GET() {
  try {
    const properties = await getProperties();
    return NextResponse.json({ properties });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (body.type === "unit") {
      const unit = await createUnit(body);
      return NextResponse.json({ unit }, { status: 201 });
    }

    if (!body.name) {
      return NextResponse.json({ error: "Property name is required" }, { status: 400 });
    }

    const property = await createProperty(body);
    return NextResponse.json({ property }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

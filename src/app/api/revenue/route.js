import { NextResponse } from "next/server";
import { getFinancials, createExpense } from "@/lib/dataStore";

export async function GET() {
  try {
    const data = await getFinancials();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (!body.amount) {
      return NextResponse.json({ error: "Amount is required" }, { status: 400 });
    }
    const expense = await createExpense(body);
    return NextResponse.json({ expense }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

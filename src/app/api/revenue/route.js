import { NextResponse } from "next/server";
import { getFinancials, createExpense } from "@/lib/dataStore";
import { ROLES } from "@/lib/rbac";

export async function GET(req) {
  try {
    const role = req.headers.get("x-user-role");
    if (role && role !== ROLES.SUPER_ADMIN && role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden: Executive Suite (SUPER ADMIN) credentials required for financial ledgers." },
        { status: 403 }
      );
    }
    const data = await getFinancials();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const role = req.headers.get("x-user-role");
    if (role && role !== ROLES.SUPER_ADMIN && role !== "OWNER") {
      return NextResponse.json(
        { error: "Forbidden: Only Executive Suite (SUPER ADMIN) can post expense vouchers." },
        { status: 403 }
      );
    }
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

import { NextResponse } from "next/server";
import { getReportFromFirebase } from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const report = await getReportFromFirebase(id);

  if (!report) {
    return NextResponse.json({ report: null }, { status: 404 });
  }

  return NextResponse.json({ report });
}

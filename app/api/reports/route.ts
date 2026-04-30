import { NextResponse } from "next/server";
import { listRecentReports } from "@/lib/firebase-admin";
import { sampleHistory } from "@/lib/report-types";

export const runtime = "nodejs";

export async function GET() {
  const reports = await listRecentReports();
  return NextResponse.json({
    reports: reports.length > 0 ? reports : sampleHistory
  });
}

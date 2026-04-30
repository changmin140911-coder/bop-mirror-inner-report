import { NextResponse } from "next/server";
import { buildFallbackReport, questionnaire } from "@/lib/report-types";

export async function GET() {
  return NextResponse.json({
    questionnaire,
    demoReport: buildFallbackReport()
  });
}

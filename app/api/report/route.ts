import { NextResponse } from "next/server";
import { demoReport } from "@/lib/demo-report";

export async function GET() {
  return NextResponse.json(demoReport);
}

import { NextResponse } from "next/server";
import {
  isFirebaseConfigured,
  listAdminReports,
  listCoachingApplications
} from "@/lib/firebase-admin";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const password = url.searchParams.get("password") || request.headers.get("x-admin-password");
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();

  if (!adminPassword) {
    return NextResponse.json(
      {
        error: "ADMIN_PASSWORD 환경변수가 설정되지 않았습니다.",
        configured: false,
        firebaseConfigured: isFirebaseConfigured()
      },
      { status: 503 }
    );
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  const [reports, applications] = await Promise.all([
    listAdminReports(),
    listCoachingApplications()
  ]);

  return NextResponse.json({
    configured: true,
    firebaseConfigured: isFirebaseConfigured(),
    reports,
    applications
  });
}

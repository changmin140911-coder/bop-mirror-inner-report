import { NextResponse } from "next/server";
import { isFirebaseConfigured, saveCoachingApplication } from "@/lib/firebase-admin";

export const runtime = "nodejs";

function sanitize(value: unknown) {
  return String(value ?? "").trim().slice(0, 500);
}

export async function POST(request: Request) {
  const body = (await request.json()) as Record<string, unknown>;
  const input = {
    name: sanitize(body.name),
    age: sanitize(body.age),
    location: sanitize(body.location),
    phone: sanitize(body.phone),
    helpTopic: sanitize(body.helpTopic),
    availableTime: sanitize(body.availableTime),
    privacyAgreed: body.privacyAgreed === true,
    pledgeAgreed: body.pledgeAgreed === true
  };

  if (!input.name || !input.age || !input.location || !input.phone) {
    return NextResponse.json({ error: "필수 정보를 모두 입력해 주세요." }, { status: 400 });
  }

  if (!input.privacyAgreed || !input.pledgeAgreed) {
    return NextResponse.json(
      { error: "개인정보 안내와 보안서약에 동의해 주세요." },
      { status: 400 }
    );
  }

  const id = await saveCoachingApplication(input);
  return NextResponse.json({
    id,
    storedInFirebase: Boolean(id),
    firebaseConfigured: isFirebaseConfigured()
  });
}

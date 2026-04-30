import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeWithOpenAI } from "@/lib/openai-analysis";
import {
  saveReportToFirebase,
  uploadGeneratedImage,
  isFirebaseConfigured
} from "@/lib/firebase-admin";
import type { AnalysisPayload, QuestionnaireAnswer } from "@/lib/report-types";

export const runtime = "nodejs";
export const maxDuration = 60;

function parseAnswers(raw: string | null): QuestionnaireAnswer[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as QuestionnaireAnswer[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");
  const nickname = String(formData.get("nickname") || "");
  const brandFocus = String(formData.get("brandFocus") || "");
  const consentToStore = formData.get("consentToStore") === "true";
  const answers = parseAnswers(String(formData.get("answers") || ""));

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "이미지 파일이 필요합니다." }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "이미지 파일만 업로드할 수 있습니다." }, { status: 400 });
  }

  if (file.size > 6 * 1024 * 1024) {
    return NextResponse.json({ error: "이미지는 6MB 이하로 업로드해 주세요." }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const payload: AnalysisPayload = {
    nickname,
    brandFocus,
    consentToStore,
    answers,
    imageMimeType: file.type,
    imageBase64: buffer.toString("base64")
  };

  const analysis = await analyzeWithOpenAI(payload);
  const reportId = randomUUID();
  analysis.report.id = reportId;

  let generatedImageStored = false;
  if (analysis.report.generatedImage?.dataUrl && isFirebaseConfigured()) {
    const base64Data = analysis.report.generatedImage.dataUrl.split(",")[1];
    const storagePath = await uploadGeneratedImage(reportId, base64Data);
    if (storagePath) {
      generatedImageStored = true;
      analysis.report.generatedImage.storagePath = storagePath;
    }
  }

  const savedId = await saveReportToFirebase(analysis.report, payload, {
    generatedImageStored
  });

  return NextResponse.json({
    report: analysis.report,
    diagnostics: {
      ...analysis.diagnostics,
      storedInFirebase: Boolean(savedId)
    }
  });
}

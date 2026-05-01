import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { analyzeWithOpenAI } from "@/lib/openai-analysis";
import {
  saveReportToFirebase,
  uploadGeneratedImage,
  isFirebaseConfigured
} from "@/lib/firebase-admin";
import type {
  AnalysisDepth,
  AnalysisPayload,
  QuestionnaireAnswer
} from "@/lib/report-types";

export const runtime = "nodejs";
export const maxDuration = 300;

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

function parseDepth(raw: FormDataEntryValue | null): AnalysisDepth {
  const value = String(raw || "standard");
  return value === "detail" || value === "quick" ? value : "standard";
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get("image");
  const nickname = String(formData.get("nickname") || "");
  const gender = String(formData.get("gender") || "");
  const brandFocus = String(formData.get("brandFocus") || "");
  const consentToStore = formData.get("consentToStore") === "true";
  const answers = parseAnswers(String(formData.get("answers") || ""));
  const analysisDepth = parseDepth(formData.get("analysisDepth"));

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
    gender,
    brandFocus,
    consentToStore,
    answers,
    analysisDepth,
    imageMimeType: file.type,
    imageBase64: buffer.toString("base64")
  };

  const analysis = await analyzeWithOpenAI(payload);
  const reportId = randomUUID();
  analysis.report.id = reportId;
  analysis.report.intake = {
    nickname,
    gender,
    brandFocus,
    consentToStore,
    answers
  };
  analysis.report.visuals = {
    ...(analysis.report.visuals ?? {}),
    generatedImageUrl: analysis.report.generatedImage?.dataUrl ?? null,
    imagePrompt: analysis.report.recommendation.moodboardPrompt,
    imageCaption: "분석에 사용된 대표 이미지와 추천 무드를 함께 정리한 리포트입니다.",
    fallbackVisualType: "moodboard"
  };

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

import OpenAI from "openai";
import {
  buildFallbackReport,
  getRobotByDepth,
  type ImageGenerationDiagnostic,
  type AnalysisPayload,
  type AnalysisResponse,
  type ReportData,
  type ReportVisualSlot
} from "@/lib/report-types";

const reportSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "profile",
    "mirror",
    "color",
    "inner",
    "dissonance",
    "recommendation",
    "security"
  ],
  properties: {
    profile: {
      type: "object",
      additionalProperties: false,
      required: ["persona", "summary", "keywords", "archetypeLine"],
      properties: {
        persona: { type: "string" },
        summary: { type: "string" },
        keywords: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4
        },
        archetypeLine: { type: "string" }
      }
    },
    mirror: {
      type: "object",
      additionalProperties: false,
      required: [
        "faceShapeLabel",
        "proportion",
        "lineTypeLabel",
        "scores",
        "moodDescriptors",
        "photoClues",
        "balanceComment"
      ],
      properties: {
        faceShapeLabel: { type: "string" },
        proportion: {
          type: "object",
          additionalProperties: false,
          required: ["upper", "middle", "lower", "label"],
          properties: {
            upper: { type: "number" },
            middle: { type: "number" },
            lower: { type: "number" },
            label: { type: "string" }
          }
        },
        lineTypeLabel: { type: "string" },
        scores: {
          type: "object",
          additionalProperties: false,
          required: ["softness", "clarity", "elegance", "approachability"],
          properties: {
            softness: { type: "number" },
            clarity: { type: "number" },
            elegance: { type: "number" },
            approachability: { type: "number" }
          }
        },
        moodDescriptors: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        photoClues: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4
        },
        balanceComment: { type: "string" }
      }
    },
    color: {
      type: "object",
      additionalProperties: false,
      required: ["seasonLabel", "undertone", "palette", "avoid", "note", "bestUse", "textureWords"],
      properties: {
        seasonLabel: { type: "string" },
        undertone: { type: "string" },
        palette: {
          type: "array",
          items: { type: "string" },
          minItems: 4,
          maxItems: 4
        },
        avoid: {
          type: "array",
          items: { type: "string" },
          minItems: 2,
          maxItems: 2
        },
        note: { type: "string" },
        bestUse: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        textureWords: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        }
      }
    },
    inner: {
      type: "object",
      additionalProperties: false,
      required: [
        "enneagramType",
        "wing",
        "expressionDesire",
        "stressSignal",
        "brandNeed"
      ],
      properties: {
        enneagramType: { type: "number" },
        wing: { type: "string" },
        expressionDesire: { type: "string" },
        stressSignal: { type: "string" },
        brandNeed: { type: "string" }
      }
    },
    dissonance: {
      type: "object",
      additionalProperties: false,
      required: ["gapScore", "tensionLabel", "insight", "recommendation"],
      properties: {
        gapScore: { type: "number" },
        tensionLabel: { type: "string" },
        insight: { type: "string" },
        recommendation: { type: "string" }
      }
    },
    recommendation: {
      type: "object",
      additionalProperties: false,
      required: [
        "hair",
        "makeup",
        "profileMood",
        "narrative",
        "moodboardPrompt",
        "toneReason",
        "outfitDetails",
        "beautyDetails",
        "moodDetails",
        "photoDirection",
        "avoidDetails",
        "shoppingKeywords",
        "sessionHook"
      ],
      properties: {
        hair: { type: "string" },
        makeup: { type: "string" },
        profileMood: { type: "string" },
        narrative: { type: "string" },
        moodboardPrompt: { type: "string" },
        toneReason: { type: "string" },
        outfitDetails: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        beautyDetails: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        moodDetails: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        photoDirection: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        avoidDetails: {
          type: "array",
          items: { type: "string" },
          minItems: 3,
          maxItems: 3
        },
        shoppingKeywords: {
          type: "array",
          items: { type: "string" },
          minItems: 5,
          maxItems: 5
        },
        sessionHook: { type: "string" }
      }
    },
    security: {
      type: "object",
      additionalProperties: false,
      required: ["storageMode", "retention", "privacyNote"],
      properties: {
        storageMode: { type: "string" },
        retention: { type: "string" },
        privacyNote: { type: "string" }
      }
    }
  }
} as const;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  return apiKey ? new OpenAI({ apiKey }) : null;
}

function getAnalysisPrompt(payload: AnalysisPayload) {
  const robot = getRobotByDepth(payload.analysisDepth);
  const questionnaireSummary = payload.answers
    .map((answer) => `${answer.prompt}: ${answer.label}`)
    .join("\n");

  const depthRules =
    robot.id === "detail"
      ? `
Detail mode quality rules:
- Write like a paid premium consulting report.
- Mention concrete visible photo clues: contrast, lightness, facial line balance, feature focus, and tone harmony.
- Give richer, more specific styling directions that feel personally selected.
- Do not stop at labels. Explain "why this works" and "how to apply it tomorrow".
- Build a high-end report that feels close to a 20-30 page expert PDF compressed into web sections.
- Make the user feel "I want to book this" without using fear or heavy diagnostic wording.`
      : robot.id === "standard"
        ? `
Standard mode quality rules:
- Keep a polished editorial tone.
- Explain the main photo-based clues and practical style direction clearly.`
        : `
Quick mode quality rules:
- Keep it short, useful, and easy to scan.
- Focus on the highest-impact tone, outfit, and mood suggestions.`;

  return `
You are creating a premium AI style and image report in Korean from the user's uploaded photo.
You must not infer mental health, morality, or hidden pathology from the face.
Use the image itself carefully and specifically. Analyze visible visual signals such as:
- overall face silhouette and balance
- upper, middle, and lower face proportions
- line quality around brows, eyes, nose, lips, cheekbones, and jawline
- contrast level between hair, skin, and facial features
- visible skin undertone clues while clearly accounting for lighting uncertainty
- styling mood that would harmonize with the user's actual photo
Use the questionnaire only as self-reported preference and expression data.
Keep the tone professional, aesthetic, warm, specific, and easy for women in their 20s to read.
Prefer natural Korean labels over English jargon. For example, do not use labels like "Structured Elegant" as the main persona name.
Do not show heavy tool names to the user. Avoid visible words such as "에니어그램", "얼굴형", "심리", "진단", "문제", "결핍", "치료", "검사".
Use softer user-facing words such as "마음 취향", "인상 밸런스", "분위기", "스타일 방향", "숨은 매력", "톤".
Return valid JSON that matches the schema exactly.

Brand focus:
${payload.brandFocus || "없음"}

Self-reported gender or styling context:
${payload.gender || "미응답"}

Selected analysis robot:
${robot.name} (${robot.nickname})
${robot.description}
${robot.promise}
${depthRules}

Questionnaire:
${questionnaireSummary}

Report rules:
- profile.keywords must contain exactly 4 concise Korean phrases.
- proportion values should be realistic percentages that sum to about 100.
- scores should be 0-100.
- color.palette and color.avoid must be hex strings.
- Every report sentence must feel like it came from the uploaded photo, not a generic horoscope.
- color.note must explain that the palette is based on visible photo signals and lighting may affect precision.
- recommendation.hair, recommendation.makeup, and recommendation.profileMood must be concrete and practical.
- recommendation.toneReason should explain why the selected palette suits the visible photo.
- recommendation.outfitDetails, beautyDetails, moodDetails, and photoDirection must each contain exactly 3 concrete Korean recommendations.
- mirror.photoClues must contain exactly 4 concrete visual clues from the uploaded photo.
- mirror.balanceComment must be a warm but specific paragraph about the user's visible image balance.
- color.bestUse must tell exactly 3 practical uses for the palette.
- color.textureWords must contain exactly 3 fabric or makeup texture words.
- recommendation.avoidDetails must contain exactly 3 styling choices to reduce.
- recommendation.shoppingKeywords must contain exactly 5 useful Korean shopping/search keywords.
- recommendation.sessionHook must be one persuasive sentence that naturally makes the user want a deeper 1:1 styling session.
- If the selected robot is "quick", keep sentences shorter and more summary-like.
- If the selected robot is "detail", add more nuanced visual branding language.
- recommendation.moodboardPrompt should describe a premium editorial moodboard, not a transformed portrait of the uploaded user.
- recommendation.moodboardPrompt should ask for stylish women-focused editorial references including outfit, makeup, and mood photography.
- security fields should explain consent-based storage and that this is branding guidance, not diagnosis.
`.trim();
}

function normalizeReport(raw: ReportData): ReportData {
  const safePalette = raw.color.palette.slice(0, 4);
  while (safePalette.length < 4) {
    safePalette.push("#d9d9d9");
  }

  const safeAvoid = raw.color.avoid.slice(0, 2);
  while (safeAvoid.length < 2) {
    safeAvoid.push("#7a5f48");
  }

  return {
    ...raw,
    source: "openai",
    createdAt: new Date().toISOString(),
    profile: {
      ...raw.profile,
      keywords: raw.profile.keywords.slice(0, 4)
    },
    mirror: {
      ...raw.mirror,
      photoClues: (raw.mirror.photoClues ?? []).slice(0, 4),
      balanceComment: raw.mirror.balanceComment ?? "",
      scores: {
        softness: clampScore(raw.mirror.scores.softness),
        clarity: clampScore(raw.mirror.scores.clarity),
        elegance: clampScore(raw.mirror.scores.elegance),
        approachability: clampScore(raw.mirror.scores.approachability)
      }
    },
    color: {
      ...raw.color,
      palette: safePalette,
      avoid: safeAvoid,
      bestUse: (raw.color.bestUse ?? []).slice(0, 3),
      textureWords: (raw.color.textureWords ?? []).slice(0, 3)
    },
    recommendation: {
      ...raw.recommendation,
      outfitDetails: (raw.recommendation.outfitDetails ?? []).slice(0, 3),
      beautyDetails: (raw.recommendation.beautyDetails ?? []).slice(0, 3),
      moodDetails: (raw.recommendation.moodDetails ?? []).slice(0, 3),
      photoDirection: (raw.recommendation.photoDirection ?? []).slice(0, 3),
      avoidDetails: (raw.recommendation.avoidDetails ?? []).slice(0, 3),
      shoppingKeywords: (raw.recommendation.shoppingKeywords ?? []).slice(0, 5)
    },
    dissonance: {
      ...raw.dissonance,
      gapScore: clampScore(raw.dissonance.gapScore)
    }
  };
}

function clampScore(value: number) {
  if (!Number.isFinite(value)) {
    return 50;
  }

  return Math.max(0, Math.min(100, Math.round(value)));
}

function getConfiguredAnalysisModel(robot: ReturnType<typeof getRobotByDepth>) {
  const perDepth = {
    detail: process.env.OPENAI_DETAIL_MODEL,
    standard: process.env.OPENAI_STANDARD_MODEL,
    quick: process.env.OPENAI_QUICK_MODEL
  }[robot.id];

  return perDepth || process.env.OPENAI_ANALYSIS_MODEL_OVERRIDE || robot.model;
}

function getConfiguredImageModel(robot: ReturnType<typeof getRobotByDepth>) {
  const perDepth = {
    detail: process.env.OPENAI_DETAIL_IMAGE_MODEL,
    standard: process.env.OPENAI_STANDARD_IMAGE_MODEL,
    quick: process.env.OPENAI_QUICK_IMAGE_MODEL
  }[robot.id];

  return perDepth || process.env.OPENAI_IMAGE_MODEL_OVERRIDE || robot.imageModel;
}

function buildVisualRequests(report: ReportData): Array<{
  id: string;
  section: string;
  title: string;
  caption: string;
  fallback: ReportVisualSlot["fallbackVisualType"];
  prompt: string;
}> {
  const palette = report.color.palette.join(", ");
  const keywords = report.profile.keywords.join(", ");

  return [
    {
      id: "hairMakeup",
      section: "헤어와 메이크업",
      title: "추천 헤어와 메이크업 레퍼런스",
      caption: "추천 헤어 길이, 앞머리, 피부 표현과 눈매 포인트를 한 장으로 정리한 AI 레퍼런스입니다.",
      fallback: "makeup",
      prompt: `
Create a premium Korean personal styling report reference board.
Subject matter: women's hairstyle and makeup recommendations, not the uploaded person.
Show 4 editorial tiles: recommended hair length, bangs direction, skin finish, eye makeup direction.
Hair direction: ${report.recommendation.hair}.
Makeup direction: ${report.recommendation.makeup}.
Color mood: ${report.color.seasonLabel}, ${report.color.undertone}, palette ${palette}.
Style keywords: ${keywords}.
Clean ivory report background, soft rose accent, realistic beauty reference photography, no text, no logos, no before-after transformation.
`.trim()
    },
    {
      id: "fashionMood",
      section: "패션 무드",
      title: "추천 의상 룩북",
      caption: "추천 무드와 의상 요소를 룩북처럼 보여주는 AI 스타일 카드입니다.",
      fallback: "moodboard",
      prompt: `
Create a refined women's outfit lookbook moodboard for a Korean personal styling report.
Show 3 outfit cards: soft minimal, clean feminine, natural elegant.
Include tops, bottoms, dress or skirt, outerwear, bag, shoes, and accessories.
Outfit guidance: ${(report.recommendation.outfitDetails ?? []).join(", ")}.
Mood: ${report.recommendation.profileMood}.
Color palette: ${palette}.
Premium editorial layout, ivory paper, dusty rose accents, realistic fashion references, no text, no logos, do not depict the uploaded person.
`.trim()
    },
    {
      id: "styleSummary",
      section: "최종 스타일 요약",
      title: "최종 스타일 공식 보드",
      caption: "컬러, 헤어, 메이크업, 패션 무드를 한 번에 보는 최종 AI 보드입니다.",
      fallback: "summary",
      prompt: `
Create one premium personal styling summary board.
Include color swatches, hair reference, makeup textures, and outfit mood elements.
Persona: ${report.profile.persona}.
Keywords: ${keywords}.
Best tone: ${report.color.seasonLabel}, ${report.color.undertone}.
Hair: ${report.recommendation.hair}.
Makeup: ${report.recommendation.makeup}.
Fashion mood: ${report.recommendation.profileMood}.
Minimal luxury Korean styling PDF aesthetic, no text, no logos, no medical or psychological imagery, do not recreate the uploaded person.
`.trim()
    }
  ];
}

async function generateVisualSlot(
  client: OpenAI,
  model: string,
  quality: "low" | "medium" | "high",
  request: ReturnType<typeof buildVisualRequests>[number]
): Promise<{ visual?: ReportVisualSlot; diagnostic: ImageGenerationDiagnostic }> {
  try {
    const result = await client.images.generate({
      model,
      prompt: request.prompt,
      size: "1024x1024",
      quality
    });
    const base64Image = result.data?.[0]?.b64_json;

    if (!base64Image) {
      return {
        diagnostic: {
          section: request.section,
          ok: false,
          model,
          error: "이미지 API 응답에 b64_json이 없습니다."
        }
      };
    }

    return {
      visual: {
        id: request.id,
        section: request.section,
        imageType: request.fallback,
        imageTitle: request.title,
        imagePrompt: request.prompt,
        imageCaption: request.caption,
        imageUrl: `data:image/png;base64,${base64Image}`,
        generatedImageUrl: `data:image/png;base64,${base64Image}`,
        fallbackType: request.fallback,
        fallbackVisualType: request.fallback,
        referenceImages: []
      },
      diagnostic: {
        section: request.section,
        ok: true,
        model
      }
    };
  } catch (error) {
    return {
      diagnostic: {
        section: request.section,
        ok: false,
        model,
        error: error instanceof Error ? error.message : "알 수 없는 이미지 생성 오류"
      }
    };
  }
}

export async function analyzeWithOpenAI(payload: AnalysisPayload): Promise<AnalysisResponse> {
  const client = getOpenAIClient();
  const selectedRobot = getRobotByDepth(payload.analysisDepth);

  if (!client) {
      return {
        report: buildFallbackReport(payload),
        diagnostics: {
          usedLiveAnalysis: false,
          storedInFirebase: false,
          generatedMoodboard: false,
          generatedVisuals: 0
        }
      };
  }

  const analysisModel = getConfiguredAnalysisModel(selectedRobot);
  const imageModel = getConfiguredImageModel(selectedRobot);

  try {
    const dataUrl = `data:${payload.imageMimeType};base64,${payload.imageBase64}`;
    const response = await client.responses.create({
      model: analysisModel,
      reasoning: {
        effort: selectedRobot.id === "detail" ? "high" : selectedRobot.id === "quick" ? "low" : "medium"
      },
      text: {
        format: {
          type: "json_schema",
          name: "mirror_inner_report",
          strict: true,
          schema: reportSchema
        }
      } as never,
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: getAnalysisPrompt(payload)
            },
            {
              type: "input_image",
              image_url: dataUrl,
              detail: selectedRobot.id === "quick" ? "low" : "high"
            }
          ]
        }
      ]
    });

    const parsed = JSON.parse(response.output_text) as ReportData;
    const report = normalizeReport(parsed);
    report.analysisDepth = selectedRobot.id;
    report.robotName = selectedRobot.name;

    const visualResults: Awaited<ReturnType<typeof generateVisualSlot>>[] = [];
    for (const request of buildVisualRequests(report)) {
      visualResults.push(
        await generateVisualSlot(client, imageModel, selectedRobot.imageQuality, request)
      );
    }
    const sectionVisuals = visualResults
      .map((result) => result.visual)
      .filter((visual): visual is ReportVisualSlot => Boolean(visual));
    const imageGeneration = visualResults.map((result) => result.diagnostic);

    report.visuals = {
      ...(report.visuals ?? {}),
      sectionVisuals,
      visuals: sectionVisuals,
      generatedImageUrl: sectionVisuals[0]?.generatedImageUrl ?? null,
      imagePrompt: sectionVisuals[0]?.imagePrompt ?? report.recommendation.moodboardPrompt,
      imageCaption: sectionVisuals[0]?.imageCaption ?? "AI 추천 스타일 보드",
      fallbackVisualType: sectionVisuals[0]?.fallbackVisualType ?? "moodboard"
    };

    if (sectionVisuals[1]?.generatedImageUrl) {
      report.generatedImage = {
        alt: `${report.profile.persona} outfit moodboard`,
        dataUrl: sectionVisuals[1].generatedImageUrl
      };
    }

    return {
      report,
      diagnostics: {
        usedLiveAnalysis: true,
        storedInFirebase: false,
        generatedMoodboard: sectionVisuals.length > 0,
        generatedVisuals: sectionVisuals.length,
        imageGeneration
      }
    };
  } catch {
    return {
      report: buildFallbackReport(payload),
      diagnostics: {
        usedLiveAnalysis: false,
        storedInFirebase: false,
        generatedMoodboard: false,
        generatedVisuals: 0
      }
    };
  }
}

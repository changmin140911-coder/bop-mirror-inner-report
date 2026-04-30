import OpenAI from "openai";
import {
  buildFallbackReport,
  getRobotByDepth,
  type AnalysisPayload,
  type AnalysisResponse,
  type ReportData
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
      required: ["faceShapeLabel", "proportion", "lineTypeLabel", "scores", "moodDescriptors"],
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
        }
      }
    },
    color: {
      type: "object",
      additionalProperties: false,
      required: ["seasonLabel", "undertone", "palette", "avoid", "note"],
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
        note: { type: "string" }
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
        "photoDirection"
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
        }
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
      avoid: safeAvoid
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

export async function analyzeWithOpenAI(payload: AnalysisPayload): Promise<AnalysisResponse> {
  const client = getOpenAIClient();
  const selectedRobot = getRobotByDepth(payload.analysisDepth);

  if (!client) {
    return {
      report: buildFallbackReport(payload),
      diagnostics: {
        usedLiveAnalysis: false,
        storedInFirebase: false,
        generatedMoodboard: false
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

    try {
      const imageResult = await client.images.generate({
        model: imageModel,
        prompt: `${report.recommendation.moodboardPrompt}
Create a refined women's styling moodboard with realistic editorial references:
1. outfit texture and silhouette
2. makeup color story
3. hairstyle mood
4. atmosphere and location inspiration
Do not recreate or identify the uploaded person. Do not imply medical or psychological diagnosis.`,
        size: "1536x1024",
        quality: selectedRobot.imageQuality
      });

      const base64Image = imageResult.data?.[0]?.b64_json;
      if (base64Image) {
        report.generatedImage = {
          alt: `${report.profile.persona} moodboard`,
          dataUrl: `data:image/png;base64,${base64Image}`
        };
      }
    } catch {
      report.generatedImage = undefined;
    }

    return {
      report,
      diagnostics: {
        usedLiveAnalysis: true,
        storedInFirebase: false,
        generatedMoodboard: Boolean(report.generatedImage?.dataUrl)
      }
    };
  } catch {
    return {
      report: buildFallbackReport(payload),
      diagnostics: {
        usedLiveAnalysis: false,
        storedInFirebase: false,
        generatedMoodboard: false
      }
    };
  }
}

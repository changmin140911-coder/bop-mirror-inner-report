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
      required: ["hair", "makeup", "profileMood", "narrative", "moodboardPrompt"],
      properties: {
        hair: { type: "string" },
        makeup: { type: "string" },
        profileMood: { type: "string" },
        narrative: { type: "string" },
        moodboardPrompt: { type: "string" }
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

  return `
You are creating a premium visual branding report in Korean.
You must not infer mental health, morality, or hidden pathology from the face.
Use the image only for visual branding analysis such as shape, proportion, line quality, and color temperature.
Use the questionnaire only as self-reported preference and expression data.
Keep the tone professional, aesthetic, warm, and easy for women in their 20s to read.
Prefer natural Korean labels over English jargon. For example, do not use labels like "Structured Elegant" as the main persona name.
Return valid JSON that matches the schema exactly.

Brand focus:
${payload.brandFocus || "없음"}

Self-reported gender or styling context:
${payload.gender || "미응답"}

Selected analysis robot:
${robot.name} (${robot.nickname})
${robot.description}
${robot.promise}

Questionnaire:
${questionnaireSummary}

Report rules:
- profile.keywords must contain exactly 4 concise Korean phrases.
- proportion values should be realistic percentages that sum to about 100.
- scores should be 0-100.
- color.palette and color.avoid must be hex strings.
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

  const analysisModel = process.env.OPENAI_ANALYSIS_MODEL_OVERRIDE || selectedRobot.model;
  const imageModel = process.env.OPENAI_IMAGE_MODEL_OVERRIDE || "gpt-image-2";

  try {
    const dataUrl = `data:${payload.imageMimeType};base64,${payload.imageBase64}`;
    const response = await client.responses.create({
      model: analysisModel,
      reasoning: {
        effort: selectedRobot.id === "detail" ? "high" : "medium"
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
        prompt: report.recommendation.moodboardPrompt,
        size: "1536x1024",
        quality: selectedRobot.id === "quick" ? "low" : "medium"
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

import type { QuestionnaireAnswer, ReportData, ReportVisualSlot } from "@/lib/report-types";

type ToneLevel = "추천" | "주의" | "비추천";

export type FitCard = {
  title: string;
  label: ToneLevel;
  body: string;
  score?: number;
};

export type VisualCard = {
  title: string;
  label: string;
  body: string;
  tone?: string;
  items?: string[];
};

export type ColorToken = {
  name: string;
  hex: string;
  description: string;
};

export type ReportPageModel = {
  isMaleStyling: boolean;
  clientName: string;
  clientInitial: string;
  createdLabel: string;
  keywords: string[];
  summarySentence: string;
  visuals: {
    sourceUserImage?: string | null;
    heroImage?: string | null;
    moodboardImage?: string | null;
    sections: Record<string, ReportVisualSlot>;
  };
  overview: {
    title: string;
    body: string;
  }[];
  imageDiagnosis: {
    impression: string;
    mood: string[];
    strengths: string[];
    balance: string;
  };
  innerPreference: {
    goal: string;
    desire: string;
    direction: string;
    answerHighlights: string[];
    preferenceCards: { title: string; body: string }[];
  };
  faceBalance: {
    shape: string;
    line: string;
    proportionLabel: string;
    proportion: { label: string; value: number }[];
    comment: string;
  };
  features: {
    title: string;
    body: string;
  }[];
  hairLength: {
    recommended: string;
    reason: string;
    caution: string;
    recommendedStyles: VisualCard[];
    avoidStyles: VisualCard[];
  };
  bangs: FitCard[];
  hairAvoid: {
    title: string;
    body: string;
  }[];
  baseMakeup: FitCard[];
  eyeMakeup: {
    title: string;
    body: string;
  }[];
  contour: {
    title: string;
    body: string;
  }[];
  fashionMoods: {
    name: string;
    reason: string;
    items: string[];
    imageTitle: string;
    visualTone: string;
  }[];
  neckline: {
    recommended: string[];
    avoid: string[];
    reason: string;
  };
  color: {
    season: string;
    undertone: string;
    palette: string[];
    avoid: string[];
    bestUse: string[];
    textures: string[];
    note: string;
    palettes: {
      base: ColorToken[];
      point: ColorToken[];
      avoid: ColorToken[];
    };
  };
  finalSummary: {
    hair: string;
    makeup: string;
    fashion: string;
    color: string;
    image: string;
    next: string;
  };
};

const fallbackNotice = "분석 데이터가 부족해 기본 제안으로 정리했어요.";

const valueStories: Record<string, string> = {
  refined: "정돈된 완성도와 고급스러운 신뢰감을 중요하게 여기는 흐름",
  distinctive: "기억에 남는 고유한 감각과 선명한 인상을 원하는 흐름",
  warm: "편안하고 자연스럽게 다가가는 분위기를 선호하는 흐름",
  trust: "상대가 안심할 수 있는 안정적인 이미지를 원하는 흐름",
  expression: "자기 색과 표현력이 더 살아나기를 바라는 흐름",
  balance: "조화롭고 무리 없는 균형감을 중요하게 보는 흐름",
  structure: "기준과 완성도를 바탕으로 이미지를 정리하려는 흐름",
  meaning: "나다운 의미와 취향이 스타일에 담기기를 원하는 흐름",
  authority: "전문성과 존재감이 또렷하게 보이기를 원하는 흐름",
  distant: "차갑거나 멀어 보이는 인상을 줄이고 싶은 흐름",
  safe: "너무 튀지 않되 묻히지 않는 안정적인 변화를 원하는 흐름",
  blurred: "장점이 흐려지지 않고 선명하게 읽히기를 바라는 흐름",
  natural: "꾸민 느낌보다 자연스러운 나다움을 선호하는 흐름",
  poetic: "분위기와 감정의 결이 살아 있는 스타일을 좋아하는 흐름",
  editorial: "사진 속에서 세련된 에디토리얼 무드를 원하는 흐름"
};

function safeText(value: string | undefined | null, fallback = fallbackNotice) {
  const text = value?.trim();
  return text && text.length > 0 ? text : fallback;
}

function isMaleReport(report: ReportData) {
  return /남|male|man|men/i.test(report.intake?.gender ?? "");
}

function clampPercent(value: number | undefined) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, Math.round(value ?? 50)));
}

function dedupe(items: string[]) {
  return Array.from(new Set(items.map((item) => item.trim()).filter(Boolean)));
}

function takeFilled(items: Array<string | undefined> | undefined, fallback: string[], count: number) {
  const filledItems = (items ?? []).filter((item): item is string => Boolean(item));
  const merged = dedupe([...filledItems, ...fallback]);
  return merged.slice(0, count);
}

function getInitial(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "BOP";
  return trimmed
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 3)
    .toUpperCase();
}

function formatDate(value?: string) {
  if (!value) return "Personal Report";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Personal Report";
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }).format(date);
}

function getTopAnswers(answers: QuestionnaireAnswer[] | undefined) {
  const counts = new Map<string, number>();
  for (const answer of answers ?? []) {
    counts.set(answer.value, (counts.get(answer.value) ?? 0) + 1);
  }

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([value, count]) => ({
      value,
      count,
      story: valueStories[value] ?? `${value} 성향이 반복적으로 선택된 흐름`
    }));
}

function pickAnswerLabels(answers: QuestionnaireAnswer[] | undefined, ids: string[]) {
  const byId = new Map((answers ?? []).map((answer) => [answer.id, answer]));
  return ids
    .map((id) => byId.get(id))
    .filter(Boolean)
    .map((answer) => `${answer!.prompt} ${answer!.label}`);
}

function makeVisualSlot(
  id: string,
  section: string,
  imagePrompt: string,
  imageCaption: string,
  fallbackVisualType: ReportVisualSlot["fallbackVisualType"],
  generatedImageUrl?: string | null
): ReportVisualSlot {
  return {
    id,
    section,
    imageType: fallbackVisualType,
    imageTitle: section,
    imagePrompt,
    imageCaption,
    imageUrl: generatedImageUrl ?? null,
    generatedImageUrl: generatedImageUrl ?? null,
    fallbackType: fallbackVisualType,
    fallbackVisualType,
    referenceImages: []
  };
}

function makeSectionVisuals(report: ReportData) {
  const existingVisuals = [
    ...(report.visuals?.sectionVisuals ?? []),
    ...(report.visuals?.visuals ?? [])
  ];
  const existing = new Map(existingVisuals.map((visual) => [visual.id, visual]));
  const moodboard = report.generatedImage?.dataUrl ?? report.visuals?.generatedImageUrl ?? null;
  const persona = safeText(report.profile.persona, "개인 스타일링");
  const tone = safeText(report.color.seasonLabel, "추천 컬러");
  const hair = safeText(report.recommendation.hair, "추천 헤어");
  const isMale = isMaleReport(report);
  const hairPrompt = isMale
    ? `Korean men's haircut and grooming reference board for ${hair}, premium barber and salon report style. No dresses, skirts, feminine bangs, or heavy makeup.`
    : `Korean personal hair reference board for ${hair}, premium salon report style.`;
  const bangsPrompt = isMale
    ? "Visual comparison cards for men's front hair and parting: dandy fringe, comma hair, side part, leaf bang, open forehead."
    : "Visual comparison cards for see-through bangs, side bangs, curtain bangs, full bangs, no bangs.";
  const makeupPrompt = isMale
    ? `Men's grooming finish reference for ${tone}: clean skin tone, eyebrow grooming, lip balm, shaving or beard line care.`
    : `Skin finish mood reference for ${tone}, semi-glow, soft matte, clean base.`;
  const eyePrompt = isMale
    ? "Men's facial detail grooming direction with eyebrow shape, clean under-eye tone, and natural feature clarity."
    : "Soft Korean eye makeup direction with natural shadow, thin eyeliner, clean lashes.";

  const defaults = [
    makeVisualSlot(
      "cover",
      "커버",
      `Use the user's representative analysis photo with ${persona} editorial styling keywords.`,
      "분석에 사용된 대표 이미지",
      "user-photo",
      report.visuals?.heroImage ?? report.visuals?.sourceUserImage ?? null
    ),
    makeVisualSlot(
      "diagnosis",
      "전체 이미지 진단",
      `Premium face image analysis board showing mood keywords: ${report.profile.keywords.join(", ")}.`,
      "분석 결과를 요약한 분위기 보드",
      "diagram"
    ),
    makeVisualSlot(
      "hairLength",
      "헤어 길이 가이드",
      hairPrompt,
      "추천 헤어 길이 예시",
      "hair"
    ),
    makeVisualSlot(
      "bangs",
      "앞머리 가이드",
      bangsPrompt,
      "앞머리 유형별 적합도 카드",
      "bangs"
    ),
    makeVisualSlot(
      "hairAvoid",
      "헤어 비추천 가이드",
      "Small thumbnail cards showing heavy bangs, face-covering hair, and overly strong curls as avoid examples.",
      "강도를 줄이면 좋은 헤어 요소",
      "hair"
    ),
    makeVisualSlot(
      "baseMakeup",
      isMale ? "피부와 그루밍" : "베이스 메이크업",
      makeupPrompt,
      isMale ? "피부 정돈과 그루밍 질감 예시" : "피부 표현 질감 예시",
      "makeup"
    ),
    makeVisualSlot(
      "eyeMakeup",
      isMale ? "눈썹과 인상 정돈" : "아이 메이크업",
      eyePrompt,
      isMale ? "눈썹과 눈가를 정돈하는 방향" : "눈매를 살리는 메이크업 방향",
      "eye"
    ),
    makeVisualSlot(
      "fashionMood",
      "패션 무드",
      report.recommendation.moodboardPrompt,
      "AI 추천 스타일 무드보드",
      "moodboard",
      moodboard
    ),
    makeVisualSlot(
      "neckline",
      "넥라인 가이드",
      "Minimal neckline diagram cards for recommended and caution neckline shapes.",
      "얼굴형과 연결되는 넥라인 도식",
      "neckline"
    ),
    makeVisualSlot(
      "color",
      "컬러 가이드",
      `Premium color palette card for ${tone} and ${report.color.undertone}.`,
      "추천 컬러 팔레트",
      "palette"
    ),
    makeVisualSlot(
      "summary",
      "최종 요약",
      `Final personal styling summary board using user's photo, ${persona}, hair, makeup, fashion and color.`,
      "기준 이미지와 추천 공식을 함께 정리한 최종 보드",
      "summary",
      report.visuals?.sourceUserImage ?? null
    )
  ];

  return {
    ...Object.fromEntries(defaults.map((visual) => [visual.id, visual])),
    ...Object.fromEntries(existingVisuals.map((visual) => [visual.id, visual]))
  };
}

function makeHairLength(report: ReportData) {
  const shape = report.mirror.faceShapeLabel;
  const line = report.mirror.lineTypeLabel;
  const hair = safeText(report.recommendation.hair, "얼굴선을 자연스럽게 감싸는 미디엄 길이를 기본으로 추천해요.");
  const isMale = isMaleReport(report);

  const isRound = /라운드|둥근|원형/.test(shape);
  const isLong = /긴|장방|세로/.test(shape);
  const isSharp = /직선|선명|날카/.test(line);

  if (isMale) {
    if (isLong) {
      return {
        recommended: "옆 볼륨은 낮추고 앞머리는 가볍게 여는 미디엄 쇼트",
        reason: `${hair} 세로감이 길게 읽히는 인상은 옆선보다 이마와 턱선 주변의 여백을 정돈할 때 훨씬 안정적으로 보입니다.`,
        caution: "윗볼륨만 강하거나 얼굴을 길게 덮는 앞머리는 세로감을 더 키울 수 있어요.",
        recommendedStyles: [
          { title: "댄디 가르마", label: "추천", body: "이마를 일부 열어 답답함을 줄이고 정돈된 신뢰감을 살립니다.", tone: "charcoal" },
          { title: "소프트 다운펌", label: "추천", body: "옆선 볼륨을 낮춰 얼굴 비율이 더 깔끔하게 정리됩니다.", tone: "sage" },
          { title: "리프 컷 포인트", label: "주의", body: "앞머리 길이는 눈을 덮지 않는 선에서 가볍게 조절하는 편이 좋습니다.", tone: "sand" }
        ],
        avoidStyles: [
          { title: "탑 볼륨 과다", label: "주의", body: "윗부분만 높으면 얼굴이 더 길게 보일 수 있습니다.", tone: "mute" },
          { title: "긴 덮은 앞머리", label: "주의", body: "눈 주변이 가려져 장점보다 답답함이 먼저 보일 수 있습니다.", tone: "mute" }
        ]
      };
    }

    if (isRound) {
      return {
        recommended: "이마를 살짝 열어 세로선을 만드는 댄디 쇼트",
        reason: `${hair} 둥근 여백은 얼굴을 덮기보다 가르마와 옆선 정돈으로 세로 흐름을 만들 때 더 선명하게 보입니다.`,
        caution: "볼 주변을 둥글게 감싸는 무거운 앞머리와 옆볼륨은 얼굴 폭을 더 넓게 보이게 할 수 있어요.",
        recommendedStyles: [
          { title: "애즈펌", label: "추천", body: "앞머리를 자연스럽게 나눠 얼굴 중심을 길고 또렷하게 보여줍니다.", tone: "soft" },
          { title: "아이비리그 컷", label: "추천", body: "깔끔한 라인으로 남성적인 단정함과 활동성을 함께 줍니다.", tone: "charcoal" },
          { title: "다운펌 정돈", label: "포인트", body: "옆머리를 눌러 얼굴 주변 실루엣을 날렵하게 정리합니다.", tone: "sage" }
        ],
        avoidStyles: [
          { title: "둥근 볼륨펌", label: "주의", body: "볼 옆에 부피가 생기면 인상이 둥글고 무거워질 수 있습니다.", tone: "mute" },
          { title: "두꺼운 일자 앞머리", label: "비추천", body: "얼굴 중심이 닫혀 답답해 보이기 쉽습니다.", tone: "mute" }
        ]
      };
    }

    if (isSharp) {
      return {
        recommended: "결이 정돈된 가르마 컷 또는 소프트 크롭",
        reason: `${hair} 선명한 인상은 헤어의 윤곽을 깔끔하게 잡고 질감을 과하게 흩뜨리지 않을 때 전문적으로 보입니다.`,
        caution: "너무 거친 질감이나 강한 컬은 이미 가진 선명함을 과하게 보이게 만들 수 있어요.",
        recommendedStyles: [
          { title: "가르마 컷", label: "추천", body: "정돈된 선이 신뢰감과 세련미를 안정적으로 강화합니다.", tone: "charcoal" },
          { title: "소프트 크롭", label: "추천", body: "짧지만 날카롭지 않게 정리해 깔끔한 인상을 만듭니다.", tone: "soft" },
          { title: "내추럴 텍스처", label: "포인트", body: "제품은 매트하게, 결은 과하지 않게 살리는 편이 좋습니다.", tone: "sage" }
        ],
        avoidStyles: [
          { title: "강한 스핀 컬", label: "주의", body: "얼굴보다 헤어 질감이 먼저 보여 인상이 산만해질 수 있습니다.", tone: "mute" },
          { title: "과한 투블럭 대비", label: "주의", body: "옆선 대비가 강하면 차가운 느낌이 커질 수 있습니다.", tone: "mute" }
        ]
      };
    }

    return {
      recommended: "정돈된 댄디 컷과 자연스러운 가르마",
      reason: `${hair} 현재 분석값 기준으로 얼굴의 균형과 분위기를 가장 안정적으로 살리는 남성 헤어 방향입니다.`,
      caution: "얼굴을 크게 덮는 앞머리보다 이마와 눈썹 주변을 살짝 열어주는 쪽이 더 깔끔합니다.",
      recommendedStyles: [
        { title: "댄디 컷", label: "추천", body: "부담 없이 단정하고, 대부분의 옷 스타일과 안정적으로 연결됩니다.", tone: "soft" },
        { title: "가르마 펌", label: "추천", body: "정면 인상을 답답하지 않게 열어 세련된 분위기를 만듭니다.", tone: "charcoal" },
        { title: "다운펌", label: "포인트", body: "옆머리 실루엣을 낮춰 전체 비율을 정돈합니다.", tone: "sage" }
      ],
      avoidStyles: [
        { title: "무거운 덮은 앞머리", label: "주의", body: "눈매와 얼굴 중심이 가려져 인상이 답답해질 수 있습니다.", tone: "mute" },
        { title: "과한 컬 볼륨", label: "주의", body: "헤어가 먼저 보이면 얼굴의 장점이 덜 읽힐 수 있습니다.", tone: "mute" }
      ]
    };
  }

  if (isLong) {
    return {
      recommended: "쇄골선에서 가슴 위로 이어지는 미디엄 길이",
      reason: `${hair} 세로감이 길게 이어지는 인상은 옆 볼륨과 레이어가 더해질 때 얼굴의 여백이 부드럽게 정리됩니다.`,
      caution: "턱 아래로 곧게 떨어지는 아주 긴 생머리는 세로감을 더 강조할 수 있어요.",
      recommendedStyles: [
        { title: "미디엄 레이어드", label: "추천", body: "옆 볼륨과 턱선 아래 흐름을 만들어 세로감을 부드럽게 나눕니다.", tone: "soft" },
        { title: "페이스 라인 컷", label: "추천", body: "얼굴 주변에 가벼운 층을 두어 시선을 중앙으로 모아줍니다.", tone: "rose" },
        { title: "내추럴 웨이브", label: "포인트", body: "강한 컬보다 큰 흐름의 웨이브가 분위기를 편안하게 만듭니다.", tone: "sage" }
      ],
      avoidStyles: [
        { title: "일자 장발", label: "주의", body: "세로선을 더 길게 보여 얼굴 여백이 커 보일 수 있습니다.", tone: "mute" },
        { title: "탑 볼륨 과다", label: "주의", body: "윗부분만 높아지면 비율이 위로 길어 보입니다.", tone: "mute" }
      ]
    };
  }

  if (isRound) {
    return {
      recommended: "턱선을 살짝 지나 어깨에 닿는 레이어드 길이",
      reason: `${hair} 얼굴선을 모두 가리기보다 바깥 윤곽을 세로로 열어주면 맑고 세련된 느낌이 살아납니다.`,
      caution: "볼 주변에만 짧고 무거운 볼륨이 모이면 인상이 답답해 보일 수 있어요.",
      recommendedStyles: [
        { title: "중단발 레이어드", label: "추천", body: "턱선 아래로 시선을 내려 얼굴 주변을 가볍게 정리합니다.", tone: "sage" },
        { title: "사이드 볼륨", label: "추천", body: "정면을 가리지 않고 옆선에 흐름을 만들어 인상을 맑게 엽니다.", tone: "rose" },
        { title: "노뱅 미디엄", label: "포인트", body: "이마와 중심을 열어 얼굴빛과 컬러 포인트가 잘 보입니다.", tone: "sky" }
      ],
      avoidStyles: [
        { title: "볼 주변 무거운 컬", label: "주의", body: "얼굴 폭이 더 답답하게 보일 수 있습니다.", tone: "mute" },
        { title: "두꺼운 턱선 단발", label: "주의", body: "시선이 볼과 턱에 머물러 전체가 무거워 보입니다.", tone: "mute" }
      ]
    };
  }

  if (isSharp) {
    return {
      recommended: "결이 정돈된 미디엄 롱 또는 세미 롱",
      reason: `${hair} 선명한 선감은 깔끔한 길이와 은은한 결 표현을 만났을 때 더 고급스럽게 보입니다.`,
      caution: "너무 짧고 강한 층은 이미 가진 선명함을 과하게 보이게 만들 수 있어요.",
      recommendedStyles: [
        { title: "미디엄 롱 스트레이트", label: "추천", body: "정돈된 결이 선명한 인상을 고급스럽게 보여줍니다.", tone: "charcoal" },
        { title: "소프트 C컬", label: "추천", body: "끝선만 둥글게 정리해 차가운 느낌을 낮춰줍니다.", tone: "rose" },
        { title: "사이드 파트", label: "포인트", body: "직선적인 분위기에 여백과 입체감을 더합니다.", tone: "sage" }
      ],
      avoidStyles: [
        { title: "짧은 샤기 레이어", label: "주의", body: "선이 과하게 분산되어 인상이 날카로워질 수 있습니다.", tone: "mute" },
        { title: "강한 히피펌", label: "주의", body: "얼굴의 정돈된 분위기보다 컬이 먼저 보일 수 있습니다.", tone: "mute" }
      ]
    };
  }

  return {
    recommended: "어깨선 전후의 미디엄 레이어드",
    reason: `${hair} 현재 분석값 기준으로 얼굴형과 분위기 모두를 안정적으로 살리는 길이입니다.`,
    caution: "얼굴을 많이 덮는 무거운 기장보다 목선과 턱선을 살짝 열어주는 쪽이 좋습니다.",
    recommendedStyles: [
      { title: "미디엄 레이어드", label: "추천", body: "얼굴선과 목선을 동시에 정리하는 안정적인 길이입니다.", tone: "sage" },
      { title: "자연 웨이브", label: "추천", body: "부드러운 움직임을 만들어 분위기를 더 여성스럽게 보여줍니다.", tone: "rose" },
      { title: "가벼운 사이드뱅", label: "포인트", body: "얼굴을 가리지 않고 시선을 사선으로 정리합니다.", tone: "sky" }
    ],
    avoidStyles: [
      { title: "무거운 풀뱅", label: "주의", body: "중심이 닫혀 전체 이미지가 답답해질 수 있습니다.", tone: "mute" },
      { title: "과한 컬 볼륨", label: "주의", body: "얼굴보다 헤어가 먼저 보일 수 있어 강도 조절이 필요합니다.", tone: "mute" }
    ]
  };
}

function makeBangs(report: ReportData): FitCard[] {
  const line = report.mirror.lineTypeLabel;
  const softness = clampPercent(report.mirror.scores.softness);
  const clarity = clampPercent(report.mirror.scores.clarity);
  const hasCurve = /곡선|부드/.test(line);
  const hasStraight = /직선|선명|날카/.test(line);
  const isMale = isMaleReport(report);

  if (isMale) {
    return [
      {
        title: "가르마 앞머리",
        label: "추천",
        score: 88,
        body: "이마를 일부 열어 눈썹과 얼굴 중심이 보이게 하면 단정함과 세련미가 함께 살아납니다."
      },
      {
        title: "댄디 프린지",
        label: softness >= 60 ? "추천" : "주의",
        score: softness >= 60 ? 84 : 68,
        body: "앞머리를 가볍게 내려도 눈을 덮지 않는 길이를 유지하면 부드러움은 살고 답답함은 줄어듭니다."
      },
      {
        title: "리프뱅",
        label: clarity >= 70 ? "추천" : "주의",
        score: clarity >= 70 ? 82 : 66,
        body: "옆으로 흐르는 결이 얼굴선을 자연스럽게 정리하지만, 길이가 길면 눈매가 가려질 수 있어요."
      },
      {
        title: "크롭 앞머리",
        label: hasStraight ? "추천" : "주의",
        score: hasStraight ? 80 : 64,
        body: "짧고 깔끔한 앞머리는 선명한 인상을 정돈해 주며, 너무 짧게 자르면 강한 느낌이 커질 수 있습니다."
      },
      {
        title: "이마 오픈",
        label: "추천",
        score: 86,
        body: "중요한 자리에서는 이마와 눈썹 라인을 열어두면 신뢰감과 전문성이 더 잘 전달됩니다."
      }
    ];
  }

  return [
    {
      title: "시스루뱅",
      label: softness >= 65 ? "추천" : "주의",
      score: softness >= 65 ? 86 : 68,
      body: hasCurve
        ? "이마를 가볍게 비우는 시스루뱅은 부드러운 선감을 해치지 않으면서 얼굴의 중심을 맑게 잡아줍니다."
        : "가볍게 흩어지는 질감으로만 활용하면 선명한 인상에 부드러운 여백을 더할 수 있습니다."
    },
    {
      title: "사이드뱅",
      label: "추천",
      score: 88,
      body: "옆선으로 자연스럽게 흐르는 앞머리는 얼굴 윤곽을 직접 가리기보다 시선을 사선으로 움직여 분위기를 세련되게 만듭니다."
    },
    {
      title: "커튼뱅",
      label: clarity >= 70 ? "추천" : "주의",
      score: clarity >= 70 ? 84 : 70,
      body: "가르마 주변에 여백을 두는 커튼뱅은 눈매와 광대 라인을 부드럽게 연결해 사진 속 입체감을 살리기 좋습니다."
    },
    {
      title: "풀뱅",
      label: hasStraight ? "주의" : "비추천",
      score: hasStraight ? 58 : 46,
      body: "무겁게 닫히는 풀뱅은 현재 가진 분위기보다 답답한 인상을 만들 수 있어, 숱과 길이를 가볍게 조절하는 편이 좋습니다."
    },
    {
      title: "노뱅",
      label: "추천",
      score: 82,
      body: "이마와 얼굴 중심을 열어두면 전체 이미지가 더 깨끗하게 보이고, 컬러와 메이크업 포인트가 또렷하게 살아납니다."
    }
  ];
}

function makeBaseMakeup(report: ReportData): FitCard[] {
  const clarity = clampPercent(report.mirror.scores.clarity);
  const softness = clampPercent(report.mirror.scores.softness);
  const isMale = isMaleReport(report);

  if (isMale) {
    return [
      {
        title: "세미 매트 피부 정돈",
        label: "추천",
        score: 90,
        body: `${safeText(report.color.undertone, "현재 톤")}이 탁해 보이지 않도록 유분은 낮추고 피부 결은 얇게 정돈하는 방향이 가장 안정적입니다.`
      },
      {
        title: "눈썹 결 정리",
        label: "추천",
        score: clarity >= 70 ? 88 : 78,
        body: "눈썹 아래 라인과 빈 곳만 정리하면 인상이 훨씬 또렷해지고, 과하게 꾸민 느낌 없이 신뢰감이 살아납니다."
      },
      {
        title: "과한 윤광",
        label: softness >= 80 ? "주의" : "비추천",
        score: softness >= 80 ? 62 : 48,
        body: "얼굴 전체가 번들거리면 구조감보다 유분감이 먼저 보일 수 있어 T존과 콧볼 주변은 매트하게 잡는 편이 좋습니다."
      }
    ];
  }

  return [
    {
      title: "세미 글로우",
      label: "추천",
      score: 90,
      body: `${safeText(report.color.undertone, "현재 톤")}의 맑음을 살리면서 피부 결을 과하게 덮지 않아 가장 안정적인 베이스 방향입니다.`
    },
    {
      title: "소프트 매트",
      label: clarity >= 75 ? "추천" : "주의",
      score: clarity >= 75 ? 84 : 68,
      body: "촬영이나 중요한 자리에서는 T존과 얼굴 외곽만 정리해 주면 단정함은 유지되고 건조한 느낌은 줄어듭니다."
    },
    {
      title: "강한 글로우",
      label: softness >= 80 ? "주의" : "비추천",
      score: softness >= 80 ? 62 : 48,
      body: "윤광이 넓게 번지면 얼굴의 구조감보다 번들거림이 먼저 보일 수 있어, 광은 광대 위쪽에만 얇게 두는 편이 좋습니다."
    }
  ];
}

function makeFeatureGuides(report: ReportData) {
  const clues = report.mirror.photoClues ?? [];
  const isMale = isMaleReport(report);
  return [
    {
      title: "눈매",
      body: clues[0] ?? "눈 주변의 대비와 여백을 기준으로 너무 두꺼운 라인보다 결을 살린 음영을 추천합니다."
    },
    {
      title: "코와 중심선",
      body: "중심부는 강하게 바꾸기보다 콧대 양옆의 그림자만 얇게 정리하면 전체 균형이 자연스럽게 살아납니다."
    },
    {
      title: "입술",
      body: isMale
        ? "입술은 색을 크게 올리기보다 건조함과 각질을 정리해 얼굴빛이 피곤해 보이지 않게 만드는 편이 좋습니다."
        : `${safeText(report.recommendation.makeup, "추천 메이크업 방향")}에 맞춰 립은 얼굴빛과 연결되는 톤으로 선택하는 편이 좋습니다.`
    },
    {
      title: "전체 조화감",
      body: safeText(report.mirror.balanceComment, "얼굴의 한 부분을 크게 바꾸기보다 헤어, 톤, 질감을 같은 방향으로 맞추는 것이 좋습니다.")
    }
  ];
}

function makeFashionMoods(report: ReportData) {
  const keywords = report.profile.keywords;
  const outfits = report.recommendation.outfitDetails ?? [];
  const isMale = isMaleReport(report);

  if (isMale) {
    return [
      {
        name: "Clean Smart Casual",
        reason: `${keywords[0] ?? "정돈된 이미지"}를 가장 쉽게 살리는 무드입니다. 셔츠와 슬랙스처럼 선이 깔끔한 아이템은 얼굴의 신뢰감을 바로 올려줍니다.`,
        items: takeFilled(outfits, ["옥스포드 셔츠", "테이퍼드 슬랙스", "로퍼 또는 미니멀 스니커즈"], 3),
        imageTitle: "셔츠와 슬랙스 중심의 스마트 캐주얼",
        visualTone: "charcoal"
      },
      {
        name: "Soft Minimal",
        reason: "장식보다 소재와 핏을 먼저 보여주는 무드라서 과하게 꾸미지 않아도 세련된 인상이 남습니다.",
        items: ["미니멀 니트", "뉴트럴 재킷", "클린 데님"],
        imageTitle: "뉴트럴 니트와 단정한 재킷",
        visualTone: "soft"
      },
      {
        name: "Urban Classic",
        reason: `${safeText(report.recommendation.profileMood, "정돈된 배경과 차분한 조명")}처럼 구조가 있는 연출에서 전문성과 존재감이 선명하게 읽힙니다.`,
        items: ["블레이저", "레더 벨트", "메탈 시계"],
        imageTitle: "블레이저와 클래식 액세서리",
        visualTone: "sage"
      }
    ];
  }

  return [
    {
      name: "Soft Minimal",
      reason: `${keywords[0] ?? "정돈된 이미지"}를 가장 쉽게 살리는 무드입니다. 장식보다 소재와 핏을 먼저 보여주기 때문에 얼굴의 분위기가 깨끗하게 올라옵니다.`,
      items: takeFilled(outfits, ["크림 또는 그레이 톤 니트", "미니멀 재킷", "작은 이어링"], 3),
      imageTitle: "톤온톤 니트와 미니멀 재킷",
      visualTone: "soft"
    },
    {
      name: "Clean Feminine",
      reason: "부드러운 색감과 단정한 실루엣을 함께 쓰면 여성스러운 분위기가 과하지 않고 세련되게 정리됩니다.",
      items: ["새틴 블라우스", "미디 스커트", "로즈 또는 뮤트 톤 립"],
      imageTitle: "새틴 블라우스와 미디 스커트",
      visualTone: "rose"
    },
    {
      name: "Natural Elegant",
      reason: `${safeText(report.recommendation.profileMood, "자연광과 단정한 배경")}처럼 힘을 뺀 연출에서 고급스러운 인상이 오래 남습니다.`,
      items: ["톤온톤 셋업", "얇은 니트", "낮은 채도의 포인트 백"],
      imageTitle: "뉴트럴 셋업과 포인트 백",
      visualTone: "sand"
    }
  ];
}

function makeColorToken(hex: string, index: number, type: "base" | "point" | "avoid"): ColorToken {
  const baseNames = ["페이스 라이트", "소프트 뉴트럴", "무드 베이지", "클린 그레이", "딥 포커스", "새틴 브라운"];
  const pointNames = ["립 포인트", "블러셔 포인트", "액세서리 포인트", "촬영 배경 포인트"];
  const avoidNames = ["탁한 오렌지", "무거운 브라운", "강한 네온", "잿빛 카키"];
  const names = type === "base" ? baseNames : type === "point" ? pointNames : avoidNames;
  const descriptions = {
    base: "얼굴 가까이에 넓게 써도 분위기를 안정적으로 받쳐주는 색입니다.",
    point: "립, 블러셔, 작은 액세서리처럼 작은 면적에 쓰면 인상이 살아납니다.",
    avoid: "얼굴 가까이에 넓게 쓰면 톤이 무거워 보일 수 있어 면적을 줄이는 편이 좋습니다."
  };

  return {
    name: names[index] ?? `${type} color`,
    hex,
    description: descriptions[type]
  };
}

function makeColorPalettes(report: ReportData) {
  const palette = takeFilled(report.color.palette, ["#f3ebe5", "#d8b9b2", "#b98f8a", "#6b5a52"], 6);
  const pointFallback = [palette[1], palette[2], "#c77d84", "#b9d6cb"];
  const avoid = takeFilled(report.color.avoid, ["#bb6725", "#80501c", "#5f6f3d", "#2f3d8f"], 4);

  return {
    base: takeFilled(palette, ["#f3ebe5", "#ded2c8"], 6).map((hex, index) => makeColorToken(hex, index, "base")),
    point: takeFilled(pointFallback, ["#c77d84", "#b9d6cb"], 4).map((hex, index) => makeColorToken(hex, index, "point")),
    avoid: avoid.map((hex, index) => makeColorToken(hex, index, "avoid"))
  };
}

function makeNeckline(report: ReportData) {
  const shape = report.mirror.faceShapeLabel;
  const hasRound = /라운드|둥근|원형/.test(shape);
  const hasLong = /긴|장방|세로/.test(shape);

  if (hasLong) {
    return {
      recommended: ["보트넥", "스퀘어넥", "얕은 라운드넥"],
      avoid: ["깊은 브이넥", "긴 세로 절개가 강한 넥라인"],
      reason: "세로감이 이미 충분한 얼굴형은 목선을 가로로 살짝 열어주면 비율이 부드럽게 안정됩니다."
    };
  }

  if (hasRound) {
    return {
      recommended: ["브이넥", "오픈 칼라", "스윗하트넥"],
      avoid: ["목을 조이는 하이넥", "넓고 무거운 라운드넥"],
      reason: "얼굴 주변에 세로 여백을 만들어주면 윤곽이 가볍게 정리되고 인상이 더 맑아 보입니다."
    };
  }

  return {
    recommended: ["스퀘어넥", "얕은 브이넥", "깔끔한 셔츠 칼라"],
    avoid: ["과하게 높은 하이넥", "얼굴 가까이에 장식이 몰린 넥라인"],
    reason: "현재 얼굴형은 균형감이 좋아 목선을 깔끔하게 정리하는 넥라인이 전체 이미지를 가장 안정적으로 보여줍니다."
  };
}

export function normalizeReportData(report: ReportData): ReportPageModel {
  const answers = report.intake?.answers ?? [];
  const topAnswers = getTopAnswers(answers);
  const clientName = safeText(report.intake?.nickname, "BOP Client");
  const keywords = takeFilled(report.profile.keywords, ["세련미", "균형감", "맑은 분위기", "기억되는 무드"], 4);
  const isMaleStyling = isMaleReport(report);
  const hairLength = makeHairLength(report);
  const neckline = makeNeckline(report);
  const sections = makeSectionVisuals(report);

  return {
    isMaleStyling,
    clientName,
    clientInitial: getInitial(clientName),
    createdLabel: formatDate(report.createdAt),
    keywords,
    summarySentence: safeText(report.profile.summary, "사진과 취향 데이터를 함께 읽어 스타일 방향을 정리한 리포트입니다."),
    visuals: {
      sourceUserImage: report.visuals?.sourceUserImage ?? null,
      heroImage: report.visuals?.heroImage ?? report.visuals?.sourceUserImage ?? null,
      moodboardImage: report.generatedImage?.dataUrl ?? report.visuals?.generatedImageUrl ?? null,
      sections
    },
    overview: [
      {
        title: "Mirror Data",
        body: "업로드한 얼굴 사진에서 보이는 윤곽, 비율, 선의 느낌, 톤 신호를 스타일링 관점으로 읽었습니다."
      },
      {
        title: "Inner Taste",
        body: answers.length
          ? `${answers.length}개의 취향 답변을 함께 반영해 원하는 이미지와 스타일 욕구를 정리했습니다.`
          : "취향 원문 데이터가 없어 AI가 요약한 내면 취향 값을 중심으로 정리했습니다."
      },
      {
        title: "Brand Direction",
        body: safeText(report.intake?.brandFocus, safeText(report.inner.brandNeed, "현재 이미지가 더 선명하게 읽히도록 스타일 방향을 제안합니다."))
      }
    ],
    imageDiagnosis: {
      impression: safeText(report.profile.archetypeLine, report.profile.persona),
      mood: takeFilled(report.mirror.moodDescriptors, keywords, 6),
      strengths: takeFilled(
        [report.mirror.balanceComment, report.recommendation.narrative, report.dissonance.recommendation],
        ["얼굴의 한 부분보다 전체 무드가 함께 읽히는 타입입니다.", "컬러와 헤어 결을 맞추면 고급스러움이 선명해집니다."],
        4
      ),
      balance: safeText(report.mirror.balanceComment)
    },
    innerPreference: {
      goal: safeText(report.intake?.brandFocus, safeText(report.inner.brandNeed)),
      desire: safeText(report.inner.expressionDesire),
      direction: safeText(report.dissonance.recommendation),
      answerHighlights: takeFilled(
        pickAnswerLabels(answers, ["presence", "energy", "hidden_wish", "style_fear", "final_direction"]),
        [report.inner.expressionDesire, report.inner.brandNeed, report.dissonance.tensionLabel],
        5
      ),
      preferenceCards: (topAnswers.length ? topAnswers : [
        { value: "brandNeed", count: 1, story: safeText(report.inner.brandNeed) },
        { value: "expression", count: 1, story: safeText(report.inner.expressionDesire) },
        { value: "tension", count: 1, story: safeText(report.dissonance.tensionLabel) }
      ]).map((item) => ({
        title: `${item.count}회 반복된 취향 신호`,
        body: item.story
      }))
    },
    faceBalance: {
      shape: safeText(report.mirror.faceShapeLabel),
      line: safeText(report.mirror.lineTypeLabel),
      proportionLabel: safeText(report.mirror.proportion.label),
      proportion: [
        { label: "상안부", value: clampPercent(report.mirror.proportion.upper) },
        { label: "중안부", value: clampPercent(report.mirror.proportion.middle) },
        { label: "하안부", value: clampPercent(report.mirror.proportion.lower) }
      ],
      comment: safeText(report.mirror.balanceComment)
    },
    features: makeFeatureGuides(report),
    hairLength,
    bangs: makeBangs(report),
    hairAvoid: takeFilled(report.recommendation.avoidDetails, isMaleStyling
      ? [
        "눈을 덮는 무거운 앞머리는 얼굴 중심의 또렷함을 줄일 수 있어요.",
        "옆머리 볼륨이 크면 전체 실루엣이 둔해 보일 수 있어요.",
        "너무 강한 컬은 단정한 신뢰감보다 헤어 질감이 먼저 보일 수 있어요."
      ]
      : [
        "과하게 무거운 앞머리는 얼굴 중심의 맑은 느낌을 줄일 수 있어요.",
        "얼굴을 많이 가리는 스타일은 장점보다 답답함이 먼저 보일 수 있어요.",
        "너무 강한 컬은 현재 분위기의 세련된 균형감을 흐릴 수 있어요."
      ], 3).map((body, index) => ({
      title: (isMaleStyling
        ? ["무거운 덮은 앞머리", "큰 옆머리 볼륨", "강한 컬감"]
        : ["무거운 앞머리", "얼굴을 가리는 스타일", "강한 컬감"])[index] ?? "줄이면 좋은 요소",
      body
    })),
    baseMakeup: makeBaseMakeup(report),
    eyeMakeup: isMaleStyling
      ? [
        {
          title: "눈썹",
          body: "눈썹 아래 잔털과 비어 보이는 부분만 정리하면 인상이 또렷해지고 과한 느낌 없이 신뢰감이 살아납니다."
        },
        {
          title: "눈가 톤",
          body: "눈 밑 그림자는 두껍게 가리기보다 얇게 톤만 맞추면 피곤해 보이는 인상이 줄어듭니다."
        },
        {
          title: "피부 결",
          body: "콧볼과 T존은 매트하게, 볼 쪽은 건조해 보이지 않게 정리하면 사진에서 훨씬 깔끔합니다."
        }
      ]
      : [
        {
          title: "음영",
          body: "눈두덩 전체를 진하게 덮기보다 베이스보다 한 톤 깊은 색을 얇게 쌓으면 눈매가 자연스럽게 또렷해집니다."
        },
        {
          title: "아이라인",
          body: "라인은 점막과 속눈썹 사이를 메우는 정도로 정리하고, 끝부분만 살짝 빼면 분위기가 과하지 않게 살아납니다."
        },
        {
          title: "속눈썹",
          body: "뿌리는 깔끔하게 올리고 끝은 뭉치지 않게 풀어주면 맑은 인상과 세련미가 함께 보입니다."
        }
      ],
    contour: [
      {
        title: "쉐딩",
        body: "턱과 광대 전체를 넓게 깎기보다 얼굴 외곽에 아주 얇은 그림자를 두면 본래 윤곽이 자연스럽게 정리됩니다."
      },
      {
        title: "하이라이트",
        body: "콧대 중앙, 눈 밑 삼각존, 광대 위쪽처럼 빛이 닿는 지점만 작게 밝혀야 고급스럽습니다."
      },
      {
        title: "블러셔 위치",
        body: `${safeText(report.color.undertone, "추천 톤")}과 연결되는 색을 광대 바깥쪽으로 얇게 올리면 얼굴빛이 부드럽게 살아납니다.`
      }
    ],
    fashionMoods: makeFashionMoods(report),
    neckline,
    color: {
      season: safeText(report.color.seasonLabel),
      undertone: safeText(report.color.undertone),
      palette: takeFilled(report.color.palette, ["#efe4dd", "#d8b9b2", "#b98f8a", "#6b5a52"], 4),
      avoid: takeFilled(report.color.avoid, ["#7b4b2a", "#394b7a"], 2),
      bestUse: takeFilled(report.color.bestUse, [
        "얼굴 가까운 상의와 액세서리에 먼저 적용",
        "립과 블러셔를 같은 온도로 연결",
        "촬영 배경은 팔레트보다 한 톤 낮게 선택"
      ], 3),
      textures: takeFilled(report.color.textureWords, ["새틴", "소프트 매트", "맑은 윤광"], 3),
      note: safeText(report.color.note),
      palettes: makeColorPalettes(report)
    },
    finalSummary: {
      hair: hairLength.recommended,
      makeup: safeText(report.recommendation.makeup),
      fashion: safeText(report.recommendation.profileMood),
      color: `${safeText(report.color.seasonLabel)} / ${safeText(report.color.undertone)}`,
      image: keywords.join(" · "),
      next: safeText(report.recommendation.sessionHook, "이 방향을 실제 옷, 메이크업, 촬영 무드로 연결하면 나만의 스타일 공식이 더 빠르게 완성됩니다.")
    }
  };
}

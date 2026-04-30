export type ScoreMap = {
  softness: number;
  clarity: number;
  elegance: number;
  approachability: number;
};

export type AnalysisDepth = "detail" | "standard" | "quick";

export type AnalysisRobot = {
  id: AnalysisDepth;
  name: string;
  nickname: string;
  icon: "eye" | "pen" | "zap";
  model: string;
  pace: string;
  description: string;
  promise: string;
};

export const analysisRobots: AnalysisRobot[] = [
  {
    id: "detail",
    name: "눈썰미 최고",
    nickname: "고급 모델",
    icon: "eye",
    model: "gpt-5.4",
    pace: "가장 섬세함",
    description: "시간이 조금 걸리지만 얼굴의 작은 균형과 분위기까지 자세히 읽어요.",
    promise: "당신도 몰랐던 매력 포인트를 깊게 찾아냅니다."
  },
  {
    id: "standard",
    name: "글 잘 쓰는",
    nickname: "일반 모델",
    icon: "pen",
    model: "gpt-5.4-mini",
    pace: "균형형",
    description: "얼굴 특징을 잘 잡아내고 이해하기 쉬운 설명형 리포트로 정리해요.",
    promise: "처음 보는 사람도 바로 이해할 수 있는 문장으로 풀어냅니다."
  },
  {
    id: "quick",
    name: "핵심만 콕",
    nickname: "간단 모델",
    icon: "zap",
    model: "gpt-5.4-nano",
    pace: "가장 빠름",
    description: "바쁜 순간에도 꼭 필요한 정보만 모아 빠르게 요약해요.",
    promise: "얼굴형, 키워드, 추천 방향을 짧고 선명하게 보여줍니다."
  }
];

export type ReportData = {
  id?: string;
  createdAt?: string;
  source?: "demo" | "openai";
  analysisDepth?: AnalysisDepth;
  robotName?: string;
  profile: {
    persona: string;
    summary: string;
    keywords: string[];
    archetypeLine: string;
  };
  mirror: {
    faceShapeLabel: string;
    proportion: {
      upper: number;
      middle: number;
      lower: number;
      label: string;
    };
    lineTypeLabel: string;
    scores: ScoreMap;
    moodDescriptors: string[];
  };
  color: {
    seasonLabel: string;
    undertone: string;
    palette: string[];
    avoid: string[];
    note: string;
  };
  inner: {
    enneagramType: number;
    wing: string;
    expressionDesire: string;
    stressSignal: string;
    brandNeed: string;
  };
  dissonance: {
    gapScore: number;
    tensionLabel: string;
    insight: string;
    recommendation: string;
  };
  recommendation: {
    hair: string;
    makeup: string;
    profileMood: string;
    narrative: string;
    moodboardPrompt: string;
  };
  security: {
    storageMode: string;
    retention: string;
    privacyNote: string;
  };
  generatedImage?: {
    alt: string;
    dataUrl?: string | null;
    storagePath?: string | null;
  };
};

export type ReportDiagnostics = {
  usedLiveAnalysis: boolean;
  storedInFirebase: boolean;
  generatedMoodboard: boolean;
};

export type QuestionnaireId = string;

export type QuestionnaireAnswer = {
  id: QuestionnaireId;
  prompt: string;
  value: string;
  label: string;
};

export type AnalysisPayload = {
  nickname: string;
  gender: string;
  brandFocus: string;
  consentToStore: boolean;
  answers: QuestionnaireAnswer[];
  analysisDepth: AnalysisDepth;
  imageMimeType: string;
  imageBase64: string;
};

export type AnalysisResponse = {
  report: ReportData;
  diagnostics: ReportDiagnostics;
};

export type HistoryItem = {
  id: string;
  createdAt: string;
  persona: string;
  summary: string;
  keywords: string[];
  source: "demo" | "openai";
};

export const questionnaire = [
  {
    id: "presence",
    prompt: "처음 만나는 사람에게 가장 남기고 싶은 인상은 무엇인가요?",
    options: [
      { value: "refined", label: "정제된 신뢰감" },
      { value: "distinctive", label: "고유한 감각" },
      { value: "warm", label: "편안한 친밀감" }
    ]
  },
  {
    id: "attention",
    prompt: "사람들이 나를 기억할 때 가장 먼저 떠올렸으면 하는 이미지는 무엇인가요?",
    options: [
      { value: "distinctive", label: "감각적인 사람" },
      { value: "trust", label: "믿음이 가는 사람" },
      { value: "warm", label: "기분 좋아지는 사람" }
    ]
  },
  {
    id: "compliment",
    prompt: "가장 듣고 싶은 칭찬은 무엇인가요?",
    options: [
      { value: "refined", label: "분위기가 고급스러워요" },
      { value: "expression", label: "자기 색이 분명해요" },
      { value: "balance", label: "함께 있으면 편안해요" }
    ]
  },
  {
    id: "decision",
    prompt: "중요한 선택 앞에서 가장 크게 고려하는 기준은 무엇인가요?",
    options: [
      { value: "structure", label: "완성도와 기준" },
      { value: "meaning", label: "나다운 의미" },
      { value: "balance", label: "관계와 조화" }
    ]
  },
  {
    id: "pace",
    prompt: "내가 가장 편안하게 움직이는 속도는 어떤 쪽인가요?",
    options: [
      { value: "structure", label: "계획적으로 차근차근" },
      { value: "expression", label: "영감이 올 때 과감하게" },
      { value: "trust", label: "상황을 보며 유연하게" }
    ]
  },
  {
    id: "stress_response",
    prompt: "긴장되는 순간 나는 주로 어떻게 반응하나요?",
    options: [
      { value: "authority", label: "더 완벽하게 준비해요" },
      { value: "distant", label: "혼자 정리할 시간이 필요해요" },
      { value: "warm", label: "주변 분위기를 먼저 살펴요" }
    ]
  },
  {
    id: "tension",
    prompt: "요즘 내 이미지를 설명할 때 가장 답답한 지점은 어디인가요?",
    options: [
      { value: "safe", label: "너무 무난하게 보임" },
      { value: "distant", label: "거리감 있게 보임" },
      { value: "blurred", label: "내 장점이 흐려짐" }
    ]
  },
  {
    id: "visibility",
    prompt: "주목받는 상황에서 나는 어떤 마음이 더 큰가요?",
    options: [
      { value: "authority", label: "잘 해내고 싶어요" },
      { value: "distinctive", label: "나답게 보이고 싶어요" },
      { value: "safe", label: "너무 튀지 않았으면 해요" }
    ]
  },
  {
    id: "relationship",
    prompt: "관계 안에서 나의 장점은 무엇에 가깝나요?",
    options: [
      { value: "trust", label: "상대가 안심하게 해요" },
      { value: "structure", label: "방향을 잡아줘요" },
      { value: "poetic", label: "감정을 섬세하게 읽어요" }
    ]
  },
  {
    id: "energy",
    prompt: "브랜딩에서 지금 가장 강화하고 싶은 에너지는 무엇인가요?",
    options: [
      { value: "authority", label: "전문성과 밀도" },
      { value: "expression", label: "표현력과 개성" },
      { value: "trust", label: "편안한 설득력" }
    ]
  },
  {
    id: "hidden_wish",
    prompt: "사실 마음속에서 더 꺼내고 싶은 모습은 무엇인가요?",
    options: [
      { value: "expression", label: "더 자유로운 표현" },
      { value: "authority", label: "더 선명한 존재감" },
      { value: "natural", label: "더 자연스러운 나다움" }
    ]
  },
  {
    id: "style_fear",
    prompt: "스타일링에서 가장 피하고 싶은 느낌은 무엇인가요?",
    options: [
      { value: "blurred", label: "애매하고 흐릿함" },
      { value: "distant", label: "너무 차가운 느낌" },
      { value: "safe", label: "평범하게 묻히는 느낌" }
    ]
  },
  {
    id: "routine",
    prompt: "평소 옷을 고를 때 가장 먼저 보는 것은 무엇인가요?",
    options: [
      { value: "refined", label: "깔끔한 완성도" },
      { value: "meaning", label: "내 취향과 분위기" },
      { value: "warm", label: "편안함과 활용도" }
    ]
  },
  {
    id: "brand_need",
    prompt: "지금 나에게 가장 필요한 변화는 무엇인가요?",
    options: [
      { value: "authority", label: "전문적으로 보이기" },
      { value: "distinctive", label: "더 기억에 남기" },
      { value: "trust", label: "더 친근하게 다가가기" }
    ]
  },
  {
    id: "camera",
    prompt: "카메라 앞에서 가장 원하는 느낌은 무엇인가요?",
    options: [
      { value: "editorial", label: "세련된 화보 느낌" },
      { value: "natural", label: "자연스럽고 맑은 느낌" },
      { value: "poetic", label: "분위기 있는 느낌" }
    ]
  },
  {
    id: "color_mood",
    prompt: "끌리는 컬러 분위기는 무엇인가요?",
    options: [
      { value: "refined", label: "차분한 뉴트럴" },
      { value: "warm", label: "생기 있는 웜톤" },
      { value: "distinctive", label: "맑고 선명한 포인트" }
    ]
  },
  {
    id: "decision_shadow",
    prompt: "선택이 어려워질 때 나를 막는 것은 무엇인가요?",
    options: [
      { value: "safe", label: "실패하고 싶지 않음" },
      { value: "blurred", label: "내 기준이 흐려짐" },
      { value: "distant", label: "너무 많이 생각함" }
    ]
  },
  {
    id: "inner_voice",
    prompt: "내 안의 목소리는 주로 무엇을 말하나요?",
    options: [
      { value: "meaning", label: "진짜 나다운가?" },
      { value: "structure", label: "충분히 완성됐나?" },
      { value: "balance", label: "무리하지 않아도 될까?" }
    ]
  },
  {
    id: "ideal_day",
    prompt: "가장 나답다고 느끼는 하루는 어떤 모습인가요?",
    options: [
      { value: "expression", label: "감각을 마음껏 쓰는 날" },
      { value: "authority", label: "성과가 또렷한 날" },
      { value: "trust", label: "편안하게 연결되는 날" }
    ]
  },
  {
    id: "expression",
    prompt: "이상적인 프로필 이미지는 어떤 분위기에 더 가까운가요?",
    options: [
      { value: "editorial", label: "도시적 에디토리얼" },
      { value: "poetic", label: "감각적이고 서정적" },
      { value: "natural", label: "자연스럽고 단단함" }
    ]
  },
  {
    id: "final_direction",
    prompt: "이번 리포트에서 가장 알고 싶은 것은 무엇인가요?",
    options: [
      { value: "refined", label: "나에게 맞는 세련된 스타일" },
      { value: "distinctive", label: "나만의 분위기와 강점" },
      { value: "warm", label: "더 예뻐 보이는 실전 조합" }
    ]
  }
] as const;

type FallbackPreset = {
  persona: string;
  summary: string;
  keywords: string[];
  archetypeLine: string;
  enneagramType: number;
  wing: string;
  faceShapeLabel: string;
  lineTypeLabel: string;
  seasonLabel: string;
  undertone: string;
  moodDescriptors: string[];
  scores: ScoreMap;
  expressionDesire: string;
  stressSignal: string;
  brandNeed: string;
  tensionLabel: string;
  insight: string;
  recommendation: string;
  hair: string;
  makeup: string;
  profileMood: string;
  narrative: string;
  palette: string[];
  avoid: string[];
};

const fallbackPresets: Record<string, FallbackPreset> = {
  distinctive: {
    persona: "맑고 세련된 뮤즈",
    summary: "선명한 개성과 맑은 세련미가 함께 읽히는 타입",
    keywords: ["세련미", "고유함", "깊이감", "기억되는 무드"],
    archetypeLine: "시선을 끌되 과장 없이 오래 남는 인상",
    enneagramType: 4,
    wing: "4w3",
    faceShapeLabel: "부드러운 타원형",
    lineTypeLabel: "곡선 안에 날카로운 포인트가 섞인 혼합형",
    seasonLabel: "여름 쿨",
    undertone: "쿨 로즈",
    moodDescriptors: ["도회적", "맑은 깊이감", "감각적 균형"],
    scores: { softness: 74, clarity: 82, elegance: 89, approachability: 63 },
    expressionDesire: "고유한 감각과 독창성을 드러내고 싶은 욕구",
    stressSignal: "안전한 이미지에 맞추느라 자신만의 톤이 희미해지는 패턴",
    brandNeed: "독창성을 이해 가능한 구조와 문장으로 번역하는 것",
    tensionLabel: "정제된 외형과 더 깊은 표현 욕구의 간극",
    insight:
      "외형에서는 정돈된 세련미가 먼저 읽히지만, 내면에서는 보다 개인적인 결이 살아 있는 표현을 원하고 있습니다.",
    recommendation:
      "지금 필요한 것은 더 화려한 장식이 아니라, 당신의 시그니처가 한 번에 읽히는 구조입니다.",
    hair: "레이어가 살아 있는 미디엄 헤어와 정돈된 윤곽",
    makeup: "투명한 피부 결 위에 로즈 머브 포인트",
    profileMood: "밝은 자연광, 단색 배경, 시선을 살짝 비튼 에디토리얼 무드",
    narrative:
      "당신은 세련된 외형적 강점을 지녔지만, 내면의 독창성이 드러날 때 진짜 브랜드가 완성됩니다.",
    palette: ["#dce3e9", "#b7c7cf", "#e7dce5", "#8897a5"],
    avoid: ["#bb6725", "#80501c"]
  },
  refined: {
    persona: "우아하고 세련된 무드",
    summary: "전문성과 우아함이 동시에 느껴지는 고밀도 이미지",
    keywords: ["정제된 신뢰감", "세련미", "완성도", "도시적 균형"],
    archetypeLine: "차분하지만 기준이 느껴지는 프로페셔널 무드",
    enneagramType: 3,
    wing: "3w4",
    faceShapeLabel: "균형감 있는 달걀형",
    lineTypeLabel: "직선 중심에 부드러운 곡선이 더해진 정제형",
    seasonLabel: "겨울 쿨",
    undertone: "클린 뉴트럴 쿨",
    moodDescriptors: ["프로페셔널", "도시적", "선명한 신뢰감"],
    scores: { softness: 61, clarity: 88, elegance: 92, approachability: 69 },
    expressionDesire: "역량과 감각이 모두 읽히는 완성형 자기표현",
    stressSignal: "성과 중심의 이미지에 갇혀 사람 냄새가 덜 읽히는 패턴",
    brandNeed: "전문성을 유지하면서도 서사를 담는 세부 디테일",
    tensionLabel: "완성도 높은 외형과 더 입체적인 서사의 간극",
    insight:
      "지금의 이미지는 충분히 완성도 높지만, 사람들은 아직 당신의 감각적 레이어까지는 충분히 읽지 못할 수 있습니다.",
    recommendation:
      "권위와 친밀감의 밀도를 함께 조정하면 더 오래 기억되는 브랜딩이 만들어집니다.",
    hair: "결이 살아 있는 스트레이트와 구조적인 볼륨 밸런스",
    makeup: "깔끔한 피부 표현과 선명한 아이 포인트",
    profileMood: "차분한 콘크리트 톤 배경, 직선적인 포즈, 미니멀 조명",
    narrative:
      "당신은 단단하고 세련된 외형을 가졌지만, 내면의 서사와 감각이 함께 읽힐 때 더 강한 브랜드가 됩니다.",
    palette: ["#f2f2f1", "#c9d0d8", "#8b95a3", "#2f3742"],
    avoid: ["#d18d28", "#915126"]
  },
  warm: {
    persona: "부드럽고 사랑스러운 시그니처",
    summary: "편안한 접근성과 신뢰가 부드럽게 이어지는 이미지",
    keywords: ["친밀감", "맑은 신뢰감", "유연함", "부드러운 존재감"],
    archetypeLine: "가까이 가고 싶은 인상 안에 기준이 있는 타입",
    enneagramType: 9,
    wing: "9w1",
    faceShapeLabel: "부드러운 라운드형",
    lineTypeLabel: "곡선 중심의 유연한 선감",
    seasonLabel: "봄 웜",
    undertone: "라이트 웜",
    moodDescriptors: ["맑음", "친근함", "자연스러운 설득력"],
    scores: { softness: 91, clarity: 66, elegance: 75, approachability: 90 },
    expressionDesire: "편안함 속에서도 분명한 존재감을 남기고 싶은 욕구",
    stressSignal: "좋은 사람으로 보이기 위해 자기 기준을 뒤로 미루는 패턴",
    brandNeed: "부드러움을 유지한 채 선택성과 주도성을 드러내는 것",
    tensionLabel: "친근한 인상과 더 선명한 기준 사이의 간극",
    insight:
      "외형은 매우 편안하고 따뜻하게 읽히지만, 실제 내면은 조금 더 또렷한 방향성을 원하고 있습니다.",
    recommendation:
      "따뜻함을 잃지 않으면서도 기준이 읽히는 색, 문장, 포즈를 선택하면 브랜드 밀도가 크게 올라갑니다.",
    hair: "부드러운 결감의 세미 웨이브와 얼굴선을 감싸는 볼륨",
    makeup: "생기 있는 코럴 계열과 자연스러운 윤광",
    profileMood: "샌드 톤 배경, 부드러운 측면광, 편안한 눈맞춤",
    narrative:
      "당신은 편안하고 부드러운 외형적 강점을 지녔지만, 내면의 기준이 함께 보일 때 더 완성된 브랜드가 됩니다.",
    palette: ["#f4e8d6", "#e5cdb0", "#c6a481", "#6c5b4a"],
    avoid: ["#596dd1", "#32499f"]
  }
};

export const sampleHistory: HistoryItem[] = [
  {
    id: "sample-1",
    createdAt: new Date().toISOString(),
    persona: "맑고 세련된 뮤즈",
    summary: "시선을 끌되 과장 없이 오래 남는 인상",
    keywords: ["세련미", "고유함", "깊이감", "기억되는 무드"],
    source: "demo"
  }
];

export function getRobotByDepth(depth?: AnalysisDepth) {
  return analysisRobots.find((robot) => robot.id === depth) ?? analysisRobots[1];
}

export function buildFallbackReport(payload?: Partial<AnalysisPayload>): ReportData {
  const values = new Set(payload?.answers?.map((answer) => answer.value) ?? []);
  const presetKey = values.has("distinctive") || values.has("expression") || values.has("poetic")
    ? "distinctive"
    : values.has("refined") || values.has("structure") || values.has("authority")
      ? "refined"
      : "warm";
  const preset = fallbackPresets[presetKey];
  const robot = getRobotByDepth(payload?.analysisDepth);
  const storageMode = payload?.consentToStore
    ? "동의된 리포트 데이터만 Firebase에 저장"
    : "업로드 이미지는 세션 처리 후 저장하지 않음";

  return {
    source: "demo",
    analysisDepth: robot.id,
    robotName: robot.name,
    createdAt: new Date().toISOString(),
    profile: {
      persona: preset.persona,
      summary: preset.summary,
      keywords: preset.keywords,
      archetypeLine: preset.archetypeLine
    },
    mirror: {
      faceShapeLabel: preset.faceShapeLabel,
      proportion: {
        upper: 33,
        middle: 34,
        lower: 33,
        label: "상·중·하안부가 균형적으로 읽히는 비율"
      },
      lineTypeLabel: preset.lineTypeLabel,
      scores: preset.scores,
      moodDescriptors: preset.moodDescriptors
    },
    color: {
      seasonLabel: preset.seasonLabel,
      undertone: preset.undertone,
      palette: preset.palette,
      avoid: preset.avoid,
      note: "사진 조명 변수가 있어 퍼스널 컬러는 1차 추정치로 제공됩니다."
    },
    inner: {
      enneagramType: preset.enneagramType,
      wing: preset.wing,
      expressionDesire: preset.expressionDesire,
      stressSignal: preset.stressSignal,
      brandNeed: preset.brandNeed
    },
    dissonance: {
      gapScore: presetKey === "refined" ? 72 : presetKey === "distinctive" ? 78 : 68,
      tensionLabel: preset.tensionLabel,
      insight: preset.insight,
      recommendation: preset.recommendation
    },
    recommendation: {
      hair: preset.hair,
      makeup: preset.makeup,
      profileMood: preset.profileMood,
      narrative: preset.narrative,
      moodboardPrompt:
        "Luxury editorial branding moodboard, refined beauty direction, tactile neutrals, polished lighting, premium magazine composition"
    },
    security: {
      storageMode,
      retention: payload?.consentToStore
        ? "리포트 요약 데이터만 저장하고 원본 이미지는 저장하지 않는 구성을 기본값으로 둡니다."
        : "원본 이미지는 분석 응답 생성에만 사용되고 영구 저장되지 않습니다.",
      privacyNote:
        "이 결과는 브랜딩 해석을 위한 보조 분석이며, 성격이나 심리 상태를 얼굴에서 진단하지 않습니다."
    }
  };
}

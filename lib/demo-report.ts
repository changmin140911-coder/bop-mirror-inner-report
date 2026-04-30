export type ReportData = {
  profile: {
    persona: string;
    summary: string;
    keywords: string[];
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
    scores: Record<string, number>;
  };
  color: {
    seasonLabel: string;
    palette: string[];
    avoid: string[];
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
  };
};

export const demoReport: ReportData = {
  profile: {
    persona: "Modern Elegant",
    summary: "정제된 세련미와 고유한 감각이 공존하는 타입",
    keywords: ["세련미", "맑은 여성스러움", "차분한 신뢰감", "독창성"]
  },
  mirror: {
    faceShapeLabel: "달걀형",
    proportion: {
      upper: 32,
      middle: 34,
      lower: 34,
      label: "1 : 1 : 1에 가까운 균형형"
    },
    lineTypeLabel: "곡선과 직선이 균형 잡힌 혼합형",
    scores: {
      softness: 82,
      clarity: 74,
      elegance: 88,
      approachability: 76
    }
  },
  color: {
    seasonLabel: "여름 쿨",
    palette: ["#dfe7e9", "#b7c7cc", "#e8dde3", "#8f9fa6"],
    avoid: ["#c46a2b", "#8b4a1f"]
  },
  inner: {
    enneagramType: 4,
    wing: "4w3",
    expressionDesire: "고유함과 깊이 있는 표현",
    stressSignal: "외부 시선에 맞추느라 자신만의 감각이 흐려지는 패턴",
    brandNeed: "독창성을 이해 가능한 언어로 번역하는 것"
  },
  dissonance: {
    gapScore: 78,
    tensionLabel: "정제된 외형과 표현 욕구의 간극",
    insight:
      "당신의 외형적 세련미는 타인에게 차분한 신뢰를 줍니다. 하지만 Inner 데이터는 더 독창적이고 선명한 표현 욕구가 함께 흐르고 있음을 보여줍니다.",
    recommendation:
      "현재의 스타일링은 보여지는 이미지를 정돈하지만, 아직 당신의 진짜 잠재력까지 충분히 담아내지는 못하고 있습니다."
  },
  recommendation: {
    hair: "부드러운 레이어와 자연스러운 볼륨감",
    makeup: "맑은 피부 표현, 차분한 로즈 계열 포인트",
    profileMood: "밝은 자연광, 절제된 포즈, 정돈된 배경",
    narrative:
      "당신은 정제된 세련미를 가진 외형적 강점을 지녔지만, 내면의 고유한 표현 욕구를 채울 때 진정한 브랜드가 완성됩니다."
  }
};

"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowRight,
  Bot,
  Camera,
  Download,
  Eye,
  Heart,
  ImagePlus,
  Lock,
  Palette,
  PenLine,
  ScanFace,
  ShieldCheck,
  Shirt,
  Sparkles,
  Zap
} from "lucide-react";
import html2canvas from "html2canvas";
import {
  analysisRobots,
  buildFallbackReport,
  questionnaire,
  type AnalysisDepth,
  type AnalysisResponse,
  type HistoryItem,
  type QuestionnaireAnswer,
  type QuestionnaireId,
  type ReportData
} from "@/lib/report-types";

const scoreLabels = {
  softness: "부드러움",
  clarity: "선명도",
  elegance: "세련미",
  approachability: "접근성"
} as const;

const defaultAnswerValues: Record<QuestionnaireId, string> = {
  presence: "refined",
  decision: "structure",
  tension: "safe",
  energy: "authority",
  expression: "editorial"
};

const defaultAnswerLabels: Record<QuestionnaireId, string> = {
  presence: "정제된 신뢰감",
  decision: "완성도와 기준",
  tension: "너무 무난하게 보임",
  energy: "전문성과 밀도",
  expression: "도시적 에디토리얼"
};

function RobotIcon({ icon }: { icon: "eye" | "pen" | "zap" }) {
  if (icon === "eye") return <Eye size={22} />;
  if (icon === "pen") return <PenLine size={22} />;
  return <Zap size={22} />;
}

function GaugeBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="gauge">
      <div className="gaugeHeader">
        <span>{label}</span>
        <strong>{value}%</strong>
      </div>
      <div className="gaugeTrack" aria-hidden="true">
        <div className="gaugeFill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ResultSnapshot({ report }: { report: ReportData }) {
  return (
    <article id="result-snapshot" className="snapshotCard">
      <p className="eyebrow">Mirror x Inner Signature</p>
      <h3>{report.profile.persona}</h3>
      <p>{report.profile.summary}</p>
      <div className="snapshotKeywords">
        {report.profile.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <div className="paletteRow">
        {report.color.palette.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
      <div className="snapshotMeta">
        <div>
          <span>AI Robot</span>
          <strong>{report.robotName ?? "글 잘 쓰는"}</strong>
        </div>
        <div>
          <span>Potential Gap</span>
          <strong>{report.dissonance.gapScore}</strong>
        </div>
      </div>
    </article>
  );
}

async function captureSnapshot() {
  const target = document.getElementById("result-snapshot");
  if (!target) return;

  const canvas = await html2canvas(target, {
    scale: 2,
    backgroundColor: null,
    useCORS: true
  });

  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "mirror-inner-report.png";
  anchor.click();
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function splitSentences(text: string) {
  return text
    .split(/[,·]|(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildStyleGuide(report: ReportData) {
  const silhouetteHint = report.mirror.lineTypeLabel.includes("곡선")
    ? "부드러운 곡선이 살아나는 블라우스, 니트, 스커트 실루엣"
    : report.mirror.lineTypeLabel.includes("직선")
      ? "직선이 살아 있는 재킷, 셔츠, 슬랙스 실루엣"
      : "곡선과 직선이 균형 있게 섞인 단정한 실루엣";

  const moodItems = splitSentences(report.recommendation.profileMood).slice(0, 3);

  return {
    title: `${report.profile.keywords[0]}을 살려주는 스타일 공식`,
    subtitle: "지금 바로 따라 하기 쉬운 추천만 담았습니다.",
    colors: [
      "얼굴빛을 맑게 살려주는 베이스 톤",
      "사진에서 분위기를 살려주는 포인트 톤",
      "메이크업과 옷에 함께 쓰기 좋은 연결 톤",
      "차분하게 마무리해 주는 음영 톤"
    ],
    outfits: [
      `${report.color.seasonLabel} 팔레트를 활용한 톤온톤 스타일`,
      silhouetteHint,
      `${report.profile.keywords[1]}이 살아나는 작고 정제된 액세서리`
    ],
    beauty: [
      report.recommendation.hair,
      report.recommendation.makeup,
      `${report.color.undertone} 톤을 살린 립과 블러셔 조합`
    ],
    mood:
      moodItems.length > 0
        ? moodItems
        : [
            report.recommendation.profileMood,
            "정돈된 배경과 부드러운 조명",
            "과한 연출보다 자연스러운 시선 처리"
          ]
  };
}

function buildSecretProfile(report: ReportData) {
  return {
    title: `에니어그램 ${report.inner.enneagramType}번 ${report.inner.wing}`,
    summary:
      "처음의 마음 모양 테스트보다 한층 깊게, 당신이 무엇을 원하고 어디에서 에너지가 소모되는지 읽어보는 단계입니다.",
    points: [
      report.inner.expressionDesire,
      report.inner.stressSignal,
      report.inner.brandNeed
    ]
  };
}

function AnalysisOverlay({ previewUrl }: { previewUrl: string | null }) {
  return (
    <div className="previewFrame">
      {previewUrl ? <img className="previewImage" src={previewUrl} alt="업로드 미리보기" /> : null}
      <div className="previewShade" />
      <div className="scanLine" />
      <div className="faceGuide outline" />
      <div className="faceGuide upper" />
      <div className="faceGuide middle" />
      <div className="faceGuide lower" />
      <span className="landmark eyeLeft" />
      <span className="landmark eyeRight" />
      <span className="landmark nose" />
      <span className="landmark mouth" />
      <div className="scanBadge">Vision Report</div>
      {!previewUrl ? (
        <div className="uploadPlaceholder">
          <ImagePlus size={28} />
          <strong>정면 사진을 업로드하면 분석 오버레이가 표시됩니다.</strong>
          <span>밝은 자연광, 눈·코·입이 잘 보이는 단일 인물 사진이 가장 좋아요.</span>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [brandFocus, setBrandFocus] = useState("");
  const [consentToStore, setConsentToStore] = useState(true);
  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<QuestionnaireId, string>>(defaultAnswerValues);
  const [selectedLabels, setSelectedLabels] =
    useState<Record<QuestionnaireId, string>>(defaultAnswerLabels);
  const [selectedRobot, setSelectedRobot] = useState<AnalysisDepth>("standard");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ReportData>(buildFallbackReport());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "마음 모양 테스트를 먼저 선택하면, 이후 얼굴 분석 결과와 합쳐 더 섬세한 리포트가 완성됩니다."
  );
  const [engineNote, setEngineNote] = useState("사진을 올린 뒤 원하는 AI 로봇을 골라주세요.");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const styleGuide = buildStyleGuide(report);
  const secretProfile = buildSecretProfile(report);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const response = await fetch("/api/reports", { cache: "no-store" });
        const data = (await response.json()) as { reports: HistoryItem[] };
        if (active) setHistory(data.reports);
      } catch {
        if (active) setHistory([]);
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function updateAnswer(id: QuestionnaireId, value: string, label: string) {
    setSelectedAnswers((current) => ({ ...current, [id]: value }));
    setSelectedLabels((current) => ({ ...current, [id]: label }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);

    setSelectedFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setErrorMessage("");
    setStatusMessage("사진이 준비되었습니다. 이제 세 명의 AI 로봇 중 한 명을 골라주세요.");
  }

  function buildAnswers(): QuestionnaireAnswer[] {
    return questionnaire.map((question) => ({
      id: question.id,
      prompt: question.prompt,
      value: selectedAnswers[question.id],
      label: selectedLabels[question.id]
    }));
  }

  function submitAnalysis() {
    if (!selectedFile) {
      setErrorMessage("먼저 얼굴 사진을 업로드해 주세요.");
      return;
    }

    const robot = analysisRobots.find((item) => item.id === selectedRobot);
    setErrorMessage("");
    setStatusMessage(`${robot?.name ?? "AI"} 로봇이 얼굴 구조와 마음 모양을 함께 읽고 있습니다.`);

    startTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("image", selectedFile);
        formData.set("nickname", nickname);
        formData.set("brandFocus", brandFocus);
        formData.set("consentToStore", String(consentToStore));
        formData.set("analysisDepth", selectedRobot);
        formData.set("answers", JSON.stringify(buildAnswers()));

        try {
          const response = await fetch("/api/analyze", {
            method: "POST",
            body: formData
          });

          const data = (await response.json()) as AnalysisResponse | { error: string };
          if (!response.ok || "error" in data) {
            throw new Error("error" in data ? data.error : "분석 요청에 실패했습니다.");
          }

          setReport(data.report);
          setEngineNote(
            data.diagnostics.usedLiveAnalysis
              ? "OpenAI 분석 엔진과 이미지 생성이 반영된 실시간 결과입니다."
              : "API 키가 없거나 응답이 불안정해 데모 엔진으로 안전하게 대체되었습니다."
          );
          setStatusMessage(
            data.diagnostics.storedInFirebase
              ? "리포트가 생성되었고 동의된 결과 데이터가 Firebase에 저장되었습니다."
              : "리포트가 생성되었습니다. 원본 이미지는 세션 처리에만 사용되었습니다."
          );

          const historyResponse = await fetch("/api/reports", { cache: "no-store" });
          const historyData = (await historyResponse.json()) as { reports: HistoryItem[] };
          setHistory(historyData.reports);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "알 수 없는 오류로 분석을 완료하지 못했습니다."
          );
          setStatusMessage("실시간 연결이 불안정해 현재 상태를 유지했습니다.");
        }
      })();
    });
  }

  return (
    <main className="pageShell">
      <div className="textureLayer" />

      <section className="hero section">
        <div className="heroCopy">
          <p className="eyebrow">Mind Shape First</p>
          <h1>당신의 마음 모양을 먼저 알아볼까요?</h1>
          <p className="lead">
            사진을 올리기 전, 간단한 질문으로 당신이 어떤 분위기와 표현 방식을 가진 사람인지
            먼저 읽어봅니다. 이 결과는 얼굴 분석과 합쳐져 더 완성도 높은 스타일 리포트가 됩니다.
          </p>
          <a className="heartButton" href="#heart-test">
            <Sparkles size={19} />
            사진 올리기 전, 내 '마음 모양' 테스트하기
            <ArrowRight size={18} />
          </a>
          <div className="heartIntro">
            <strong>부담 없이 시작하는 첫 단계</strong>
            <p>
              성격 유형 테스트처럼 몇 가지 선택만으로 내면의 방향을 먼저 정리합니다.
              얼굴 분석은 그 다음에 더 정확하게 이어집니다.
            </p>
          </div>
          <div className="statusCard">
            <div className="statusRow">
              <Sparkles size={16} />
              <span>{engineNote}</span>
            </div>
            <div className="statusRow">
              <ShieldCheck size={16} />
              <span>{statusMessage}</span>
            </div>
            {errorMessage ? (
              <div className="statusRow error">
                <span>{errorMessage}</span>
              </div>
            ) : null}
          </div>
          <div className="heroActions">
            <button className="primaryButton" onClick={submitAnalysis} disabled={isPending}>
              <ScanFace size={18} />
              {isPending ? "분석 중..." : "리포트 생성하기"}
            </button>
            <button
              className="secondaryButton"
              onClick={() => fileInputRef.current?.click()}
              type="button"
            >
              <Camera size={18} />
              사진 선택
            </button>
          </div>
        </div>

        <AnalysisOverlay previewUrl={previewUrl} />
      </section>

      <section id="heart-test" className="section gridLayout">
        <article className="panel intakePanel">
          <div className="panelHeader">
            <p className="eyebrow">Step 01. Mind Shape</p>
            <h2>내 마음 모양 테스트</h2>
            <p>
              먼저 질문에 답하며 지금의 표현 욕구와 브랜딩 방향을 가볍게 정리해보세요.
              사진은 이후 단계에서 올리면 됩니다.
            </p>
          </div>

          <div className="fieldGrid">
            <label className="field">
              <span>이름 또는 이니셜</span>
              <input
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="예: CM"
              />
            </label>

            <label className="field">
              <span>현재 브랜딩 목표</span>
              <input
                value={brandFocus}
                onChange={(event) => setBrandFocus(event.target.value)}
                placeholder="예: 프로필 사진 분위기를 정리하고 싶어요"
              />
            </label>
          </div>

          <label className="uploadBox">
            <input
              ref={fileInputRef}
              accept="image/png,image/jpeg,image/webp"
              className="hiddenInput"
              onChange={handleFileChange}
              type="file"
            />
            <ImagePlus size={22} />
            <strong>{selectedFile ? selectedFile.name : "정면 사진 업로드"}</strong>
            <span>PNG, JPG, WEBP / 최대 6MB</span>
          </label>

          {selectedFile ? (
            <section className="robotPicker" aria-label="AI 분석 로봇 선택">
              <div className="robotHeader">
                <p className="eyebrow">Step 02. Smart Choice</p>
                <h3>AI 로봇이 얼마나 자세하게 분석할지 골라주세요.</h3>
              </div>
              <div className="robotGrid">
                {analysisRobots.map((robot) => {
                  const active = selectedRobot === robot.id;
                  return (
                    <button
                      className={active ? "robotCard active" : "robotCard"}
                      key={robot.id}
                      onClick={() => setSelectedRobot(robot.id)}
                      type="button"
                    >
                      <span className="robotIcon">
                        <RobotIcon icon={robot.icon} />
                      </span>
                      <span className="robotTitle">
                        <strong>{robot.name}</strong>
                        <em>{robot.nickname}</em>
                      </span>
                      <span className="robotPace">{robot.pace}</span>
                      <span className="robotDescription">{robot.description}</span>
                      <span className="robotPromise">{robot.promise}</span>
                    </button>
                  );
                })}
              </div>
            </section>
          ) : null}

          <div className="questionList">
            {questionnaire.map((question) => (
              <div className="questionBlock" key={question.id}>
                <strong>{question.prompt}</strong>
                <div className="optionRow">
                  {question.options.map((option) => {
                    const active = selectedAnswers[question.id] === option.value;
                    return (
                      <button
                        className={active ? "optionChip active" : "optionChip"}
                        key={option.value}
                        onClick={() => updateAnswer(question.id, option.value, option.label)}
                        type="button"
                      >
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <label className="consentRow">
            <input
              checked={consentToStore}
              onChange={(event) => setConsentToStore(event.target.checked)}
              type="checkbox"
            />
            <span>동의한 경우에만 결과 요약 데이터를 Firebase에 저장합니다.</span>
          </label>
        </article>

        <aside className="sidebarStack">
          <article className="panel securityPanel">
            <p className="eyebrow">Security</p>
            <h3>보안 기준</h3>
            <ul className="plainList">
              <li>원본 이미지는 분석 요청 생성에만 사용하고 기본적으로 저장하지 않습니다.</li>
              <li>저장 동의가 있을 때만 결과 요약과 질문 응답을 Firebase에 보관합니다.</li>
              <li>분석 문구는 브랜딩 해석에 한정하며 얼굴로 성격이나 심리 상태를 진단하지 않습니다.</li>
            </ul>
          </article>

          <article className="panel historyPanel">
            <p className="eyebrow">Recent Reports</p>
            <h3>저장된 리포트</h3>
            <div className="historyList">
              {history.map((item) => (
                <div className="historyItem" key={item.id}>
                  <div>
                    <strong>{item.persona}</strong>
                    <span>{formatTime(item.createdAt)}</span>
                  </div>
                  <p>{item.summary}</p>
                </div>
              ))}
            </div>
          </article>
        </aside>
      </section>

      <section className="section reportSection">
        <div className="sectionHeader">
          <p className="eyebrow">Report Output</p>
          <h2>{report.profile.persona}</h2>
          <p>{report.profile.summary}</p>
        </div>

        <div className="keywordRow">
          {report.profile.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>

        <div className="reportGrid">
          <article className="panel featurePanel">
            <p className="eyebrow">Mirror Analysis</p>
            <h3>{report.mirror.faceShapeLabel}</h3>
            <p>{report.mirror.proportion.label}</p>
            <div className="ratioBars">
              <span style={{ height: `${report.mirror.proportion.upper * 1.45}px` }}>상안부</span>
              <span style={{ height: `${report.mirror.proportion.middle * 1.45}px` }}>중안부</span>
              <span style={{ height: `${report.mirror.proportion.lower * 1.45}px` }}>하안부</span>
            </div>
            <div className="descriptorRow">
              {report.mirror.moodDescriptors.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          </article>

          <article className="panel featurePanel">
            <p className="eyebrow">Feature Scores</p>
            <h3>{report.mirror.lineTypeLabel}</h3>
            <div className="scoreStack">
              {Object.entries(report.mirror.scores).map(([key, value]) => (
                <GaugeBar
                  key={key}
                  label={scoreLabels[key as keyof typeof scoreLabels]}
                  value={value}
                />
              ))}
            </div>
          </article>

          <article className="panel featurePanel">
            <p className="eyebrow">Color Direction</p>
            <h3>{report.color.seasonLabel}</h3>
            <p>{report.color.undertone}</p>
            <div className="paletteRow large">
              {report.color.palette.map((color) => (
                <span key={color} style={{ background: color }} title={color} />
              ))}
            </div>
            <p className="subtleCopy">{report.color.note}</p>
          </article>

          <article className="panel imagePanel">
            <p className="eyebrow">Step 04. Style Formula</p>
            <h3>당신을 위한 스타일 추천</h3>
            <p className="styleLead">{styleGuide.title}</p>
            <div className="styleVisual">
              {report.generatedImage?.dataUrl ? (
                <img
                  alt={report.generatedImage.alt}
                  className="generatedImage"
                  src={report.generatedImage.dataUrl}
                />
              ) : (
                <div className="generatedFallback">
                  <Sparkles size={22} />
                  <strong>여성 모델 중심 무드보드는 AI 이미지 연결 후 자동으로 채워집니다.</strong>
                  <span>{styleGuide.subtitle}</span>
                </div>
              )}
            </div>
            <div className="styleInfoGrid">
              <div className="miniInfoCard">
                <div className="miniInfoHeader">
                  <Palette size={16} />
                  <strong>찰떡 컬러</strong>
                </div>
                <div className="paletteStoryGrid">
                  {report.color.palette.map((color, index) => (
                    <div className="paletteStoryItem" key={`${color}-${index}`}>
                      <span className="paletteStorySwatch" style={{ background: color }} />
                      <p>{styleGuide.colors[index]}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="miniInfoCard">
                <div className="miniInfoHeader">
                  <Shirt size={16} />
                  <strong>의상 추천</strong>
                </div>
                <ul className="plainList compact">
                  {styleGuide.outfits.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="miniInfoCard">
                <div className="miniInfoHeader">
                  <Sparkles size={16} />
                  <strong>뷰티 추천</strong>
                </div>
                <ul className="plainList compact">
                  {styleGuide.beauty.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="miniInfoCard">
                <div className="miniInfoHeader">
                  <Heart size={16} />
                  <strong>당신의 무드</strong>
                </div>
                <ul className="plainList compact">
                  {styleGuide.mood.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>

        <div className="deepLinkRow">
          <a className="primaryButton pulseButton" href="#deep-profile">
            <Sparkles size={18} />
            내 얼굴에 숨겨진 '비밀 성격'(에니어그램 심화 유형) 확인하기
          </a>
        </div>
      </section>

      <section className="section insightSection" id="deep-profile">
        <article className="panel narrativePanel">
          <div className="panelHeader">
            <p className="eyebrow">Step 03. Deeper Insight</p>
            <h2>얼굴 분석 결과에 숨겨진 또 다른 당신을 만나보세요.</h2>
            <p>
              얼굴 분석으로 보이는 인상과 마음 모양 테스트로 읽힌 흐름을 합치면,
              처음보다 훨씬 더 깊은 당신의 방향이 보이기 시작합니다.
            </p>
          </div>
          <p className="quote">{report.recommendation.narrative}</p>
          <div className="insightGrid">
            <div>
              <span>마음 모양 연결</span>
              <strong>
                <Bot size={16} />
                {report.robotName ?? "글 잘 쓰는"}
              </strong>
            </div>
            <div>
              <span>비밀 성격 프리뷰</span>
              <strong>{secretProfile.title}</strong>
            </div>
            <div>
              <span>잠재력 간극</span>
              <strong>{report.dissonance.gapScore}</strong>
            </div>
          </div>
          <div className="secretPanel">
            <strong>{secretProfile.summary}</strong>
            <ul className="plainList compact">
              {secretProfile.points.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div className="narrativeCopy">
            <p>{report.dissonance.insight}</p>
            <p>{report.dissonance.recommendation}</p>
          </div>
        </article>

        <div className="ctaStack">
          <ResultSnapshot report={report} />
          <article className="panel actionPanel">
            <p className="eyebrow">Deep Dive</p>
            <h3>심화 분석으로 더 또렷하게</h3>
            <p>
              지금 결과는 시작점입니다. 비밀 성격까지 함께 읽으면 나에게 맞는 스타일과
              브랜딩 문장이 훨씬 더 선명해집니다.
            </p>
            <div className="heroActions">
              <button className="primaryButton" onClick={captureSnapshot} type="button">
                <Download size={18} />
                결과 이미지 저장
              </button>
              <a
                className="secondaryButton"
                href="mailto:changmin140911@gmail.com?subject=BOP%20심화%20분석%20문의"
              >
                <ArrowRight size={18} />
                심화 분석 신청하기
              </a>
            </div>
            <div className="securityNote">
              <p>{report.security.storageMode}</p>
              <p>{report.security.retention}</p>
            </div>
            <div className="privacyPill">
              <Lock size={14} />
              <span>{report.security.privacyNote}</span>
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}

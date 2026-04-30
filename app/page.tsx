"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  ArrowRight,
  Camera,
  Download,
  ImagePlus,
  Lock,
  ScanFace,
  ShieldCheck,
  Sparkles
} from "lucide-react";
import html2canvas from "html2canvas";
import {
  questionnaire,
  buildFallbackReport,
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
          <span>Potential Gap</span>
          <strong>{report.dissonance.gapScore}</strong>
        </div>
        <div>
          <span>Persona</span>
          <strong>{report.profile.archetypeLine}</strong>
        </div>
      </div>
    </article>
  );
}

async function captureSnapshot() {
  const target = document.getElementById("result-snapshot");
  if (!target) {
    return;
  }

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
          <strong>정면 사진을 업로드하면 분석 오버레이가 여기에 표시됩니다.</strong>
          <span>밝은 자연광, 눈/코/입이 잘 보이는 단일 인물 사진이 가장 좋습니다.</span>
        </div>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [brandFocus, setBrandFocus] = useState("");
  const [consentToStore, setConsentToStore] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<QuestionnaireId, string>>({
    presence: "refined",
    decision: "structure",
    tension: "safe",
    energy: "authority",
    expression: "editorial"
  });
  const [selectedLabels, setSelectedLabels] = useState<Record<QuestionnaireId, string>>({
    presence: "정제된 신뢰감",
    decision: "완성도와 기준",
    tension: "너무 무난하게 보임",
    energy: "전문성과 밀도",
    expression: "도시적 에디토리얼"
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [report, setReport] = useState<ReportData>(buildFallbackReport());
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [statusMessage, setStatusMessage] = useState(
    "이미지와 성향 답변을 결합해 브랜딩 리포트를 생성할 준비가 되어 있습니다."
  );
  const [engineNote, setEngineNote] = useState("데모 리포트가 로드되어 있습니다.");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadHistory() {
      try {
        const response = await fetch("/api/reports", { cache: "no-store" });
        const data = (await response.json()) as { reports: HistoryItem[] };
        if (active) {
          setHistory(data.reports);
        }
      } catch {
        if (active) {
          setHistory([]);
        }
      }
    }

    void loadHistory();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function updateAnswer(id: QuestionnaireId, value: string, label: string) {
    setSelectedAnswers((current) => ({ ...current, [id]: value }));
    setSelectedLabels((current) => ({ ...current, [id]: label }));
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) {
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setErrorMessage("");
    setStatusMessage("사진이 준비되었습니다. 이제 분석을 시작하면 결과가 생성됩니다.");
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

    setErrorMessage("");
    setStatusMessage("얼굴 구조와 질문 응답을 함께 읽어 리포트를 생성하고 있습니다.");

    startTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("image", selectedFile);
        formData.set("nickname", nickname);
        formData.set("brandFocus", brandFocus);
        formData.set("consentToStore", String(consentToStore));
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
          <p className="eyebrow">Mirror x Inner Report Engine</p>
          <h1>이미지를 브랜드 언어로 번역하는 리포트</h1>
          <p className="lead">
            얼굴 구조, 선감, 톤, 자기표현 응답을 하나의 분석 흐름으로 묶어 텍스트 리포트와
            무드 이미지까지 함께 생성합니다.
          </p>
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

      <section className="section gridLayout">
        <article className="panel intakePanel">
          <div className="panelHeader">
            <p className="eyebrow">Intake</p>
            <h2>업로드와 성향 입력</h2>
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
                placeholder="예: 1:1 컨설팅 전환이 잘 되는 프로필 이미지"
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
              <li>분석 문구는 브랜딩 해석에 한정하며 성격이나 심리 상태를 얼굴에서 진단하지 않습니다.</li>
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
            <p className="eyebrow">Generated Moodboard</p>
            <h3>Best Hair & Makeup</h3>
            {report.generatedImage?.dataUrl ? (
              <img
                alt={report.generatedImage.alt}
                className="generatedImage"
                src={report.generatedImage.dataUrl}
              />
            ) : (
              <div className="generatedFallback">
                <Sparkles size={22} />
                <strong>무드 이미지가 준비되면 이 영역에 표시됩니다.</strong>
                <span>{report.recommendation.profileMood}</span>
              </div>
            )}
            <ul className="plainList compact">
              <li>{report.recommendation.hair}</li>
              <li>{report.recommendation.makeup}</li>
              <li>{report.recommendation.profileMood}</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="section insightSection">
        <article className="panel narrativePanel">
          <div className="panelHeader">
            <p className="eyebrow">Inner Connection</p>
            <h2>{report.dissonance.tensionLabel}</h2>
          </div>
          <p className="quote">{report.recommendation.narrative}</p>
          <div className="insightGrid">
            <div>
              <span>Enneagram</span>
              <strong>
                Type {report.inner.enneagramType} / {report.inner.wing}
              </strong>
            </div>
            <div>
              <span>Expression Need</span>
              <strong>{report.inner.expressionDesire}</strong>
            </div>
            <div>
              <span>Potential Gap</span>
              <strong>{report.dissonance.gapScore}</strong>
            </div>
          </div>
          <div className="narrativeCopy">
            <p>{report.dissonance.insight}</p>
            <p>{report.dissonance.recommendation}</p>
            <p>{report.inner.brandNeed}</p>
          </div>
        </article>

        <div className="ctaStack">
          <ResultSnapshot report={report} />
          <article className="panel actionPanel">
            <p className="eyebrow">Export & Follow-up</p>
            <h3>결과 저장과 다음 단계</h3>
            <p>{report.security.storageMode}</p>
            <p>{report.security.retention}</p>
            <div className="heroActions">
              <button className="primaryButton" onClick={captureSnapshot} type="button">
                <Download size={18} />
                결과 이미지 저장
              </button>
              <a className="secondaryButton" href="mailto:changmin140911@gmail.com">
                <ArrowRight size={18} />
                1:1 해석 연결
              </a>
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

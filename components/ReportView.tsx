"use client";

import {
  ArrowRight,
  Bot,
  Camera,
  Download,
  Heart,
  Home,
  Lock,
  Palette,
  Shirt,
  Sparkles
} from "lucide-react";
import html2canvas from "html2canvas";
import type { ReportData } from "@/lib/report-types";

const scoreLabels = {
  softness: "부드러움",
  clarity: "선명도",
  elegance: "세련미",
  approachability: "접근성"
} as const;

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
    outfits: report.recommendation.outfitDetails ?? [
      `${report.color.seasonLabel} 팔레트를 활용한 톤온톤 스타일`,
      silhouetteHint,
      `${report.profile.keywords[1]}이 살아나는 작고 정제된 액세서리`
    ],
    beauty: report.recommendation.beautyDetails ?? [
      report.recommendation.hair,
      report.recommendation.makeup,
      `${report.color.undertone} 톤을 살린 립과 블러셔 조합`
    ],
    mood:
      report.recommendation.moodDetails ??
      (moodItems.length > 0
        ? moodItems
        : [
            report.recommendation.profileMood,
            "정돈된 배경과 부드러운 조명",
            "과한 연출보다 자연스러운 시선 처리"
          ]),
    photo: report.recommendation.photoDirection ?? [
      "얼굴은 살짝 사선으로 두어 윤곽을 부드럽게 정리",
      "상체와 어깨선은 힘을 빼고 자연스럽게",
      "옷과 배경의 톤 차이를 한 단계만 주기"
    ]
  };
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
          <span>분석 깊이</span>
          <strong>{report.robotName ?? "글 잘 쓰는"}</strong>
        </div>
        <div>
          <span>취향 선명도</span>
          <strong>{report.dissonance.gapScore}</strong>
        </div>
      </div>
    </article>
  );
}

export function ReportView({ report }: { report: ReportData }) {
  const styleGuide = buildStyleGuide(report);
  const secretProfile = {
    title: `숨은 취향 코드 ${report.inner.enneagramType}-${report.inner.wing.replace(/\D/g, "")}`,
    summary:
      "취향 질문보다 한층 깊게, 당신이 무엇을 원하고 어떤 스타일에서 더 자연스러워지는지 읽어보는 단계입니다.",
    points: [
      report.inner.expressionDesire,
      report.inner.stressSignal,
      report.inner.brandNeed
    ]
  };

  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="section reportHero">
        <p className="eyebrow">Analysis Complete</p>
        <h1>{report.profile.persona}</h1>
        <p className="lead">{report.profile.summary}</p>
        <div className="keywordRow">
          {report.profile.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
      </section>

      <section className="section reportSection">
        <div className="reportGrid">
          <article className="panel featurePanel">
            <p className="eyebrow">Image Balance</p>
            <h3>인상 밸런스</h3>
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
            <p className="eyebrow">Mood Points</p>
            <h3>분위기를 만드는 포인트</h3>
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
            <p className="eyebrow">Best Tone</p>
            <h3>{report.color.seasonLabel}</h3>
            <p>{report.color.undertone}</p>
            <div className="paletteRow large">
              {report.color.palette.map((color) => (
                <span key={color} style={{ background: color }} title={color} />
              ))}
            </div>
            <p className="subtleCopy">{report.color.note}</p>
            {report.recommendation.toneReason ? (
              <p className="toneReason">{report.recommendation.toneReason}</p>
            ) : null}
          </article>

          <article className="panel imagePanel">
            <p className="eyebrow">Style Formula</p>
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
                  <strong>AI 스타일 무드보드가 준비되면 이 영역에 표시됩니다.</strong>
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
              <div className="miniInfoCard wideMiniCard">
                <div className="miniInfoHeader">
                  <Camera size={16} />
                  <strong>사진 무드 가이드</strong>
                </div>
                <ul className="plainList compact">
                  {styleGuide.photo.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </article>
        </div>
      </section>

      <section className="section insightSection">
        <article className="panel narrativePanel">
          <div className="panelHeader">
            <p className="eyebrow">Hidden Taste</p>
            <h2>보이는 분위기 너머의 숨은 취향</h2>
            <p>사진에서 보이는 인상과 선택한 답변을 함께 읽으면, 스타일의 방향이 훨씬 선명해집니다.</p>
          </div>
          <p className="quote">{report.recommendation.narrative}</p>
          <div className="insightGrid">
            <div>
              <span>분석 깊이</span>
              <strong>
                <Bot size={16} />
                {report.robotName ?? "글 잘 쓰는"}
              </strong>
            </div>
            <div>
              <span>숨은 취향 프리뷰</span>
              <strong>{secretProfile.title}</strong>
            </div>
            <div>
              <span>취향 선명도</span>
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
            <p className="eyebrow">Export & Next</p>
            <h3>결과 저장과 심화 분석</h3>
            <p>결과 이미지를 저장하고, 필요하면 더 구체적인 스타일 코칭으로 이어갈 수 있어요.</p>
            <div className="heroActions">
              <button className="primaryButton" onClick={captureSnapshot} type="button">
                <Download size={18} />
                결과 이미지 저장
              </button>
              <a
                className="secondaryButton"
                href="/apply"
              >
                <ArrowRight size={18} />
                스타일 코칭 신청하기
              </a>
              <a className="secondaryButton" href="/">
                <Home size={18} />
                처음으로 돌아가기
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

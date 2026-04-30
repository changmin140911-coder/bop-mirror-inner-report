"use client";

import { ArrowRight, Bot, Download, Heart, Lock, Palette, Shirt, Sparkles } from "lucide-react";
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

export function ReportView({ report }: { report: ReportData }) {
  const styleGuide = buildStyleGuide(report);
  const secretProfile = {
    title: `에니어그램 ${report.inner.enneagramType}번 ${report.inner.wing}`,
    summary:
      "마음 모양 테스트보다 한층 깊게, 당신이 무엇을 원하고 어디에서 에너지가 소모되는지 읽어보는 단계입니다.",
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
            <p className="eyebrow">Personal Color</p>
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
                  <strong>AI 무드보드가 준비되면 이 영역에 표시됩니다.</strong>
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
      </section>

      <section className="section insightSection">
        <article className="panel narrativePanel">
          <div className="panelHeader">
            <p className="eyebrow">Deep Insight</p>
            <h2>얼굴 분석 결과에 숨겨진 또 다른 당신</h2>
            <p>보이는 인상과 마음 모양을 함께 읽으면, 스타일의 방향이 훨씬 선명해집니다.</p>
          </div>
          <p className="quote">{report.recommendation.narrative}</p>
          <div className="insightGrid">
            <div>
              <span>AI 분석 단계</span>
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
            <p className="eyebrow">Export & Next</p>
            <h3>결과 저장과 심화 분석</h3>
            <p>결과 이미지를 저장하고, 필요하면 에니어그램 심화 유형까지 이어서 확인할 수 있어요.</p>
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

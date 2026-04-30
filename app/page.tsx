"use client";

import { ArrowRight, CalendarDays, Camera, Download, FileText, Lock, Sparkles } from "lucide-react";
import { demoReport, type ReportData } from "@/lib/demo-report";

const scoreLabels: Record<string, string> = {
  softness: "부드러움",
  clarity: "선명도",
  elegance: "세련미",
  approachability: "접근성"
};

async function captureSnapshot() {
  const target = document.getElementById("snapshot-card");
  if (!target) return;

  const html2canvas = (await import("html2canvas")).default;
  const canvas = await html2canvas(target, {
    scale: 2,
    backgroundColor: null,
    useCORS: true
  });

  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = "bop-mirror-inner-report.png";
  link.click();
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

function AnalysisPortrait() {
  return (
    <div className="portraitPanel" aria-label="Vision AI 얼굴 분석 데모">
      <div className="portraitImage" />
      <div className="scanLine" />
      <div className="faceGuide outline" />
      <div className="faceGuide upper" />
      <div className="faceGuide middle" />
      <div className="faceGuide lower" />
      <span className="landmark eyeLeft" />
      <span className="landmark eyeRight" />
      <span className="landmark nose" />
      <span className="landmark mouth" />
      <div className="scanLabel">Mirror Analysis</div>
    </div>
  );
}

function SnapshotCard({ data }: { data: ReportData }) {
  return (
    <article id="snapshot-card" className="snapshotCard">
      <p className="eyebrow">BOP Mirror x Inner</p>
      <h3>{data.profile.persona}</h3>
      <p>{data.profile.summary}</p>
      <div className="snapshotKeywords">
        {data.profile.keywords.map((keyword) => (
          <span key={keyword}>{keyword}</span>
        ))}
      </div>
      <div className="palette" aria-label="추천 컬러 팔레트">
        {data.color.palette.map((color) => (
          <span key={color} style={{ background: color }} />
        ))}
      </div>
      <div className="snapshotGap">
        <span>Potential Gap</span>
        <strong>{data.dissonance.gapScore}</strong>
      </div>
    </article>
  );
}

export default function Home() {
  const data = demoReport;

  return (
    <main>
      <div className="noise" />
      <section className="hero section">
        <div className="heroCopy reveal">
          <p className="eyebrow">AI Personal Branding Report</p>
          <h1>BOP Mirror x Inner</h1>
          <p className="lead">
            얼굴의 시각적 단서와 내면의 표현 방향을 하나의 브랜드 언어로 정렬하는
            프리미엄 리포트 프로토타입입니다.
          </p>
          <div className="heroActions">
            <a className="primaryButton" href="#report">
              <Sparkles size={18} />
              리포트 보기
            </a>
            <button className="iconButton" onClick={captureSnapshot} aria-label="결과 이미지 저장">
              <Download size={20} />
            </button>
          </div>
        </div>
        <AnalysisPortrait />
      </section>

      <section id="report" className="section reportHeader reveal">
        <p className="eyebrow">Section 01-03</p>
        <h2>{data.profile.persona}</h2>
        <p>{data.profile.summary}</p>
        <div className="keywordGrid">
          {data.profile.keywords.map((keyword) => (
            <span key={keyword}>{keyword}</span>
          ))}
        </div>
      </section>

      <section className="section split reveal">
        <article className="glassCard">
          <p className="eyebrow">Face Shape</p>
          <h2>{data.mirror.faceShapeLabel}</h2>
          <p>{data.mirror.proportion.label}</p>
          <div className="ratioBars">
            <span style={{ height: `${data.mirror.proportion.upper * 1.5}px` }}>상안부</span>
            <span style={{ height: `${data.mirror.proportion.middle * 1.5}px` }}>중안부</span>
            <span style={{ height: `${data.mirror.proportion.lower * 1.5}px` }}>하안부</span>
          </div>
        </article>

        <article className="glassCard">
          <p className="eyebrow">Feature Line</p>
          <h2>{data.mirror.lineTypeLabel}</h2>
          <div className="scoreStack">
            {Object.entries(data.mirror.scores).map(([key, value]) => (
              <GaugeBar key={key} label={scoreLabels[key] ?? key} value={value} />
            ))}
          </div>
        </article>
      </section>

      <section className="section split reveal">
        <article className="glassCard colorCard">
          <p className="eyebrow">Personal Color</p>
          <h2>{data.color.seasonLabel}</h2>
          <div className="palette large">
            {data.color.palette.map((color) => (
              <span key={color} style={{ background: color }} title={color} />
            ))}
          </div>
          <p>맑은 대비와 은은한 로즈 톤이 시각적 신뢰감을 부드럽게 강화합니다.</p>
        </article>

        <article className="glassCard moodboard">
          <p className="eyebrow">Best Hair & Makeup</p>
          <h2>Editorial Moodboard</h2>
          <ul>
            <li>{data.recommendation.hair}</li>
            <li>{data.recommendation.makeup}</li>
            <li>{data.recommendation.profileMood}</li>
          </ul>
        </article>
      </section>

      <section className="section reveal">
        <article className="glassCard narrativeCard">
          <p className="eyebrow">Section 07-08</p>
          <h2>Inner Brand Narrative</h2>
          <p className="bigQuote">{data.recommendation.narrative}</p>
          <div className="innerGrid">
            <div>
              <span>Core Type</span>
              <strong>Type {data.inner.enneagramType}</strong>
            </div>
            <div>
              <span>Wing</span>
              <strong>{data.inner.wing}</strong>
            </div>
            <div>
              <span>Expression</span>
              <strong>{data.inner.expressionDesire}</strong>
            </div>
          </div>
        </article>
      </section>

      <section className="section reveal">
        <article className="gapSection">
          <div>
            <p className="eyebrow">Balance of Potential</p>
            <h2>{data.dissonance.tensionLabel}</h2>
            <p>{data.dissonance.insight}</p>
            <p>{data.dissonance.recommendation}</p>
          </div>
          <div className="gapDial" aria-label={`Potential gap ${data.dissonance.gapScore}`}>
            <strong>{data.dissonance.gapScore}</strong>
            <span>Gap Score</span>
          </div>
        </article>
      </section>

      <section className="section finalCta reveal">
        <SnapshotCard data={data} />
        <div className="ctaCopy">
          <p className="eyebrow">The Real Inner Data</p>
          <h2>리포트의 심층 해석을 위한 다음 단계</h2>
          <p>
            AI 리포트에서 발견된 시각적 단서와 내면의 표현 방향을 BOP 세션에서
            실제 스타일, 프로필 이미지, 브랜드 톤으로 구체화합니다.
          </p>
          <div className="ctaRow">
            <button className="secondaryButton" onClick={captureSnapshot}>
              <Camera size={18} />
              이미지 저장
            </button>
            <a className="secondaryButton" href="/api/report" target="_blank">
              <FileText size={18} />
              JSON 보기
            </a>
            <a className="pulseButton" href="#booking">
              <CalendarDays size={18} />
              BOP 밸런스 세션 예약
              <ArrowRight size={18} />
            </a>
          </div>
          <p className="privacyNote">
            <Lock size={14} />
            실제 서비스에서는 원본 사진을 임시 저장 후 자동 삭제하고, 분석 데이터는 동의 기반으로만 보관합니다.
          </p>
        </div>
      </section>
    </main>
  );
}

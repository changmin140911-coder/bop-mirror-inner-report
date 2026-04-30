"use client";

import type { ReactNode } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Brush,
  Camera,
  Download,
  Eye,
  Heart,
  Home,
  Layers,
  Lock,
  Palette,
  Printer,
  Scissors,
  Shirt,
  Sparkles,
  UserRound
} from "lucide-react";
import html2canvas from "html2canvas";
import { normalizeReportData, type FitCard, type ReportPageModel } from "@/lib/report-mapping";
import type { ReportData } from "@/lib/report-types";

const scoreLabels = {
  softness: "부드러움",
  clarity: "선명도",
  elegance: "세련미",
  approachability: "접근성"
} as const;

type ReportPageProps = {
  number: string;
  kicker: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
};

function getFitClass(label: FitCard["label"]) {
  if (label === "추천") return "best";
  if (label === "주의") return "care";
  return "avoid";
}

async function captureReport() {
  const target = document.getElementById("premium-report");
  if (!target) return;

  const canvas = await html2canvas(target, {
    scale: 1.5,
    backgroundColor: "#fbf8f3",
    useCORS: true
  });

  const anchor = document.createElement("a");
  anchor.href = canvas.toDataURL("image/png");
  anchor.download = "bop-personal-styling-report.png";
  anchor.click();
}

function ReportPage({ number, kicker, title, subtitle, children, className = "" }: ReportPageProps) {
  return (
    <section className={`reportPage ${className}`}>
      <div className="reportPageHeader">
        <span>{number}</span>
        <div>
          <p>{kicker}</p>
          <h2>{title}</h2>
        </div>
      </div>
      {subtitle ? <p className="reportPageLead">{subtitle}</p> : null}
      {children}
    </section>
  );
}

function SummaryCard({ title, body }: { title: string; body: string }) {
  return (
    <article className="pdfMiniCard">
      <span>{title}</span>
      <p>{body}</p>
    </article>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="pdfBulletList">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function SwatchRow({ colors, label }: { colors: string[]; label?: string }) {
  return (
    <div className="pdfSwatchGroup">
      {label ? <strong>{label}</strong> : null}
      <div className="pdfSwatchRow">
        {colors.map((color, index) => (
          <span key={`${color}-${index}`} style={{ background: color }}>
            <em>{color}</em>
          </span>
        ))}
      </div>
    </div>
  );
}

function FitCardGrid({ cards }: { cards: FitCard[] }) {
  return (
    <div className="fitCardGrid">
      {cards.map((card) => (
        <article className={`fitCard ${getFitClass(card.label)}`} key={card.title}>
          <div className="fitCardTop">
            <strong>{card.title}</strong>
            <span>{card.label}</span>
          </div>
          {typeof card.score === "number" ? (
            <div className="fitMeter" aria-label={`${card.title} 적합도 ${card.score}%`}>
              <i style={{ width: `${card.score}%` }} />
            </div>
          ) : null}
          <p>{card.body}</p>
        </article>
      ))}
    </div>
  );
}

function ReportCover({ report, data }: { report: ReportData; data: ReportPageModel }) {
  return (
    <section className="reportPage reportCover">
      <div className="coverTopline">
        <span>BOP Mirror x Inner</span>
        <span>{data.createdLabel}</span>
      </div>
      <div className="coverGrid">
        <div className="coverCopy">
          <p className="eyebrow">AI Personal Styling Report</p>
          <h1>{report.profile.persona}</h1>
          <p>{data.summarySentence}</p>
          <div className="coverKeywordRow">
            {data.keywords.map((keyword) => (
              <span key={keyword}>{keyword}</span>
            ))}
          </div>
        </div>
        <div className="coverIdentity">
          <div className="initialSeal">{data.clientInitial}</div>
          <p>Prepared for</p>
          <h3>{data.clientName}</h3>
          <span>{report.robotName ?? "AI Styling"} / {report.source ?? "report"}</span>
        </div>
      </div>
      <div className="coverBottom">
        <p>{report.profile.archetypeLine}</p>
        <span>Personal Image · Color · Hair · Makeup · Mood Direction</span>
      </div>
    </section>
  );
}

function ReportOverview({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="01"
      kicker="Consulting Overview"
      title="이번 리포트가 읽은 것"
      subtitle="사진에서 보이는 인상 데이터와 사용자가 직접 선택한 취향 답변을 한 번에 엮어, 실제 스타일링으로 옮길 수 있는 방향만 정리했습니다."
    >
      <div className="pdfCardGrid three">
        {data.overview.map((item) => (
          <SummaryCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
      <div className="editorialNote">
        <BadgeCheck size={18} />
        <p>
          이 리포트는 얼굴을 평가하는 문서가 아니라, 이미 가진 분위기를 더 잘 보이게 만드는
          스타일 설계서입니다. 모든 제안은 단점보다 보완 방향을 중심으로 작성되었습니다.
        </p>
      </div>
    </ReportPage>
  );
}

function ImageDiagnosisSection({ data, report }: { data: ReportPageModel; report: ReportData }) {
  return (
    <ReportPage
      number="02"
      kicker="Image Diagnosis"
      title="전체 이미지 진단"
      subtitle={data.imageDiagnosis.impression}
    >
      <div className="diagnosisLayout">
        <div>
          <h3>{report.profile.summary}</h3>
          <p>{data.imageDiagnosis.balance}</p>
          <div className="pdfTagRow">
            {data.imageDiagnosis.mood.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <div className="scoreBook">
          {Object.entries(report.mirror.scores).map(([key, value]) => (
            <div className="scoreLine" key={key}>
              <span>{scoreLabels[key as keyof typeof scoreLabels]}</span>
              <strong>{value}%</strong>
              <i>
                <b style={{ width: `${value}%` }} />
              </i>
            </div>
          ))}
        </div>
      </div>
      <div className="pdfCardGrid two">
        {data.imageDiagnosis.strengths.map((item, index) => (
          <SummaryCard key={item} title={`강점 ${String(index + 1).padStart(2, "0")}`} body={item} />
        ))}
      </div>
    </ReportPage>
  );
}

function InnerPreferenceSection({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="03"
      kicker="Inner Preference"
      title="내면 취향 분석"
      subtitle="취향 답변은 지금 어떤 이미지를 원하는지, 어떤 스타일에서 자연스러워지는지를 보여주는 중요한 단서입니다."
    >
      <div className="wideStatement">
        <span>Style Goal</span>
        <p>{data.innerPreference.goal}</p>
      </div>
      <div className="pdfCardGrid three">
        {data.innerPreference.preferenceCards.map((item) => (
          <SummaryCard key={item.body} title={item.title} body={item.body} />
        ))}
      </div>
      <div className="twoColumnText">
        <div>
          <h3>원하는 이미지</h3>
          <p>{data.innerPreference.desire}</p>
        </div>
        <div>
          <h3>브랜딩 방향</h3>
          <p>{data.innerPreference.direction}</p>
        </div>
      </div>
      <BulletList items={data.innerPreference.answerHighlights} />
    </ReportPage>
  );
}

function FaceBalanceSection({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="04"
      kicker="Face Shape & Balance"
      title="얼굴형과 윤곽 밸런스"
      subtitle="얼굴형은 스타일의 제한이 아니라, 어떤 선과 여백을 선택하면 더 고급스럽게 보이는지 알려주는 기준입니다."
    >
      <div className="balanceGrid">
        <SummaryCard title="얼굴형" body={data.faceBalance.shape} />
        <SummaryCard title="선의 느낌" body={data.faceBalance.line} />
        <SummaryCard title="비율 해석" body={data.faceBalance.proportionLabel} />
      </div>
      <div className="proportionBoard">
        {data.faceBalance.proportion.map((item) => (
          <div key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}%</strong>
            <i style={{ height: `${Math.max(34, item.value * 1.7)}px` }} />
          </div>
        ))}
      </div>
      <p className="editorialParagraph">{data.faceBalance.comment}</p>
    </ReportPage>
  );
}

function FeatureMoodSection({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="05"
      kicker="Feature Mood"
      title="이목구비 분위기 분석"
      subtitle="민감한 단정 대신, 스타일링에서 활용할 수 있는 조화감과 포인트를 중심으로 정리했습니다."
    >
      <div className="pdfCardGrid two">
        {data.features.map((item) => (
          <SummaryCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
    </ReportPage>
  );
}

function HairLengthGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="06"
      kicker="Hair Length Guide"
      title="헤어 길이 가이드"
      subtitle="머리 길이는 얼굴형을 바꾸는 요소가 아니라, 얼굴 주변 여백을 어떻게 설계할지 정하는 요소입니다."
    >
      <div className="heroGuideCard">
        <Scissors size={24} />
        <span>추천 길이</span>
        <h3>{data.hairLength.recommended}</h3>
        <p>{data.hairLength.reason}</p>
      </div>
      <div className="editorialNote">
        <Layers size={18} />
        <p>{data.hairLength.caution}</p>
      </div>
    </ReportPage>
  );
}

function BangsGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="07"
      kicker="Bangs Guide"
      title="앞머리 적합도"
      subtitle="앞머리는 인상을 크게 바꾸는 요소라서, 어울림보다 먼저 답답함이 생기지 않는지를 확인하는 것이 중요합니다."
    >
      <FitCardGrid cards={data.bangs} />
    </ReportPage>
  );
}

function HairAvoidGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="08"
      kicker="Hair Avoid Guide"
      title="줄이면 좋은 헤어 방향"
      subtitle="어울리지 않는다는 뜻이 아니라, 현재 분위기를 더 잘 살리기 위해 강도를 조절하면 좋은 요소입니다."
    >
      <div className="pdfCardGrid three">
        {data.hairAvoid.map((item) => (
          <SummaryCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
    </ReportPage>
  );
}

function BaseMakeupGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="09"
      kicker="Base Makeup"
      title="베이스 메이크업 가이드"
      subtitle="피부 표현은 화려함보다 얼굴빛이 맑게 보이는 질감과 두께가 핵심입니다."
    >
      <FitCardGrid cards={data.baseMakeup} />
      <div className="pdfTagRow textureTags">
        {data.color.textures.map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>
    </ReportPage>
  );
}

function EyeMakeupGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="10"
      kicker="Eye Makeup"
      title="아이 메이크업 가이드"
      subtitle="눈매는 크게 바꾸기보다 선과 음영의 두께를 조절할 때 가장 자연스럽게 살아납니다."
    >
      <div className="pdfCardGrid three">
        {data.eyeMakeup.map((item) => (
          <SummaryCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
    </ReportPage>
  );
}

function ContourHighlightGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="11"
      kicker="Contour & Highlight"
      title="쉐딩과 하이라이트"
      subtitle="윤곽 보완은 많이 덜어내는 방식보다 빛과 그림자의 위치를 작게 잡는 편이 더 세련됩니다."
    >
      <div className="pdfCardGrid three">
        {data.contour.map((item) => (
          <SummaryCard key={item.title} title={item.title} body={item.body} />
        ))}
      </div>
    </ReportPage>
  );
}

function FashionMoodSection({ report, data }: { report: ReportData; data: ReportPageModel }) {
  return (
    <ReportPage
      number="12"
      kicker="Fashion Mood"
      title="패션 무드 제안"
      subtitle="옷은 얼굴 분위기를 가리는 장식이 아니라, 첫인상이 더 쉽게 읽히도록 돕는 배경입니다."
    >
      {report.generatedImage?.dataUrl ? (
        <figure className="moodboardFigure">
          <img src={report.generatedImage.dataUrl} alt={report.generatedImage.alt} />
          <figcaption>AI가 생성한 스타일 무드보드</figcaption>
        </figure>
      ) : (
        <div className="moodboardFallback">
          <Sparkles size={24} />
          <strong>무드보드 이미지가 없는 리포트예요.</strong>
          <span>대신 현재 분석 데이터로 스타일 방향을 세밀하게 정리했습니다.</span>
        </div>
      )}
      <div className="moodGrid">
        {data.fashionMoods.map((item) => (
          <article className="moodCard" key={item.name}>
            <span>{item.name}</span>
            <p>{item.reason}</p>
            <BulletList items={item.items} />
          </article>
        ))}
      </div>
    </ReportPage>
  );
}

function NecklineGuide({ data }: { data: ReportPageModel }) {
  return (
    <ReportPage
      number="13"
      kicker="Neckline Guide"
      title="넥라인 가이드"
      subtitle={data.neckline.reason}
    >
      <div className="twoColumnText">
        <div>
          <h3>어울리는 넥라인</h3>
          <BulletList items={data.neckline.recommended} />
        </div>
        <div>
          <h3>주의하면 좋은 넥라인</h3>
          <BulletList items={data.neckline.avoid} />
        </div>
      </div>
    </ReportPage>
  );
}

function ColorPaletteGuide({ data, report }: { data: ReportPageModel; report: ReportData }) {
  return (
    <ReportPage
      number="14"
      kicker="Color Guide"
      title="컬러 팔레트 가이드"
      subtitle={report.recommendation.toneReason ?? data.color.note}
    >
      <div className="colorHero">
        <div>
          <span>Best Tone</span>
          <h3>{data.color.season}</h3>
          <p>{data.color.undertone}</p>
        </div>
        <SwatchRow colors={data.color.palette} />
      </div>
      <div className="pdfCardGrid two">
        <SummaryCard title="활용 방법" body={data.color.bestUse.join(" / ")} />
        <SummaryCard title="주의 컬러" body="얼굴 가까이에 넓게 쓰기보다 하의나 작은 소품으로 낮춰 활용하는 편이 좋습니다." />
      </div>
      <SwatchRow colors={data.color.avoid} label="줄이면 좋은 컬러" />
      <p className="subtleCopy">{data.color.note}</p>
    </ReportPage>
  );
}

function FinalSummarySection({ data }: { data: ReportPageModel }) {
  const summary = [
    { icon: Scissors, title: "Hair", body: data.finalSummary.hair },
    { icon: Brush, title: "Makeup", body: data.finalSummary.makeup },
    { icon: Shirt, title: "Fashion", body: data.finalSummary.fashion },
    { icon: Palette, title: "Color", body: data.finalSummary.color },
    { icon: Heart, title: "Image", body: data.finalSummary.image }
  ];

  return (
    <ReportPage
      number="15"
      kicker="Final Styling Summary"
      title="최종 스타일링 요약"
      subtitle="전체 리포트를 실제 스타일링으로 옮길 때 가장 먼저 기억하면 좋은 핵심 공식입니다."
    >
      <div className="summaryMatrix">
        {summary.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title}>
              <Icon size={18} />
              <span>{item.title}</span>
              <p>{item.body}</p>
            </article>
          );
        })}
      </div>
      <div className="wideStatement">
        <span>Next Direction</span>
        <p>{data.finalSummary.next}</p>
      </div>
    </ReportPage>
  );
}

function ExportSection({ report }: { report: ReportData }) {
  return (
    <section className="reportPage exportPage">
      <div>
        <p className="eyebrow">Export & Next</p>
        <h2>리포트를 저장하고 다음 단계로 이어가기</h2>
        <p>
          결과 이미지를 저장하거나 브라우저 인쇄 기능으로 PDF 저장을 할 수 있습니다.
          더 구체적인 옷, 메이크업, 촬영 방향은 스타일 코칭 신청 페이지에서 이어갈 수 있어요.
        </p>
      </div>
      <div className="reportActionGrid">
        <button className="primaryButton" onClick={() => void captureReport()} type="button">
          <Download size={18} />
          리포트 이미지 저장
        </button>
        <button className="secondaryButton" onClick={() => window.print()} type="button">
          <Printer size={18} />
          PDF로 저장하기
        </button>
        <a className="secondaryButton" href="/apply">
          <ArrowRight size={18} />
          스타일 코칭 신청하기
        </a>
        <a className="secondaryButton" href="/">
          <Home size={18} />
          처음으로 돌아가기
        </a>
      </div>
      <div className="reportSecurityBox">
        <Lock size={16} />
        <div>
          <p>{report.security.storageMode}</p>
          <p>{report.security.retention}</p>
          <p>{report.security.privacyNote}</p>
        </div>
      </div>
    </section>
  );
}

export function ReportView({ report }: { report: ReportData }) {
  const data = normalizeReportData(report);

  return (
    <main className="pageShell reportBookShell">
      <div className="textureLayer" />
      <nav className="reportFloatingNav" aria-label="리포트 빠른 동작">
        <a href="#premium-report">
          <UserRound size={16} />
          Report
        </a>
        <button onClick={() => window.print()} type="button">
          <Printer size={16} />
          PDF
        </button>
        <a href="/start">
          <Eye size={16} />
          다시 분석
        </a>
      </nav>
      <div className="reportBook" id="premium-report">
        <ReportCover report={report} data={data} />
        <ReportOverview data={data} />
        <ImageDiagnosisSection data={data} report={report} />
        <InnerPreferenceSection data={data} />
        <FaceBalanceSection data={data} />
        <FeatureMoodSection data={data} />
        <HairLengthGuide data={data} />
        <BangsGuide data={data} />
        <HairAvoidGuide data={data} />
        <BaseMakeupGuide data={data} />
        <EyeMakeupGuide data={data} />
        <ContourHighlightGuide data={data} />
        <FashionMoodSection report={report} data={data} />
        <NecklineGuide data={data} />
        <ColorPaletteGuide data={data} report={report} />
        <FinalSummarySection data={data} />
        <ExportSection report={report} />
      </div>
    </main>
  );
}

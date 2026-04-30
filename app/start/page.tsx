"use client";

import { useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Camera,
  Eye,
  ImagePlus,
  PenLine,
  ScanFace,
  ShieldCheck,
  Sparkles,
  UserRound,
  Zap
} from "lucide-react";
import {
  analysisRobots,
  questionnaire,
  type AnalysisDepth,
  type AnalysisResponse,
  type QuestionnaireAnswer
} from "@/lib/report-types";

function RobotIcon({ icon }: { icon: "eye" | "pen" | "zap" }) {
  if (icon === "eye") return <Eye size={22} />;
  if (icon === "pen") return <PenLine size={22} />;
  return <Zap size={22} />;
}

export default function StartPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [nickname, setNickname] = useState("");
  const [gender, setGender] = useState("여성");
  const [brandFocus, setBrandFocus] = useState("");
  const [consentToStore, setConsentToStore] = useState(true);
  const [selectedRobot, setSelectedRobot] = useState<AnalysisDepth>("standard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questionnaire.map((question) => [question.id, question.options[0].value]))
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("성별과 취향 질문부터 천천히 선택해 주세요.");
  const [isPending, startTransition] = useTransition();

  const progressText = useMemo(() => {
    const answered = questionnaire.filter((question) => answers[question.id]).length;
    return `${answered}/${questionnaire.length} 문항 선택 완료`;
  }, [answers]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];
    if (!nextFile) return;

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setSelectedFile(nextFile);
    setPreviewUrl(URL.createObjectURL(nextFile));
    setErrorMessage("");
    setStatusMessage("사진이 준비되었습니다. 원하는 AI 분석 단계를 선택해 주세요.");
  }

  function buildAnswers(): QuestionnaireAnswer[] {
    return questionnaire.map((question) => {
      const value = answers[question.id] ?? question.options[0].value;
      const option = question.options.find((item) => item.value === value) ?? question.options[0];
      return {
        id: question.id,
        prompt: question.prompt,
        value: option.value,
        label: option.label
      };
    });
  }

  function submitAnalysis() {
    if (!selectedFile) {
      setErrorMessage("분석을 시작하려면 얼굴 사진을 먼저 업로드해 주세요.");
      return;
    }

    setErrorMessage("");
    setStatusMessage("AI가 얼굴 이미지와 마음 모양 데이터를 함께 분석하고 있습니다.");

    startTransition(() => {
      void (async () => {
        const formData = new FormData();
        formData.set("image", selectedFile);
        formData.set("nickname", nickname);
        formData.set("gender", gender);
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

          const reportId = data.report.id ?? `local-${Date.now()}`;
          window.localStorage.setItem(`bop-report-${reportId}`, JSON.stringify(data.report));
          router.push(`/report/${reportId}`);
        } catch (error) {
          setStatusMessage("분석을 완료하지 못했습니다.");
          setErrorMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
        }
      })();
    });
  }

  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="section flowHeader">
        <p className="eyebrow">Start Analysis</p>
        <h1>얼굴 분석을 시작해볼게요.</h1>
        <p className="lead">
          성별, 취향 질문, 사진 등록, 분석 단계 선택 순서로 진행됩니다.
          결과는 전용 리포트 페이지에서 확인할 수 있어요.
        </p>
      </section>

      <section className="section gridLayout flowLayout">
        <article className="panel intakePanel">
          <div className="panelHeader">
            <p className="eyebrow">Step 01</p>
            <h2>기본 정보</h2>
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
              <span>성별</span>
              <select value={gender} onChange={(event) => setGender(event.target.value)}>
                <option value="여성">여성</option>
                <option value="남성">남성</option>
                <option value="응답하지 않음">응답하지 않음</option>
              </select>
            </label>
          </div>
          <label className="field wideField">
            <span>현재 알고 싶은 스타일 방향</span>
            <input
              value={brandFocus}
              onChange={(event) => setBrandFocus(event.target.value)}
              placeholder="예: 나에게 어울리는 이미지와 옷 스타일을 알고 싶어요"
            />
          </label>

          <div className="panelHeader spacedHeader">
            <p className="eyebrow">Step 02</p>
            <h2>취향 질문</h2>
            <p>{progressText}</p>
          </div>
          <div className="questionList longQuestionList">
            {questionnaire.map((question, index) => (
              <div className="questionBlock" key={question.id}>
                <strong>
                  {String(index + 1).padStart(2, "0")}. {question.prompt}
                </strong>
                <div className="optionRow">
                  {question.options.map((option) => {
                    const active = answers[question.id] === option.value;
                    return (
                      <button
                        className={active ? "optionChip active" : "optionChip"}
                        key={option.value}
                        onClick={() =>
                          setAnswers((current) => ({ ...current, [question.id]: option.value }))
                        }
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

          <div className="panelHeader spacedHeader">
            <p className="eyebrow">Step 03</p>
            <h2>사진 등록</h2>
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

          <div className="panelHeader spacedHeader">
            <p className="eyebrow">Step 04</p>
            <h2>분석 단계 선택</h2>
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

          <label className="consentRow">
            <input
              checked={consentToStore}
              onChange={(event) => setConsentToStore(event.target.checked)}
              type="checkbox"
            />
            <span>동의한 경우에만 질문 응답과 결과 요약을 Firebase에 저장합니다.</span>
          </label>
        </article>

        <aside className="sidebarStack stickySide">
          <article className="panel securityPanel">
            <p className="eyebrow">Ready</p>
            <h3>분석 준비 상태</h3>
            <div className="statusRow">
              <UserRound size={16} />
              <span>{gender} / {nickname || "이름 미입력"}</span>
            </div>
            <div className="statusRow">
              <Sparkles size={16} />
              <span>{progressText}</span>
            </div>
            <div className="statusRow">
              <Camera size={16} />
              <span>{selectedFile ? "사진 등록 완료" : "사진 등록 필요"}</span>
            </div>
            <div className="statusRow">
              <ShieldCheck size={16} />
              <span>{statusMessage}</span>
            </div>
            {previewUrl ? (
              <img className="sidePreviewImage" src={previewUrl} alt="업로드 사진 미리보기" />
            ) : null}
            {errorMessage ? <p className="errorCopy">{errorMessage}</p> : null}
            <button className="primaryButton fullButton" onClick={submitAnalysis} disabled={isPending}>
              <ScanFace size={18} />
              {isPending ? "분석 중..." : "분석 결과 보기"}
              <ArrowRight size={18} />
            </button>
          </article>
        </aside>
      </section>
    </main>
  );
}

"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Lock, ShieldCheck, Sparkles } from "lucide-react";

const locations = ["강남", "홍대", "여의도", "가산", "기타"];
const helpTopics = [
  "나에게 어울리는 전체 스타일 방향",
  "퍼스널 컬러와 메이크업 톤",
  "프로필 사진·SNS 이미지",
  "옷장 정리와 쇼핑 기준",
  "중요한 일정 전 스타일 코칭"
];

export default function ApplyPage() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    location: "강남",
    phone: "",
    helpTopic: helpTopics[0],
    availableTime: "",
    privacyAgreed: false,
    pledgeAgreed: false
  });
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function updateField(name: keyof typeof form, value: string | boolean) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  function submitApplication() {
    setMessage("");

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/applications", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(form)
          });
          const data = (await response.json()) as {
            error?: string;
            storedInFirebase?: boolean;
            firebaseConfigured?: boolean;
          };

          if (!response.ok) {
            throw new Error(data.error ?? "신청을 저장하지 못했습니다.");
          }

          setMessage(
            data.storedInFirebase
              ? "신청이 접수되었습니다. 담당자가 일정 확인 후 연락드릴게요."
              : "신청 내용이 확인되었습니다. Firebase 연결 후 실제 저장이 활성화됩니다."
          );
        } catch (error) {
          setMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
        }
      })();
    });
  }

  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="section flowHeader">
        <p className="eyebrow">Private Coaching</p>
        <h1>스타일 코칭 신청</h1>
        <p className="lead">
          리포트에서 확인한 톤과 분위기를 실제 헤어, 메이크업, 옷, 사진 무드까지
          구체적으로 정리하는 1:1 신청 페이지입니다.
        </p>
      </section>

      <section className="section applyLayout">
        <article className="panel applyForm">
          <div className="fieldGrid">
            <label className="field">
              <span>이름</span>
              <input
                value={form.name}
                onChange={(event) => updateField("name", event.target.value)}
                placeholder="예: 김보프"
              />
            </label>
            <label className="field">
              <span>만 나이</span>
              <input
                inputMode="numeric"
                value={form.age}
                onChange={(event) => updateField("age", event.target.value)}
                placeholder="예: 26"
              />
            </label>
          </div>

          <div className="fieldGrid">
            <label className="field">
              <span>선호 장소</span>
              <select
                value={form.location}
                onChange={(event) => updateField("location", event.target.value)}
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>전화번호</span>
              <input
                inputMode="tel"
                value={form.phone}
                onChange={(event) => updateField("phone", event.target.value)}
                placeholder="예: 010-0000-0000"
              />
            </label>
          </div>

          <label className="field wideField">
            <span>가장 도움 받고 싶은 부분</span>
            <select
              value={form.helpTopic}
              onChange={(event) => updateField("helpTopic", event.target.value)}
            >
              {helpTopics.map((topic) => (
                <option key={topic} value={topic}>
                  {topic}
                </option>
              ))}
            </select>
          </label>

          <label className="field wideField">
            <span>만남 가능 시간</span>
            <textarea
              value={form.availableTime}
              onChange={(event) => updateField("availableTime", event.target.value)}
              placeholder="예: 평일 저녁 7시 이후, 토요일 오후 가능"
            />
          </label>

          <div className="noticeBox">
            <strong>일정 안내</strong>
            <p>
              입력한 시간은 참고용입니다. 실제 일정은 코칭사의 가능 시간과 장소 상황을 함께
              확인한 뒤 최종 조율됩니다.
            </p>
          </div>

          <label className="consentRow legalConsent">
            <input
              checked={form.privacyAgreed}
              onChange={(event) => updateField("privacyAgreed", event.target.checked)}
              type="checkbox"
            />
            <span>
              개인정보 수집·이용에 동의합니다. 수집 항목은 이름, 만 나이, 장소, 전화번호,
              도움 받고 싶은 부분, 가능 시간이며 코칭 일정 안내와 본인 확인 목적으로만 사용됩니다.
              관련 법령에 따라 안전하게 관리하고, 목적 달성 후 보관 기간 정책에 맞춰 파기합니다.
            </span>
          </label>

          <label className="consentRow legalConsent">
            <input
              checked={form.pledgeAgreed}
              onChange={(event) => updateField("pledgeAgreed", event.target.checked)}
              type="checkbox"
            />
            <span>
              보안서약에 동의합니다. 신청 과정에서 제공한 사진, 연락처, 리포트 내용은 외부 공개,
              무단 공유, 홍보 활용 없이 예약 확인과 코칭 준비 범위 안에서만 다룹니다.
            </span>
          </label>

          <button className="primaryButton fullButton" onClick={submitApplication} disabled={isPending}>
            <Sparkles size={18} />
            {isPending ? "신청 중..." : "코칭 신청하기"}
          </button>
          {message ? <p className="applyMessage">{message}</p> : null}
        </article>

        <aside className="panel applyAside">
          <p className="eyebrow">Privacy First</p>
          <h2>개인정보는 필요한 만큼만 받아요.</h2>
          <div className="flowCards">
            <div>
              <Lock size={18} />
              <strong>연락 목적 제한</strong>
              <span>일정 조율과 코칭 안내에만 사용</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <strong>외부 공유 금지</strong>
              <span>사진과 리포트는 동의 없이 공개하지 않음</span>
            </div>
            <div>
              <CheckCircle2 size={18} />
              <strong>보관 최소화</strong>
              <span>목적 달성 후 정책에 맞춰 삭제</span>
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}

"use client";

import { useState } from "react";
import { Database, Lock, Search } from "lucide-react";

type AdminReport = {
  id: string;
  nickname: string;
  gender: string;
  brandFocus: string;
  createdAt: string;
  persona: string;
  summary: string;
  keywords: string[];
  source: "demo" | "openai";
  storedImage: boolean;
  answersCount: number;
};

type AdminApplication = {
  id: string;
  name: string;
  age: string;
  location: string;
  phone: string;
  helpTopic: string;
  availableTime: string;
  createdAt: string;
};

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [message, setMessage] = useState("Firebase 연결 후 저장된 리포트를 확인할 수 있습니다.");
  const [loading, setLoading] = useState(false);

  async function loadReports() {
    setLoading(true);
    setMessage("데이터를 불러오는 중입니다.");

    try {
      const response = await fetch(`/api/admin/reports?password=${encodeURIComponent(password)}`, {
        cache: "no-store"
      });
      const data = (await response.json()) as {
        error?: string;
        firebaseConfigured?: boolean;
        reports?: AdminReport[];
        applications?: AdminApplication[];
      };

      if (!response.ok) {
        throw new Error(data.error ?? "관리자 데이터를 불러오지 못했습니다.");
      }

      setReports(data.reports ?? []);
      setApplications(data.applications ?? []);
      setMessage(
        data.firebaseConfigured
          ? `${data.reports?.length ?? 0}개의 리포트와 ${data.applications?.length ?? 0}개의 신청을 불러왔습니다.`
          : "Firebase 환경변수가 아직 연결되지 않았습니다."
      );
    } catch (error) {
      setReports([]);
      setApplications([]);
      setMessage(error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="section flowHeader">
        <p className="eyebrow">Admin</p>
        <h1>Firebase 리포트 DB</h1>
        <p className="lead">
          사용자가 저장에 동의한 분석 결과를 확인하는 관리자 페이지입니다.
          비밀번호는 Vercel의 `ADMIN_PASSWORD` 환경변수로 관리합니다.
        </p>
      </section>

      <section className="section adminLayout">
        <article className="panel adminLogin">
          <p className="eyebrow">Access</p>
          <h2>관리자 확인</h2>
          <label className="field">
            <span>DB 조회 비밀번호</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="ADMIN_PASSWORD"
            />
          </label>
          <button className="primaryButton fullButton" onClick={loadReports} disabled={loading}>
            <Search size={18} />
            {loading ? "조회 중..." : "DB 데이터 조회"}
          </button>
          <div className="privacyPill">
            <Lock size={14} />
            <span>{message}</span>
          </div>
        </article>

        <div className="adminTable panel">
          <div className="miniInfoHeader">
            <Database size={18} />
            <strong>저장된 분석 결과</strong>
          </div>
          <div className="adminRows">
            {reports.map((report) => (
              <a className="adminRow" href={`/report/${report.id}`} key={report.id}>
                <div>
                  <strong>{report.persona || "결과명 없음"}</strong>
                  <span>{report.nickname || "익명"} · {report.gender || "성별 미응답"}</span>
                </div>
                <p>{report.summary}</p>
                <div className="adminMeta">
                  <span>{report.source}</span>
                  <span>{report.answersCount}문항</span>
                  <span>{report.storedImage ? "이미지 저장" : "이미지 미저장"}</span>
                </div>
              </a>
            ))}
            {reports.length === 0 ? <p className="subtleCopy">아직 표시할 리포트가 없습니다.</p> : null}
          </div>
        </div>

        <div className="adminTable panel">
          <div className="miniInfoHeader">
            <Database size={18} />
            <strong>코칭 신청</strong>
          </div>
          <div className="adminRows">
            {applications.map((application) => (
              <div className="adminRow" key={application.id}>
                <div>
                  <strong>{application.name}</strong>
                  <span>{application.age}세 · {application.location}</span>
                </div>
                <p>{application.helpTopic}</p>
                <div className="adminMeta">
                  <span>{application.phone}</span>
                  <span>{application.availableTime || "시간 미입력"}</span>
                </div>
              </div>
            ))}
            {applications.length === 0 ? <p className="subtleCopy">아직 표시할 신청이 없습니다.</p> : null}
          </div>
        </div>
      </section>
    </main>
  );
}

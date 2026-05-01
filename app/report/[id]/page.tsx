"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, LoaderCircle } from "lucide-react";
import { ReportView } from "@/components/ReportView";
import type { ReportData } from "@/lib/report-types";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const reportId = params.id;
  const [report, setReport] = useState<ReportData | null>(null);
  const [status, setStatus] = useState("결과 리포트를 불러오는 중입니다.");

  useEffect(() => {
    let active = true;

    async function loadReport() {
      const cached =
        window.sessionStorage.getItem(`bop-report-${reportId}`) ??
        window.localStorage.getItem(`bop-report-${reportId}`);
      if (cached) {
        try {
          const parsed = JSON.parse(cached) as ReportData;
          if (active) {
            setReport(parsed);
            setStatus("");
          }
          return;
        } catch {
          window.localStorage.removeItem(`bop-report-${reportId}`);
        }
      }

      try {
        const response = await fetch(`/api/reports/${reportId}`, { cache: "no-store" });
        const data = (await response.json()) as { report: ReportData | null };
        if (!active) return;

        if (response.ok && data.report) {
          setReport(data.report);
          setStatus("");
        } else {
          setStatus("저장된 리포트를 찾지 못했습니다. 새 분석을 다시 시작해 주세요.");
        }
      } catch {
        if (active) {
          setStatus("리포트를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.");
        }
      }
    }

    void loadReport();

    return () => {
      active = false;
    };
  }, [reportId]);

  if (report) {
    return <ReportView report={report} />;
  }

  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="section emptyState">
        <LoaderCircle className="spinIcon" size={28} />
        <h1>리포트 확인</h1>
        <p>{status}</p>
        <Link className="primaryButton" href="/start">
          새 분석 시작하기
          <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}

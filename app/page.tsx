import { ArrowRight, Database, ScanFace, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <main className="pageShell">
      <div className="textureLayer" />
      <section className="hero section landingHero">
        <div className="heroCopy">
          <p className="eyebrow">BOP Mirror x Inner</p>
          <h1>당신의 얼굴과 마음 모양을 함께 읽는 AI 스타일 리포트</h1>
          <p className="lead">
            성별과 에니어그램 기반 질문, 얼굴 사진, 분석 단계 선택을 거쳐
            나에게 맞는 컬러·의상·뷰티 무드까지 한 번에 정리합니다.
          </p>
          <div className="heroActions">
            <Link className="primaryButton" href="/start">
              <ScanFace size={18} />
              분석 시작하기
              <ArrowRight size={18} />
            </Link>
            <Link className="secondaryButton" href="/admin">
              <Database size={18} />
              DB 확인
            </Link>
          </div>
        </div>

        <div className="landingPreview panel">
          <p className="eyebrow">Flow</p>
          <h2>검사는 4단계로 진행돼요.</h2>
          <div className="flowCards">
            <div>
              <Sparkles size={18} />
              <strong>1. 기본 정보</strong>
              <span>성별과 브랜딩 목표 선택</span>
            </div>
            <div>
              <ShieldCheck size={18} />
              <strong>2. 마음 모양</strong>
              <span>약 20개 문항으로 성향 정리</span>
            </div>
            <div>
              <ScanFace size={18} />
              <strong>3. 얼굴 분석</strong>
              <span>사진 등록 후 분석 깊이 선택</span>
            </div>
            <div>
              <Database size={18} />
              <strong>4. 결과 리포트</strong>
              <span>전용 결과 페이지와 Firebase 저장</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

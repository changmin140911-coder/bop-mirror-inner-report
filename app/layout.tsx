import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BOP Mirror x Inner Report",
  description: "AI 기반 퍼스널 브랜딩 리포트 데모"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

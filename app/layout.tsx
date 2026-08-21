import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AIready",
  description: "AI와 AI Python 문서 범위를 4지선다·단답·서술형으로 연습하는 학습 사이트",
  openGraph: {
    title: "AIready",
    description: "427문항 문제은행과 AI·Python 핵심정리",
    images: [{ url: "/og-ai-python.png", width: 1731, height: 909 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AIready",
    description: "427문항 문제은행과 AI·Python 핵심정리",
    images: ["/og-ai-python.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}

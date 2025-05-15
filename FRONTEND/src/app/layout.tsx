// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
import Script from "next/script";
// import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

// export const metadata: Metadata = {
//   title: "PIXX",
//   description: "네컷 사진 아카이빙 서비스",
// };

export const metadata = {
  title: "Pixx",
  description: "QR 기반 네컷 사진·GIF·영상을 자동으로 정리하고 추억을 간편하게 보관할 수 있는 웹 아카이브 플랫폼",
  generator: "SSAFY B208",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
      {process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID && process.env.NODE_ENV === "production" && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID!} />
      )}
    </html>
  );
}

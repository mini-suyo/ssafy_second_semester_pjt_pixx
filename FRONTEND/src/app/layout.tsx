// app/layout.tsx

import "./globals.css";
import Providers from "./providers";
// import type { Metadata } from "next";
import { GoogleTagManager } from "@next/third-parties/google";

// export const metadata: Metadata = {
//   title: "PIXX",
//   description: "네컷 사진 아카이빙 서비스",
// };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      {process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID && process.env.NODE_ENV === "production" && (
        <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GOOGLE_TAG_MANAGER_ID!} />
      )}
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import GTMHead from "@/components/common/GTMHead";
import GTMBody from "@/components/common/GTMBody";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <GTMHead />
      </head>
      <body>
        <GTMBody />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

"use client";

import type React from "react";
import Providers from "./providers";
import "./globals.css";
import Header from "@/components/Header";
import StarBackground from "@/components/StarBackground";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === "/welcome";

  return (
    <html lang="ko">
      <body>
        <div className="app-container">
          {!isWelcomePage && <Header />}
          <StarBackground />
          <Providers className="main-content">{children}</Providers>
          {!isWelcomePage && <Navbar />}
        </div>
      </body>
    </html>
  );
}

"use client";

import type React from "react";
import Providers from "./providers";
import "./globals.css";
import Header from "@/components/Header";
import StarBackground from "@/components/StarBackground";
import Navbar from "@/components/Navbar";
import { usePathname } from "next/navigation";
import Script from "next/script";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isWelcomePage = pathname === "/welcome";

  return (
    <html lang="ko">
      <head>
        <Script id="gtm-script" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBPTTLQ3')`}
        </Script>
      </head>
      <body>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TBPTTLQ3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
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

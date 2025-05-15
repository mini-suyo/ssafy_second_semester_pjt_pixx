// app/layout.tsx
import "./globals.css";
import Providers from "./providers";
import Script from "next/script";

export const metadata = {
  title: "Pixx",
  description: "QR 기반 네컷 사진·GIF·영상을 자동으로 정리하고 추억을 간편하게 보관할 수 있는 웹 아카이브 플랫폼",
  generator: "SSAFY B208",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-TBPTTLQ3');`,
          }}
        />
        {/* <!-- End Google Tag Manager --> */}
        {/* <!-- Google Tag Manager (noscript) --> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-TBPTTLQ3"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>
        {/* <!-- End Google Tag Manager (noscript) --> */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

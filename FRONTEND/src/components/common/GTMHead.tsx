// // components/common/GTMHead.tsx
// "use client";
// import Script from "next/script";

// export default function GTMHead() {
//   return (
//     <>
//       {/* dataLayer 초기화는 반드시 GTM 스크립트보다 먼저 로드되어야 합니다 */}
//       <Script id="gtm-datalayer" strategy="beforeInteractive">
//         {`window.dataLayer = window.dataLayer || [];`}
//       </Script>

//       {/* GTM 메인 스크립트 */}
//       <Script id="gtm-script" strategy="afterInteractive">
//         {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
//         new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
//         j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
//         'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
//         })(window,document,'script','dataLayer','GTM-TBPTTLQ3');`}
//       </Script>
//     </>
//   );
// }

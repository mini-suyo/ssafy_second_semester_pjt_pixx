import type React from "react"

import "./globals.css"
import StarBackground from "./components/star-background"



export const metadata = {
  title: "스타로그 - 네컷 사진 아카이브",
  description: "QR 기반 네컷 사진·GIF·영상을 자동으로 정리하고 추억을 간편하게 보관할 수 있는 웹 아카이브 플랫폼",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>
        <div className="app-container">
          <StarBackground/>
          <main className="main-content">{children}</main>
        </div>

      </body>
    </html>
  )
}
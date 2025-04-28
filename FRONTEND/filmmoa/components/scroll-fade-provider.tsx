"use client"

import { useScrollFade } from "@/hooks/use-scroll-fade"
import type { ReactNode } from "react"

interface ScrollFadeProviderProps {
  children: ReactNode
}

export function ScrollFadeProvider({ children }: ScrollFadeProviderProps) {
  // 스크롤 페이드 훅 사용
  useScrollFade()

  return <>{children}</>
}

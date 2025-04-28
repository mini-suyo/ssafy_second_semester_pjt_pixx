"use client"

import { useEffect } from "react"

export function useScrollFade() {
  useEffect(() => {
    let scrollTimer: NodeJS.Timeout | null = null
    const body = document.body

    // 스크롤 이벤트 핸들러
    const handleScroll = () => {
      // 스크롤 중일 때 스크롤바 표시
      body.classList.add("scrolling")

      // 이전 타이머가 있다면 제거
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }

      // 스크롤이 멈추면 일정 시간 후 스크롤바 숨김
      scrollTimer = setTimeout(() => {
        body.classList.remove("scrolling")
      }, 1500) // 1.5초 후 페이드아웃
    }

    // 초기 상태 설정 (스크롤바 숨김)
    body.classList.remove("scrolling")

    // 이벤트 리스너 등록
    window.addEventListener("scroll", handleScroll, { passive: true })

    // 마우스가 문서 위에 있을 때도 스크롤바 표시
    const handleMouseMove = () => {
      body.classList.add("scrolling")

      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }

      scrollTimer = setTimeout(() => {
        body.classList.remove("scrolling")
      }, 1500)
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("mousemove", handleMouseMove)
      if (scrollTimer) {
        clearTimeout(scrollTimer)
      }
    }
  }, [])
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function KakaoCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const params = new URL(window.location.href).searchParams;
    const code = params.get("code");

    if (!code) {
      // code가 없으면 로그인 페이지로
      router.replace("/welcome");
      return;
    }

    fetch("/api/v1/auth/kakao/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include", // ← 쿠키 수신/전송을 위해 필수
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || "카카오 로그인 실패");
        }
        return res.json();
      })
      .then(() => {
        // 토큰은 HttpOnly 쿠키에 저장됐으니, 바로 메인으로 이동
        router.replace("/main");
      })
      .catch((error) => {
        console.error("카카오 로그인 오류:", error);
        router.replace("/welcome");
      });
  }, [router]);

  return <div>카카오 로그인 처리 중...</div>;
}

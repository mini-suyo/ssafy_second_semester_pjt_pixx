"use client";

import { useRouter } from "next/navigation";
import styles from "./kakao-login.module.css";

export default function KakaoLogin() {
  const router = useRouter();

  const handleKakaoLogin = () => {
    const KAKAO_CLIENT_ID = process.env.NEXT_PUBLIC_KAKAO_CLIENT_ID;
    const REDIRECT_URI = process.env.NEXT_PUBLIC_KAKAO_REDIRECT_URI;
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code`;

    router.push(kakaoURL);
  };

  return (
    <button onClick={handleKakaoLogin} className={styles.kakaoButton}>
      <svg className={styles.kakaoIcon} width="18" height="18" viewBox="0 0 18 18">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M9 0.5C4.30375 0.5 0.5 3.4379 0.5 7.0036C0.5 9.1765 1.85438 11.1032 3.93313 12.2786L3.025 15.6036C2.98938 15.7311 3.03563 15.8661 3.14688 15.9386C3.21 15.9793 3.28375 16 3.35813 16C3.41688 16 3.47625 15.9857 3.52938 15.9564L7.35063 13.5143C7.88188 13.6054 8.43375 13.6536 9 13.6536C13.6956 13.6536 17.5 10.7157 17.5 7.15C17.5 3.58429 13.6956 0.5 9 0.5Z"
          fill="black"
        />
      </svg>
      카카오 로그인
    </button>
  );
}

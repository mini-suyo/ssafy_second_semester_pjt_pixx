"use client";

import { useRouter } from "next/navigation";
import styles from "./logout.module.css";
import api from "@/app/lib/api/axios";
import Cookies from "js-cookie";
import ErrorModal from "@/components/ErrorModal";
import { useState } from "react";

export default function Logout() {
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      const response = await api.post("/api/v1/auth/logout");

      if (response.data.status === 200) {
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        setMessage("로그아웃되었습니다.");
        setTimeout(() => {
          router.push("/welcome");
        }, 3000);
      } else {
        throw new Error(response.data.message || "로그아웃 실패");
      }
    } catch (error) {
      console.error("로그아웃 요청 실패:", error);
      setMessage("로그아웃 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <button className={styles.logoutButton} onClick={handleLogout}>
        로그아웃
      </button>
      {message && <ErrorModal message={message} onClose={() => setMessage(null)} />}
    </>
  );
}

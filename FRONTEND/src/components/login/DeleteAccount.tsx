"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./delete-account.module.css";
import api from "@/app/lib/api/axios";
import ErrorModal from "@/components/ErrorModal";
import Cookies from "js-cookie";

export default function DeleteAccount() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleDeleteAccount = async () => {
    try {
      const response = await api.delete("/api/v1/users", {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      });

      if (response.data.status === 200) {
        setErrorMessage("회원 탈퇴가 완료되었습니다.");
        // 쿠키 삭제
        Cookies.remove("accessToken", { path: "/" });
        Cookies.remove("refreshToken", { path: "/" });
        // 잠시 후 welcome 페이지로 이동
        setTimeout(() => {
          router.push("/welcome");
        }, 1500);
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        setErrorMessage("유효한 액세스 토큰이 필요합니다.");
      } else if (error.response?.status === 404) {
        setErrorMessage("사용자를 찾을 수 없습니다.");
      } else if (error.response?.status === 500) {
        setErrorMessage("회원 탈퇴 중 내부 오류가 발생했습니다.");
      } else {
        setErrorMessage("회원 탈퇴 처리 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <>
      <button onClick={handleDeleteAccount} className={styles.deleteButton}>
        회원 탈퇴
      </button>
      {errorMessage && (
        <ErrorModal
          message={errorMessage}
          onClose={() => {
            setErrorMessage(null);
            if (errorMessage === "회원 탈퇴가 완료되었습니다.") {
              router.push("/welcome");
            }
          }}
        />
      )}
    </>
  );
}

// 앨범 만들기 / 취소 플로팅 버튼

"use client";

import { MouseEventHandler } from "react";
import styles from "./floating-button.module.css";
import Image from "next/image";

interface FloatingButtonProps {
  mode: "default" | "select";
  onClick: MouseEventHandler<HTMLButtonElement>;
  label?: string; // 텍스트일 경우만 렌더링
}

export default function FloatingButton({ mode, onClick, label }: FloatingButtonProps) {
  const isTextButton = !!label;

  return (
    <button
      className={`${styles.floatingButton} ${
        isTextButton
          ? styles.floatingButtonText // 글자 전용 스타일
          : mode === "default"
            ? styles.floatingButtonDefault
            : styles.floatingButtonSelect
      }`}
      onClick={onClick}
    >
      {isTextButton ? (
        <span>{label}</span>
      ) : (
        <Image
          src={mode === "default" ? "/icons/icon-edit.png" : "/icons/icon-close.png"}
          alt={mode === "default" ? "편집" : "닫기"}
          width={36}
          height={36}
        />
      )}
    </button>
  );
}

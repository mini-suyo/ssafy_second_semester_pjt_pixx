// 앨범 만들기 / 취소 플로팅 버튼

"use client";

import { MouseEventHandler } from "react";
import styles from "./floating-button.module.css";
import Image from "next/image";

interface FloatingButtonProps {
  mode: "default" | "select";
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function FloatingButton({ mode, onClick }: FloatingButtonProps) {
  return (
    <button
      className={`${styles.floatingButton} ${mode === "default" ? styles.floatingButtonDefault : styles.floatingButtonSelect}`}
      onClick={onClick}
    >
      <Image
        src={mode === "default" ? "/icons/icon-edit.png" : "/icons/icon-close.png"}
        alt={mode === "default" ? "편집" : "닫기"}
        width={36}
        height={36}
      />
    </button>
  );
}

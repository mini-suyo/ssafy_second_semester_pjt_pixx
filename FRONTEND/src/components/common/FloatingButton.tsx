// 앨범 만들기 / 취소 플로팅 버튼

"use client";

import { MouseEventHandler } from "react";
import styles from "./FloatingButton.module.css";

interface FloatingButtonProps {
  mode: "default" | "select";
  onClick: MouseEventHandler<HTMLButtonElement>;
}

export default function FloatingButton({ mode, onClick }: FloatingButtonProps) {
  return (
    <button className={styles.floatingButton} onClick={onClick}>
      {mode === "default" ? "Create" : "Cancel"}
    </button>
  );
}

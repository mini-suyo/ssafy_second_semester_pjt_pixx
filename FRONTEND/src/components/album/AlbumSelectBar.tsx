// components/feed/AlbumSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./album-select-bar.module.css";

type SelectModeBarProps = {
  onCancle: () => void;
  onDelete: () => void;
};

export default function AlbumSelectBar({ onCancle, onDelete }: SelectModeBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onCancle}>
        <Image src="/icons/icon-cancle.png" alt="Cancle" width={36} height={36} style={{ padding: "2px" }} />
        Cancle
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={36} height={36} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

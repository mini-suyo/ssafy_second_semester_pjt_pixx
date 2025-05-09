// components/album/SelectModeBar.tsx

"use client";

import Image from "next/image";
import styles from "./album-feed-select-bar.module.css";

type SelectModeBarProps = {
  onCancel: () => void;
  onDelete: () => void;
};

export default function AlbumFeedSelectBar({ onCancel, onDelete }: SelectModeBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onCancel}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={32} height={32} style={{ padding: "2px" }} />
        Cancel
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={32} height={32} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

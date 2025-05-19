// components/album/AlbumFeedSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./album-feed-select-bar.module.css";

type SelectModeBarProps = {
  onAdd: () => void;
  onMove: () => void;
  onDelete: () => void;
};

export default function AlbumFeedSelectBar({ onAdd, onMove, onDelete }: SelectModeBarProps) {
  return (
    <div className={styles.selectModeBar}>
      {/* <button onClick={onCancel}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={32} height={32} style={{ padding: "2px" }} />
        Cancel
      </button> */}
      <button onClick={onAdd}>
        <Image src="/icons/icon-add.png" alt="Add" width={28} height={28} style={{ padding: "6px" }} />
        Add
      </button>
      <button onClick={onMove}>
        <Image src="/icons/icon-folder.png" alt="Move" width={36} height={36} style={{ padding: "2px" }} />
        Move
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={36} height={36} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

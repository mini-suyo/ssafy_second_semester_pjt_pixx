// components/feed/FeedSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./feed-select-bar.module.css";

type SelectModeBarProps = {
  onAdd: () => void;
  onDelete: () => void;
};

export default function FeedSelectBar({ onAdd, onDelete }: SelectModeBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onAdd}>
        <Image src="/icons/icon-create.png" alt="Add" width={32} height={32} style={{ padding: "6px" }} />
        Add
      </button>
      {/* <button onClick={onCreate}>
        <Image src="/icons/icon-create.png" alt="Create" width={32} height={32} style={{ padding: "3px" }} />
        Create
      </button> */}
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={38} height={38} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

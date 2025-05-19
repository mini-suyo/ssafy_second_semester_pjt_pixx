// components/feed/AlbumSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./album-select-bar.module.css";

type SelectModeBarProps = {
  onCreate: () => void;
  onDelete: () => void;
};

export default function AlbumSelectBar({ onCreate, onDelete }: SelectModeBarProps) {
  return (
    <div className={styles.selectModeBar}>
      {/* <button onClick={onCancle}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={36} height={36} style={{ padding: "2px" }} />
        Cancel
      </button> */}
      <button onClick={onCreate}>
        <Image src="/icons/icon-create.png" alt="Create" width={36} height={36} style={{ padding: "2px" }} />
        Create
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={36} height={36} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

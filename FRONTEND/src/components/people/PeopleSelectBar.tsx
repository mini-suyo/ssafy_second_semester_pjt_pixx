// components/people/PeopleSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./people-select-bar.module.css";

type PeopleSelectBarProps = {
  onCancel: () => void;
  onDelete: () => void;
};

export default function PeopleSelectBar({ onCancel, onDelete }: PeopleSelectBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onCancel}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={36} height={36} style={{ padding: "2px" }} />
        Cancel
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={36} height={36} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}
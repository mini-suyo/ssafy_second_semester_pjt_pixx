// components/people/people-feed/PeopleFeedSelectBar.tsx

"use client";

import Image from "next/image";
import styles from "./people-feed-select-bar.module.css";

type PeopleFeedSelectBarProps = {
  onCancel: () => void;
  onDelete: () => void;
  onUnclassify: () => void;
};

export default function PeopleFeedSelectBar({ onCancel, onDelete, onUnclassify }: PeopleFeedSelectBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onCancel}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={36} height={36} style={{ padding: "2px" }} />
        Cancel
      </button>
      <button onClick={onUnclassify}>
        <Image src="/icons/icon-unclassify.png" alt="Unclassify" width={36} height={36} style={{ padding: "2px" }} />
        Not This Person
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={36} height={36} style={{ padding: "2px" }} />
        Delete
      </button>
    </div>
  );
}

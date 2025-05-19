// components/people/people-feed/PeopleHeader.tsx

import React from "react";
import styles from "./people-header.module.css";
import Link from "next/link";
import Image from "next/image";
import SortDropdown from "@/components/common/SortDropdown";

type PeopleHeaderProps = {
  faceName: string;
  sortType: "recent" | "oldest";
  onSortChange: (value: "recent" | "oldest") => void;
};

export default function PeopleHeader({ faceName, sortType, onSortChange }: PeopleHeaderProps) {
  return (
    <div className={styles.headerWrapper}>
      {/* 인물 이름 + 뒤로가기 */}
      <div className={styles.peopleTitleRow}>
        <Link href="/people" className={styles.backButton}>
          <Image src="/icons/icon-back.png" alt="뒤로가기" width={24} height={24} />
        </Link>
        <div className={styles.peopleName}>{faceName}</div>
      </div>
      {/* 정렬 */}
      <div className={styles.selectWrapper}>
        <SortDropdown value={sortType} onChange={onSortChange} />
      </div>
    </div>
  );
}

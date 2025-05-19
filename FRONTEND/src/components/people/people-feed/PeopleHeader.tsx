// components/people/people-feed/PeopleHeader.tsx

import React from "react";
import styles from "./people-header.module.css";
import Link from "next/link";
import Image from "next/image";
import SortDropdown, { OptionType } from "@/components/common/SortDropdown";

type PeopleHeaderProps = {
  faceName: string;
  sortType: "recent" | "oldest";
  onSortChange: (value: "recent" | "oldest") => void;
};

export default function PeopleHeader({ faceName, sortType, onSortChange }: PeopleHeaderProps) {
  // SortDropdown에 넘겨줄 옵션 정의
  const sortOptions: OptionType<"recent" | "oldest">[] = [
    { value: "recent", label: "최신순" },
    { value: "oldest", label: "오래된 순" },
  ];

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
        <SortDropdown value={sortType} onChange={onSortChange} options={sortOptions} />
      </div>
    </div>
  );
}

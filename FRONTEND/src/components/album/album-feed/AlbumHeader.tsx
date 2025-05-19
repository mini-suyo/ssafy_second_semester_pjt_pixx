// components/album/AlbumHeader.tsx

import React from "react";
import styles from "./album-header.module.css";
import Link from "next/link";
import Image from "next/image";
import SortDropdown, { OptionType } from "@/components/common/SortDropdown";

const albumSortOptions: OptionType<"recent" | "oldest">[] = [
  { value: "recent", label: "최신순" },
  { value: "oldest", label: "오래된순" },
] as const;

type AlbumHeaderProps = {
  albumName: string;
  albumMemo: string;
  sortType: "recent" | "oldest";
  onSortChange: (value: "recent" | "oldest") => void;
};

export default function AlbumHeader({ albumName, albumMemo, sortType, onSortChange }: AlbumHeaderProps) {
  return (
    <div className={styles.headerWrapper}>
      {/* 앨범 이름 + 뒤로가기 */}
      <div className={styles.albumTitleRow}>
        <Link href="/album" className={styles.backButton}>
          <Image src="/icons/icon-back.png" alt="뒤로가기" width={24} height={24} />
        </Link>
        <div className={styles.albumName}>{albumName}</div>
      </div>
      {albumMemo && <div className={styles.albumMemo}>{albumMemo}</div>}

      {/* 정렬 */}
      <div className={styles.selectWrapper}>
        <SortDropdown value={sortType} onChange={onSortChange} options={albumSortOptions} />
      </div>
    </div>
  );
}

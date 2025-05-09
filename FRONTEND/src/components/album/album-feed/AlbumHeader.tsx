// components/album/AlbumHeader.tsx

import React from "react";
import styles from "./album-header.module.css";
import Link from "next/link";
import Image from "next/image";

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
        {albumMemo && <div className={styles.albumMemo}>{albumMemo}</div>}
      </div>

      {/* 정렬 */}
      <div className={styles.selectWrapper}>
        <select
          className={styles.sortSelect}
          value={sortType}
          onChange={(e) => onSortChange(e.target.value as "recent" | "oldest")}
        >
          <option value="recent">최신순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>
    </div>
  );
}

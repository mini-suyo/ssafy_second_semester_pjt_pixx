// components/album/AlbumFeedGrid.tsx

"use client";

import Image from "next/image";
import styles from "./album-feed-grid.module.css";
import { FeedThumbnailItemProps } from "@/app/types/album";

export default function AlbumFeedGrid({
  feedId,
  imageUrl,
  isLoaded,
  isError,
  onClick,
  onLoad,
  onError,
  onRetry,
  isSelected,
  mode,
  onLongPressStart,
  onLongPressEnd,
}: FeedThumbnailItemProps) {
  return (
    <div
      className={`${styles.thumbnailWrapper} ${styles.slideUp}`}
      onClick={onClick}
      onMouseDown={onLongPressStart}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={onLongPressStart}
      onTouchEnd={onLongPressEnd}
      onTouchCancel={onLongPressEnd}
    >
      {mode === "select" && (
        <div className={styles.checkIcon}>
          <Image
            src={isSelected ? "/icons/icon-checked-purple.png" : "/icons/icon-unchecked-purple.png"}
            alt="선택 여부"
            width={40}
            height={40}
          />
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={imageUrl}
        alt={`피드 ${feedId}`}
        className={styles.thumbnailImage}
        onLoad={onLoad}
        onError={onError}
        // priority={false}
      />

      {/* 로딩 & 에러 UI */}
      {!isLoaded && !isError && <div className={styles.loading}>로딩중...</div>}

      {isError && (
        <div className={styles.error}>
          <span>로드 실패</span>
          <button className={styles.retryButton} onClick={onRetry}>
            다시 시도
          </button>
        </div>
      )}
    </div>
  );
}

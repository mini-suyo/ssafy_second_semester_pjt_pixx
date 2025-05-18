// components/people/people-feed/PeopleFeedGrid.tsx

'use client';

import Image from 'next/image';
import styles from './people-feed-grid.module.css';
import { FeedThumbnailItemProps } from '@/app/types/people';

export default function PeopleFeedGrid({
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
      className={styles.thumbnailWrapper}
      onClick={onClick}
      onMouseDown={onLongPressStart}
      onMouseUp={onLongPressEnd}
      onMouseLeave={onLongPressEnd}
      onTouchStart={onLongPressStart}
      onTouchEnd={onLongPressEnd}
      onTouchCancel={onLongPressEnd}
    >
      {mode === 'select' && (
        <div className={styles.checkIcon}>
          <Image
            src={isSelected ? '/icons/icon-checked-purple.png' : '/icons/icon-unchecked-purple.png'}
            alt="선택 여부"
            width={40}
            height={40}
          />
        </div>
      )}

      <Image
        src={imageUrl}
        alt={`피드 ${feedId}`}
        fill
        className={styles.thumbnailImage}
        onLoad={onLoad}
        onError={onError}
        priority={false}
      />

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

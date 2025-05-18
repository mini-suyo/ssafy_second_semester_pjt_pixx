"use client";

import { useEffect, useState } from "react";
import { getFeeds } from "@/app/lib/api/feedApi";
import Image from "next/image";
import styles from "./album-feed-select-modal.module.css";
import FloatingButton from "@/components/common/FloatingButton";
import { Feed } from "@/app/types/feed";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onNext: (selectedFeedIds: number[]) => void;
  label: string;
};

export default function AlbumFeedSelectModal({ isOpen, onClose, onNext, label }: Props) {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  const MAX_RETRY = 3;

  useEffect(() => {
    if (!isOpen) return;
    setSelectedFeedIds([]);
    getFeeds({ type: 0, page: 0, size: 20 })
      .then((data) => {
        setFeeds(data.flat()); // pages 없이 단일 배열로 처리
      })
      .catch(() => {
        alert("피드를 불러오는데 실패했습니다.");
      });
  }, [isOpen]);

  const handleFeedClick = (feedId: number) => {
    setSelectedFeedIds((prev) => (prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]));
  };

  const handleImageLoad = (feedId: number) => {
    setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  const handleImageError = (feedId: number) => {
    const retry = retryCount[feedId] || 0;
    if (retry < MAX_RETRY) {
      setRetryCount((prev) => ({ ...prev, [feedId]: retry + 1 }));
      setTimeout(() => {
        setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
        setImageErrors((prev) => ({ ...prev, [feedId]: false }));
      }, 1000);
    } else {
      setImageErrors((prev) => ({ ...prev, [feedId]: true }));
      setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    }
  };

  const handleRetry = (feedId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount((prev) => ({ ...prev, [feedId]: 0 }));
    setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <button className={styles.closeButton} onClick={onClose}>
            <Image src="/icons/icon-close.png" alt="닫기" width={24} height={24} />
          </button>
        </div>

        <div className={styles.gridWrapper}>
          {feeds.map((feed) => (
            <div key={feed.feedId} className={styles.thumbnailWrapper} onClick={() => handleFeedClick(feed.feedId)}>
              {/* 체크 아이콘 */}
              <div className={styles.checkIcon}>
                <Image
                  src={
                    selectedFeedIds.includes(feed.feedId)
                      ? "/icons/icon-checked-purple.png"
                      : "/icons/icon-unchecked-purple.png"
                  }
                  alt="선택 여부"
                  width={36}
                  height={38}
                />
              </div>

              {/* 이미지 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={feed.feedThumbnailImgUrl}
                alt={`Feed ${feed.feedId}`}
                className={styles.thumbnailImage}
                onLoad={() => handleImageLoad(feed.feedId)}
                onError={() => handleImageError(feed.feedId)}
              />

              {/* 로딩 상태 */}
              {!imageLoaded[feed.feedId] && !imageErrors[feed.feedId] && (
                <div className={styles.loading}>로딩중...</div>
              )}

              {/* 에러 상태 */}
              {imageErrors[feed.feedId] && (
                <div className={styles.error}>
                  <p>로드 실패</p>
                  <button onClick={(e) => handleRetry(feed.feedId, e)}>다시 시도</button>
                </div>
              )}

              {/* 선택 오버레이 */}
              {selectedFeedIds.includes(feed.feedId) && <div className={styles.selectedOverlay} />}
            </div>
          ))}
        </div>
      </div>

      {/* 하단 플로팅 버튼 */}
      <FloatingButton
        mode="select"
        label={label}
        onClick={() => {
          if (selectedFeedIds.length === 0) {
            alert("피드를 한 개 이상 선택해주세요.");
            return;
          }
          onNext(selectedFeedIds);
        }}
      />
    </div>
  );
}

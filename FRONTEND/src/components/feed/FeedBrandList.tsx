// components/feed/FeedBrandList.tsx

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BrandListResponse } from "@/app/types/feed";
import { toggleFavorite } from "@/app/lib/api/feedApi";
import styles from "./feed-brand-list.module.css";

type FeedBrandListProps = {
  brandList: BrandListResponse["brandList"];
};

export default function FeedBrandList({ brandList }: FeedBrandListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 피드 즐겨찾기 상태 관리
  const [favorite, setFavorite] = useState<{ [feedId: number]: boolean }>({});

  // 이미지 로딩 및 에러 상태 관리
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  const MAX_RETRY_ATTEMPTS = 3;

  // 브랜드 이름 - 아이디 매핑
  const BRAND_NAME_TO_ID: Record<string, number> = {
    기타: 1,
    모노맨션: 2,
    하루필름: 3,
    포토이즘: 4,
    인생네컷: 5,
  };

  // 즐겨찾기 초기화
  useEffect(() => {
    if (!brandList) return;

    const initialFavorite: { [feedId: number]: boolean } = {};

    brandList.forEach((brand) => {
      brand.feeds.forEach((feed) => {
        initialFavorite[feed.feedId] = feed.feedFavorite;
      });
    });

    setFavorite(initialFavorite);
  }, [brandList]);

  // 즐겨찾기 토글 뮤테이션
  const { mutate: toggleFavoriteMutation } = useMutation({
    mutationFn: toggleFavorite,
    onSuccess: ({ feedId, isFavorite }) => {
      setFavorite((prev) => ({
        ...prev,
        [feedId]: isFavorite,
      }));

      // 캐시 업데이트
      queryClient.setQueryData(["feeds", "brand"], (oldData: any) => {
        if (!oldData) return oldData;

        return {
          ...oldData,
          pages: oldData.pages.map((page: BrandListResponse) => ({
            ...page,
            brandList: page.brandList.map((brand) => ({
              ...brand,
              feeds: brand.feeds.map((feed) => (feed.feedId === feedId ? { ...feed, feedFavorite: isFavorite } : feed)),
            })),
          })),
        };
      });

      // 즐겨찾기 앨범 캐시 무효화
      queryClient.invalidateQueries({
        queryKey: ["albumFeeds", 2, "recent"],
      });
    },
    onError: () => {
      alert("즐겨찾기 변경에 실패했습니다.");
    },
  });

  // 이미지 로드 성공 핸들러
  const handleImageLoad = (feedId: number) => {
    setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  // 이미지 로드 실패 핸들러
  const handleImageError = (feedId: number) => {
    const currentRetryCount = retryCount[feedId] || 0;

    if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
      setRetryCount((prev) => ({ ...prev, [feedId]: currentRetryCount + 1 }));

      setTimeout(() => {
        setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
        setImageErrors((prev) => ({ ...prev, [feedId]: false }));
      }, 1000);
    } else {
      setImageErrors((prev) => ({ ...prev, [feedId]: true }));
      setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    }
  };

  // 이미지 재시도 요청 핸들러
  const handleRetryRequest = (feedId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRetryCount((prev) => ({ ...prev, [feedId]: 0 }));
    setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  // 피드 클릭 핸들러
  const handleFeedClick = (feedId: number) => {
    router.push(`/feed/${feedId}`);
  };

  return (
    <div className={styles.brandListContainer}>
      {brandList.length === 0 ? (
        <div className={styles.emptyMessage}>피드가 없습니다.</div>
      ) : (
        brandList.map((brand, index) => (
          <div key={`${brand.brandName}-${index}`} className={styles.brandSection}>
            <div className={styles.brandHeader}>
              <h3 className={styles.brandName}>{brand.brandName}</h3>
              {/* "더보기" 버튼 - 이 브랜드의 모든 피드로 이동 */}
              <div
                className={styles.viewMoreButton}
                onClick={() => {
                  const brandId = BRAND_NAME_TO_ID[brand.brandName];
                  if (brandId) {
                    router.push(`/feed/brand/${brandId}`);
                  } else {
                    alert("해당 브랜드 ID를 찾을 수 없습니다.");
                  }
                }}
              >
                <span>더보기 + </span>
              </div>
            </div>

            <div className={styles.brandFeeds}>
              {brand.feeds.map((feed) =>
                feed ? (
                  <div key={feed.feedId} className={styles.feedItem} onClick={() => handleFeedClick(feed.feedId)}>
                    {/* 피드 이미지 */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={feed.feedThumbnailImgUrl || "/pixx-logo-dummy.png"}
                      alt={`${brand.brandName} Feed ${feed.feedId}`}
                      className={styles.feedImage}
                      onLoad={() => handleImageLoad(feed.feedId)}
                      onError={() => handleImageError(feed.feedId)}
                    />

                    {/* 즐겨찾기 버튼 */}
                    <div
                      className={styles.favoriteIcon}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavoriteMutation(feed.feedId);
                      }}
                    >
                      <Image
                        src={
                          favorite[feed.feedId]
                            ? "/icons/icon-star-fill-yellow.png"
                            : "/icons/icon-star-empty-yellow.png"
                        }
                        alt="즐겨찾기"
                        width={32}
                        height={32}
                      />
                    </div>

                    {/* 로딩 표시 */}
                    {!imageLoaded[feed.feedId] && !imageErrors[feed.feedId] && (
                      <div className={styles.imageLoading}>로딩중...</div>
                    )}

                    {/* 에러 표시 및 재시도 버튼 */}
                    {imageErrors[feed.feedId] && (
                      <div className={styles.imageError}>
                        <p>이미지 로드 실패</p>
                        <button className={styles.retryButton} onClick={(e) => handleRetryRequest(feed.feedId, e)}>
                          다시 시도
                        </button>
                      </div>
                    )}
                  </div>
                ) : null
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

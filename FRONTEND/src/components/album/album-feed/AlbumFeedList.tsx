// components/album/AlbumFeedList.tsx

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { deleteAlbumPhotos, getAlbumDetail } from "@/app/lib/api/albumApi";
import AlbumHeader from "./AlbumHeader";
import AlbumFeedGrid from "./AlbumFeedGrid";
import styles from "./album-feed-list.module.css";

export default function AlbumFeedList() {
  const router = useRouter();
  const params = useParams();
  const albumId = parseInt(params.id as string);
  const [sortType, setSortType] = useState<"recent" | "oldest">("recent"); // 정렬 UI 상태값
  const apiType = sortType === "recent" ? 0 : 1; // 정렬 매핑

  // AlbumFeedGrid 상속
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  const MAX_RETRY_ATTEMPTS = 3;

  // 선택 상태 관리
  const [mode, setMode] = useState<"default" | "select">("default");
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  // API 호출
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ["albumFeeds", albumId, sortType],
    queryFn: async ({ pageParam = 0 }) => await getAlbumDetail(albumId, { type: apiType, page: pageParam, size: 10 }),
    getNextPageParam: (lastPage, allPages) =>
      lastPage?.data?.albumFeedList?.length < 10 ? undefined : allPages.length,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  // 무한스크롤
  const observerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  // 이미지 로드
  const handleImageLoad = (feedId: number) => {
    setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  const handleImageError = (feedId: number) => {
    const currentRetry = retryCount[feedId] || 0;
    if (currentRetry < MAX_RETRY_ATTEMPTS) {
      setRetryCount((prev) => ({ ...prev, [feedId]: currentRetry + 1 }));
      setTimeout(() => {
        setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
        setImageErrors((prev) => ({ ...prev, [feedId]: false }));
      }, 500); // 지연 후 재시도 유도
    } else {
      setImageErrors((prev) => ({ ...prev, [feedId]: true }));
      setImageLoaded((prev) => ({ ...prev, [feedId]: true })); // 로딩 인디케이터 제거
    }
  };

  const handleRetryRequest = (feedId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 클릭 이벤트 버블링 막기
    setRetryCount((prev) => ({ ...prev, [feedId]: 0 }));
    setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  if (status === "pending") return <div>불러오는 중...</div>;
  if (status === "error") return <div>에러가 발생했어요</div>;

  // 선택 상태관리
  const handleThumbnailClick = (feedId: number) => {
    if (mode === "select") {
      // 선택 모드일 때 → 선택 토글
      setSelectedFeedIds((prev) => (prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]));
    } else {
      // 기본 모드 → 상세 페이지 이동
      router.push(`/feed/${feedId}`);
    }
  };

  const albumMeta = data?.pages[0]?.data;
  const allFeeds = data?.pages.flatMap((page) => page.data?.albumFeedList || []) || [];

  // 이미지 삭제
  const handleDeletePhotos = async () => {
    if (selectedFeedIds.length === 0) {
      alert("삭제할 사진을 선택해주세요.");
      return;
    }

    try {
      await deleteAlbumPhotos({
        albumId: albumId,
        imageList: selectedFeedIds,
      });

      alert("앨범 사진 삭제 완료");
      setMode("default");
      setSelectedFeedIds([]);
      refetch(); // 새로운 데이터 불러와서 UI 갱신
    } catch (error) {
      alert("삭제 실패");
      console.error(error);
    }
  };
  return (
    <div>
      <AlbumHeader
        albumName={albumMeta.albumName}
        albumMemo={albumMeta.albumMemo}
        sortType={sortType}
        onSortChange={setSortType}
      />

      {/* 🔹 1. 선택 모드 진입/해제 버튼 */}
      <div className={styles.albumToolbar}>
        <button
          className={styles.modeToggleButton}
          onClick={() => {
            if (mode === "default") {
              setMode("select");
            } else {
              setMode("default");
              setSelectedFeedIds([]);
            }
          }}
        >
          {mode === "default" ? "Create" : "Cancel"}
        </button>
      </div>

      {/* 🔹 2. 선택 삭제 버튼 (선택 모드일 때만 노출) */}
      {mode === "select" && (
        <div className={styles.toolbarWrapper}>
          <button className={styles.deleteButton} onClick={handleDeletePhotos}>
            선택 삭제
          </button>
        </div>
      )}

      {allFeeds.length === 0 ? (
        <div className={styles.emptyMessage}>이 앨범에는 사진이 없습니다.</div>
      ) : (
        <div className={styles.gridWrapper}>
          {allFeeds.map((feed) => (
            <AlbumFeedGrid
              key={feed.feedId}
              feedId={feed.feedId}
              imageUrl={feed.feedThumbnailImgUrl}
              isLoaded={imageLoaded[feed.feedId]}
              isError={imageErrors[feed.feedId]}
              onClick={() => handleThumbnailClick(feed.feedId)}
              onLoad={() => handleImageLoad(feed.feedId)}
              onError={() => handleImageError(feed.feedId)}
              onRetry={(e) => handleRetryRequest(feed.feedId, e)}
              isSelected={selectedFeedIds.includes(feed.feedId)}
              mode={mode}
            />
          ))}
        </div>
      )}

      {/* 선택 사항 렌더링 */}
      <div ref={observerRef} style={{ height: 1 }} />
      {isFetchingNextPage && <p className="text-center mt-4">로딩 중...</p>}
    </div>
  );
}

// components/album/AlbumFeedList.tsx

"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { addPhotosToAlbum, deleteAlbumPhotos, getAlbumDetail } from "@/app/lib/api/albumApi";

import AlbumHeader from "./AlbumHeader";
import AlbumFeedGrid from "./AlbumFeedGrid";
import AlbumFeedSelectBar from "./AlbumFeedSelectBar";
import styles from "./album-feed-list.module.css";
import FloatingButton from "@/components/common/FloatingButton";
import FeedAlbumAdd from "@/components/feed/FeedAlbumAdd";

export default function AlbumFeedList() {
  const params = useParams();
  const router = useRouter();
  const albumId = parseInt(params.id as string);
  const [sortType, setSortType] = useState<"recent" | "oldest">("recent"); // 정렬 UI 상태값
  const apiType = sortType === "recent" ? 0 : 1; // 정렬 매핑
  const queryClient = useQueryClient();

  // AlbumFeedGrid 상속
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  const MAX_RETRY_ATTEMPTS = 3;

  // 선택 상태 관리
  const [mode, setMode] = useState<"default" | "select">("default");
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  // 피드 앨범 이동 - 앨범 선택 모달
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState(false);

  // long-press 감지
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // long-press 감지
  const handlePressStart = () => {
    if (mode === "default") {
      longPressTimerRef.current = setTimeout(() => {
        setMode("select");
      }, 1000); // 1초 후 선택모드 진입
    }
  };

  // long-press 종료
  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 이미지 다운 에러 처리
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
      refetch(); // 새로운 데이터 불러와서 UI 갱신(캐시 데이터 새로 불러옴)
      // router.refresh(); // 새로고침 효과
    } catch (error) {
      alert("삭제 실패");
      console.error(error);
    }
  };
  // 앨범에 피드 추가
  const handleAlbumFeedMove = () => {
    if (selectedFeedIds.length === 0) {
      alert("추가할 사진을 먼저 선택해주세요.");
      return;
    }
    setIsAlbumModalOpen(true);
  };

  const handleAlbumSelect = async (albumId: number) => {
    try {
      await addPhotosToAlbum({ albumId, imageList: selectedFeedIds });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["albumFeeds", albumId] }), // 피드 추가된 album refetch
        queryClient.invalidateQueries({ queryKey: ["albumFeeds", parseInt(params.id as string)] }), // 피드 삭제된 album refetch
      ]);

      alert("앨범에 사진이 추가되었습니다.");
      router.push(`/album/${albumId}`);
    } catch (error) {
      alert("사진 추가에 실패했습니다.");
      console.error(error);
    } finally {
      setIsAlbumModalOpen(false);
      setMode("default");
      setSelectedFeedIds([]);
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

      {/* 선택용 Navbar 렌더링 (선택 모드일 때만 노출) */}
      {mode === "select" && (
        <AlbumFeedSelectBar
          onCancel={() => {
            setMode("default");
            setSelectedFeedIds([]);
          }}
          onDelete={handleDeletePhotos}
          onMove={handleAlbumFeedMove}
        />
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
              onLongPressStart={handlePressStart}
              onLongPressEnd={handlePressEnd}
            />
          ))}
        </div>
      )}

      {/* 플로팅 버튼 추가 */}
      <FloatingButton
        mode={mode}
        onClick={() => {
          if (mode === "default") {
            setMode("select"); // Create 누르면 select 모드로
          } else {
            setMode("default"); // Cancel 누르면 다시 default 모드로
            setSelectedFeedIds([]); // 선택한 피드 초기화
          }
        }}
      />

      {/* 피드 앨범 이동 - 앨범 선택 모달 */}
      <FeedAlbumAdd isOpen={isAlbumModalOpen} onClose={() => setIsAlbumModalOpen(false)} onSelect={handleAlbumSelect} />

      {/* 선택 사항 렌더링 */}
      <div ref={observerRef} style={{ height: 1 }} />
      {isFetchingNextPage && <p className="text-center mt-4">로딩 중...</p>}
    </div>
  );
}

// components/people/people-feed/PeopleFeedList.tsx

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { getFaceFeeds, invalidateDetections } from "@/app/lib/api/peopleApi";
import type { FaceFeedType } from "@/app/types/people";
import PeopleFeedGrid from "./PeopleFeedGrid";
import PeopleHeader from "./PeopleHeader";
import PeopleFeedSelectBar from "./PeopleFeedSelectBar";
import FloatingButton from "@/components/common/FloatingButton";
import ErrorModal from "@/components/ErrorModal";
import { useState, useRef } from "react";
import styles from "./people-feed-list.module.css";

export default function PeopleFeedList() {
  const { id } = useParams();
  const faceId = Number(id);
  const router = useRouter();

  const [sortType, setSortType] = useState<"recent" | "oldest">("recent");
  const apiType = sortType === "recent" ? 0 : 1;

  const [mode, setMode] = useState<"default" | "select">("default");
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  const [message, setMessage] = useState<string | null>(null);
  const [confirmUnclassify, setConfirmUnclassify] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ["faceFeeds", faceId, apiType] as const,
    queryFn: ({ pageParam = 0 }) => getFaceFeeds(faceId, { type: apiType, page: pageParam, size: 10 }),
    getNextPageParam: (lastPage, pages) => (lastPage.data.faceFeedList.length < 10 ? undefined : pages.length),
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  const handlePressStart = () => {
    if (mode === "default") {
      longPressTimerRef.current = setTimeout(() => setMode("select"), 1000);
    }
  };

  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return <div>에러가 발생했어요</div>;

  const firstPageData = data!.pages[0].data;
  const faceName = firstPageData.faceName;
  const allFeeds = data!.pages.flatMap((page) => page.data.faceFeedList);

  const handleThumbnailClick = (feedId: number) => {
    if (mode === "select") {
      setSelectedFeedIds((prev) => (prev.includes(feedId) ? prev.filter((id) => id !== feedId) : [...prev, feedId]));
    } else {
      router.push(`/feed/${feedId}`);
    }
  };

  const handleUnclassify = () => {
    if (selectedFeedIds.length === 0) {
      setMessage("잘못 분류된 사진을 선택해주세요.");
      return;
    }
    setConfirmUnclassify(true);
  };

  const executeUnclassify = async () => {
    try {
      await invalidateDetections(selectedFeedIds);
      setMessage(`선택한 사진이 "${faceName}"에서 제거되었습니다.`);
      setMode("default");
      setSelectedFeedIds([]);
      refetch();
    } catch (e) {
      console.error(e);
      setMessage("분류 해제 실패");
    }
    setConfirmUnclassify(false);
  };

  const handleDeletePhotos = () => {
    if (selectedFeedIds.length === 0) {
      setMessage("삭제할 사진을 선택해주세요.");
      return;
    }
    setConfirmDelete(true);
  };

  const executeDeletePhotos = async () => {
    try {
      setMessage("선택한 사진이 삭제되었습니다.");
      setMode("default");
      setSelectedFeedIds([]);
      refetch();
    } catch {
      setMessage("삭제 실패");
    }
    setConfirmDelete(false);
  };

  return (
    <>
      <PeopleHeader faceName={faceName} sortType={sortType} onSortChange={setSortType} />

      <div className={styles.gridWrapper}>
        {allFeeds.map((feed: FaceFeedType) => (
          <PeopleFeedGrid
            key={feed.feedId}
            feedId={feed.feedId}
            imageUrl={feed.feedThumbnailImgUrl}
            isLoaded
            isError={false}
            onClick={() => handleThumbnailClick(feed.feedId)}
            onLoad={() => {}}
            onError={() => {}}
            onRetry={() => {}}
            isSelected={selectedFeedIds.includes(feed.feedId)}
            mode={mode}
            onLongPressStart={handlePressStart}
            onLongPressEnd={handlePressEnd}
          />
        ))}
        <div
          ref={(el) => {
            if (!el || !hasNextPage || isFetchingNextPage) return;
            new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) fetchNextPage();
            }).observe(el);
          }}
          className={styles.infiniteScrollTrigger}
        />
      </div>

      {mode === "select" && (
        <PeopleFeedSelectBar
          onCancel={() => {
            setMode("default");
            setSelectedFeedIds([]);
          }}
          onUnclassify={handleUnclassify}
          onDelete={handleDeletePhotos}
        />
      )}

      <FloatingButton
        mode={mode}
        onClick={() => {
          if (mode === "default") {
            setMode("select");
          } else {
            setMode("default");
            setSelectedFeedIds([]);
          }
        }}
      />

      {isFetchingNextPage && <p className="text-center mt-4">더 불러오는 중...</p>}

      {confirmUnclassify && (
        <ErrorModal
          message={`이 사진을 "${faceName}"에서 제거하시겠습니까?`}
          onClose={() => setConfirmUnclassify(false)}
          onConfirm={executeUnclassify}
        />
      )}

      {confirmDelete && (
        <ErrorModal
          message="선택한 피드를 완전히 삭제하시겠습니까?"
          onClose={() => setConfirmDelete(false)}
          onConfirm={executeDeletePhotos}
        />
      )}

      {message && <ErrorModal message={message} onClose={() => setMessage(null)} />}
    </>
  );
}

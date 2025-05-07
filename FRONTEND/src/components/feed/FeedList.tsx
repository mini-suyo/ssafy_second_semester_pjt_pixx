// components/feed/FeedList.tsx

"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getFeeds } from "@/app/lib/api/feedApi";
import styles from "./feed-list.module.css";
import Image from "next/image";
import { Feed } from "@/app/types/feed";
// import { Feed } from "@/app/types/feed";

export default function FeedList() {
  const router = useRouter();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["feeds"],
    queryFn: ({ pageParam = 0 }) => getFeeds({ type: 0, page: pageParam, size: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      // lastPage.length가 20개보다 적으면 더 이상 가져올게 없다고 판단
      if (lastPage.length < 20) return undefined;
      return allPages.length; // 다음 pageParam으로 사용
    },
    initialPageParam: 0,
  });

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

  if (isLoading) return <div>로딩 중...</div>;
  if (isError) return <div>피드를 불러오는데 실패했습니다.</div>;

  return (
    <div className={styles["feed-grid-wrapper"]}>
      <div className={styles["feed-grid"]}>
        {data?.pages.map((page) =>
          page.map((feed: Feed) => (
            <div key={feed.feedId} className={styles["feed-item"]} onClick={() => router.push(`/feed/${feed.feedId}`)}>
              <Image src={feed.feedThumbnailImgUrl || "/dummy-feed-thumbnail.png"} alt={`Feed ${feed.feedId}`} />
            </div>
          ))
        )}
      </div>
      {/* 감시용 div: 마지막에 스크롤 도달하면 다음 페이지 불러오기 */}
      <div ref={observerRef} style={{ height: "1px" }} />
      {/* 추가 로딩 중이면 표시 */}
      {isFetchingNextPage && <div>추가 로딩 중...</div>}
    </div>
  );
}

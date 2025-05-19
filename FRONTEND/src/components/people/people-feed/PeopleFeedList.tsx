// components/people/people-feed/PeopleFeedList.tsx

'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { useParams, useRouter } from 'next/navigation';
import { getFaceFeeds } from '@/app/lib/api/peopleApi';
import type { FaceFeedType } from '@/app/types/people';
import PeopleFeedGrid from './PeopleFeedGrid';
import PeopleHeader from './PeopleHeader';
import PeopleFeedSelectBar from './PeopleFeedSelectBar';
import FloatingButton from '@/components/common/FloatingButton';
import { useState, useRef } from 'react';
import styles from './people-feed-list.module.css';

export default function PeopleFeedList() {
  const { id } = useParams();
  const faceId = Number(id);
  const router = useRouter();

  // 정렬 상태 관리
  const [sortType, setSortType] = useState<'recent' | 'oldest'>('recent');
  const apiType = sortType === 'recent' ? 0 : 1;

  // 선택 모드 상태 관리
  const [mode, setMode] = useState<'default' | 'select'>('default');
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]);

  // long-press 용 타이머
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 무한 스크롤용 React Query
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey: ['faceFeeds', faceId, apiType] as const,
    queryFn: ({ pageParam = 0 }) =>
      getFaceFeeds(faceId, { type: apiType, page: pageParam, size: 10 }),
    getNextPageParam: (lastPage, pages) =>
      lastPage.data.faceFeedList.length < 10 ? undefined : pages.length,
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  // long-press 시작
  const handlePressStart = () => {
    if (mode === 'default') {
      longPressTimerRef.current = setTimeout(() => setMode('select'), 1000);
    }
  };
  // long-press 종료
  const handlePressEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  // 썸네일 클릭
  const handleThumbnailClick = (feedId: number) => {
    if (mode === 'select') {
      setSelectedFeedIds(prev =>
        prev.includes(feedId) ? prev.filter(id => id !== feedId) : [...prev, feedId]
      );
    } else {
      router.push(`/feed/${feedId}`);
    }
  };

  // 선택된 사진을 인물에서 제거
  const handleUnclassify = async () => {
    if (selectedFeedIds.length === 0) {
      alert('잘못 분류된 사진을 선택해주세요.');
      return;
    }
    try {
      // TODO: 인물 분류 해제 API 연동
      alert('선택한 사진이 이 인물에서 분류 해제되었습니다.');
      setMode('default');
      setSelectedFeedIds([]);
      refetch();
    } catch {
      alert('분류 해제 실패');
    }
  };

  // 선택된 사진 삭제
  const handleDeletePhotos = async () => {
    if (selectedFeedIds.length === 0) {
      alert('삭제할 사진을 선택해주세요.');
      return;
    }
    if (!confirm('선택한 피드를 완전히 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      // TODO: 피드 삭제 API 연동
      alert('삭제가 완료되었습니다.');
      setMode('default');
      setSelectedFeedIds([]);
      refetch();
    } catch {
      alert('삭제 실패');
    }
  };

  // 로딩/에러 처리
  if (isLoading) return <div>불러오는 중...</div>;
  if (isError) return <div>에러가 발생했어요</div>;

  // data 보장 이후
  const firstPageData = data!.pages[0].data;
  const allFeeds = data!.pages.flatMap(page => page.data.faceFeedList);

  return (
    <div>
      {/* 헤더 */}
      <PeopleHeader
        faceName={firstPageData.faceName}
        sortType={sortType}
        onSortChange={setSortType}
      />

      {/* 그리드 */}
      <div className={styles.gridWrapper}>
        {allFeeds.map((feed: FaceFeedType) => (
          <PeopleFeedGrid
            key={feed.feedId}
            feedId={feed.feedId}
            imageUrl={feed.feedThumbnailImgUrl}
            isLoaded={true}
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

        {/* 무한 스크롤 트리거 */}
        <div
          ref={el => {
            if (!el || !hasNextPage || isFetchingNextPage) return;
            new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) fetchNextPage();
            }).observe(el);
          }}
          className={styles.infiniteScrollTrigger}
        />
      </div>


    {/* 선택 모드 바 */}
    {mode === 'select' && (
      <PeopleFeedSelectBar
        onCancel={() => {
          setMode('default');
          setSelectedFeedIds([]);
        }}
        onUnclassify={handleUnclassify}
        onDelete={handleDeletePhotos}
      />
    )}

      {/* 플로팅 버튼 */}
      <FloatingButton
        mode={mode}
        onClick={() => {
          if (mode === 'default') {
            setMode('select');
          } else {
            setMode('default');
            setSelectedFeedIds([]);
          }
        }}
      />

      {isFetchingNextPage && <p className="text-center mt-4">더 불러오는 중...</p>}
    </div>
  );
}

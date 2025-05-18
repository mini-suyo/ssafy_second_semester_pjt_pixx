// components/feed/FeedList.tsx

"use client";

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { deleteFeed, getFeeds } from "@/app/lib/api/feedApi";
import { addPhotosToAlbum, createAlbum } from "@/app/lib/api/albumApi";
import { FavoriteResponse, Feed } from "@/app/types/feed";
import { useMutation } from "@tanstack/react-query";
import { toggleFavorite } from "@/app/lib/api/feedApi";

import FloatingButton from "../common/FloatingButton";
import FeedSelectBar from "./FeedSelectBar";
import FeedAlbumCreateModal from "./FeedAlbumCreateModal";
import FeedAlbumAdd from "./FeedAlbumAdd";
import SortDropdown from "../common/SortDropdown";
import Image from "next/image";
import styles from "./feed-list.module.css";

export default function FeedList() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 피드 즐겨찾기
  const [favorite, setFavorite] = useState<{ [feedId: number]: boolean }>({});

  // 선택모드 관리
  const [mode, setMode] = useState<"default" | "select">("default"); // 앨범 생성 플로팅버튼 상태 관리
  const longPressTimer = useRef<NodeJS.Timeout | null>(null); // 썸네일 오래 누르는거 상태 관리
  const [selectedFeedIds, setSelectedFeedIds] = useState<number[]>([]); // 선택된 피드 관리

  // 앨범 생성 시 제목 관리
  const [albumTitle, setAlbumTitle] = useState("");

  // 앨범 추가 및 생성 모달 관리
  const [isAlbumAddOpen, setIsAlbumAddOpen] = useState(false);
  const [isAlbumCreateOpen, setIsAlbumCreateOpen] = useState(false);

  // 피드 썸네일 로딩 및 에러 상태 관리
  const [imageLoaded, setImageLoaded] = useState<{ [key: number]: boolean }>({});
  const [imageErrors, setImageErrors] = useState<{ [key: number]: boolean }>({});
  const [retryCount, setRetryCount] = useState<{ [key: number]: number }>({});
  const MAX_RETRY_ATTEMPTS = 3;

  // 정렬
  const [sortType, setSortType] = useState<"recent" | "oldest">("recent");
  const apiSortType = sortType === "recent" ? 0 : 1;

  // 리액트쿼리 API + 무한스크롤
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ["feeds", sortType],
    queryFn: ({ pageParam = 0 }) => getFeeds({ type: apiSortType, page: pageParam, size: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      // lastPage.length가 20개보다 적으면 더 이상 가져올게 없다고 판단
      if (lastPage.length < 20) return undefined;
      return allPages.length; // 다음 pageParam으로 사용
    },
    initialPageParam: 0,
    refetchOnWindowFocus: false, // 창 포커스 변경 시 리페치 방지
    staleTime: 1000 * 60 * 5, // 5분 동안 데이터를 신선한 상태로 유지 -> 나중에 사진 업로드 시 피드 변경 코드 추가 해야함!!
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

  // 피드 즐겨찾기
  const { mutate: toggleFavoriteMutation } = useMutation<FavoriteResponse, Error, number>({
    mutationFn: toggleFavorite,
    onSuccess: ({ feedId, isFavorite }) => {
      setFavorite((prev) => ({
        ...prev,
        [feedId]: isFavorite,
      }));

      // 즐겨찾기 앨범 캐시 무효과
      queryClient.invalidateQueries({
        queryKey: ["albumFeeds", 2, "recent"],
      });
    },

    onError: () => {
      alert("즐겨찾기 변경에 실패했습니다.");
    },
  });

  useEffect(() => {
    if (!data) return;

    const initialFavorite: { [feedId: number]: boolean } = {};
    data.pages.forEach((page) => {
      page.forEach((feed: Feed) => {
        initialFavorite[feed.feedId] = feed.feedFavorite;
      });
    });

    setFavorite(initialFavorite);
  }, [data]);

  // 이미지 로드 성공 핸들러
  const handleImageLoad = (feedId: number) => {
    setImageLoaded((prev) => ({ ...prev, [feedId]: true }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  // 이미지 로드 실패 핸들러
  const handleImageError = (feedId: number) => {
    // 현재 재시도 횟수 가져오기
    const currentRetryCount = retryCount[feedId] || 0;

    if (currentRetryCount < MAX_RETRY_ATTEMPTS) {
      // 재시도 횟수 증가
      setRetryCount((prev) => ({ ...prev, [feedId]: currentRetryCount + 1 }));

      // 이미지 캐시 무효화를 위한 랜덤 쿼리 파라미터 생성
      const feedWithRetry = data?.pages.flat().find((feed: Feed) => feed.feedId === feedId);

      if (feedWithRetry) {
        // 실패한 이미지 다시 로드 시도 (setTimeout으로 약간의 지연 추가)
        setTimeout(() => {
          // 이미지 상태 초기화하여 다시 로드되도록 함
          setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
          setImageErrors((prev) => ({ ...prev, [feedId]: false }));
        }, 1000); // 1초 후 재시도
      }
    } else {
      // 최대 재시도 횟수 초과 - 최종 에러 상태로 설정
      setImageErrors((prev) => ({ ...prev, [feedId]: true }));
      setImageLoaded((prev) => ({ ...prev, [feedId]: true })); // 로딩 인디케이터 숨기기
    }
  };

  // 이미지 재시도 요청 핸들러
  const handleRetryRequest = (feedId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 방지 (피드 클릭 이벤트 방지)

    // 재시도 횟수 초기화
    setRetryCount((prev) => ({ ...prev, [feedId]: 0 }));
    // 이미지 상태 초기화
    setImageLoaded((prev) => ({ ...prev, [feedId]: false }));
    setImageErrors((prev) => ({ ...prev, [feedId]: false }));
  };

  if (isLoading) return <div className={styles["loading-message"]}>소중한 피드를 불러오고 있어요</div>;
  if (isError) return <div className={styles["error-message"]}>피드를 불러오는데 실패했습니다</div>;
  // longPress
  const handlePressStart = () => {
    longPressTimer.current = setTimeout(() => {
      setMode("select");
    }, 800); // 800ms 이상 누르면 선택 모드로
  };

  // 정렬
  const handleSortChange = (value: "recent" | "oldest") => {
    setSortType(value);
    refetch(); // 정렬 변경 시 데이터 다시 불러오기
  };
  // longPress 타이머 취소
  const handlePressEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // 피드 클릭 핸들러
  const handleFeedClick = (feedId: number) => {
    if (mode === "select") {
      // 선택 모드인 경우, 선택 추가/삭제
      if (selectedFeedIds.includes(feedId)) {
        setSelectedFeedIds(selectedFeedIds.filter((id) => id !== feedId)); // 선택 해제
      } else {
        setSelectedFeedIds([...selectedFeedIds, feedId]); // 선택 추가
      }
    } else {
      // 기본 모드면 상세 페이지로 이동
      router.push(`/feed/${feedId}`);
    }
  };

  // 앨범 생성 🔥
  const handleCreateAlbum = async () => {
    if (albumTitle.trim() === "" || selectedFeedIds.length === 0) {
      alert("앨범 이름을 입력해주세요.");
      return;
    }
    try {
      const res = await createAlbum({
        albumTitle: albumTitle.trim(),
        imageList: selectedFeedIds,
      });
      alert("앨범 생성되었습니다");
      await queryClient.invalidateQueries({
        predicate: (query) => query.queryKey[0] === "albums",
      });

      router.push(`/album/${res.data.data.albumId}`);
    } catch (error) {
      alert("오류가 발생하여 앨범 생성에 실패했습니다");
      console.log(error);
    } finally {
      setIsAlbumCreateOpen(false);
      setMode("default");
      setSelectedFeedIds([]);
      setAlbumTitle("");
    }
  };

  // 앨범에 피드 추가
  const handleAddToAlbum = () => {
    if (selectedFeedIds.length === 0) {
      alert("추가할 사진을 먼저 선택해주세요.");
      return;
    }
    setIsAlbumAddOpen(true);
  };

  const handleAlbumSelect = async (albumId: number) => {
    try {
      await addPhotosToAlbum({ albumId, imageList: selectedFeedIds });
      alert("앨범에 사진이 추가되었습니다.");
      await queryClient.invalidateQueries({ queryKey: ["albums"] }); // 앨범 목록 무효화
      router.push(`/album/${albumId}`); //  앨범 상세 페이지로 이동
    } catch (error) {
      alert("사진 추가에 실패했습니다.");
      console.error(error);
    } finally {
      setIsAlbumAddOpen(false);
      setMode("default");
      setSelectedFeedIds([]);
    }
  };

  const handleCloseAlbumAddModal = () => {
    setIsAlbumAddOpen(false); // 모달 닫기
    setMode("default"); // 모드 초기화
    setSelectedFeedIds([]); // 선택된 피드도 초기화
  };

  // 이미지 삭제
  const handleDeletePhotos = async () => {
    if (selectedFeedIds.length === 0) {
      alert("삭제할 사진을 선택해주세요.");
      return;
    }

    try {
      await deleteFeed({
        imageList: selectedFeedIds,
      });

      alert("피드 사진 삭제 완료");

      refetch(); // 새로운 데이터 불러와서 UI 갱신
    } catch (error) {
      alert("삭제 실패");
      console.error(error);
    } finally {
      setMode("default");
      setSelectedFeedIds([]);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* 정렬 */}
      <div className={styles.selectWrapper}>
        <SortDropdown value={sortType} onChange={handleSortChange} />
      </div>
      <div className={styles["feed-grid-wrapper"]}>
        <div className={styles["feed-grid"]}>
          {data?.pages.map((page) =>
            // {data?.pages.map((page, pageIndex) =>
            // page.map((feed: Feed, feedIndex: number) => (
            page.map((feed: Feed) => {
              console.log("썸네일 URL", feed.feedThumbnailImgUrl);
              return (
                <div
                  key={feed.feedId}
                  className={styles["feed-item"]}
                  onClick={() => handleFeedClick(feed.feedId)}
                  onTouchStart={handlePressStart} // 모바일 longPress
                  onTouchEnd={handlePressEnd} // 모바일 longPress
                  onTouchCancel={handlePressEnd} // 모바일 longPress
                  onMouseDown={handlePressStart} // 웹 longPress
                  onMouseUp={handlePressEnd} // 웹 longPress
                  onMouseLeave={handlePressEnd} // 웹 longPress
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    // src={"/dummy-feed-thumbnail.png"}
                    src={feed.feedThumbnailImgUrl}
                    alt={`Feed ${feed.feedId}`}
                    // fill
                    className={styles.feedImage}
                    // priority={pageIndex === 0 && feedIndex < 6} // 처음 6개는 priority 사용할거면 위에서 pageIndex,feedIndex  넘겨받아야함
                    onLoad={() => handleImageLoad(feed.feedId)}
                    onError={() => handleImageError(feed.feedId)}
                  />

                  {/*  즐겨찾기 토글 버튼 */}
                  <div
                    className={styles.favoriteIcon}
                    onClick={(e) => {
                      e.stopPropagation(); // 상세 페이지 이동 방지
                      toggleFavoriteMutation(feed.feedId);
                    }}
                  >
                    <Image
                      src={
                        favorite[feed.feedId] ? "/icons/icon-star-fill-yellow.png" : "/icons/icon-star-empty-yellow.png"
                      }
                      alt="즐겨찾기"
                      width={32}
                      height={32}
                    />
                  </div>
                  {/* 선택된 피드 약간 어둡게 처리 */}
                  {mode === "select" && selectedFeedIds.includes(feed.feedId) && (
                    <div className={styles.selectedOverlay}></div>
                  )}

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

                  {/* 선택 모드일 때만 체크 아이콘 렌더링 */}
                  {mode === "select" && (
                    <div className={styles.checkIcon}>
                      <Image
                        src={
                          selectedFeedIds.includes(feed.feedId)
                            ? "/icons/icon-checked-purple.png"
                            : "/icons/icon-unchecked-purple.png"
                        }
                        alt="선택 여부"
                        width={36}
                        height={39}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* 감시용 div: 마지막에 스크롤 도달하면 다음 페이지 불러오기 */}
        <div ref={observerRef} style={{ height: "1px" }} />

        {/* 추가 로딩 중이면 표시 */}
        {isFetchingNextPage && <div>추가 로딩 중...</div>}
      </div>
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

      {/* 앨범 생성 모달 */}
      {/* <FeedAlbumCreateModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        albumTitle={albumTitle}
        setAlbumTitle={setAlbumTitle}
        onSubmit={handleCreateAlbum}
      /> */}

      {/* 앨범에 피드 추가 */}
      {/* <FeedAlbumAdd isOpen={isAlbumModalOpen} onClose={() => setIsAlbumModalOpen(false)} onSelect={handleAlbumSelect} /> */}

      {/* 🔥🔥🔥🔥🔥🔥 */}
      {isAlbumAddOpen && (
        <FeedAlbumAdd
          isOpen={isAlbumAddOpen}
          onClose={handleCloseAlbumAddModal}
          onSelect={handleAlbumSelect}
          onCreateNewAlbum={() => setIsAlbumCreateOpen(true)}
        />
      )}

      {isAlbumCreateOpen && (
        <FeedAlbumCreateModal
          isOpen={isAlbumCreateOpen}
          onClose={() => setIsAlbumCreateOpen(false)}
          albumTitle={albumTitle}
          setAlbumTitle={setAlbumTitle}
          onSubmit={handleCreateAlbum}
        />
      )}

      {/* 선택용 Navbar 렌더링 (선택 모드일 때만 노출) */}
      {mode === "select" && (
        <FeedSelectBar
          onAdd={handleAddToAlbum}
          // onCreate={() => setIsModalOpen(true)}
          onDelete={handleDeletePhotos}
        />
      )}
    </div>
  );
}

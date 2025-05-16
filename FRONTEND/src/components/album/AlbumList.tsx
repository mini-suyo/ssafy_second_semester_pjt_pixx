// components/album/AlbumList.tsx

"use client";

import { deleteAlbum, getAlbums } from "@/app/lib/api/albumApi";
import styles from "./album-list.module.css";
import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import SortDropdown from "../common/SortDropdown";
import AlbumSelectBar from "./AlbumSelectBar";
import FloatingButton from "../common/FloatingButton";

export default function AlbumList() {
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 앨범 편집
  const [mode, setMode] = useState<"default" | "select">("default");
  const [selectedAlbumIds, setSelectedAlbumIds] = useState<number[]>([]);

  // 정렬
  const [sortType, setSortType] = useState<"recent" | "oldest">("recent");
  const apiSortType = sortType === "recent" ? 0 : 1;

  // React Query의 useInfiniteQuery 훅을 사용하여 무한 스크롤 구현
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ["albums", sortType],
    queryFn: async ({ pageParam = 0 }) => {
      return await getAlbums({ type: apiSortType, page: pageParam, size: 20 });
    },

    getNextPageParam: (lastPage, allPages) => {
      // API 응답 형식에 맞게 처리
      // 만약 마지막 페이지의 결과가 20개 미만이면 더 이상 페이지가 없음
      const albumList = lastPage.data?.albumList || [];
      return albumList.length < 20 ? undefined : allPages.length;
    },
    initialPageParam: 0,
  });

  // longPress
  let pressTimer: NodeJS.Timeout;

  const handleLongPressStart = (albumId: number) => {
    pressTimer = setTimeout(() => {
      setMode("select");
      setSelectedAlbumIds([albumId]);
    }, 800); // 600ms 이상 누르면 longpress로 판단
  };

  const handleLongPressEnd = () => {
    clearTimeout(pressTimer);
  };

  // 앨범 클릭
  const handleAlbumClick = (albumId: number) => {
    if (mode === "select") {
      setSelectedAlbumIds((prev) =>
        prev.includes(albumId) ? prev.filter((id) => id !== albumId) : [...prev, albumId]
      );
    } else {
      router.push(`/album/${albumId}`);
    }
  };

  // 앨범 삭제
  const handleDeleteAlbum = async () => {
    if (selectedAlbumIds.length === 0) {
      alert("삭제할 앨범을 선택하세요.");
      return;
    }

    try {
      for (const id of selectedAlbumIds) {
        await deleteAlbum(id);
        await refetch();
      }
      alert("삭제 완료");
    } catch (err) {
      alert("삭제 실패");
      console.error(err);
    } finally {
      setSelectedAlbumIds([]);
      setMode("default");
    }
  };

  // 무한 스크롤을 위한 IntersectionObserver 설정
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  // IntersectionObserver 설정 및 해제
  useEffect(() => {
    const element = loadMoreRef.current;
    if (!element) return;

    observerRef.current = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "0px",
      threshold: 0.1,
    });

    observerRef.current.observe(element);

    return () => {
      if (observerRef.current && element) {
        observerRef.current.unobserve(element);
      }
    };
  }, [handleObserver]);

  // 정렬
  const handleSortChange = (value: "recent" | "oldest") => {
    setSortType(value);
    refetch(); // 정렬 변경 시 데이터 다시 불러오기
  };

  // 선택 모드 취소
  const handleOnCancle = () => {
    setMode("default"); // Cancel 누르면 다시 default 모드로
    setSelectedAlbumIds([]); // 선택한 피드 초기화
  };

  // 날짜 형식 변환
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return dayjs(dateString).format("YYYY. MM. DD ~");
  };

  if (status === "pending") {
    return <div className={styles["loading-message"]}>앨범을 불러오고 있습니다</div>;
  }

  if (status === "error") {
    return <div className={styles["error-message"]}>오류가 발생했습니다 잠시후 다시 시도해주세요</div>;
  }

  // 모든 페이지의 앨범 데이터를 하나의 배열로 합치기
  const albums = data?.pages.flatMap((page) => page.data?.albumList || []) || [];

  return (
    <div>
      <div className={styles.selectWrapper}>
        <SortDropdown value={sortType} onChange={handleSortChange} />
      </div>

      <div className={styles.albumListWrapper}>
        {albums.length === 0 ? (
          <div className={styles["empty-message"]}>앨범을 불러오는데 실패했어요</div>
        ) : (
          albums.map((album, index) => {
            const totalImages = 12;
            const imageNumber = (album.albumId % totalImages) + 1;
            const imagePath = `/constellations/${imageNumber}.png`;

            return (
              <div
                key={album.albumId}
                onMouseDown={() => handleLongPressStart(album.albumId)}
                onMouseUp={handleLongPressEnd}
                onTouchStart={() => handleLongPressStart(album.albumId)}
                onTouchEnd={handleLongPressEnd}
                onClick={() => handleAlbumClick(album.albumId)}
                className={styles.albumItem}
              >
                {mode === "select" && selectedAlbumIds.includes(album.albumId) && (
                  <>
                    <div className={styles.selectedOverlay} />
                    <div className={styles.checkIcon}>
                      <Image src="/icons/icon-checked-purple.png" alt="선택됨" width={32} height={32} />
                    </div>
                  </>
                )}

                <div className={`${styles.albumContent} ${index % 2 === 0 ? styles.leftImage : styles.rightImage}`}>
                  <Image src={imagePath} alt="별자리" className={styles.constellationImage} width={100} height={100} />
                  <div className={`${styles.albumInfo} ${index % 2 === 0 ? styles.alignLeft : styles.alignRight}`}>
                    <div className={styles.albumName}>{album.albumName}</div>
                    <div className={styles.separator} />
                    <div className={styles.albumDate}>{formatDate(album.albumDate)}</div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 무한 스크롤을 위한 로딩 표시기 */}
      <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
        {isFetchingNextPage && <p>앨범을 더 불러오는 중...</p>}
      </div>

      {/* 플로팅 버튼 추가 */}
      <FloatingButton
        mode={mode}
        onClick={() => {
          if (mode === "default") {
            setMode("select"); // Edit 누르면 select 모드로
          } else {
            setMode("default"); // Cancel 누르면 다시 default 모드로
            setSelectedAlbumIds([]); // 선택한 피드 초기화
          }
        }}
      />

      {/* 선택용 Navbar 렌더링 (선택 모드일 때만 노출) */}
      {mode === "select" && <AlbumSelectBar onCancle={handleOnCancle} onDelete={handleDeleteAlbum} />}
    </div>
  );
}

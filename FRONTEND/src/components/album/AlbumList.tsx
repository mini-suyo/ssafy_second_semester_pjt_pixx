// components/album/AlbumList.tsx

"use client";

import { getAlbums } from "@/app/lib/api/albumApi";
import styles from "./album-list.module.css";
import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dayjs from "dayjs";
import SortDropdown from "../common/SortDropdown";

export default function AlbumList() {
  const router = useRouter();
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 정렬
  const [sortType, setSortType] = useState<"recent" | "oldest">("recent");
  const apiSortType = sortType === "recent" ? 0 : 1;

  // React Query의 useInfiniteQuery 훅을 사용하여 무한 스크롤 구현
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, status, refetch } = useInfiniteQuery({
    queryKey: ["albums"],
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

  // // 앨범 삭제
  // const handleDeleteAlbum = async () => {
  //   const confirmDelete = confirm("정말 이 앨범을 삭제하시겠습니까?");
  //   if (!confirmDelete) return;

  //   try {
  //     await deleteAlbum(albumId);
  //     alert("앨범이 삭제되었습니다.");
  //     router.push("/album"); // 앨범 리스트 페이지로 이동
  //   } catch (err) {
  //     alert("앨범 삭제에 실패했습니다.");
  //     console.error(err);
  //   }
  // };

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
          albums.map((album, index) => (
            <div
              key={album.albumId}
              className={styles.albumItem}
              onClick={() => router.push(`/album/${album.albumId}`)}
            >
              <div className={`${styles.albumContent} ${index % 2 === 0 ? styles.leftImage : styles.rightImage}`}>
                <Image
                  src="/constellations/aries_1.png"
                  alt="별자리"
                  className={styles.constellationImage}
                  width={100}
                  height={100}
                />
                <div className={`${styles.albumInfo} ${index % 2 === 0 ? styles.alignLeft : styles.alignRight}`}>
                  <div className={styles.albumName}>{album.albumName}</div>
                  <div className={styles.separator} />
                  <div className={styles.albumDate}>{formatDate(album.albumDate)}</div>
                </div>
              </div>
            </div>
          ))
        )}
        {/* 무한 스크롤을 위한 로딩 표시기 */}
        <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
          {isFetchingNextPage && <p>앨범을 더 불러오는 중...</p>}
        </div>
      </div>
    </div>
  );
}

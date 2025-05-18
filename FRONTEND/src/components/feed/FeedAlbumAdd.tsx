// components/feed/FeedAlbumAdd.tsx

"use client";

import { createAlbum, getAlbums } from "@/app/lib/api/albumApi";
import styles from "./feed-album-add.module.css";
import { useEffect, useRef, useCallback, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import dayjs from "dayjs";
import FloatingButton from "../common/FloatingButton";

type FeedAlbumAddProps = {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (albumId: number) => void;
  onCreateNewAlbum: () => void;
};

export default function FeedAlbumAdd({ isOpen, onClose, onSelect, onCreateNewAlbum }: FeedAlbumAddProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // isOpen이 false면 null 리턴
  if (!isOpen) return null;

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: ["albums"],
    queryFn: async ({ pageParam = 0 }) => await getAlbums({ type: 0, page: pageParam, size: 20 }),
    getNextPageParam: (lastPage, allPages) => {
      const albumList = lastPage.data?.albumList || [];
      return albumList.length < 20 ? undefined : allPages.length;
    },
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  // 앨범 생성 플로팅 버튼과 충돌나서 주석처리함
  // 모달 바깥 클릭 시 닫힘 기능
  // useEffect(() => {
  //   const handleClickOutside = (e: MouseEvent) => {
  //     if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
  //       onClose();
  //     }
  //   };
  //   if (isOpen) {
  //     document.addEventListener("mousedown", handleClickOutside);
  //   }
  //   return () => {
  //     document.removeEventListener("mousedown", handleClickOutside);
  //   };
  // }, [isOpen, onClose]);

  // 무한스크롤 감지
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

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

  const albums = data?.pages.flatMap((page) => page.data?.albumList || []) || [];

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY. MM. DD ~");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} ref={modalRef}>
        <h2 className={styles.modalTitle}>앨범 선택</h2>
        <button className={styles.closeButton} onClick={onClose}>
          <Image src="/icons/icon-close.png" alt="닫기" width={28} height={28} />
        </button>
        <div className={styles.albumListWrapper}>
          {albums.map((album, index) => (
            <div key={album.albumId} className={styles.albumItem} onClick={() => onSelect(album.albumId)}>
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
          ))}
        </div>
        <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
          {isFetchingNextPage && <p>앨범을 더 불러오는 중...</p>}
        </div>
        {/* 플로팅 버튼 추가 */}
        <FloatingButton mode="default" onClick={onCreateNewAlbum} label="만들기" />
      </div>
    </div>
  );
}

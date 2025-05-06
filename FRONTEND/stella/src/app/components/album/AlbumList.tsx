// components/album/AlbumList.tsx

"use client";

import { getAlbums } from "@/app/lib/api/albumApi";
import styles from "./album.module.css";
import { Album } from "@/app/types/album";
import { useState, useEffect } from "react";
import dayjs from "dayjs";

// 실패 시 사용할 Mock 데이터
const mockAlbums: Album[] = [
  {
    albumId: 1,
    albumName: "Mock 앨범1",
    albumDate: "2025-05-06T10:00:00",
  },
  {
    albumId: 2,
    albumName: "Mock 앨범2",
    albumDate: "2025-05-05T10:00:00",
  },
];

export default function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await getAlbums({ type: 0, page: 0, size: 20 });
        setAlbums(res);
      } catch (error) {
        console.error("앨범 불러오기 실패:", error);
        setAlbums(mockAlbums); // 실패하면 Mock 데이터로 대체
      } finally {
        setLoading(false); // 성공 실패 관계 없이 끝나면 로딩 상태 false로 변경해주기
      }
    };

    fetchAlbums(); // 함수 실행
  }, []);

  // 날짜 형식 변환환
  const formatDate = (dateString: string) => {
    return dayjs(dateString).format("YYYY. MM. DD ~");
  };

  if (loading) {
    return <h1>앨범을 불러오고 있습니다</h1>;
  }

  return (
    <div className={styles.albumListWrapper}>
      {albums.map((album, index) => (
        <div key={album.albumId} className={styles.albumItem}>
          <div className={`${styles.albumContent} ${index % 2 === 0 ? styles.leftImage : styles.rightImage}`}>
            {/* 별자리 그림은 나중에 매칭 */}
            <img src="/constellations/aries_1.png" alt="별자리" className={styles.constellationImage} />
            <div className={`${styles.albumInfo} ${index % 2 === 0 ? styles.alignLeft : styles.alignRight}`}>
              <div className={styles.albumName}>{album.albumName}</div>
              <div className={styles.separator} />
              <div className={styles.albumDate}>{formatDate(album.albumDate)}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

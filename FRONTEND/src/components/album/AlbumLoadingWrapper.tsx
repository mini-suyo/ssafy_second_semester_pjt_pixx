"use client";

import { useEffect, useState } from "react";
import styles from "./album-loading-wrapper.module.css";

export default function AlbumPageWrapper({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 1500); // 텍스트 애니메이션 이후 콘텐츠 전환
    return () => clearTimeout(timer);
  }, []);

  if (!showContent) {
    return (
      <div className={styles.wrapper}>
        {/* 배경 별 애니메이션 포함 */}
        <div className={styles.messageBox}>
          <p className={styles.line}>사진 한 장, 별 하나.</p>
          <p className={styles.line}>당신의 추억이 별자리가 됩니다.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

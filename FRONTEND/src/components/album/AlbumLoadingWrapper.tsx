"use client";

import { useEffect, useState } from "react";
import styles from "./album-loading-wrapper.module.css";

export default function AlbumPageWrapper({ children }: { children: React.ReactNode }) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    console.log("🎯 AlbumLoadingWrapper mounted");

    try {
      const hasSeenAlbumIntro = localStorage.getItem("hasSeenAlbumIntro");
      console.log("✅ localStorage value:", hasSeenAlbumIntro);

      if (hasSeenAlbumIntro === "true") {
        console.log("🚀 Skipping intro screen");
        setShowContent(true);
        return;
      }

      const timer = setTimeout(() => {
        console.log("✨ Showing intro and saving flag");
        localStorage.setItem("hasSeenAlbumIntro", "true");
        setShowContent(true);
      }, 1800);

      return () => clearTimeout(timer);
    } catch (err) {
      console.error("❌ localStorage error", err);
      setShowContent(true); // fallback
    }
  }, []);
  // useEffect(() => {
  //   // 브라우저당 한번만 보여주기
  //   const hasSeenAlbumIntro = localStorage.getItem("hasSeenAlbumIntro");
  //   if (hasSeenAlbumIntro === "true") {
  //     setShowContent(true); // 이미 봤다면 바로 콘텐츠 보여줌
  //     console.log("setShowContent", setShowContent);
  //     return;
  //   }

  //   // 텍스트 애니메이션 이후 콘텐츠 전환
  //   const timer = setTimeout(() => setShowContent(true), 1800);
  //   return () => clearTimeout(timer);
  // }, []);

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

import { useState } from "react";
import Image from "next/image";
import styles from "./tutorial.module.css";

type TutorialType = "welcome" | "main" | "feed" | "album" | "album_detail" | "feed_detail";

interface TutorialProps {
  onClose: () => void;
  type: TutorialType;
}

// 각 타입별 이미지 개수 설정
const PAGE_COUNTS: Record<TutorialType, number> = {
  welcome: 1,
  main: 7,
  feed: 4,
  album: 2,
  album_detail: 2,
  feed_detail: 2,
};

const Tutorial: React.FC<TutorialProps> = ({ onClose, type }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = PAGE_COUNTS[type];

  // 이미지 파일들을 페이지 타입에 따라 동적으로 import
  const tutorialImages = Array.from({ length: totalPages }, (_, i) => `/tutorial/${type}/${i + 1}.png`);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <span className={styles.pageIndicator}>
            {currentPage} / {totalPages}
          </span>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.imageContainer}>
            <button
              className={`${styles.navOverlay} ${styles.prevOverlay}`}
              onClick={handlePrevious}
              disabled={currentPage === 1}
              aria-label="이전 이미지"
            />
            <button
              className={`${styles.navOverlay} ${styles.nextOverlay}`}
              onClick={handleNext}
              disabled={currentPage === totalPages}
              aria-label="다음 이미지"
            />
            <Image
              src={tutorialImages[currentPage - 1]}
              alt={`Tutorial page ${currentPage}`}
              className={styles.tutorialImage}
              width={1920}
              height={1080}
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tutorial;

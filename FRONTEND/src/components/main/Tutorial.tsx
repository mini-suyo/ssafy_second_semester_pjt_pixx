import { useState } from "react";
import Image from "next/image";
import styles from "./tutorial.module.css";

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  const [currentPage, setCurrentPage] = useState(1);

  // 이미지 파일들을 동적으로 import
  const tutorialImages = Array.from({ length: 20 }, (_, i) => `/tutorial/${i + 1}.png`);

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(20, prev + 1));
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
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
              disabled={currentPage === 20}
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

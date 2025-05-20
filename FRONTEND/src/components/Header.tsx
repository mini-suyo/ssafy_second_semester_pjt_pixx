"use client";
import styles from "./header.module.css";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Tutorial from "@/components/main/Tutorial";

export default function Header() {
  const [showTutorial, setShowTutorial] = useState(false);
  const pathname = usePathname();

  const getTutorialType = () => {
    const path = pathname.split("/")[1];
    switch (path) {
      case "main":
        return "main";
      case "feed":
        return pathname.split("/").length > 2 ? "feed_detail" : "feed";
      case "album":
        return pathname.split("/").length > 2 ? "album_detail" : "album";
      default:
        return "welcome";
    }
  };

  const handleInquiry = () => {
    window.open("https://forms.gle/t2ZB2NkXGcTBGd7u8", "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.headerContainer}>
      <Link href="/feed" className={styles.title}>
        Pixx
      </Link>
      <div className={styles.buttonContainer}>
        <button className={styles.tutorialButton} onClick={() => setShowTutorial(true)} aria-label="튜토리얼 보기">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-2a8 8 0 1 0 0-16 8 8 0 0 0 0 16zm-1-5h2v2h-2v-2zm2-1.645V14h-2v-1.5a1 1 0 0 1 1-1 1.5 1.5 0 1 0-1.471-1.794l-1.962-.393A3.5 3.5 0 1 1 13 13.355z"
              fill="white"
            />
          </svg>
        </button>
        <button className={styles.inquiryButton} onClick={handleInquiry}>
          <Image src="/icons/icon-spaceship.png" alt="문의하기" width={30} height={30} />
        </button>
      </div>
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} type={getTutorialType()} />}
    </div>
  );
}

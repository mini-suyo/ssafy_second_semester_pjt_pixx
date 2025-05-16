"use client";
import styles from "./header.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Header() {
  const handleInquiry = () => {
    window.open("https://forms.gle/t2ZB2NkXGcTBGd7u8", "_blank", "noopener,noreferrer");
  };

  return (
    <div className={styles.headerContainer}>
      <Link href="/feed" className={styles.title}>
        Pixx
      </Link>
      <button className={styles.inquiryButton} onClick={handleInquiry}>
        <Image src="/icons/icon-spaceship.png" alt="문의하기" width={30} height={30} />
      </button>
    </div>
  );
}

// components/feed/FeedEditModal.tsx

"use client";

import { useState } from "react";
import styles from "./feed-info-edit-modal.module.css";
import { updateFeed } from "@/app/lib/api/feedApi";
import dayjs from "dayjs";
import Image from "next/image";

export default function FeedInfoEditModal({
  isOpen,
  onClose,
  feedDetail,
  onSuccess,
  feedId,
}: {
  isOpen: boolean;
  onClose: () => void;
  feedDetail: any;
  onSuccess: () => void;
  feedId: number;
}) {
  if (!isOpen || !feedDetail) return null;

  const [title, setTitle] = useState(feedDetail.feedTitle || "");
  const [date, setDate] = useState(dayjs(feedDetail.feedDate).format("YYYY.MM.DD"));
  const [location, setLocation] = useState(feedDetail.feedLocation || "");
  const [brand, setBrand] = useState(feedDetail.brandName || "");
  const [memo, setMemo] = useState(feedDetail.feedMemo || "");
  const [hashtags, setHashtags] = useState(feedDetail.feedHashtags?.map((tag: string) => `#${tag}`).join(" ") || "");
  const handleSubmit = async () => {
    try {
      const formattedDate = dayjs(date, "YYYY.MM.DD").format("YYYY-MM-DDTHH:mm:ss");

      const tagArray = hashtags
        .split(/\s+/)
        .map((tag: string) => tag.replace(/^#/, ""))
        .filter(Boolean);

      await updateFeed(Number(feedId), {
        feedId: Number(feedId),
        feedTitle: title,
        feedDate: formattedDate,
        location,
        brandName: brand,
        feedMemo: memo,
        hashtags: tagArray,
      });
      console.log("feedDetail.feedId:", feedDetail.feedId);
      console.log("props.feedId:", feedId);

      alert("수정 완료!");
      onClose();
      onSuccess();
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalActions}>
          <button className={styles.closeButton} onClick={onClose}>
            <Image src="/icons/icon-close.png" alt="닫기" width={28} height={28} />
          </button>
        </div>

        {/* 제목 입력 */}
        <input
          className={styles.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 작성해주세요"
        />

        {/* <div className={styles.divider} /> */}

        {/* 해시태그 입력 */}
        <input
          className={styles.input}
          value={hashtags}
          onChange={(e) => setHashtags(e.target.value)}
          placeholder="#해시태그 #입력"
        />

        {/* 날짜 / 장소 / 브랜드 입력 */}
        <div className={styles.infoRow}>
          <Image src="/icons/icon-date.png" alt="촬영일" width={20} height={20} />
          <input
            className={styles.input}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="YYYY.MM.DD"
          />
        </div>
        <div className={styles.infoRow}>
          <Image src="/icons/icon-location.png" alt="위치" width={20} height={20} />
          <input
            className={styles.input}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="장소"
          />
        </div>
        <div className={styles.infoRow}>
          <Image src="/icons/icon-brand.png" alt="브랜드" width={20} height={20} />
          <input
            className={styles.input}
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="브랜드"
          />
        </div>

        {/* 메모 */}
        <div className={styles.memo}>
          <h3>Memo</h3>
          <textarea
            className={styles.textarea}
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            placeholder="메모를 작성해주세요"
          />
        </div>

        {/* 버튼 영역 */}
        <div className={styles.buttonRow}>
          <button onClick={onClose} className={styles.cancelButton}>
            취소
          </button>
          <button onClick={handleSubmit} className={styles.submitButton}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
}

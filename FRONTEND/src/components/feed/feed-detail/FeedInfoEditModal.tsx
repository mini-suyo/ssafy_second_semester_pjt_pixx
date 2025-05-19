// components/feed/FeedEditModal.tsx

"use client";

import { useEffect, useState } from "react";
import styles from "./feed-info-edit-modal.module.css";
import { updateFeed } from "@/app/lib/api/feedApi";

import dayjs from "dayjs";
import Image from "next/image";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  const [title, setTitle] = useState(feedDetail.feedTitle || "");
  const [date, setDate] = useState(dayjs(feedDetail.feedDate).format("YYYY.MM.DD"));
  const [location, setLocation] = useState(feedDetail.feedLocation || "");
  const [brand, setBrand] = useState(feedDetail.brandName || "");
  const [memo, setMemo] = useState(feedDetail.feedMemo || "");

  // 브랜드 선택
  const brandOptions = [
    { value: "기타", label: "기타" },
    { value: "모노맨션", label: "모노맨션" },
    { value: "하루필름", label: "하루필름" },
    { value: "포토이즘", label: "포토이즘" },
    { value: "인생네컷", label: "인생네컷" },
  ];

  const selectedBrandOption = brandOptions.find((opt) => opt.value === brand) ?? null;

  // 날짜 선택
  const [parsedDate, setParsedDate] = useState<Date | null>(date ? dayjs(date, "YYYY.MM.DD").toDate() : null);

  // 해시 태그 # 설정
  const [tagList, setTagList] = useState<string[]>([]);
  // const [rawInput, setRawInput] = useState("");
  const [currentTag, setCurrentTag] = useState("");

  //  feedDetail이 바뀔 때마다 상태 초기화
  useEffect(() => {
    if (!feedDetail) return;

    setTitle(feedDetail.feedTitle || "");
    setDate(dayjs(feedDetail.feedDate).format("YYYY.MM.DD"));
    setLocation(feedDetail.feedLocation || "");
    setBrand(feedDetail.brandName || "");
    setMemo(feedDetail.feedMemo || "");

    // 해시태그 상태 초기화
    const initialTags = feedDetail.feedHashtags || [];
    setTagList(initialTags);
    setCurrentTag(""); // 입력 필드 초기화
  }, [feedDetail]);
  if (!isOpen || !feedDetail) return null;

  // 태그 추가 함수
  const addTag = () => {
    const tag = currentTag.trim().replace(/^#/, ""); // # 제거
    if (tag && !tagList.includes(tag)) {
      setTagList([...tagList, tag]);
    }
    setCurrentTag("");
  };
  // 태그 삭제 함수
  const removeTag = (indexToRemove: number) => {
    setTagList(tagList.filter((_, index) => index !== indexToRemove));
  };

  // 태그 입력 처리
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === " ") && currentTag.trim()) {
      e.preventDefault();
      addTag();
    }
  };

  // 제출 함수
  const handleSubmit = async () => {
    try {
      const formattedDate = dayjs(date, "YYYY.MM.DD").format("YYYY-MM-DDTHH:mm:ss");

      await updateFeed(Number(feedId), {
        feedId: Number(feedId),
        feedTitle: title,
        feedDate: formattedDate,
        location,
        brandName: brand,
        feedMemo: memo,
        hashtags: tagList, // 서버에는 # 기호 없이 저장
      });

      console.log("props.feedId:", feedId);

      alert("수정 완료!");
      await onSuccess();
      onClose();
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
          value={title === null ? "" : title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="제목을 작성해주세요"
        />

        {/* <div className={styles.divider} /> */}

        {/* 해시태그 입력 */}
        {/* 추후 실시간 포맷팅 `react-tag-input, react-tagsinput, react-select + isMulti` 도전 */}
        <div className={styles.input}>
          <div className={styles.tagsDisplay}>
            {tagList.map((tag, index) => (
              <span key={index} className={styles.tag}>
                #{tag}
                <span className={styles.removeTagBtn} onClick={() => removeTag(index)}>
                  ×
                </span>
              </span>
            ))}
          </div>
          <input
            className={styles.tagInput}
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            onBlur={() => currentTag.trim() && addTag()}
            placeholder={tagList.length ? "" : "해시태그 - #없이 띄어쓰기로 구분하세요"}
          />
        </div>

        {/* <input
          className={styles.input}
          // value={[...tagList.map((t) => `#${t}`), rawInput].join(" ")}
          value={rawInput}
          onChange={(e) => {
            const input = e.target.value;
            setRawInput(input);

            // 전체 입력을 공백 기준으로 나눔
            const words = input.trim().split(/\s+/);
            const tags = words.map((w) => w.replace(/^#/, "").trim()).filter((w) => w.length > 0);

            setTagList(tags); // 항상 tagList를 최신으로 계산
          }}
          placeholder="해시태그 - #없이 띄어쓰기로 구분하세요"
        /> */}

        {/* 날짜 / 장소 / 브랜드 입력 */}
        <div className={styles.infoRow}>
          <Image src="/icons/icon-date.png" alt="촬영일" width={20} height={20} />
          <DatePicker
            selected={parsedDate}
            calendarClassName="custom-calendar"
            dayClassName={(date) => (dayjs(date).day() === 0 ? "sunday" : "")}
            onChange={(date: Date | null) => {
              setParsedDate(date);
              if (date) {
                setDate(dayjs(date).format("YYYY.MM.DD")); // 기존 date 문자열도 업데이트
              }
            }}
            dateFormat="yyyy.MM.dd"
            placeholderText="촬영일을 선택해주세요"
            className={styles.input}
          />
        </div>
        <div className={styles.infoRow}>
          <Image src="/icons/icon-location.png" alt="위치" width={20} height={20} />
          <input
            className={styles.input}
            value={location === null ? "" : location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="장소"
          />
        </div>
        <div className={styles.infoRow}>
          <Image src="/icons/icon-brand.png" alt="브랜드" width={20} height={20} />
          <div style={{ flex: 1 }}>
            <Select
              options={brandOptions}
              placeholder="브랜드를 선택해주세요"
              value={selectedBrandOption}
              onChange={(selected) => {
                if (selected) setBrand(selected.value);
              }}
              components={{ IndicatorSeparator: () => null }}
              styles={{
                container: (base) => ({
                  ...base,
                  width: "85%", //
                }),
                control: (base) => ({
                  ...base,
                  backgroundColor: "transparent",
                  border: "none",
                  borderBottom: "1px solid rgba(255, 250, 248, 0.23)",
                  boxShadow: "none",
                  color: "#fffaf8",
                  borderRadius: 0,
                }),
                singleValue: (base) => ({
                  ...base,
                  color: "#fffaf8",
                }),
                placeholder: (base) => ({
                  ...base,
                  color: "#fffaf8a8",
                }),
                menu: (base) => ({
                  ...base,
                  backgroundColor: "#261b2d",
                  color: "#fffaf8",
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isFocused ? "#4b436e" : "transparent",
                  color: "#fffaf8",
                }),
              }}
            />
          </div>
        </div>

        {/* 메모 */}
        <div className={styles.memo}>
          <h3>Memo</h3>
          <textarea
            className={styles.textarea}
            value={memo === null ? "" : memo}
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

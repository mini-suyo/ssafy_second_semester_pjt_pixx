"use client";

import styles from "./feed-album-create-modal.module.css";

type AlbumCreateProps = {
  isOpen: boolean;
  onClose: () => void;
  albumTitle: string;
  setAlbumTitle: (title: string) => void;
  onSubmit: () => void;
};

export default function FeedAlbumCreateModal({
  isOpen,
  onClose,
  albumTitle,
  setAlbumTitle,
  onSubmit,
}: AlbumCreateProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>앨범 생성</h2>

        <input
          type="text"
          className={styles.input}
          placeholder="앨범 제목을 입력하세요"
          value={albumTitle}
          onChange={(e) => setAlbumTitle(e.target.value)}
        />

        <div className={styles.buttonRow}>
          <button className={styles.cancelButton} onClick={onClose}>
            취소
          </button>
          <button className={styles.submitButton} onClick={onSubmit}>
            생성
          </button>
        </div>
      </div>
    </div>
  );
}

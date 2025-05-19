// src/components/ErrorModal.tsx

import styles from "./error-modal.module.css";

interface ErrorModalProps {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
}

export default function ErrorModal({
  message,
  onClose,
  onConfirm,
}: ErrorModalProps) {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader} />
        <div className={styles.modalBody}>
          <p>{message}</p>
        </div>
        <div className={styles.modalFooter}>

          <button
            onClick={onConfirm ?? onClose}
            className={styles.confirmButton}
          >
            확인
          </button>
          {/* onConfirm 이 있을 때만 취소 버튼 노출 */}
          {onConfirm && (
            <button
              onClick={onClose}
              className={styles.cancelButton}
            >
              취소
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

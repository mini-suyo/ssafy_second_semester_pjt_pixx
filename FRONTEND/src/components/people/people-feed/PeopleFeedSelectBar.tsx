// components/people/people-feed/PeopleFeedSelectBar.tsx

'use client';

import Image from 'next/image';
import styles from './people-feed-select-bar.module.css';

type PeopleFeedSelectBarProps = {
  onCancel: () => void;
  onMove: () => void;
  onDelete: () => void;
};

export default function PeopleFeedSelectBar({
  onCancel,
  onMove,
  onDelete,
}: PeopleFeedSelectBarProps) {
  return (
    <div className={styles.selectModeBar}>
      <button onClick={onCancel}>
        <Image src="/icons/icon-cancel.png" alt="Cancel" width={32} height={32} style={{ padding: '2px' }} />
        Cancel
      </button>
      <button onClick={onMove}>
        <Image src="/icons/icon-folder.png" alt="Move" width={32} height={32} style={{ padding: '2px' }} />
        Move
      </button>
      <button onClick={onDelete}>
        <Image src="/icons/icon-delete.png" alt="Delete" width={32} height={32} style={{ padding: '2px' }} />
        Delete
      </button>
    </div>
  );
}

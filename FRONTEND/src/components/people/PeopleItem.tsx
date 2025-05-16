'use client';

import Image from 'next/image';
import styles from './people.module.css';

interface PeopleItemProps {
  name: string;
}

export default function PeopleItem({ name = 'Unknown' }: PeopleItemProps) {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileWrapper}>
        <div className={styles.profileCircle}>
          <Image
            src="/dummy-feed-thumbnail.png"
            alt="Profile"
            width={100}
            height={100}
            className={styles.profileImage}
          />
        </div>
        <span className={styles.profileName}>{name}</span>
      </div>
    </div>
  );
}
// src/components/people/PeopleItem.tsx

"use client";

import Image from "next/image";
import styles from "./people-list.module.css";

export interface PeopleItemProps {
  name: string;
  imageUrl?: string;
}

export default function PeopleItem({ name, imageUrl = "/dummy-feed-thumbnail.png" }: PeopleItemProps) {
  return (
    <div className={styles.profileContainer}>
      <div className={styles.profileWrapper}>
        <div className={styles.profileCircle}>
          <Image
            src={imageUrl}
            alt={`${name}의 프로필 이미지`}
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

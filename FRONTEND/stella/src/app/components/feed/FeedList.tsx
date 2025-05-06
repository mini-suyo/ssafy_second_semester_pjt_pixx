// components/feed/FeedList.tsx

"use client";

import { useEffect, useState } from "react";
import { getFeeds } from "../../lib/api/feedApi";
import { Feed } from "@/app/types/feed";
import styles from "./feed.module.css";

export default function FeedList() {
  const [feeds, setFeeds] = useState<Feed[]>([]);

  useEffect(() => {
    const fetchFeeds = async () => {
      try {
        const res = await getFeeds({ type: 0, page: 0, size: 20 });
        console.log("받아온 feeds:", res);
        setFeeds(res);
      } catch (error) {
        console.error("피드를 불러오는데 실패했습니다:", error);
      }
    };

    fetchFeeds();
  }, []);

  return (
    <div className={styles["feed-grid-wrapper"]}>
      <div className={styles["feed-grid"]}>
        {feeds.map((feed) => (
          <div key={feed.feedId} className={styles["feed-item"]}>
            <img
              src={feed.feedThumbnailImgUrl || "/dummy-feed-thumbnail.png"} // 링크없으면 기본이미지
              alt={`Feed ${feed.feedId}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

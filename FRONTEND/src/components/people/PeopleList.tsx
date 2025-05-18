//src/components/people/PeopleList.tsx

'use client';

import { useState, useEffect } from 'react';
import { getFaces } from '@/app/lib/api/peopleApi';
import PeopleItem from './PeopleItem';
import Link from 'next/link';
import styles from './people.module.css';
import type { FaceType } from '@/app/types/people';

export default function PeopleList() {
  const [faces, setFaces] = useState<FaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    (async () => {
      try {
        const res = await getFaces({ type: 0, page: 0, size: 20 });
        if (res.status !== 200) {
            throw new Error(res.message);
          }
        setFaces(res.data.faceList);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div>로딩 중…</div>;
  if (error)   return <div>에러: {error}</div>;

  return (
    <div className={styles.peopleGrid}>
      {faces.map(f => (
        <Link
          key={f.faceId}
          href={`/people/${f.faceId}`}
          className={styles.profileContainer}  // optional: 링크 전체 영역 클릭
        >
          <PeopleItem name={f.faceName} imageUrl={f.faceThumbnail} />
        </Link>
      ))}
    </div>
  );
}

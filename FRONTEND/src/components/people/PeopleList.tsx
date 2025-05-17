'use client';

import { useState, useEffect } from 'react';
import { getFaces } from '@/app/lib/api/faceApi';
import PeopleItem from './PeopleItem';
import styles from './people.module.css';
import type { FaceType } from '@/app/types/face';

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
        <PeopleItem key={f.faceId} name={f.faceName} imageUrl={f.faceThumbnail} />
      ))}
    </div>
  );
}

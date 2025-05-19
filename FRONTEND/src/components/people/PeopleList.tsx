'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './people-list.module.css';
import { getFaces, patchFaceClusterName } from '@/app/lib/api/peopleApi';
import type { FaceType } from '@/app/types/people';
import FloatingButton from '../common/FloatingButton';

export default function PeopleList() {
  const [faces, setFaces] = useState<FaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'default' | 'select'>('default');

  // 편집 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await getFaces({ type: 0, page: 0, size: 20 });
        if (res.status !== 200) throw new Error(res.message);
        setFaces(res.data.faceList);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleModeChange = () => {
    setMode(prev => prev === 'default' ? 'select' : 'default');
    if (editingId) {
      cancelEdit();
    }
  };

  const startEdit = (face: FaceType) => {
    setEditingId(face.faceId);
    setEditingName(face.faceName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  const saveName = async (faceId: number) => {
    if (!editingName.trim()) {
      alert('이름을 입력해주세요');
      return;
    }
    try {
      const res = await patchFaceClusterName(faceId, editingName);
      if (res.status !== 200) throw new Error(res.message);
      setFaces(prev =>
        prev.map(f =>
          f.faceId === faceId ? { ...f, faceName: editingName } : f
        )
      );
      cancelEdit();
    } catch (e: any) {
      alert('이름 변경 실패: ' + e.message);
    }
  };

  if (loading) return <div>로딩 중…</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <>
      <div className={styles.peopleGrid}>
        {faces.map(face => (
          <div key={face.faceId} className={styles.profileContainer}>
            <div className={styles.profileWrapper}>
              <Link href={`/people/${face.faceId}`}>
                <div className={styles.profileCircle}>
                  <Image
                    src={face.faceThumbnail}
                    alt={face.faceName}
                    width={100}
                    height={100}
                    className={styles.profileImage}
                  />
                </div>
              </Link>

              {editingId === face.faceId ? (
                <div className={styles.editContainer}>
                  <input
                    className={styles.profileInput}
                    value={editingName}
                    onChange={e => setEditingName(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveName(face.faceId);
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    placeholder="이름을 입력하세요"
                    maxLength={20}
                    autoFocus
                  />
                  <div className={styles.editButtons}>
                    <button
                      className={`${styles.editButton} ${styles.saveButton}`}
                      onClick={() => saveName(face.faceId)}
                    >
                      저장
                    </button>
                    <button
                      className={`${styles.editButton} ${styles.cancelButton}`}
                      onClick={cancelEdit}
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div 
                  className={styles.profileName}
                  onClick={() => startEdit(face)}
                >
                  <span>{face.faceName || 'Unknown'}</span>
                  <Image
                    src="/icons/icon-pencil.png"
                    alt="edit"
                    width={16}
                    height={16}
                    className={styles.editIcon}
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <FloatingButton mode={mode} onClick={handleModeChange} />
    </>
  );
}
// src/components/people/PeopleList.tsx

"use client";

import { useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import styles from "./people-list.module.css";
import { getFaces, patchFaceClusterName, deleteFaceCluster } from "@/app/lib/api/peopleApi";
import type { FaceType } from "@/app/types/people";
import FloatingButton from "../common/FloatingButton";
import PeopleSelectBar from "./PeopleSelectBar";
import ErrorModal from "../ErrorModal";

export default function PeopleList() {
  // 모드: default | select
  const [mode, setMode] = useState<"default" | "select">("default");
  // 선택된 faceId 목록
  const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);
  // 편집 중인 faceId, 이름
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  // 모달 메시지 / 삭제 확인
  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // ─────────────────────────────────────────────────────────────────
  // useInfiniteQuery 설정
  // ─────────────────────────────────────────────────────────────────
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } = useInfiniteQuery({
    queryKey: ["faces"],
    queryFn: ({ pageParam = 0 }) => getFaces({ type: 0, page: pageParam, size: 6 }),
    getNextPageParam: (lastPage, allPages) => (lastPage.data.faceList.length < 6 ? undefined : allPages.length),
    initialPageParam: 0,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) return <div>로딩 중…</div>;
  if (isError) return <div>에러가 발생했습니다.</div>;

  // 페이지별로 쌓인 faceList를 하나의 배열로 평탄화
  const allFaces: FaceType[] = data!.pages.flatMap((page) => page.data.faceList);

  // ─────────────────────────────────────────────────────────────────
  // 핸들러들
  // ─────────────────────────────────────────────────────────────────

  const handleModeChange = () => {
    setMode((prev) => (prev === "default" ? "select" : "default"));
    if (editingId !== null) cancelEdit();
    setSelectedFaceIds([]);
  };

  const handleDeleteFaces = () => {
    if (selectedFaceIds.length === 0) {
      setMessage("삭제할 대상을 선택해주세요.");
      return;
    }
    setConfirmDelete(true);
  };

  const executeDelete = async () => {
    try {
      for (const faceId of selectedFaceIds) {
        const res = await deleteFaceCluster(faceId);
        if (res.status !== 200) throw new Error(res.message);
      }
      setMessage("선택한 대상이 삭제되었습니다.");
      setSelectedFaceIds([]);
      setMode("default");
      await refetch();
    } catch (e: any) {
      setMessage("인물 삭제에 실패했습니다: " + e.message);
    }
    setConfirmDelete(false);
  };

  const saveName = async (faceId: number) => {
    if (!editingName.trim()) {
      setMessage("이름을 입력해주세요.");
      return;
    }
    try {
      const res = await patchFaceClusterName(faceId, editingName);
      if (res.status !== 200) throw new Error(res.message);
      setMessage("이름이 변경되었습니다.");
      setEditingId(null);
      setEditingName("");
      setMode("default");
      setSelectedFaceIds([]);
      await refetch();
    } catch (e: any) {
      setMessage("이름 변경 실패: " + e.message);
    }
  };

  const startEdit = (face: FaceType) => {
    if (mode !== "select") return;
    setEditingId(face.faceId);
    setEditingName(face.faceName);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  // ─────────────────────────────────────────────────────────────────
  // 렌더링
  // ─────────────────────────────────────────────────────────────────

  return (
    <>
      <div className={styles.peopleGrid}>
        {allFaces.map((face) => {
          const isSelected = selectedFaceIds.includes(face.faceId);
          return (
            <div key={face.faceId} className={styles.profileContainer}>
              <div className={styles.profileWrapper}>
                {/* 썸네일 */}
                {mode === "default" ? (
                  <Link href={`/people/${face.faceId}`}>
                    <div className={`${styles.profileCircle}` + (isSelected ? ` ${styles.selected}` : "")}>
                      <Image
                        src={face.faceThumbnail}
                        alt={face.faceName}
                        width={100}
                        height={100}
                        className={styles.profileImage}
                      />
                      {isSelected && <div className={styles.checkIcon} />}
                    </div>
                  </Link>
                ) : (
                  <div
                    className={`${styles.profileCircle}` + (isSelected ? ` ${styles.selected}` : "")}
                    onClick={() =>
                      setSelectedFaceIds((prev) =>
                        prev.includes(face.faceId) ? prev.filter((id) => id !== face.faceId) : [...prev, face.faceId]
                      )
                    }
                  >
                    <Image
                      src={face.faceThumbnail}
                      alt={face.faceName}
                      width={100}
                      height={100}
                      className={styles.profileImage}
                    />
                    {isSelected && <div className={styles.checkIcon} />}
                  </div>
                )}

                {/* 이름 / 편집 */}
                {editingId === face.faceId ? (
                  <div className={styles.editContainer}>
                    <input
                      className={styles.profileInput}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveName(face.faceId);
                        if (e.key === "Escape") cancelEdit();
                      }}
                      placeholder="이름을 입력하세요."
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
                      <button className={`${styles.editButton} ${styles.cancelButton}`} onClick={cancelEdit}>
                        취소
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className={styles.profileName} onClick={() => startEdit(face)}>
                    <span>{face.faceName || "Unknown"}</span>
                    {mode === "select" && (
                      <Image
                        src="/icons/icon-pencil.png"
                        alt="edit"
                        width={16}
                        height={16}
                        className={styles.editIcon}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* 무한 스크롤 트리거 */}
        <div
          ref={(el) => {
            if (!el || !hasNextPage || isFetchingNextPage) return;
            new IntersectionObserver(([entry]) => {
              if (entry.isIntersecting) fetchNextPage();
            }).observe(el);
          }}
          style={{ height: 1 }}
        />
      </div>

      {/* 선택 모드 바 */}
      {mode === "select" && <PeopleSelectBar onCancel={handleModeChange} onDelete={handleDeleteFaces} />}

      {/* 플로팅 버튼 */}
      <FloatingButton mode={mode} onClick={handleModeChange} />

      {/* 삭제 확인 모달 */}
      {confirmDelete && (
        <ErrorModal
          message={"선택한 대상을 삭제하시겠습니까?\n(분류만 제거되며, 피드는 삭제되지 않습니다.)"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={executeDelete}
        />
      )}

      {/* 처리 결과 메시지 모달 */}
      {message && <ErrorModal message={message} onClose={() => setMessage(null)} />}

      {/* 다음 페이지 로딩 중 */}
      {isFetchingNextPage && <p className="text-center mt-4">더 불러오는 중…</p>}
    </>
  );
}

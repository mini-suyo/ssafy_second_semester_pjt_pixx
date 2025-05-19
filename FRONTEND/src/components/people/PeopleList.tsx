// src/components/people/PeopleList.tsx

"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./people-list.module.css";
import { getFaces, patchFaceClusterName, deleteFaceCluster } from "@/app/lib/api/peopleApi";
import type { FaceType } from "@/app/types/people";
import FloatingButton from "../common/FloatingButton";
import PeopleSelectBar from "./PeopleSelectBar";
import ErrorModal from "../ErrorModal";

export default function PeopleList() {
  const [faces, setFaces] = useState<FaceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [mode, setMode] = useState<"default" | "select">("default");
  const [selectedFaceIds, setSelectedFaceIds] = useState<number[]>([]);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  const [message, setMessage] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

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
    setMode((prev) => (prev === "default" ? "select" : "default"));
    if (editingId !== null) cancelEdit();
    setSelectedFaceIds([]);
  };

  const handleDeleteFaces = () => {
    if (!selectedFaceIds.length) {
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
      setFaces((prev) => prev.filter((face) => !selectedFaceIds.includes(face.faceId)));
      setSelectedFaceIds([]);
      setMode("default");
      setMessage("선택한 대상이 삭제되었습니다.");
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
      setFaces((prev) => prev.map((f) => (f.faceId === faceId ? { ...f, faceName: editingName } : f)));
      cancelEdit();
      setMode("default");
      setSelectedFaceIds([]);
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

  if (loading) return <div>로딩 중…</div>;
  if (error) return <div>에러: {error}</div>;

  return (
    <>
      <div className={styles.peopleGrid}>
        {faces.map((face) => {
          const isSelected = selectedFaceIds.includes(face.faceId);
          return (
            <div key={face.faceId} className={styles.profileContainer}>
              <div className={styles.profileWrapper}>
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
      </div>

      {mode === "select" && <PeopleSelectBar onCancel={handleModeChange} onDelete={handleDeleteFaces} />}

      {message && <ErrorModal message={message} onClose={() => setMessage(null)} />}

      {confirmDelete && (
        <ErrorModal
          message={"선택한 대상을 삭제하시겠습니까?\n(분류만 제거되며, 피드는 삭제되지 않습니다.)"}
          onClose={() => setConfirmDelete(false)}
          onConfirm={executeDelete}
        />
      )}

      <FloatingButton mode={mode} onClick={handleModeChange} />
    </>
  );
}

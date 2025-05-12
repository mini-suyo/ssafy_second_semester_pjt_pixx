"use client";
import { useState } from "react";
import api from "@/app/lib/api/axios";
import styles from "./add-file.module.css";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function AddFile() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const queryClient = useQueryClient();

  const validateFiles = (fileList: FileList): boolean => {
    const currentFiles = Array.from(fileList);
    const previousFiles = files ? Array.from(files) : [];
    const allFiles = [...previousFiles, ...currentFiles];

    // 파일 타입별로 분류
    const jpgPngFiles = allFiles.filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg"
    );
    const gifFiles = allFiles.filter((file) => file.type === "image/gif");
    const mp4Files = allFiles.filter((file) => file.type === "video/mp4");

    // 각 타입별 파일 개수 검증
    if (jpgPngFiles.length === 0) {
      alert("JPG/PNG 이미지는 필수로 1장 업로드해야 합니다.");
      return false;
    }

    if (jpgPngFiles.length > 1) {
      alert("JPG/PNG 이미지는 1장만 업로드할 수 있습니다.");
      return false;
    }

    if (gifFiles.length > 1) {
      alert("GIF 파일은 최대 1개만 업로드할 수 있습니다.");
      return false;
    }

    if (mp4Files.length > 1) {
      alert("MP4 파일은 최대 1개만 업로드할 수 있습니다.");
      return false;
    }

    // 지원하지 않는 파일 형식 체크
    const unsupportedFiles = allFiles.filter(
      (file) => !["image/jpeg", "image/jpg", "image/png", "image/gif", "video/mp4"].includes(file.type)
    );

    if (unsupportedFiles.length > 0) {
      alert("지원하지 않는 파일 형식이 포함되어 있습니다.");
      return false;
    }

    return true;
  };

  // handleFileChange 메서드도 수정
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (validateFiles(event.target.files)) {
        // 기존 파일과 새 파일을 병합
        const currentFiles = Array.from(event.target.files);
        const previousFiles = files ? Array.from(files) : [];
        const mergedFiles = [...previousFiles, ...currentFiles];

        // FileList 객체로 변환
        const dataTransfer = new DataTransfer();
        mergedFiles.forEach((file) => dataTransfer.items.add(file));
        setFiles(dataTransfer.files);
      } else {
        event.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!files) return;

    setIsUploading(true);
    const formData = new FormData();

    // 파일 추가
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });

    try {
      const response = await api.post("/api/v1/photos/upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.status === "200") {
        alert("파일이 성공적으로 업로드되었습니다.");
        setFiles(null);
        // 파일 입력 초기화
        const fileInput = document.getElementById("fileInput") as HTMLInputElement;
        if (fileInput) fileInput.value = "";
        // 피드 목록 갱신
        console.log("파일 업로드 성공, 피드 쿼리 무효화 시도");
        await queryClient.invalidateQueries({
          predicate: (query) => query.queryKey[0] === "feeds",
        });
        await queryClient.refetchQueries({
          predicate: (query) => query.queryKey[0] === "feeds",
        });
        console.log("피드 쿼리 무효화 완료");
      }
    } catch (error: any) {
      if (error.response?.data?.status === "400") {
        alert(error.response.data.message || "파일 업로드에 실패했습니다.");
      } else {
        alert("파일 업로드에 실패했습니다.");
      }
      console.error("Error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveFile = (indexToRemove: number) => {
    if (!files) return;

    const newFiles = Array.from(files).filter((_, index) => index !== indexToRemove);

    if (newFiles.length === 0) {
      setFiles(null);
      const fileInput = document.getElementById("fileInput") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      return;
    }

    const dataTransfer = new DataTransfer();
    newFiles.forEach((file) => dataTransfer.items.add(file));
    setFiles(dataTransfer.files);
  };

  return (
    <div className={styles.uploadContainer}>
      <label htmlFor="fileInput" className={styles.uploadButton}>
        사진 업로드
      </label>
      <input
        type="file"
        id="fileInput"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/gif,video/mp4"
        onChange={handleFileChange}
        className={styles.fileInput}
      />
      {files && files.length > 0 && (
        <div className={styles.fileList}>
          <p>선택된 파일 ({files.length}개):</p>
          {Array.from(files).map((file, index) => (
            <div key={index} className={styles.fileItem}>
              <p className={styles.fileName}>{file.name}</p>
              <button onClick={() => handleRemoveFile(index)} className={styles.removeButton} type="button">
                ✕
              </button>
            </div>
          ))}
          <button onClick={handleUpload} disabled={isUploading} className={styles.submitButton}>
            {isUploading ? "업로드 중..." : "업로드하기"}
          </button>
        </div>
      )}
    </div>
  );
}

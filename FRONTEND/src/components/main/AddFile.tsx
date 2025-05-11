"use client";
import { useState } from "react";
import api from "@/app/lib/api/axios";
import styles from "./add-file.module.css";

export default function AddFile() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFiles = (fileList: FileList): boolean => {
    const imageFiles = Array.from(fileList).filter(
      (file) => file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/jpg"
    );

    if (imageFiles.length !== 1) {
      alert("JPG/PNG 이미지는 정확히 1장만 업로드해야 합니다.");
      return false;
    }

    // gif와 mp4는 선택사항이므로 추가 검증 필요 없음
    return true;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      if (validateFiles(event.target.files)) {
        setFiles(event.target.files);
      } else {
        event.target.value = "";
        setFiles(null);
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
            <p key={index} className={styles.fileName}>
              {file.name}
            </p>
          ))}
          <button onClick={handleUpload} disabled={isUploading} className={styles.submitButton}>
            {isUploading ? "업로드 중..." : "업로드하기"}
          </button>
        </div>
      )}
    </div>
  );
}

"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Upload, QrCode } from "lucide-react";
import "./page.css";

export default function Home() {
  const [isDragging, setIsDragging] = useState(false);
  const [stars, setStars] = useState<{ id: number; size: number; top: number; left: number; delay: number }[]>([]);

  // 별 생성 함수
  useEffect(() => {
    const createStars = () => {
      const newStars = [];
      const starCount = 30; // 별의 개수 (적은 수로 유지)

      for (let i = 0; i < starCount; i++) {
        newStars.push({
          id: i,
          size: Math.random() * 2 + 1, // 1-3px 크기의 작은 별
          top: Math.random() * 100, // 화면 전체에 랜덤하게 배치
          left: Math.random() * 100,
          delay: Math.random() * 3, // 애니메이션 딜레이
        });
      }

      setStars(newStars);
    };

    createStars();
  }, []);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    // Handle file drop logic here
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log("Files dropped:", files);
      // Process files
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      // Process files
    }
  };

  return (
    <div className="home-container animate-fade-in">
      {/* 별 배경 추가 */}
      <div className="stars-background">
        {stars.map((star) => (
          <div
            key={star.id}
            className="star"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              top: `${star.top}%`,
              left: `${star.left}%`,
              animationDelay: `${star.delay}s`,
            }}
          />
        ))}
      </div>

      <section className="upload-section">
        <div className="upload-options">
          <div className="upload-option">
            <QrCode size={48} className="option-icon" />
            <h3 className="option-title">QR 코드 스캔</h3>
            <p className="option-description">네컷 사진의 QR 코드를 스캔하여 자동으로 저장하세요</p>
            <button className="btn btn-primary">QR 스캔하기</button>
          </div>

          <div
            className={`upload-option upload-area ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload size={48} className="option-icon" />
            <h3 className="option-title">사진 업로드</h3>
            <p className="option-description">네컷 사진을 직접 업로드하여 저장하세요</p>
            <label className="btn btn-primary upload-btn">
              <input type="file" accept="image/*,video/*" multiple className="file-input" onChange={handleFileChange} />
              파일 선택하기
            </label>
            <p className="drag-text">또는 파일을 여기에 끌어다 놓으세요</p>
          </div>
        </div>
      </section>
    </div>
  );
}

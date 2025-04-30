"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Upload, QrCode } from "lucide-react";
import "./page.css";
import QrScanner from "../components/QrScanner";

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

  const [showScanner, setShowScanner] = useState(false);

  // QR 코드 스캔 컴포넌트
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanError, setScanError] = useState<Error | null>(null);

  const handleScanResult = async (result: string | null) => {
    setScanResult(result);
    console.log("QR 코드 내용 (홈 페이지):", result);

    if (result) {
      try {
        // JWT 토큰은 로컬 스토리지나 다른 상태 관리에서 가져와야 합니다
        const token = localStorage.getItem("token"); // 실제 토큰 저장 위치에 따라 수정

        const response = await fetch("/api/v1/photos/upload/qr", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageUrl: result,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          console.log("QR 코드 업로드 성공:", data);
          // 성공 처리 (예: 성공 메시지 표시)
        } else {
          console.error("QR 코드 업로드 실패:", data);
          setScanError(new Error(data.message || "업로드에 실패했습니다."));
        }
      } catch (error) {
        console.error("API 요청 오류:", error);
        setScanError(error as Error);
      }
    } else {
      console.log("유효하지 않은 QR 코드입니다.");
      setScanError(new Error("유효하지 않은 QR 코드입니다."));
    }
  };

  const handleScanError = (error: Error) => {
    setScanError(error);
    console.error("QR 코드 스캔 에러 (홈 페이지):", error);
  };

  const [startScan, setStartScan] = useState<boolean>(false);

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

      <div className="text-center">
        <button
          className="w-[130px] h-[40px]"
          onClick={() => {
            setStartScan(!startScan);
          }}
        >
          {startScan ? "인증 그만하기" : "인증 시작하기"}
        </button>
      </div>

      <section className="upload-section">
        <div className="upload-options">
          <div className="upload-option" onClick={() => setShowScanner(true)}>
            <QrCode size={100} className="qr-icon" />
            <h3 className="option-title">
              QR 코드로 <br />
              네컷사진 저장하기
            </h3>
            {/* QR 스캐너 모달 */}
            {showScanner && (
              <div className="qr-scanner-modal" onClick={(e) => e.stopPropagation()}>
                <div className="qr-scanner-container">
                  <QrScanner onScanSuccess={handleScanResult} onError={handleScanError} />
                  {scanResult && <p>스캔 결과: {scanResult}</p>}
                  {scanError && <p>스캔 오류: {scanError.message}</p>}
                </div>
                <button
                  className="close-scanner"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowScanner(false);
                  }}
                >
                  닫기
                </button>
              </div>
            )}
          </div>

          <div
            className={`file-upload-option upload-area ${isDragging ? "dragging" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <label className="btn btn-primary upload-btn">
              <input type="file" accept="image/*,video/*" multiple className="file-input" onChange={handleFileChange} />
              사진 업로드
            </label>
          </div>
        </div>
      </section>
    </div>
  );
}

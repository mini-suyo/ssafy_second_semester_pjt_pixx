"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import styles from "./page.module.css";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;

    const startScanning = async () => {
      try {
        controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { exact: "environment" }, // 후면 카메라 강제 지정
            },
          },
          videoRef.current!,
          (result, error) => {
            if (result) {
              console.log("QR 코드 스캔 결과:", result.getText());
            }
            if (error && !(error instanceof DOMException)) {
              console.error("스캔 오류:", error);
            }
          }
        );
      } catch (err) {
        // 첫 번째 시도가 실패하면 fallback으로 일반 environment 모드 시도
        try {
          controls = await codeReader.decodeFromConstraints(
            {
              video: {
                facingMode: "environment", // exact 없이 environment 설정
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
              },
            },
            videoRef.current!,
            (result, error) => {
              if (result) {
                console.log("QR 코드 스캔 결과:", result.getText());
              }
              if (error && !(error instanceof DOMException)) {
                console.error("스캔 오류:", error);
              }
            }
          );
        } catch (fallbackErr) {
          console.error("카메라 접근 오류:", fallbackErr);
        }
      }
    };

    if (isScanning) {
      startScanning();
    }

    return () => {
      controls?.stop();
    };
  }, [isScanning]);

  return (
    <>
      <div className={styles.QrScannerContainer}>
        {!isScanning ? (
          <button onClick={() => setIsScanning(true)} className={styles.scanButton}>
            <div className={styles.qrIcon}>
              <div className={styles.cornerTL}></div>
              <div className={styles.cornerTR}></div>
              <div className={styles.cornerBL}></div>
              <div className={styles.cornerBR}></div>
              <div className={styles.qrDots}></div>
            </div>
            <span>QR 코드로</span>
            <span>네컷사진 저장하기</span>
          </button>
        ) : (
          <video onClick={() => setIsScanning(false)} ref={videoRef} className={styles.videoContainer} />
        )}
      </div>
    </>
  );
}

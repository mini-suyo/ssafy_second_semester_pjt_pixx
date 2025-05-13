"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import styles from "./qr-code.module.css";
import api from "@/app/lib/api/axios";

export default function QrCode() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleQrResult = async (qrUrl: string) => {
    try {
      const response = await api.post("/api/v1/photos/upload/qr", {
        pageUrl: qrUrl,
      });

      if (response.data.status === "200") {
        setIsScanning(false); // 성공 시 스캐너 종료
      } else {
        console.error("QR 업로드 실패:", response.data.message);
      }
    } catch (error) {
      console.error("QR 업로드 에러:", error);
    }
  };

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;

    const startScanning = async () => {
      try {
        controls = await codeReader.decodeFromConstraints(
          {
            video: {
              facingMode: { exact: "environment" },
            },
          },
          videoRef.current!,
          (result, error) => {
            if (result) {
              const qrUrl = result.getText();
              handleQrResult(qrUrl);
            }
            if (error && !(error instanceof DOMException)) {
              console.error("스캔 오류:", error);
            }
          }
        );
      } catch (err) {
        try {
          controls = await codeReader.decodeFromConstraints(
            {
              video: {
                facingMode: "environment",
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 },
              },
            },
            videoRef.current!,
            (result, error) => {
              if (result) {
                const qrUrl = result.getText();
                handleQrResult(qrUrl);
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

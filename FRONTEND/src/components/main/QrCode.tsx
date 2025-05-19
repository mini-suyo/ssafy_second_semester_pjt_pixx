"use client";
import { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import styles from "./qr-code.module.css";
import api from "@/app/lib/api/axios";
import ErrorModal from "@/components/ErrorModal";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

export default function QrCode() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // QR 처리 상태 추가
  const lastScannedRef = useRef<string>(""); // 마지막으로 스캔된 QR 코드 값 저장
  const router = useRouter();

  // QR 업로드 후 피드 목록 캐시 무효화
  const queryClient = useQueryClient();

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;

    const handleQrResult = async (qrUrl: string) => {
      // 이미 처리 중이거나 같은 QR 코드인 경우 무시
      if (isProcessing || qrUrl === lastScannedRef.current) {
        return;
      }

      setIsProcessing(true);
      lastScannedRef.current = qrUrl;

      try {
        const response = await api.post("/api/v1/photos/upload/qr", {
          pageUrl: qrUrl,
        });

        if (response.data.status === 200) {
          setIsScanning(false);
          // QR 업로드 후 피드 목록 캐시 무효화
          await queryClient.invalidateQueries({ queryKey: ["feeds"] });
          router.push(`/feed/${response.data.data.feedId}`);
        } else {
          setErrorMessage(response.data.message || "QR 코드 처리 중 오류가 발생했습니다.");
        }
      } catch (error: any) {
        if (error.response?.data?.message) {
          setErrorMessage(error.response.data.message);
        } else if (error.response?.status === 400) {
          setErrorMessage("지원하지 않는 브랜드입니다.");
        } else if (error.response?.status === 500) {
          setErrorMessage("서버 처리 중 오류가 발생했습니다.");
        } else {
          setErrorMessage("QR 코드 처리 중 오류가 발생했습니다.");
        }
      } finally {
        setIsProcessing(false);
        // 3초 후에 마지막 스캔 값 초기화
        setTimeout(() => {
          lastScannedRef.current = "";
        }, 5000);
      }
    };

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
        console.log(err);
        try {
          controls = await codeReader.decodeFromConstraints(
            {
              video: {
                facingMode: "environment",
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
  }, [isScanning, router, isProcessing, queryClient]); // router만 의존성으로 남김

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
          <div className={styles.QrCameraContainer}>
            <h1 className={styles.title}>QR코드 스캔하기</h1>
            <span>현재는 모노멘션, 하루필름, 포토이즘, 인생네컷</span>
            <span> 브랜드만 지원 가능합니다.</span>
            <div onClick={() => setIsScanning(false)} className={styles.videoWrapper}>
              <video onClick={() => setIsScanning(false)} ref={videoRef} className={styles.videoContainer} />
              <div className={styles.scannerOverlay}>
                <div className={styles.scannerWindow}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      {errorMessage && <ErrorModal message={errorMessage} onClose={() => setErrorMessage(null)} />}
    </>
  );
}

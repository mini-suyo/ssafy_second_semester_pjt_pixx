"use client";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import api from "@/app/lib/api/axios";
import styles from "./qr-code.module.css";

export default function QrCode() {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        {
          fps: 5,
          qrbox: { width: 250, height: 250 },
          videoConstraints: {
            facingMode: "environment",
          },
        },
        false
      );

      function onScanSuccess(decodedText: string) {
        setScanResult(decodedText);
        setIsScanning(false);
        scanner?.clear();

        // QR 코드 URL을 백엔드로 전송
        const sendQrCode = async () => {
          try {
            const response = await api.post(
              // axios를 api로 변경
              "/api/v1/photos/upload/qr",
              { pageUrl: decodedText },
              {
                headers: {
                  "Content-Type": "application/json",
                },
                withCredentials: true,
              }
            );

            if (response.data.status === "200") {
              alert("QR 코드가 성공적으로 등록되었습니다.");
            }
          } catch (error: any) {
            if (error.response?.data?.status === "400") {
              alert(error.response.data.message || "QR 코드 등록에 실패했습니다.");
            } else {
              alert("QR 코드 등록에 실패했습니다.");
            }
            console.error("Error:", error);
          }
        };

        sendQrCode();
      }

      scanner.render(onScanSuccess, (error) => {
        console.warn(error);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear();
      }
    };
  }, [isScanning]);

  const handleRetry = () => {
    setScanResult(null);
    setIsScanning(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.qrContainer}>
        <div id="reader" className={styles.reader}></div>
        <p>
          QR코드로
          <br />
          네컷사진 저장하기
        </p>
        {scanResult && (
          <div className={styles.result}>
            <p>스캔 완료!</p>
            <p>URL: {scanResult}</p>
            <button onClick={handleRetry} className={styles.retryButton}>
              다시 스캔하기
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// components/QRScanner.tsx
"use client";

import { useEffect, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";

type QRScannerProps = {
  onScanSuccess: (decodedText: string) => void;
};

const QRScanner: React.FC<QRScannerProps> = ({ onScanSuccess }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("qr-reader", { fps: 10, qrbox: { width: 250, height: 250 } }, false);

    scanner.render(
      (decodedText) => {
        console.log("QR 스캔 성공:", decodedText); // 성공 로그 추가
        onScanSuccess(decodedText);
      },
      (error) => {
        console.warn("QR 스캔 에러:", error); // 에러 상세 정보 출력
      }
    );

    scannerRef.current = scanner;

    return () => {
      scanner.clear().catch((err) => console.error("Scanner clear error:", err));
    };
  }, [onScanSuccess]);

  return <div id="qr-reader" style={{ width: "100%" }} />;
};

export default QRScanner;

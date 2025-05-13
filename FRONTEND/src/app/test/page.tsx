"use client";
import { useEffect, useRef } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";

export default function Page() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const codeReader = new BrowserQRCodeReader();
    let controls: { stop: () => void } | undefined;

    const startScanning = async () => {
      try {
        const videoInputDevices = await BrowserQRCodeReader.listVideoInputDevices();
        const selectedDeviceId = videoInputDevices[0].deviceId;

        controls = await codeReader.decodeFromVideoDevice(selectedDeviceId, videoRef.current!, (result, error) => {
          if (result) {
            console.log("QR 코드 스캔 결과:", result.getText());
            // 여기에서 스캔 결과를 처리할 수 있습니다
          }
          if (error) {
            console.error("스캔 오류:", error);
          }
        });
      } catch (err) {
        console.error("카메라 접근 오류:", err);
      }
    };

    startScanning();

    return () => {
      controls?.stop();
    };
  }, []);

  return (
    <div>
      <h1>QR 코드 스캐너</h1>
      <video ref={videoRef} style={{ width: "100%", maxWidth: "500px" }} />
    </div>
  );
}

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 도커 배포용 (독립실행형)파일 생성 코드
};

export default nextConfig;

import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone", // 도커 배포용 (독립실행형)파일 생성 코드
  images: {
    domains: [
      "d2w650bgmlbl7n.cloudfront.net", // ✨ CloudFront 도메인 추가
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components"),
    };
    return config;
  },

  // 사진 다운로드
  async rewrites() {
    return [
      {
        source: "/photos/download/:imageId",
        destination: "https://dev.film-moa.com/api/v1/photos/download/:imageId",
      },
    ];
  },
};

export default nextConfig;

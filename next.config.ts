import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone 모드 활성화 (Docker 최적화)
  output: 'standalone',
  
  // 보안: 환경 변수는 서버 사이드에서 직접 process.env로 접근
  // NEXT_PUBLIC_ 접두사가 없는 환경 변수는 클라이언트에 노출되지 않음
  // env 설정을 제거하여 환경 변수가 클라이언트에 노출되지 않도록 함
};

export default nextConfig;

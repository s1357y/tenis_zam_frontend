const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // 개발 서버 설정
  webpack: (config, { dev, isServer }) => {
    if (dev) {
      // 개발 모드에서 파일 변경 감지 최적화
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
        ignored: /node_modules/
      };
    }
    return config;
  },
  async rewrites() {
    // 개발 환경에서만 API 프록시 사용
    if (process.env.NODE_ENV === 'development') {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      return [
        {
          source: '/api/:path*',
          destination: `${apiUrl}/api/:path*`
        }
      ];
    }
    
    // 프로덕션에서는 직접 API 호출
    return [];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  }
};

module.exports = nextConfig;
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
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? 'https://52.62.221.116:3001' 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`
      }
    ];
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  },
  // 배포 환경에서 API URL 설정
  publicRuntimeConfig: {
    apiUrl: process.env.NODE_ENV === 'production' 
      ? 'https://52.62.221.116:3001' 
      : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
  }
};

module.exports = nextConfig;
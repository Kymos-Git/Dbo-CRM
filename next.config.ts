import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   reactStrictMode: false,
  async rewrites() {
    
    return [
      {
        source: '/api/:path*',
        destination: 'https://dbot1.dbo.cloud/dboapi/:path*', // target del backend
      },
      {
        source:'/dboh/:path*',
        destination:'https://dbot1.dbo.cloud/dboh/:path*',
      }
    ];
  },
};

export default nextConfig;

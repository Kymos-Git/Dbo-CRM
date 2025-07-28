import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,

   
  // eslint: {
  //   ignoreDuringBuilds: true,
  // },
  // output: 'export',

  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://dbot1.dbo.cloud/dboapi/:path*',
      },
      {
        source: '/dboh/:path*',
        destination: 'https://dbot1.dbo.cloud/dboh/:path*',
      },
    ];
  },
};

export default nextConfig;

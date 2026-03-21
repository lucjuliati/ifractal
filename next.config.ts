import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/logout",
        destination: "/api/logout"
      }
    ]
  },
}

export default nextConfig

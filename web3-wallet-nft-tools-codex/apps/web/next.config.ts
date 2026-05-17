import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@web3-wallet-nft-tools/sdk", "@web3-wallet-nft-tools/shared"],
};

export default nextConfig;

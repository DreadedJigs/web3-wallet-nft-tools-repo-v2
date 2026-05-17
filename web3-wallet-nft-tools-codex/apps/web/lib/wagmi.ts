import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { arbitrum, base, baseSepolia, mainnet, optimism, polygon, polygonAmoy, sepolia } from "wagmi/chains";

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID";

export const config = getDefaultConfig({
  appName: process.env.NEXT_PUBLIC_APP_NAME || "Web3 Wallet NFT Tools",
  projectId: walletConnectProjectId,
  chains: [sepolia, baseSepolia, polygonAmoy, mainnet, base, polygon, arbitrum, optimism],
  ssr: true,
});

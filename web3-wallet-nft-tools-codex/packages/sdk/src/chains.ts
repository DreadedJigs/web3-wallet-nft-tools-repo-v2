export const supportedChainNames: Record<number, string> = {
  1: "Ethereum",
  10: "Optimism",
  137: "Polygon",
  42161: "Arbitrum",
  8453: "Base",
  84532: "Base Sepolia",
  80002: "Polygon Amoy",
  11155111: "Sepolia",
};

export const testnetChainIds = [11155111, 84532, 80002] as const;

export function isSupportedTestnet(chainId: number): boolean {
  return (testnetChainIds as readonly number[]).includes(chainId);
}

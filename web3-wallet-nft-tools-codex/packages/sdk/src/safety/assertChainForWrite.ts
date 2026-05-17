import { isSupportedTestnet } from "../chains";

export function assertChainForWrite(chainId: number, expectedChainId: number, allowMainnet = false): void {
  if (chainId !== expectedChainId) {
    throw new Error(`Connected chain ${chainId} does not match expected chain ${expectedChainId}.`);
  }

  if (!allowMainnet && !isSupportedTestnet(chainId)) {
    throw new Error(`Writes are disabled for non-testnet chain ${chainId}. Pass allowMainnet only after review.`);
  }
}

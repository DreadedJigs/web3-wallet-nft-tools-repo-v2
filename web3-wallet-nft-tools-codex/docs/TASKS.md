# Task Queue

## Foundation

- [ ] Replace placeholder app name and metadata with your project/brand name.
- [ ] Choose target chains: Sepolia, Base Sepolia, Polygon Amoy, Ethereum, Base, Polygon, etc.
- [ ] Add your WalletConnect project ID to `.env.local`.
- [ ] Decide whether NFT tools are for ERC-721, ERC-1155, or both.

## Wallet app

- [ ] Add wallet account card with native balance.
- [ ] Add connected-chain guard component.
- [ ] Add NFT contract read panel.
- [ ] Add testnet-only mint flow.
- [ ] Add transaction simulation/dry-run before writes.

## NFT tooling

- [ ] Replace sample traits with real collection layers.
- [ ] Add rarity weighting support.
- [ ] Add duplicate DNA detection.
- [ ] Add image file presence validation.
- [ ] Add provenance hash generation.
- [ ] Add IPFS upload adapter behind an explicit flag.

## Contracts

- [ ] Add collection max supply and mint price tests.
- [ ] Add allowlist minting tests.
- [ ] Add royalty tests.
- [ ] Add metadata freeze/reveal tests.
- [ ] Add deployment script for chosen testnet.

## Security

- [ ] Add secret scanning to CI.
- [ ] Add Slither or another smart-contract static-analysis step.
- [ ] Add dependency audit step.
- [ ] Document all admin powers in `docs/SECURITY.md`.

# Architecture

## Goal

Keep wallet UI, contracts, metadata generation, and shared Web3 logic separated so each can be tested and improved independently.

## Components

### `apps/web`

The user-facing dApp. It handles wallet connection, chain display, account display, NFT contract read interactions, and eventually mint/transaction flows.

Current wallet libraries:

- RainbowKit for wallet UX.
- wagmi for React wallet/account/contract hooks.
- viem for strongly typed Ethereum primitives.

### `packages/contracts`

Foundry Solidity workspace. Starts with a minimal ERC-721 collection contract using OpenZeppelin.

Expected future modules:

- allowlist mint
- royalty config
- reveal/freeze metadata
- ERC-1155 or edition contract
- deployment scripts
- verification scripts

### `packages/nft-tools`

Node/TypeScript tooling for collection metadata generation and validation. This is intentionally independent from the frontend so you can run generation locally, in CI, or later behind an admin-only backend.

### `packages/sdk`

Shared client-side and script-side Web3 utilities:

- chain definitions
- address maps
- ABIs
- contract read/write helpers
- validation helpers

### `packages/shared`

Shared TypeScript types and constants that have no Web3 runtime dependency.

## Data flow

```text
Trait config/images
      ↓
packages/nft-tools generates metadata
      ↓
Metadata/images pinned to IPFS or hosted
      ↓
Contract baseURI points to metadata root
      ↓
apps/web reads contract + renders wallet/NFT views
```

## Security boundary

The browser app never sees private keys, seed phrases, or deployment secrets. Deployment scripts use environment variables locally or in secure CI only.

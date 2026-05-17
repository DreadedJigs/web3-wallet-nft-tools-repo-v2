# Web3 Wallet + NFT Tools — Codex-Ready Monorepo

A practical starter repository for building:

- a Web3 wallet-connected dApp UI
- NFT collection mint/read tooling
- ERC-721 smart contracts
- NFT metadata generation/validation scripts
- Codex-guided feature work and reviews

This repo is intentionally conservative: it defaults to testnets, keeps secrets out of source control, and separates frontend, contracts, SDK, and collection tooling so Codex can work in small, reviewable changes.

## Stack

- **Frontend:** Next.js App Router, React, TypeScript
- **Wallet:** RainbowKit + wagmi + viem
- **Contracts:** Foundry + OpenZeppelin ERC-721
- **NFT tooling:** TypeScript metadata generator and validator
- **Automation:** GitHub Actions CI
- **Codex guidance:** `AGENTS.md`, `.agents/skills`, `.codex/agents`

## Repository layout

```text
.
├── AGENTS.md
├── apps/
│   └── web/                 # Next.js wallet + NFT dashboard
├── packages/
│   ├── contracts/           # Foundry Solidity contracts
│   ├── nft-tools/           # metadata generator / validator
│   ├── sdk/                 # shared Web3/NFT TypeScript helpers
│   └── shared/              # shared constants/types
├── docs/
│   ├── ARCHITECTURE.md
│   ├── CODEX_WORKFLOW.md
│   ├── SECURITY.md
│   └── TASKS.md
├── .agents/skills/          # Codex skills scoped to this repo
├── .codex/agents/           # optional Codex custom agents
└── .github/workflows/ci.yml
```

## First setup

Use Node 20+ and pnpm.

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm check
```

For the web app:

```bash
pnpm dev
```

For NFT metadata tooling:

```bash
pnpm nft:generate
pnpm nft:validate
```

For contracts, install Foundry first, then:

```bash
cd packages/contracts
forge build
forge test
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in only what you need.

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=
NEXT_PUBLIC_DEFAULT_CHAIN=sepolia
SEPOLIA_RPC_URL=
BASE_SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
PINATA_JWT=
```

Rules:

- Never commit `.env`, `.env.local`, private keys, seed phrases, Alchemy keys, Pinata JWTs, or WalletConnect project secrets.
- Public frontend variables must begin with `NEXT_PUBLIC_`.
- Use test wallets and testnets until contracts and UI are audited.

## Codex usage

Good first prompt after connecting this repo:

```text
Read AGENTS.md and docs/TASKS.md. Implement the first unchecked task. Keep the change small, explain the files changed, and run pnpm check.
```

Good review prompt:

```text
Review this repo like a Web3 security engineer. Focus on private-key handling, transaction safety, wallet UX, NFT metadata correctness, and smart-contract assumptions.
```

GitHub PR review trigger:

```text
@codex review
```

## Project directions you can choose next

1. **Wallet app:** connect wallet, show balances/NFTs, sign messages, send controlled transactions.
2. **NFT launchpad:** upload metadata/images, reveal flow, allowlist, mint page, collection dashboard.
3. **Contract suite:** ERC-721, ERC-1155, soulbound token, allowlist mint, royalty config.
4. **Collection generator:** trait layers, rarity tables, metadata, provenance hash, reveal-ready output.
5. **Recovery/security tooling:** contract/address audit helpers, wallet hygiene checks, project status dashboard.

## Important disclaimer

This is a development scaffold, not an audited wallet or minting platform. Any contract, transaction, custody, or signing flow must be reviewed before mainnet use.

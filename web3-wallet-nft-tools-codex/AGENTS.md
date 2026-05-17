# AGENTS.md — Codex Instructions for This Repo

## Mission

Build a safe, maintainable Web3 wallet + NFT tooling repository. Prefer small, reviewable changes. Do not introduce custody, seed phrase handling, backend signing, or mainnet write flows without explicit human review.

## Project layout

- `apps/web`: Next.js wallet-connected dApp UI.
- `packages/contracts`: Foundry Solidity contracts and tests.
- `packages/nft-tools`: TypeScript CLI tools for NFT metadata generation and validation.
- `packages/sdk`: shared TypeScript Web3 helpers.
- `packages/shared`: constants, schemas, and types used across packages.
- `docs`: architecture, workflow, security notes, and task queue.

## Required commands

Before calling a task complete, run the most specific verification command available.

Root:

```bash
pnpm check
```

Frontend:

```bash
pnpm --filter @web3-wallet-nft-tools/web lint
pnpm --filter @web3-wallet-nft-tools/web typecheck
```

NFT tools:

```bash
pnpm --filter @web3-wallet-nft-tools/nft-tools build
pnpm --filter @web3-wallet-nft-tools/nft-tools test
```

Contracts:

```bash
cd packages/contracts
forge build
forge test
```

## Web3 safety rules

- Never ask for, log, store, print, or commit a private key, mnemonic, seed phrase, raw session token, or production API key.
- Never add code that accepts a user's seed phrase.
- Never default to mainnet writes.
- Add explicit chain checks before write transactions.
- Prefer read-only flows first, then testnet writes.
- For write transactions, display destination address, chain, value, function, and key parameters before submission.
- Keep all addresses chain-scoped.
- Treat every externally supplied address, token ID, URI, or JSON file as untrusted input.
- Validate NFT metadata before pinning/uploading.
- Do not invent deployed contract addresses.

## Coding conventions

- TypeScript strict mode stays enabled.
- Prefer `viem` types and `as const` ABIs.
- Prefer wagmi hooks in React UI and viem clients in non-React utilities.
- Keep wallet-specific UI in `apps/web/components/wallet`.
- Keep contract ABIs and address maps in `packages/sdk` or generated artifacts.
- Add tests for metadata generation, validation, and transaction helper logic.
- Keep functions small and named according to domain behavior.

## Contract conventions

- Use OpenZeppelin contracts where possible.
- Write Foundry tests for minting, supply limits, access control, royalty behavior, withdraw behavior, and revert cases.
- Use custom errors instead of long revert strings when reasonable.
- Never add an owner-only function that can unexpectedly change token ownership, user balances, or metadata after mint without documenting it.
- Clearly document whether metadata is mutable, revealed, frozen, or upgradeable.

## NFT metadata rules

- Generated metadata must include `name`, `description`, `image`, and `attributes`.
- Attribute entries should use `{ "trait_type": string, "value": string | number }`.
- Image URIs should be placeholder-safe during development and switched to `ipfs://...` or HTTPS production URIs before deployment.
- Include a deterministic manifest/provenance file when generating a collection.

## Pull request expectations

Every PR should include:

1. What changed.
2. Why it changed.
3. How it was tested.
4. Security impact.
5. Any migration/deployment steps.

## Definition of done

- Relevant tests/checks pass or blockers are clearly documented.
- No secrets are committed.
- Docs and `.env.example` are updated when configuration changes.
- New Web3 write behavior is testnet-safe and chain-guarded.
- User-facing transaction flows are explicit and reversible where possible.

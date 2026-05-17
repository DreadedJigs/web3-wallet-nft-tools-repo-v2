# Contracts

Foundry workspace for NFT contracts.

## Setup

```bash
forge install OpenZeppelin/openzeppelin-contracts
forge build
forge test
```

## Current contract

`CodexNftCollection.sol` is a minimal ERC-721 starter with:

- owner-only mint
- configurable base URI
- OpenZeppelin ownership

It is not intended for mainnet deployment without review.

## Future additions

- max supply
- public mint price
- allowlist mint
- royalties
- reveal/freeze metadata
- withdrawal logic
- deployment scripts

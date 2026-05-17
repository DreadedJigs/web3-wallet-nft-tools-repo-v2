# Security Notes

## Wallet safety

This repo must not implement seed phrase import or private-key custody. Users should connect with established wallet providers.

## Transaction safety

Every write transaction should show:

- connected chain
- contract address
- function name
- ETH/native token value
- token ID or quantity
- recipient address
- gas warning where practical

## Network safety

- Default to Sepolia/Base Sepolia/Polygon Amoy for development.
- Keep mainnet configuration explicit and documented.
- Store deployed contract addresses per chain.

## Metadata safety

- Validate every generated JSON file before upload.
- Keep metadata generation deterministic.
- Save a manifest with content hashes/provenance.
- Clearly document whether metadata is mutable or frozen.

## Secrets

Never commit:

- private keys
- seed phrases
- wallet JSON keystores
- production RPC keys
- pinning service JWTs
- deployer credentials

Use local `.env.local`, GitHub encrypted secrets, or a dedicated secrets manager.

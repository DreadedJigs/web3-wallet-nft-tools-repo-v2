# Codex Workflow

## Best prompt for small tasks

```text
Read AGENTS.md and docs/TASKS.md. Pick the first unchecked task. Implement it in the smallest safe change. Run the relevant checks and summarize the diff.
```

## Best prompt for security review

```text
Review this repo for Web3 security issues. Focus on secret handling, unsafe chain defaults, wallet transaction clarity, NFT metadata validation, smart-contract access control, and replay/cross-chain assumptions.
```

## Best prompt for feature work

```text
Add a testnet-only NFT mint panel to apps/web. Use the existing SDK address map. Require an explicit connected-chain match before enabling the transaction button. Add docs and tests where practical.
```

## Best prompt for contract work

```text
In packages/contracts, add Foundry tests for mint limits and owner-only admin functions. Do not change production behavior unless tests expose a defect.
```

## Review checklist for Codex output

- Did it add or modify secrets?
- Did it default to mainnet writes?
- Did it bypass chain checks?
- Did it validate untrusted metadata/address input?
- Did it update docs and `.env.example` when config changed?
- Did it run the correct verification commands?

# Web3 Wallet Safety Skill

Use this skill whenever modifying wallet, transaction, signing, contract write, or chain-selection behavior.

## Checklist

- Do not request private keys or seed phrases.
- Keep writes disabled unless a wallet is connected to the expected chain.
- Display chain ID/name, contract address, function name, token/native value, and recipient before writes.
- Default to testnets.
- Validate user-supplied addresses with `viem`.
- Do not silently switch chains before a user understands the action.
- Add tests for helper functions that guard writes.

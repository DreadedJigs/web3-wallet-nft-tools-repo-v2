# Dreaded Guard

Dependency-free transaction security guard for wallet intent review. Use it in a browser wallet, embedded wallet, media vault, extension, or hardware-wallet companion flow.

## Install From This Repo

```bash
npm pack ./packages/dreaded-guard
```

Or serve the browser bundle directly:

```html
<script src="/guard/v1/dreaded-guard.js"></script>
```

## Minimal Use

```js
const guard = DreadedGuard.createGuard({
  trustedSources: {
    Zora: {
      domain: 'zora.co',
      recipient: '0x1111111111111111111111111111111111111111',
      chains: ['base'],
      caps: { ETH: 0.35 }
    }
  }
});

const result = guard.audit({
  source: 'Zora',
  chainId: 'base',
  symbol: 'ETH',
  amountValue: 0.04,
  recipient: '0x1111111111111111111111111111111111111111',
  method: 'collectMedia',
  approval: 'exact',
  origin: 'https://zora.co/collect/example',
  readOnly: false
}, {
  walletAddress: '0xabc'
});

if (result.decision === 'block') {
  throw new Error('Blocked by Dreaded Guard');
}
```

## Background Provider Monitor

```js
const monitor = DreadedGuard.createBackgroundMonitor({
  guard,
  provider: window.ethereum,
  blockDecisions: ['block'],
  getContext: () => ({ walletAddress: currentAddress }),
  getIntentDefaults: () => ({
    source: 'Dreaded Apes Wallet',
    chainId: activeChain,
    symbol: activeSymbol,
    origin: location.href
  }),
  onWarning: event => {
    showWarningToUser(event.security);
  }
});
```

The monitor wraps provider requests and audits transaction sends, signing calls, permit payloads, and approval calldata in the background. Critical decisions are blocked before the provider receives the request when `blockDecisions` includes `block`.

## Decisions

- `allow`: ready for device or wallet review.
- `hold`: needs local policy review or extra confirmation.
- `block`: must not be sent for signing.

# Dreaded Guard

Dreaded Guard is a dependency-free browser security SDK for wallet transaction and vault-action review.

## Script Tag

```html
<script src="https://your-domain.example/guard/v1/dreaded-guard.js"></script>
<script>
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

  const security = guard.audit({
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

  if (security.decision === 'block') {
    throw new Error('Blocked by Dreaded Guard');
  }
</script>
```

## API

- `DreadedGuard.createGuard(options)`
- `DreadedGuard.createBackgroundMonitor(options)`
- `guard.audit(intent, context)`
- `guard.buildAction(intent, actionOptions, context)`
- `guard.statusFor(security)`
- `DreadedGuard.renderResult(element, security)`

## Background Monitor

```html
<script src="/guard/v1/dreaded-guard.js"></script>
<script>
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

  DreadedGuard.createBackgroundMonitor({
    guard,
    provider: window.ethereum,
    blockDecisions: ['block'],
    getContext: () => ({ walletAddress: window.selectedAddress }),
    getIntentDefaults: () => ({
      source: 'Dreaded Apes Wallet',
      chainId: 'base',
      symbol: 'ETH',
      origin: location.href
    }),
    onWarning: event => {
      console.warn('Dreaded Guard warning', event.security);
    }
  });
</script>
```

The monitor inspects `eth_sendTransaction`, signing requests, approval calls, permit payloads, and wallet call batches before the wrapped provider forwards them.

## Decisions

- `allow`: Ready for device or wallet review.
- `hold`: Needs extra confirmation or local policy review.
- `block`: Must not be sent for signing.

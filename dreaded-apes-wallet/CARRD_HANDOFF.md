# Carrd Handoff

Target page:

```text
https://DreadedApes.carrd.co/
```

Carrd cannot receive this repository directly like a Git host. Use one of these handoff paths.

## Option A: Full Media Vault

1. Deploy `public/` to GitHub Pages.
2. Copy the deployed app URL.
3. In Carrd, add an Embed element.
4. Paste this iframe, replacing the `src` value:

```html
<iframe
  title="Dreaded Apes Wallet"
  src="https://YOUR-USERNAME.github.io/YOUR-REPO/"
  style="width:100%;height:900px;border:0;border-radius:8px;background:#0d0d0f;"
  loading="lazy"
  allow="hid; usb; bluetooth"
></iframe>
```

Install page URL after static deployment:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/install/
```

Browser extension download after static deployment:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/downloads/dreaded-apes-wallet-extension.zip
```

## Option B: Standalone Guard Widget

Use this when the Carrd page should promote or test the security protocol only.

```html
<div id="dreaded-guard-output"></div>
<script src="https://YOUR-USERNAME.github.io/YOUR-REPO/guard/v1/dreaded-guard.js"></script>
<script>
  const guard = DreadedGuard.createGuard({
    trustedSources: {
      DreadedApes: {
        domain: 'DreadedApes.carrd.co',
        recipient: '0x1111111111111111111111111111111111111111',
        chains: ['base'],
        caps: { ETH: 0.35 }
      }
    }
  });

  const result = guard.audit({
    source: 'DreadedApes',
    chainId: 'base',
    symbol: 'ETH',
    amountValue: 0,
    recipient: '0x1111111111111111111111111111111111111111',
    method: 'openVault',
    approval: 'none',
    origin: 'https://DreadedApes.carrd.co/',
    readOnly: true
  });

  DreadedGuard.renderResult('#dreaded-guard-output', result);
</script>
```

## Files Already Pointing To Carrd

- `public/index.html` canonical and Open Graph URL
- `public/sitemap.xml`
- `README.md`
- `DEPLOYMENT.md`

# Dreaded Apes Wallet

Dreaded Apes Wallet is a production-ready multichain media vault and player for movies, music, and photos. The v1 product boundary is deliberately simple: index media, preview source routes, connect a wallet or device when available, and keep every vault action behind a security review queue.

## Production Surface

- Media-first player with generated visual playback.
- Aggregated vault library for movies, music, and photos.
- Indexed network rail for Ethereum, Base, Polygon, Arbitrum, Solana, and Bitcoin.
- Source routes for media catalogs without exchange or custody features.
- Hardware-device workflow cues for USB, BLE, and QR.
- Transaction guard that blocks unsafe approvals, suspicious origins, blocked recipients, and high-risk methods.
- Background guard monitor that wraps wallet-provider requests and warns before risky signing or send activity proceeds.
- Standalone Dreaded Guard SDK at `/guard/dreaded-guard.js` for reuse in other wallets.
- Publishable guard package under `packages/dreaded-guard` with TypeScript definitions and tests.
- PWA install support with offline app-shell caching.
- User install page with PWA install and browser-extension download.
- Chrome/Edge extension package generated from the media vault.
- Dependency-free production server with security headers.
- GitHub Pages deployment workflow for the static `public/` app.

## Run Locally

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Install page:

```text
http://localhost:3000/install/
```

No install step is required for the app itself because the production server uses Node built-ins only.

## Deploy

Public target:

```text
https://DreadedApes.carrd.co/
```

### GitHub Pages

This repo includes a root GitHub Actions workflow that deploys `dreaded-apes-wallet/public` to GitHub Pages.

1. Push the repo to GitHub.
2. In the repo settings, open **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Push to `main` or run the workflow manually.

Live Pages URL:

```text
https://dreadedjigs.github.io/web3-wallet-nft-tools-repo-v2/
```

Use that URL as the iframe source in Carrd.

### Node Hosting

For Render, Fly.io, Railway, a VPS, or any Node host:

```bash
npm start
```

Set `PORT` if your host requires it.

## Launch Checklist

- Replace placeholder media/source data in `public/app.js` with your production catalog feed.
- Set the production domain in `public/sitemap.xml`.
- Add real source allowlist recipients before enabling live signing.
- Publish `/guard/dreaded-guard.js` as the embeddable security bundle for partner wallets.
- Use `/guard/v1/dreaded-guard.js` for stable partner integrations.
- Keep `DreadedGuard.createBackgroundMonitor(...)` enabled around wallet providers in production builds.
- Build the downloadable extension ZIP with `npm run build:extension`.
- Run `npm run verify:production` before pushing release changes.
- Run a security review on wallet/device flows before public wallet actions.
- Add uptime monitoring for `/healthz`.
- Add privacy policy and support contact pages before store submission or paid traffic.

## File Map

```text
server.js                    Dependency-free static production server
public/index.html            App shell and PWA metadata
public/install/index.html    User install and download page
public/styles.css            Responsive media-vault interface
public/app.js                Vault, player, source, device, and guard logic
public/guard/dreaded-guard.js Standalone wallet security guard SDK
public/guard/v1/dreaded-guard.js Version-pinned guard browser bundle
public/guard/index.html      Standalone guard demo and integration test page
packages/dreaded-guard       Publishable guard package with types
tests/guard.test.js          Automated guard policy tests
public/manifest.webmanifest  PWA manifest
public/sw.js                 Offline app-shell cache
public/release.json          Static release metadata
public/downloads/dreaded-apes-wallet-extension.zip Browser extension package
extensions/chrome/dreaded-apes-wallet Chrome/Edge extension source
../.github/workflows/dreaded-apes-wallet-pages.yml GitHub Pages deployment workflow
../.github/workflows/dreaded-apes-wallet-ci.yml Production verification workflow
public/.nojekyll             GitHub Pages static-file marker
```

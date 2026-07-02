# Dreaded Apes Wallet Deployment

## Recommended V1 Path

Use GitHub Pages first. Dreaded Apes Wallet v1 is a client-side media vault, so static hosting is cheaper, easier to cache, and simpler to monitor than a server deployment.

Public Carrd target:

```text
https://DreadedApes.carrd.co/
```

## GitHub Pages

This repository includes:

```text
../.github/workflows/dreaded-apes-wallet-pages.yml
../.github/workflows/dreaded-apes-wallet-ci.yml
public/.nojekyll
```

Setup:

1. Push the repo to GitHub.
2. Open repository **Settings**.
3. Go to **Pages**.
4. Set **Source** to **GitHub Actions**.
5. Push to `main` or run the Dreaded Apes Wallet workflow manually from the Actions tab.

Typical URL:

```text
https://YOUR-USERNAME.github.io/YOUR-REPO/
```

Use that Pages URL in the Carrd iframe.

## Node Host

Use this when you want a simple origin server:

```bash
npm start
```

Health check:

```text
/healthz
```

## Standalone Guard

The reusable wallet guard ships at:

```text
/guard/dreaded-guard.js
```

Stable versioned path:

```text
/guard/v1/dreaded-guard.js
```

Demo and integration test page:

```text
/guard/
```

Partner wallets can load the guard with a script tag and call `DreadedGuard.createGuard(...)`.
Production wallet surfaces should also call `DreadedGuard.createBackgroundMonitor(...)` around their provider so risky signing and transaction requests are warned or blocked before provider execution.

For package-style distribution, publish or pack:

```bash
npm run sync:guard
npm pack ./packages/dreaded-guard
```

## User Install Downloads

The public install page is:

```text
/install/
```

It offers:

- PWA install prompt for supported browsers.
- Browser extension download at `/downloads/dreaded-apes-wallet-extension.zip`.

Refresh the extension ZIP after app or guard changes:

```bash
npm run build:extension
```

## Before Public Traffic

- Point DNS to the host.
- Enable HTTPS.
- Update `public/sitemap.xml` to the real domain.
- Confirm all external source routes are intentional.
- Replace placeholder allowlist recipients in `public/app.js`.
- Replace placeholder allowlist recipients in `public/guard` demos before using them in partner docs.
- Rebuild `public/downloads/dreaded-apes-wallet-extension.zip` after production copy changes.
- Run the guard test in the app and confirm blocked actions cannot be reviewed.

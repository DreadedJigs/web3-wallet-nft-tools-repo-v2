const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const requiredFiles = [
  'public/index.html',
  'public/app.js',
  'public/sw.js',
  'public/.nojekyll',
  'public/manifest.webmanifest',
  'public/assets/core/dreaded-apes-app-icon-512.png',
  'public/assets/core/dreaded-apes-maskable-icon-512.png',
  'public/assets/wallet/wallet-hero-bg-1600x900.png',
  'public/assets/wallet/guard-shield-panel-1200x800.png',
  'public/assets/covers/cover-static-midnight.png',
  'public/guard/dreaded-guard.js',
  'public/guard/v1/dreaded-guard.js',
  'packages/dreaded-guard/dist/dreaded-guard.js',
  'public/downloads/dreaded-apes-wallet-extension.zip',
  'extensions/chrome/dreaded-apes-wallet/manifest.json'
];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function fail(message) {
  console.error(`Production verification failed: ${message}`);
  process.exitCode = 1;
}

for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(root, file))) fail(`missing ${file}`);
}

const guard = read('public/guard/dreaded-guard.js');
const guardV1 = read('public/guard/v1/dreaded-guard.js');
const guardDist = read('packages/dreaded-guard/dist/dreaded-guard.js');
const app = read('public/app.js');
const html = read('public/index.html');
const serviceWorker = read('public/sw.js');
const zip = fs.readFileSync(path.join(root, 'public/downloads/dreaded-apes-wallet-extension.zip'));
const packageJson = JSON.parse(read('package.json'));
const manifest = JSON.parse(read('public/manifest.webmanifest'));

if (guard !== guardV1) fail('public guard and v1 guard bundle are not in sync');
if (guard !== guardDist) fail('public guard and package dist guard bundle are not in sync');
if (!guard.includes('createBackgroundMonitor')) fail('guard bundle is missing background monitor API');
if (!app.includes('createBackgroundMonitor')) fail('wallet app is not installing the background guard monitor');
if (!html.includes('id="guardMonitor"')) fail('wallet shell is missing the background guard monitor panel');
if (!serviceWorker.includes('dreaded-apes-wallet-v13')) fail('service worker cache version was not bumped to v13');
if (manifest.name !== 'Dreaded Apes Wallet') fail('PWA manifest has unexpected app name');
if (!manifest.icons.some(icon => icon.src === 'assets/core/dreaded-apes-app-icon-512.png')) fail('PWA manifest is missing the generated app icon');
if (!manifest.icons.some(icon => icon.src === 'assets/core/dreaded-apes-maskable-icon-512.png')) fail('PWA manifest is missing the generated maskable icon');
if (!zip.includes(Buffer.from('guard/dreaded-guard.js'))) fail('extension ZIP is missing guard/dreaded-guard.js');
if (!zip.includes(Buffer.from('popup.html'))) fail('extension ZIP is missing popup.html');
if (!zip.includes(Buffer.from('assets/core/dreaded-apes-app-icon-512.png'))) fail('extension ZIP is missing generated icon assets');
if (packageJson.name !== 'dreaded-apes-wallet') fail('package name is unexpected');

const staleTerms = [
  'Dreaded ' + 'Wallet',
  'dreaded-' + 'wallet',
  'tan' + 'line',
  'Tan ' + 'Line',
  'tan' + 'ning',
  't' + 'max',
  'T-' + 'Max',
  'sa' + 'lon',
  'Net' + 'lify',
  'Ver' + 'cel'
];

for (const file of ['README.md', 'DEPLOYMENT.md', 'public/index.html', 'public/app.js']) {
  const content = read(file).toLowerCase();
  const staleTerm = staleTerms.find(term => content.includes(term.toLowerCase()));
  if (staleTerm) fail(`stale project reference found in ${file}: ${staleTerm}`);
}

if (!process.exitCode) {
  console.log('Production verification passed');
}

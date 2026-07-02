const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const extensionDir = path.join(root, 'extensions', 'chrome', 'dreaded-apes-wallet');
const publicDir = path.join(root, 'public');

const copies = [
  ['public/app.js', 'app.js'],
  ['public/styles.css', 'styles.css'],
  ['public/icon.svg', 'icon.svg'],
  ['public/guard/dreaded-guard.js', 'guard/dreaded-guard.js'],
  ['public/guard/v1/dreaded-guard.js', 'guard/v1/dreaded-guard.js'],
  ['public/guard/policy.example.json', 'guard/policy.example.json']
];

for (const [from, to] of copies) {
  const source = path.join(root, from);
  const target = path.join(extensionDir, to);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
}

fs.mkdirSync(path.join(publicDir, 'downloads'), { recursive: true });
fs.writeFileSync(
  path.join(publicDir, 'downloads', 'extension-install.txt'),
  fs.readFileSync(path.join(extensionDir, 'README.txt'), 'utf8')
);

const zipPath = path.join(publicDir, 'downloads', 'dreaded-apes-wallet-extension.zip');
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

const archive = spawnSync('powershell', [
  '-NoProfile',
  '-Command',
  `Compress-Archive -Path '${extensionDir}\\*' -DestinationPath '${zipPath}' -Force`
], { stdio: 'inherit' });

if (archive.status !== 0) {
  throw new Error('Failed to create extension ZIP. Run Compress-Archive manually if PowerShell is unavailable.');
}

console.log(`Prepared extension files in ${path.relative(root, extensionDir)}`);
console.log(`Created ${path.relative(root, zipPath)}`);

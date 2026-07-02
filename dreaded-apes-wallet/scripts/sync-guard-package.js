const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public', 'guard', 'dreaded-guard.js');
const targets = [
  path.join(root, 'packages', 'dreaded-guard', 'dist', 'dreaded-guard.js'),
  path.join(root, 'public', 'guard', 'v1', 'dreaded-guard.js')
];

for (const target of targets) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.copyFileSync(source, target);
  console.log(`Synced ${path.relative(root, target)}`);
}

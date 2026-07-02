const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

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

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function dosDateTime() {
  return { date: 0x5b21, time: 0 };
}

function writeUInt16(value) {
  const buffer = Buffer.alloc(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function writeUInt32(value) {
  const buffer = Buffer.alloc(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function zipEntries(dir, prefix = '') {
  return fs.readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap(entry => {
      const absolute = path.join(dir, entry.name);
      const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return zipEntries(absolute, relative);
      return [{ absolute, relative }];
    });
}

function createZip(sourceDir, targetZip) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { date, time } = dosDateTime();

  for (const entry of zipEntries(sourceDir)) {
    const name = Buffer.from(entry.relative, 'utf8');
    const content = fs.readFileSync(entry.absolute);
    const compressed = zlib.deflateRawSync(content, { level: 9 });
    const crc = crc32(content);

    const localHeader = Buffer.concat([
      writeUInt32(0x04034b50),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(8),
      writeUInt16(time),
      writeUInt16(date),
      writeUInt32(crc),
      writeUInt32(compressed.length),
      writeUInt32(content.length),
      writeUInt16(name.length),
      writeUInt16(0),
      name
    ]);

    const centralHeader = Buffer.concat([
      writeUInt32(0x02014b50),
      writeUInt16(20),
      writeUInt16(20),
      writeUInt16(0x0800),
      writeUInt16(8),
      writeUInt16(time),
      writeUInt16(date),
      writeUInt32(crc),
      writeUInt32(compressed.length),
      writeUInt32(content.length),
      writeUInt16(name.length),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt16(0),
      writeUInt32(0),
      writeUInt32(offset),
      name
    ]);

    localParts.push(localHeader, compressed);
    centralParts.push(centralHeader);
    offset += localHeader.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endRecord = Buffer.concat([
    writeUInt32(0x06054b50),
    writeUInt16(0),
    writeUInt16(0),
    writeUInt16(centralParts.length),
    writeUInt16(centralParts.length),
    writeUInt32(centralDirectory.length),
    writeUInt32(offset),
    writeUInt16(0)
  ]);

  fs.writeFileSync(targetZip, Buffer.concat([...localParts, centralDirectory, endRecord]));
}

const zipPath = path.join(publicDir, 'downloads', 'dreaded-apes-wallet-extension.zip');
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);
createZip(extensionDir, zipPath);

console.log(`Prepared extension files in ${path.relative(root, extensionDir)}`);
console.log(`Created ${path.relative(root, zipPath)}`);

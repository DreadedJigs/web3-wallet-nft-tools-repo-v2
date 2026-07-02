const http = require('http');
const fs = require('fs/promises');
const path = require('path');
const { getAssets, getBalances, isEvmAddress, proxyMedia } = require('./indexer');

const port = Number(process.env.PORT || 3000);
const publicDir = path.resolve(__dirname, 'public');

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.zip': 'application/zip'
};

function securityHeaders() {
  return {
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      "connect-src 'self' https:",
      "media-src 'self' blob: https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests'
    ].join('; '),
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Origin-Agent-Cluster': '?1',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=(self), hid=(self), bluetooth=(self)',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-Permitted-Cross-Domain-Policies': 'none'
  };
}

function resolveRequestPath(urlPath) {
  const cleanPath = decodeURIComponent(urlPath === '/' ? '/index.html' : urlPath);
  const requested = path.resolve(path.join(publicDir, cleanPath));
  if (!(requested === publicDir || requested.startsWith(publicDir + path.sep))) {
    return null;
  }
  return requested;
}

async function readStaticFile(urlPath) {
  const requested = resolveRequestPath(urlPath);
  if (!requested) return { status: 403, body: 'Forbidden', filePath: null };

  try {
    const stat = await fs.stat(requested);
    const filePath = stat.isDirectory() ? path.join(requested, 'index.html') : requested;
    return { status: 200, body: await fs.readFile(filePath), filePath };
  } catch {
    if (path.extname(urlPath)) return { status: 404, body: 'Not found', filePath: null };
    return { status: 200, body: await fs.readFile(path.join(publicDir, 'index.html')), filePath: path.join(publicDir, 'index.html') };
  }
}

function jsonResponse(res, status, body) {
  res.writeHead(status, {
    ...securityHeaders(),
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(JSON.stringify(body));
}

function parseChainIds(url) {
  return url.searchParams.getAll('chain')
    .flatMap(value => String(value || '').split(','))
    .map(value => value.trim())
    .filter(Boolean);
}

async function handleApiRequest(req, res, url) {
  if (url.pathname === '/api/indexer/health') {
    jsonResponse(res, 200, { ok: true, service: 'Dreaded Indexer', mode: 'backend' });
    return true;
  }

  const balanceMatch = url.pathname.match(/^\/api\/wallet\/(0x[a-fA-F0-9]{40})\/balances$/);
  if (balanceMatch) {
    const address = balanceMatch[1];
    if (!isEvmAddress(address)) {
      jsonResponse(res, 400, { ok: false, error: 'Invalid wallet address' });
      return true;
    }
    try {
      const balances = await getBalances(address, { chainIds: parseChainIds(url) });
      jsonResponse(res, 200, { ok: true, address, balances });
    } catch (error) {
      jsonResponse(res, 502, { ok: false, error: error.message || 'Balance index failed' });
    }
    return true;
  }

  const assetMatch = url.pathname.match(/^\/api\/wallet\/(0x[a-fA-F0-9]{40})\/assets$/);
  if (assetMatch) {
    const address = assetMatch[1];
    if (!isEvmAddress(address)) {
      jsonResponse(res, 400, { ok: false, error: 'Invalid wallet address' });
      return true;
    }
    try {
      const indexed = await getAssets(address, { chainIds: parseChainIds(url) });
      jsonResponse(res, 200, { ok: true, address, ...indexed });
    } catch (error) {
      jsonResponse(res, 502, { ok: false, error: error.message || 'Asset index failed' });
    }
    return true;
  }

  if (url.pathname === '/api/media/proxy') {
    const mediaUrl = url.searchParams.get('url') || '';
    try {
      const media = await proxyMedia(mediaUrl);
      res.writeHead(200, {
        ...securityHeaders(),
        'Content-Type': media.contentType,
        'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
      });
      res.end(media.body);
    } catch (error) {
      jsonResponse(res, 502, { ok: false, error: error.message || 'Media proxy failed' });
    }
    return true;
  }

  return false;
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (url.pathname === '/healthz') {
      res.writeHead(200, {
        ...securityHeaders(),
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      });
      res.end(JSON.stringify({ ok: true, app: 'Dreaded Apes Wallet', mode: 'media-vault' }));
      return;
    }

    if (url.pathname.startsWith('/api/')) {
      const handled = await handleApiRequest(req, res, url);
      if (handled) return;
      jsonResponse(res, 404, { ok: false, error: 'API route not found' });
      return;
    }

    const result = await readStaticFile(url.pathname);
    const ext = result.filePath ? path.extname(result.filePath) : '.txt';
    res.writeHead(result.status, {
      ...securityHeaders(),
      'Content-Type': mimeTypes[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(result.body);
  } catch {
    res.writeHead(500, {
      ...securityHeaders(),
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store'
    });
    res.end('Server error');
  }
});

if (require.main === module) {
  server.listen(port, () => {
    console.log(`Dreaded Apes Wallet running at http://localhost:${port}`);
  });
}

module.exports = server;

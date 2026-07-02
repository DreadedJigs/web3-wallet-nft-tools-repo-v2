const dns = require('dns/promises');
const net = require('net');

const defaultChains = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: '0x1',
    rpc: 'https://ethereum.publicnode.com',
    reservoirHost: 'https://api.reservoir.tools',
    blockscoutApi: 'https://eth.blockscout.com/api/v2'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: '0x2105',
    rpc: 'https://mainnet.base.org',
    reservoirHost: 'https://api-base.reservoir.tools',
    blockscoutApi: 'https://base.blockscout.com/api/v2'
  },
  {
    id: 'apechain',
    name: 'ApeChain',
    symbol: 'APE',
    chainId: '0x8173',
    rpc: 'https://apechain.calderachain.xyz/http',
    blockscoutApi: 'https://apechain.calderaexplorer.xyz/api/v2'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    chainId: '0x89',
    rpc: 'https://polygon-rpc.com',
    reservoirHost: 'https://api-polygon.reservoir.tools',
    blockscoutApi: 'https://polygon.blockscout.com/api/v2'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: '0xa4b1',
    rpc: 'https://arb1.arbitrum.io/rpc',
    reservoirHost: 'https://api-arbitrum.reservoir.tools',
    blockscoutApi: 'https://arbitrum.blockscout.com/api/v2'
  }
];

const tokenUriSelector = '0xc87b56dd';
const erc1155UriSelector = '0x0e89341c';
const emptyCover = 'assets/wallet/media-vault-empty-state-1200x800.png';
const balanceCache = new Map();
const assetCache = new Map();
const metadataCache = new Map();

function isEvmAddress(value = '') {
  return /^0x[a-f0-9]{40}$/i.test(String(value || ''));
}

function normalizeAddress(value = '') {
  return String(value || '').toLowerCase();
}

function cacheGet(cache, key, ttlMs) {
  const cached = cache.get(key);
  if (!cached || Date.now() - cached.time > ttlMs) return null;
  return cached.value;
}

function cacheSet(cache, key, value) {
  cache.set(key, { value, time: Date.now() });
  return value;
}

function selectedChains(chainIds = []) {
  const wanted = new Set(chainIds.filter(Boolean));
  return wanted.size ? defaultChains.filter(chain => wanted.has(chain.id)) : defaultChains;
}

function weiHexToEth(hex) {
  if (typeof hex !== 'string' || !/^0x[0-9a-f]+$/i.test(hex)) return 0;
  const wei = BigInt(hex);
  const integer = wei / 1000000000000000000n;
  const fraction = wei % 1000000000000000000n;
  return Number(`${integer}.${fraction.toString().padStart(18, '0').slice(0, 8)}`);
}

async function fetchWithTimeout(url, { timeoutMs = 9000, headers = {}, method = 'GET', body } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { method, headers, body, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchJsonWithTimeout(url, options = {}) {
  const response = await fetchWithTimeout(url, {
    ...options,
    headers: { accept: 'application/json', ...(options.headers || {}) }
  });
  if (!response.ok) throw new Error(`${response.status}`);
  return response.json();
}

async function rpcRequest(chain, method, params, { timeoutMs = 8000 } = {}) {
  if (!chain.rpc) throw new Error(`${chain.name} RPC is not configured`);
  const response = await fetchWithTimeout(chain.rpc, {
    method: 'POST',
    timeoutMs,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
  });
  if (!response.ok) throw new Error(`${chain.name} RPC returned ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || `${chain.name} RPC error`);
  return payload.result;
}

async function getBalances(address, { chainIds = [] } = {}) {
  if (!isEvmAddress(address)) throw new Error('Invalid wallet address');
  const chains = selectedChains(chainIds);
  const cacheKey = `${normalizeAddress(address)}:${chains.map(chain => chain.id).join(',')}`;
  const cached = cacheGet(balanceCache, cacheKey, 30000);
  if (cached) return cached;

  const entries = await Promise.all(chains.map(async chain => {
    try {
      const result = await rpcRequest(chain, 'eth_getBalance', [address, 'latest']);
      return [chain.id, { status: 'ready', balance: weiHexToEth(result), symbol: chain.symbol, source: 'backend' }];
    } catch (error) {
      return [chain.id, { status: 'error', balance: 0, symbol: chain.symbol, message: error.message, source: 'backend' }];
    }
  }));

  return cacheSet(balanceCache, cacheKey, Object.fromEntries(entries));
}

function normalizeIpfs(url = '') {
  if (!url) return '';
  if (url.startsWith('ipfs://ipfs/')) return `https://ipfs.io/ipfs/${url.slice(12)}`;
  if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.slice(7)}`;
  if (url.startsWith('ar://')) return `https://arweave.net/${url.slice(5)}`;
  return url;
}

function firstString(...values) {
  return values.flat().find(value => typeof value === 'string' && value.trim()) || '';
}

function safeAssetUrl(url = '') {
  const normalized = normalizeIpfs(String(url || '').trim());
  if (!normalized) return '';
  try {
    const parsed = new URL(normalized);
    if (['http:', 'https:', 'data:'].includes(parsed.protocol)) return normalized;
  } catch {
    return '';
  }
  return '';
}

function proxiedMediaUrl(url = '') {
  const safe = safeAssetUrl(url);
  if (!safe || safe.startsWith('data:')) return safe;
  return `/api/media/proxy?url=${encodeURIComponent(safe)}`;
}

function inferMediaType(token = {}) {
  const url = firstString(token.animation_url, token.animationUrl, token.media, token.image, token.imageUrl).toLowerCase();
  const mime = firstString(token.mimeType, token.contentType, token.metadata?.mimeType, token.metadata?.contentType).toLowerCase();
  if (/\bvideo|\.mp4|\.webm|\.mov|\.m3u8/.test(`${mime} ${url}`)) return 'movie';
  if (/\baudio|\.mp3|\.wav|\.flac|\.ogg/.test(`${mime} ${url}`)) return 'music';
  return 'photo';
}

function tokenMediaUrl(token = {}) {
  const mediaObject = token.media && typeof token.media === 'object' ? token.media : {};
  return safeAssetUrl(firstString(
    mediaObject.original,
    mediaObject.large,
    mediaObject.small,
    token.animation_url,
    token.animationUrl,
    token.metadata?.animation_url,
    token.metadata?.animationUrl,
    token.image,
    token.imageUrl,
    token.metadata?.image
  ));
}

function tokenImageUrl(token = {}) {
  const mediaObject = token.media && typeof token.media === 'object' ? token.media : {};
  return safeAssetUrl(firstString(
    token.image,
    token.imageUrl,
    token.imageSmall,
    token.metadata?.image,
    mediaObject.large,
    mediaObject.small,
    mediaObject.original,
    token.collection?.image
  ));
}

function mediaFormat(type) {
  if (type === 'movie') return '8K capable stream';
  if (type === 'music') return 'Wallet audio';
  return 'High-res image';
}

function normalizeMediaAsset(asset = {}) {
  const cover = proxiedMediaUrl(asset.cover) || asset.cover || emptyCover;
  const mediaUrl = proxiedMediaUrl(asset.mediaUrl) || cover;
  return { ...asset, cover, mediaUrl };
}

function reservoirTokenToMedia(row = {}, source) {
  const token = row.token || row;
  const collection = token.collection || row.collection || {};
  const chain = source.chain;
  const tokenId = token.tokenId || token.id || token.token_id || 'unknown';
  const contract = token.contract || token.contractAddress || token.contract_address || collection.id || 'unknown';
  const type = inferMediaType(token);
  const image = tokenImageUrl(token);
  const mediaUrl = tokenMediaUrl(token);
  return normalizeMediaAsset({
    id: `${chain}:${contract}:${tokenId}`,
    title: token.name || collection.name || `Token ${tokenId}`,
    creator: collection.name || token.creator || 'Unknown collection',
    type,
    chain,
    market: source.name,
    runtime: type === 'photo' ? 'Owned image' : 'Owned media',
    duration: type === 'music' ? 180 : type === 'movie' ? 600 : 120,
    token: `${String(contract).slice(0, 6)}...${String(contract).slice(-4)} #${tokenId}`,
    license: row.ownership?.tokenCount ? `${row.ownership.tokenCount} owned` : 'Owned NFT',
    price: 0,
    format: mediaFormat(type),
    cover: image || emptyCover,
    mediaUrl,
    contract,
    tokenId,
    colors: ['#10151d', '#d9a441', '#45b6bd'],
    indexedBy: 'backend'
  });
}

function blockscoutNftToMedia(row = {}, source) {
  const token = row.token || {};
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const chain = source.chain;
  const tokenId = row.id || row.token_id || row.tokenId || metadata.token_id || 'unknown';
  const contract = token.address_hash || row.contract_address_hash || row.contract || 'unknown';
  const image = safeAssetUrl(firstString(row.image_url, row.imageUrl, metadata.image, row.thumbnails?.large, row.thumbnails?.small, token.icon_url));
  const mediaUrl = safeAssetUrl(firstString(row.animation_url, row.media_url, row.mediaUrl, metadata.animation_url, metadata.animationUrl, metadata.image, row.image_url));
  const type = inferMediaType({ ...metadata, image: image || metadata.image, media: mediaUrl || row.media_url, animation_url: row.animation_url || metadata.animation_url, mimeType: row.media_type || metadata.mimeType });
  const collectionName = token.name || token.symbol || 'Unknown collection';
  return normalizeMediaAsset({
    id: `${chain}:${contract}:${tokenId}`,
    title: metadata.name || row.name || `${collectionName} #${tokenId}`,
    creator: collectionName,
    type,
    chain,
    market: source.name,
    runtime: type === 'photo' ? 'Owned image' : 'Owned media',
    duration: type === 'music' ? 180 : type === 'movie' ? 600 : 120,
    token: `${String(contract).slice(0, 6)}...${String(contract).slice(-4)} #${tokenId}`,
    license: row.value ? `${row.value} owned` : 'Owned NFT',
    price: 0,
    format: mediaFormat(type),
    cover: image || emptyCover,
    mediaUrl,
    contract,
    tokenId,
    colors: ['#0d1b2a', '#ffb703', '#00d4ff'],
    indexedBy: 'backend'
  });
}

function blockscoutTokenToMedia(row = {}, source) {
  const token = row.token || {};
  const instance = row.token_instance || {};
  const metadata = instance.metadata && typeof instance.metadata === 'object' ? instance.metadata : {};
  const chain = source.chain;
  const tokenId = row.token_id || instance.id || 'collection';
  const contract = token.address_hash || row.address_hash || 'unknown';
  const image = safeAssetUrl(firstString(instance.image_url, instance.imageUrl, metadata.image, token.icon_url));
  const mediaUrl = safeAssetUrl(firstString(instance.animation_url, instance.media_url, metadata.animation_url, metadata.image, instance.image_url));
  const type = inferMediaType({ ...metadata, image, media: mediaUrl, animation_url: instance.animation_url || metadata.animation_url });
  const collectionName = token.name || token.symbol || 'Unknown collection';
  return normalizeMediaAsset({
    id: `${chain}:${contract}:${tokenId}`,
    title: metadata.name || instance.name || (tokenId === 'collection' ? collectionName : `${collectionName} #${tokenId}`),
    creator: collectionName,
    type,
    chain,
    market: source.name,
    runtime: tokenId === 'collection' ? 'Owned collection' : 'Owned media',
    duration: type === 'music' ? 180 : type === 'movie' ? 600 : 120,
    token: tokenId === 'collection' ? `${String(contract).slice(0, 6)}...${String(contract).slice(-4)}` : `${String(contract).slice(0, 6)}...${String(contract).slice(-4)} #${tokenId}`,
    license: row.value ? `${row.value} owned` : 'Owned NFT',
    price: 0,
    format: mediaFormat(type),
    cover: image || emptyCover,
    mediaUrl,
    contract,
    tokenId,
    colors: ['#0d1b2a', '#ffb703', '#22c55e'],
    indexedBy: 'backend'
  });
}

function sourceRowsToMedia(payload = {}, source) {
  if (source.kind === 'reservoir') {
    const rows = Array.isArray(payload.tokens) ? payload.tokens : Array.isArray(payload.nfts) ? payload.nfts : [];
    return rows.map(row => reservoirTokenToMedia(row, source));
  }
  if (source.kind === 'blockscout-nft') {
    const rows = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return rows.map(row => blockscoutNftToMedia(row, source));
  }
  if (source.kind === 'blockscout-token') {
    const rows = Array.isArray(payload.items) ? payload.items : Array.isArray(payload) ? payload : [];
    return rows.map(row => blockscoutTokenToMedia(row, source));
  }
  return [];
}

function indexerSources(chains) {
  const sources = [];
  for (const chain of chains) {
    if (chain.reservoirHost) {
      sources.push({
        name: `${chain.name} Marketplace`,
        chain: chain.id,
        kind: 'reservoir',
        timeoutMs: 9000,
        url: address => `${chain.reservoirHost}/users/${address}/tokens/v10?limit=80&sortBy=updatedAt`
      });
    }
    if (chain.blockscoutApi) {
      sources.push({
        name: `${chain.name} Explorer NFTs`,
        chain: chain.id,
        kind: 'blockscout-nft',
        timeoutMs: 11000,
        url: address => `${chain.blockscoutApi}/addresses/${address}/nft?type=ERC-721%2CERC-1155`
      });
      sources.push({
        name: `${chain.name} Explorer Collections`,
        chain: chain.id,
        kind: 'blockscout-token',
        timeoutMs: 9000,
        url: address => `${chain.blockscoutApi}/addresses/${address}/tokens?type=ERC-721%2CERC-1155`
      });
    }
  }
  return sources;
}

function dedupeAssets(assets = []) {
  const map = new Map();
  for (const asset of assets) {
    if (!asset?.id) continue;
    const existing = map.get(asset.id);
    if (!existing) {
      map.set(asset.id, asset);
      continue;
    }
    const existingHasArt = existing.cover && !String(existing.cover).includes(emptyCover);
    const nextHasArt = asset.cover && !String(asset.cover).includes(emptyCover);
    if (!existingHasArt && nextHasArt) map.set(asset.id, asset);
  }
  return [...map.values()];
}

function uint256Hex(value = '') {
  try {
    const id = BigInt(String(value));
    if (id < 0n) return '';
    return id.toString(16).padStart(64, '0');
  } catch {
    return '';
  }
}

function decodeEthString(result = '') {
  const hex = String(result || '').replace(/^0x/i, '');
  if (hex.length < 128) return '';
  const offset = Number.parseInt(hex.slice(0, 64), 16);
  if (!Number.isFinite(offset)) return '';
  const lengthStart = offset * 2;
  const byteLength = Number.parseInt(hex.slice(lengthStart, lengthStart + 64), 16);
  if (!Number.isFinite(byteLength)) return '';
  const data = hex.slice(lengthStart + 64, lengthStart + 64 + byteLength * 2);
  const bytes = data.match(/.{1,2}/g)?.map(byte => Number.parseInt(byte, 16)) || [];
  try {
    return new TextDecoder().decode(new Uint8Array(bytes)).replace(/\0+$/g, '');
  } catch {
    return '';
  }
}

function metadataImageFromKnownUri(uri = '', tokenId = '') {
  const normalized = normalizeIpfs(uri);
  const hatcheryMatch = normalized.match(/^https:\/\/hatchery\.powpond\.com\/api\/metadata\/(\d+)/i);
  if (hatcheryMatch) return `https://hatchery.powpond.com/api/images/${hatcheryMatch[1]}`;
  if (/\/metadata\/?$/.test(normalized) && tokenId) return `${normalized.replace(/\/$/, '')}/${tokenId}`;
  return '';
}

async function tokenUriForAsset(asset = {}) {
  const chain = defaultChains.find(item => item.id === asset.chain);
  const tokenHex = uint256Hex(asset.tokenId);
  if (!chain?.rpc || !asset.contract || asset.contract === 'unknown' || !tokenHex) return '';
  const cacheKey = `${chain.id}:${asset.contract}:${asset.tokenId}:tokenUri`;
  const cached = cacheGet(metadataCache, cacheKey, 15 * 60 * 1000);
  if (cached !== null) return cached;

  for (const selector of [tokenUriSelector, erc1155UriSelector]) {
    try {
      const result = await rpcRequest(chain, 'eth_call', [{ to: asset.contract, data: `${selector}${tokenHex}` }, 'latest']);
      const uri = decodeEthString(result).replace(/\{id\}/gi, tokenHex.toLowerCase());
      if (uri) return cacheSet(metadataCache, cacheKey, uri);
    } catch {
      // Try the next metadata selector.
    }
  }

  return cacheSet(metadataCache, cacheKey, '');
}

async function fetchTokenMetadata(uri = '', tokenId = '') {
  const normalized = normalizeIpfs(uri);
  if (!normalized) return {};
  if (normalized.startsWith('data:application/json;base64,')) {
    try {
      return JSON.parse(Buffer.from(normalized.slice('data:application/json;base64,'.length), 'base64').toString('utf8'));
    } catch {
      return {};
    }
  }
  if (normalized.startsWith('data:application/json,')) {
    try {
      return JSON.parse(decodeURIComponent(normalized.slice('data:application/json,'.length)));
    } catch {
      return {};
    }
  }
  const safeUrl = safeAssetUrl(normalized);
  if (!safeUrl) return {};
  try {
    return await fetchJsonWithTimeout(safeUrl, { timeoutMs: 7000 });
  } catch {
    const inferred = metadataImageFromKnownUri(normalized, tokenId);
    return inferred ? { image: inferred } : {};
  }
}

async function enrichAssetWithTokenMetadata(asset = {}) {
  const hasArt = asset.cover && !String(asset.cover).includes(emptyCover);
  if (hasArt || !asset.contract || !asset.tokenId) return asset;
  const cacheKey = `${asset.chain}:${asset.contract}:${asset.tokenId}:metadata`;
  let metadata = cacheGet(metadataCache, cacheKey, 15 * 60 * 1000);
  if (!metadata) {
    const uri = await tokenUriForAsset(asset);
    metadata = await fetchTokenMetadata(uri, asset.tokenId);
    cacheSet(metadataCache, cacheKey, metadata);
  }
  const image = safeAssetUrl(firstString(metadata.image, metadata.image_url, metadata.imageUrl));
  const mediaUrl = safeAssetUrl(firstString(metadata.animation_url, metadata.animationUrl, metadata.media_url, metadata.mediaUrl, image));
  if (!image && !mediaUrl) return asset;
  const type = inferMediaType({ ...metadata, image, media: mediaUrl });
  return normalizeMediaAsset({
    ...asset,
    title: metadata.name || asset.title,
    type,
    cover: image || mediaUrl || asset.cover,
    mediaUrl: mediaUrl || image || asset.mediaUrl,
    runtime: type === 'photo' ? 'Owned image' : 'Owned media',
    format: mediaFormat(type)
  });
}

async function enrichAssetsWithTokenMetadata(assets = []) {
  const pending = assets.filter(asset => !asset.cover || String(asset.cover).includes(emptyCover)).slice(0, 80);
  if (!pending.length) return assets;
  const enriched = await Promise.all(pending.map(enrichAssetWithTokenMetadata));
  const enrichedById = new Map(enriched.map(asset => [asset.id, asset]));
  return assets.map(asset => enrichedById.get(asset.id) || asset);
}

async function getAssets(address, { chainIds = [] } = {}) {
  if (!isEvmAddress(address)) throw new Error('Invalid wallet address');
  const chains = selectedChains(chainIds);
  const cacheKey = `${normalizeAddress(address)}:${chains.map(chain => chain.id).join(',')}`;
  const cached = cacheGet(assetCache, cacheKey, 2 * 60 * 1000);
  if (cached) return { ...cached, cached: true };

  const sources = indexerSources(chains);
  const results = await Promise.all(sources.map(async source => {
    try {
      const payload = await fetchJsonWithTimeout(source.url(address), { timeoutMs: source.timeoutMs });
      const assets = sourceRowsToMedia(payload, source);
      return { source: source.name, ok: true, chain: source.chain, assets };
    } catch (error) {
      return { source: source.name, ok: false, chain: source.chain, error: error.name === 'AbortError' ? 'timeout' : error.message, assets: [] };
    }
  }));
  const assets = await enrichAssetsWithTokenMetadata(dedupeAssets(results.flatMap(result => result.assets)));
  const value = {
    assets,
    sources: results.map(({ source, ok, chain, error }) => ({ source, ok, chain, error })),
    indexedAt: new Date().toISOString(),
    cached: false
  };
  return cacheSet(assetCache, cacheKey, value);
}

function isPrivateIp(address = '') {
  const version = net.isIP(address);
  if (version === 4) {
    const parts = address.split('.').map(Number);
    return parts[0] === 10
      || parts[0] === 127
      || (parts[0] === 169 && parts[1] === 254)
      || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31)
      || (parts[0] === 192 && parts[1] === 168)
      || parts[0] === 0;
  }
  if (version === 6) {
    const lower = address.toLowerCase();
    return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
  }
  return false;
}

async function validateProxyUrl(rawUrl = '') {
  const normalized = normalizeIpfs(rawUrl);
  const parsed = new URL(normalized);
  if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error('Unsupported media URL');
  const hostname = parsed.hostname.toLowerCase();
  if (hostname === 'localhost' || hostname.endsWith('.local')) throw new Error('Blocked media host');
  if (isPrivateIp(hostname)) throw new Error('Blocked media IP');
  const records = await dns.lookup(hostname, { all: true }).catch(() => []);
  if (records.some(record => isPrivateIp(record.address))) throw new Error('Blocked resolved media IP');
  return parsed;
}

async function proxyMedia(rawUrl = '') {
  const parsed = await validateProxyUrl(rawUrl);
  const response = await fetchWithTimeout(parsed.toString(), {
    timeoutMs: 12000,
    headers: { accept: 'image/*,video/*,audio/*,*/*;q=0.8', 'user-agent': 'DreadedWalletMediaProxy/1.0' }
  });
  if (!response.ok) throw new Error(`Media fetch returned ${response.status}`);
  const contentType = response.headers.get('content-type') || 'application/octet-stream';
  const length = Number(response.headers.get('content-length') || 0);
  if (length > 25 * 1024 * 1024) throw new Error('Media response is too large');
  const buffer = Buffer.from(await response.arrayBuffer());
  if (buffer.length > 25 * 1024 * 1024) throw new Error('Media response is too large');
  return { body: buffer, contentType };
}

module.exports = {
  defaultChains,
  getAssets,
  getBalances,
  isEvmAddress,
  proxyMedia
};

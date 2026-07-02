const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const usd = value => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const storageKey = 'dreaded-apes-wallet-state';
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');

const defaultChains = [
  {
    id: 'ethereum',
    name: 'Ethereum',
    symbol: 'ETH',
    chainId: '0x1',
    balance: 2.84,
    usd: 9821.12,
    assets: 42,
    gas: '18 gwei',
    health: 'Synced',
    color: '#8f7cff',
    rpc: 'https://ethereum.publicnode.com',
    explorer: 'https://etherscan.io',
    reservoirHost: 'https://api.reservoir.tools',
    blockscoutApi: 'https://eth.blockscout.com/api/v2'
  },
  {
    id: 'base',
    name: 'Base',
    symbol: 'ETH',
    chainId: '0x2105',
    balance: 7.32,
    usd: 25133.06,
    assets: 86,
    gas: '<1 gwei',
    health: 'Fast',
    color: '#4f8cff',
    rpc: 'https://mainnet.base.org',
    explorer: 'https://basescan.org',
    reservoirHost: 'https://api-base.reservoir.tools',
    blockscoutApi: 'https://base.blockscout.com/api/v2'
  },
  {
    id: 'apechain',
    name: 'ApeChain',
    symbol: 'APE',
    chainId: '0x8173',
    balance: 0,
    usd: 0,
    assets: 0,
    gas: 'APE gas',
    health: 'Indexed',
    color: '#FFB703',
    rpc: 'https://apechain.calderachain.xyz/http',
    explorer: 'https://apescan.io',
    blockscoutApi: 'https://apechain.calderaexplorer.xyz/api/v2'
  },
  {
    id: 'polygon',
    name: 'Polygon',
    symbol: 'POL',
    chainId: '0x89',
    balance: 6842,
    usd: 5128.41,
    assets: 128,
    gas: '33 gwei',
    health: 'Synced',
    color: '#a37be7',
    rpc: 'https://polygon-rpc.com',
    explorer: 'https://polygonscan.com',
    reservoirHost: 'https://api-polygon.reservoir.tools',
    blockscoutApi: 'https://polygon.blockscout.com/api/v2'
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    symbol: 'ETH',
    chainId: '0xa4b1',
    balance: 1.91,
    usd: 6610.88,
    assets: 31,
    gas: '0.03 gwei',
    health: 'Synced',
    color: '#45b6bd',
    rpc: 'https://arb1.arbitrum.io/rpc',
    explorer: 'https://arbiscan.io',
    reservoirHost: 'https://api-arbitrum.reservoir.tools',
    blockscoutApi: 'https://arbitrum.blockscout.com/api/v2'
  },
  {
    id: 'solana',
    name: 'Solana',
    symbol: 'SOL',
    chainId: null,
    balance: 94.6,
    usd: 14625.28,
    assets: 57,
    gas: '0.00001 SOL',
    health: 'Fast',
    color: '#55b978',
    rpc: null,
    explorer: 'https://solscan.io'
  },
  {
    id: 'bitcoin',
    name: 'Bitcoin',
    symbol: 'BTC',
    chainId: null,
    balance: 0.41,
    usd: 27810.37,
    assets: 12,
    gas: '9 sat/vB',
    health: 'Indexed',
    color: '#d9a441',
    rpc: null,
    explorer: 'https://mempool.space'
  }
];

const media = [];
const markets = [];

const playerProfiles = {
  auto: { label: 'Auto HD', width: 1920, height: 1080 },
  '4k': { label: '4K UHD', width: 3840, height: 2160 },
  '8k': { label: '8K UHD', width: 7680, height: 4320 }
};

const skinPresets = {
  dreaded: {
    name: 'Modern Dreaded',
    accent: '#FFB703',
    secondary: '#00D4FF',
    glow: '#FF3B30',
    bg: '#0A0A0A',
    panel: '#0D1B2A',
    image: ''
  },
  obsidian: {
    name: 'Void Signal',
    accent: '#00D4FF',
    secondary: '#FFB703',
    glow: '#1E5BAA',
    bg: '#0A0A0A',
    panel: '#07111f',
    image: ''
  },
  phantom: {
    name: 'Graffiti Neon',
    accent: '#FF2BAA',
    secondary: '#00D4FF',
    glow: '#8B5CF6',
    bg: '#08080d',
    panel: '#15101e',
    image: ''
  },
  vaultGold: {
    name: 'Dreaded Gold',
    accent: '#FFB703',
    secondary: '#FFE600',
    glow: '#22C55E',
    bg: '#100c03',
    panel: '#1b1407',
    image: ''
  }
};

function slugifyChainId(name = '', chainId = '') {
  const label = `${name || 'chain'}-${chainId || Date.now()}`
    .toLowerCase()
    .replace(/^0x/, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `custom-${label || Date.now()}`;
}

function normalizeHexChainId(value = '') {
  const input = String(value || '').trim();
  if (!input) return '';
  if (/^0x[0-9a-f]+$/i.test(input)) return `0x${Number.parseInt(input, 16).toString(16)}`;
  if (/^\d+$/.test(input)) return `0x${Number.parseInt(input, 10).toString(16)}`;
  return '';
}

function normalizeHttpUrl(value = '') {
  const input = String(value || '').trim();
  if (!input) return '';
  try {
    const url = new URL(input);
    return url.protocol === 'https:' ? url.href.replace(/\/$/, '') : '';
  } catch {
    return '';
  }
}

function normalizeNftApiTemplate(value = '') {
  const input = String(value || '').trim().slice(0, 280);
  if (!input) return '';
  const probe = input.replace(/\{address\}/gi, '0x0000000000000000000000000000000000000000');
  try {
    const url = new URL(probe);
    return url.protocol === 'https:' ? input : '';
  } catch {
    return '';
  }
}

function colorFromChain(value = '') {
  let hash = 0;
  for (const character of String(value || 'chain')) {
    hash = ((hash << 5) - hash + character.charCodeAt(0)) | 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue} 76% 58%)`;
}

function sanitizeCustomChain(chain = {}) {
  const name = String(chain.name || '').trim().slice(0, 40);
  const symbol = String(chain.symbol || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  const chainId = normalizeHexChainId(chain.chainId);
  const rpc = normalizeHttpUrl(chain.rpc);
  if (!name || !symbol || !chainId || !rpc) return null;

  const explorer = normalizeHttpUrl(chain.explorer);
  const blockscoutApi = normalizeHttpUrl(chain.blockscoutApi);
  const nftApi = normalizeNftApiTemplate(chain.nftApi);
  const id = String(chain.id || slugifyChainId(name, chainId))
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);

  return {
    id: id || slugifyChainId(name, chainId),
    name,
    symbol,
    chainId,
    balance: 0,
    usd: 0,
    assets: 0,
    gas: `${symbol} gas`,
    health: 'Custom',
    color: chain.color || colorFromChain(`${name}-${chainId}`),
    rpc,
    explorer,
    blockscoutApi,
    nftApi
  };
}

function chainSnapshot(snapshot = {}) {
  const hidden = new Set(Array.isArray(snapshot.hiddenChainIds) ? snapshot.hiddenChainIds : []);
  const custom = (Array.isArray(snapshot.customChains) ? snapshot.customChains : [])
    .map(sanitizeCustomChain)
    .filter(Boolean);
  const seen = new Set();

  return [...defaultChains.filter(chain => !hidden.has(chain.id)), ...custom]
    .filter(chain => {
      if (seen.has(chain.id) || seen.has(chain.chainId)) return false;
      seen.add(chain.id);
      if (chain.chainId) seen.add(chain.chainId);
      return true;
    });
}

const initialCustomChains = (Array.isArray(saved.customChains) ? saved.customChains : [])
  .map(sanitizeCustomChain)
  .filter(Boolean);
const initialHiddenChainIds = Array.isArray(saved.hiddenChainIds)
  ? saved.hiddenChainIds.filter(id => defaultChains.some(chain => chain.id === id))
  : [];
let chains = chainSnapshot({ customChains: initialCustomChains, hiddenChainIds: initialHiddenChainIds });

const hardwareFilters = [
  { vendorId: 0x2c97 },
  { vendorId: 0x1209 },
  { vendorId: 0x534c }
];
const blockedAddresses = [
  '0x0000000000000000000000000000000000000000',
  '0x000000000000000000000000000000000000dead'
];
const trustedMarkets = {
  Zora: {
    domain: 'zora.co',
    recipient: '0x1111111111111111111111111111111111111111',
    chains: ['base', 'ethereum'],
    caps: { ETH: 0.35 }
  },
  Sound: {
    domain: 'sound.xyz',
    recipient: '0x2222222222222222222222222222222222222222',
    chains: ['ethereum'],
    caps: { ETH: 0.2 }
  },
  OpenSea: {
    domain: 'opensea.io',
    recipient: '0x3333333333333333333333333333333333333333',
    chains: ['polygon', 'ethereum', 'apechain'],
    caps: { POL: 150, ETH: 0.5 }
  },
  'Magic Eden': {
    domain: 'magiceden.io',
    recipient: '0x4444444444444444444444444444444444444444',
    chains: ['solana', 'bitcoin'],
    caps: { SOL: 3, BTC: 0.02 }
  },
  Livepeer: {
    domain: 'livepeer.org',
    recipient: '0x5555555555555555555555555555555555555555',
    chains: ['arbitrum'],
    caps: { ETH: 0.25 }
  },
  Foundation: {
    domain: 'foundation.app',
    recipient: '0x6666666666666666666666666666666666666666',
    chains: ['ethereum'],
    caps: { ETH: 0.4 }
  },
  'Ordinals Market': {
    domain: 'ordinals.market',
    recipient: 'bc1qdreadedwalletvault000000000000000000',
    chains: ['bitcoin'],
    caps: { BTC: 0.02 }
  },
  'Archive Index': {
    domain: 'archive.org',
    recipient: '0x7777777777777777777777777777777777777777',
    chains: ['ethereum', 'base', 'apechain', 'polygon', 'arbitrum', 'solana', 'bitcoin'],
    caps: { ETH: 0, APE: 0, POL: 0, SOL: 0, BTC: 0 }
  }
};
const securityGuard = DreadedGuard.createGuard({
  trustedSources: trustedMarkets,
  blockedAddresses
});
const securityProtocols = DreadedGuard.protocols;

const state = {
  activeChain: chains.some(chain => chain.id === saved.activeChain) ? saved.activeChain : 'apechain',
  chainFilter: chains.some(chain => chain.id === saved.chainFilter) ? saved.chainFilter : '',
  activeMedia: saved.activeMedia || '',
  filter: saved.filter || 'all',
  marketFilter: saved.marketFilter || 'all',
  search: '',
  address: '',
  walletLabel: saved.walletLabel || 'Read-only vault',
  hardware: saved.hardware || 'Ready',
  transport: saved.transport || 'USB',
  localDisconnect: Boolean(saved.localDisconnect),
  playerProfile: saved.playerProfile && playerProfiles[saved.playerProfile] ? saved.playerProfile : 'auto',
  skinId: saved.skinId === 'custom' && saved.customSkin ? 'custom' : skinPresets[saved.skinId] ? saved.skinId : 'dreaded',
  customSkin: saved.customSkin || null,
  skinNotice: '',
  mediaAssets: [],
  assetOwner: '',
  chainBalances: {},
  customChains: initialCustomChains,
  hiddenChainIds: initialHiddenChainIds,
  chainNotice: '',
  assetStatus: 'idle',
  assetMessage: 'Connect wallet to index owned media.',
  indexerSources: [],
  pinned: saved.pinned || [],
  queue: saved.queue || [],
  guardEvents: saved.guardEvents || [],
  playing: false,
  startedAt: 0,
  elapsed: saved.elapsed || 0,
  audio: null,
  animationId: null
};
let deferredInstallPrompt = null;
let guardMonitor = null;
let assetRefreshToken = 0;
const imageCache = new Map();
const metadataCache = new Map();
const emptyCover = 'assets/wallet/media-vault-empty-state-1200x800.png';
const tokenUriSelector = '0xc87b56dd';
const guardReviewResolvers = new Map();

function persist() {
  const snapshot = {
    activeChain: state.activeChain,
    chainFilter: state.chainFilter,
    activeMedia: state.activeMedia,
    filter: state.filter,
    marketFilter: state.marketFilter,
    address: state.address,
    walletLabel: state.walletLabel,
    hardware: state.hardware,
    transport: state.transport,
    localDisconnect: state.localDisconnect,
    playerProfile: state.playerProfile,
    skinId: state.skinId,
    customSkin: state.customSkin,
    customChains: state.customChains,
    hiddenChainIds: state.hiddenChainIds,
    pinned: state.pinned,
    queue: state.queue,
    guardEvents: state.guardEvents,
    elapsed: state.elapsed
  };

  try {
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
  } catch (error) {
    if (!state.customSkin?.image) throw error;
    const image = state.customSkin.image;
    state.customSkin = { ...state.customSkin, image: '' };
    snapshot.customSkin = state.customSkin;
    localStorage.setItem(storageKey, JSON.stringify(snapshot));
    state.customSkin = { ...state.customSkin, image };
    state.skinNotice = 'Palette saved locally. Background art was too large to persist.';
  }
}

function isDefaultChain(id) {
  return defaultChains.some(chain => chain.id === id);
}

function rebuildChains() {
  chains = chainSnapshot(state);
  if (!chains.some(chain => chain.id === state.activeChain)) {
    state.activeChain = chains.find(chain => chain.id === 'apechain')?.id || chains[0]?.id || '';
  }
  if (state.chainFilter && !chains.some(chain => chain.id === state.chainFilter)) {
    state.chainFilter = '';
  }
}

function activeChain() {
  return chains.find(chain => chain.id === state.activeChain) || chains[0];
}

function chainFromChainId(chainId) {
  return chains.find(chain => chain.chainId?.toLowerCase() === String(chainId || '').toLowerCase());
}

function normalizeAddress(value = '') {
  return String(value || '').toLowerCase();
}

function escapeHtml(value = '') {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function escapeAttr(value = '') {
  return escapeHtml(value).replace(/`/g, '&#96;');
}

function isEvmAddress(value = '') {
  return /^0x[a-f0-9]{40}$/i.test(String(value || ''));
}

function providerSelectedAddress() {
  const selected = window.ethereum?.selectedAddress || window.ethereum?._state?.accounts?.[0] || '';
  return isEvmAddress(selected) ? selected : '';
}

function resolveProviderAddress(accounts = []) {
  const normalizedAccounts = accounts.filter(isEvmAddress);
  const selected = providerSelectedAddress();
  if (selected && (!normalizedAccounts.length || normalizedAccounts.some(account => normalizeAddress(account) === normalizeAddress(selected)))) {
    return selected;
  }
  return normalizedAccounts[0] || selected || '';
}

async function requestCurrentProviderAddress({ forcePermission = false } = {}) {
  if (!window.ethereum) return '';

  if (forcePermission && window.ethereum.request) {
    await window.ethereum.request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }]
    }).catch(() => null);
  }

  const requested = await window.ethereum.request({ method: 'eth_requestAccounts' }).catch(() => []);
  const accounts = await window.ethereum.request({ method: 'eth_accounts' }).catch(() => requested);
  return resolveProviderAddress(accounts.length ? accounts : requested);
}

function vaultMedia() {
  return state.address && normalizeAddress(state.assetOwner) === normalizeAddress(state.address) ? state.mediaAssets : [];
}

function scopedVaultMedia() {
  const items = vaultMedia();
  return state.chainFilter ? items.filter(item => item.chain === state.chainFilter) : items;
}

function activeMedia() {
  const items = scopedVaultMedia();
  return items.find(item => item.id === state.activeMedia) || items[0] || null;
}

function syncActiveMediaToScope() {
  const items = scopedVaultMedia();
  if (!items.length) {
    state.activeMedia = '';
    return;
  }
  if (!items.some(item => item.id === state.activeMedia)) {
    state.activeMedia = items[0].id;
    state.elapsed = 0;
    state.playing = false;
  }
}

function mediaChain(item) {
  return chains.find(chain => chain.id === item?.chain) || activeChain();
}

function clamp(value, min = 0, max = 255) {
  return Math.min(max, Math.max(min, value));
}

function hexToRgb(hex) {
  const value = String(hex || '').replace('#', '').trim();
  const normalized = value.length === 3
    ? value.split('').map(character => `${character}${character}`).join('')
    : value.padEnd(6, '0').slice(0, 6);
  return {
    r: Number.parseInt(normalized.slice(0, 2), 16) || 0,
    g: Number.parseInt(normalized.slice(2, 4), 16) || 0,
    b: Number.parseInt(normalized.slice(4, 6), 16) || 0
  };
}

function rgbToHex(color) {
  return `#${[color.r, color.g, color.b].map(value => clamp(Math.round(value)).toString(16).padStart(2, '0')).join('')}`;
}

function rgbToHsl(color) {
  const r = color.r / 255;
  const g = color.g / 255;
  const b = color.b / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return { h: 0, s: 0, l };

  const delta = max - min;
  const s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let h = 0;

  if (max === r) h = (g - b) / delta + (g < b ? 6 : 0);
  if (max === g) h = (b - r) / delta + 2;
  if (max === b) h = (r - g) / delta + 4;

  return { h: h / 6, s, l };
}

function colorDistance(a, b) {
  return Math.hypot(a.r - b.r, a.g - b.g, a.b - b.b);
}

function adjustColor(hex, amount) {
  const color = hexToRgb(hex);
  return rgbToHex({
    r: color.r + (amount * 255),
    g: color.g + (amount * 255),
    b: color.b + (amount * 255)
  });
}

function activeSkin() {
  if (state.skinId === 'custom' && state.customSkin) return state.customSkin;
  return skinPresets[state.skinId] || skinPresets.dreaded;
}

function applySkin() {
  const skin = activeSkin();
  const root = document.documentElement;
  const panel = adjustColor(skin.panel, 0.02);
  const panelRgb = hexToRgb(panel);
  const accentRgb = hexToRgb(skin.accent);
  const secondaryRgb = hexToRgb(skin.secondary);
  const glowRgb = hexToRgb(skin.glow);

  root.style.setProperty('--skin-bg', skin.bg);
  root.style.setProperty('--skin-panel', skin.panel);
  root.style.setProperty('--skin-panel-2', adjustColor(skin.panel, 0.08));
  root.style.setProperty('--skin-accent', skin.accent);
  root.style.setProperty('--skin-secondary', skin.secondary);
  root.style.setProperty('--skin-glow', skin.glow);
  root.style.setProperty('--skin-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
  root.style.setProperty('--skin-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
  root.style.setProperty('--skin-glow-rgb', `${glowRgb.r}, ${glowRgb.g}, ${glowRgb.b}`);
  root.style.setProperty('--skin-panel-rgb', `${panelRgb.r}, ${panelRgb.g}, ${panelRgb.b}`);
  root.style.setProperty('--skin-image', skin.image ? `url("${skin.image}")` : 'none');
  document.body.dataset.skin = state.skinId;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', skin.accent);
}

function renderSkinControls() {
  const select = $('#skinSelect');
  if (!select) return;

  const skin = activeSkin();
  const customDisabled = state.customSkin ? '' : 'disabled';
  select.innerHTML = [
    ...Object.entries(skinPresets).map(([id, preset]) => `<option value="${id}">${preset.name}</option>`),
    `<option value="custom" ${customDisabled}>NFT Skin</option>`
  ].join('');
  select.value = state.skinId === 'custom' && !state.customSkin ? 'dreaded' : state.skinId;

  $('#skinName').textContent = skin.name;
  $('#skinNotice').textContent = state.skinNotice || (state.skinId === 'custom' ? 'NFT skin generated locally from uploaded art.' : 'Preset palette active.');
}

function choosePaletteColor(candidates, reference, fallback) {
  return candidates.find(candidate => !reference || colorDistance(candidate, reference) > 88) || fallback;
}

function sampleImagePalette(image) {
  const canvas = document.createElement('canvas');
  const size = 96;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const pixels = [];

  for (let index = 0; index < data.length; index += 16) {
    if (data[index + 3] < 150) continue;
    const color = { r: data[index], g: data[index + 1], b: data[index + 2] };
    const hsl = rgbToHsl(color);
    if (hsl.l < 0.04 || hsl.l > 0.96) continue;
    pixels.push({ ...color, ...hsl });
  }

  if (!pixels.length) {
    return {
      accent: skinPresets.dreaded.accent,
      secondary: skinPresets.dreaded.secondary,
      glow: skinPresets.dreaded.glow,
      bg: skinPresets.dreaded.bg,
      panel: skinPresets.dreaded.panel
    };
  }

  const vivid = pixels
    .filter(pixel => pixel.s > 0.24 && pixel.l > 0.16 && pixel.l < 0.84)
    .sort((a, b) => (b.s * 1.4 + b.l) - (a.s * 1.4 + a.l));
  const sortedPixels = [...pixels].sort((a, b) => (b.s + b.l) - (a.s + a.l));
  const dark = [...pixels].sort((a, b) => a.l - b.l)[0];
  const accent = vivid[0] || sortedPixels[0];
  const secondary = choosePaletteColor(vivid.slice(1), accent, sortedPixels[1] || accent);
  const glowCandidates = vivid.filter(pixel => pixel.l > 0.42).sort((a, b) => b.l - a.l);
  const glow = choosePaletteColor(glowCandidates, secondary, vivid[2] || accent);

  return {
    accent: rgbToHex(accent),
    secondary: rgbToHex(secondary),
    glow: rgbToHex(glow),
    bg: adjustColor(rgbToHex(dark), -0.08),
    panel: adjustColor(rgbToHex(dark), 0.04)
  };
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', reject);
    reader.readAsDataURL(file);
  });
}

function loadImage(dataUrl) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', reject);
    image.src = dataUrl;
  });
}

function createSkinImage(image) {
  const maxSide = 640;
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth || image.width, image.naturalHeight || image.height));
  const width = Math.max(1, Math.round((image.naturalWidth || image.width) * scale));
  const height = Math.max(1, Math.round((image.naturalHeight || image.height) * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL('image/jpeg', 0.82);
}

async function generateSkinFromFile(file) {
  if (!file?.type?.startsWith('image/')) {
    state.skinNotice = 'Choose an image file to generate a skin.';
    renderSkinControls();
    return;
  }

  try {
    state.skinNotice = 'Generating skin from uploaded NFT art...';
    renderSkinControls();
    const dataUrl = await readFileAsDataUrl(file);
    const image = await loadImage(dataUrl);
    const palette = sampleImagePalette(image);
    state.customSkin = {
      name: 'NFT Skin',
      ...palette,
      image: createSkinImage(image),
      sourceName: file.name
    };
    state.skinId = 'custom';
    state.skinNotice = `NFT skin generated from ${file.name}.`;
    persist();
    renderAll();
  } catch (error) {
    state.skinNotice = 'Could not generate a skin from that image.';
    renderSkinControls();
  }
}

function setSkin(id) {
  if (id === 'custom' && !state.customSkin) {
    state.skinNotice = 'Upload NFT art first to unlock the NFT skin.';
    renderSkinControls();
    return;
  }

  state.skinId = (skinPresets[id] || id === 'custom') ? id : 'dreaded';
  state.skinNotice = state.skinId === 'custom' ? 'NFT skin active.' : `${activeSkin().name} palette active.`;
  persist();
  renderAll();
}

function shortAddress(address) {
  if (!address) return 'Read-only vault';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function formatTime(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(seconds / 60);
  const secs = String(seconds % 60).padStart(2, '0');
  return `${mins}:${secs}`;
}

function titleCase(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatNativeBalance(value) {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return '0';
  if (number === 0) return '0';
  if (number < 0.0001) return '<0.0001';
  return number.toLocaleString(undefined, { maximumFractionDigits: number < 1 ? 5 : 4 });
}

function weiHexToEth(hex) {
  if (typeof hex !== 'string' || !/^0x[0-9a-f]+$/i.test(hex)) return 0;
  const wei = BigInt(hex);
  const integer = wei / 1000000000000000000n;
  const fraction = wei % 1000000000000000000n;
  return Number(`${integer}.${fraction.toString().padStart(18, '0').slice(0, 8)}`);
}

async function rpcRequest(chain, method, params) {
  if (!chain.rpc) throw new Error(`${chain.name} RPC is not configured`);
  const response = await fetch(chain.rpc, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params })
  });
  if (!response.ok) throw new Error(`${chain.name} RPC returned ${response.status}`);
  const payload = await response.json();
  if (payload.error) throw new Error(payload.error.message || `${chain.name} RPC error`);
  return payload.result;
}

async function loadNativeBalances(address) {
  const entries = await Promise.all(chains.map(async chain => {
    if (!chain.rpc || !chain.chainId) {
      return [chain.id, { status: 'unsupported', balance: 0, symbol: chain.symbol }];
    }

    try {
      const result = await rpcRequest(chain, 'eth_getBalance', [address, 'latest']);
      return [chain.id, { status: 'ready', balance: weiHexToEth(result), symbol: chain.symbol }];
    } catch (error) {
      return [chain.id, { status: 'error', balance: 0, symbol: chain.symbol, message: error.message }];
    }
  }));

  return Object.fromEntries(entries);
}

function normalizeIpfs(url = '') {
  if (!url) return '';
  if (url.startsWith('ipfs://ipfs/')) return `https://ipfs.io/ipfs/${url.slice(12)}`;
  if (url.startsWith('ipfs://')) return `https://ipfs.io/ipfs/${url.slice(7)}`;
  if (url.startsWith('ar://')) return `https://arweave.net/${url.slice(5)}`;
  return url;
}

function safeAssetUrl(url = '', fallback = '') {
  const normalized = normalizeIpfs(String(url || '').trim());
  if (!normalized) return fallback;
  try {
    const parsed = new URL(normalized, window.location.href);
    if (['http:', 'https:', 'data:', 'blob:'].includes(parsed.protocol)) return normalized;
  } catch {
    return fallback;
  }
  return fallback;
}

function firstString(...values) {
  return values.flat().find(value => typeof value === 'string' && value.trim()) || '';
}

function nftFallbackCover() {
  return emptyCover;
}

function isFallbackCover(url = '') {
  return !url || String(url).includes(emptyCover);
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

async function fetchTokenMetadata(uri = '', tokenId = '') {
  const normalized = normalizeIpfs(uri);
  if (!normalized) return {};
  if (normalized.startsWith('data:application/json;base64,')) {
    try {
      return JSON.parse(atob(normalized.slice('data:application/json;base64,'.length)));
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

  const safeUrl = safeAssetUrl(normalized, '');
  if (!safeUrl) return {};
  try {
    return await fetchJsonWithTimeout(safeUrl, { timeoutMs: 7000 });
  } catch {
    const inferred = metadataImageFromKnownUri(normalized, tokenId);
    return inferred ? { image: inferred } : {};
  }
}

async function tokenUriForAsset(asset = {}) {
  const chain = chains.find(item => item.id === asset.chain);
  const tokenHex = uint256Hex(asset.tokenId);
  if (!chain?.rpc || !asset.contract || asset.contract === 'unknown' || !tokenHex) return '';
  const cacheKey = `${chain.id}:${asset.contract}:${asset.tokenId}:tokenUri`;
  if (metadataCache.has(cacheKey)) return metadataCache.get(cacheKey);
  try {
    const result = await rpcRequest(chain, 'eth_call', [{ to: asset.contract, data: `${tokenUriSelector}${tokenHex}` }, 'latest']);
    const uri = decodeEthString(result);
    metadataCache.set(cacheKey, uri);
    return uri;
  } catch {
    metadataCache.set(cacheKey, '');
    return '';
  }
}

async function enrichAssetWithTokenMetadata(asset = {}) {
  if (!isFallbackCover(asset.cover) || !asset.contract || !asset.tokenId) return asset;
  const cacheKey = `${asset.chain}:${asset.contract}:${asset.tokenId}:metadata`;
  let metadata = metadataCache.get(cacheKey);
  if (!metadata) {
    const uri = await tokenUriForAsset(asset);
    metadata = await fetchTokenMetadata(uri, asset.tokenId);
    metadataCache.set(cacheKey, metadata);
  }

  const image = safeAssetUrl(firstString(metadata.image, metadata.image_url, metadata.imageUrl), '');
  const mediaUrl = safeAssetUrl(firstString(metadata.animation_url, metadata.animationUrl, metadata.media_url, metadata.mediaUrl, image), '');
  if (!image && !mediaUrl) return asset;

  const type = inferMediaType({ ...metadata, image, media: mediaUrl });
  return {
    ...asset,
    title: metadata.name || asset.title,
    type,
    cover: image || mediaUrl || asset.cover,
    mediaUrl: mediaUrl || image || asset.mediaUrl,
    runtime: type === 'photo' ? 'Owned image' : 'Owned media',
    format: type === 'movie' ? '8K capable stream' : type === 'music' ? 'Wallet audio' : 'High-res image'
  };
}

async function enrichAssetsWithTokenMetadata(assets = []) {
  const pending = assets.filter(asset => isFallbackCover(asset.cover)).slice(0, 48);
  if (!pending.length) return assets;
  const enriched = await Promise.all(pending.map(enrichAssetWithTokenMetadata));
  const enrichedById = new Map(enriched.map(asset => [asset.id, asset]));
  return assets.map(asset => enrichedById.get(asset.id) || asset);
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

function addressUrl(template = '', address = '') {
  return String(template || '').replace(/\{address\}/gi, encodeURIComponent(address));
}

function indexerSources() {
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

    if (chain.nftApi) {
      sources.push({
        name: `${chain.name} Custom NFT API`,
        chain: chain.id,
        kind: 'generic',
        timeoutMs: 10000,
        url: address => addressUrl(chain.nftApi, address)
      });
    }
  }

  return sources;
}

async function fetchJsonWithTimeout(url, { timeoutMs = 9000, headers = {} } = {}) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: { accept: 'application/json', ...headers },
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`${response.status}`);
    return response.json();
  } finally {
    window.clearTimeout(timer);
  }
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

  return {
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
    format: type === 'movie' ? '8K capable stream' : type === 'music' ? 'Wallet audio' : 'High-res image',
    cover: image || nftFallbackCover(),
    mediaUrl,
    contract,
    tokenId,
    colors: ['#10151d', '#d9a441', '#45b6bd']
  };
}

function blockscoutNftToMedia(row = {}, source) {
  const token = row.token || {};
  const metadata = row.metadata && typeof row.metadata === 'object' ? row.metadata : {};
  const chain = source.chain;
  const tokenId = row.id || row.token_id || row.tokenId || metadata.token_id || 'unknown';
  const contract = token.address_hash || row.contract_address_hash || row.contract || 'unknown';
  const image = safeAssetUrl(firstString(
    row.image_url,
    row.imageUrl,
    metadata.image,
    row.thumbnails?.large,
    row.thumbnails?.small,
    token.icon_url
  ));
  const mediaUrl = safeAssetUrl(firstString(
    row.animation_url,
    row.media_url,
    row.mediaUrl,
    metadata.animation_url,
    metadata.animationUrl,
    metadata.image,
    row.image_url
  ));
  const type = inferMediaType({
    ...metadata,
    image: image || metadata.image,
    media: mediaUrl || row.media_url,
    animation_url: row.animation_url || metadata.animation_url,
    mimeType: row.media_type || metadata.mimeType
  });
  const collectionName = token.name || token.symbol || 'Unknown collection';

  return {
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
    format: type === 'movie' ? '8K capable stream' : type === 'music' ? 'Wallet audio' : 'High-res image',
    cover: image || nftFallbackCover(),
    mediaUrl,
    contract,
    tokenId,
    colors: ['#0d1b2a', '#ffb703', '#00d4ff']
  };
}

function blockscoutTokenToMedia(row = {}, source) {
  const token = row.token || {};
  const instance = row.token_instance || {};
  const metadata = instance.metadata && typeof instance.metadata === 'object' ? instance.metadata : {};
  const chain = source.chain;
  const tokenId = row.token_id || instance.id || 'collection';
  const contract = token.address_hash || row.address_hash || 'unknown';
  const image = safeAssetUrl(firstString(
    instance.image_url,
    instance.imageUrl,
    metadata.image,
    token.icon_url
  ));
  const mediaUrl = safeAssetUrl(firstString(
    instance.animation_url,
    instance.media_url,
    metadata.animation_url,
    metadata.image,
    instance.image_url
  ));
  const type = inferMediaType({
    ...metadata,
    image,
    media: mediaUrl,
    animation_url: instance.animation_url || metadata.animation_url
  });
  const collectionName = token.name || token.symbol || 'Unknown collection';

  return {
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
    format: type === 'movie' ? '8K capable stream' : type === 'music' ? 'Wallet audio' : 'High-res image',
    cover: image || nftFallbackCover(),
    mediaUrl,
    contract,
    tokenId,
    colors: ['#0d1b2a', '#ffb703', '#22c55e']
  };
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

  const rows = Array.isArray(payload.tokens)
    ? payload.tokens
    : Array.isArray(payload.nfts)
      ? payload.nfts
      : Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload)
          ? payload
          : [];

  return rows.map(row => {
    if (row.image_url || row.media_url || row.token_type) return blockscoutNftToMedia(row, source);
    if (row.address_hash || row.token_instance) return blockscoutTokenToMedia(row, source);
    if (row.token || row.collection) return reservoirTokenToMedia(row, source);
    return reservoirTokenToMedia(row, source);
  });
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

    const existingHasArt = existing.cover && !isFallbackCover(existing.cover);
    const nextHasArt = asset.cover && !isFallbackCover(asset.cover);
    if (!existingHasArt && nextHasArt) map.set(asset.id, asset);
  }
  return [...map.values()];
}

async function loadNftMedia(address) {
  const sources = indexerSources();
  const results = await Promise.all(sources.map(async source => {
    try {
      const payload = await fetchJsonWithTimeout(source.url(address), { timeoutMs: source.timeoutMs });
      const assets = sourceRowsToMedia(payload, source);
      return { source: source.name, ok: true, assets };
    } catch (error) {
      return { source: source.name, ok: false, error: error.name === 'AbortError' ? 'timeout' : error.message, assets: [] };
    }
  }));
  const assets = await enrichAssetsWithTokenMetadata(dedupeAssets(results.flatMap(result => result.assets)));
  const sourceHealth = results.map(({ source, ok, error }) => ({ source, ok, error }));
  return { assets, sources: sourceHealth };
}

async function refreshWalletAssets() {
  if (!state.address) return;
  const owner = state.address;
  const refreshToken = assetRefreshToken += 1;

  state.assetStatus = 'loading';
  state.assetMessage = 'Indexing wallet balances and owned media...';
  state.mediaAssets = [];
  state.assetOwner = owner;
  renderAll();

  const [balances, indexed] = await Promise.all([
    loadNativeBalances(owner),
    loadNftMedia(owner)
  ]);

  if (refreshToken !== assetRefreshToken || normalizeAddress(state.address) !== normalizeAddress(owner)) return;

  state.chainBalances = balances;
  state.mediaAssets = indexed.assets;
  state.assetOwner = owner;
  state.indexerSources = indexed.sources;
  state.assetStatus = indexed.assets.length ? 'ready' : 'empty';
  const onlineSources = indexed.sources.filter(source => source.ok).length;
  state.assetMessage = indexed.assets.length
    ? `${indexed.assets.length} owned media assets indexed.`
    : onlineSources
      ? `No owned media NFTs returned by ${onlineSources} address-based marketplace routes. Native balances are still shown.`
      : 'Marketplace and explorer routes did not return NFT metadata. Native balances are still shown.';
  syncActiveMediaToScope();
  state.elapsed = 0;
  persist();
  renderAll();
}

function marketFromUrl(url) {
  return markets.find(market => market.url === url);
}

function auditTransaction(intent) {
  return securityGuard.audit(intent, { walletAddress: state.address });
}

function statusForSecurity(security) {
  return securityGuard.statusFor(security);
}

function buildTransaction(intent) {
  return securityGuard.buildAction(intent, { transport: state.transport }, { walletAddress: state.address });
}

function guardIntentDefaults() {
  const chain = activeChain();
  return {
    appName: 'Dreaded Apes Wallet',
    source: 'Dreaded Apes Wallet',
    chainId: chain.id,
    symbol: chain.symbol,
    origin: window.location.href
  };
}

function warningTitle(security) {
  if (security.decision === 'block') return 'Malicious transaction blocked';
  if (security.decision === 'hold') return 'Transaction warning';
  return 'Guard check passed';
}

function requestTargetLabel(intent = {}, request = {}) {
  const params = Array.isArray(request.params) ? request.params : [];
  if (intent.providerMethod === 'wallet_switchEthereumChain' || intent.method === 'wallet_switchEthereumChain') {
    const chainId = params[0]?.chainId || intent.chainId || '';
    const chain = chainFromChainId(chainId);
    return chain ? `${chain.name} (${chain.chainId})` : chainId || 'Unknown network';
  }
  if (intent.providerMethod === 'wallet_addEthereumChain' || intent.method === 'wallet_addEthereumChain') {
    const chainId = params[0]?.chainId || intent.chainId || '';
    const chainName = params[0]?.chainName || chainFromChainId(chainId)?.name || 'Network';
    return `${chainName} (${chainId || 'unknown chain'})`;
  }
  return intent.recipient || intent.spender || intent.assetRecipient || 'No recipient';
}

function compactOrigin(origin = '') {
  try {
    const url = new URL(origin);
    return url.host || origin;
  } catch {
    return origin || 'Local wallet';
  }
}

function createGuardWarning(event) {
  const intent = event.intent || {};
  const security = event.security || auditTransaction(intent);
  const method = intent.providerMethod || intent.method || 'transaction';
  const findings = security.findings.filter(finding => finding.level !== 'info');
  const request = event.request || {};
  const requester = intent.sender || state.address || '';
  const target = requestTargetLabel(intent, request);

  return {
    id: `${security.checkedAt}-${method}-${security.score}`,
    title: warningTitle(security),
    decision: security.decision,
    score: security.score,
    method,
    requester,
    target,
    origin: intent.origin || 'Local wallet action',
    originHost: compactOrigin(intent.origin || window.location.href),
    checkedAt: security.checkedAt,
    reviewStatus: security.decision === 'hold' ? 'pending' : security.decision,
    findings: findings.length ? findings : security.findings
  };
}

function recordGuardWarning(event) {
  const warning = createGuardWarning(event);
  state.guardEvents = [
    warning,
    ...state.guardEvents.filter(item => item.id !== warning.id)
  ].slice(0, 6);

  if (warning.decision === 'block') {
    state.hardware = 'Blocked by guard';
  } else if (warning.decision === 'hold') {
    state.hardware = 'Guard warning';
  }

  persist();
  renderGuardMonitor();
  renderChains();
  renderSecurity();
}

function requestGuardReview(event) {
  const warning = createGuardWarning(event);
  state.guardEvents = [
    warning,
    ...state.guardEvents.filter(item => item.id !== warning.id)
  ].slice(0, 6);
  state.hardware = 'Guard review';
  persist();
  renderGuardMonitor();
  renderChains();
  return new Promise(resolve => {
    guardReviewResolvers.set(warning.id, resolve);
  });
}

function resolveGuardReview(id, approved) {
  const resolver = guardReviewResolvers.get(id);
  if (resolver) {
    resolver(Boolean(approved));
    guardReviewResolvers.delete(id);
  }
  state.guardEvents = state.guardEvents.filter(event => event.id !== id);
  state.hardware = approved ? 'Approved by guard' : 'Denied by guard';
  persist();
  renderGuardMonitor();
  renderChains();
  renderSecurity();
}

function startGuardMonitor() {
  if (!DreadedGuard.createBackgroundMonitor) return;

  if (!guardMonitor) {
    guardMonitor = DreadedGuard.createBackgroundMonitor({
      guard: securityGuard,
      provider: window.ethereum,
      getContext: () => ({ walletAddress: state.address }),
      getIntentDefaults: guardIntentDefaults,
      blockDecisions: ['block'],
      onWarning: recordGuardWarning,
      onReview: requestGuardReview
    });
    return;
  }

  if (window.ethereum && !guardMonitor.isRunning()) {
    guardMonitor.install(window.ethereum);
  }
}

function monitorWalletAction(tx) {
  if (!guardMonitor) return tx;
  const event = guardMonitor.audit(tx, { type: 'wallet-action' });
  return {
    ...tx,
    security: event.security,
    status: statusForSecurity(event.security)
  };
}

function enqueueTransaction(tx) {
  const guarded = monitorWalletAction(tx);
  state.queue = [guarded, ...state.queue].slice(0, 8);
  if (guarded.security.decision === 'block') {
    state.hardware = 'Blocked by guard';
  } else if (guarded.security.decision === 'hold') {
    state.hardware = 'Guard warning';
  } else {
    state.hardware = guarded.readOnly ? state.hardware : 'Review needed';
  }
}

function ensureSecurity(tx) {
  if (tx.security) return tx;
  const registry = trustedMarkets[tx.market];
  const fallback = {
    ...tx,
    chainId: chains.find(chain => chain.name === tx.chain)?.id || state.activeChain,
    symbol: activeChain().symbol,
    amountValue: Number.parseFloat(tx.amount) || 0,
    recipient: registry?.recipient || '',
    spender: registry?.recipient || '',
    method: tx.amount === 'Read-only' ? 'openMarket' : 'collectMedia',
    approval: tx.amount === 'Read-only' ? 'none' : 'exact',
    origin: marketFromUrl(tx.origin)?.url || '',
    readOnly: tx.amount === 'Read-only'
  };
  const security = auditTransaction(fallback);
  return { ...fallback, status: statusForSecurity(security), security };
}

function renderChains() {
  const ownedMedia = vaultMedia();
  const scopedMedia = scopedVaultMedia();
  const filteredChain = state.chainFilter ? chains.find(chain => chain.id === state.chainFilter) : null;
  const readyBalances = Object.values(state.chainBalances).filter(item => item.status === 'ready');
  $('#portfolioValue').textContent = state.address ? `${readyBalances.length || 0} chains` : 'Connect wallet';
  $('#walletAddress').textContent = state.address ? shortAddress(state.address) : state.walletLabel;
  $('#chainCount').textContent = state.address ? `${scopedMedia.length} media` : '0 indexed';
  $('#networkStatus').textContent = state.address
    ? `${shortAddress(state.address)} ${filteredChain ? `viewing ${filteredChain.name}` : 'viewing all chains'}`
    : 'Wallet offline';
  $('#hardwareState').textContent = state.hardware;
  $('#transportMode').textContent = state.transport;
  const connectButton = $('#connectWallet');
  connectButton.textContent = state.address ? 'Connected' : 'Connect Wallet';
  connectButton.classList.toggle('connected', Boolean(state.address));
  const disconnectButton = $('#disconnectWallet');
  if (disconnectButton) disconnectButton.hidden = !state.address;

  $('#chainList').innerHTML = chains.map(chain => `
    <div class="chain-row">
      <button class="chain-button ${chain.id === state.chainFilter ? 'active' : ''}" type="button" data-chain="${escapeAttr(chain.id)}" aria-pressed="${chain.id === state.chainFilter ? 'true' : 'false'}" title="${chain.id === state.chainFilter ? 'Show all chains' : `Show ${escapeAttr(chain.name)} media only`}" style="--chain-color: ${escapeAttr(chain.color)}">
        <span class="chain-dot" aria-hidden="true"></span>
        <span>
          <span class="chain-name">${escapeHtml(chain.name)}</span>
          <span class="chain-symbol">${state.address ? `${formatNativeBalance(state.chainBalances[chain.id]?.balance)} ${escapeHtml(chain.symbol)}` : 'Connect wallet'} - ${escapeHtml(state.chainBalances[chain.id]?.status || 'idle')}</span>
        </span>
        <span>
          <span class="chain-value">${state.address ? (state.chainBalances[chain.id]?.status === 'error' ? 'Unavailable' : 'Native') : 'Offline'}</span>
          <span class="chain-assets">${ownedMedia.filter(item => item.chain === chain.id).length} media</span>
        </span>
      </button>
      <button class="chain-remove" type="button" data-remove-chain="${escapeAttr(chain.id)}" aria-label="${isDefaultChain(chain.id) ? 'Hide' : 'Remove'} ${escapeAttr(chain.name)}" ${chains.length <= 1 ? 'disabled' : ''}>${isDefaultChain(chain.id) ? 'Hide' : 'Del'}</button>
    </div>
  `).join('');

  $$('.chain-button').forEach(button => {
    button.addEventListener('click', () => selectChain(button.dataset.chain));
  });

  $$('[data-remove-chain]').forEach(button => {
    button.addEventListener('click', () => removeChain(button.dataset.removeChain));
  });

  const notice = $('#chainNotice');
  if (notice) notice.textContent = state.chainNotice || 'Use {address} in custom NFT APIs.';
}

function renderFilters() {
  const filters = ['all', 'movie', 'music', 'photo'];
  $('#typeFilters').innerHTML = filters.map(filter => `
    <button class="filter-button ${state.filter === filter ? 'active' : ''}" type="button" data-filter="${filter}">
      ${filter === 'all' ? 'All media' : `${titleCase(filter)}s`}
    </button>
  `).join('');

  $$('.filter-button').forEach(button => {
    button.addEventListener('click', () => {
      state.filter = button.dataset.filter;
      persist();
      renderFilters();
      renderMediaGrid();
    });
  });
}

function filteredMedia() {
  const query = state.search.trim().toLowerCase();
  return scopedVaultMedia().filter(item => {
    const matchesType = state.filter === 'all' || item.type === state.filter;
    const haystack = [item.title, item.creator, item.type, item.market, mediaChain(item).name, item.token].join(' ').toLowerCase();
    return matchesType && (!query || haystack.includes(query));
  });
}

function renderMediaGrid() {
  const items = filteredMedia();
  const filteredChain = state.chainFilter ? chains.find(chain => chain.id === state.chainFilter) : null;
  if ($('#libraryScope')) $('#libraryScope').textContent = filteredChain ? `${filteredChain.name} Vault` : 'Media Vault';
  if ($('#libraryTitle')) $('#libraryTitle').textContent = filteredChain ? `${filteredChain.name} NFTs` : 'Movies, Music, Photos';
  const emptyMessage = !state.address
    ? 'Connect wallet to index owned movies, music, photos, and NFT media.'
    : state.assetStatus === 'loading'
      ? state.assetMessage
      : filteredChain
        ? `No owned media NFTs found on ${filteredChain.name}. Click ${filteredChain.name} again to show all chains.`
      : state.assetMessage || 'No owned media NFTs were returned by the configured indexers.';
  $('#mediaGrid').innerHTML = items.map(item => {
    const chain = mediaChain(item);
    const pinned = state.pinned.includes(item.id);
    return `
      <article class="media-card ${item.id === state.activeMedia ? 'active' : ''}">
        <button class="media-art-button" type="button" data-play="${escapeAttr(item.id)}" aria-label="Load ${escapeAttr(item.title)}">
          <img class="media-thumb" src="${escapeAttr(safeAssetUrl(item.cover, 'assets/wallet/media-vault-empty-state-1200x800.png'))}" alt="" aria-hidden="true" loading="lazy" />
        </button>
        <div class="media-body">
          <div class="media-row">
            <h3 class="media-title">${escapeHtml(item.title)}</h3>
            <span class="media-price">Owned</span>
          </div>
          <div class="media-meta">${escapeHtml(item.creator)} - ${escapeHtml(chain.name)} - ${escapeHtml(item.market)}</div>
          <div class="mini-actions">
            <button class="ghost-button" type="button" data-play="${escapeAttr(item.id)}">Load</button>
            <button class="ghost-button" type="button" data-pin="${escapeAttr(item.id)}">${pinned ? 'Pinned' : 'Pin'}</button>
          </div>
        </div>
      </article>
    `;
  }).join('') || `<div class="empty-state">${escapeHtml(emptyMessage)}</div>`;

  $$('[data-play]').forEach(button => {
    button.addEventListener('click', () => {
      loadMedia(button.dataset.play);
    });
  });

  $$('[data-pin]').forEach(button => {
    button.addEventListener('click', () => {
      togglePinned(button.dataset.pin);
    });
  });
}

function renderPlayer() {
  const item = activeMedia();
  const canvas = $('#playerCanvas');
  const playerImage = $('#playerImage');
  configurePlayerCanvas(canvas);

  if (!item) {
    if (playerImage) {
      playerImage.hidden = true;
      playerImage.removeAttribute('src');
      playerImage.removeAttribute('data-natural-size');
    }
    if (canvas) canvas.hidden = false;
    $('#activeMediaType').textContent = state.address ? 'Vault' : 'Offline';
    $('#activeMediaChain').textContent = activeChain().name;
    $('#activeMarket').textContent = state.address ? 'Wallet indexed' : 'Wallet required';
    $('#activeTitle').textContent = state.address ? 'No media selected' : 'Connect wallet';
    $('#activeCreator').textContent = state.address ? state.assetMessage : 'Owned assets will appear after connection.';
    $('#durationTime').textContent = '0:00';
    $('#elapsedTime').textContent = '0:00';
    $('#progress').value = '0';
    $('#playPause').textContent = 'Play';
    $('#pinMedia').textContent = 'Vault';
    $('#trackMeta').innerHTML = [
      ['Player', playerProfiles[state.playerProfile].label],
      ['Max output', '7680 x 4320'],
      ['Source', state.assetStatus === 'loading' ? 'Indexing' : 'None'],
      ['Security', 'Guard active']
    ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');
    drawEmptyPlayer(canvas);
    renderMediaGrid();
    return;
  }

  const chain = mediaChain(item);
  const imageUrl = item.type === 'photo'
    ? safeAssetUrl(item.mediaUrl || item.cover, '')
    : safeAssetUrl(item.cover, '');
  if (playerImage && imageUrl) {
    playerImage.hidden = false;
    playerImage.alt = item.title;
    playerImage.onload = () => {
      playerImage.dataset.naturalSize = `${playerImage.naturalWidth}x${playerImage.naturalHeight}`;
    };
    playerImage.onerror = () => {
      playerImage.hidden = true;
      if (canvas) canvas.hidden = false;
    };
    if (playerImage.getAttribute('src') !== imageUrl) {
      playerImage.removeAttribute('data-natural-size');
      playerImage.src = imageUrl;
    }
    drawCover(canvas, item, state.elapsed, false);
    if (canvas) canvas.hidden = true;
  } else {
    if (playerImage) {
      playerImage.hidden = true;
      playerImage.removeAttribute('src');
      playerImage.removeAttribute('data-natural-size');
    }
    if (canvas) canvas.hidden = false;
  }
  $('#activeMediaType').textContent = titleCase(item.type);
  $('#activeMediaChain').textContent = chain.name;
  $('#activeMarket').textContent = item.market;
  $('#activeTitle').textContent = item.title;
  $('#activeCreator').textContent = item.creator;
  $('#durationTime').textContent = formatTime(item.duration);
  $('#elapsedTime').textContent = formatTime(state.elapsed);
  $('#progress').value = String(Math.round((state.elapsed / item.duration) * 1000) || 0);
  $('#playPause').textContent = state.playing ? 'Pause' : 'Play';
  $('#pinMedia').textContent = state.pinned.includes(item.id) ? 'Vaulted' : 'Vault';

  $('#trackMeta').innerHTML = [
    ['Vault ID', item.token],
    ['Format', item.format],
    ['Player', playerProfiles[state.playerProfile].label],
    ['Network', `${chain.name} - ${state.chainBalances[chain.id]?.status || 'indexed'}`]
  ].map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`).join('');

  if (!imageUrl) drawCover(canvas, item, state.elapsed, false);
  renderMediaGrid();
}

function renderMarkets() {
  if (!state.address) {
    $('#marketList').innerHTML = '<div class="empty-state">Connect wallet to activate NFT and media indexers.</div>';
    return;
  }

  const sourceRows = state.indexerSources.length
    ? state.indexerSources
    : indexerSources().map(source => ({ source: source.name, ok: state.assetStatus === 'loading', error: state.assetStatus === 'loading' ? 'Indexing' : 'Pending' }));

  $('#marketList').innerHTML = sourceRows.map(source => `
    <article class="market-card indexer-card">
      <div class="market-card-header">
        <div>
          <div class="market-name">${escapeHtml(source.source)}</div>
          <div class="market-meta">Wallet media indexer</div>
        </div>
        <span class="pill ${source.ok ? '' : 'hold'}">${source.ok ? 'Online' : 'Limited'}</span>
      </div>
      <div class="market-stats">
        <div><span>Status</span><strong>${source.ok ? 'Synced' : 'Unavailable'}</strong></div>
        <div><span>Mode</span><strong>Read-only</strong></div>
        <div><span>Assets</span><strong>${vaultMedia().filter(item => item.market === source.source).length}</strong></div>
      </div>
      <div class="empty-state compact">${source.ok ? 'Indexer returned wallet-owned media metadata.' : `Indexer did not return metadata${source.error ? ` (${escapeHtml(source.error)})` : ''}.`}</div>
    </article>
  `).join('');
  return;

  const items = markets.filter(market => state.marketFilter === 'all' || market.category === state.marketFilter);
  $('#marketList').innerHTML = items.map(market => `
    <article class="market-card">
      <img class="market-art" src="${market.art}" alt="" aria-hidden="true" loading="lazy" />
      <div class="market-card-header">
        <div>
          <div class="market-name">${market.name}</div>
          <div class="market-meta">${titleCase(market.category)} - ${market.chain}</div>
        </div>
        <span class="pill">${market.speed}</span>
      </div>
      <div class="market-stats">
        <div><span>Access</span><strong>${market.access}</strong></div>
        <div><span>Catalog</span><strong>${market.catalog}</strong></div>
        <div><span>Network</span><strong>${market.chain}</strong></div>
      </div>
      <div class="market-actions">
        <a href="${market.url}" target="_blank" rel="noreferrer">Visit</a>
        <button class="ghost-button" type="button" data-market-route="${market.name}">Preview</button>
      </div>
    </article>
  `).join('');

  $$('[data-market-route]').forEach(button => {
    button.addEventListener('click', () => {
      const target = vaultMedia().find(item => item.market === button.dataset.marketRoute);
      if (target) loadMedia(target.id);
      queueRoute(button.dataset.marketRoute);
    });
  });
}

function renderSecurity() {
  state.queue = state.queue.map(ensureSecurity);
  const blocked = state.queue.filter(tx => tx.security.decision === 'block').length;
  const held = state.queue.filter(tx => tx.security.decision === 'hold').length;
  const clean = state.queue.filter(tx => tx.security.decision === 'allow').length;
  const posture = blocked ? 'Blocked' : held ? 'Holding' : 'Clean';

  $('#securitySummary').innerHTML = `
    <div><span>Guard</span><strong class="${blocked ? 'risk-critical' : held ? 'risk-high' : 'is-green'}">${posture}</strong></div>
    <div><span>Blocked</span><strong>${blocked}</strong></div>
    <div><span>Held</span><strong>${held}</strong></div>
    <div><span>Clean</span><strong>${clean}</strong></div>
  `;

  $('#securityProtocols').innerHTML = securityProtocols.map(protocol => `
    <div class="protocol-row">
      <span>${protocol.name}</span>
      <strong>${protocol.status}</strong>
      <small>${protocol.detail}</small>
    </div>
  `).join('');
}

function renderGuardMonitor() {
  const panel = $('#guardMonitor');
  if (!panel) return;

  const providerProtected = guardMonitor?.isRunning();
  const status = providerProtected ? 'Provider protected' : window.ethereum ? 'Local guard active' : 'Local guard active';
  const latest = state.guardEvents.slice(0, 2);

  panel.innerHTML = `
    <div class="guard-monitor-header">
      <div>
        <span>Background Guard</span>
        <strong>${status}</strong>
      </div>
      <button class="ghost-button" id="clearGuardEvents" type="button" ${state.guardEvents.length ? '' : 'disabled'}>Clear Warnings</button>
    </div>
    <div class="guard-warning-list">
      ${latest.map(event => `
        <article class="guard-warning ${event.decision}">
          <div class="guard-warning-top">
            <div>
              <strong>${escapeHtml(event.title)}</strong>
              <span>${escapeHtml(event.method)} - score ${event.score}</span>
            </div>
            <span class="pill ${event.decision}">${event.reviewStatus === 'pending' ? 'Review' : escapeHtml(event.decision)}</span>
          </div>
          <div class="guard-warning-facts">
            <div><span>Requester</span><strong class="guard-address">${escapeHtml(event.requester || 'Unknown wallet')}</strong></div>
            <div><span>Target</span><strong>${escapeHtml(event.target || 'Unknown target')}</strong></div>
            <div><span>Origin</span><strong>${escapeHtml(event.originHost || event.origin)}</strong></div>
          </div>
          <ul>
            ${event.findings.slice(0, 2).map(finding => `<li>${escapeHtml(finding.label)}</li>`).join('')}
          </ul>
          ${event.reviewStatus === 'pending' ? `
            <div class="guard-review-actions">
              <button class="ghost-button approve" type="button" data-approve-guard="${escapeAttr(event.id)}">Approve</button>
              <button class="ghost-button deny" type="button" data-deny-guard="${escapeAttr(event.id)}">Deny</button>
            </div>
          ` : ''}
        </article>
      `).join('') || '<div class="empty-state compact">No background warnings.</div>'}
    </div>
  `;

  $('#clearGuardEvents')?.addEventListener('click', () => {
    state.guardEvents.forEach(event => {
      const resolver = guardReviewResolvers.get(event.id);
      if (resolver) {
        resolver(false);
        guardReviewResolvers.delete(event.id);
      }
    });
    state.guardEvents = [];
    persist();
    renderGuardMonitor();
  });

  $$('[data-approve-guard]').forEach(button => {
    button.addEventListener('click', () => resolveGuardReview(button.dataset.approveGuard, true));
  });

  $$('[data-deny-guard]').forEach(button => {
    button.addEventListener('click', () => resolveGuardReview(button.dataset.denyGuard, false));
  });
}

function renderQueue() {
  state.queue = state.queue.map(ensureSecurity);
  $('#txQueue').innerHTML = state.queue.map(tx => `
    <article class="tx-card ${tx.security.decision}">
      <div class="tx-header">
        <div>
          <strong>${tx.action}</strong>
          <span>${tx.media}</span>
        </div>
        <span class="pill ${tx.security.decision}">${tx.status}</span>
      </div>
      <div class="tx-detail">
        <div><span>Network</span><strong>${tx.chain}</strong></div>
        <div><span>Source</span><strong>${tx.market}</strong></div>
        <div><span>Amount</span><strong>${tx.amount}</strong></div>
        <div><span>Transport</span><strong>${tx.transport}</strong></div>
      </div>
      <div class="risk-list">
        ${tx.security.findings.slice(0, 4).map(finding => `<span class="risk-chip ${finding.level}">${finding.label}</span>`).join('')}
      </div>
      <button class="ghost-button" type="button" data-review="${tx.id}" ${tx.security.decision === 'block' ? 'disabled' : ''}>
        ${tx.security.decision === 'block' ? 'Blocked by guard' : 'Review access'}
      </button>
    </article>
  `).join('') || '<div class="empty-state">No pending vault actions.</div>';

  $$('[data-review]').forEach(button => {
    button.addEventListener('click', () => reviewTx(button.dataset.review));
  });
}

function configurePlayerCanvas(canvas) {
  if (!canvas) return;
  const profile = playerProfiles[state.playerProfile] || playerProfiles.auto;
  if (canvas.width !== profile.width) canvas.width = profile.width;
  if (canvas.height !== profile.height) canvas.height = profile.height;
  canvas.dataset.maxResolution = `${playerProfiles['8k'].width}x${playerProfiles['8k'].height}`;
  canvas.dataset.activeResolution = `${profile.width}x${profile.height}`;
}

function drawEmptyPlayer(canvas) {
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  ctx.clearRect(0, 0, width, height);
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#0d0d0f');
  gradient.addColorStop(0.55, activeSkin().panel);
  gradient.addColorStop(1, activeSkin().accent);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.18;
  ctx.fillStyle = activeSkin().glow;
  ctx.fillRect(width * 0.08, height * 0.18, width * 0.84, height * 0.04);
  ctx.fillRect(width * 0.08, height * 0.78, width * 0.84, height * 0.04);
  ctx.globalAlpha = 1;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.46)';
  ctx.fillRect(0, height * 0.68, width, height * 0.32);
  ctx.fillStyle = '#fffaf5';
  ctx.font = `${Math.max(44, Math.round(width * 0.035))}px Inter, sans-serif`;
  ctx.fillText(state.address ? 'No indexed media selected' : 'Connect wallet to index media', width * 0.06, height * 0.78, width * 0.86);
  ctx.fillStyle = 'rgba(255, 250, 245, 0.72)';
  ctx.font = `${Math.max(24, Math.round(width * 0.018))}px Inter, sans-serif`;
  ctx.fillText(playerProfiles[state.playerProfile].label + ' player ready', width * 0.06, height * 0.85, width * 0.86);
}

function drawCover(canvas, item, elapsed = 0, mini = false) {
  if (!canvas || !item) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const [base, accent, light] = item.colors;
  const t = elapsed * 0.04;

  if (item.cover) {
    const cached = imageCache.get(item.cover);
    if (cached?.complete && cached.naturalWidth) {
      const imageRatio = cached.naturalWidth / cached.naturalHeight;
      const canvasRatio = width / height;
      const fitScale = Math.min(1, width / cached.naturalWidth, height / cached.naturalHeight);
      const drawWidth = cached.naturalWidth * fitScale;
      const drawHeight = cached.naturalHeight * fitScale;
      const drawX = (width - drawWidth) / 2;
      const drawY = (height - drawHeight) / 2;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#050507';
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(cached, drawX, drawY, drawWidth, drawHeight);
      return;
    }

    if (!cached && typeof Image !== 'undefined') {
      const image = new Image();
      image.onload = () => drawCover(canvas, item, elapsed, mini);
      image.onerror = () => imageCache.set(item.cover, { complete: false, naturalWidth: 0 });
      image.src = item.cover;
      imageCache.set(item.cover, image);
    }
  }

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, base);
  gradient.addColorStop(0.55, accent);
  gradient.addColorStop(1, light);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.24;
  for (let i = 0; i < 9; i += 1) {
    const x = ((i * 83 + t * 34) % (width + 120)) - 60;
    ctx.fillStyle = i % 2 ? light : '#ffffff';
    ctx.fillRect(x, 0, mini ? 18 : 28, height);
  }
  ctx.globalAlpha = 1;

  if (item.type === 'movie') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.48)';
    for (let x = 0; x < width; x += 72) {
      ctx.fillRect(x, 0, 34, height);
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.16)';
    for (let y = 22; y < height; y += 64) {
      ctx.fillRect(20, y, width - 40, 18);
    }
  }

  if (item.type === 'music') {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.42)';
    ctx.lineWidth = mini ? 5 : 8;
    for (let i = 0; i < 5; i += 1) {
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 44 + i * 38 + Math.sin(t + i) * 8, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, mini ? 24 : 42, 0, Math.PI * 2);
    ctx.fill();
  }

  if (item.type === 'photo') {
    const margin = mini ? 26 : 58;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
    ctx.fillRect(margin, margin, width - margin * 2, height - margin * 2);
    ctx.fillStyle = base;
    ctx.fillRect(margin + 14, margin + 14, width - margin * 2 - 28, height - margin * 2 - 54);
    ctx.fillStyle = accent;
    ctx.fillRect(margin + 28, margin + 30, width - margin * 2 - 80, height - margin * 2 - 100);
  }

  if (mini) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fillRect(0, height - 54, width, 54);
    ctx.fillStyle = '#fffaf5';
    ctx.font = '700 22px Inter, sans-serif';
    ctx.fillText(item.title, 18, height - 24, width - 40);
  }
}

function loadMedia(id) {
  const next = vaultMedia().find(item => item.id === id);
  if (!next) return;
  stopAudio();
  state.activeMedia = next.id;
  state.activeChain = next.chain;
  state.elapsed = 0;
  state.playing = false;
  persist();
  renderAll();
}

function togglePlay() {
  if (state.playing) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  const item = activeMedia();
  if (!item) return;
  state.playing = true;
  state.startedAt = performance.now() - state.elapsed * 1000;
  if (item.type === 'music') startAudio();
  animate();
  renderPlayer();
}

function pausePlayback() {
  state.elapsed = currentElapsed();
  state.playing = false;
  stopAudio();
  cancelAnimationFrame(state.animationId);
  persist();
  renderPlayer();
}

function currentElapsed() {
  if (!state.playing) return state.elapsed;
  const item = activeMedia();
  if (!item) return 0;
  return Math.min(item.duration, (performance.now() - state.startedAt) / 1000);
}

function animate() {
  state.elapsed = currentElapsed();
  const item = activeMedia();
  if (!item) {
    pausePlayback();
    return;
  }
  if (state.elapsed >= item.duration) {
    nextMedia();
    return;
  }
  $('#elapsedTime').textContent = formatTime(state.elapsed);
  $('#progress').value = String(Math.round((state.elapsed / item.duration) * 1000));
  drawCover($('#playerCanvas'), item, state.elapsed, false);
  state.animationId = requestAnimationFrame(animate);
}

function startAudio() {
  if (state.audio) return;
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const context = new AudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const filter = context.createBiquadFilter();
  oscillator.type = 'triangle';
  oscillator.frequency.value = 92 + activeMedia().title.length * 3;
  filter.type = 'lowpass';
  filter.frequency.value = 640;
  gain.gain.value = 0.035;
  oscillator.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  state.audio = { context, oscillator, gain };
}

function stopAudio() {
  if (!state.audio) return;
  try {
    state.audio.oscillator.stop();
    state.audio.context.close();
  } catch {
    // Already stopped by the browser.
  }
  state.audio = null;
}

function nextMedia() {
  const items = scopedVaultMedia();
  if (!items.length) return;
  const index = items.findIndex(item => item.id === state.activeMedia);
  loadMedia(items[(index + 1) % items.length].id);
}

function previousMedia() {
  const items = scopedVaultMedia();
  if (!items.length) return;
  const index = items.findIndex(item => item.id === state.activeMedia);
  loadMedia(items[(index - 1 + items.length) % items.length].id);
}

function togglePinned(id = state.activeMedia) {
  if (!id) return;
  if (state.pinned.includes(id)) {
    state.pinned = state.pinned.filter(item => item !== id);
  } else {
    state.pinned.push(id);
  }
  persist();
  renderPlayer();
}

function removeChain(id) {
  if (!id || chains.length <= 1) {
    state.chainNotice = 'Keep at least one network active.';
    renderChains();
    return;
  }

  const chain = chains.find(item => item.id === id);
  if (!chain) return;

  if (isDefaultChain(id)) {
    state.hiddenChainIds = [...new Set([...state.hiddenChainIds, id])];
    state.chainNotice = `${chain.name} hidden. Restore built-ins to bring it back.`;
  } else {
    state.customChains = state.customChains.filter(item => item.id !== id);
    state.chainNotice = `${chain.name} removed.`;
  }

  delete state.chainBalances[id];
  rebuildChains();
  if (state.activeChain === id) state.activeChain = chains.find(item => item.id === 'apechain')?.id || chains[0]?.id || '';
  if (state.chainFilter === id) state.chainFilter = '';
  syncActiveMediaToScope();
  persist();
  renderAll();
}

function restoreBuiltInChains() {
  state.hiddenChainIds = [];
  rebuildChains();
  state.chainNotice = 'Built-in networks restored.';
  persist();
  renderAll();
}

function addCustomChain(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const custom = sanitizeCustomChain({
    name: form.chainName.value,
    symbol: form.chainSymbol.value,
    chainId: form.chainId.value,
    rpc: form.chainRpc.value,
    explorer: form.chainExplorer.value,
    nftApi: form.chainNftApi.value
  });

  if (!custom) {
    state.chainNotice = 'Enter a name, symbol, valid chain ID, and HTTPS RPC URL.';
    renderChains();
    return;
  }

  const duplicate = [...defaultChains, ...state.customChains]
    .find(chain => chain.id !== custom.id && chain.chainId?.toLowerCase() === custom.chainId.toLowerCase());
  if (duplicate) {
    state.chainNotice = `${duplicate.name} already uses chain ID ${custom.chainId}.`;
    renderChains();
    return;
  }

  state.customChains = [...state.customChains.filter(chain => chain.id !== custom.id), custom];
  state.hiddenChainIds = state.hiddenChainIds.filter(id => id !== custom.id);
  state.activeChain = custom.id;
  state.chainNotice = `${custom.name} added. Connect or refresh to index it.`;
  rebuildChains();
  form.reset();
  persist();
  renderAll();
}

function selectChain(id) {
  const chain = chains.find(item => item.id === id);
  if (!chain) return;

  const clearingFilter = state.chainFilter === chain.id;
  state.chainFilter = clearingFilter ? '' : chain.id;
  state.activeChain = chain.id;
  state.chainNotice = clearingFilter
    ? 'Showing NFTs from all active chains.'
    : `Showing ${chain.name} NFTs only. Click ${chain.name} again to show all chains.`;
  stopAudio();
  syncActiveMediaToScope();
  persist();
  renderAll();
}

async function connectWallet() {
  if (!window.ethereum) {
    state.walletLabel = 'Wallet provider needed';
    state.hardware = 'Provider needed';
    state.assetStatus = 'idle';
    state.assetMessage = 'Install or enable a browser wallet to index owned assets.';
    persist();
    renderAll();
    return;
  }

  try {
    const address = await requestCurrentProviderAddress({ forcePermission: state.localDisconnect });
    beginWalletSession(address);
    const providerChain = chainFromChainId(await window.ethereum.request({ method: 'eth_chainId' }).catch(() => ''));
    if (providerChain) state.activeChain = providerChain.id;
    persist();
    renderAll();
    if (state.address) await refreshWalletAssets();
  } catch (error) {
    state.hardware = 'Connection declined';
    renderChains();
  }
}

async function hydrateConnectedWallet() {
  if (!window.ethereum) return;
  const accounts = await window.ethereum.request({ method: 'eth_accounts' }).catch(() => []);
  if (state.localDisconnect) {
    resetWalletSession('Disconnected locally. Connect wallet to index owned media.', 'Disconnected');
    persist();
    renderAll();
    return;
  }

  const address = resolveProviderAddress(accounts);
  if (!address) {
    resetWalletSession('Connect wallet to index owned media.');
    state.localDisconnect = false;
    persist();
    renderAll();
    return;
  }

  beginWalletSession(address);
  const providerChain = chainFromChainId(await window.ethereum.request({ method: 'eth_chainId' }).catch(() => ''));
  if (providerChain) state.activeChain = providerChain.id;
  persist();
  renderAll();
  refreshWalletAssets();
}

async function connectHardware() {
  state.hardware = 'Device pending';
  renderChains();

  if (navigator.hid && state.transport === 'USB') {
    try {
      const devices = await navigator.hid.requestDevice({ filters: hardwareFilters });
      state.hardware = devices.length ? 'Device linked' : 'Ready';
    } catch {
      state.hardware = 'USB cancelled';
    }
  } else {
    state.hardware = `${state.transport} session`;
  }

  persist();
  renderChains();
}

function queueCollect() {
  const item = activeMedia();
  if (!item) {
    state.hardware = 'No media selected';
    renderAll();
    return;
  }
  const chain = mediaChain(item);
  const registry = trustedMarkets[item.market];
  const tx = buildTransaction({
    action: `Queue ${titleCase(item.type)}`,
    media: item.title,
    chain: chain.name,
    chainId: chain.id,
    market: item.market,
    amount: 'Owned NFT',
    amountValue: 0,
    symbol: chain.symbol,
    recipient: registry?.recipient || '',
    spender: registry?.recipient || '',
    method: 'openMedia',
    approval: 'none',
    origin: `https://${registry?.domain || 'unknown.example'}/collect/${item.id}`,
    readOnly: true,
    token: item.token
  });
  enqueueTransaction(tx);
  persist();
  renderAll();
}

function queueRoute(marketName) {
  const market = markets.find(item => item.name === marketName);
  const registry = trustedMarkets[marketName];
  const tx = buildTransaction({
    action: 'Source preview',
    media: `${marketName} access`,
    chain: activeChain().name,
    chainId: activeChain().id,
    market: marketName,
    amount: 'Read-only',
    amountValue: 0,
    symbol: activeChain().symbol,
    recipient: registry?.recipient || '',
    spender: registry?.recipient || '',
    method: 'openMarket',
    approval: 'none',
    origin: market?.url || '',
    readOnly: true
  });
  enqueueTransaction(tx);
  persist();
  renderAll();
}

function queueMaliciousTest() {
  const tx = buildTransaction({
    action: 'Guard Test',
    media: 'Unlimited media approval',
    chain: activeChain().name,
    chainId: activeChain().id,
    market: 'Unknown Drop',
    amount: `Unlimited ${activeChain().symbol}`,
    amountValue: 999999,
    symbol: activeChain().symbol,
    recipient: '0x000000000000000000000000000000000000dEaD',
    spender: '0x000000000000000000000000000000000000dEaD',
    method: 'setApprovalForAll',
    approval: 'unlimited',
    origin: 'https://xn--zora-airdrop.example/claim',
    readOnly: false
  });
  enqueueTransaction(tx);
  persist();
  renderAll();
}

function reviewTx(id) {
  const target = ensureSecurity(state.queue.find(tx => tx.id === id) || {});
  if (target.security?.decision === 'block') {
    state.hardware = 'Blocked by guard';
    persist();
    renderAll();
    return;
  }

  state.queue = state.queue.map(tx => tx.id === id ? { ...tx, status: 'Device open' } : tx);
  state.hardware = 'Device open';
  persist();
  renderAll();

  window.setTimeout(() => {
    state.queue = state.queue.map(tx => tx.id === id ? { ...tx, status: 'Signed locally' } : tx);
    state.hardware = 'Signed';
    persist();
    renderAll();
  }, 900);
}

function setTransport(transport) {
  state.transport = transport;
  persist();
  $$('.mode-button').forEach(button => {
    button.classList.toggle('active', button.dataset.transport === transport);
  });
  renderChains();
}

function resetWalletSession(message = 'Connect wallet to index owned media.', hardware = 'Ready') {
  assetRefreshToken += 1;
  stopAudio();
  state.address = '';
  state.walletLabel = 'Read-only vault';
  state.mediaAssets = [];
  state.assetOwner = '';
  state.chainBalances = {};
  state.indexerSources = [];
  state.chainFilter = '';
  state.activeMedia = '';
  state.assetStatus = 'idle';
  state.assetMessage = message;
  state.elapsed = 0;
  state.playing = false;
  state.hardware = hardware;
}

function beginWalletSession(address) {
  const nextAddress = address || '';
  const changedAccount = normalizeAddress(nextAddress) !== normalizeAddress(state.address);
  if (changedAccount) {
    resetWalletSession('Indexing wallet balances and owned media...');
  }

  state.address = nextAddress;
  state.walletLabel = nextAddress ? shortAddress(nextAddress) : 'Read-only vault';
  state.localDisconnect = false;
  state.hardware = nextAddress ? 'Wallet linked' : 'Ready';
  state.assetStatus = nextAddress ? 'loading' : 'idle';
  state.assetMessage = nextAddress ? 'Indexing wallet balances and owned media...' : 'Connect wallet to index owned media.';
}

function disconnectWallet() {
  state.localDisconnect = true;
  resetWalletSession('Disconnected locally. Connect wallet to index owned media.', 'Disconnected');
  persist();
  renderAll();
}

function bindEvents() {
  $('#connectWallet').addEventListener('click', connectWallet);
  $('#disconnectWallet')?.addEventListener('click', disconnectWallet);
  $('#chainForm')?.addEventListener('submit', addCustomChain);
  $('#restoreChains')?.addEventListener('click', restoreBuiltInChains);
  $('#connectHardware').addEventListener('click', connectHardware);
  $('#installApp')?.addEventListener('click', installApp);
  $('#playPause').addEventListener('click', togglePlay);
  $('#prevTrack').addEventListener('click', previousMedia);
  $('#nextTrack').addEventListener('click', nextMedia);
  $('#pinMedia').addEventListener('click', () => togglePinned());
  $('#queueCollect').addEventListener('click', queueCollect);
  $('#simulateAttack').addEventListener('click', queueMaliciousTest);
  $('#clearQueue').addEventListener('click', () => {
    state.queue = [];
    state.hardware = 'Ready';
    persist();
    renderAll();
  });
  $('#searchMedia').addEventListener('input', event => {
    state.search = event.target.value;
    renderMediaGrid();
  });
  $('#marketFilter').addEventListener('change', event => {
    state.marketFilter = event.target.value;
    persist();
    renderMarkets();
  });
  $('#skinSelect')?.addEventListener('change', event => {
    setSkin(event.target.value);
  });
  $('#skinUpload')?.addEventListener('change', event => {
    const file = event.target.files?.[0];
    if (file) generateSkinFromFile(file);
    event.target.value = '';
  });
  $('#qualitySelect')?.addEventListener('change', event => {
    state.playerProfile = playerProfiles[event.target.value] ? event.target.value : 'auto';
    persist();
    renderPlayer();
  });
  $('#progress').addEventListener('input', event => {
    const item = activeMedia();
    state.elapsed = item.duration * (Number(event.target.value) / 1000);
    if (state.playing) state.startedAt = performance.now() - state.elapsed * 1000;
    persist();
    renderPlayer();
  });
  $$('.mode-button').forEach(button => {
    button.addEventListener('click', () => setTransport(button.dataset.transport));
  });

  if (window.ethereum) {
    startGuardMonitor();
    window.ethereum.on?.('accountsChanged', accounts => {
      const address = resolveProviderAddress(accounts || []);
      if (address) {
        beginWalletSession(address);
      } else {
        state.localDisconnect = false;
        resetWalletSession('Connect wallet to index owned media.');
      }
      persist();
      renderAll();
      if (state.address) refreshWalletAssets();
    });
    window.ethereum.on?.('chainChanged', chainId => {
      const next = chainFromChainId(chainId);
      if (next) state.activeChain = next.id;
      persist();
      renderAll();
    });
    hydrateConnectedWallet();
  }
}

async function installApp() {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    return;
  }

  window.location.href = 'install/';
}

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
});

function renderAll() {
  startGuardMonitor();
  applySkin();
  renderSkinControls();
  renderChains();
  renderFilters();
  renderPlayer();
  renderMarkets();
  renderSecurity();
  renderGuardMonitor();
  renderQueue();
  $('#marketFilter').value = state.marketFilter;
  $('#searchMedia').value = state.search;
  if ($('#qualitySelect')) $('#qualitySelect').value = state.playerProfile;
  setTransport(state.transport);
}

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(() => {
      // Offline support is a production enhancement, not a blocker for playback.
    });
  });
}

bindEvents();
renderAll();

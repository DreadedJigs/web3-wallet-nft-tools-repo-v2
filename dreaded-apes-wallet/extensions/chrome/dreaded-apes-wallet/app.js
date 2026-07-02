const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const usd = value => `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const chains = [
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
    rpc: null,
    explorer: 'https://etherscan.io'
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
    explorer: 'https://basescan.org'
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
    explorer: 'https://polygonscan.com'
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
    explorer: 'https://arbiscan.io'
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

const media = [
  {
    id: 'static-midnight',
    title: 'Static at Midnight',
    creator: 'Nadia Vale',
    type: 'movie',
    chain: 'base',
    market: 'Zora',
    runtime: '12:44',
    duration: 764,
    token: 'ERC-721 #441',
    license: 'Collector cut',
    price: 0.18,
    format: '4K stream',
    colors: ['#1a1b22', '#d64d4d', '#d9a441']
  },
  {
    id: 'black-glass-radio',
    title: 'Black Glass Radio',
    creator: 'Vanta Choir',
    type: 'music',
    chain: 'ethereum',
    market: 'Sound',
    runtime: '3:36',
    duration: 216,
    token: 'ERC-1155 #79',
    license: 'Stem pack',
    price: 0.08,
    format: 'Lossless',
    colors: ['#0c0c0f', '#8f7cff', '#45b6bd']
  },
  {
    id: 'red-sun-contact',
    title: 'Red Sun Contact Sheet',
    creator: 'Orion Park',
    type: 'photo',
    chain: 'polygon',
    market: 'OpenSea',
    runtime: '18 photos',
    duration: 180,
    token: 'ERC-721 #1208',
    license: 'Print ready',
    price: 42,
    format: 'RAW bundle',
    colors: ['#220f0f', '#d64d4d', '#f1c16b']
  },
  {
    id: 'antenna-choir',
    title: 'Antenna Choir',
    creator: 'Mira Sector',
    type: 'music',
    chain: 'solana',
    market: 'Magic Eden',
    runtime: '4:18',
    duration: 258,
    token: 'Metaplex #882',
    license: 'Loop rights',
    price: 1.2,
    format: 'Spatial',
    colors: ['#09120f', '#55b978', '#45b6bd']
  },
  {
    id: 'cold-frame',
    title: 'Cold Frame',
    creator: 'Rift Office',
    type: 'movie',
    chain: 'arbitrum',
    market: 'Livepeer',
    runtime: '21:09',
    duration: 1269,
    token: 'ERC-721 #67',
    license: 'Private stream',
    price: 0.11,
    format: '1080p',
    colors: ['#0b1a1c', '#45b6bd', '#f5f1e8']
  },
  {
    id: 'vault-polaroids',
    title: 'Vault Polaroids',
    creator: 'Rhea Tamm',
    type: 'photo',
    chain: 'bitcoin',
    market: 'Ordinals Market',
    runtime: '9 photos',
    duration: 144,
    token: 'Inscription 721408',
    license: 'Gallery view',
    price: 0.006,
    format: 'Inscribed set',
    colors: ['#17100a', '#d9a441', '#f5f1e8']
  },
  {
    id: 'block-cuts-nine',
    title: 'Block Cuts Vol. 9',
    creator: 'Chain Cinema Club',
    type: 'movie',
    chain: 'ethereum',
    market: 'Foundation',
    runtime: '8:05',
    duration: 485,
    token: 'ERC-721 #909',
    license: 'Festival pass',
    price: 0.21,
    format: 'HD stream',
    colors: ['#121017', '#d64d4d', '#8f7cff']
  },
  {
    id: 'mural-notes',
    title: 'Mural Notes',
    creator: 'Sable Index',
    type: 'photo',
    chain: 'base',
    market: 'Zora',
    runtime: '24 photos',
    duration: 210,
    token: 'ERC-1155 #130',
    license: 'Editorial',
    price: 0.03,
    format: 'Contact sheet',
    colors: ['#10151d', '#4f8cff', '#d9a441']
  }
];

const markets = [
  { name: 'Zora', category: 'photo', chain: 'Base', access: 'Vault pass', catalog: '1.8M items', speed: 'Fast', url: 'https://zora.co' },
  { name: 'Sound', category: 'music', chain: 'Ethereum', access: 'Audio drop', catalog: '640K tracks', speed: 'Mainnet', url: 'https://www.sound.xyz' },
  { name: 'OpenSea', category: 'photo', chain: 'Polygon', access: 'Gallery view', catalog: '9.4M assets', speed: 'Synced', url: 'https://opensea.io' },
  { name: 'Magic Eden', category: 'music', chain: 'Solana', access: 'Creator set', catalog: '7.1M files', speed: 'Fast', url: 'https://magiceden.io' },
  { name: 'Livepeer', category: 'movie', chain: 'Arbitrum', access: 'Video stream', catalog: '310K streams', speed: 'Stream', url: 'https://livepeer.org' },
  { name: 'Archive Index', category: 'movie', chain: 'Multichain', access: 'Read-only', catalog: 'Open catalog', speed: 'Indexed', url: 'https://archive.org' }
];

const storageKey = 'dreaded-apes-wallet-state';
const saved = JSON.parse(localStorage.getItem(storageKey) || '{}');
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
    chains: ['polygon', 'ethereum'],
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
    chains: ['ethereum', 'base', 'polygon', 'arbitrum', 'solana', 'bitcoin'],
    caps: { ETH: 0, POL: 0, SOL: 0, BTC: 0 }
  }
};
const securityGuard = DreadedGuard.createGuard({
  trustedSources: trustedMarkets,
  blockedAddresses
});
const securityProtocols = DreadedGuard.protocols;

const state = {
  activeChain: saved.activeChain || 'base',
  activeMedia: saved.activeMedia || media[0].id,
  filter: saved.filter || 'all',
  marketFilter: saved.marketFilter || 'all',
  search: '',
  address: saved.address || '',
  walletLabel: saved.walletLabel || 'Read-only vault',
  hardware: saved.hardware || 'Ready',
  transport: saved.transport || 'USB',
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

function persist() {
  localStorage.setItem(storageKey, JSON.stringify({
    activeChain: state.activeChain,
    activeMedia: state.activeMedia,
    filter: state.filter,
    marketFilter: state.marketFilter,
    address: state.address,
    walletLabel: state.walletLabel,
    hardware: state.hardware,
    transport: state.transport,
    pinned: state.pinned,
    queue: state.queue,
    guardEvents: state.guardEvents,
    elapsed: state.elapsed
  }));
}

function activeChain() {
  return chains.find(chain => chain.id === state.activeChain) || chains[0];
}

function activeMedia() {
  return media.find(item => item.id === state.activeMedia) || media[0];
}

function mediaChain(item) {
  return chains.find(chain => chain.id === item.chain) || chains[0];
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

function createGuardWarning(event) {
  const intent = event.intent || {};
  const security = event.security || auditTransaction(intent);
  const method = intent.providerMethod || intent.method || 'transaction';
  const findings = security.findings.filter(finding => finding.level !== 'info');

  return {
    id: `${security.checkedAt}-${method}-${security.score}`,
    title: warningTitle(security),
    decision: security.decision,
    score: security.score,
    method,
    origin: intent.origin || 'Local wallet action',
    checkedAt: security.checkedAt,
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

function startGuardMonitor() {
  if (!DreadedGuard.createBackgroundMonitor) return;

  if (!guardMonitor) {
    guardMonitor = DreadedGuard.createBackgroundMonitor({
      guard: securityGuard,
      provider: window.ethereum,
      getContext: () => ({ walletAddress: state.address }),
      getIntentDefaults: guardIntentDefaults,
      blockDecisions: ['block'],
      onWarning: recordGuardWarning
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
  $('#portfolioValue').textContent = usd(chains.reduce((sum, chain) => sum + chain.usd, 0));
  $('#walletAddress').textContent = state.address ? shortAddress(state.address) : state.walletLabel;
  $('#chainCount').textContent = `${chains.length} indexed`;
  $('#networkStatus').textContent = state.address ? `${shortAddress(state.address)} on ${activeChain().name}` : activeChain().name;
  $('#hardwareState').textContent = state.hardware;
  $('#transportMode').textContent = state.transport;

  $('#chainList').innerHTML = chains.map(chain => `
    <button class="chain-button ${chain.id === state.activeChain ? 'active' : ''}" type="button" data-chain="${chain.id}" style="--chain-color: ${chain.color}">
      <span class="chain-dot" aria-hidden="true"></span>
      <span>
        <span class="chain-name">${chain.name}</span>
        <span class="chain-symbol">${chain.balance} ${chain.symbol} - ${chain.gas}</span>
      </span>
      <span>
        <span class="chain-value">${usd(chain.usd)}</span>
        <span class="chain-assets">${chain.assets} media</span>
      </span>
    </button>
  `).join('');

  $$('.chain-button').forEach(button => {
    button.addEventListener('click', () => selectChain(button.dataset.chain));
  });
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
  return media.filter(item => {
    const matchesType = state.filter === 'all' || item.type === state.filter;
    const haystack = [item.title, item.creator, item.type, item.market, mediaChain(item).name, item.token].join(' ').toLowerCase();
    return matchesType && (!query || haystack.includes(query));
  });
}

function renderMediaGrid() {
  const items = filteredMedia();
  $('#mediaGrid').innerHTML = items.map(item => {
    const chain = mediaChain(item);
    const pinned = state.pinned.includes(item.id);
    return `
      <article class="media-card ${item.id === state.activeMedia ? 'active' : ''}">
        <canvas class="media-thumb" width="420" height="260" data-cover="${item.id}"></canvas>
        <div class="media-body">
          <div class="media-row">
            <h3 class="media-title">${item.title}</h3>
            <span class="media-price">${item.price} ${chain.symbol}</span>
          </div>
          <div class="media-meta">${item.creator} - ${chain.name} - ${item.market}</div>
          <div class="mini-actions">
            <button class="ghost-button" type="button" data-play="${item.id}">Load</button>
            <button class="ghost-button" type="button" data-pin="${item.id}">${pinned ? 'Pinned' : 'Pin'}</button>
          </div>
        </div>
      </article>
    `;
  }).join('') || '<div class="empty-state">No media matched this vault.</div>';

  $$('[data-cover]').forEach(canvas => {
    drawCover(canvas, media.find(item => item.id === canvas.dataset.cover), 0, true);
  });

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
  const chain = mediaChain(item);
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
    ['License', item.license],
    ['Network', `${chain.name} - ${chain.health}`]
  ].map(([label, value]) => `<div><span>${label}</span><strong>${value}</strong></div>`).join('');

  drawCover($('#playerCanvas'), item, state.elapsed, false);
  renderMediaGrid();
}

function renderMarkets() {
  const items = markets.filter(market => state.marketFilter === 'all' || market.category === state.marketFilter);
  $('#marketList').innerHTML = items.map(market => `
    <article class="market-card">
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
      const target = media.find(item => item.market === button.dataset.marketRoute);
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
  const latest = state.guardEvents.slice(0, 3);

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
          <div>
            <strong>${event.title}</strong>
            <span>${event.method} - score ${event.score}</span>
          </div>
          <ul>
            ${event.findings.slice(0, 3).map(finding => `<li>${finding.label}</li>`).join('')}
          </ul>
        </article>
      `).join('') || '<div class="empty-state compact">No background warnings.</div>'}
    </div>
  `;

  $('#clearGuardEvents')?.addEventListener('click', () => {
    state.guardEvents = [];
    persist();
    renderGuardMonitor();
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

function drawCover(canvas, item, elapsed = 0, mini = false) {
  if (!canvas || !item) return;
  const ctx = canvas.getContext('2d');
  const width = canvas.width;
  const height = canvas.height;
  const [base, accent, light] = item.colors;
  const t = elapsed * 0.04;

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

  ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
  ctx.fillRect(0, height - (mini ? 54 : 92), width, mini ? 54 : 92);
  ctx.fillStyle = '#fffaf5';
  ctx.font = mini ? '700 22px Inter, sans-serif' : '800 44px Inter, sans-serif';
  ctx.fillText(item.title, mini ? 18 : 34, height - (mini ? 24 : 52), width - 40);
  if (!mini) {
    ctx.fillStyle = 'rgba(255, 250, 245, 0.72)';
    ctx.font = '700 20px Inter, sans-serif';
    ctx.fillText(`${item.creator} / ${titleCase(item.type)}`, 34, height - 24, width - 68);
  }
}

function loadMedia(id) {
  const next = media.find(item => item.id === id);
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
  return Math.min(item.duration, (performance.now() - state.startedAt) / 1000);
}

function animate() {
  state.elapsed = currentElapsed();
  const item = activeMedia();
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
  const index = media.findIndex(item => item.id === state.activeMedia);
  loadMedia(media[(index + 1) % media.length].id);
}

function previousMedia() {
  const index = media.findIndex(item => item.id === state.activeMedia);
  loadMedia(media[(index - 1 + media.length) % media.length].id);
}

function togglePinned(id = state.activeMedia) {
  if (state.pinned.includes(id)) {
    state.pinned = state.pinned.filter(item => item !== id);
  } else {
    state.pinned.push(id);
  }
  persist();
  renderPlayer();
}

async function selectChain(id) {
  const chain = chains.find(item => item.id === id);
  if (!chain) return;
  state.activeChain = chain.id;
  persist();
  renderChains();

  if (window.ethereum && chain.chainId) {
    try {
      await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: chain.chainId }] });
    } catch (error) {
      if (error.code === 4902 && chain.rpc) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: chain.chainId,
            chainName: chain.name,
            nativeCurrency: { name: chain.symbol, symbol: chain.symbol, decimals: 18 },
            rpcUrls: [chain.rpc],
            blockExplorerUrls: [chain.explorer]
          }]
        });
      }
    }
  }
}

async function connectWallet() {
  if (!window.ethereum) {
    state.walletLabel = 'Demo vault active';
    state.hardware = 'Provider needed';
    persist();
    renderAll();
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    state.address = accounts[0] || '';
    state.walletLabel = state.address ? shortAddress(state.address) : 'Read-only vault';
    state.hardware = 'Wallet linked';
    persist();
    renderAll();
  } catch (error) {
    state.hardware = 'Connection declined';
    renderChains();
  }
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
  const chain = mediaChain(item);
  const registry = trustedMarkets[item.market];
  const tx = buildTransaction({
    action: `Queue ${titleCase(item.type)}`,
    media: item.title,
    chain: chain.name,
    chainId: chain.id,
    market: item.market,
    amount: `${item.price} ${chain.symbol}`,
    amountValue: item.price,
    symbol: chain.symbol,
    recipient: registry?.recipient || '',
    spender: registry?.recipient || '',
    method: 'collectMedia',
    approval: 'exact',
    origin: `https://${registry?.domain || 'unknown.example'}/collect/${item.id}`,
    readOnly: false,
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

function bindEvents() {
  $('#connectWallet').addEventListener('click', connectWallet);
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
      state.address = accounts[0] || '';
      state.walletLabel = state.address ? shortAddress(state.address) : 'Read-only vault';
      persist();
      renderAll();
    });
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
  renderChains();
  renderFilters();
  renderPlayer();
  renderMarkets();
  renderSecurity();
  renderGuardMonitor();
  renderQueue();
  $('#marketFilter').value = state.marketFilter;
  $('#searchMedia').value = state.search;
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

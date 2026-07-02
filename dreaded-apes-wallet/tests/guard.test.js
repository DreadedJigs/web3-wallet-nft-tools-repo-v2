const test = require('node:test');
const assert = require('node:assert/strict');
const Guard = require('../public/guard/dreaded-guard.js');

function createTestGuard() {
  return Guard.createGuard({
    trustedSources: {
      Zora: {
        domain: 'zora.co',
        recipient: '0x1111111111111111111111111111111111111111',
        chains: ['base'],
        caps: { ETH: 0.35 }
      }
    }
  });
}

test('allows a clean exact approval for a trusted source', () => {
  const result = createTestGuard().audit({
    source: 'Zora',
    chainId: 'base',
    symbol: 'ETH',
    amountValue: 0.08,
    recipient: '0x1111111111111111111111111111111111111111',
    method: 'collectMedia',
    approval: 'exact',
    origin: 'https://zora.co/collect/track',
    readOnly: false
  }, { walletAddress: '0xabc' });

  assert.equal(result.decision, 'allow');
  assert.equal(Guard.statusFor(result), 'Ready');
});

test('holds a trusted source when amount exceeds configured cap', () => {
  const result = createTestGuard().audit({
    source: 'Zora',
    chainId: 'base',
    symbol: 'ETH',
    amountValue: 0.9,
    recipient: '0x1111111111111111111111111111111111111111',
    method: 'collectMedia',
    approval: 'exact',
    origin: 'https://zora.co/collect/track',
    readOnly: false
  }, { walletAddress: '0xabc' });

  assert.equal(result.decision, 'hold');
  assert.ok(result.findings.some(finding => finding.code === 'AMOUNT_OVER_POLICY'));
});

test('blocks a malicious unlimited approval intent', () => {
  const result = createTestGuard().audit({
    source: 'Unknown Drop',
    chainId: 'base',
    symbol: 'ETH',
    amountValue: 999,
    recipient: '0x000000000000000000000000000000000000dEaD',
    spender: '0x000000000000000000000000000000000000dEaD',
    method: 'setApprovalForAll',
    approval: 'unlimited',
    origin: 'https://xn--zora-airdrop.example/claim',
    readOnly: false
  }, { walletAddress: '' });

  assert.equal(result.decision, 'block');
  assert.ok(result.findings.some(finding => finding.code === 'DANGEROUS_METHOD'));
  assert.ok(result.findings.some(finding => finding.code === 'UNLIMITED_APPROVAL'));
});

test('background monitor blocks malicious provider requests before wallet execution', async () => {
  let providerCalled = false;
  const warnings = [];
  const provider = {
    async request() {
      providerCalled = true;
      return 'sent';
    }
  };

  const monitor = Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    provider,
    getContext: () => ({ walletAddress: '0xabc' }),
    getIntentDefaults: () => ({
      source: 'Zora',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://zora.co/collect/track'
    }),
    onWarning: event => warnings.push(event)
  });

  const spender = '000000000000000000000000000000000000dead';
  const enabled = '0000000000000000000000000000000000000000000000000000000000000001';
  const data = `0xa22cb465000000000000000000000000${spender}${enabled}`;

  await assert.rejects(
    provider.request({
      method: 'eth_sendTransaction',
      params: [{ to: '0x1111111111111111111111111111111111111111', data }]
    }),
    /Blocked by Dreaded Guard/
  );

  assert.equal(providerCalled, false);
  assert.equal(warnings.length, 1);
  assert.equal(warnings[0].security.decision, 'block');
  assert.ok(warnings[0].security.findings.some(finding => finding.code === 'DANGEROUS_METHOD'));

  monitor.stop();
});

test('background monitor warns on risky signature requests', () => {
  const warnings = [];
  const monitor = Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    getContext: () => ({ walletAddress: '0xabc' }),
    getIntentDefaults: () => ({
      source: 'Zora',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://zora.co'
    }),
    onWarning: event => warnings.push(event)
  });

  const event = monitor.inspectRequest({
    method: 'personal_sign',
    params: ['0x68656c6c6f', '0xabc']
  });

  assert.equal(event.security.decision, 'hold');
  assert.equal(warnings.length, 1);
  assert.ok(event.security.findings.some(finding => finding.code === 'SIGNATURE_REQUEST'));
});

test('background monitor pauses wallet network changes for approval', async () => {
  let providerCalled = false;
  let approveReview;
  const provider = {
    async request() {
      providerCalled = true;
      return 'switched';
    }
  };

  Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    provider,
    getContext: () => ({ walletAddress: '0xabc' }),
    getIntentDefaults: () => ({
      source: 'Dreaded Apes Wallet',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://dreadedjigs.github.io/web3-wallet-nft-tools-repo-v2/'
    }),
    onReview: event => new Promise(resolve => {
      approveReview = () => resolve(event.security.decision === 'hold');
    })
  });

  const pending = provider.request({
    method: 'wallet_switchEthereumChain',
    params: [{ chainId: '0x8173' }]
  });

  await new Promise(resolve => setTimeout(resolve, 0));
  assert.equal(providerCalled, false);
  approveReview();
  assert.equal(await pending, 'switched');
  assert.equal(providerCalled, true);
});

test('background monitor blocks eth_sign raw signature requests', () => {
  const monitor = Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    getContext: () => ({ walletAddress: '0xabc' }),
    getIntentDefaults: () => ({
      source: 'Zora',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://zora.co'
    })
  });

  const event = monitor.inspectRequest({
    method: 'eth_sign',
    params: ['0xabc', '0x68656c6c6f']
  });

  assert.equal(event.security.decision, 'block');
  assert.ok(event.security.findings.some(finding => finding.code === 'DANGEROUS_METHOD'));
});

test('background monitor holds decoded NFT transfer requests for review', () => {
  const monitor = Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    getContext: () => ({ walletAddress: '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }),
    getIntentDefaults: () => ({
      source: 'Zora',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://zora.co'
    })
  });

  const from = 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';
  const to = 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb';
  const tokenId = '000000000000000000000000000000000000000000000000000000000000007b';
  const data = `0x42842e0e000000000000000000000000${from}000000000000000000000000${to}${tokenId}`;

  const event = monitor.inspectRequest({
    method: 'eth_sendTransaction',
    params: [{ to: '0x1111111111111111111111111111111111111111', data }]
  });

  assert.equal(event.security.decision, 'hold');
  assert.ok(event.security.findings.some(finding => finding.code === 'NFT_TRANSFER'));
});

test('background monitor blocks opaque raw transactions', async () => {
  let providerCalled = false;
  const provider = {
    async request() {
      providerCalled = true;
      return 'sent';
    }
  };

  Guard.createBackgroundMonitor({
    guard: createTestGuard(),
    provider,
    getContext: () => ({ walletAddress: '0xabc' }),
    getIntentDefaults: () => ({
      source: 'Zora',
      chainId: 'base',
      symbol: 'ETH',
      origin: 'https://zora.co'
    })
  });

  await assert.rejects(
    provider.request({
      method: 'eth_sendRawTransaction',
      params: ['0xf86c808504a817c80082520894ffffffffffffffffffffffffffffffffffffffff880de0b6b3a76400008025a0']
    }),
    /Blocked by Dreaded Guard/
  );

  assert.equal(providerCalled, false);
});

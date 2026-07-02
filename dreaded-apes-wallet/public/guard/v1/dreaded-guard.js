(function dreadedGuardFactory(root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DreadedGuard = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function createDreadedGuardApi() {
  const defaultHighRiskMethods = [
    'setApprovalForAll',
    'permit',
    'permit2',
    'delegatecall',
    'eth_sign',
    'eth_sendRawTransaction',
    'wallet_sendCalls'
  ];

  const defaultProtectedMethods = [
    'eth_sendTransaction',
    'eth_signTransaction',
    'eth_sendRawTransaction',
    'eth_sign',
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4',
    'wallet_sendCalls',
    'wallet_addEthereumChain',
    'wallet_switchEthereumChain',
    'wallet_watchAsset'
  ];

  const defaultSignatureMethods = [
    'personal_sign',
    'eth_signTypedData',
    'eth_signTypedData_v3',
    'eth_signTypedData_v4'
  ];

  const defaultBlockedAddresses = [
    '0x0000000000000000000000000000000000000000',
    '0x000000000000000000000000000000000000dead'
  ];

  const protocols = [
    { name: 'Background monitor', status: 'On', detail: 'Signing and send requests are inspected before wallet review.' },
    { name: 'Intent lock', status: 'On', detail: 'Network, method, recipient, and amount are frozen before review.' },
    { name: 'Source allowlist', status: 'On', detail: 'Recipients must match the configured trusted registry.' },
    { name: 'Approval caps', status: 'Exact', detail: 'Unlimited approvals, permit abuse, and delegated signing are blocked.' },
    { name: 'NFT transfer shield', status: 'On', detail: 'ERC-721 and ERC-1155 transfer calls are decoded and forced into review.' },
    { name: 'Raw transaction block', status: 'On', detail: 'Opaque raw transactions and risky batch calls are blocked before wallet execution.' },
    { name: 'Origin shield', status: 'On', detail: 'Known lookalike domains and mismatched origins are quarantined.' }
  ];

  function normalizeAddress(value = '') {
    return String(value).toLowerCase();
  }

  function toArray(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    if (value instanceof Set) return [...value];
    return Object.values(value);
  }

  function createId() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `guard-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function riskPoints(level) {
    return { critical: 100, high: 45, medium: 20, info: 4 }[level] || 0;
  }

  function addFinding(findings, level, label, code) {
    findings.push({ level, label, code });
  }

  function normalizeOrigin() {
    if (typeof location === 'undefined') return '';
    return location.href || `${location.protocol}//${location.host}`;
  }

  function hexToBigInt(value) {
    if (typeof value !== 'string' || !/^0x[0-9a-f]+$/i.test(value)) return 0n;
    return BigInt(value);
  }

  function weiToEth(value) {
    const wei = hexToBigInt(value);
    if (!wei) return 0;
    const integer = wei / 1000000000000000000n;
    const fraction = wei % 1000000000000000000n;
    const padded = fraction.toString().padStart(18, '0').slice(0, 6);
    return Number(`${integer}.${padded}`);
  }

  function decodeAddressParam(data, paramIndex) {
    const offset = 10 + paramIndex * 64;
    const slot = data.slice(offset, offset + 64);
    if (slot.length !== 64) return '';
    return `0x${slot.slice(24)}`;
  }

  function decodeBoolParam(data, paramIndex) {
    const offset = 10 + paramIndex * 64;
    const slot = data.slice(offset, offset + 64);
    return slot.endsWith('1');
  }

  function decodeUintParam(data, paramIndex) {
    const offset = 10 + paramIndex * 64;
    const slot = data.slice(offset, offset + 64);
    if (slot.length !== 64) return 0n;
    return BigInt(`0x${slot}`);
  }

  function isUnlimitedAmount(value) {
    if (typeof value !== 'bigint') return false;
    return value >= (1n << 128n);
  }

  function decodeEvmCall(tx = {}) {
    const data = String(tx.data || tx.input || '').toLowerCase();
    if (!data.startsWith('0x') || data.length < 10) {
      return { method: tx.value ? 'transfer' : 'transaction', approval: tx.value ? 'exact' : 'none' };
    }

    const selector = data.slice(0, 10);
    if (selector === '0x095ea7b3') {
      const amount = decodeUintParam(data, 1);
      return {
        method: 'approve',
        spender: decodeAddressParam(data, 0),
        approval: isUnlimitedAmount(amount) ? 'unlimited' : 'exact'
      };
    }

    if (selector === '0xa22cb465') {
      return {
        method: 'setApprovalForAll',
        spender: decodeAddressParam(data, 0),
        approval: decodeBoolParam(data, 1) ? 'unlimited' : 'none'
      };
    }

    if (selector === '0xd505accf' || selector === '0x2b67b570') {
      return { method: 'permit', approval: 'unlimited' };
    }

    if (selector === '0x23b872dd' || selector === '0x42842e0e' || selector === '0xb88d4fde') {
      return {
        method: 'nftTransfer',
        sender: decodeAddressParam(data, 0),
        recipient: decodeAddressParam(data, 1),
        approval: 'exact'
      };
    }

    if (selector === '0xf242432a' || selector === '0x2eb2c2d6') {
      return {
        method: 'nftTransfer',
        sender: decodeAddressParam(data, 0),
        recipient: decodeAddressParam(data, 1),
        approval: 'exact'
      };
    }

    return { method: 'contractCall', approval: 'exact' };
  }

  function requestPayloadText(params) {
    try {
      return JSON.stringify(params || []);
    } catch {
      return '';
    }
  }

  function looksLikePermitPayload(params) {
    return /\b(Permit|PermitSingle|PermitBatch|permit2?|allowance|spender)\b/i.test(requestPayloadText(params));
  }

  function normalizeProviderRequest(request = {}) {
    return {
      method: request.method || '',
      params: Array.isArray(request.params) ? request.params : []
    };
  }

  function firstTransactionLikeParam(method, params) {
    if (method === 'wallet_sendCalls') {
      const callBatch = params[0];
      return callBatch?.calls?.[0] || {};
    }

    return params.find(param => param && typeof param === 'object' && !Array.isArray(param)) || {};
  }

  function intentFromProviderRequest(request = {}, defaults = {}) {
    const normalized = normalizeProviderRequest(request);
    const tx = firstTransactionLikeParam(normalized.method, normalized.params);
    const decoded = decodeEvmCall(tx);
    const signature = defaultSignatureMethods.includes(normalized.method);
    const walletConfiguration = ['wallet_addEthereumChain', 'wallet_switchEthereumChain', 'wallet_watchAsset'].includes(normalized.method);
    const permitLike = signature && looksLikePermitPayload(normalized.params);
    const method = signature || normalized.method === 'eth_sign' || walletConfiguration || normalized.method === 'eth_sendRawTransaction' || normalized.method === 'wallet_sendCalls'
      ? normalized.method
      : (decoded.method || normalized.method);
    const source = defaults.source || defaults.market || defaults.appName || 'Wallet provider';
    const chainId = tx.chainId || defaults.chainId || defaults.network || '';
    const symbol = defaults.symbol || 'ETH';
    const recipient = decoded.spender || tx.to || defaults.recipient || '';

    return {
      source,
      market: defaults.market || source,
      chainId,
      symbol,
      amountValue: tx.value ? weiToEth(tx.value) : Number(defaults.amountValue || 0),
      recipient,
      spender: decoded.spender || recipient,
      sender: decoded.sender || tx.from || '',
      assetRecipient: decoded.recipient || '',
      method: permitLike ? 'permit' : method,
      approval: permitLike ? 'unlimited' : (decoded.approval || 'none'),
      origin: defaults.origin || normalizeOrigin(),
      readOnly: false,
      providerMethod: normalized.method
    };
  }

  function isSuspiciousOrigin(origin = '', pattern) {
    const detector = pattern || /xn--|airdrop|claim|bonus|walletconnect-/i;
    return detector.test(origin);
  }

  function statusFor(security) {
    if (security.decision === 'block') return 'Blocked';
    if (security.decision === 'hold') return 'Needs review';
    return 'Ready';
  }

  function createGuard(options = {}) {
    const trustedSources = options.trustedSources || options.trustedMarkets || {};
    const blockedAddresses = new Set(toArray(options.blockedAddresses || defaultBlockedAddresses).map(normalizeAddress));
    const highRiskMethods = new Set(toArray(options.highRiskMethods || defaultHighRiskMethods));
    const signatureMethods = new Set(toArray(options.signatureMethods || defaultSignatureMethods));
    const suspiciousOriginPattern = options.suspiciousOriginPattern;
    const holdThreshold = options.holdThreshold || 45;

    function audit(intent = {}, context = {}) {
      const findings = [];
      const sourceName = intent.source || intent.market;
      const registry = trustedSources[sourceName];
      const to = normalizeAddress(intent.recipient);
      const spender = normalizeAddress(intent.spender || intent.recipient);
      const sender = normalizeAddress(intent.sender);
      const assetRecipient = normalizeAddress(intent.assetRecipient);
      const walletAddress = normalizeAddress(context.walletAddress);
      const signatureRequest = signatureMethods.has(intent.providerMethod || intent.method);

      if (intent.readOnly) {
        addFinding(findings, 'info', 'Source preview', 'READ_ONLY');
      }

      if (!registry) {
        addFinding(findings, 'high', 'Unknown source', 'UNKNOWN_SOURCE');
      } else {
        if (intent.chainId && Array.isArray(registry.chains) && !registry.chains.includes(intent.chainId)) {
          addFinding(findings, 'high', 'Source-network mismatch', 'CHAIN_MISMATCH');
        }
        if (!intent.readOnly && !signatureRequest && normalizeAddress(registry.recipient) !== to) {
          addFinding(findings, 'critical', 'Recipient mismatch', 'RECIPIENT_MISMATCH');
        }
        if (intent.origin && registry.domain && !intent.origin.includes(registry.domain)) {
          addFinding(findings, 'high', 'Origin mismatch', 'ORIGIN_MISMATCH');
        }
      }

      if (blockedAddresses.has(to) || blockedAddresses.has(spender) || blockedAddresses.has(assetRecipient)) {
        addFinding(findings, 'critical', 'Blocked recipient', 'BLOCKED_RECIPIENT');
      }

      if (highRiskMethods.has(intent.method)) {
        addFinding(findings, 'critical', 'Dangerous method', 'DANGEROUS_METHOD');
      }

      if (intent.providerMethod === 'wallet_sendCalls' || intent.method === 'wallet_sendCalls') {
        addFinding(findings, 'high', 'Batched wallet call', 'BATCHED_CALL');
      }

      if (intent.providerMethod === 'eth_sendRawTransaction' || intent.method === 'eth_sendRawTransaction') {
        addFinding(findings, 'critical', 'Opaque raw transaction', 'RAW_TRANSACTION');
      }

      if (intent.method === 'nftTransfer') {
        addFinding(findings, 'high', 'NFT transfer request', 'NFT_TRANSFER');
        if (walletAddress && sender && sender !== walletAddress) {
          addFinding(findings, 'medium', 'NFT sender differs from connected wallet', 'NFT_SENDER_MISMATCH');
        }
      }

      if (intent.method === 'wallet_addEthereumChain' || intent.method === 'wallet_switchEthereumChain') {
        addFinding(findings, 'high', 'Wallet network change', 'WALLET_NETWORK_CHANGE');
      }

      if (intent.method === 'wallet_watchAsset') {
        addFinding(findings, 'medium', 'Token import request', 'TOKEN_IMPORT_REQUEST');
      }

      if (signatureRequest) {
        addFinding(findings, 'high', 'Signature request', 'SIGNATURE_REQUEST');
      }

      if (intent.approval === 'unlimited') {
        addFinding(findings, 'critical', 'Unlimited approval', 'UNLIMITED_APPROVAL');
      }

      if (isSuspiciousOrigin(intent.origin, suspiciousOriginPattern)) {
        addFinding(findings, 'critical', 'Suspicious origin', 'SUSPICIOUS_ORIGIN');
      }

      if (!intent.readOnly && registry?.caps) {
        const cap = registry.caps[intent.symbol] ?? Number.POSITIVE_INFINITY;
        if (Number(intent.amountValue || 0) > cap) {
          addFinding(findings, 'high', 'Amount over policy', 'AMOUNT_OVER_POLICY');
        }
      }

      if (!context.walletAddress && !intent.readOnly) {
        addFinding(findings, 'info', 'No hot account attached', 'NO_HOT_ACCOUNT');
      }

      if (!findings.length) {
        addFinding(findings, 'info', 'Policy clean', 'POLICY_CLEAN');
      }

      const score = findings.reduce((sum, finding) => sum + riskPoints(finding.level), 0);
      const hasCritical = findings.some(finding => finding.level === 'critical');
      const decision = hasCritical ? 'block' : score >= holdThreshold ? 'hold' : 'allow';

      return {
        decision,
        score,
        findings,
        checkedAt: new Date().toISOString(),
        version: '1.0.0'
      };
    }

    function buildAction(intent = {}, actionOptions = {}, context = {}) {
      const security = audit(intent, context);
      return {
        id: actionOptions.id || createId(),
        transport: actionOptions.transport || 'USB',
        status: statusFor(security),
        security,
        ...intent
      };
    }

    return {
      audit,
      buildAction,
      statusFor,
      protocols
    };
  }

  function createBackgroundMonitor(options = {}) {
    const guard = options.guard || createGuard(options);
    const protectedMethods = new Set(toArray(options.protectedMethods || defaultProtectedMethods));
    const blockDecisions = new Set(toArray(options.blockDecisions || ['block']));
    const getContext = typeof options.getContext === 'function' ? options.getContext : () => options.context || {};
    const getIntentDefaults = typeof options.getIntentDefaults === 'function' ? options.getIntentDefaults : () => options.intentDefaults || {};
    let provider = null;
    let originalRequest = null;
    let running = false;

    function emit(callbackName, event) {
      if (typeof options[callbackName] === 'function') options[callbackName](event);
    }

    function inspectIntent(intent = {}, meta = {}) {
      const context = { ...getContext(), ...(meta.context || {}) };
      const security = guard.audit(intent, context);
      const event = {
        type: meta.type || 'intent',
        intent,
        request: meta.request || null,
        security,
        checkedAt: security.checkedAt
      };

      emit('onAudit', event);
      if (security.decision !== 'allow') emit('onWarning', event);
      return event;
    }

    function inspectRequest(request = {}) {
      const normalized = normalizeProviderRequest(request);
      const intent = intentFromProviderRequest(normalized, getIntentDefaults());
      return inspectIntent(intent, { type: 'provider-request', request: normalized });
    }

    function install(nextProvider = options.provider) {
      if (!nextProvider || typeof nextProvider.request !== 'function') return api;
      if (running && provider === nextProvider) return api;
      if (running) stop();

      provider = nextProvider;
      originalRequest = provider.request.bind(provider);

      provider.request = async request => {
        const normalized = normalizeProviderRequest(request);
        if (protectedMethods.has(normalized.method)) {
          const event = inspectRequest(normalized);
          if (blockDecisions.has(event.security.decision)) {
            const error = new Error(`Blocked by Dreaded Guard: ${event.security.findings.map(finding => finding.label).join(', ')}`);
            error.code = 4001;
            error.security = event.security;
            error.intent = event.intent;
            throw error;
          }
          if (event.security.decision === 'hold' && typeof options.onReview === 'function') {
            const approved = await options.onReview(event);
            if (!approved) {
              const error = new Error('Denied by Dreaded Guard review');
              error.code = 4001;
              error.security = event.security;
              error.intent = event.intent;
              throw error;
            }
          }
        }

        return originalRequest(request);
      };

      running = true;
      return api;
    }

    function stop() {
      if (provider && originalRequest) provider.request = originalRequest;
      provider = null;
      originalRequest = null;
      running = false;
      return api;
    }

    const api = {
      install,
      stop,
      audit: inspectIntent,
      inspectRequest,
      intentFromProviderRequest,
      isRunning: () => running
    };

    if (options.provider) install(options.provider);
    return api;
  }

  function renderResult(target, security) {
    const element = typeof target === 'string' ? document.querySelector(target) : target;
    if (!element || !security) return;

    element.innerHTML = `
      <div class="dreaded-guard-result dreaded-guard-${security.decision}">
        <strong>${statusFor(security)}</strong>
        <span>Score ${security.score}</span>
        <ul>
          ${security.findings.map(finding => `<li data-level="${finding.level}">${finding.label}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  return {
    createGuard,
    createBackgroundMonitor,
    intentFromProviderRequest,
    statusFor,
    renderResult,
    protocols,
    defaultBlockedAddresses,
    defaultHighRiskMethods,
    defaultProtectedMethods,
    version: '1.0.0'
  };
}));

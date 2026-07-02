const guard = DreadedGuard.createGuard({
  trustedSources: {
    Zora: {
      domain: 'zora.co',
      recipient: '0x1111111111111111111111111111111111111111',
      chains: ['base'],
      caps: { ETH: 0.35 }
    }
  }
});

const example = {
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
};

const input = document.querySelector('#intentInput');
input.value = JSON.stringify(example, null, 2);

document.querySelector('#auditIntent').addEventListener('click', () => {
  const intent = JSON.parse(input.value);
  DreadedGuard.renderResult('#guardResult', guard.audit(intent, { walletAddress: '' }));
});

DreadedGuard.renderResult('#guardResult', guard.audit(example, { walletAddress: '' }));

let deferredInstallPrompt = null;

window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelector('#installStatus').textContent = 'Install prompt ready.';
});

document.querySelector('#installPwa').addEventListener('click', async () => {
  if (!deferredInstallPrompt) {
    document.querySelector('#installStatus').textContent = 'Use the browser menu and choose Install app. On iOS, use Share, then Add to Home Screen.';
    return;
  }

  deferredInstallPrompt.prompt();
  const choice = await deferredInstallPrompt.userChoice.catch(() => null);
  document.querySelector('#installStatus').textContent = choice?.outcome === 'accepted'
    ? 'Dreaded Apes Wallet install started.'
    : 'Install dismissed. You can try again from the browser menu.';
  deferredInstallPrompt = null;
});

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('../sw.js').catch(() => null);
  });
}

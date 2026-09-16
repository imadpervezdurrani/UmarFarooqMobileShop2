// PWA Service Worker Registration & Install Prompt Manager

let deferredPrompt = null;
let isInstallPromptAvailable = false;

// Check if app is already running as installed standalone PWA
export const isPwaInstalled = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true ||
    document.referrer.includes('android-app://')
  );
};

// Check if user is on iOS / iPadOS
export const isIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

// Trigger browser native install prompt
export const promptPwaInstall = async () => {
  if (!deferredPrompt) {
    return { outcome: 'unavailable' };
  }

  deferredPrompt.prompt();
  const choiceResult = await deferredPrompt.userChoice;
  deferredPrompt = null;
  isInstallPromptAvailable = false;
  window.dispatchEvent(new CustomEvent('pwa-install-status', { detail: { isAvailable: false } }));
  return choiceResult;
};

// Check if prompt can be shown
export const canInstallPwa = () => {
  return isInstallPromptAvailable && !isPwaInstalled();
};

export function registerServiceWorker() {
  if (typeof window === 'undefined') return;

  // Listen for beforeinstallprompt event (Chrome, Edge, Samsung Internet, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    isInstallPromptAvailable = true;
    window.dispatchEvent(new CustomEvent('pwa-install-status', { detail: { isAvailable: true } }));
  });

  // Listen for appinstalled event
  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    isInstallPromptAvailable = false;
    window.dispatchEvent(new CustomEvent('pwa-install-status', { detail: { isAvailable: false, installed: true } }));
    console.log('[PWA] Umar Farooq Mobile Zone installed successfully!');
  });

  // Register service worker
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Use relative path for compatibility with Electron and Vite preview
      const swUrl = './sw.js';
      navigator.serviceWorker
        .register(swUrl)
        .then((reg) => {
          console.log('[PWA] Service Worker registered with scope:', reg.scope);

          reg.onupdatefound = () => {
            const installingWorker = reg.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available. Refresh to update.');
                }
              };
            }
          };
        })
        .catch((err) => {
          console.warn('[PWA] Service Worker registration failed:', err);
        });
    });
  }
}

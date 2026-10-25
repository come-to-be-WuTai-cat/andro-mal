import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone =
      'standalone' in window.navigator &&
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    return isStandaloneDisplay || isIosStandalone;
  });
  const [isIOS] = useState(() => {
    if (typeof window === 'undefined') return false;
    return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
  });
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches;
    const isIosStandalone =
      'standalone' in window.navigator &&
      Boolean((window.navigator as unknown as { standalone?: boolean }).standalone);
    if (isStandaloneDisplay || isIosStandalone) return false;

    const isIosDevice = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
    if (isIosDevice) {
      return !sessionStorage.getItem('andromal-install-dismissed');
    }
    return false;
  });

  useEffect(() => {
    // Android / Chrome PWA install event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      const dismissed = sessionStorage.getItem('andromal-install-dismissed');
      if (!dismissed) {
        setIsVisible(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsVisible(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem('andromal-install-dismissed', 'true');
  };

  if (isInstalled || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Install application"
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 transition-all duration-200"
    >
      <div className="bg-surface-2 border border-border-strong rounded-card p-3.5 flex items-center gap-3 text-text">
        <div className="w-10 h-10 rounded-button overflow-hidden shrink-0 border border-border bg-surface">
          <img
            src="/favicon/android-chrome-192x192.png"
            alt="AndroMal Logo"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-text truncate">Install AndroMal Console</h4>
            <Badge variant="info" size="sm">PWA</Badge>
          </div>
          <p className="text-[11px] text-muted mt-0.5 line-clamp-1">
            {isIOS 
              ? 'Tap Share then "Add to Home Screen"' 
              : 'Add to device for standalone APK inspection'}
          </p>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {!isIOS && deferredPrompt && (
            <Button
              size="sm"
              variant="primary"
              onClick={handleInstallClick}
              aria-label="Install application"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Install</span>
            </Button>
          )}

          <button
            onClick={handleDismiss}
            aria-label="Dismiss install banner"
            className="p-1.5 text-muted hover:text-text hover:bg-surface rounded-button transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
};

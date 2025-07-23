import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Save the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install prompt
      setShowPrompt(true);
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Remember user dismissed the prompt
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if user previously dismissed or if no prompt available
  if (!showPrompt || !deferredPrompt || localStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Smartphone className="h-6 w-6 text-blue-600" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900">
            Install Store Manager
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Add to your home screen for quick access and offline functionality.
          </p>
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleInstallClick}
              className="flex items-center space-x-1 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Install</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Not now
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
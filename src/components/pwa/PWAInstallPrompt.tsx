'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowDownTrayIcon, 
  XMarkIcon, 
  DevicePhoneMobileIcon,
  ComputerDesktopIcon,
  WifiIcon,
  BoltIcon
} from '@heroicons/react/24/outline';
import { getPWAManager } from '@/lib/pwa/pwa-manager';

interface PWAInstallPromptProps {
  className?: string;
  autoShow?: boolean;
  delay?: number;
}

export default function PWAInstallPrompt({ 
  className = '', 
  autoShow = true, 
  delay = 30000 
}: PWAInstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{ quota: number; usage: number } | null>(null);

  useEffect(() => {
    const pwaManager = getPWAManager({
      autoPrompt: false, // We handle the prompt manually
      delayMs: delay,
      maxPrompts: 3,
    });

    // Check initial states
    setCanInstall(pwaManager.canInstall());
    setIsInstalled(pwaManager.isAppInstalled());
    setIsOnline(pwaManager.isOnline());

    // Set up event listeners
    pwaManager.on('installable', () => {
      setCanInstall(true);
      if (autoShow) {
        setTimeout(() => setShowPrompt(true), delay);
      }
    });

    pwaManager.on('installed', () => {
      setIsInstalled(true);
      setShowPrompt(false);
    });

    pwaManager.on('online', () => setIsOnline(true));
    pwaManager.on('offline', () => setIsOnline(false));

    // Get storage info
    pwaManager.getStorageUsage().then(setStorageInfo);

    return () => {
      // Cleanup if needed
    };
  }, [autoShow, delay]);

  const handleInstall = async () => {
    const pwaManager = getPWAManager();
    const installed = await pwaManager.showInstallPrompt();
    
    if (installed) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Optional: Remember user preference
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  const handleResetPrompt = () => {
    const pwaManager = getPWAManager();
    pwaManager.resetInstallPrompt();
    setShowPrompt(true);
  };

  const formatStorageSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Don't show if already installed
  if (isInstalled) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <BoltIcon className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-green-900">App installée</h3>
            <p className="text-sm text-green-700">
              WebGen V2 est installé et prêt à utiliser hors ligne !
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Manual Install Button (always visible if can install) */}
      {canInstall && !showPrompt && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={() => setShowPrompt(true)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 transition-colors"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Installer</span>
        </motion.button>
      )}

      {/* Main Install Prompt */}
      <AnimatePresence>
        {showPrompt && canInstall && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                      <ArrowDownTrayIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Installer WebGen V2</h2>
                      <p className="text-blue-100 text-sm">Application Web Progressive</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDismiss}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="space-y-4">
                  {/* Benefits */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <WifiIcon className="w-5 h-5 text-blue-600" />
                      <span className="text-sm text-gray-700">Fonctionne hors ligne</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BoltIcon className="w-5 h-5 text-green-600" />
                      <span className="text-sm text-gray-700">Ultra rapide</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DevicePhoneMobileIcon className="w-5 h-5 text-purple-600" />
                      <span className="text-sm text-gray-700">Sur votre écran d'accueil</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ComputerDesktopIcon className="w-5 h-5 text-orange-600" />
                      <span className="text-sm text-gray-700">Comme une app native</span>
                    </div>
                  </div>

                  {/* Storage Info */}
                  {storageInfo && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-sm text-gray-600 mb-1">Stockage disponible</div>
                      <div className="text-xs text-gray-500">
                        {formatStorageSize(storageInfo.usage)} utilisés sur {formatStorageSize(storageInfo.quota)}
                      </div>
                      <div className="mt-2 bg-gray-200 rounded-full h-1">
                        <div 
                          className="bg-blue-600 h-1 rounded-full"
                          style={{ 
                            width: `${(storageInfo.usage / storageInfo.quota) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Network Status */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Statut réseau</span>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                        {isOnline ? 'En ligne' : 'Hors ligne'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={handleDismiss}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Plus tard
                  </button>
                  <button
                    onClick={handleInstall}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Installer maintenant
                  </button>
                </div>

                {/* Small print */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  L'installation crée un raccourci sur votre appareil. Aucune donnée n'est envoyée à un store.
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Debug/Admin Controls (only in development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="fixed bottom-4 left-4 z-40 bg-gray-900 text-white p-3 rounded-lg text-xs space-y-2">
          <div>PWA Debug:</div>
          <div>Can Install: {canInstall ? 'Yes' : 'No'}</div>
          <div>Installed: {isInstalled ? 'Yes' : 'No'}</div>
          <div>Online: {isOnline ? 'Yes' : 'No'}</div>
          {!showPrompt && (
            <button 
              onClick={handleResetPrompt}
              className="bg-blue-600 px-2 py-1 rounded text-xs"
            >
              Reset & Show
            </button>
          )}
        </div>
      )}
    </>
  );
}
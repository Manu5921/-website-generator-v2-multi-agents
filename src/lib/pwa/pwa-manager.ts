'use client';

export interface PWAInstallEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export class PWAManager {
  private static instance: PWAManager;
  private deferredPrompt: PWAInstallEvent | null = null;
  private isInstalled = false;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  public static getInstance(): PWAManager {
    if (!PWAManager.instance) {
      PWAManager.instance = new PWAManager();
    }
    return PWAManager.instance;
  }

  private async init() {
    // Check if app is already installed
    this.checkInstallation();

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: Install prompt available');
      e.preventDefault();
      this.deferredPrompt = e as PWAInstallEvent;
      this.notifyInstallAvailable();
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA: App installed successfully');
      this.isInstalled = true;
      this.deferredPrompt = null;
      this.notifyInstalled();
    });

    // Register service worker
    await this.registerServiceWorker();

    // Register for push notifications
    await this.setupPushNotifications();
  }

  private async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        // First, unregister existing service workers to avoid conflicts
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }

        // Register new service worker
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });

        console.log('PWA: Service Worker registered successfully');

        // Listen for updates
        this.registration.addEventListener('updatefound', () => {
          const newWorker = this.registration?.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('PWA: New content available, reload to update');
                this.notifyUpdateAvailable();
              }
            });
          }
        });

      } catch (error) {
        console.error('PWA: Service Worker registration failed:', error);
      }
    }
  }

  private checkInstallation(): void {
    // Check various indicators that the app is installed
    this.isInstalled = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: fullscreen)').matches ||
      (window.navigator as any).standalone === true;

    console.log('PWA: App installed status:', this.isInstalled);
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) {
      console.log('PWA: Install prompt not available');
      return false;
    }

    try {
      await this.deferredPrompt.prompt();
      const choiceResult = await this.deferredPrompt.userChoice;
      
      console.log('PWA: Install prompt result:', choiceResult.outcome);
      
      this.deferredPrompt = null;
      return choiceResult.outcome === 'accepted';
    } catch (error) {
      console.error('PWA: Install prompt failed:', error);
      return false;
    }
  }

  public isInstallAvailable(): boolean {
    return this.deferredPrompt !== null;
  }

  public getInstallationStatus(): boolean {
    return this.isInstalled;
  }

  private async setupPushNotifications(): Promise<void> {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.log('PWA: Push notifications not supported');
      return;
    }

    // Request permission if not already granted
    if (Notification.permission === 'default') {
      console.log('PWA: Requesting notification permission');
    }
  }

  public async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('PWA: Service Worker not registered');
      return null;
    }

    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('PWA: Notification permission denied');
        return null;
      }

      // Subscribe to push notifications
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        )
      });

      console.log('PWA: Push subscription created');
      
      // Send subscription to server
      await this.sendSubscriptionToServer(subscription);
      
      return subscription;
    } catch (error) {
      console.error('PWA: Push subscription failed:', error);
      return null;
    }
  }

  private async sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('PWA: Failed to send subscription to server:', error);
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  public async updateServiceWorker(): Promise<void> {
    if (this.registration) {
      await this.registration.update();
      window.location.reload();
    }
  }

  // Event handlers (can be overridden)
  private notifyInstallAvailable(): void {
    console.log('PWA: Install available');
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-install-available'));
  }

  private notifyInstalled(): void {
    console.log('PWA: App installed');
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-installed'));
  }

  private notifyUpdateAvailable(): void {
    console.log('PWA: Update available');
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('pwa-update-available'));
  }

  // Offline detection
  public isOnline(): boolean {
    return navigator.onLine;
  }

  public addOfflineListener(callback: (online: boolean) => void): void {
    const handler = () => callback(this.isOnline());
    window.addEventListener('online', handler);
    window.addEventListener('offline', handler);
  }

  // Background sync
  public async requestBackgroundSync(tag: string): Promise<void> {
    if (!this.registration || !('sync' in this.registration)) {
      console.log('PWA: Background sync not supported');
      return;
    }

    try {
      await this.registration.sync.register(tag);
      console.log('PWA: Background sync registered for:', tag);
    } catch (error) {
      console.error('PWA: Background sync registration failed:', error);
    }
  }
}

// Export singleton instance
export const pwaManager = PWAManager.getInstance();
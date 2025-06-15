// Service Worker for PWA functionality
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'webgen-v2-cache-v1';
const STATIC_CACHE_NAME = 'webgen-v2-static-v1';
const DYNAMIC_CACHE_NAME = 'webgen-v2-dynamic-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// API routes to cache with different strategies
const API_CACHE_ROUTES = [
  '/api/demandes',
  '/api/dashboard/demandes',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== STATIC_CACHE_NAME &&
              cacheName !== DYNAMIC_CACHE_NAME &&
              cacheName.startsWith('webgen-v2-')
            ) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all pages
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip extension requests
  if (url.protocol === 'chrome-extension:') return;

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network First strategy
    event.respondWith(networkFirstStrategy(request));
  } else if (url.pathname.startsWith('/_next/static/')) {
    // Static assets - Cache First strategy
    event.respondWith(cacheFirstStrategy(request));
  } else if (STATIC_ASSETS.includes(url.pathname)) {
    // App shell - Cache First with network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else {
    // Other requests - Stale While Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Caching strategies
async function networkFirstStrategy(request: Request): Promise<Response> {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If it's an API request, return a helpful offline response
    if (request.url.includes('/api/')) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Offline - please check your connection',
          offline: true
        }),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    throw error;
  }
}

async function cacheFirstStrategy(request: Request): Promise<Response> {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Cache miss, fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Network failed and no cache - return offline page for navigation requests
    if (request.destination === 'document') {
      const offlineResponse = await caches.match('/');
      if (offlineResponse) return offlineResponse;
    }
    
    throw error;
  }
}

async function staleWhileRevalidateStrategy(request: Request): Promise<Response> {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);
  
  // Start fetch in background
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // No cache, wait for network
  return fetchPromise;
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-demandes') {
    event.waitUntil(syncDemandes());
  }
});

async function syncDemandes() {
  try {
    // Get pending actions from IndexedDB or localStorage
    const pendingActions = await getPendingActions();
    
    for (const action of pendingActions) {
      try {
        await fetch(action.url, {
          method: action.method,
          headers: action.headers,
          body: action.body
        });
        
        // Remove from pending actions on success
        await removePendingAction(action.id);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Utility functions for managing pending actions
async function getPendingActions(): Promise<any[]> {
  // This would typically use IndexedDB
  // For now, return empty array
  return [];
}

async function removePendingAction(id: string): Promise<void> {
  // This would remove the action from IndexedDB
  console.log('Removing pending action:', id);
}

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push notification received');
  
  if (!event.data) return;
  
  try {
    const data = event.data.json();
    
    const options: NotificationOptions = {
      body: data.body || 'Nouvelle notification',
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: data.tag || 'default',
      requireInteraction: data.requireInteraction || false,
      actions: data.actions || [],
      data: data.data || {}
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Website Generator V2', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked');
  
  event.notification.close();
  
  const urlToOpen = event.notification.data?.url || '/dashboard';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clients) => {
        // Check if there's already a window/tab open with the target URL
        for (const client of clients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // No existing window, open a new one
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

export {};
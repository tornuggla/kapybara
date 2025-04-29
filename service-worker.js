// Enhanced Kapybara Service Worker for offline capabilities

const CACHE_NAME = 'kapybara-cache-v2';
const APP_SHELL = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/favicon.ico',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/site.webmanifest'
];

const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Raleway:wght@300;400;500;600;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/fontawesome.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/solid.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/brands.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2'
];

// Combine all resources to cache
const urlsToCache = [...APP_SHELL, ...EXTERNAL_RESOURCES];

// Install event - cache app shell and critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Opened cache');
        
        // Cache app shell first
        return cache.addAll(APP_SHELL)
          .then(() => {
            // Then attempt to cache external resources (but don't fail if some fail)
            return Promise.allSettled(
              EXTERNAL_RESOURCES.map(url => 
                cache.add(url).catch(err => 
                  console.warn(`[Service Worker] Failed to cache: ${url}`, err)
                )
              )
            );
          });
      })
      .catch(error => {
        console.error('[Service Worker] Cache installation failed:', error);
      })
  );
});

// Enhanced fetch event with improved caching strategies
self.addEventListener('fetch', event => {
  const request = event.request;
  
  // Handle different types of requests
  if (request.mode === 'navigate') {
    // Navigation requests - use Cache then Network strategy with fallback
    event.respondWith(handleNavigationRequest(request));
  } else if (request.url.includes('/api/')) {
    // API requests - use Network Only strategy
    event.respondWith(fetch(request));
  } else if (request.url.match(/\.(jpe?g|png|gif|svg)$/i)) {
    // Image requests - use Cache First with fallback
    event.respondWith(handleImageRequest(request));
  } else if (request.url.includes('fonts.googleapis.com') || 
             request.url.includes('cdnjs.cloudflare.com')) {
    // External resources - use Stale While Revalidate
    event.respondWith(handleExternalResource(request));
  } else {
    // All other requests - use Cache First with network fallback
    event.respondWith(handleStaticAsset(request));
  }
});

/**
 * Handle navigation requests with improved offline fallback
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // If successful, cache the response and return it
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // If offline, try to return cached home page
    const cachedResponse = await caches.match('/index.html');
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If cache fails, return a custom offline page
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="sv">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - Kapybara</title>
        <style>
          body {
            font-family: sans-serif;
            text-align: center;
            padding: 2rem;
            max-width: 600px;
            margin: 0 auto;
            color: #333;
          }
          h1 { color: #ff775e; }
          .btn {
            display: inline-block;
            padding: 0.8rem 1.5rem;
            background: #ff775e;
            color: white;
            text-decoration: none;
            border-radius: 50px;
            margin-top: 1rem;
          }
        </style>
      </head>
      <body>
        <h1>Du är offline</h1>
        <p>Det ser ut som att du inte har internetanslutning just nu. Kontrollera din anslutning och försök igen.</p>
        <a href="/" class="btn">Försök igen</a>
      </body>
      </html>
      `,
      {
        headers: {
          'Content-Type': 'text/html; charset=utf-8'
        }
      }
    );
  }
}

/**
 * Handle image requests with cache first strategy and fallback
 */
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // If both cache and network fail, return placeholder image
    return createPlaceholderImage();
  }
}

/**
 * Handle static assets with cache first strategy
 */
async function handleStaticAsset(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Return cached response immediately
    // Start a background refresh
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // Otherwise try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // If it's a font, return a system font
    if (request.url.includes('.woff') || request.url.includes('.ttf')) {
      // No direct response for fonts, but browser will fall back to system fonts
      return new Response('/* Font not available - system font fallback will be used */', {
        headers: { 'Content-Type': 'text/css' }
      });
    }
    
    // For CSS/JS, return empty response to prevent page breaking
    if (request.url.endsWith('.css')) {
      return new Response('/* Offline */', { headers: { 'Content-Type': 'text/css' } });
    }
    
    if (request.url.endsWith('.js')) {
      return new Response('// Offline', { headers: { 'Content-Type': 'application/javascript' } });
    }
    
    // For other resources, return a generic error response
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

/**
 * Handle external resources with stale while revalidate
 */
async function handleExternalResource(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  // Start a background fetch regardless of cache status
  const fetchPromise = fetch(request)
    .then(networkResponse => {
      // Update cache with new response
      caches.open(CACHE_NAME)
        .then(cache => cache.put(request, networkResponse.clone()));
      
      return networkResponse;
    })
    .catch(error => {
      console.warn(`[Service Worker] Failed to fetch: ${request.url}`, error);
      // Return null to indicate network failure
      return null;
    });
  
  // Return cached response or wait for fetch
  return cachedResponse || fetchPromise;
}

/**
 * Update cache in background without blocking
 */
function updateCacheInBackground(request) {
  setTimeout(() => {
    fetch(request)
      .then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, response));
        }
      })
      .catch(err => {
        console.warn('[Service Worker] Background update failed:', err);
      });
  }, 500);
}

/**
 * Create a placeholder image for offline use
 */
function createPlaceholderImage() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="150" viewBox="0 0 200 150">
      <rect width="100%" height="100%" fill="#f0f0f0"/>
      <rect x="70" y="20" width="60" height="60" rx="6" fill="#ccc"/>
      <path d="M70 95 h60 M70 110 h40" stroke="#ccc" stroke-width="8" stroke-linecap="round"/>
      <text x="100" y="130" font-family="sans-serif" font-size="12" text-anchor="middle" fill="#888">
        Bild ej tillgänglig offline
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'no-store'
    }
  });
}

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', event => {
  console.log('[Service Worker] Activating Service Worker...');
  
  // Claim clients to ensure updates take effect immediately
  event.waitUntil(clients.claim());
  
  // Clean up old caches
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => cacheName !== CACHE_NAME)
            .map(cacheName => {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
  );
});

// Add offline sync capabilities for forms
const syncFormQueue = [];

// Listen for sync events
self.addEventListener('sync', event => {
  if (event.tag === 'form-sync') {
    console.log('[Service Worker] Syncing forms...');
    event.waitUntil(syncForms());
  }
});

// Handle form submissions when offline
async function syncForms() {
  // In a real implementation, this would retrieve stored form data
  // and submit it when online
  if (syncFormQueue.length > 0) {
    try {
      // Process each form in the queue
      for (const formData of syncFormQueue) {
        // Send the form data
        await fetch('/api/contact', {
          method: 'POST',
          body: JSON.stringify(formData),
          headers: {
            'Content-Type': 'application/json'
          }
        });
      }
      
      // Clear queue after successful submission
      syncFormQueue.length = 0;
      
      // Notify clients that sync is complete
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'FORM_SYNC_COMPLETE'
        });
      });
      
    } catch (error) {
      console.error('[Service Worker] Form sync failed:', error);
      throw error; // This will cause the sync to retry
    }
  }
}
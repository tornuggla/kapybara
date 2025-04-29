// Enhanced Kapybara Service Worker for offline capabilities and performance

const CACHE_NAME = 'kapybara-cache-v3';
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

// Separate cache for external resources
const EXTERNAL_CACHE_NAME = 'kapybara-external-v3';
const EXTERNAL_RESOURCES = [
  'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=Raleway:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/fontawesome.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/solid.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/brands.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-brands-400.woff2',
  'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDUbtM.woff2',
  'https://fonts.gstatic.com/s/raleway/v28/1Ptug8zYS_SKggPNyC0ITw.woff2'
];

// Font files to preload for better performance
const CRITICAL_FONTS = [
  'https://fonts.gstatic.com/s/playfairdisplay/v30/nuFvD-vYSZviVYUb_rj3ij__anPXJzDwcbmjWBN2PKeiukDUbtM.woff2',
  'https://fonts.gstatic.com/s/raleway/v28/1Ptug8zYS_SKggPNyC0ITw.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/webfonts/fa-solid-900.woff2'
];

// Install event - cache app shell and critical assets
self.addEventListener('install', event => {
  console.log('[Service Worker] Installing Service Worker...');
  
  // Skip waiting to activate immediately
  self.skipWaiting();
  
  // Parallel caching of app shell and external resources
  event.waitUntil(Promise.all([
    // Cache app shell - core website files
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(APP_SHELL);
      }),
    
    // Cache external resources separately
    caches.open(EXTERNAL_CACHE_NAME)
      .then(cache => {
        console.log('[Service Worker] Caching external resources');
        
        // First cache critical fonts (highest priority)
        const criticalFontPromises = CRITICAL_FONTS.map(url => 
          cache.add(url).catch(err => 
            console.warn(`[Service Worker] Failed to cache critical font: ${url}`, err)
          )
        );
        
        // Then cache other external resources
        return Promise.all(criticalFontPromises).then(() => {
          const otherExternalResources = EXTERNAL_RESOURCES.filter(
            url => !CRITICAL_FONTS.includes(url)
          );
          
          return Promise.allSettled(
            otherExternalResources.map(url => 
              cache.add(url).catch(err => 
                console.warn(`[Service Worker] Failed to cache external resource: ${url}`, err)
              )
            )
          );
        });
      })
  ]));
});

// Enhanced fetch event with improved caching strategies and resource prioritization
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  
  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET' || 
      url.protocol === 'chrome-extension:' ||
      url.host === 'extensions.amplify.aws') {
    return;
  }
  
  // Handle different types of requests with optimized strategies
  if (request.mode === 'navigate') {
    // Navigation requests - use Network First with Cache Fallback
    event.respondWith(handleNavigationRequest(request));
  } else if (url.pathname.match(/\.(jpe?g|png|gif|svg|webp)$/i)) {
    // Image requests - use Cache First with background refresh
    event.respondWith(handleImageRequest(request));
  } else if (CRITICAL_FONTS.some(font => request.url.includes(font))) {
    // Critical fonts - use Cache First with fast response
    event.respondWith(handleCriticalAsset(request));
  } else if (isExternalResource(request.url)) {
    // External resources - use Stale While Revalidate
    event.respondWith(handleExternalResource(request));
  } else {
    // All other site assets - use Cache First with network fallback
    event.respondWith(handleStaticAsset(request));
  }
});

/**
 * Check if a URL is an external resource
 */
function isExternalResource(url) {
  return url.includes('fonts.googleapis.com') || 
         url.includes('fonts.gstatic.com') ||
         url.includes('cdnjs.cloudflare.com');
}

/**
 * Handle navigation requests with Network First strategy
 */
async function handleNavigationRequest(request) {
  try {
    // Try network first with a timeout
    const networkPromise = fetch(request);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Network timeout')), 3000);
    });
    
    // Race between network and timeout
    const networkResponse = await Promise.race([networkPromise, timeoutPromise]);
    
    // If successful, clone and cache the response
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    // If network fails or times out, try to return cached response
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback to cached index.html
    const cachedIndex = await caches.match('/index.html');
    if (cachedIndex) {
      return cachedIndex;
    }
    
    // Last resort: return a custom offline page
    return createOfflinePage();
  }
}

/**
 * Handle image requests with Cache First strategy
 */
async function handleImageRequest(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Start background update for images without blocking
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the new response for future use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return a placeholder image if fetch fails
    return createPlaceholderImage();
  }
}

/**
 * Handle critical assets (fonts, core JS/CSS) with Cache First
 */
async function handleCriticalAsset(request) {
  // Check cache first for critical assets (should always be there from installation)
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise fetch from network
  try {
    const networkResponse = await fetch(request);
    
    // Cache the response for future use
    if (networkResponse.ok) {
      const cacheName = isExternalResource(request.url) ? 
        EXTERNAL_CACHE_NAME : CACHE_NAME;
      
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Fallback empty response if everything fails
    return new Response('/* Failed to load critical asset */', { 
      status: 408,
      headers: { 'Content-Type': 'text/css' }
    });
  }
}

/**
 * Handle external resources with Stale While Revalidate strategy
 */
async function handleExternalResource(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  
  // Start a background fetch regardless of cache status
  const updatePromise = fetch(request)
    .then(networkResponse => {
      if (networkResponse.ok) {
        caches.open(EXTERNAL_CACHE_NAME)
          .then(cache => cache.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(error => {
      console.warn(`[Service Worker] Failed to update: ${request.url}`, error);
      return null;
    });
  
  // Return cached response or await the network
  return cachedResponse || updatePromise;
}

/**
 * Handle static assets with Cache First strategy
 */
async function handleStaticAsset(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    // Start background update for static assets
    updateCacheInBackground(request);
    return cachedResponse;
  }
  
  // If not in cache, try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses for future use
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // For CSS, return empty stylesheet
    if (request.url.endsWith('.css')) {
      return new Response('/* Offline */', { headers: { 'Content-Type': 'text/css' } });
    }
    
    // For JS, return empty script
    if (request.url.endsWith('.js')) {
      return new Response('// Offline', { headers: { 'Content-Type': 'application/javascript' } });
    }
    
    // For other resources, return a generic error response
    return new Response('Resource unavailable offline', { status: 503 });
  }
}

/**
 * Update cache in background without blocking
 */
function updateCacheInBackground(request) {
  // Don't wait for this to complete
  setTimeout(() => {
    fetch(request)
      .then(response => {
        if (response && response.ok) {
          const cacheName = isExternalResource(request.url) ? 
            EXTERNAL_CACHE_NAME : CACHE_NAME;
          
          caches.open(cacheName)
            .then(cache => cache.put(request, response));
        }
      })
      .catch(() => {
        // Silently fail background updates
      });
  }, 1000);
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

/**
 * Create a custom offline page
 */
function createOfflinePage() {
  const offlinePage = `
    <!DOCTYPE html>
    <html lang="sv">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Offline - Kapybara</title>
      <style>
        :root {
          --dark: #1a1b21;
          --light: #ffffff;
          --accent: #e85c42;
        }
        
        body {
          font-family: sans-serif;
          text-align: center;
          padding: 2rem;
          max-width: 600px;
          margin: 0 auto;
          color: var(--dark);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }
        
        h1 { 
          color: var(--accent); 
          margin-bottom: 1rem;
        }
        
        p {
          margin-bottom: 2rem;
          line-height: 1.6;
        }
        
        .offline-icon {
          width: 80px;
          height: 80px;
          margin-bottom: 2rem;
          border-radius: 50%;
          background: rgba(232, 92, 66, 0.1);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
        }
        
        .btn {
          display: inline-block;
          padding: 0.8rem 1.5rem;
          background: var(--accent);
          color: white;
          text-decoration: none;
          border-radius: 50px;
          margin-top: 1rem;
        }
      </style>
    </head>
    <body>
      <div class="offline-icon">📶</div>
      <h1>Du är offline</h1>
      <p>Det ser ut som att du inte har internetanslutning just nu. Kontrollera din anslutning och försök igen.</p>
      <a href="/" class="btn">Försök igen</a>
    </body>
    </html>
  `;
  
  return new Response(offlinePage, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
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
            .filter(cacheName => {
              return (cacheName !== CACHE_NAME && 
                     cacheName !== EXTERNAL_CACHE_NAME);
            })
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

// Listen for messages from the main thread
self.addEventListener('message', event => {
  // Handle messages sent from the page
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
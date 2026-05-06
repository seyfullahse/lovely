// Planora Service Worker – PWA offline desteği & cache stratejisi
const CACHE_NAME = 'planora-v2'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json',
]

// Kurulum: Statik dosyaları önbelleğe al
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  // Yeni SW'yi hemen aktifleştir
  self.skipWaiting()
})

// Aktivasyon: Eski önbellekleri temizle
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

// Fetch: Network-first stratejisi (önce ağ, düşerse cache)
self.addEventListener('fetch', (event) => {
  const { request } = event

  // API çağrıları ve Firebase isteklerini cache'leme
  if (
    request.url.includes('firestore.googleapis.com') ||
    request.url.includes('identitytoolkit.googleapis.com') ||
    request.url.includes('securetoken.googleapis.com') ||
    request.method !== 'GET'
  ) {
    return
  }

  // Google Fonts cache'le (cache-first)
  if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached
        return fetch(request).then((response) => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
          return response
        })
      })
    )
    return
  }

  // Diğer istekler: Network-first
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Başarılı yanıtları cache'le
        if (response.status === 200) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Ağ yoksa cache'den dön
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // Navigasyon isteklerinde offline sayfası olarak index.html döndür
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
          return new Response('Çevrimdışı', { status: 503, statusText: 'Offline' })
        })
      })
  )
})

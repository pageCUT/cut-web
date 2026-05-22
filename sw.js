/* ================================================================
   CUT — Service Worker  |  PWA v2.0
   Cache-first con fallback offline
   ================================================================ */

const CACHE_NAME   = 'cut-cache-v2';
const OFFLINE_URL  = '/cut-web/offline.html';

/* Archivos a pre-cachear en la instalación */
const PRE_CACHE = [
  '/cut-web/',
  '/cut-web/index.html',
  '/cut-web/404.html',
  '/cut-web/manifest.json',
  '/cut-web/assets/css/styles.css',
  '/cut-web/assets/css/blogger.css',
  '/cut-web/assets/js/main.js',
  '/cut-web/assets/images/logo-cut.png',
  '/cut-web/pages/quienes-somos.html',
  '/cut-web/pages/noticias.html',
  '/cut-web/pages/sindicatos.html',
  '/cut-web/pages/documentos.html',
  '/cut-web/pages/junta-directiva.html',
  '/cut-web/pages/contacto.html',
  '/cut-web/pages/afiliacion.html',
  '/cut-web/pages/publicaciones.html',
  'https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;700;900&family=Barlow:wght@400;500;600;700&family=Atkinson+Hyperlegible:wght@400;700&display=swap'
];

/* ---- INSTALL: pre-cachear todos los assets ---- */
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(PRE_CACHE.map(function(url) {
        return new Request(url, { credentials: 'same-origin' });
      })).catch(function(err) {
        console.warn('[SW] Pre-cache parcial:', err);
      });
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

/* ---- ACTIVATE: limpiar cachés antiguos ---- */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

/* ---- FETCH: cache-first, red si no hay caché, offline si falla ---- */
self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);

  /* Ignorar peticiones que no son GET o son de otros orígenes externos */
  if (event.request.method !== 'GET') return;
  if (url.origin !== location.origin &&
      !url.href.startsWith('https://fonts.googleapis.com') &&
      !url.href.startsWith('https://fonts.gstatic.com')) return;

  /* Estrategia: cache-first para assets estáticos */
  if (url.pathname.match(/\.(css|js|png|jpg|jpeg|gif|svg|woff|woff2|ico)$/)) {
    event.respondWith(
      caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        return fetch(event.request).then(function(response) {
          if (!response || response.status !== 200) return response;
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
          return response;
        });
      })
    );
    return;
  }

  /* Estrategia: network-first para HTML (noticias siempre frescas) */
  event.respondWith(
    fetch(event.request).then(function(response) {
      if (!response || response.status !== 200) return response;
      var clone = response.clone();
      caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
      return response;
    }).catch(function() {
      return caches.match(event.request).then(function(cached) {
        if (cached) return cached;
        /* Fallback offline para páginas HTML */
        if (event.request.headers.get('accept') &&
            event.request.headers.get('accept').includes('text/html')) {
          return caches.match('/cut-web/index.html');
        }
      });
    })
  );
});

/* ---- PUSH NOTIFICATIONS (estructura base) ---- */
self.addEventListener('push', function(event) {
  if (!event.data) return;
  var data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'CUT Costa Rica', {
      body: data.body || '',
      icon: '/cut-web/assets/images/logo-cut.png',
      badge: '/cut-web/assets/images/logo-cut.png',
      tag: 'cut-notification',
      data: { url: data.url || '/cut-web/' }
    })
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  var target = (event.notification.data && event.notification.data.url)
    ? event.notification.data.url : '/cut-web/';
  event.waitUntil(clients.openWindow(target));
});

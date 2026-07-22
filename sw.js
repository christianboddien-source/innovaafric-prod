const CACHE = 'innovaafric-v10';
const PAGES = ['/'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PAGES)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // solo cachear GET de páginas propias
  if(e.request.method !== 'GET') return;
  if(e.request.url.includes('/v1/')) return;        // no cachear API Railway
  if(e.request.url.includes('supabase.co')) return; // no cachear Supabase

  // Para navegaciones y el HTML de la app: PEDIR SIEMPRE FRESCO A LA RED
  // (cache:'no-store' salta la caché HTTP de GitHub Pages de 10 min, así las
  //  actualizaciones llegan al instante). Sin conexión, usa la copia cacheada.
  const isNav = e.request.mode === 'navigate' ||
                (e.request.destination === 'document') ||
                e.request.url.endsWith('/') ||
                e.request.url.endsWith('index.html');
  if (isNav) {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(res => {
          if (res && res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
          return res;
        })
        .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
    );
    return;
  }

  // Resto de recursos: RED PRIMERO con respaldo en caché
  e.respondWith(
    fetch(e.request).then(res => {
      if(res.ok) caches.open(CACHE).then(c => c.put(e.request, res.clone()));
      return res;
    }).catch(() => caches.match(e.request))
  );
});

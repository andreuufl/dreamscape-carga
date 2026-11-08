// Dreamscape · Carga — funciona sin cobertura
const V = 'carga-v18';
const BASE = ['./', 'index.html', 'jsqr.js', 'qrcode.js', 'manifest.json', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return; // los datos van siempre a internet
  const esPagina = e.request.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('index.html');
  if (esPagina) {
    // La página: primero internet (para tener siempre la última versión), si no hay, la guardada
    e.respondWith(fetch(e.request, { cache:'no-store' }).then(r => { const c = r.clone(); caches.open(V).then(x => x.put('index.html', c)); return r; })
      .catch(() => caches.match('index.html')));
  } else {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(n => { const c = n.clone(); caches.open(V).then(x => x.put(e.request, c)); return n; })));
  }
});

// Dreamscape · Carga — funciona sin cobertura
const V = 'carga-v29';
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
// Avisos push: el servidor solo «despierta» al móvil; aquí se piden los avisos pendientes y se muestran
self.addEventListener('push', e => {
  e.waitUntil((async () => {
    let l = [];
    try {
      const c = await caches.open('ck-cfg'), r = await c.match('cfg'), cfg = await r.json();
      const u = cfg.api + '?k=' + encodeURIComponent(cfg.k) + '&a=ckMisAvisos&p=%5B%5D&t=' + Date.now();
      const j = await (await fetch(u, { credentials:'omit', cache:'no-store' })).json();
      if (j.ok) l = j.r || [];
    } catch (err) {}
    if (!l.length) l = [{ titulo:'Dreamscape · Carga', cuerpo:'Tienes un aviso nuevo en la app' }];
    for (const m of l.slice(-3)) await self.registration.showNotification(m.titulo, { body: m.cuerpo || '', icon:'icon-192.png', badge:'icon-192.png', tag: m.id || undefined, data: { num: m.num || '' } });
  })());
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const num = (e.notification.data || {}).num, url = './' + (num ? '?bolo=' + encodeURIComponent(num) : '');
  e.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(l => {
    for (const c of l) { if ('focus' in c) { if (num && 'navigate' in c) return c.navigate(url).then(w => (w||c).focus()).catch(() => c.focus()); return c.focus(); } }
    return self.clients.openWindow(url);
  }));
});

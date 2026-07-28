const CACHE = 'royalfic-fob-gasolina-v8';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];
const BASES_DINAMICAS = ['bombeio.xlsx', 'frete.xlsx'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // bombeio.xlsx e frete.xlsx: sempre busca a versão mais recente da rede (não usa cache),
  // caindo para o cache apenas se estiver totalmente offline
  if (BASES_DINAMICAS.some(nome => e.request.url.includes(nome))) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).catch(() => cached))
  );
});

// Paik TV Puzzle service worker.
// Bump CACHE whenever a file in ASSETS changes, so installed copies pick up the new version.
const CACHE = 'paik-tv-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icons/icon.svg',
  './icons/favicon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './vendor/three/three.min.js',
  './vendor/three/OrbitControls.js',
  './vendor/fonts/do-hyeon-korean-400-normal.woff2',
  './vendor/fonts/do-hyeon-latin-400-normal.woff2',
  './vendor/fonts/vt323-latin-400-normal.woff2',
  './vendor/fonts/ibm-plex-sans-kr-korean-400-normal.woff2',
  './vendor/fonts/ibm-plex-sans-kr-korean-600-normal.woff2',
  './vendor/fonts/ibm-plex-sans-kr-latin-400-normal.woff2',
  './vendor/fonts/ibm-plex-sans-kr-latin-600-normal.woff2'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('paik-tv-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  // The page itself: try the network first so online players get updates, fall back to the cached copy offline.
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return res; })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Everything else (scripts, fonts, icons): cache first.
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }))
  );
});

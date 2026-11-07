'use strict';
const CACHE = 'my-progress-shell-v14';
const FILES = ['./','./index.html','./styles.css?v=14','./app.js?v=14','./manifest.webmanifest','./icon-180-mono.png','./icon-192-mono.png','./icon-512-mono.png'];
self.addEventListener('install',event => event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(FILES)).then(() => self.skipWaiting())));
self.addEventListener('activate',event => event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('my-progress-shell-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())));
self.addEventListener('fetch',event => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request, {cache:'no-cache'}).then(response => {
      if (!response.ok) throw new Error('Page unavailable');
      return response;
    }).catch(() => caches.open(CACHE).then(cache => cache.match('./index.html'))));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).catch(error => {
    if (event.request.mode === 'navigate') return caches.match('./index.html');
    throw error;
  })));
});

const CACHE_NAME = 'gap-planner-v1';

// 需要预缓存的核心资源
const PRE_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg',
];

self.addEventListener('install', event => {
  console.log('[SW] 安装中...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(
        PRE_CACHE.map(url =>
          cache.add(url).catch(err =>
            console.warn('[SW] 预缓存失败:', url, err)
          )
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  console.log('[SW] 激活中...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => {
          console.log('[SW] 清除旧缓存:', key);
          return caches.delete(key);
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // 尝试网络请求，成功则更新缓存
      const fetchPromise = fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
        }
        return response;
      }).catch(err => {
        console.warn('[SW] 网络请求失败:', event.request.url, err);
        // 如果缓存存在则返回缓存，否则返回离线页面
        return cached || new Response(
          '<html><body style="text-align:center;padding-top:40vh;font-family:sans-serif;"><h1>📡</h1><p>离线中，请连接网络后重试</p></body></html>',
          { headers: { 'Content-Type': 'text/html' } }
        );
      });

      // 优先返回缓存（快速），同时后台更新
      return cached || fetchPromise;
    })
  );
});

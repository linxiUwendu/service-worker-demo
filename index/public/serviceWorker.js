let VERSION = 0;
let CACHE_NAME = 'cache_v' + VERSION;
let CACHE_URLS = ['/', '/js/index.js', '/api/movies', '/img/logo.jpg'];

function isCORSRequest(url, host) {
  return url.search(host) === -1;
}

// 缓存到 cacheStorage 里
function saveToCache(req, res) {
  return caches.open(CACHE_NAME).then(function (cache) {
    return cache.put(req, res);
  });
}

// 预缓存
function precache() {
  return caches.open(CACHE_NAME).then(function (cache) {
    // addAll 需要所有文件缓存成功 才会resolve
    return cache.addAll(CACHE_URLS);
  });
}

// 清除过期的 cache
function clearStaleCache() {
  return caches.keys().then((keys) => {
    keys.forEach((key) => {
      if (CACHE_NAME !== key) {
        caches.delete(key);
      }
    });
  });
}

// 请求并缓存内容
function fetchAndCache(req) {
  return fetch(req).then(function (res) {
    saveToCache(req, res.clone());
    return res;
  });
}

// 安装
// 进行预缓存操作
this.addEventListener('install', function (event) {
  // 通过这个方法可以防止缓存未完成，就关闭serviceWorker，可以让浏览器知道 SW 什么时候安装成功以及是否成功
  // skipwating,让新的 SW “插队”，强制令它立刻取代老的 SW 控制所有页面
  event.waitUntil(precache().then(this.skipWaiting()));
});

// 激活
// 新的service worker获得对作用域的控制，以及清理旧的缓存资源
// activate事件触发，说明当前service worker即将获得作用域的控制权
this.addEventListener('activate', function (event) {
  event.waitUntil(
    Promise.all([
      // clients.claim为了service worker获得完全控制权
      // 通常service worker激活之前，页面没有被控制，除非页面重新加载，否则无法进行拦截请求等操作
      // clients.claim会跳过刷新阶段，让service worker立即获得完全控制权
      this.clients.claim(),
      clearStaleCache(),
    ]),
  );
});

this.addEventListener('fetch', function (event) {
  // 编程式缓存
  // 在缓存中匹配对应请求资源直接返回
  // 能缓存属于自己域下的请求，同时也能缓存跨域的请求，比如 CDN，不过无法对跨域请求的请求头和内容进行修改
  // 一般只对同源的资源走 sw，cdn 上的资源利用 http 缓存策略
  const req = event.request;
  const request = isCORSRequest(req.url, 'localhost')
    ? new Request(req.url, { mode: 'cors' })
    : req;

  if (new URL(event.request.url).origin !== this.origin) {
    return;
  }

  // 优先网络请求，失败则返回缓存
  event.respondWith(
    fetchAndCache(request).catch(function () {
      return caches.match(request);
    }),
  );
});

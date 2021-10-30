importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.3.0/workbox-sw.js');
let CACHE_URLS = ['/', '/js/index.js', '/api/movies', '/img/logo.jpg '];
if (workbox) {
  workbox.precaching.precacheAndRoute(CACHE_URLS)
  // 缓存策略地址：https://www.cnblogs.com/yiyi17/p/12069528.html
  // workbox.routing.registerRoute(
  //   new RegExp('localhost/*'),
  //   workbox.strategies.networkFirst()
  // );
}

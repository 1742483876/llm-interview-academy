/* 小白学习工作台 · Service Worker（离线缓存） */
/* 缓存版本：内容/DOM 结构变更时递增 CACHE，触发旧缓存清理与重新预缓存 */
var CACHE = "xiaobai-app-v3";

/* 预缓存清单：URL 必须与页面真实引用完全一致（含 query 版本号），否则离线命中失效。
   主站 style=v7、js=v6；量化复用 ../style.css?v6、../app.js?v6、../charts1.js?v6。 */
var CORE = [
  // APP 外壳
  "./app/", "./app/index.html", "./app/app.css", "./app/app.js", "./manifest.webmanifest",
  "./app/icons/icon-192.png", "./app/icons/icon-512.png", "./app/icons/icon-maskable-512.png", "./app/icons/apple-touch-icon.png",
  // 主站
  "./", "./index.html",
  "./style.css?v=7", "./style.css?v=6",
  "./figs.js?v=6", "./charts1.js?v=6", "./charts2.js?v=6", "./charts3.js?v=6", "./charts4.js?v=6",
  "./lessons1.js?v=6", "./lessons2.js?v=6", "./lessons3.js?v=6",
  "./extra.js?v=6", "./jdq.js?v=6", "./quarterly.js?v=6", "./app.js?v=6",
  // 量化学堂
  "./quant/", "./quant/index.html",
  "./quant/qwidgets.js?v=6", "./quant/qfigs.js?v=6", "./quant/qlessons.js?v=6", "./quant/qextra.js?v=6", "./quant/qsite.js?v=6"
];

/* 团队页是加密大文件，单独按需缓存（首次在线打开后即可离线解锁查阅） */
var EXTRA = ["./team/index.html"];

self.addEventListener("install", function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return Promise.all(CORE.map(function (u) {
        return c.add(u).catch(function () { return null; }); // 单个失败不阻断安装
      }));
    })
  );
});

self.addEventListener("activate", function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) {
        if (k.indexOf("xiaobai-app-") === 0 && k !== CACHE) return caches.delete(k);
        return null;
      }));
    }).then(function () { return self.clients.claim(); })
  );
});

/* 缓存优先 + 后台更新（stale-while-revalidate）：在线时拿到最新，离线时用缓存 */
function swr(req) {
  return caches.match(req).then(function (hit) {
    var net = fetch(req).then(function (res) {
      if (res && res.status === 200) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, copy); });
      }
      return res;
    }).catch(function () { return hit; });
    return hit || net;
  });
}

/* 导航/HTML：网络优先，失败回缓存（保证在线拿到最新内容，离线也能开） */
function navFirst(req) {
  return fetch(req).then(function (res) {
    if (res && res.status === 200) {
      var copy = res.clone();
      caches.open(CACHE).then(function (c) { c.put(req, copy); });
    }
    return res;
  }).catch(function () {
    return caches.match(req).then(function (hit) {
      return hit || caches.match("./index.html");
    });
  });
}

self.addEventListener("fetch", function (e) {
  var req = e.request;
  if (req.method !== "GET") return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return; // 不碰第三方

  // 团队加密页：缓存优先（首开在线缓存后，离线可用）
  if (url.pathname.indexOf("/team/") >= 0) {
    e.respondWith(caches.match(req).then(function (hit) {
      return hit || fetch(req).then(function (res) {
        if (res && res.status === 200) {
          var copy = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, copy); });
        }
        return res;
      });
    }));
    return;
  }

  var isDoc = req.mode === "navigate" || /\.html?($|\?)/.test(url.pathname) || url.pathname.slice(-1) === "/";
  e.respondWith(isDoc ? navFirst(req) : swr(req));
});

/* 支持页面主动要求缓存团队页（解锁成功后调用） */
self.addEventListener("message", function (e) {
  if (e.data && e.data.type === "CACHE_TEAM") {
    e.waitUntil(fetch("./team/index.html").then(function (res) {
      return caches.open(CACHE).then(function (c) { return c.put("./team/index.html", res.clone()); });
    }).catch(function () { return null; }));
  }
});

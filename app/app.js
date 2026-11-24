/* 小白学习工作台 · PWA 外壳逻辑（ES5 写法，兼容旧手机） */
(function () {
  var BASE = "../";                 // APP 目录相对站点根
  var $ = function (s) { return document.querySelector(s); };
  var LS = "xiaobaiApp_seen";       // 是否看过安装引导
  var LAST = "xiaobaiApp_tab";      // 记住上次所在模块

  var MODS = [
    { id: "home",      name: "学堂",  icon: "🧠", url: BASE + "index.html" },
    { id: "quarterly", name: "季刊",  icon: "📚", url: BASE + "index.html#/quarterly" },
    { id: "quant",     name: "量化",  icon: "📈", url: BASE + "quant/index.html" },
    { id: "team",      name: "团队",  icon: "🔒", url: BASE + "team/index.html", lock: true }
  ];

  var frames = {}, current = null;
  var stage = $(".stage"), tabs = $(".tabbar");

  // 渲染底部 Tab
  tabs.innerHTML = MODS.map(function (m, i) {
    return '<div class="tab" data-i="' + i + '"><span class="ti">' + m.icon + '</span>' +
      '<span class="tl">' + m.name + '</span>' + (m.lock ? '<span class="lock">🔑</span>' : '') + '</div>';
  }).join("");

  // 渲染 iframe（懒加载：切到才设置 src）
  MODS.forEach(function (m, i) {
    var f = document.createElement("iframe");
    f.setAttribute("title", m.name);
    f.setAttribute("scrolling", "yes");
    f.setAttribute("allowfullscreen", "true");
    f.setAttribute("data-i", i);
    frames[m.id] = f;
    stage.appendChild(f);
  });

  function titleOf(m) {
    var map = { home: "面试学堂", quarterly: "论文季刊", quant: "量化学堂", team: "团队全景（加密）" };
    return map[m.id] || m.name;
  }

  function activate(id, remember) {
    if (!frames[id]) id = "home";
    var m = MODS.filter(function (x) { return x.id === id; })[0];
    current = id;
    // 懒加载 + 显示
    Object.keys(frames).forEach(function (k) {
      var f = frames[k];
      if (k === id) {
        if (!f.getAttribute("src")) f.setAttribute("src", m.url);
        f.classList.add("on");
      } else {
        f.classList.remove("on");
      }
    });
    // Tab 高亮
    var idx = MODS.indexOf(m);
    Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (t, i) {
      t.classList.toggle("on", i === idx);
    });
    $(".tt").textContent = titleOf(m);
    if (remember !== false) { try { localStorage.setItem(LAST, id); } catch (e) {} }
    // 同步 hash，便于 deep link / 返回
    try { history.replaceState(null, "", "?m=" + id); } catch (e) {}
    // 团队页首次在线打开后，解锁成功后由页面自行缓存；这里请求 SW 主动缓存一份
    if (id === "team" && "serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(function (reg) {
        if (reg.active) reg.active.postMessage({ type: "CACHE_TEAM" });
      }).catch(function () {});
    }
  }

  // Tab 点击
  Array.prototype.forEach.call(tabs.querySelectorAll(".tab"), function (t) {
    t.addEventListener("click", function () {
      var i = parseInt(t.getAttribute("data-i"), 10);
      activate(MODS[i].id);
    });
  });

  // 初始模块：URL ?m= > 上次 > home
  function initial() {
    var q = (location.search.match(/[?&]m=([^&]+)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem(LAST); } catch (e) {}
    activate(q || saved || "home", false);
  }

  // 网络状态
  function net() {
    var el = $(".net");
    if (navigator.onLine) { el.classList.remove("off"); el.innerHTML = '<span class="dot"></span>在线'; }
    else { el.classList.add("off"); el.innerHTML = '<span class="dot"></span>离线'; }
  }
  window.addEventListener("online", net);
  window.addEventListener("offline", net);
  net();

  // 刷新当前模块（仅重载当前 iframe）
  $(".reload").addEventListener("click", function () {
    var f = frames[current];
    if (f) { f.src = f.getAttribute("src"); }
  });

  // 安装引导
  var deferred = null;
  var install = $(".install");
  function showInstall(force) {
    var seen = false; try { seen = localStorage.getItem(LS) === "1"; } catch (e) {}
    if (seen && !force) return;
    install.classList.add("show");
  }
  function dismiss() {
    install.classList.remove("show");
    try { localStorage.setItem(LS, "1"); } catch (e) {}
  }
  $(".install .x").addEventListener("click", dismiss);
  $(".install .later").addEventListener("click", dismiss);
  $(".install .go").addEventListener("click", function () {
    if (deferred) { deferred.prompt(); deferred = null; dismiss(); }
    else { // iOS / 不支持 prompted：给出手动指引
      $(".install .auto").style.display = "none";
      $(".install .manual").style.display = "block";
    }
  });
  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault(); deferred = e; showInstall(false);
  });
  window.addEventListener("appinstalled", dismiss);

  // 打开设置里的安装入口（手动二次触发）
  $(".setup").addEventListener("click", function () { showInstall(true); });

  // 注册 Service Worker（scope 为站点根，覆盖全部资源）
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register(BASE + "sw.js", { scope: BASE }).catch(function () {});
  }

  // 启动
  initial();
  var boot = $(".boot");
  setTimeout(function () { boot.classList.add("hide"); }, 450);
  // 首次进入展示安装引导（延后，避免遮挡内容）
  setTimeout(function () { showInstall(false); }, 1600);
})();

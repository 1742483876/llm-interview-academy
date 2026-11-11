// 大模型面试学堂 · 图表引擎 + 交互组件（纯 SVG，保持 ES2015 兼容）
(function () {
  var F = window.FIGS = window.FIGS || {};
  var W = window.WIDGETS = {};
  var PAL = ["var(--brand)", "var(--orange)", "var(--purple)", "var(--green)", "var(--red)", "#e8a317", "var(--sub)"];
  var uid = 0;
  var LG = function (v) { return Math.log(v) / Math.LN10; };
  function sc(v, a, b, A, B, log) { if (log) { v = LG(v); a = LG(a); b = LG(b); } return A + (v - a) / (b - a) * (B - A); }
  function num(v, d) {
    var a = Math.abs(v), k = d == null ? 1 : d;
    if (a >= 1e12) return (v / 1e12).toFixed(a >= 1e13 ? 0 : k) + "T";
    if (a >= 1e9) return (v / 1e9).toFixed(a >= 1e10 ? 0 : k) + "B";
    if (a >= 1e6) return (v / 1e6).toFixed(a >= 1e7 ? 0 : k) + "M";
    if (a >= 1e3) return (v / 1e3).toFixed(a >= 1e4 ? 0 : k) + "K";
    return v.toFixed(k);
  }
  function gb(v) { return v >= 1000 ? (v / 1000).toFixed(v >= 10000 ? 0 : 1) + " TB" : v >= 1 ? v.toFixed(v >= 100 ? 0 : 1) + " GB" : (v * 1000).toFixed(0) + " MB"; }

  var DEFS = '<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--sub)"/></marker></defs>';
  function svg(h, body) { return '<svg viewBox="0 0 680 ' + h + '" xmlns="http://www.w3.org/2000/svg">' + DEFS + body + "</svg>"; }
  function T(x, y, s, cls, anchor, style) { return '<text x="' + x + '" y="' + y + '"' + (anchor ? ' text-anchor="' + anchor + '"' : "") + ' class="' + (cls || "f-s") + '"' + (style ? ' style="' + style + '"' : "") + ">" + s + "</text>"; }
  function box(x, y, w, h, cls, lines, opt) {
    opt = opt || {};
    var lh = opt.lh || 16, y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + 4;
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="' + (opt.r != null ? opt.r : 9) + '" class="' + cls + '" stroke-width="1.2"/>' +
      lines.map(function (t, i) { return T(x + w / 2, y0 + i * lh, t, i === 0 && !opt.flat ? "f-h" : opt.flat ? "f-t" : "f-s", "middle", i === 0 && !opt.flat ? "font-size:13px" : ""); }).join("");
  }
  function arr(x1, y1, x2, y2) { return '<line x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '" class="f-ln" stroke-width="1.4" marker-end="url(#ah)"/>'; }
  function pth(d) { return '<path d="' + d + '" class="f-ln" stroke-width="1.4" marker-end="url(#ah)"/>'; }
  function dot(x, y, c, r) { return '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r || 5) + '" style="fill:' + c + ';stroke:var(--card)" stroke-width="2"/>'; }
  function vline(x, y1, y2, c, dash) { return '<line x1="' + x.toFixed(1) + '" y1="' + y1 + '" x2="' + x.toFixed(1) + '" y2="' + y2 + '" style="stroke:' + (c || "var(--sub)") + '" stroke-width="1.2" stroke-dasharray="' + (dash || "4 3") + '"/>'; }
  function hline(y, x1, x2, c, dash) { return '<line x1="' + x1 + '" y1="' + y.toFixed(1) + '" x2="' + x2 + '" y2="' + y.toFixed(1) + '" style="stroke:' + (c || "var(--sub)") + '" stroke-width="1.2" stroke-dasharray="' + (dash || "4 3") + '"/>'; }
  function line(pts, X, Y) {
    var d = "", pen = false;
    pts.forEach(function (p) {
      if (!p) { pen = false; return; }
      var x = X(p[0]), y = Y(p[1]);
      if (!isFinite(x) || !isFinite(y)) { pen = false; return; }
      y = Math.max(-2000, Math.min(3000, y));
      d += (pen ? "L" : "M") + x.toFixed(1) + "," + y.toFixed(1);
      pen = true;
    });
    return d;
  }

  // 折线图
  function chart(o) {
    var H = o.h || 260, l = o.l || 52, r = o.r || 18, t = o.t || 34, b = o.b || 40;
    var x0 = l, x1 = 680 - r, y0 = H - b, y1 = t;
    var X = function (v) { return sc(v, o.x.min, o.x.max, x0, x1, o.x.log); };
    var Y = function (v) { return sc(v, o.y.min, o.y.max, y0, y1, o.y.log); };
    var id = "cp" + (++uid), s = "";
    s += '<defs><clipPath id="' + id + '"><rect x="' + x0 + '" y="' + (y1 - 3) + '" width="' + (x1 - x0) + '" height="' + (y0 - y1 + 6) + '"/></clipPath></defs>';
    (o.x.ticks || []).forEach(function (k) { var x = X(k[0]).toFixed(1); s += '<line x1="' + x + '" y1="' + y1 + '" x2="' + x + '" y2="' + y0 + '" class="f-ax" stroke-width="1"/>' + T(x, y0 + 15, k[1], "f-s", "middle"); });
    (o.y.ticks || []).forEach(function (k) { var y = +Y(k[0]).toFixed(1); s += '<line x1="' + x0 + '" y1="' + y + '" x2="' + x1 + '" y2="' + y + '" class="f-ax" stroke-width="1"/>' + T(x0 - 6, y + 4, k[1], "f-s", "end"); });
    s += '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" class="f-ln" stroke-width="1"/>';
    if (o.x.label) s += T(x1, y0 + 32, o.x.label, "f-s", "end");
    if (o.y.label) s += T(4, 14, o.y.label, "f-s", "start");
    var g = o.under ? o.under(X, Y) : "";
    (o.series || []).forEach(function (se, i) {
      var c = se.c || PAL[i % PAL.length];
      if (se.band) {
        var up = se.band.map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[2]).toFixed(1); });
        var lo = se.band.slice().reverse().map(function (p) { return X(p[0]).toFixed(1) + "," + Y(p[1]).toFixed(1); });
        g += '<polygon points="' + up.concat(lo).join(" ") + '" style="fill:' + c + '" opacity=".15"/>';
      }
      if (se.pts) g += '<path d="' + line(se.pts, X, Y) + '" fill="none" style="stroke:' + c + '" stroke-width="' + (se.w || 2) + '" stroke-linejoin="round"' + (se.dash ? ' stroke-dasharray="' + se.dash + '"' : "") + (se.op ? ' opacity="' + se.op + '"' : "") + "/>";
    });
    s += '<g clip-path="url(#' + id + ')">' + g + "</g>";
    if (o.over) s += o.over(X, Y);
    var lx = 676;
    (o.series || []).slice().reverse().forEach(function (se, j) {
      if (!se.name) return;
      var i = o.series.length - 1 - j, c = se.c || PAL[i % PAL.length], w = se.name.length * 11 + 30;
      lx -= w;
      s += '<line x1="' + lx + '" y1="10" x2="' + (lx + 16) + '" y2="10" style="stroke:' + c + '" stroke-width="3"' + (se.dash ? ' stroke-dasharray="' + se.dash + '"' : "") + "/>" + T(lx + 21, 14, se.name, "f-s", "start");
    });
    return '<svg viewBox="0 0 680 ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  // 横向条形图
  function hbar(o) {
    var lw = o.lw || 170, rh = o.rh || 30, top = o.top || 22, n = o.rows.length, H = top + n * rh + (o.ticks ? 26 : 8);
    var x0 = lw, x1 = 680 - (o.rpad || 74), mn = o.min || 0;
    var X = function (v) { return sc(Math.max(v, mn), mn, o.max, x0, x1, o.log); };
    var s = "", yb = top + n * rh;
    (o.ticks || []).forEach(function (k) { var x = X(k[0]).toFixed(1); s += '<line x1="' + x + '" y1="' + top + '" x2="' + x + '" y2="' + yb + '" class="f-ax" stroke-width="1"/>' + T(x, yb + 16, k[1], "f-s", "middle"); });
    o.rows.forEach(function (r, i) {
      var y = top + i * rh, w = Math.max(2, X(r.v) - x0);
      s += T(lw - 8, y + rh / 2 + 4, r.n, "f-t", "end", "font-size:12.5px");
      s += '<rect x="' + x0 + '" y="' + (y + 4) + '" width="' + w.toFixed(1) + '" height="' + (rh - 8) + '" rx="4" style="fill:' + (r.c || "var(--brand)") + '" opacity="' + (r.op || 0.85) + '"/>';
      if (r.t) s += T((x0 + w + 6).toFixed(1), y + rh / 2 + 4, r.t, "f-t", "start", "font-size:12px");
    });
    (o.marks || []).forEach(function (m) { var x = X(m.v); s += vline(x, top - 4, yb, m.c || "var(--red)") + T(x.toFixed(1), top - 8, m.t, "f-s", "middle", "fill:" + (m.c || "var(--red)")); });
    return '<svg viewBox="0 0 680 ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  function arc(cx, cy, R, r, a0, a1, c) {
    var la = a1 - a0 > Math.PI ? 1 : 0;
    var P = function (rad, a) { return (cx + rad * Math.sin(a)).toFixed(1) + "," + (cy - rad * Math.cos(a)).toFixed(1); };
    return '<path d="M' + P(R, a0) + " A" + R + "," + R + " 0 " + la + " 1 " + P(R, a1) + " L" + P(r, a1) + " A" + r + "," + r + " 0 " + la + " 0 " + P(r, a0) + ' Z" style="fill:' + c + ';stroke:var(--card)" stroke-width="2"/>';
  }

  window.CH = { svg: svg, T: T, box: box, arr: arr, pth: pth, dot: dot, vline: vline, hline: hline, chart: chart, hbar: hbar, arc: arc, num: num };

  // ---------- 交互控件 ----------
  function ctl(list) {
    return '<div class="ctls">' + list.map(function (c) {
      if (c.opts) return '<label class="ctl"><span>' + c.label + '</span><select data-k="' + c.k + '">' + c.opts.map(function (o, i) { return '<option value="' + o[0] + '"' + (i === (c.v || 0) ? " selected" : "") + ">" + o[1] + "</option>"; }).join("") + "</select></label>";
      return '<label class="ctl"><span>' + c.label + ' <b data-o="' + c.k + '"></b></span><input type="range" data-k="' + c.k + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + c.v + '"></label>';
    }).join("") + "</div>";
  }
  function getv(el, k) { var i = el.querySelector('[data-k="' + k + '"]'); return i.type === "checkbox" ? i.checked : i.tagName === "SELECT" ? i.value : parseFloat(i.value); }
  function setO(el, k, t) { var o = el.querySelector('[data-o="' + k + '"]'); if (o) o.textContent = t; }
  function shell(el, html) { el.insertAdjacentHTML("beforeend", html + '<div class="wsvg"></div><div class="wout"></div>'); return { svg: el.querySelector(".wsvg"), out: el.querySelector(".wout") }; }
  function bind(el, f) { Array.prototype.forEach.call(el.querySelectorAll("input,select"), function (i) { i.addEventListener("input", f); i.addEventListener("change", f); }); }
  function decT(a, b, f) { var r = []; for (var e = a; e <= b; e++) r.push([Math.pow(10, e), f(e)]); return r; }

  // 1. Chinchilla IsoFLOP 计算器
  W.scaling = function (el) {
    var E = 1.82, A = 482.01, B = 2085.43, al = 0.3478, be = 0.3658;
    var Lf = function (N, D) { return E + A / Math.pow(N, al) + B / Math.pow(D, be); };
    var curve = function (C) { var p = []; for (var lr = 0; lr <= 4.001; lr += 0.05) { var r = Math.pow(10, lr), N = Math.sqrt(C / (6 * r)); p.push([N, Lf(N, C / (6 * N))]); } return p; };
    var opt = function (C) { var best = null; for (var lr = -0.5; lr <= 4.5; lr += 0.005) { var r = Math.pow(10, lr), N = Math.sqrt(C / (6 * r)), L = Lf(N, C / (6 * N)); if (!best || L < best.L) best = { N: N, D: C / (6 * N), L: L, r: r }; } return best; };
    var e = shell(el, ctl([{ k: "c", label: "训练算力 C", min: 19, max: 25.5, step: 0.1, v: 23 }, { k: "r", label: "tokens / 参数", min: 0, max: 4, step: 0.02, v: 1.3 }]));
    var fixed = [19, 20, 21, 22, 23, 24, 25].map(function (k) { var C = Math.pow(10, k); return { k: k, pts: curve(C), o: opt(C) }; });
    function draw() {
      var lc = getv(el, "c"), C = Math.pow(10, lc), r = Math.pow(10, getv(el, "r"));
      setO(el, "c", "1e" + lc.toFixed(1) + " FLOPs"); setO(el, "r", "≈ " + (r >= 100 ? Math.round(r / 5) * 5 : r.toFixed(r < 10 ? 1 : 0)));
      var o = opt(C), N = Math.sqrt(C / (6 * r)), D = r * N, L = Lf(N, D);
      var ser = fixed.map(function (f) { return { pts: f.pts, c: "var(--sub)", w: 1.2, op: 0.35 }; });
      ser.push({ pts: curve(C), c: "var(--orange)", w: 2.6, name: "当前算力下的 IsoFLOP 曲线" });
      e.svg.innerHTML = chart({
        h: 300, x: { min: 1e7, max: 1e12, log: true, ticks: [[1e7, "10M"], [1e8, "100M"], [1e9, "1B"], [1e10, "10B"], [1e11, "100B"], [1e12, "1T"]], label: "参数量 N（同一条曲线算力相同）→" },
        y: { min: 1.85, max: 3.7, ticks: [[2, "2.0"], [2.4, "2.4"], [2.8, "2.8"], [3.2, "3.2"], [3.6, "3.6"]], label: "预测 loss" }, series: ser,
        over: function (X, Y) {
          return fixed.map(function (f) { return T(X(f.o.N).toFixed(1), (Y(f.o.L) - 8).toFixed(1), "1e" + f.k, "f-s", "middle"); }).join("") + dot(X(o.N), Y(o.L), "var(--green)", 6) + dot(X(N), Y(L), "var(--red)", 6);
        },
      });
      var gpuh = C / (0.4 * 989e12) / 3600;
      e.out.innerHTML = '<span style="color:var(--green)">●</span> <b>算力最优</b>：N ≈ ' + num(o.N) + "，D ≈ " + num(o.D) + " tokens（≈ " + o.r.toFixed(0) + " tokens/参数），loss ≈ " + o.L.toFixed(3) +
        '<br><span style="color:var(--red)">●</span> <b>你的选择</b>：N ≈ ' + num(N) + "，D ≈ " + num(D) + "，loss ≈ " + L.toFixed(3) + "（比最优高 " + (L - o.L).toFixed(3) + "，模型大小是最优的 " + (N / o.N).toFixed(2) + " 倍 → 推理成本按比例变化）" +
        "<br>⏱ 这份算力约 <b>" + num(gpuh) + " H100·小时</b>（bf16 稠密 989 TFLOPS、40% MFU 估算）";
    }
    bind(el, draw); draw();
  };

  // 2. MinHash-LSH S 曲线
  W.minhash = function (el) {
    var e = shell(el, ctl([{ k: "b", label: "段数 b（bands）", min: 1, max: 40, step: 1, v: 14 }, { k: "r", label: "每段行数 r（rows）", min: 1, max: 20, step: 1, v: 8 }]));
    var P = function (s, b, r) { return 1 - Math.pow(1 - Math.pow(s, r), b); };
    function draw() {
      var b = getv(el, "b"), r = getv(el, "r"); setO(el, "b", b); setO(el, "r", r);
      var a = [], f = [];
      for (var s = 0; s <= 1.0001; s += 0.01) { a.push([s, P(s, b, r)]); f.push([s, P(s, 14, 8)]); }
      var th = Math.pow(1 / b, 1 / r);
      e.svg.innerHTML = chart({
        h: 260, x: { min: 0, max: 1, ticks: [[0, "0"], [0.2, "0.2"], [0.4, "0.4"], [0.6, "0.6"], [0.8, "0.8"], [1, "1"]], label: "两篇文档的真实 Jaccard 相似度 s →" },
        y: { min: 0, max: 1, ticks: [[0, "0"], [0.25, "25%"], [0.5, "50%"], [0.75, "75%"], [1, "100%"]], label: "被判为候选重复的概率" },
        series: [{ pts: f, c: "var(--sub)", dash: "5 4", w: 1.5, name: "FineWeb 设置 14×8" }, { pts: a, c: "var(--brand)", w: 2.6, name: "当前 b×r = " + b * r + " 个哈希" }],
        over: function (X) { return vline(X(th), 34, 220, "var(--orange)") + T(X(th).toFixed(1), 48, " 阈值≈" + th.toFixed(2) + " ", "f-s", th > 0.75 ? "end" : "start", "fill:var(--orange)"); },
      });
      e.out.innerHTML = "s=0.5 → 被召回 <b>" + (P(0.5, b, r) * 100).toFixed(1) + "%</b>（假阳性来源）；s=0.8 → <b>" + (P(0.8, b, r) * 100).toFixed(1) + "%</b>；s=0.9 → <b>" + (P(0.9, b, r) * 100).toFixed(1) + "%</b>（漏召回 = 1 − 它）。" +
        "<br>经验：b↑ 曲线左移、召回↑假阳↑；r↑ 曲线右移变陡、更严格。b×r 越大越准，但签名存储和计算越贵。";
    }
    bind(el, draw); draw();
  };

  // 3. KV Cache 计算器
  W.kv = function (el) {
    var M = [
      { n: "Llama-2-7B（MHA 32 头）", per: 2 * 32 * 32 * 128, c: "var(--red)" },
      { n: "Llama-3-70B（GQA 8）", per: 2 * 80 * 8 * 128, c: "var(--orange)" },
      { n: "Llama-3-8B（GQA 8）", per: 2 * 32 * 8 * 128, c: "var(--brand)" },
      { n: "DeepSeek-V3（MLA）", per: 61 * (512 + 64), c: "var(--green)" },
    ];
    var BS = [1, 2, 4, 8, 16, 32, 64];
    var e = shell(el, ctl([{ k: "s", label: "上下文长度", min: 10, max: 17, step: 1, v: 12 }, { k: "b", label: "并发 batch", min: 0, max: 6, step: 1, v: 0 }]));
    function draw() {
      var sl = Math.pow(2, getv(el, "s")), bs = BS[getv(el, "b")];
      setO(el, "s", sl / 1024 + "K tokens"); setO(el, "b", bs);
      var G = function (m, L) { return m.per * 2 * L * bs / 1e9; };
      var ser = M.map(function (m) { var p = []; for (var k = 10; k <= 17.001; k += 0.25) p.push([Math.pow(2, k), G(m, Math.pow(2, k))]); return { pts: p, c: m.c, w: 2.2 }; });
      e.svg.innerHTML = chart({
        h: 270, x: { min: 1024, max: 131072, log: true, ticks: [[1024, "1K"], [4096, "4K"], [16384, "16K"], [65536, "64K"], [131072, "128K"]], label: "上下文长度 →" },
        y: { min: 0.01, max: 10000, log: true, ticks: decT(-2, 4, function (e) { return ["10MB", "100MB", "1GB", "10GB", "100GB", "1TB", "10TB"][e + 2]; }), label: "KV Cache 显存（fp16，对数轴）" }, series: ser, l: 58,
        over: function (X, Y) { return hline(Y(80), 58, 662, "var(--red)") + T(658, Y(80) - 5, "单卡 80GB", "f-s", "end", "fill:var(--red)") + vline(X(sl), 34, 230) + M.map(function (m) { return dot(X(sl), Y(G(m, sl)), m.c, 4.5); }).join(""); },
      });
      e.out.innerHTML = M.map(function (m) { return '<span style="color:' + m.c + '">●</span> ' + m.n + "：每 token " + (m.per * 2 / 1024).toFixed(0) + " KB → <b>" + gb(G(m, sl)) + "</b>"; }).join("<br>") +
        '<br><span class="muted">公式：2 × 层数 × KV 头数 × 头维 × 序列长 × batch × 2 字节；MLA 每层只缓存 512 维潜向量 + 64 维 RoPE 键。</span>';
    }
    bind(el, draw); draw();
  };

  // 4. ZeRO 显存
  W.zero = function (el) {
    var NG = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024];
    var e = shell(el, ctl([{ k: "p", label: "模型参数量", min: 0, max: 3, step: 0.05, v: 0.85 }, { k: "g", label: "数据并行 GPU 数", min: 0, max: 10, step: 1, v: 3 }]));
    function draw() {
      var P = Math.pow(10, getv(el, "p")), n = NG[getv(el, "g")];
      setO(el, "p", P >= 100 ? P.toFixed(0) + "B" : P.toFixed(1) + "B"); setO(el, "g", n);
      var rows = [["DP 基线（每卡全量）", 16 * P], ["ZeRO-1 切优化器状态", 4 * P + 12 * P / n], ["ZeRO-2 再切梯度", 2 * P + 14 * P / n], ["ZeRO-3 / FSDP 全切", 16 * P / n]];
      e.svg.innerHTML = hbar({
        lw: 160, min: 0.01, max: 20000, log: true, rh: 34, top: 26, rpad: 80,
        ticks: decT(-2, 4, function (e) { return ["10M", "100M", "1G", "10G", "100G", "1T", "10T"][e + 2]; }),
        marks: [{ v: 80, t: "80GB 单卡" }],
        rows: rows.map(function (r) { return { n: r[0], v: r[1], t: gb(r[1]), c: r[1] <= 80 ? "var(--green)" : "var(--orange)" }; }),
      });
      e.out.innerHTML = "每卡显存（只算参数/梯度/优化器状态）。混合精度 Adam：2 + 2 + 12 = <b>16 字节/参数</b>（ZeRO 论文 K=12）。绿色 = 能装进 80GB 卡；<b>还没算激活值</b>，长序列下激活可能比状态还大。";
    }
    bind(el, draw); draw();
  };

  // 5. 数据重复的收益递减（Muennighoff 2023）
  W.repeat = function (el) {
    var RS = 15.39, Df = function (ep) { return 1 + RS * (1 - Math.exp(-(ep - 1) / RS)); };
    var e = shell(el, ctl([{ k: "e", label: "同一份数据训练的 epoch 数", min: 1, max: 40, step: 1, v: 4 }]));
    function draw() {
      var ep = getv(el, "e"); setO(el, "e", ep);
      var a = [], id = [];
      for (var x = 1; x <= 40.001; x += 0.25) { a.push([x, Df(x)]); id.push([x, x]); }
      e.svg.innerHTML = chart({
        h: 250, x: { min: 1, max: 40, ticks: [[1, "1"], [4, "4"], [10, "10"], [16, "16"], [25, "25"], [40, "40"]], label: "epoch 数 →" },
        y: { min: 0, max: 20, ticks: [[0, "0"], [5, "5"], [10, "10"], [15, "15"], [20, "20"]], label: "等效“新数据”份数" },
        series: [{ pts: id, c: "var(--sub)", dash: "5 4", w: 1.4, name: "理想：每次都是新数据" }, { pts: a, c: "var(--brand)", w: 2.6, name: "重复数据的实际价值" }],
        over: function (X, Y) { return hline(Y(1 + RS), 52, 662, "var(--orange)", "2 3") + T(658, Y(1 + RS) - 5, "上限 ≈ 16.4 份", "f-s", "end", "fill:var(--orange)") + dot(X(ep), Y(Df(ep)), "var(--red)", 6); },
      });
      var d = Df(ep);
      e.out.innerHTML = "训练 <b>" + ep + "</b> 个 epoch ≈ <b>" + d.toFixed(2) + "</b> 份新数据，算力利用率 <b>" + (d / ep * 100).toFixed(0) + "%</b>。" + (ep <= 4 ? "（4 epoch 内几乎无损 ✅）" : ep <= 16 ? "（收益明显递减 ⚠️）" : "（再加算力几乎白花 ❌）") +
        '<br><span class="muted">公式：等效数据 = U + U·R*·(1 − e^(−R/R*))，R = epoch − 1，R* ≈ 15.4（Muennighoff et al. 2023 的拟合值）。</span>';
    }
    bind(el, draw); draw();
  };

  // 6. 多语言温度采样
  W.temp = function (el) {
    var LS = [["英语", 1000], ["中文", 300], ["日语", 80], ["德语", 60], ["阿拉伯语", 20], ["越南语", 8], ["斯瓦希里语", 1]];
    var e = shell(el, ctl([{ k: "t", label: "温度 T", min: 1, max: 5, step: 0.1, v: 1 }]));
    function draw() {
      var Tm = getv(el, "t"); setO(el, "t", Tm.toFixed(1) + (Tm === 1 ? "（按原始比例）" : ""));
      var s0 = 0, s1 = 0; LS.forEach(function (l) { s0 += l[1]; s1 += Math.pow(l[1], 1 / Tm); });
      var rows = [];
      LS.forEach(function (l) {
        var p0 = l[1] / s0, p1 = Math.pow(l[1], 1 / Tm) / s1;
        rows.push({ n: l[0] + " 原始", v: p0 * 100, t: (p0 * 100).toFixed(p0 < 0.01 ? 2 : 1) + "%", c: "var(--sub)", op: 0.35 });
        rows.push({ n: "采样后", v: p1 * 100, t: (p1 * 100).toFixed(p1 < 0.01 ? 2 : 1) + "%（×" + (p1 / p0).toFixed(p1 / p0 >= 10 ? 0 : 1) + "）", c: "var(--brand)" });
      });
      e.svg.innerHTML = hbar({ lw: 110, min: 0, max: 100, rh: 19, top: 8, rpad: 130, rows: rows, ticks: [[0, "0"], [25, "25%"], [50, "50%"], [75, "75%"], [100, "100%"]] });
      e.out.innerHTML = "采样概率 p ∝ n^(1/T)：T=1 按数据量比例；T 越大越接近均匀，低资源语言被放大。代价是小语种被重复更多 epoch（过拟合），大语种的有效 token 变少——这就是“多语言诅咒”里的取舍。<span class='muted'>（各语言数据量为示意值，单位 B tokens）</span>";
    }
    bind(el, draw); draw();
  };

  // 7. RoPE 各维度波长 & PI / NTK / YaRN
  W.rope = function (el) {
    var d = 128;
    var e = shell(el, ctl([{ k: "s", label: "扩展倍数 s", min: 1, max: 5, step: 1, v: 3 }, { k: "base", label: "RoPE base", opts: [["10000", "10000（Llama 2）"], ["500000", "500000（Llama 3）"]] }, { k: "L", label: "原训练长度", opts: [["4096", "4K"], ["8192", "8K"]] }]));
    function draw() {
      var s = Math.pow(2, getv(el, "s")), base = +getv(el, "base"), L = +getv(el, "L");
      setO(el, "s", s + " 倍 → " + (L * s / 1024) + "K");
      var nb = base * Math.pow(s, d / (d - 2)), o = [], pi = [], ntk = [], yarn = [], cnt = 0;
      for (var i = 0; i < d / 2; i++) {
        var lam = 2 * Math.PI * Math.pow(base, 2 * i / d), th = 2 * Math.PI / lam;
        if (lam > L) cnt++;
        o.push([i, lam]); pi.push([i, lam * s]); ntk.push([i, 2 * Math.PI * Math.pow(nb, 2 * i / d)]);
        var g = Math.max(0, Math.min(1, (L / lam - 1) / (32 - 1)));
        yarn.push([i, 2 * Math.PI / ((1 - g) * th / s + g * th)]);
      }
      e.svg.innerHTML = chart({
        h: 290, x: { min: 0, max: 63, ticks: [[0, "0 高频"], [16, "16"], [32, "32"], [48, "48"], [63, "63 低频"]], label: "维度对编号 i →" },
        y: { min: 1, max: 1e9, log: true, ticks: [[10, "10"], [1e3, "1K"], [1e5, "100K"], [1e7, "10M"], [1e9, "1B"]], label: "波长 λ（转一圈要多少个位置）" },
        series: [{ pts: o, c: "var(--text)", w: 2.4, name: "原始" }, { pts: pi, c: "var(--orange)", w: 1.8, name: "PI" }, { pts: ntk, c: "var(--purple)", w: 1.8, dash: "6 3", name: "NTK" }, { pts: yarn, c: "var(--green)", w: 1.8, name: "YaRN" }],
        over: function (X, Y) { return hline(Y(L), 52, 662) + T(56, Y(L) - 5, "原训练长度 " + L / 1024 + "K", "f-s", "start") + hline(Y(L * s), 52, 662, "var(--red)") + T(56, Y(L * s) - 5, "目标长度 " + L * s / 1024 + "K", "f-s", "start", "fill:var(--red)"); },
      });
      e.out.innerHTML = "原始 base 下有 <b>" + cnt + "/64</b> 个维度的波长超过训练长度——训练时它们<b>从没转满一圈</b>，直接外推会遇到没见过的角度。" +
        "<br><b>PI</b>：所有维度一起放大 s 倍（高频也被压缩 → 短文本精度掉）；<b>NTK</b>：base 调成 " + num(nb, 0) + "，高频几乎不动、低频被拉长；<b>YaRN</b>：转得多的维度（L/λ > 32）不动、转不满一圈的完全插值，中间平滑过渡。";
    }
    bind(el, draw); draw();
  };

  // 8. DPO 损失与梯度权重
  W.dpo = function (el) {
    var e = shell(el, ctl([{ k: "b", label: "β", min: 0.05, max: 1, step: 0.05, v: 0.1 }]));
    var sg = function (z) { return 1 / (1 + Math.exp(-z)); };
    function draw() {
      var b = getv(el, "b"); setO(el, "b", b.toFixed(2));
      var l = [], g = [], ref = [];
      for (var x = -30; x <= 30.001; x += 0.25) { l.push([x, -Math.log(sg(b * x))]); g.push([x, sg(-b * x) * 4]); ref.push([x, -Math.log(sg(0.5 * x))]); }
      e.svg.innerHTML = chart({
        h: 270, r: 40, x: { min: -30, max: 30, ticks: [[-30, "−30"], [-15, "−15"], [0, "0"], [15, "15"], [30, "30"]], label: "Δ = log[π(y_w)/π_ref(y_w)] − log[π(y_l)/π_ref(y_l)] →" },
        y: { min: 0, max: 4.2, ticks: [[0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]], label: "DPO loss（左轴）" },
        series: [{ pts: ref, c: "var(--sub)", dash: "4 4", w: 1.2, name: "β=0.5 参考" }, { pts: l, c: "var(--orange)", w: 2.6, name: "loss" }, { pts: g, c: "var(--brand)", w: 2, name: "梯度权重 σ(−βΔ)" }],
        over: function (X, Y) { return [0, 0.5, 1].map(function (v) { return T(672, Y(v * 4) + 4, v, "f-s", "end", "fill:var(--brand)"); }).join(""); },
      });
      var need = Math.log(Math.exp(-0.1) / (1 - Math.exp(-0.1))) / b;
      e.out.innerHTML = "Δ=0（还分不出好坏）时 loss = ln2 ≈ 0.693、梯度权重 0.5；把 loss 降到 0.1 需要 Δ ≈ <b>" + need.toFixed(1) + "</b>。蓝线对应右轴 0–1。" +
        "<br>梯度权重 σ(−βΔ)：<b>已经排对的样本权重自动变小</b>，排错的样本权重大，自带难例挖掘。β 越小，需要越大的 Δ（偏离参考模型越多）才能把 loss 降下去。";
    }
    bind(el, draw); draw();
  };

  // 9. GRPO 组内优势
  W.grpo = function (el) {
    var R = [1, 0, 0, 1, 0, 0, 0, 1];
    el.insertAdjacentHTML("beforeend", '<div class="ctls"><span class="muted">同一道题采样 8 个回答，点击切换 对/错：</span><span class="cells"></span><label class="ctl ck"><input type="checkbox" data-k="dr"> Dr. GRPO（不除以 std）</label></div><div class="wsvg"></div><div class="wout"></div>');
    var cells = el.querySelector(".cells"), sv = el.querySelector(".wsvg"), out = el.querySelector(".wout");
    function draw() {
      cells.innerHTML = R.map(function (r, i) { return '<button class="cell ' + (r ? "ok" : "bad") + '" data-i="' + i + '">#' + (i + 1) + (r ? " ✓" : " ✗") + "</button>"; }).join("");
      Array.prototype.forEach.call(cells.querySelectorAll(".cell"), function (b) { b.onclick = function () { var i = +b.getAttribute("data-i"); R[i] = 1 - R[i]; draw(); }; });
      var dr = getv(el, "dr"), m = 0; R.forEach(function (r) { m += r; }); m /= R.length;
      var v = 0; R.forEach(function (r) { v += (r - m) * (r - m); }); var sd = Math.sqrt(v / R.length);
      var A = R.map(function (r) { return sd === 0 ? 0 : (r - m) / (dr ? 1 : sd); });
      var y0 = 120, k = 38, s = '<line x1="40" y1="' + y0 + '" x2="660" y2="' + y0 + '" class="f-ln" stroke-width="1"/>';
      [-2, -1, 1, 2].forEach(function (t) { s += '<line x1="40" y1="' + (y0 - t * k) + '" x2="660" y2="' + (y0 - t * k) + '" class="f-ax"/>' + T(34, y0 - t * k + 4, (t > 0 ? "+" : "") + t, "f-s", "end"); });
      s += T(34, y0 + 4, "0", "f-s", "end") + T(4, 14, "优势 Â（同一回答内所有 token 共享）", "f-s");
      A.forEach(function (a, i) {
        var x = 60 + i * 76, h = Math.max(1, Math.min(2.6, Math.abs(a)) * k), c = a >= 0 ? "var(--brand)" : "var(--orange)";
        s += '<rect x="' + x + '" y="' + (a >= 0 ? y0 - h : y0) + '" width="48" height="' + h.toFixed(1) + '" rx="4" style="fill:' + c + '" opacity=".85"/>';
        s += T(x + 24, a >= 0 ? y0 - h - 6 : y0 + h + 14, (a > 0 ? "+" : "") + a.toFixed(2), "f-t", "middle", "font-size:12px");
        s += T(x + 24, 236, "#" + (i + 1) + (R[i] ? " ✓" : " ✗"), "f-s", "middle");
      });
      sv.innerHTML = '<svg viewBox="0 0 680 246" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
      out.innerHTML = sd === 0 ? "⚠️ <b>全对或全错：组内标准差 = 0，优势全为 0，这道题对梯度毫无贡献。</b>DAPO 的“动态采样”就是把这种组丢掉再补采，保证每个 batch 都有有效信号。" :
        "组均值 " + m.toFixed(3) + "，标准差 " + sd.toFixed(3) + " → 答对的回答优势 <b>" + ((1 - m) / (dr ? 1 : sd)).toFixed(2) + "</b>，答错的 <b>" + ((0 - m) / (dr ? 1 : sd)).toFixed(2) + "</b>。" +
        "<br>试试只留 1 个 ✓：难题里唯一做对的回答优势很大。全靠组内比较，<b>不需要价值网络（critic）</b>；勾选 Dr. GRPO 去掉 std 归一化，就不会给太易/太难的题过大权重。";
    }
    bind(el, draw); draw();
  };

  // 10. PPO / DAPO 裁剪目标
  function clipW(el, eh0) {
    var e = shell(el, ctl([{ k: "l", label: "ε_low", min: 0.05, max: 0.4, step: 0.01, v: 0.2 }, { k: "h", label: "ε_high", min: 0.05, max: 0.5, step: 0.01, v: eh0 }]));
    function draw() {
      var el_ = getv(el, "l"), eh = getv(el, "h"); setO(el, "l", el_.toFixed(2)); setO(el, "h", eh.toFixed(2) + (Math.abs(eh - el_) < 1e-9 ? "（对称 = PPO）" : eh > el_ ? "（Clip-Higher = DAPO）" : ""));
      var cl = function (r) { return Math.max(1 - el_, Math.min(1 + eh, r)); };
      var pos = [], neg = [], up = [], un = [];
      for (var r = 0; r <= 2.0001; r += 0.01) { pos.push([r, Math.min(r, cl(r))]); neg.push([r, Math.min(-r, -cl(r))]); up.push([r, r]); un.push([r, -r]); }
      e.svg.innerHTML = chart({
        h: 280, x: { min: 0, max: 2, ticks: [[0, "0"], [0.5, "0.5"], [1, "1"], [1.5, "1.5"], [2, "2"]], label: "概率比 ρ = π_θ / π_old →" },
        y: { min: -2.1, max: 1.8, ticks: [[-2, "−2"], [-1, "−1"], [0, "0"], [1, "1"]], label: "单 token 目标（越大越好）" },
        series: [{ pts: up, c: "var(--brand)", dash: "3 4", w: 1.2, op: 0.6 }, { pts: un, c: "var(--orange)", dash: "3 4", w: 1.2, op: 0.6 }, { pts: pos, c: "var(--brand)", w: 2.6, name: "A>0（好回答）" }, { pts: neg, c: "var(--orange)", w: 2.6, name: "A<0（坏回答）" }],
        over: function (X) { return vline(X(1 - el_), 34, 240) + vline(X(1 + eh), 34, 240) + T(X(1 - el_) - 4, 232, "1−ε_low", "f-s", "end") + T(X(1 + eh) + 4, 232, "1+ε_high", "f-s", "start"); },
      });
      e.out.innerHTML = "<b>水平段 = 梯度为 0</b>：好回答的 ρ 超过 1+ε_high 后不再被奖励，坏回答的 ρ 低于 1−ε_low 后不再被惩罚，一次更新不会走太远。虚线是不裁剪的原始目标。" +
        "<br>把 ε_high 调大（DAPO 用 0.28）：<b>低概率的好 token</b> 能被提升得更多 → 维持探索、防止熵坍缩。";
    }
    bind(el, draw); draw();
  }
  W.clip = function (el) { clipW(el, 0.2); };
  W.clipdapo = function (el) { clipW(el, 0.28); };

  // 11. BPE 合并过程
  W.bpe = function (el) {
    var corpus = [["low", 5], ["lower", 2], ["newest", 6], ["widest", 3]];
    var words = corpus.map(function (w) { return { s: w[0].split("").concat(["_"]), n: w[1] }; }), merges = [], st = [];
    var snap = function () { st.push({ w: words.map(function (w) { return { s: w.s.slice(), n: w.n }; }), m: merges.slice() }); };
    snap();
    for (var step = 0; step < 10; step++) {
      var cnt = {}, order = [];
      words.forEach(function (w) { for (var i = 0; i < w.s.length - 1; i++) { var k = w.s[i] + "|" + w.s[i + 1]; if (!(k in cnt)) { cnt[k] = 0; order.push(k); } cnt[k] += w.n; } });
      if (!order.length) break;
      var best = order[0]; order.forEach(function (k) { if (cnt[k] > cnt[best]) best = k; });
      var ab = best.split("|"), nt = ab[0] + ab[1];
      merges.push([ab[0], ab[1], cnt[best], nt]);
      words.forEach(function (w) { var o = []; for (var i = 0; i < w.s.length; i++) { if (i < w.s.length - 1 && w.s[i] === ab[0] && w.s[i + 1] === ab[1]) { o.push(nt); i++; } else o.push(w.s[i]); } w.s = o; });
      snap();
    }
    el.insertAdjacentHTML("beforeend", ctl([{ k: "s", label: "合并步数", min: 0, max: st.length - 1, step: 1, v: 0 }]) + '<div class="bpe"></div><div class="wout"></div>');
    var bx = el.querySelector(".bpe"), out = el.querySelector(".wout");
    var tk0 = 0; st[0].w.forEach(function (w) { tk0 += w.s.length * w.n; });
    function draw() {
      var k = getv(el, "s"), S = st[k], last = S.m.length ? S.m[S.m.length - 1][3] : null, tk = 0;
      setO(el, "s", k + (last ? "（新 token：" + last + "）" : "（初始：字符级）"));
      bx.innerHTML = S.w.map(function (w, i) { tk += w.s.length * w.n; return '<div class="row"><span class="muted" style="min-width:86px">' + corpus[i][0] + " ×" + w.n + "</span>" + w.s.map(function (t) { return '<span class="tk' + (t === last ? " new" : "") + '">' + t + "</span>"; }).join("") + "</div>"; }).join("") +
        '<div class="row" style="margin-top:6px"><span class="muted" style="min-width:86px">合并表</span>' + (S.m.length ? S.m.map(function (m, i) { return '<span class="tk' + (i === S.m.length - 1 ? " new" : "") + '">' + (i + 1) + ". " + m[0] + " + " + m[1] + "（" + m[2] + "次）</span>"; }).join("") : '<span class="muted">还没有合并</span>') + "</div>";
      out.innerHTML = "语料总 token 数 <b>" + tk0 + " → " + tk + "</b>（减少 " + ((1 - tk / tk0) * 100).toFixed(0) + "%）；词表大小 11 + " + k + " = <b>" + (11 + k) + "</b>。“_” 表示词尾。每一步合并<b>全语料出现次数最多的相邻对</b>；推理时按合并表顺序重放即可切分新词。";
    }
    bind(el, draw); draw();
  };
})();

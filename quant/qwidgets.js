// 小白量化学堂 · 交互组件（模拟数据，ES2015 兼容；红涨绿跌）
(function () {
  var C = window.CH, W = window.WIDGETS;
  var T = C.T, dot = C.dot, vline = C.vline, hline = C.hline, chart = C.chart;
  var ctl = C.ctl, getv = C.getv, setO = C.setO, shell = C.shell, bind = C.bind;

  function rng(seed) {
    var a = seed >>> 0;
    return function () { a |= 0; a = (a + 0x6D2B79F5) | 0; var t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function gs(r) { var u = 0; while (u === 0) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }
  function pct(v, d) { return (v >= 0 ? "+" : "") + (v * 100).toFixed(d == null ? 1 : d) + "%"; }
  function cl(v) { return v >= 0 ? "up" : "dn"; }
  function niceStep(raw) { var p = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10)), m = raw / p; return (m < 1.5 ? 1 : m < 3 ? 2 : m < 7 ? 5 : 10) * p; }
  function autoY(min, max, n, fmt) {
    var pad = (max - min) * 0.06 || Math.abs(max) * 0.1 || 1; min -= pad; max += pad;
    var st = niceStep((max - min) / (n || 4)), t = [];
    for (var v = Math.ceil(min / st) * st; v <= max + 1e-12; v += st) t.push([v, fmt ? fmt(v) : String(+v.toFixed(6))]);
    return { min: min, max: max, ticks: t };
  }
  function perf(eq, ppy) {
    var n = eq.length - 1, m = 0, v = 0, mdd = 0, peak = eq[0], rets = [];
    for (var i = 1; i <= n; i++) { var r = eq[i] / eq[i - 1] - 1; rets.push(r); m += r; if (eq[i] > peak) peak = eq[i]; var dd = 1 - eq[i] / peak; if (dd > mdd) mdd = dd; }
    m /= n; rets.forEach(function (r) { v += (r - m) * (r - m); });
    var sd = Math.sqrt(v / Math.max(1, n - 1));
    return { ann: Math.pow(eq[n] / eq[0], ppy / n) - 1, vol: sd * Math.sqrt(ppy), sr: sd > 0 ? m / sd * Math.sqrt(ppy) : 0, mdd: mdd };
  }
  function market(seed, n) {
    var r = rng(seed), p = [3000], mu = 0, left = 0;
    for (var i = 1; i < n; i++) {
      if (left <= 0) { var u = r(); mu = u < 0.4 ? 0.35 : u < 0.7 ? -0.3 : 0; left = 60 + Math.floor(r() * 200); }
      left--;
      p.push(p[i - 1] * (1 + mu / 252 + 0.2 / Math.sqrt(252) * gs(r)));
    }
    return p;
  }
  function ma(p, k) { var o = [], s = 0; for (var i = 0; i < p.length; i++) { s += p[i]; if (i >= k) s -= p[i - k]; o.push(i >= k - 1 ? s / k : null); } return o; }
  window.QM = { rng: rng, gs: gs, market: market, ma: ma, autoY: autoY, pct: pct };
  var yearTicks = function (n) { var t = [[0, "0"]]; for (var y = 1; y * 252 < n; y++) t.push([y * 252, y + "年"]); return t; };
  var pctFmt = function (v) { return (v * 100).toFixed(0) + "%"; };

  // 1. 双均线回测
  W.maback = function (el) {
    var seed = 7, N = 1500, P = market(seed, N);
    var e = shell(el, ctl([{ k: "s", label: "短均线", min: 3, max: 60, step: 1, v: 20 }, { k: "l", label: "长均线", min: 10, max: 250, step: 5, v: 60 }, { k: "c", label: "单边成本", min: 0, max: 30, step: 1, v: 10 }]) +
      '<div class="ctls"><button class="btn qseed">🎲 换一组模拟行情</button><span class="muted">模拟数据：牛 / 熊 / 震荡随机切换，年化波动约 20%；信号收盘生成、次日收盘成交</span></div>');
    function draw() {
      var s = getv(el, "s"), l = getv(el, "l"), cb = getv(el, "c"), c = cb / 10000;
      setO(el, "s", s + " 日"); setO(el, "l", l + " 日"); setO(el, "c", "万" + cb + "（" + (c * 100).toFixed(2) + "%）");
      var ms = ma(P, s), ml = ma(P, l), pos = 0, pend = 0, eq = [1], bh = [1], trades = 0, hold = [], st = null;
      for (var i = 1; i < N; i++) {
        var r = P[i] / P[i - 1] - 1, nv = eq[i - 1] * (1 + pos * r);
        bh.push(bh[i - 1] * (1 + r));
        if (pend !== pos) { nv *= 1 - c; trades++; if (pend) st = i; else hold.push([st, i]); pos = pend; }
        eq.push(nv);
        pend = ms[i] != null && ml[i] != null && ms[i] > ml[i] ? 1 : 0;
      }
      if (pos) hold.push([st, N - 1]);
      var pmin = Math.min.apply(null, P), pmax = Math.max.apply(null, P), ya = autoY(pmin, pmax, 4, function (v) { return v.toFixed(0); });
      var c1 = chart({
        h: 250, x: { min: 0, max: N - 1, ticks: yearTicks(N) }, y: ya, l: 50,
        series: [{ pts: P.map(function (v, i) { return [i, v]; }), c: "var(--text)", w: 1.2, name: "价格" }, { pts: ms.map(function (v, i) { return v == null ? null : [i, v]; }), c: "var(--orange)", w: 1.5, name: "MA" + s }, { pts: ml.map(function (v, i) { return v == null ? null : [i, v]; }), c: "var(--purple)", w: 1.5, name: "MA" + l }],
        under: function (X) { return hold.map(function (h) { return '<rect x="' + X(h[0]).toFixed(1) + '" y="34" width="' + Math.max(0.5, X(h[1]) - X(h[0])).toFixed(1) + '" height="176" style="fill:var(--red)" opacity=".08"/>'; }).join(""); },
      });
      var emin = Math.min(Math.min.apply(null, eq), Math.min.apply(null, bh)), emax = Math.max(Math.max.apply(null, eq), Math.max.apply(null, bh));
      var c2 = chart({
        h: 210, x: { min: 0, max: N - 1, ticks: yearTicks(N), label: "交易日 →" }, y: autoY(emin, emax, 4, function (v) { return v.toFixed(1); }), l: 50,
        series: [{ pts: bh.map(function (v, i) { return [i, v]; }), c: "var(--sub)", w: 1.5, name: "买入持有" }, { pts: eq.map(function (v, i) { return [i, v]; }), c: "var(--brand)", w: 2, name: "双均线策略（扣成本）" }],
        over: function (X, Y) { return hline(Y(1), 50, 662, "var(--sub)", "2 3"); },
      });
      e.svg.innerHTML = c1 + '<div class="muted small" style="margin:-4px 4px 6px">浅红底色 = 持仓期（短均线在长均线上方）</div>' + c2;
      var a = perf(eq, 252), b = perf(bh, 252);
      var row = function (n, x, y, f, good) { return "<tr><td>" + n + '</td><td class="' + (good ? cl(x) : "") + '">' + f(x) + '</td><td class="' + (good ? cl(y) : "") + '">' + f(y) + "</td></tr>"; };
      e.out.innerHTML = (s >= l ? '<div class="muted">⚠️ 短均线 ≥ 长均线，信号含义反了。</div>' : "") +
        '<div class="tablewrap" style="margin:4px 0"><table class="tbl mini"><tr><th>指标</th><th>双均线</th><th>买入持有</th></tr>' +
        row("年化收益", a.ann, b.ann, function (v) { return pct(v); }, true) + row("年化波动", a.vol, b.vol, function (v) { return (v * 100).toFixed(1) + "%"; }) +
        row("最大回撤", -a.mdd, -b.mdd, function (v) { return (v * 100).toFixed(1) + "%"; }, true) + row("夏普（rf=0）", a.sr, b.sr, function (v) { return v.toFixed(2); }) +
        "<tr><td>成交次数（单边）</td><td>" + trades + "</td><td>1</td></tr><tr><td>成本累计吃掉</td><td>约 " + ((1 - Math.pow(1 - c, trades)) * 100).toFixed(1) + "% 净值</td><td>—</td></tr></table></div>" +
        "试试：①把成本拖到万 20；②把短均线调到 5（交易次数暴增）；③多点几次“换一组行情”——同一组参数在不同行情下结果差异很大，这就是不能只看一次回测的原因。";
    }
    el.querySelector(".qseed").onclick = function () { seed++; P = market(seed, N); draw(); };
    bind(el, draw); draw();
  };

  // 2. 过拟合：N 个“真实夏普=0”的策略
  W.overfit = function (el) {
    var NS = [1, 2, 5, 10, 20, 50, 100, 200, 500, 1000];
    var e = shell(el, ctl([{ k: "n", label: "尝试的参数 / 策略个数", min: 0, max: 9, step: 1, v: 6 }, { k: "y", label: "样本内长度", min: 1, max: 10, step: 1, v: 3 }]));
    var r = rng(42), A = [], B = [];
    for (var i = 0; i < 1000; i++) { A.push(gs(r)); B.push(gs(r)); }
    function draw() {
      var n = NS[getv(el, "n")], Y = getv(el, "y"), Yo = 2, best = -1e9, bi = 0;
      setO(el, "n", n + " 个"); setO(el, "y", Y + " 年");
      for (var i = 0; i < n; i++) if (A[i] / Math.sqrt(Y) > best) { best = A[i] / Math.sqrt(Y); bi = i; }
      var bo = B[bi] / Math.sqrt(Yo), cap = function (v) { return Math.max(-3, Math.min(4, v)); };
      e.svg.innerHTML = chart({
        h: 280, x: { min: -3, max: 4, ticks: [[-2, "−2"], [-1, "−1"], [0, "0"], [1, "1"], [2, "2"], [3, "3"], [4, "4"]], label: "样本内夏普（年化）→" },
        y: { min: -3, max: 3, ticks: [[-2, "−2"], [-1, "−1"], [0, "0"], [1, "1"], [2, "2"]], label: "样本外夏普（之后 2 年）" }, series: [],
        over: function (X, Y2) {
          var s = vline(X(0), 34, 240) + hline(Y2(0), 52, 662);
          for (var i = 0; i < n; i++) if (i !== bi) s += '<circle cx="' + X(cap(A[i] / Math.sqrt(Y))).toFixed(1) + '" cy="' + Y2(Math.max(-3, Math.min(3, B[i] / Math.sqrt(Yo)))).toFixed(1) + '" r="3" style="fill:var(--sub)" opacity=".45"/>';
          s += dot(X(cap(best)), Y2(Math.max(-3, Math.min(3, bo))), "var(--red)", 7);
          s += T((X(cap(best)) + 10).toFixed(1), (Y2(Math.max(-3, Math.min(3, bo))) + 4).toFixed(1), "← 回测最优", "f-s", "start", "fill:var(--red)");
          return s;
        },
      });
      e.out.innerHTML = "这 " + n + " 个策略的<b>真实夏普全部是 0</b>（纯随机）。挑出样本内最好的那个：样本内夏普 <b class='up'>" + best.toFixed(2) + "</b>，样本外 <b class='" + cl(bo) + "'>" + bo.toFixed(2) + "</b>。" +
        "<br>理论上 n 个随机策略的最大夏普约为 √(2·ln n)/√年数 ≈ <b>" + (n > 1 ? Math.sqrt(2 * Math.log(n)) / Math.sqrt(Y) : 0).toFixed(2) + "</b>：试得越多、样本越短，“最优”越好看，也越假。" +
        '<br><span class="muted">样本内外的点没有相关性——样本内的排名对样本外毫无预测力。这就是 Deflated Sharpe Ratio 要按试验次数打折的原因。</span>';
    }
    bind(el, draw); draw();
  };

  // 3. 换手与成本
  W.cost = function (el) {
    var e = shell(el, ctl([{ k: "g", label: "扣成本前的年化超额", min: 0, max: 30, step: 1, v: 10 }, { k: "c", label: "一次买+卖的往返成本", min: 0.05, max: 0.5, step: 0.01, v: 0.15 }]));
    function draw() {
      var g = getv(el, "g") / 100, c = getv(el, "c") / 100;
      setO(el, "g", (g * 100).toFixed(0) + "%"); setO(el, "c", (c * 100).toFixed(2) + "%");
      var L = function (cc) { var p = []; for (var t = 0; t <= 100; t += 1) p.push([t, g - t * cc]); return p; };
      var be = g / c;
      e.svg.innerHTML = chart({
        h: 260, x: { min: 0, max: 100, ticks: [[0, "0"], [12, "12"], [25, "25"], [50, "50"], [75, "75"], [100, "100"]], label: "年换手率（单边，倍）→" },
        y: { min: -0.5, max: 0.32, ticks: [[-0.4, "−40%"], [-0.2, "−20%"], [0, "0"], [0.2, "20%"]], label: "扣成本后的年化超额" },
        series: [{ pts: L(0.0005), c: "var(--sub)", dash: "4 4", w: 1.2, name: "0.05%" }, { pts: L(0.003), c: "var(--sub)", dash: "2 3", w: 1.2, name: "0.30%" }, { pts: L(c), c: "var(--brand)", w: 2.6, name: "当前成本" }],
        over: function (X, Y) {
          var s = hline(Y(0), 52, 662, "var(--red)") + vline(X(12), 34, 220) + vline(X(50), 34, 220) + T(X(12) + 3, 48, "≈月度调仓", "f-s") + T(X(50) + 3, 48, "≈周度调仓", "f-s");
          if (be <= 100) s += dot(X(be), Y(0), "var(--red)", 6) + T(X(be).toFixed(1), Y(0) + 18, "盈亏平衡 " + be.toFixed(0) + " 倍", "f-s", "middle", "fill:var(--red)");
          return s;
        },
      });
      e.out.innerHTML = "年化成本 ≈ 年换手（单边）× 往返成本。按当前设置：换手 12 倍吃掉 <b>" + (12 * c * 100).toFixed(1) + "%</b>，50 倍吃掉 <b>" + (50 * c * 100).toFixed(1) + "%</b>；换手超过 <b>" + be.toFixed(0) + "</b> 倍，超额就被成本吃光。" +
        '<br><span class="muted">A 股往返成本粗估：佣金万 2.5×2 + 印花税万 5（卖出）+ 过户费 + 滑点，约 0.1%–0.2%；小盘股、小资金（最低 5 元佣金）更高。月度调仓的满仓换手约 6–12 倍/年，日频轮动可达 100 倍以上。</span>';
    }
    bind(el, draw); draw();
  };

  // 4. 因子 IC 与分层回测
  W.ic = function (el) {
    var M = 60, S = 500, r = rng(11), Fm = [], Em = [], Mk = [], Ord = [];
    for (var m = 0; m < M; m++) {
      var f = [], ee = [];
      for (var s = 0; s < S; s++) { f.push(gs(r)); ee.push(gs(r)); }
      Fm.push(f); Em.push(ee); Mk.push(0.006 + 0.06 * gs(r));
      var o = []; for (s = 0; s < S; s++) o.push(s);
      o.sort(function (a, b) { return f[a] - f[b]; }); Ord.push(o);
    }
    var COL = ["var(--green)", "#86c7a5", "var(--sub)", "#ee9b9e", "var(--red)"];
    var e = shell(el, ctl([{ k: "ic", label: "因子的真实 IC", min: -0.1, max: 0.1, step: 0.005, v: 0.05 }]));
    function draw() {
      var ic = getv(el, "ic"), k = Math.sqrt(1 - ic * ic);
      setO(el, "ic", ic.toFixed(3) + (ic === 0 ? "（无效因子）" : Math.abs(ic) >= 0.05 ? "（不错）" : ""));
      var cum = [[1], [1], [1], [1], [1]], ics = [], gsum = [0, 0, 0, 0, 0];
      for (var m = 0; m < M; m++) {
        var f = Fm[m], ee = Em[m], ret = [], sx = 0, sy = 0, sxx = 0, syy = 0, sxy = 0;
        for (var s = 0; s < S; s++) { var y = ic * f[s] + k * ee[s]; ret.push(Mk[m] + 0.08 * y); sx += f[s]; sy += y; sxx += f[s] * f[s]; syy += y * y; sxy += f[s] * y; }
        ics.push((sxy - sx * sy / S) / Math.sqrt((sxx - sx * sx / S) * (syy - sy * sy / S)));
        for (var q = 0; q < 5; q++) { var a = 0; for (var j = q * S / 5; j < (q + 1) * S / 5; j++) a += ret[Ord[m][j]]; a /= S / 5; gsum[q] += a; cum[q].push(cum[q][m] * (1 + a)); }
      }
      var mn = 1e9, mx = -1e9; cum.forEach(function (c) { c.forEach(function (v) { if (v < mn) mn = v; if (v > mx) mx = v; }); });
      e.svg.innerHTML = chart({
        h: 270, x: { min: 0, max: M, ticks: [[0, "0"], [12, "1年"], [24, "2年"], [36, "3年"], [48, "4年"], [60, "5年"]], label: "月份 →（模拟 500 只股票、5 年）" },
        y: autoY(mn, mx, 4, function (v) { return v.toFixed(1); }), l: 48,
        series: cum.map(function (c, q) { return { pts: c.map(function (v, i) { return [i, v]; }), c: COL[q], w: q === 0 || q === 4 ? 2.4 : 1.5, name: q === 0 ? "Q1 因子最低" : q === 4 ? "Q5 因子最高" : "Q" + (q + 1) }; }),
      });
      var im = 0, iv = 0; ics.forEach(function (x) { im += x; }); im /= M; ics.forEach(function (x) { iv += (x - im) * (x - im); }); var isd = Math.sqrt(iv / (M - 1));
      var ann = cum.map(function (c) { return Math.pow(c[M], 12 / M) - 1; });
      e.out.innerHTML = "实测 IC 均值 <b>" + im.toFixed(3) + "</b>，IC 标准差 " + isd.toFixed(3) + "，ICIR <b>" + (im / isd).toFixed(2) + "</b>（年化 ×√12 ≈ " + (im / isd * Math.sqrt(12)).toFixed(2) + "）；IC&gt;0 的月份占 " + (ics.filter(function (x) { return x > 0; }).length / M * 100).toFixed(0) + "%。" +
        "<br>各组年化：" + ann.map(function (a, q) { return '<span style="color:' + COL[q] + '">Q' + (q + 1) + " " + pct(a) + "</span>"; }).join("　") +
        "；多空（Q5−Q1）每月平均 <b class='" + cl(gsum[4] - gsum[0]) + "'>" + pct((gsum[4] - gsum[0]) / M, 2) + "</b>。" +
        '<br><span class="muted">IC 只有 0.05，单月看几乎是噪声（相关系数 0.05！），但 500 只 × 60 个月累积下来分层非常清晰——这就是“IR ≈ IC × √广度”。</span>';
    }
    bind(el, draw); draw();
  };

  // 5. 两资产有效前沿
  W.frontier = function (el) {
    var mS = 0.08, sS = 0.2, mB = 0.03, sB = 0.05;
    var e = shell(el, ctl([{ k: "rho", label: "股债相关系数 ρ", min: -1, max: 1, step: 0.05, v: 0 }]));
    function draw() {
      var rho = getv(el, "rho"); setO(el, "rho", rho.toFixed(2));
      var f = function (w) { var v = w * w * sS * sS + (1 - w) * (1 - w) * sB * sB + 2 * w * (1 - w) * rho * sS * sB; return [Math.sqrt(Math.max(0, v)), w * mS + (1 - w) * mB]; };
      var pts = []; for (var w = 0; w <= 1.0001; w += 0.01) pts.push(f(w));
      var den = sS * sS + sB * sB - 2 * rho * sS * sB, wm = den > 0 ? Math.max(0, Math.min(1, (sB * sB - rho * sS * sB) / den)) : 0;
      var pm = f(wm), p64 = f(0.6), v64 = p64[0] * p64[0], rcS = (0.36 * sS * sS + 0.24 * rho * sS * sB) / v64;
      e.svg.innerHTML = chart({
        h: 270, x: { min: 0, max: 0.22, ticks: [[0, "0"], [0.05, "5%"], [0.1, "10%"], [0.15, "15%"], [0.2, "20%"]], label: "组合年化波动 →" },
        y: { min: 0.02, max: 0.09, ticks: [[0.03, "3%"], [0.05, "5%"], [0.07, "7%"], [0.09, "9%"]], label: "预期年化收益" },
        series: [{ pts: pts, c: "var(--brand)", w: 2.6, name: "股票权重 0% → 100%" }],
        over: function (X, Y) {
          var lab = function (p, t, c, an, dy) { return dot(X(p[0]), Y(p[1]), c, 5.5) + T((X(p[0]) + (an === "end" ? -9 : 9)).toFixed(1), (Y(p[1]) + 4 + (dy || 0)).toFixed(1), t, "f-s", an || "start", "fill:" + c); };
          return lab(f(0), "100% 债", "var(--green)", "start", 12) + lab(f(1), "100% 股", "var(--red)", "end") + lab(p64, "60/40", "var(--orange)", "end", -8) + lab(pm, "最小方差", "var(--purple)", "end", -6);
        },
      });
      e.out.innerHTML = "假设：股票收益 8%、波动 20%；债券收益 3%、波动 5%（示意）。最小方差组合：股票 <b>" + (wm * 100).toFixed(0) + "%</b>，波动 " + (pm[0] * 100).toFixed(1) + "%（比 100% 债券" + (pm[0] < sB - 1e-4 ? "<b>还低</b>" : "相近") + "）。" +
        "<br>60/40 组合波动 " + (p64[0] * 100).toFixed(1) + "%，其中<b>股票贡献了 " + (rcS * 100).toFixed(0) + "% 的风险</b>——资金上是 6:4，风险上几乎全是股票。ρ 越低，曲线越往左弯，分散化越值钱；ρ=−1 时能做出零波动组合。";
    }
    bind(el, draw); draw();
  };

  // 6. 分散化：持股数量 vs 波动
  W.divers = function (el) {
    var e = shell(el, ctl([{ k: "rho", label: "股票之间的平均相关系数 ρ", min: 0, max: 1, step: 0.05, v: 0.3 }]));
    function draw() {
      var rho = getv(el, "rho"), s = 0.35; setO(el, "rho", rho.toFixed(2));
      var f = function (n, r) { return s * Math.sqrt(r + (1 - r) / n); }, a = [], b = [];
      for (var n = 1; n <= 50; n += 0.5) { a.push([n, f(n, rho)]); b.push([n, f(n, 0)]); }
      e.svg.innerHTML = chart({
        h: 250, x: { min: 1, max: 50, ticks: [[1, "1"], [5, "5"], [10, "10"], [20, "20"], [30, "30"], [50, "50"]], label: "等权持有的股票数 N →" },
        y: { min: 0, max: 0.37, ticks: [[0, "0"], [0.1, "10%"], [0.2, "20%"], [0.3, "30%"]], label: "组合年化波动" },
        series: [{ pts: b, c: "var(--sub)", dash: "4 4", w: 1.3, name: "ρ=0（理想）" }, { pts: a, c: "var(--brand)", w: 2.6, name: "当前 ρ" }],
        over: function (X, Y) { return hline(Y(s * Math.sqrt(rho)), 52, 662, "var(--red)") + T(658, Y(s * Math.sqrt(rho)) + 15, "分散不掉的系统风险 σ√ρ = " + (s * Math.sqrt(rho) * 100).toFixed(1) + "%", "f-s", "end", "fill:var(--red)"); },
      });
      e.out.innerHTML = "单只股票波动按 35% 计：持有 1 / 5 / 10 / 20 / 50 只 → " + [1, 5, 10, 20, 50].map(function (n) { return "<b>" + (f(n, rho) * 100).toFixed(1) + "%</b>"; }).join(" / ") +
        "。公式 σ_p = σ·√(ρ + (1−ρ)/N)：前 10–20 只就拿到了大部分分散化好处，再多收益很小。<br>A 股个股平均相关性较高，暴跌时 ρ 还会上升，所以只靠多买几只股票分散不了大盘风险——要靠<b>低相关的资产</b>（债、金、海外）。";
    }
    bind(el, draw); draw();
  };

  // 7. 凯利公式
  W.kelly = function (el) {
    var e = shell(el, ctl([{ k: "p", label: "胜率 p", min: 0.3, max: 0.8, step: 0.01, v: 0.55 }, { k: "b", label: "赔率 b（赢时赚下注额的 b 倍）", min: 0.5, max: 3, step: 0.1, v: 1 }]));
    function draw() {
      var p = getv(el, "p"), b = getv(el, "b"), q = 1 - p; setO(el, "p", (p * 100).toFixed(0) + "%"); setO(el, "b", b.toFixed(1));
      var g = function (f) { return p * Math.log(1 + b * f) + q * Math.log(1 - f); }, fs = p - q / b, pts = [];
      for (var f = 0; f < 0.995; f += 0.005) pts.push([f, g(f)]);
      var gm = fs > 0 ? g(fs) : 0, ymax = Math.max(0.01, gm * 1.4), ymin = -Math.max(0.02, gm * 1.4);
      e.svg.innerHTML = chart({
        h: 260, x: { min: 0, max: 1, ticks: [[0, "0"], [0.25, "25%"], [0.5, "50%"], [0.75, "75%"], [1, "100%"]], label: "每次下注占资金比例 f →" },
        y: autoY(ymin, ymax, 4, function (v) { return (v * 100).toFixed(v === 0 ? 0 : 1) + "%"; }), l: 52,
        series: [{ pts: pts, c: "var(--brand)", w: 2.6, name: "每次下注的长期对数增长率 g(f)" }],
        over: function (X, Y) {
          var s = hline(Y(0), 52, 662);
          if (fs > 0) {
            s += dot(X(fs), Y(gm), "var(--red)", 6) + T(X(fs).toFixed(1), (Y(gm) - 12).toFixed(1), "全凯利", "f-s", "middle", "fill:var(--red)");
            s += dot(X(fs / 2), Y(g(fs / 2)), "var(--orange)", 5) + T(X(fs / 2).toFixed(1), (Y(g(fs / 2)) + 18).toFixed(1), "半凯利", "f-s", "middle", "fill:var(--orange)");
            if (2 * fs < 0.99) s += dot(X(2 * fs), Y(Math.max(ymin, g(2 * fs))), "var(--sub)", 5) + T(X(2 * fs).toFixed(1), (Y(Math.max(ymin, g(2 * fs))) + 18).toFixed(1), "2 倍凯利", "f-s", "middle");
          }
          return s;
        },
      });
      e.out.innerHTML = fs <= 0 ? "❌ 期望为负（p·b &lt; 1−p），<b>最优下注是 0</b>：不玩才是赢。" :
        "最优比例 f* = p − (1−p)/b = <b>" + (fs * 100).toFixed(1) + "%</b>，每次下注期望对数增长 " + (gm * 100).toFixed(2) + "%。半凯利保留 <b>" + (g(fs / 2) / gm * 100).toFixed(0) + "%</b> 的增长、波动减半；2 倍凯利增长率约 " + (2 * fs < 0.99 ? (g(2 * fs) * 100).toFixed(2) + "%" : "—") + "（≈0），再多就长期必亏。" +
        '<br><span class="muted">关键：p 和 b 是估计出来的。高估胜率 → 过度下注 → 回撤巨大。实务常用 1/4–1/2 凯利。</span>';
    }
    bind(el, draw); draw();
  };

  // 8. 风险平价
  W.riskparity = function (el) {
    var NM = ["股票", "债券", "黄金"], SG = [0.2, 0.05, 0.15], MU = [0.07, 0.03, 0.04], COL = ["var(--red)", "var(--brand)", "#e8a317"];
    var e = shell(el, ctl([{ k: "rho", label: "股债相关系数", min: -0.6, max: 0.6, step: 0.05, v: 0 }]));
    function draw() {
      var rho = getv(el, "rho"); setO(el, "rho", rho.toFixed(2));
      var R = [[1, rho, 0.1], [rho, 1, 0.2], [0.1, 0.2, 1]], S = [];
      for (var i = 0; i < 3; i++) { S.push([]); for (var j = 0; j < 3; j++) S[i].push(R[i][j] * SG[i] * SG[j]); }
      var risk = function (w) { var Sw = [0, 0, 0], v = 0; for (var i = 0; i < 3; i++) { for (var j = 0; j < 3; j++) Sw[i] += S[i][j] * w[j]; v += w[i] * Sw[i]; } return { v: Math.sqrt(v), rc: w.map(function (x, i) { return x * Sw[i] / v; }) }; };
      var iv = SG.map(function (s) { return 1 / s; }), t = iv[0] + iv[1] + iv[2]; iv = iv.map(function (x) { return x / t; });
      var erc = iv.slice();
      for (var it = 0; it < 400; it++) { var rr = risk(erc); erc = erc.map(function (x, i) { return x * Math.sqrt((1 / 3) / Math.max(1e-9, rr.rc[i])); }); var tt = erc[0] + erc[1] + erc[2]; erc = erc.map(function (x) { return x / tt; }); }
      var SC = [["等权 1/3", [1 / 3, 1 / 3, 1 / 3]], ["60/40 股债", [0.6, 0.4, 0]], ["逆波动率", iv], ["风险平价", erc]];
      var s = "", y = 8;
      SC.forEach(function (sc) {
        var rr = risk(sc[1]), ret = 0; sc[1].forEach(function (w, i) { ret += w * MU[i]; });
        s += T(4, y + 13, sc[0], "f-h") + T(4, y + 30, "波动 " + (rr.v * 100).toFixed(1) + "% · 收益 " + (ret * 100).toFixed(1) + "%", "f-s");
        [["资金", sc[1]], ["风险", rr.rc]].forEach(function (row, k) {
          var x = 210, yy = y + k * 22;
          s += T(204, yy + 14, row[0], "f-s", "end");
          row[1].forEach(function (w, i) { var wd = Math.max(0, w) * 440; if (wd > 0.5) { s += '<rect x="' + x.toFixed(1) + '" y="' + yy + '" width="' + wd.toFixed(1) + '" height="18" style="fill:' + COL[i] + '" opacity=".85"/>'; if (wd > 34) s += T((x + wd / 2).toFixed(1), yy + 13, (w * 100).toFixed(0) + "%", "f-t", "middle", "fill:#fff;font-size:11px"); } x += wd; });
        });
        y += 54;
      });
      NM.forEach(function (n, i) { s += '<rect x="' + (210 + i * 90) + '" y="' + (y + 2) + '" width="12" height="12" rx="2" style="fill:' + COL[i] + '"/>' + T(226 + i * 90, y + 12, n, "f-s"); });
      e.svg.innerHTML = '<svg viewBox="0 0 680 ' + (y + 20) + '" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
      var rv = risk(erc).v, ret = 0; erc.forEach(function (w, i) { ret += w * MU[i]; });
      e.out.innerHTML = "假设：股票 7%/20%，债券 3%/5%，黄金 4%/15%（收益/波动，示意）。每组上条 = 资金权重，下条 = <b>风险贡献</b>。" +
        "<br>60/40 的风险几乎全来自股票；风险平价让三者各贡献 1/3，代价是债券仓位很重、收益偏低。若加杠杆到 10% 波动，风险平价预期收益约 <b>" + (ret * 0.1 / rv * 100).toFixed(1) + "%</b>（未扣融资成本）——这就是桥水全天候的思路。把股债相关性拖到正值（如 2022 年股债双杀）看看会怎样。";
    }
    bind(el, draw); draw();
  };

  // 9. 波动拖累
  W.vdrag = function (el) {
    var e = shell(el, ctl([{ k: "mu", label: "算术平均年收益 μ", min: 0, max: 20, step: 1, v: 10 }, { k: "sg", label: "年化波动 σ", min: 0, max: 60, step: 1, v: 20 }]));
    function draw() {
      var mu = getv(el, "mu") / 100, sg = getv(el, "sg") / 100; setO(el, "mu", (mu * 100).toFixed(0) + "%"); setO(el, "sg", (sg * 100).toFixed(0) + "%");
      var a = [], b = []; for (var s = 0; s <= 0.6001; s += 0.01) { a.push([s, mu - s * s / 2]); b.push([s, mu]); }
      var gm = mu - sg * sg / 2;
      e.svg.innerHTML = chart({
        h: 250, x: { min: 0, max: 0.6, ticks: [[0, "0"], [0.1, "10%"], [0.2, "20%"], [0.3, "30%"], [0.4, "40%"], [0.5, "50%"], [0.6, "60%"]], label: "年化波动 σ →" },
        y: { min: -0.2, max: 0.22, ticks: [[-0.2, "−20%"], [-0.1, "−10%"], [0, "0"], [0.1, "10%"], [0.2, "20%"]], label: "长期实际（几何）年化收益" },
        series: [{ pts: b, c: "var(--sub)", dash: "4 4", w: 1.3, name: "算术平均 μ" }, { pts: a, c: "var(--brand)", w: 2.6, name: "几何 ≈ μ − σ²/2" }],
        over: function (X, Y) { return hline(Y(0), 52, 662, "var(--red)", "2 3") + dot(X(sg), Y(gm), "var(--red)", 6) + (mu > 0 ? vline(X(Math.sqrt(2 * mu)), 34, 210, "var(--orange)") + T(X(Math.sqrt(2 * mu)) + 4, 48, "σ=" + (Math.sqrt(2 * mu) * 100).toFixed(0) + "% 时长期收益归零", "f-s", "start", "fill:var(--orange)") : ""); },
      });
      e.out.innerHTML = "平均每年 +" + (mu * 100).toFixed(0) + "%、波动 " + (sg * 100).toFixed(0) + "%，长期复合大约只有 <b class='" + cl(gm) + "'>" + pct(gm) + "</b>/年——波动吃掉了 " + (sg * sg / 2 * 100).toFixed(1) + " 个百分点。" +
        "<br>经典例子：先 +50% 再 −50%，算术平均 0，实际 1.5×0.5 = 0.75，亏 25%。这也是<b>杠杆 ETF 长期跑输</b>、<b>降低波动本身就能提高复利</b>的原因。";
    }
    bind(el, draw); draw();
  };

  // 10. 定投 vs 一次性
  W.dca = function (el) {
    var SH = { smile: "先跌后涨（微笑曲线）", frown: "先涨后跌", up: "单边上涨", down: "单边下跌", side: "反复震荡" };
    var e = shell(el, ctl([{ k: "sc", label: "行情情景", opts: Object.keys(SH).map(function (k) { return [k, SH[k]]; }) }]));
    function path(sc) {
      var r = rng(sc.length * 97 + 3), p = [];
      for (var m = 0; m <= 36; m++) {
        var t = m / 36, b = sc === "smile" ? 1 - 0.4 * Math.sin(Math.PI * t) : sc === "frown" ? 1 + 0.4 * Math.sin(Math.PI * t) : sc === "up" ? 1 + 0.6 * t : sc === "down" ? 1 - 0.4 * t : 1 + 0.15 * Math.sin(t * 6 * Math.PI);
        p.push(m === 0 ? 1 : b * (1 + 0.03 * gs(r)));
      }
      return p;
    }
    function draw() {
      var P = path(getv(el, "sc")), sh = 0, inv = 0, d = [], l = [];
      for (var m = 0; m <= 36; m++) {
        if (m < 36) { sh += 1000 / P[m]; inv += 1000; }
        d.push([m, sh * P[m] / inv - 1]); l.push([m, P[m] / P[0] - 1]);
      }
      var avgP = 0; for (m = 0; m < 36; m++) avgP += P[m]; avgP /= 36;
      var mn = 1e9, mx = -1e9; d.concat(l).forEach(function (q) { mn = Math.min(mn, q[1]); mx = Math.max(mx, q[1]); });
      e.svg.innerHTML = chart({
        h: 250, x: { min: 0, max: 36, ticks: [[0, "0"], [12, "1年"], [24, "2年"], [36, "3年"]], label: "月份 →（每月定投 1000 元，共 36 期）" },
        y: autoY(mn, mx, 4, pctFmt), l: 50,
        series: [{ pts: l, c: "var(--sub)", w: 2, name: "一次性投入 3.6 万" }, { pts: d, c: "var(--brand)", w: 2.6, name: "按月定投" }],
        over: function (X, Y) { return hline(Y(0), 50, 662, "var(--red)", "2 3"); },
      });
      var fd = d[36][1], fl = l[36][1];
      e.out.innerHTML = "3 年后：定投收益 <b class='" + cl(fd) + "'>" + pct(fd) + "</b>，一次性 <b class='" + cl(fl) + "'>" + pct(fl) + "</b>。定投平均成本 " + (inv / sh).toFixed(3) + " ＜ 期间平均价格 " + avgP.toFixed(3) + "（调和平均 ≤ 算术平均，价格波动越大差得越多）。" +
        '<br><span class="muted">切换情景会发现：定投在“先跌后涨”最占优，在单边上涨中跑输一次性投入。长期向上的市场里，一次性投入的期望收益通常更高；定投的真正价值是降低择时压力、匹配工资现金流。</span>';
    }
    bind(el, draw); draw();
  };
})();

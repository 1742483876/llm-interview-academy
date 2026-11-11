// 小白量化学堂 · 静态示意图 + 课程配图表
(function () {
  var F = window.FIGS, C = window.CH, Q = window.QM;
  var svg = C.svg, T = C.T, box = C.box, arr = C.arr, pth = C.pth, dot = C.dot, hline = C.hline, chart = C.chart, hbar = C.hbar;

  F.qflow = svg(186,
    (function () {
      var st = [["想法/假设", "经济学逻辑", "谁在给你钱？", "f-box"], ["数据", "复权·停牌", "point-in-time", "f-box"], ["信号/因子", "只用过去数据", "shift(1)", "f-b"], ["回测", "含成本滑点", "涨跌停约束", "f-b"], ["稳健性检验", "样本外", "参数平原", "f-p"], ["模拟盘", "≥3 个月", "对账差异", "f-o"], ["小资金实盘", "≤10% 资金", "逐步加码", "f-g"]];
      var s = "";
      st.forEach(function (x, i) { var bx = 2 + i * 97; s += box(bx, 10, 88, 76, x[3], [x[0], x[1], x[2]]); if (i < 6) s += arr(bx + 88, 48, bx + 96, 48); });
      return s;
    })() +
    '<rect x="2" y="104" width="676" height="38" rx="10" class="f-o" stroke-width="1.2"/>' +
    T(340, 128, "风控贯穿全程：仓位上限 · 止损 / 回撤阈值 · 下单前检查 · 定期复盘", "f-t", "middle") +
    T(150, 170, "◀ 研究阶段：90% 的想法应该死在这里", "f-s", "middle") + T(540, 170, "实盘阶段：盯“实盘 vs 回测”的偏差 ▶", "f-s", "middle"));

  F.ddrec = hbar({
    lw: 110, min: 0, max: 450, rh: 28, top: 10, rpad: 70, ticks: [[0, "0"], [100, "+100%"], [200, "+200%"], [300, "+300%"], [400, "+400%"]],
    rows: [[10, 11.1], [20, 25], [30, 42.9], [40, 66.7], [50, 100], [70, 233.3], [80, 400]].map(function (r) { return { n: "亏 " + r[0] + "% →", v: r[1], t: "需涨 +" + r[1].toFixed(r[1] % 1 ? 1 : 0) + "%", c: r[0] >= 50 ? "var(--red)" : "var(--orange)" }; }),
  });

  F.sharpeT = (function () {
    var a = [], b = [];
    for (var s = 0.2; s <= 3.0001; s += 0.02) { a.push([s, Math.pow(2 / s, 2)]); b.push([s, Math.pow(3 / s, 2)]); }
    return chart({
      h: 250, x: { min: 0.2, max: 3, ticks: [[0.5, "0.5"], [1, "1.0"], [1.5, "1.5"], [2, "2.0"], [2.5, "2.5"], [3, "3.0"]], label: "策略真实年化夏普 →" },
      y: { min: 0.5, max: 100, log: true, ticks: [[1, "1 年"], [3, "3 年"], [10, "10 年"], [30, "30 年"], [100, "100 年"]], label: "需要多少年数据才能证明它不是运气" },
      series: [{ pts: a, c: "var(--brand)", w: 2.4, name: "t = 2（约 95% 置信）" }, { pts: b, c: "var(--orange)", w: 2.4, name: "t = 3（多重检验后）" }],
      over: function (X, Y) { return [[0.5, 16], [1, 4], [2, 1]].map(function (p) { return dot(X(p[0]), Y(p[1]), "var(--brand)", 5) + T(X(p[0]) + 8, Y(p[1]) - 6, "SR " + p[0] + " → " + p[1] + " 年", "f-s", "start", "fill:var(--brand)"); }).join(""); },
    });
  })();

  F.limits = (function () {
    var rows = [["主板股票", "10%（注册制新股前 5 日不设限；ST 自 2025.7 起亦为 10%）", "T+1"], ["创业板 / 科创板", "20%（新股前 5 日不设限）", "T+1"], ["北交所", "30%（新股首日不设限）", "T+1"], ["股票型 ETF", "随标的板块：10% 或 20%", "T+1"], ["可转债", "20%（上市首日 +57.3% / −43.3%）", "T+0"], ["跨境 / 债券 / 黄金 / 货币 ETF", "依品种而定", "T+0"]];
    var s = '<rect x="2" y="2" width="676" height="28" rx="6" class="f-b"/>' + T(14, 21, "品种", "f-h") + T(214, 21, "涨跌幅限制", "f-h") + T(596, 21, "交收", "f-h");
    rows.forEach(function (r, i) {
      var y = 34 + i * 30;
      s += '<rect x="2" y="' + y + '" width="676" height="26" rx="6" class="' + (r[2] === "T+0" ? "f-g" : "f-box") + '"/>' + T(14, y + 18, r[0], "f-t", "start", "font-size:12.5px") + T(214, y + 18, r[1], "f-s", "start", "font-size:12px") + T(596, y + 18, r[2], "f-t", "start", "font-weight:600");
    });
    return svg(244, s + T(4, 236, "回测含义：涨停买不进、跌停卖不出；T+1 让当日止损做不到。规则会调整，以交易所最新规则为准。", "f-s"));
  })();

  F.costBar = hbar({
    lw: 230, min: 0, max: 180, rh: 30, top: 10, rpad: 90, ticks: [[0, "0"], [50, "50 元"], [100, "100 元"], [150, "150 元"]],
    rows: [["佣金 万2.5 × 买卖两次", 50, "var(--brand)"], ["印花税 0.05%（仅卖出）", 50, "var(--purple)"], ["过户费 0.001% × 2", 2, "var(--sub)"], ["滑点 / 冲击（假设每边万 3）", 60, "var(--orange)"], ["合计（≈ 0.16%）", 162, "var(--red)"]].map(function (r) { return { n: r[0], v: r[1], t: r[1] + " 元", c: r[2] }; }),
  });

  F.alphaSrc = svg(170,
    T(340, 16, "你赚到的超额收益，一定是有人“让”给你的——它来自哪里？", "f-h", "middle") +
    box(2, 28, 220, 96, "f-b", ["① 风险补偿", "承担别人不愿承担的风险", "价值、小盘、低流动性", "（会在坏时候集中亏钱）"]) +
    box(230, 28, 220, 96, "f-p", ["② 行为偏差", "过度反应 / 反应不足", "处置效应、彩票偏好", "（对手是情绪化的交易者）"]) +
    box(458, 28, 220, 96, "f-o", ["③ 结构性约束", "T+1、涨跌停、难做空", "机构考核、被动调仓", "（对手是“不得不”交易的人）"]) +
    T(340, 152, "说不清属于哪一种的“超额”，大概率是过拟合、运气，或者只是 beta", "f-s", "middle"));

  F.btLoop = svg(176,
    box(2, 18, 106, 60, "f-box", ["t 日数据", "收盘价·成交量"]) + arr(108, 48, 120, 48) +
    box(122, 18, 106, 60, "f-b", ["计算信号", "只用 ≤ t 的数据"]) + arr(228, 48, 240, 48) +
    box(242, 18, 106, 60, "f-b", ["目标持仓", "仓位·权重"]) + arr(348, 48, 360, 48) +
    box(362, 18, 106, 60, "f-p", ["t+1 执行", "开盘 / 收盘价"]) + arr(468, 48, 480, 48) +
    box(482, 18, 96, 60, "f-o", ["约束+成本", "涨跌停·费用"]) + arr(578, 48, 590, 48) +
    box(592, 18, 86, 60, "f-g", ["更新净值", "记录指标"]) +
    pth("M635,78 V100 H55 V80") + T(345, 116, "下一个交易日，循环", "f-s", "middle") +
    T(340, 146, "向量化写法的灵魂一行：position = signal.shift(1)", "f-t", "middle", "font-family:SF Mono,Menlo,monospace") +
    T(340, 166, "策略收益 = position × 当日收益 − |position 变化| × 单边成本", "f-s", "middle"));

  F.biases = (function () {
    var cs = [["① 前视偏差", "用了当时拿不到的数据", "财报要按公告日对齐", "f-o"], ["② 幸存者偏差", "只测现在还活着的股票", "用历史成分股、含退市股", "f-o"], ["③ 数据窥探", "试 100 次只报最好那次", "记录试验次数并打折", "f-o"], ["④ 成本低估", "忽略滑点 / 冲击 / 最低 5 元", "高换手策略会被吃光", "f-p"],
      ["⑤ 流动性幻觉", "涨停买不进、跌停卖不出", "停牌、小盘冲击成本", "f-p"], ["⑥ 复权错误", "前复权价格含未来信息", "用后复权或复权因子", "f-p"], ["⑦ 样本太窄", "只覆盖一段牛市", "牛熊震荡都要测", "f-b"], ["✅ 检查清单", "逐条打勾", "再相信回测结果", "f-g"]];
    var s = "";
    cs.forEach(function (c, i) { s += box(2 + (i % 4) * 170, 4 + Math.floor(i / 4) * 86, 164, 78, c[3], [c[0], c[1], c[2]], { lh: 18 }); });
    return svg(178, s);
  })();

  F.walkfwd = (function () {
    var s = T(4, 16, "A. Walk-forward：滚动训练 → 往后测试 → 前移", "f-h");
    for (var k = 0; k < 5; k++) {
      var y = 26 + k * 24, x = 80 + k * 62;
      s += T(70, y + 14, "第 " + (k + 1) + " 轮", "f-s", "end") + '<rect x="' + x + '" y="' + y + '" width="270" height="18" rx="4" class="f-b"/>' + T(x + 135, y + 13, "训练 / 调参", "f-s", "middle") +
        '<rect x="' + (x + 272) + '" y="' + y + '" width="60" height="18" rx="4" class="f-o"/>' + T(x + 302, y + 13, "测试", "f-s", "middle");
    }
    s += T(80, 158, "把所有橙色测试段拼起来 = 更接近实盘的净值曲线；参数每轮都按“当时能看到的数据”重新确定", "f-s");
    s += T(4, 190, "B. 时序交叉验证：Purge + Embargo（López de Prado）", "f-h");
    var segs = [["训练", "f-b", 150], ["清除", "f-p", 30], ["测试折", "f-o", 140], ["禁区", "f-p", 30], ["训练", "f-b", 316]], x2 = 4;
    segs.forEach(function (g) { s += '<rect x="' + x2 + '" y="200" width="' + (g[2] - 2) + '" height="26" rx="4" class="' + g[1] + '"/>' + T(x2 + g[2] / 2, 217, g[0], "f-s", "middle"); x2 += g[2]; });
    s += T(4, 248, "清除（purge）：删掉标签区间与测试集重叠的训练样本；禁区（embargo）：测试集之后再空一段，防止自相关泄漏", "f-s");
    return svg(258, s);
  })();

  F.ffTable = (function () {
    var s = T(340, 16, "CAPM：MKT  →  FF3：+SMB +HML  →  Carhart：+UMD  →  FF5：+RMW +CMA", "f-h", "middle");
    [["MKT 市场", "市场组合 − 无风险利率", "f-box"], ["SMB 规模", "小市值 − 大市值", "f-b"], ["HML 价值", "高账面市值比 − 低", "f-b"], ["UMD 动量", "过去 12 个月（剔除近 1 月）", "赢家 − 输家", "f-p"], ["RMW 盈利", "高盈利 − 低盈利", "f-o"], ["CMA 投资", "保守扩张 − 激进扩张", "f-o"]].forEach(function (c, i) {
      var cls = c[c.length - 1], lines = c.slice(0, c.length - 1);
      s += box(2 + (i % 3) * 226, 28 + Math.floor(i / 3) * 76, 218, 68, cls, lines);
    });
    return svg(200, s + T(340, 194, "每个因子 = 一个多空组合的收益；回归后剩下的截距才是 alpha", "f-s", "middle"));
  })();

  F.factorFlow = svg(150,
    (function () {
      var st = [["因子构造", "价量 / 基本面", "另类数据", "f-box"], ["预处理", "去极值 MAD", "标准化·中性化", "f-b"], ["单因子检验", "IC / ICIR", "分层·换手·衰减", "f-b"], ["多因子合成", "IC 加权", "正交化", "f-p"], ["组合优化", "风险模型", "约束·成本", "f-p"], ["回测归因", "超额来源", "拥挤度监控", "f-g"]];
      var s = "";
      st.forEach(function (x, i) { var bx = 2 + i * 113; s += box(bx, 10, 104, 76, x[3], [x[0], x[1], x[2]]); if (i < 5) s += arr(bx + 104, 48, bx + 112, 48); });
      return s;
    })() +
    T(340, 116, "中性化 = 对“行业哑变量 + 对数市值”回归取残差：防止因子只是在押注小盘或某个行业", "f-t", "middle") +
    T(340, 138, "所有财务数据按公告日（point-in-time）对齐；标准化只用当期截面，不能用全样本均值方差", "f-s", "middle"));

  F.cnFactors = (function () {
    var cs = [["短期反转", "上月跌多的下月相对反弹", "散户交易占比高", "f-g"], ["小市值", "长期显著但阶段性失效", "2024 年初微盘踩踏", "f-o"], ["价值（EP）", "CH-3 用盈利价格比", "剔除最小 30% 壳股", "f-b"],
      ["低波 / 低换手", "“彩票”股长期偏弱", "与彩票偏好有关", "f-g"], ["质量 / 盈利", "ROE、毛利率", "熊市里更抗跌", "f-b"], ["中长期动量", "整体偏弱", "与美股结论不同", "f-p"]];
    var s = "";
    cs.forEach(function (c, i) { s += box(2 + (i % 3) * 226, 4 + Math.floor(i / 3) * 84, 218, 76, c[3], [c[0], c[1], c[2]], { lh: 18 }); });
    return svg(196, s + T(340, 190, "定性总结，强弱随时期与拥挤度变化——任何因子都要用最新数据自己检验", "f-s", "middle"));
  })();

  F.barra = svg(206,
    T(4, 18, "Barra 风格风险模型：把几千只股票的风险降维到几十个因子", "f-h") +
    box(2, 30, 120, 50, "f-box", ["个股收益 r", "N 只股票"]) + T(132, 60, "=", "f-h", "middle") +
    box(142, 30, 190, 50, "f-b", ["风格暴露 X", "市值·动量·价值…"]) + T(342, 60, "×", "f-h", "middle") +
    box(352, 30, 120, 50, "f-p", ["因子收益 f", "K 个（几十个）"]) + T(482, 60, "+", "f-h", "middle") +
    box(492, 30, 186, 50, "f-o", ["特质收益 u", "个股独有，彼此不相关"]) +
    box(2, 96, 676, 44, "f-g", ["协方差 Σ = X·F·Xᵀ + Δ　（N×N 的协方差 → K×K 因子协方差 + 对角特质方差）"], { flat: true }) +
    T(340, 166, "组合优化：max  wᵀα − λ·wᵀΣw − 交易成本　s.t. 行业/风格中性、个股上限、换手上限、跟踪误差", "f-t", "middle") +
    T(340, 190, "归因：超额收益 = 风格暴露 × 因子收益（不是你的本事）+ 纯 alpha（才是）", "f-s", "middle"));

  F.trendFig = (function () {
    var P = Q.market(21, 420), H = [], Lo = [], ent = [], ex = [], pos = 0;
    for (var i = 0; i < P.length; i++) {
      if (i < 20) { H.push(null); Lo.push(null); continue; }
      var h = -1e9, l = 1e9, l10 = 1e9;
      for (var j = i - 20; j < i; j++) { h = Math.max(h, P[j]); l = Math.min(l, P[j]); }
      for (j = i - 10; j < i; j++) l10 = Math.min(l10, P[j]);
      H.push([i, h]); Lo.push([i, l]);
      if (!pos && P[i] > h) { pos = 1; ent.push([i, P[i]]); } else if (pos && P[i] < l10) { pos = 0; ex.push([i, P[i]]); }
    }
    var ya = Q.autoY(Math.min.apply(null, P), Math.max.apply(null, P), 4, function (v) { return v.toFixed(0); });
    return chart({
      h: 250, x: { min: 0, max: P.length - 1, ticks: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400 日"]] }, y: ya, l: 50,
      series: [{ band: H.map(function (h, i) { return h ? [i, Lo[i][1], h[1]] : null; }).filter(function (x) { return x; }), c: "var(--brand)", w: 0 }, { pts: P.map(function (v, i) { return [i, v]; }), c: "var(--text)", w: 1.3, name: "价格（模拟）" }, { pts: H, c: "var(--brand)", w: 1, name: "20 日唐奇安通道" }, { pts: Lo, c: "var(--brand)", w: 1 }],
      over: function (X, Y) { return ent.map(function (p) { return dot(X(p[0]), Y(p[1]), "var(--red)", 5); }).join("") + ex.map(function (p) { return dot(X(p[0]), Y(p[1]), "var(--green)", 5); }).join("") + T(60, 238, "● 红点：突破 20 日高点买入　● 绿点：跌破 10 日低点卖出（海龟系统一的简化版）", "f-s"); },
    });
  })();

  F.pairs = (function () {
    var r = Q.rng(5), x = 0, s = [], marks = [], st = 0;
    for (var i = 0; i < 300; i++) { x += 0.08 * (0 - x) + 0.35 * Q.gs(r); s.push([i, x]); }
    var sd = 0; s.forEach(function (p) { sd += p[1] * p[1]; }); sd = Math.sqrt(sd / s.length);
    s.forEach(function (p) { var z = p[1] / sd; if (!st && Math.abs(z) > 2) { st = z > 0 ? -1 : 1; marks.push([p[0], p[1], 1]); } else if (st && (st > 0 ? z >= 0 : z <= 0)) { st = 0; marks.push([p[0], p[1], 0]); } });
    return chart({
      h: 240, x: { min: 0, max: 299, ticks: [[0, "0"], [100, "100"], [200, "200"], [299, "300 日"]] }, y: { min: -3.2 * sd, max: 3.2 * sd, ticks: [[-2 * sd, "−2σ"], [0, "均值"], [2 * sd, "+2σ"]] }, l: 50,
      series: [{ pts: s, c: "var(--purple)", w: 1.6, name: "价差 = A − β·B（模拟）" }],
      over: function (X, Y) { return hline(Y(2 * sd), 50, 662, "var(--red)") + hline(Y(-2 * sd), 50, 662, "var(--green)") + marks.map(function (m) { return dot(X(m[0]), Y(m[1]), m[2] ? "var(--orange)" : "var(--sub)", m[2] ? 5 : 4); }).join("") + T(60, 228, "● 橙：价差偏离 2σ 开仓（卖贵买便宜）　● 灰：回到均值平仓", "f-s"); },
    });
  })();

  F.rotation = svg(196,
    box(2, 40, 150, 104, "f-box", ["ETF 候选池", "沪深300 · 中证1000", "创业板 · 纳指", "黄金 · 国债"], { lh: 18 }) + arr(152, 92, 172, 92) +
    box(174, 40, 150, 104, "f-b", ["每周五收盘", "计算过去 N 日涨幅", "（如 20 日）"], { lh: 18 }) + arr(324, 92, 344, 92) +
    box(346, 18, 160, 60, "f-o", ["取最强 1–2 只", "下周一开盘换仓"]) +
    box(346, 104, 160, 60, "f-g", ["全部 ＜ 0？", "→ 持有国债 / 货币 ETF"]) +
    arr(324, 80, 344, 52) + arr(324, 104, 344, 130) + arr(506, 48, 530, 92) + arr(506, 134, 530, 92) +
    box(532, 62, 146, 60, "f-p", ["持有一周", "循环"]) +
    T(340, 186, "要点：候选资产之间要低相关；N、调仓频率做敏感性测试；周频换手约 20–50 倍/年，ETF 成本低才玩得转", "f-s", "middle"));

  F.gridFig = (function () {
    var r = Q.rng(9), p = [1], m = [];
    for (var i = 1; i < 240; i++) p.push(p[i - 1] * (1 + 0.003 * Math.sin(i / 14) + 0.012 * Q.gs(r) - 0.0004 * Math.log(p[i - 1]) * 50));
    var lv = function (v) { return Math.round(Math.log(v) / Math.log(1.05)); }, last = lv(p[0]);
    p.forEach(function (v, i) { var L = lv(v); if (L < last) { m.push([i, v, 1]); last = L; } else if (L > last) { m.push([i, v, 0]); last = L; } });
    var ya = Q.autoY(Math.min.apply(null, p), Math.max.apply(null, p), 4, function (v) { return v.toFixed(2); });
    return chart({
      h: 230, x: { min: 0, max: 239, ticks: [[0, "0"], [60, "60"], [120, "120"], [180, "180"], [239, "240 日"]] }, y: ya, l: 50,
      series: [{ pts: p.map(function (v, i) { return [i, v]; }), c: "var(--text)", w: 1.3, name: "震荡行情（模拟）" }],
      under: function (X, Y) { var s = ""; for (var k = -6; k <= 6; k++) { var v = Math.pow(1.05, k); if (v > ya.min && v < ya.max) s += hline(Y(v), 50, 662, "var(--line)", "3 3"); } return s; },
      over: function (X, Y) { return m.map(function (q) { return dot(X(q[0]), Y(q[1]), q[2] ? "var(--red)" : "var(--green)", 4); }).join("") + T(60, 218, "虚线 = 每 5% 一格；● 红：每跌一格买一份　● 绿：每涨一格卖一份", "f-s"); },
    });
  })();

  F.volTarget = (function () {
    var r = Q.rng(3), v = 0.15, vs = [], ws = [];
    for (var i = 0; i < 500; i++) { var shock = i > 230 && i < 280 ? 0.04 : 0; v = Math.max(0.08, 0.97 * v + 0.03 * 0.16 + shock * Math.abs(Q.gs(r)) + 0.01 * Q.gs(r)); vs.push([i, v]); ws.push([i, Math.min(1.5, 0.15 / v)]); }
    return chart({
      h: 230, x: { min: 0, max: 499, ticks: [[0, "0"], [250, "250"], [499, "500 日"]] }, y: { min: 0, max: 1.6, ticks: [[0, "0"], [0.5, "50%"], [1, "100%"], [1.5, "150%"]], label: "%" },
      series: [{ pts: vs, c: "var(--orange)", w: 2, name: "预测波动率（模拟）" }, { pts: ws, c: "var(--brand)", w: 2.2, name: "仓位 = 15% ÷ 预测波动" }],
      over: function (X, Y) { return T(X(300), Y(1.45), "← 波动飙升 → 自动降仓", "f-s", "start", "fill:var(--brand)"); },
    });
  })();

  F.mlPipe = svg(176,
    (function () {
      var st = [["原始数据", "按时点对齐", "复权·退市", "f-box"], ["特征工程", "价量·基本面", "截面标准化", "f-b"], ["标签", "未来 N 日超额", "三重障碍法", "f-b"], ["时序切分", "清除 + 禁区", "不能随机打乱", "f-p"], ["模型", "线性 → GBDT", "→ 神经网络", "f-p"], ["评估", "IC · 分层", "组合回测", "f-o"], ["滚动重训", "按月 / 季", "监控漂移", "f-g"]];
      var s = "";
      st.forEach(function (x, i) { var bx = 2 + i * 97; s += box(bx, 10, 88, 76, x[3], [x[0], x[1], x[2]]); if (i < 6) s += arr(bx + 88, 48, bx + 96, 48); });
      return s;
    })() +
    T(340, 118, "金融数据的三座大山：信噪比极低（IC 0.05 就算好）· 非平稳（风格会切换）· 样本少且自相关", "f-t", "middle") +
    T(340, 142, "→ 过拟合比 CV / NLP 严重得多：先做强基线（线性 + 少量因子），复杂模型必须显著打败它", "f-s", "middle") +
    T(340, 164, "评估看 IC / 分层 / 扣成本后的组合收益，而不是分类准确率", "f-s", "middle"));

  F.tools = (function () {
    var cs = [["📦 数据", ["AkShare（开源免费）", "Tushare Pro（积分制）", "Baostock（免费日线/财务）", "Wind / Choice（商业）"], "f-b"], ["🔬 研究回测", ["pandas / numpy 向量化", "vectorbt（参数扫描快）", "backtrader（事件驱动）", "Qlib（微软 AI 量化）"], "f-p"],
      ["☁️ 在线平台", ["聚宽 JoinQuant", "米筐 RiceQuant", "掘金量化", "自带清洗数据与撮合"], "f-o"], ["🚀 实盘", ["券商 QMT / PTrade", "需开通权限，常有门槛", "低频：按信号手动下单", "程序化需按规定报告"], "f-g"]];
    var s = "";
    cs.forEach(function (c, i) { s += box(2 + i * 170, 6, 164, 128, c[2], [c[0]].concat(c[1]), { lh: 22 }); });
    return svg(146, s);
  })();

  F.roadmap = svg(170,
    (function () {
      var st = [["第 1–2 周", "收益风险指标 · A股规则", "pandas 写双均线回测", "f-b"], ["第 3–6 周", "回测偏差 · 过拟合", "成本 · 因子 IC 分层", "f-p"], ["第 2–3 月", "ETF 轮动 / 股债金配置", "仓位风控 · 模拟盘", "f-o"], ["第 4 月起", "≤10% 资金小额实盘", "记录偏差 · 季度复盘", "f-g"]];
      var s = "";
      st.forEach(function (x, i) { var bx = 2 + i * 170; s += box(bx, 14, 160, 84, x[3], [x[0], x[1], x[2]], { lh: 20 }); if (i < 3) s += arr(bx + 160, 56, bx + 168, 56); });
      return s;
    })() +
    T(340, 128, "老大的捷径：把你常用的 20 日线 / MACD / KDJ / RSI 写成规则，在自己持有的板块 ETF 上回测", "f-t", "middle") +
    T(340, 152, "→ 先用数据确认“哪些信号在我的品种上真的有效”，比学新策略更值钱", "f-s", "middle"));

  // 课程配图表
  window.EXTRA = {
    "returns": [{ k: "vdrag", w: 1, t: "波动拖累：波动越大，复利越少", n: "几何年化 ≈ 算术平均 − σ²/2（对数正态近似）。" }],
    "risk": [{ k: "ddrec", t: "回撤越深，回本越难" }, { k: "sharpeT", t: "夏普要多少年才能证明不是运气？", n: "t ≈ SR × √年数（假设收益独立同分布）。" }],
    "market": [{ k: "limits", t: "A 股交易规则速查" }, { k: "costBar", t: "10 万元买入再卖出一次，要花多少钱？", n: "佣金按万 2.5 示意，各券商不同；滑点为假设值。" }],
    "efficient": [{ k: "alphaSrc", t: "超额收益的三个来源" }],
    "bt-basics": [{ k: "btLoop", t: "一次回测循环做了什么" }, { k: "maback", w: 1, t: "双均线策略回测（可调参数、换行情）", n: "数据为随机模拟，仅演示回测机制，不代表任何真实指数。" }],
    "biases": [{ k: "biases", t: "回测七宗罪" }],
    "overfit": [{ k: "overfit", w: 1, t: "过拟合模拟器：从一堆随机策略里挑“最好的”", n: "每个点是一个真实夏普为 0 的随机策略。" }],
    "costs": [{ k: "cost", w: 1, t: "换手率 × 成本：超额是怎么被吃光的" }],
    "validation": [{ k: "walkfwd", t: "Walk-forward 与时序交叉验证" }],
    "factor-intro": [{ k: "ffTable", t: "从 CAPM 到 Fama-French 五因子" }],
    "factor-test": [{ k: "ic", w: 1, t: "因子 IC 与分层回测模拟器", n: "模拟 500 只股票、60 个月：下月收益 = IC × 因子值 + 噪声。拖动 IC 看分层如何变化。" }],
    "factor-prep": [{ k: "factorFlow", t: "因子研究流水线" }],
    "cn-factors": [{ k: "cnFactors", t: "A 股常见因子特征（定性）" }],
    "multifactor": [{ k: "barra", t: "风险模型、组合优化与归因" }],
    "trend": [{ k: "trendFig", t: "唐奇安通道突破（模拟数据）" }],
    "meanrev": [{ k: "pairs", t: "配对交易：价差的均值回归（模拟数据）" }],
    "rotation": [{ k: "rotation", t: "ETF 动量轮动的一种写法" }],
    "dca-grid": [{ k: "dca", w: 1, t: "定投 vs 一次性投入：5 种行情对比" }, { k: "gridFig", t: "网格交易在震荡市中的买卖点（模拟数据）" }],
    "mpt": [{ k: "frontier", w: 1, t: "股债两资产有效前沿（拖动相关性）" }, { k: "divers", w: 1, t: "买多少只股票才算分散？" }],
    "riskparity": [{ k: "riskparity", w: 1, t: "资金权重 vs 风险贡献：四种配置对比" }],
    "kelly": [{ k: "kelly", w: 1, t: "凯利公式：下注多少长期增长最快" }],
    "riskmgmt": [{ k: "volTarget", t: "波动率目标：高波动自动降仓（模拟数据）" }],
    "ml": [{ k: "mlPipe", t: "机器学习选股流水线" }],
    "tools": [{ k: "tools", t: "工具地图" }],
    "roadmap": [{ k: "roadmap", t: "4 个月入门路线" }],
  };
})();

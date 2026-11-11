// 大模型面试学堂 · 静态示意图（第一部分：基础 + 预训练）
(function () {
  var F = window.FIGS, C = window.CH, svg = C.svg, T = C.T, box = C.box, arr = C.arr, pth = C.pth, dot = C.dot, chart = C.chart, arc = C.arc;

  F.archBlock = svg(336,
    T(350, 30, "现代 Decoder 层（Llama / Qwen / DeepSeek 同款骨架）", "f-h") +
    box(90, 8, 200, 30, "f-box", ["输入 x（上一层输出）"], { flat: true }) + arr(190, 38, 190, 54) +
    box(90, 54, 200, 30, "f-g", ["RMSNorm"], { flat: true }) + arr(190, 84, 190, 98) +
    box(90, 98, 200, 44, "f-b", ["Self-Attention", "GQA · RoPE · 因果 mask"]) + arr(190, 142, 190, 158) +
    box(166, 158, 48, 26, "f-box", ["⊕"], { flat: true }) + arr(190, 184, 190, 198) +
    box(90, 198, 200, 30, "f-g", ["RMSNorm"], { flat: true }) + arr(190, 228, 190, 242) +
    box(90, 242, 200, 44, "f-o", ["FFN：SwiGLU", "(Swish(xW₁) ⊙ xW₃)·W₂"]) + arr(190, 286, 190, 300) +
    box(166, 300, 48, 26, "f-box", ["⊕"], { flat: true }) +
    pth("M90,23 H44 V171 H164") + pth("M214,171 H318 V313 H216") +
    T(40, 100, "残差", "f-s", "end") + T(324, 250, "残差", "f-s", "start") +
    T(350, 72, "Pre-Norm：Norm 在残差分支里，梯度沿残差直通", "f-t") +
    T(350, 114, "GQA：多个 query 头共享一组 K/V → KV Cache 小", "f-t") +
    T(350, 134, "RoPE：旋转 q、k，内积只依赖相对位置", "f-t") +
    T(350, 216, "RMSNorm：只除以均方根，不减均值", "f-t") +
    T(350, 260, "SwiGLU：3 个矩阵，中间维 ≈ 8/3·d", "f-t") +
    T(350, 316, "× L 层 → 最终 RMSNorm → LM Head", "f-t"));

  F.gqa = (function () {
    var s = "";
    [["MHA", 8, "KV 头 8 · Cache 1×", "质量基准"], ["GQA", 2, "KV 头 2 · Cache 1/4", "接近 MHA，主流选择"], ["MQA", 1, "KV 头 1 · Cache 1/8", "最省，但掉点明显"]].forEach(function (p, k) {
      var ox = 26 + k * 220;
      s += T(ox + 96, 18, p[0], "f-h", "middle");
      for (var i = 0; i < 8; i++) {
        var qx = ox + i * 24, g = Math.floor(i / (8 / p[1])), kx = p[1] === 8 ? qx : ox + (g + 0.5) * (192 / p[1]) - 12;
        s += '<line x1="' + (qx + 9) + '" y1="52" x2="' + (kx + 9) + '" y2="114" class="f-ln" stroke-width="1" opacity=".6"/>' + '<rect x="' + qx + '" y="34" width="18" height="18" rx="4" class="f-b"/>';
      }
      for (var j = 0; j < p[1]; j++) { var kx2 = p[1] === 8 ? ox + j * 24 : ox + (j + 0.5) * (192 / p[1]) - 12; s += '<rect x="' + kx2 + '" y="114" width="18" height="18" rx="4" class="f-o"/>'; }
      s += T(ox + 96, 156, p[2], "f-t", "middle") + T(ox + 96, 176, p[3], "f-s", "middle");
    });
    return svg(190, s + T(18, 47, "Q", "f-s", "end") + T(18, 127, "KV", "f-s", "end"));
  })();

  F.moe = svg(262,
    box(4, 96, 92, 44, "f-box", ["token", "hidden h"]) + arr(96, 118, 124, 118) +
    box(126, 96, 104, 44, "f-p", ["Router", "softmax → top-2"]) +
    (function () { var s = ""; for (var j = 0; j < 8; j++) { var on = j === 2 || j === 6; s += box(272, 8 + j * 25, 124, 21, on ? "f-o" : "f-box", ["专家 E" + (j + 1) + (on ? "  ✓" : "")], { flat: true, r: 5 }); } return s; })() +
    arr(230, 112, 270, 70) + arr(230, 124, 270, 168) +
    box(272, 216, 124, 34, "f-g", ["共享专家（必过）"], { flat: true }) + pth("M50,140 V233 H270") +
    box(448, 96, 120, 52, "f-b", ["加权求和", "g₃·E₃ + g₇·E₇ + 共享"]) +
    arr(396, 70, 446, 112) + arr(396, 168, 446, 132) + pth("M396,233 H508 V150") + arr(568, 122, 596, 122) +
    box(598, 100, 78, 44, "f-box", ["输出"], { flat: true }) +
    T(60, 172, "每个 token 只算", "f-s") + T(60, 188, "2/8 个路由专家", "f-s") + T(60, 204, "总参大、激活参数小", "f-s"));

  F.mem16 = (function () {
    var seg = [["bf16 权重", 2, "var(--brand)"], ["bf16 梯度", 2, "var(--green)"], ["fp32 主权重", 4, "var(--purple)"], ["Adam m", 4, "var(--orange)"], ["Adam v", 4, "#e8a317"]];
    var s = T(20, 18, "混合精度 + Adam：每个参数占 16 字节（不含激活值）", "f-h"), x = 20, k = 40;
    seg.forEach(function (g) { var w = g[1] * k; s += '<rect x="' + x + '" y="30" width="' + (w - 2) + '" height="42" rx="5" style="fill:' + g[2] + '" opacity=".88"/>' + T(x + w / 2, 48, g[0], "f-t", "middle", "fill:#fff;font-size:12px") + T(x + w / 2, 65, g[1] + " B", "f-t", "middle", "fill:#fff;font-size:12px;font-weight:600"); x += w; });
    s += T(20, 98, "7B → 112 GB · 70B → 1.12 TB · 405B → 6.5 TB：单卡 80GB 连 7B 都装不下 → 需要 ZeRO / FSDP 切分", "f-t");
    s += T(20, 120, "推理只需 bf16 权重（2 B/参数），所以“训练状态显存 ≈ 推理权重 × 8”是个好记的经验值", "f-s");
    return svg(132, s);
  })();

  F.heur = (function () {
    var rows = [["正常科普文章，段落完整", "全部通过", "✓ 保留", "f-g"], ["导航栏 + 大量链接，几乎没有句子", "句末标点比例低 · 短行过多", "✗ 删除", "f-o"], ["SEO 页：同一句话重复 30 次", "重复行 / 高频 n-gram 占比", "✗ 删除", "f-o"], ["Python 代码，符号和花括号多", "符号/词比 · 花括号（C4）", "⚠ 误杀 → 走代码管线", "f-p"], ["数学推导，短行 + LaTeX 符号", "短行比例 · 符号比", "⚠ 误杀 → 数学豁免", "f-p"]];
    var s = T(128, 18, "示例文档", "f-h", "middle") + T(371, 18, "命中的规则", "f-h", "middle") + T(583, 18, "结果", "f-h", "middle");
    rows.forEach(function (r, i) {
      var y = 28 + i * 38;
      s += '<rect x="6" y="' + y + '" width="244" height="32" rx="7" class="f-box"/>' + T(128, y + 21, r[0], "f-t", "middle", "font-size:12.5px");
      s += '<rect x="258" y="' + y + '" width="226" height="32" rx="7" class="f-box"/>' + T(371, y + 21, r[1], "f-s", "middle", "font-size:12px");
      s += '<rect x="492" y="' + y + '" width="182" height="32" rx="7" class="' + r[3] + '"/>' + T(583, y + 21, r[2], "f-t", "middle", "font-size:12.5px");
    });
    return svg(222, s);
  })();

  F.mfFlow = svg(150,
    box(2, 18, 122, 66, "f-box", ["① 抽样", "几十万篇网页"]) + arr(124, 51, 138, 51) +
    box(140, 18, 124, 66, "f-p", ["② 大模型打分", "按教育价值 0–5"]) + arr(264, 51, 278, 51) +
    box(280, 18, 124, 66, "f-b", ["③ 训小分类器", "embedding+回归头", "或 fastText"]) + arr(404, 51, 418, 51) +
    box(420, 18, 124, 66, "f-b", ["④ 全量打分", "几十亿文档"]) + arr(544, 51, 558, 51) +
    box(560, 18, 118, 66, "f-g", ["⑤ 阈值筛选", "如 ≥3 分保留"]) +
    T(340, 112, "贵的模型只看少量样本，便宜的模型跑全量（FineWeb-Edu：Llama-3-70B 标注约 45 万篇）", "f-t", "middle") +
    T(340, 134, "DCLM 更简单：正例 = 指令数据 + ELI5 高赞回答，负例 = 随机网页，直接训 fastText 二分类", "f-s", "middle"));

  F.nemo = svg(198,
    box(4, 70, 136, 52, "f-p", ["分类器集成打分", "多个分类器取最高"]) +
    arr(140, 86, 196, 36) + arr(140, 96, 196, 96) + arr(140, 106, 196, 156) +
    box(198, 14, 120, 44, "f-g", ["高质量档"], { flat: true }) + box(198, 74, 120, 44, "f-b", ["中质量档"], { flat: true }) + box(198, 134, 120, 44, "f-o", ["低质量档"], { flat: true }) +
    arr(318, 36, 340, 36) + arr(318, 96, 340, 96) + arr(318, 156, 340, 156) +
    box(342, 14, 334, 44, "f-box", ["保留原文 + 生成多样化 QA / 知识抽取（扩量）"], { flat: true }) +
    box(342, 74, 334, 44, "f-box", ["保留原文"], { flat: true }) +
    box(342, 134, 334, 44, "f-box", ["不直接扔：用 LLM 改写成更干净的文本"], { flat: true }) +
    T(4, 194, "Nemotron-CC：在“质量”和“token 数量”之间取舍，适合 15T 级长训练（只留高分数据会被重复太多次）", "f-s"));

  F.mixDonut = (function () {
    var seg = [["通用知识", 50, "var(--brand)"], ["数学与推理", 25, "var(--orange)"], ["代码", 17, "var(--purple)"], ["多语言", 8, "var(--green)"]];
    var s = "", a = 0;
    seg.forEach(function (g) { var b = a + g[1] / 100 * 2 * Math.PI, m = (a + b) / 2; s += arc(130, 112, 92, 54, a, b - 0.003, g[2]) + T((130 + 73 * Math.sin(m)).toFixed(1), (112 - 73 * Math.cos(m) + 4).toFixed(1), g[1] + "%", "f-t", "middle", "fill:#fff;font-weight:600;font-size:12px"); a = b; });
    s += T(130, 108, "Llama 3", "f-h", "middle") + T(130, 126, "预训练配比", "f-s", "middle");
    seg.forEach(function (g, i) { var y = 40 + i * 30; s += '<rect x="262" y="' + (y - 11) + '" width="14" height="14" rx="3" style="fill:' + g[2] + '"/>' + T(284, y, g[0] + "  " + g[1] + "%", "f-t", "start", "font-weight:600"); });
    s += T(262, 166, "· 数学推理 + 代码 = 42%，远高于早期模型", "f-s") + T(262, 186, "· 通用知识里做了“知识分类降采样”：娱乐、艺术等过多类别被下采", "f-s") + T(262, 206, "· 配比由小模型 scaling 实验确定，不是拍脑袋", "f-s");
    return svg(220, s);
  })();

  F.doremi = svg(160,
    box(2, 12, 150, 70, "f-box", ["① 参考模型", "均匀配比训练", "（280M）"]) + arr(152, 47, 170, 47) +
    box(172, 12, 172, 70, "f-p", ["② 代理模型 + Group DRO", "超额损失 = 代理 − 参考", "超额损失大的域 → 权重↑"]) + arr(344, 47, 362, 47) +
    box(364, 12, 146, 70, "f-b", ["③ 取平均权重", "训练全程权重均值"]) + arr(510, 47, 528, 47) +
    box(530, 12, 146, 70, "f-g", ["④ 训大模型", "8B（大 30×）", "达到基线快 2.6×"]) +
    T(340, 112, "RegMix 换个思路：随机配比训几百个小模型 → 回归拟合“配比 → 验证 loss” → 搜最优配比", "f-t", "middle") +
    T(340, 134, "共同前提：小规模的配比排名能迁移到大规模（要在 2 个以上规模验证）", "f-s", "middle"));

  F.spike = (function () {
    var f = function (t) { return 2.1 + 1.6 * Math.exp(-5 * t) + 0.025 * Math.sin(t * 90) + 0.015 * Math.sin(t * 233); };
    var a = [], b = [], t;
    for (t = 0; t <= 0.64; t += 0.004) { var v = f(t); if (t > 0.55) v += 1.5 * Math.pow((t - 0.55) / 0.09, 2); a.push([t, v]); }
    for (t = 0.5; t <= 1.0001; t += 0.004) b.push([t, f(t + 0.01) - 0.01]);
    return chart({
      h: 240, x: { min: 0, max: 1, ticks: [[0, "0"], [0.5, "回滚点"], [1, ""]], label: "训练步数 →（示意）" },
      y: { min: 2, max: 3.8, ticks: [[2, "2.0"], [2.5, "2.5"], [3, "3.0"], [3.5, "3.5"]], label: "训练 loss" },
      series: [{ pts: a, c: "var(--orange)", w: 2, name: "原始：出现 loss spike" }, { pts: b, c: "var(--green)", w: 2, name: "回滚 + 跳过坏 batch" }],
      over: function (X, Y) { return T(X(0.6), Y(3.55), "spike：先查附近 batch 的数据", "f-s", "start", "fill:var(--orange)") + T(X(0.67), Y(2.78), "回滚到之前的 checkpoint，", "f-s", "start", "fill:var(--green)") + T(X(0.67), Y(2.62), "跳过附近 200–500 个 batch（PaLM）", "f-s", "start", "fill:var(--green)") + dot(X(0.5), Y(f(0.5)), "var(--green)", 5); },
    });
  })();

  F.ablFlow = svg(178,
    T(4, 16, "A. 小模型数据消融（便宜、可大量做）", "f-h") +
    box(2, 26, 128, 54, "f-box", ["固定配方", "1–2B · 20–100B tok"]) + arr(130, 53, 144, 53) +
    box(146, 26, 118, 54, "f-b", ["只换数据", "总 token 相同"]) + arr(264, 53, 278, 53) +
    box(280, 26, 118, 54, "f-b", ["≥2 个随机种子", "估计噪声"]) + arr(398, 53, 412, 53) +
    box(414, 26, 126, 54, "f-p", ["早期信号基准", "cloze + 目标域 PPL"]) + arr(540, 53, 554, 53) +
    box(556, 26, 120, 54, "f-g", ["提升 > 2× 噪声", "才算数"]) +
    T(4, 108, "B. 退火验证（更贴近大模型，Llama 3 做法）", "f-h") +
    box(2, 118, 180, 50, "f-box", ["训练到一半的 8B checkpoint"], { flat: true }) + arr(182, 143, 198, 143) +
    box(200, 118, 250, 50, "f-p", ["40B tokens 退火：新数据占 30%"], { flat: true }) + arr(450, 143, 466, 143) +
    box(468, 118, 208, 50, "f-g", ["对比不加新数据的退火基线"], { flat: true }));

  F.noise = (function () {
    var bs = function (t) { return 25 + 30 * (1 - Math.exp(-t / 9)); }, df = function (t) { return 4 * (1 - Math.exp(-t / 10)); }, wd = function (t) { return 2.2 * Math.exp(-t / 30) + 0.8; };
    var a = [], b = [], ba = [], bb = [];
    for (var t = 0.5; t <= 30.001; t += 0.5) { a.push([t, bs(t)]); b.push([t, bs(t) + df(t)]); ba.push([t, bs(t) - wd(t), bs(t) + wd(t)]); bb.push([t, bs(t) + df(t) - wd(t), bs(t) + df(t) + wd(t)]); }
    return chart({
      h: 250, x: { min: 0, max: 30, ticks: [[0, "0"], [5, "5B"], [10, "10B"], [20, "20B"], [30, "30B"]], label: "训练 tokens →（示意）" },
      y: { min: 20, max: 65, ticks: [[20, "20"], [30, "30"], [40, "40"], [50, "50"], [60, "60"]], label: "基准分（阴影 = 随机种子范围）" },
      series: [{ pts: a, band: ba, c: "var(--sub)", w: 2, name: "基线数据" }, { pts: b, band: bb, c: "var(--brand)", w: 2.4, name: "新数据" }],
      over: function (X, Y) { return T(X(2.5), Y(57), "早期：两条带子重叠 → 还不能下结论", "f-s", "start") + T(X(29.5), Y(46), "后期：差距 > 噪声 → 新数据确实更好", "f-s", "end", "fill:var(--brand)"); },
    });
  })();

  F.tokBar = C.hbar({
    lw: 150, min: 0, max: 40, rh: 28, top: 10, rpad: 70,
    ticks: [[0, "0"], [10, "10T"], [20, "20T"], [30, "30T"], [40, "40T"]],
    rows: [["GPT-3（2020）", 0.3], ["Chinchilla（2022）", 1.4], ["Llama 2（2023）", 2], ["OLMo 2 7B（2024）", 4], ["DeepSeek-V3（2024）", 14.8], ["Llama 3（2024）", 15], ["Kimi K2（2025）", 15.5], ["Qwen2.5（2024）", 18], ["Qwen3（2025）", 36]].map(function (r) { return { n: r[0], v: r[1], t: r[1] + "T", c: r[1] >= 14 ? "var(--brand)" : "var(--sub)" }; }),
  });
})();

// 大模型面试学堂 · JD 专项图表（ES2015 兼容）
(function () {
  var F = window.FIGS, C = window.CH, W = window.WIDGETS;
  var svg = C.svg, T = C.T, box = C.box, arr = C.arr, pth = C.pth, chart = C.chart, hbar = C.hbar;

  // 1. 8 家 JD × 方向 热力图
  F.jdHeat = (function () {
    var cols = [["清洗过滤", "去重"], ["质量", "评估"], ["合成", "数据"], ["配比", "Scaling"], ["数据", "选择"], ["管线", "工程"], ["实验", "验证"], ["多源", "解析"], ["mid-train", "领域"], ["蒸馏", "后训练"], ["标签", "标注"]];
    var rows = [["阿里 Qwen", [1, 2, 2, 2, 1, 2, 2, 1, 2, 1, 0]], ["阶跃星辰", [1, 2, 2, 2, 0, 1, 1, 1, 0, 1, 0]], ["九坤至知", [2, 2, 2, 2, 0, 2, 1, 1, 0, 0, 2]], ["Shopee", [2, 2, 2, 2, 2, 1, 0, 0, 0, 2, 1]],
      ["MiniMax", [2, 2, 0, 0, 1, 2, 2, 2, 0, 0, 0]], ["小红书 Dots", [2, 2, 0, 2, 2, 2, 2, 0, 0, 0, 0]], ["面壁智能", [1, 2, 2, 0, 2, 0, 1, 0, 2, 2, 0]], ["字节数据安全", [1, 2, 2, 0, 0, 0, 0, 1, 0, 0, 2]]];
    var x0 = 118, cw = 50, y0 = 44, rh = 30, s = "";
    cols.forEach(function (c, j) { var x = x0 + j * cw + cw / 2; s += T(x, 16, c[0], "f-s", "middle", "font-size:10.5px") + T(x, 30, c[1], "f-s", "middle", "font-size:10.5px"); });
    var sum = cols.map(function () { return 0; });
    rows.forEach(function (r, i) {
      var y = y0 + i * rh;
      s += T(x0 - 8, y + 19, r[0], "f-t", "end", "font-size:12.5px");
      r[1].forEach(function (v, j) {
        sum[j] += v;
        var fill = v === 2 ? "var(--brand)" : v === 1 ? "var(--brand-soft)" : "var(--bg)";
        s += '<rect x="' + (x0 + j * cw + 2) + '" y="' + (y + 2) + '" width="' + (cw - 4) + '" height="' + (rh - 4) + '" rx="4" style="fill:' + fill + ';stroke:var(--line)"/>';
        if (v) s += T(x0 + j * cw + cw / 2, y + 19, v === 2 ? "重点" : "提及", "f-s", "middle", v === 2 ? "fill:#fff;font-size:11px" : "font-size:11px");
      });
    });
    var yb = y0 + rows.length * rh + 4;
    s += T(x0 - 8, yb + 15, "热度合计", "f-h", "end", "font-size:12px");
    sum.forEach(function (v, j) { s += T(x0 + j * cw + cw / 2, yb + 15, v, "f-h", "middle", "font-size:12px;fill:" + (v >= 12 ? "var(--red)" : "var(--text)")); });
    s += T(4, yb + 40, "按老大提供的 JD 原文整理：“重点”=单独成条或反复强调，“提及”=顺带出现。合计越高越该优先准备（红色 ≥ 12）。", "f-s");
    return svg(yb + 50, s);
  })();

  // 2. 数据选择方法地图
  F.selTax = svg(214,
    box(2, 8, 216, 150, "f-b", ["① 参考分布", "“像不像目标数据”", "DSIR 重要性重采样", "fastText / 质量分类器", "便宜 · 目标集决定偏好"], { lh: 22 }) +
    box(232, 8, 216, 150, "f-p", ["② 模型信号", "“对模型有没有用”", "PPL / loss / excess loss", "梯度 · 影响力（LESS / MATES）", "信息多 · 成本高"], { lh: 22 }) +
    box(462, 8, 216, 150, "f-o", ["③ 多样性", "“是不是重复的”", "SemDeDup / D4", "聚类均衡 · 温度采样", "防塌缩 · 不保证质量"], { lh: 22 }) +
    T(340, 182, "粒度：文档级 → 段落级 → token 级（RHO-1）　·　时机：静态打一次分 → 随训练动态选（MATES、在线配比）", "f-t", "middle") +
    T(340, 204, "组合用法：去重 → 质量分档 → 域内温度采样 → 按配比混合 → 同 token 预算消融验证", "f-s", "middle"));

  // 3. PPL 分布与三个区间
  F.pplBand = (function () {
    var d = [];
    for (var x = 0.5; x <= 8; x += 0.05) { var l = Math.log(x), m = Math.log(2.6), sg = 0.45; d.push([x, Math.exp(-(l - m) * (l - m) / (2 * sg * sg)) / x]); }
    return chart({
      h: 240, x: { min: 0.5, max: 8, ticks: [[1, "低"], [2.6, "中"], [6, "高"]], label: "参考模型困惑度（示意，对数分布）→" },
      y: { min: 0, max: 0.42, ticks: [], label: "文档占比" }, l: 30,
      series: [{ pts: d, c: "var(--text)", w: 2.2 }],
      under: function (X) {
        var b = function (a, z, c) { return '<rect x="' + X(a).toFixed(1) + '" y="34" width="' + (X(z) - X(a)).toFixed(1) + '" height="166" style="fill:' + c + '" opacity=".14"/>'; };
        return b(0.5, 1.6, "var(--orange)") + b(1.6, 4.2, "var(--green)") + b(4.2, 8, "var(--red)");
      },
      over: function (X) {
        return T(X(1.05), 52, "低 PPL", "f-h", "middle", "fill:var(--orange)") + T(X(1.05), 68, "模板 / 重复", "f-s", "middle") + T(X(1.05), 82, "广告 / 简单句", "f-s", "middle") +
          T(X(2.9), 156, "中间区间", "f-h", "middle", "fill:var(--green)") + T(X(2.9), 174, "多数正常的优质文本", "f-s", "middle") +
          T(X(6), 52, "高 PPL", "f-h", "middle", "fill:var(--red)") + T(X(6), 68, "乱码 / 噪声", "f-s", "middle") + T(X(6), 82, "也有难的专业内容", "f-s", "middle");
      },
    });
  })();

  // 4. PDF 路由
  F.pdfRoute = svg(250,
    box(2, 96, 96, 54, "f-box", ["PDF", "书 / 论文 / 报告"]) + arr(98, 123, 118, 123) +
    box(120, 96, 108, 54, "f-p", ["路由分类器", "文本层可靠吗？", "版面复杂吗？"]) +
    arr(228, 110, 262, 40) + arr(228, 123, 262, 123) + arr(228, 136, 262, 206) +
    box(264, 14, 190, 52, "f-g", ["快速路：文本层抽取", "PyMuPDF · 成本最低"]) +
    box(264, 97, 190, 52, "f-b", ["中速路：版面分析 + OCR", "公式→LaTeX · 表格→Markdown"]) +
    box(264, 180, 190, 52, "f-o", ["慢速路：VLM 解析", "图像 + 文本层锚点（olmOCR）"]) +
    arr(454, 40, 490, 110) + arr(454, 123, 490, 123) + arr(454, 206, 490, 136) +
    box(492, 80, 186, 86, "f-box", ["统一质检", "乱码 · 重复 · PPL 异常", "LaTeX 编译 · 编辑距离", "抽样人工 + 下游消融"], { lh: 18 }));

  // 5. 管线分层架构
  F.pipeArch = (function () {
    var L = [["原始层", "WARC / PDF / 代码仓库（不可变）", "f-box"], ["抽取层", "正文抽取 · PDF 解析 · 语言识别", "f-b"], ["过滤层", "规则过滤（记录 reason code）", "f-b"], ["去重层", "精确 → MinHash → 语义去重", "f-p"], ["打分标签层", "质量分 · 主题 · 格式 · 安全（GPU 批推理）", "f-p"], ["混合层", "去污染 · 按配比采样 · tokenize · 打包 shard", "f-o"]];
    var s = "";
    L.forEach(function (l, i) {
      var y = 6 + i * 40;
      s += box(2, y, 128, 34, l[2], [l[0]], { flat: true, r: 6 }) + '<rect x="136" y="' + y + '" width="356" height="34" rx="6" class="f-box" stroke-width="1"/>' + T(146, y + 22, l[1], "f-t", "start", "font-size:12.5px");
      if (i < L.length - 1) s += arr(66, y + 34, 66, y + 40);
    });
    s += box(504, 6, 174, 112, "f-g", ["横切能力", "数据版本 = 代码+配置+数据", "每层落盘、可单层重跑", "全局 doc id 与血缘"], { lh: 20 });
    s += box(504, 128, 174, 112, "f-o", ["可观测", "每步保留率", "域名 / 语言 / 主题报表", "抽样看板 · 突变告警"], { lh: 20 });
    return svg(248, s);
  })();

  // 6. 分布式 MinHash
  F.mhDist = svg(186,
    box(2, 20, 120, 64, "f-b", ["① Map", "每篇算签名", "k = b × r 个哈希"]) + arr(122, 52, 136, 52) +
    box(138, 20, 128, 64, "f-p", ["② Shuffle", "key = (band, 段哈希)", "同桶即候选"]) + arr(266, 52, 280, 52) +
    box(282, 20, 120, 64, "f-p", ["③ 成边", "桶内文档相连", "（连到桶内首篇）"]) + arr(402, 52, 416, 52) +
    box(418, 20, 128, 64, "f-o", ["④ 连通分量", "Union-Find /", "large-small star"]) + arr(546, 52, 560, 52) +
    box(562, 20, 116, 64, "f-g", ["⑤ 每簇留一篇", "最长 / 最早"]) +
    T(340, 116, "瓶颈 1：shuffle 数据量 ≈ 文档数 × b × 段哈希大小　　瓶颈 2：模板页形成超大桶，边数爆炸", "f-t", "middle") +
    T(340, 140, "对策：先精确哈希去重 · 大桶截断或抽样 · 按 band 分批 · 桶内只连首篇 · GPU 加速（NeMo Curator）", "f-s", "middle") +
    T(340, 162, "数据决策同样重要：FineWeb 显示“快照内去重”优于“跨快照全局去重”", "f-s", "middle"));

  // 7. 数据飞轮
  F.flywheel = (function () {
    var cx = 340, cy = 140, RX = 230, RY = 100, st = [["评测", "多维基准 + bad case", "f-b"], ["诊断", "按标签归因缺口", "f-p"], ["补数", "召回 · 解析 · 合成", "f-o"], ["验证", "消融 / 退火实验", "f-g"], ["上线", "进入下一轮配比", "f-b"]];
    var s = '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + RX + '" ry="' + RY + '" fill="none" style="stroke:var(--line)" stroke-width="10"/>' + T(cx, cy - 4, "数据飞轮", "f-h", "middle") + T(cx, cy + 14, "每转一圈，数据和模型都变强", "f-s", "middle");
    st.forEach(function (g, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / st.length, x = cx + RX * Math.cos(a), y = cy + RY * Math.sin(a);
      s += box(x - 74, y - 24, 148, 48, g[2], [g[0], g[1]]);
    });
    return svg(272, s);
  })();

  // 8. 蒸馏对比
  F.distill = svg(184,
    box(2, 8, 330, 132, "f-b", ["数据蒸馏（序列级）", "教师生成文本 → 学生 SFT", "✓ 跨分词器、可质检可复用、实现简单", "✗ 只有采样出的一条序列，信息少", "例：R1 → Qwen / Llama 小模型"], { lh: 22 }) +
    box(348, 8, 330, 132, "f-p", ["logits 蒸馏（分布级）", "学生拟合教师每个位置的概率分布", "✓ 信息丰富、样本效率高", "✗ 需同词表，存 / 算教师 logits 成本高", "例：Gemma 2、Llama 3.2 小模型预训练"], { lh: 22 }) +
    T(340, 166, "自训练（STaR / ReST）：用模型自己生成、经验证器过滤的数据训练自己——要防覆盖面越来越窄", "f-s", "middle"));

  // 9. 覆盖率矩阵（示意）
  F.taxMatrix = (function () {
    var rowsN = ["内科", "外科", "儿科", "妇产", "肿瘤", "药学", "护理", "罕见病"], colsN = ["高质量", "中质量", "低质量"];
    var v = [[9, 6, 3], [7, 5, 3], [4, 4, 2], [5, 3, 2], [8, 4, 2], [6, 5, 4], [3, 4, 5], [0.4, 0.6, 0.5]], tgt = [8, 6, 5, 5, 6, 5, 4, 2];
    var s = T(4, 16, "医学数据覆盖率矩阵（示意数字，单位 B tokens）：先看“有什么”，再和目标比“缺什么”", "f-h"), x0 = 96, cw = 96, y0 = 30, rh = 26;
    colsN.forEach(function (c, j) { s += T(x0 + j * cw + cw / 2, y0 + 14, c, "f-s", "middle"); });
    s += T(x0 + 3 * cw + 50, y0 + 14, "高质量目标", "f-s", "middle") + T(x0 + 3 * cw + 150, y0 + 14, "缺口", "f-s", "middle");
    rowsN.forEach(function (r, i) {
      var y = y0 + 20 + i * rh;
      s += T(x0 - 8, y + 17, r, "f-t", "end", "font-size:12.5px");
      v[i].forEach(function (val, j) {
        var op = Math.min(0.95, 0.12 + val / 10);
        s += '<rect x="' + (x0 + j * cw + 2) + '" y="' + (y + 2) + '" width="' + (cw - 4) + '" height="' + (rh - 4) + '" rx="4" style="fill:var(--brand)" opacity="' + op.toFixed(2) + '"/>' + T(x0 + j * cw + cw / 2, y + 17, val, "f-t", "middle", op > 0.55 ? "fill:#fff;font-size:12px" : "font-size:12px");
      });
      var gap = tgt[i] - v[i][0];
      s += T(x0 + 3 * cw + 50, y + 17, tgt[i], "f-t", "middle", "font-size:12px");
      s += T(x0 + 3 * cw + 150, y + 17, gap > 0 ? "缺 " + (+gap.toFixed(1)) + "B" : "✓ 足够", "f-t", "middle", "font-size:12px;fill:" + (gap > 0 ? "var(--red)" : "var(--green)"));
    });
    var yb = y0 + 20 + rowsN.length * rh + 18;
    s += T(4, yb, "读法：儿科、护理、罕见病的高质量数据不足 → 定向召回（指南 / 教材 / 文献）或改写低质量档提质；高质量充足的类目可以不再加。", "f-s");
    return svg(yb + 10, s);
  })();

  // 10. 合成数据质检漏斗
  F.synthQA = (function () {
    var st = [["生成", "改写 · 种子生成 · QA 化 · 轨迹蒸馏", "f-box"], ["① 规则统计", "长度 · 重复 · 模板痕迹 · 语言", "f-b"], ["② 自动验证", "答案判等 · 执行单测 · 检索比对 · NLI", "f-b"], ["③ LLM 裁判", "多维打分 · 多裁判 · 交换顺序 · 异源", "f-p"], ["④ 多样性与去污染", "语义去重 · 主题覆盖 · 评测集比对", "f-p"], ["⑤ 人工抽检", "按类型分层抽样 · 错误类型统计", "f-o"], ["⑥ 小模型消融", "固定总 token · 目标能力 + 通用护栏", "f-g"]];
    var s = "";
    st.forEach(function (g, i) { var w = 640 - i * 44, x = (680 - w) / 2, y = 4 + i * 38; s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="33" rx="8" class="' + g[2] + '" stroke-width="1.1"/>' + T(x + 14, y + 21, g[0], "f-h", "start", "font-size:12.5px") + T(x + w - 14, y + 21, g[1], "f-s", "end"); });
    return svg(298, s + T(340, 292, "越往下越贵，但只有最后一步能回答“对模型到底有没有用”", "f-s", "middle"));
  })();

  // 11. 简历结构
  F.resumeFig = svg(262,
    box(2, 6, 250, 246, "f-box", []) + T(127, 28, "一页简历的骨架", "f-h", "middle") +
    box(16, 40, 222, 30, "f-b", ["抬头 + 求职方向"], { flat: true, r: 6 }) +
    box(16, 76, 222, 30, "f-b", ["个人优势 3 行（含代表数字）"], { flat: true, r: 6 }) +
    box(16, 112, 222, 66, "f-o", ["项目经历 3–4 个", "按与 JD 相关度排序"], { r: 6 }) +
    box(16, 184, 222, 28, "f-p", ["技能：数据算法 / 工程 / 训练评测"], { flat: true, r: 6 }) +
    box(16, 218, 222, 28, "f-g", ["论文 · 开源 · 博客"], { flat: true, r: 6 }) +
    T(272, 24, "每条经历的公式", "f-h") +
    box(272, 34, 406, 40, "f-o", ["动作 + 对象 + 方法 + 量化结果 + 验证方式"], { flat: true }) +
    T(272, 98, "必须出现的四类数字", "f-h") +
    box(272, 108, 98, 64, "f-b", ["规模", "TB → B tokens", "类目数"]) + box(376, 108, 98, 64, "f-b", ["质量", "准确率 / F1", "抽检一致率"]) +
    box(480, 108, 98, 64, "f-p", ["模型收益", "基准 +a 分", "vs 噪声 ±c"]) + box(584, 108, 94, 64, "f-g", ["效率", "耗时 / 成本", "下降 x%"]) +
    T(272, 196, "老大的王牌：医学分类体系 + 覆盖率 → 对口九坤 / 阶跃 / Qwen", "f-t") +
    T(272, 218, "长病程多表关联质量 → 对口 MiniMax（正确性与错误分析）", "f-t") +
    T(272, 240, "缺合成或工程经历：用 2–4 周的小项目补上并开源", "f-s"));

  // 交互：质量阈值 × 领域覆盖
  W.coverage = function (el) {
    var DOM = [["学术 / 教育", 1.0, 3.3], ["医疗健康", 0.5, 2.9], ["新闻", 1.2, 2.7], ["代码文档", 0.6, 2.8], ["论坛问答", 1.5, 2.2], ["文学创作", 0.7, 2.1], ["生活 / 娱乐", 2.0, 1.7], ["电商 / 广告", 2.5, 1.2]];
    var erf = function (x) { var t = 1 / (1 + 0.3275911 * Math.abs(x)), y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x); return x >= 0 ? y : -y; };
    var keep = function (t, m) { return 1 - 0.5 * (1 + erf((t - m) / (0.8 * Math.SQRT2))); };
    var e = C.shell(el, C.ctl([{ k: "t", label: "质量分阈值（0–5 分）", min: 0, max: 4.5, step: 0.1, v: 3 }, { k: "m", label: "每个领域最低保留比例", min: 0, max: 50, step: 5, v: 0 }]));
    function draw() {
      var t = C.getv(el, "t"), mk = C.getv(el, "m") / 100; C.setO(el, "t", "≥ " + t.toFixed(1)); C.setO(el, "m", mk ? (mk * 100).toFixed(0) + "%（分域阈值）" : "不设（统一阈值）");
      var tot0 = 0, tot1 = 0, rk = [];
      DOM.forEach(function (d) {
        var r = keep(t, d[2]);
        if (mk && r < mk) { var lo = -2, hi = 6; for (var i = 0; i < 40; i++) { var md = (lo + hi) / 2; if (keep(md, d[2]) > mk) lo = md; else hi = md; } r = keep(lo, d[2]); }
        rk.push(r); tot0 += d[1]; tot1 += d[1] * r;
      });
      var rows = [], kl = 0;
      DOM.forEach(function (d, i) {
        var p0 = d[1] / tot0, p1 = d[1] * rk[i] / tot1; if (p1 > 0) kl += p1 * Math.log(p1 / p0);
        rows.push({ n: d[0] + " 原始", v: p0 * 100, t: (p0 * 100).toFixed(1) + "%", c: "var(--sub)", op: 0.35 });
        rows.push({ n: "保留 " + (rk[i] * 100).toFixed(0) + "%", v: p1 * 100, t: (p1 * 100).toFixed(1) + "%" + (p1 / p0 < 0.5 ? " ⚠ 占比腰斩" : ""), c: p1 / p0 < 0.5 ? "var(--orange)" : "var(--brand)" });
      });
      e.svg.innerHTML = hbar({ lw: 110, min: 0, max: 45, rh: 19, top: 8, rpad: 130, rows: rows, ticks: [[0, "0"], [10, "10%"], [20, "20%"], [30, "30%"], [40, "40%"]] });
      e.out.innerHTML = "总保留 <b>" + (tot1 / tot0 * 100).toFixed(1) + "%</b> 的数据；过滤后领域分布与原始分布的 KL 散度 <b>" + kl.toFixed(3) + "</b>（越大说明分布被改得越厉害）。" +
        "<br>统一阈值下，质量分天然偏低的领域（生活娱乐、电商、论坛）几乎被删光——模型会因此缺常识、口语和生活知识。把“每个领域最低保留比例”调到 20%–30%，就是<b>分域阈值</b>：牺牲一点平均质量，换回覆盖面。" +
        '<br><span class="muted">各领域数据量与质量分布为示意参数。真实项目里，这张图就是“标签体系 + 覆盖率监控”的价值所在。</span>';
    }
    C.bind(el, draw); draw();
  };

  var EX = window.EXTRA;
  EX["data-select"] = [{ k: "selTax", t: "数据选择方法地图" }, { k: "pplBand", t: "为什么不能只留最低 PPL（示意）" }];
  EX["doc-parse"] = [{ k: "pdfRoute", t: "PDF 解析的三路分流" }];
  EX["pipe-sys"] = [{ k: "pipeArch", t: "数据管线分层架构" }, { k: "mhDist", t: "分布式 MinHash 去重五步" }];
  EX["curriculum"] = [{ k: "flywheel", t: "数据飞轮" }, { k: "distill", t: "数据蒸馏 vs logits 蒸馏" }];
  EX["taxonomy"] = [{ k: "coverage", w: 1, t: "质量过滤会怎样改变领域分布（拖动阈值）" }, { k: "taxMatrix", t: "覆盖率矩阵：有什么、缺什么" }];
  EX["synth-qa"] = [{ k: "synthQA", t: "合成数据质检六步" }];
  EX["companies"] = [{ k: "jdHeat", t: "8 家 JD × 方向热力图" }];
  EX["resume"] = [{ k: "resumeFig", t: "简历骨架与每条经历的写法" }];
})();

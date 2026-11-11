// 大模型面试学堂 · 静态示意图（第二部分：Mid-training + 后训练 + 评估）+ 课程配图表
(function () {
  var F = window.FIGS, C = window.CH, svg = C.svg, T = C.T, box = C.box, arr = C.arr, pth = C.pth, chart = C.chart;

  F.qualityRamp = (function () {
    var cat = [["网页", "var(--brand)"], ["代码", "var(--purple)"], ["数学", "var(--orange)"], ["书籍/论文/百科", "var(--green)"], ["合成 QA/改写", "#e8a317"], ["长文档", "var(--red)"]];
    var st = [["S1 通用预训练", "数十 T · 学习率高", [72, 12, 5, 8, 2, 1]], ["S2 推理/知识强化", "数 T · 加速衰减", [30, 20, 20, 10, 18, 2]], ["S3 长上下文", "数千亿 · 4K→32K+", [28, 15, 10, 15, 7, 25]]];
    var s = "";
    st.forEach(function (g, i) {
      var x = 60 + i * 210, y = 26;
      g[2].forEach(function (p, j) { var h = p * 1.8; s += '<rect x="' + x + '" y="' + y + '" width="140" height="' + (h - 1) + '" style="fill:' + cat[j][1] + '" opacity=".85"/>'; if (p >= 8) s += T(x + 70, y + h / 2 + 4, cat[j][0] + " " + p + "%", "f-t", "middle", "fill:#fff;font-size:11.5px"); y += h; });
      s += T(x + 70, 18, g[0], "f-h", "middle") + T(x + 70, 222, g[1], "f-s", "middle");
      if (i < 2) s += arr(x + 146, 116, x + 204, 116);
    });
    cat.forEach(function (c, j) { var x = 24 + j * 110; s += '<rect x="' + x + '" y="236" width="12" height="12" rx="2" style="fill:' + c[1] + '"/>' + T(x + 17, 246, c[0], "f-s"); });
    return svg(276, s + T(676, 270, "示意配比（非任何模型的真实数字）：越往后高质量、推理、合成与长文档占比越高", "f-s", "end"));
  })();

  F.cptLR = (function () {
    var p = [];
    for (var x = 0; x <= 100.001; x += 0.5) {
      var v;
      if (x < 2) v = 3 * x / 2; else if (x <= 70) v = 0.3 + 2.7 * 0.5 * (1 + Math.cos(Math.PI * (x - 2) / 68));
      else if (x < 73) v = 0.3 + 1.2 * (x - 70) / 3; else v = 0.15 + 1.35 * 0.5 * (1 + Math.cos(Math.PI * (x - 73) / 27));
      p.push([x, v]);
    }
    return chart({
      h: 230, x: { min: 0, max: 100, ticks: [[0, "0"], [70, "通用预训练结束"], [100, ""]], label: "训练 tokens →（示意）" },
      y: { min: 0, max: 3.3, ticks: [[0, "0"], [1, "1e-4"], [2, "2e-4"], [3, "3e-4"]], label: "学习率" },
      series: [{ pts: p, c: "var(--brand)", w: 2.4 }],
      under: function (X) { return '<rect x="' + X(70) + '" y="34" width="' + (X(100) - X(70)) + '" height="156" class="f-p" stroke-width="0" opacity=".7"/>'; },
      over: function (X, Y) { return T(X(85), Y(2.95), "领域 CPT", "f-h", "middle") + T(X(85), Y(2.6), "re-warm 到较小峰值", "f-s", "middle") + T(X(85), Y(2.35), "再 re-decay", "f-s", "middle") + T(X(85), Y(2.05), "数据 = 领域 + 通用回放", "f-s", "middle"); },
    });
  })();

  F.behav = svg(150,
    T(340, 16, "Gandhi et al. 2025：基座是否具备这 4 种“认知行为”，决定 RL 能否自我提升", "f-t", "middle") +
    box(2, 28, 162, 76, "f-g", ["✅ 验证", "算完代回去检查", "“让我验算一下…”"]) +
    box(174, 28, 162, 76, "f-b", ["↩️ 回溯", "发现走不通就换路", "“这个方法不行…”"]) +
    box(346, 28, 162, 76, "f-p", ["🎯 子目标设定", "把大题拆成小步", "“先求 x，再求 y”"]) +
    box(518, 28, 160, 76, "f-o", ["🔙 逆向推理", "从目标往回推", "“要得到 A，需要 B”"]) +
    T(340, 132, "Qwen2.5 基座天然常见，Llama 3.2 很少 → 在中训练/预热数据中注入这些行为，Llama 的 RL 曲线就能追上来", "f-s", "middle"));

  F.rlcurve = (function () {
    var q = [], l = [], pr = [];
    for (var t = 0; t <= 500; t += 5) { q.push([t, 30 + 32 * (1 - Math.exp(-t / 120))]); l.push([t, 14 + 4 * (1 - Math.exp(-t / 100)) + 0.8 * Math.sin(t / 23)]); pr.push([t, 20 + 38 * (1 - Math.exp(-t / 150))]); }
    return chart({
      h: 250, x: { min: 0, max: 500, ticks: [[0, "0"], [100, "100"], [200, "200"], [300, "300"], [400, "400"], [500, "500"]], label: "RL 训练步数 →（示意）" },
      y: { min: 0, max: 70, ticks: [[0, "0"], [20, "20"], [40, "40"], [60, "60"]], label: "数学准确率 %" },
      series: [{ pts: q, c: "var(--brand)", w: 2.4, name: "Qwen 系基座" }, { pts: l, c: "var(--sub)", w: 2, name: "Llama 系基座" }, { pts: pr, c: "var(--orange)", w: 2.4, name: "Llama + 推理型中训练" }],
    });
  })();

  F.mask = (function () {
    var tk = [["&lt;|system|&gt;", 0, 10], ["你是助手", 0], ["&lt;|user|&gt;", 0, 8], ["1+1 等于几？", 0], ["&lt;|assistant|&gt;", 0, 13], ["等于", 1], ["2", 1], ["。", 1], ["&lt;|end|&gt;", 1, 7]];
    var s = T(4, 16, "① Loss mask：只有 assistant 回复（橙色）参与损失，system / user 部分不算", "f-h"), x = 4;
    tk.forEach(function (t) { var w = (t[2] || t[0].length) * (/[\u4e00-\u9fa5]/.test(t[0]) ? 13 : 7.4) + 16; s += box(x, 28, w, 30, t[1] ? "f-o" : "f-box", [t[0]], { flat: true, r: 6 }); x += w + 4; });
    s += T(4, 96, "② Packing：多条短样本拼成一条长序列 + 块对角注意力 mask（样本之间互相看不见）", "f-h");
    var seg = [["样本 A", 150, "f-b"], ["样本 B", 110, "f-p"], ["样本 C", 170, "f-g"]]; x = 4;
    seg.forEach(function (g) { s += box(x, 110, g[1], 34, g[2], [g[0]], { flat: true, r: 4 }); x += g[1] + 2; });
    s += T(4, 166, "位置编号每个样本从 0 重新开始；不做 mask 时样本会互相“串味”", "f-s");
    var mx = 520, my = 90, n = 10, cs = 9, bl = [[0, 4], [4, 7], [7, 10]];
    for (var i = 0; i < n; i++) for (var j = 0; j <= i; j++) { var on = bl.some(function (b) { return i >= b[0] && i < b[1] && j >= b[0] && j < b[1]; }); s += '<rect x="' + (mx + j * cs) + '" y="' + (my + i * cs) + '" width="' + (cs - 1) + '" height="' + (cs - 1) + '" class="' + (on ? "f-b" : "f-box") + '" stroke-width=".5"/>'; }
    return svg(206, s + T(mx + 45, my + 106, "注意力 mask", "f-s", "middle"));
  })();

  F.sftFlow = svg(176,
    box(2, 14, 210, 116, "f-b", ["① 构造", "人工撰写（种子 / 安全）", "Self-Instruct · Evol-Instruct", "Magpie · Persona 驱动", "拒绝采样（RM / 验证器选优）"]) + arr(212, 72, 232, 72) +
    box(234, 14, 210, 116, "f-p", ["② 筛选", "LLM 打分（AlpaGasus）", "IFD 难度 · Deita 复杂度×质量", "LESS 梯度相似度", "去重 · 去污染 · 正确性校验"]) + arr(444, 72, 464, 72) +
    box(466, 14, 212, 116, "f-g", ["③ 配比", "数学 · 代码 · 推理", "对话 · 写作 · 指令遵循", "多轮 · 安全拒答 · 多语言", "长度分布控制"]) +
    T(340, 158, "原则：质量 > 多样性 > 数量；能力类任务（数学/代码/推理）的数量和难度仍有明显 scaling", "f-t", "middle"));

  F.prefLoop = svg(214,
    box(30, 14, 270, 50, "f-b", ["① 当前模型对每个 prompt 采样 N 个回答"], { flat: true }) + arr(300, 39, 376, 39) +
    box(378, 14, 270, 50, "f-p", ["② RM / LLM 裁判 / 验证器打分"], { flat: true }) + arr(513, 64, 513, 112) +
    box(378, 114, 270, 50, "f-o", ["③ 构造 (chosen, rejected) 对 + 去偏"], { flat: true }) + arr(378, 139, 302, 139) +
    box(30, 114, 270, 50, "f-g", ["④ DPO / 拒绝采样 SFT 训练"], { flat: true }) + arr(165, 114, 165, 66) +
    T(340, 96, "on-policy 迭代", "f-h", "middle") +
    T(340, 194, "Llama 3 迭代 6 轮；去偏：随机交换位置各判一次、控制 chosen/rejected 长度差、过滤低一致性样本", "f-s", "middle"));

  F.passk = (function () {
    var N = 200, P = [], Q = [];
    for (var i = 0; i < N; i++) { var p = 0.9 * Math.pow((i + 0.5) / N, 2.2); P.push(p); Q.push(p > 0.08 ? Math.min(0.98, 0.25 + 1.3 * p) : p * 0.1); }
    var pk = function (arr, k) { var s = 0; arr.forEach(function (p) { s += 1 - Math.pow(1 - p, k); }); return s / arr.length * 100; };
    var a = [], b = [];
    for (var e = 0; e <= 8.001; e += 0.25) { var k = Math.pow(2, e); a.push([k, pk(P, k)]); b.push([k, pk(Q, k)]); }
    return chart({
      h: 250, x: { min: 1, max: 256, log: true, ticks: [[1, "1"], [4, "4"], [16, "16"], [64, "64"], [256, "256"]], label: "采样次数 k →" },
      y: { min: 0, max: 100, ticks: [[0, "0"], [25, "25"], [50, "50"], [75, "75"], [100, "100"]], label: "pass@k %" },
      series: [{ pts: a, c: "var(--sub)", w: 2.4, name: "基座模型" }, { pts: b, c: "var(--orange)", w: 2.4, name: "RLVR 之后" }],
      over: function (X, Y) { return T(X(1.15), Y(8), "k 小：RL 模型明显更好（采样效率↑）", "f-s", "start", "fill:var(--orange)") + T(X(240), Y(62), "k 大：基座反超（覆盖面更广）", "f-s", "end"); },
    });
  })();

  F.budget = svg(170,
    T(4, 16, "s1 的 budget forcing：用一个“Wait”控制思考长度（测试时扩展）", "f-h") +
    box(2, 28, 90, 40, "f-box", ["题目"], { flat: true }) + arr(92, 48, 104, 48) +
    box(106, 28, 200, 40, "f-b", ["&lt;think&gt; 推理……"], { flat: true }) + arr(306, 48, 318, 48) +
    box(320, 28, 150, 40, "f-o", ["想结束 → 插入 “Wait”"], { flat: true }) + arr(470, 48, 482, 48) +
    box(484, 28, 192, 40, "f-g", ["继续推理，常会自我纠错"], { flat: true }) +
    T(4, 96, "延长：模型想停时追加“Wait”；截断：超过预算就强制写入“最终答案：”", "f-t") +
    T(4, 122, "思考 token 越多，AIME 等难题准确率越高——但简单题“想太多”纯属浪费", "f-s") +
    T(4, 144, "工程对策：长度惩罚 · long2short（Kimi k1.5）· 思考/非思考模式融合 + 思考预算（Qwen3）", "f-s"));

  F.agentLoop = svg(200,
    box(2, 70, 100, 50, "f-box", ["用户任务"], { flat: true }) + arr(102, 95, 122, 95) +
    box(124, 70, 120, 50, "f-b", ["思考 / 规划"], { flat: true }) + arr(244, 95, 264, 95) +
    box(266, 70, 130, 50, "f-o", ["调用工具", "函数名 + 参数 JSON"]) + arr(396, 95, 416, 95) +
    box(418, 70, 130, 50, "f-p", ["环境执行", "返回结果 / 报错"]) +
    pth("M483,70 V30 H184 V68") + T(334, 24, "读取反馈 → 纠错或继续（多轮循环）", "f-s", "middle") +
    arr(548, 95, 568, 95) + box(570, 70, 106, 50, "f-g", ["验证器判定", "任务成功？"]) +
    T(340, 152, "SFT 阶段：合成调用轨迹 + 执行校验（含出错后纠正的轨迹，不能只留成功的）", "f-t", "middle") +
    T(340, 176, "RL 阶段：可执行环境（代码仓库 + 单测、网页、模拟用户）+ 结果奖励；难点是长轨迹信用分配与 rollout 慢", "f-s", "middle"));

  F.benchMap = (function () {
    var g = [["知识 / 综合", ["MMLU · MMLU-Pro", "C-Eval · CMMLU", "GPQA（研究生级）"], "f-b", ""], ["常识 / 阅读", ["HellaSwag · ARC", "PIQA · WinoGrande"], "f-g", "适合小模型数据消融"], ["数学", ["GSM8K · MATH-500", "AIME（每年新题）"], "f-o", "AIME 抗污染"],
      ["代码", ["HumanEval · MBPP", "LiveCodeBench", "SWE-bench（agent）"], "f-p", "LiveCodeBench 按时间滚动"], ["指令遵循 / 对话", ["IFEval（可程序验证）", "MT-Bench · Arena-Hard", "AlpacaEval 2 LC · Chatbot Arena"], "f-b", "注意 LLM 裁判偏差"], ["长上下文", ["NIAH（入门）", "RULER · LongBench"], "f-g", "标称长度 ≠ 有效长度"]];
    var s = "";
    g.forEach(function (c, i) { var x = 4 + (i % 3) * 226, y = 6 + Math.floor(i / 3) * 128; s += box(x, y, 218, 104, c[2], [c[0]].concat(c[1]), { lh: 18 }); if (c[3]) s += T(x + 109, y + 120, c[3], "f-s", "middle"); });
    return svg(262, s);
  })();

  F.star = svg(170,
    box(2, 18, 124, 60, "f-b", ["S 背景", "模型 · 阶段 · 目标"]) + arr(126, 48, 138, 48) +
    box(140, 18, 124, 60, "f-b", ["T 任务", "你负责哪一环"]) + arr(264, 48, 276, 48) +
    box(278, 18, 124, 60, "f-p", ["A 行动", "方法 + 取舍理由"]) + arr(402, 48, 414, 48) +
    box(416, 18, 124, 60, "f-o", ["R 结果", "前后数字对照"]) + arr(540, 48, 552, 48) +
    box(554, 18, 122, 60, "f-g", ["反思", "踩坑 · 重来怎么改"]) +
    T(340, 108, "R 的标准写法：保留率 x%→y%；1B 消融目标基准 +a 分（种子噪声 ±c）；通用基准变化 ±b 分", "f-t", "middle") +
    T(340, 132, "准备 3 个故事：做成了的主项目 · 发现并纠正问题的 · 跨团队推动的", "f-s", "middle") +
    T(340, 154, "雷区：说不出数字、说不出怎么验证、把团队成果全说成自己的", "f-s", "middle"));

  // ---------- 每课追加的图（w = 交互组件）----------
  window.EXTRA = {
    "arch": [{ k: "archBlock", t: "一层 Decoder 长什么样" }],
    "tokenizer": [{ k: "bpe", w: 1, t: "动手看 BPE 怎么一步步合并", n: "经典示例语料（Sennrich 2016）：low×5、lower×2、newest×6、widest×3。拖动滑块看每一步合并了哪一对。" }],
    "attention-eff": [{ k: "gqa", t: "MHA / GQA / MQA：几个 query 头共享一组 KV" }, { k: "kv", w: 1, t: "KV Cache 计算器", n: "模型配置取自公开 config（Llama-2-7B、Llama-3-8B/70B、DeepSeek-V3）；fp16 存储。" }],
    "moe": [{ k: "moe", t: "MoE 路由：top-2 路由专家 + 共享专家" }],
    "infra": [{ k: "mem16", t: "16 字节/参数是怎么来的" }, { k: "zero", w: 1, t: "ZeRO 各阶段每卡显存", n: "公式来自 ZeRO 论文：基线 16Ψ；Stage1 4Ψ+12Ψ/N；Stage2 2Ψ+14Ψ/N；Stage3 16Ψ/N（Ψ=参数量，N=数据并行卡数）。" }],
    "scaling": [{ k: "scaling", w: 1, t: "Chinchilla IsoFLOP 计算器", n: "按 Epoch AI 2024 对 Chinchilla Approach 3 的重新拟合 L = 1.82 + 482/N^0.348 + 2085/D^0.366 计算（修正后与约 20 tokens/参数一致）。试着把 tokens/参数 拖到 1875（Llama 3 8B）：同算力下 loss 只高一点，模型却小一个数量级。" }],
    "heuristic": [{ k: "heur", t: "规则过滤：删掉什么、会误杀什么" }],
    "modelfilter": [{ k: "mfFlow", t: "LLM 标注 → 蒸馏小分类器 → 全量打分" }, { k: "nemo", t: "Nemotron-CC：分档处理，低分不扔" }],
    "dedup": [{ k: "minhash", w: 1, t: "MinHash-LSH 的 S 曲线（拖动 b、r）", n: "公式 P(s) = 1 − (1 − s^r)^b 是精确的；灰色虚线是 FineWeb 用的 14 段 × 8 行。" }],
    "mixture": [{ k: "mixDonut", t: "Llama 3 的最终配比" }, { k: "doremi", t: "DoReMi / RegMix 怎么用小模型找配比" }],
    "repeat-synth": [{ k: "repeat", w: 1, t: "重复数据还值多少钱" }],
    "domain-data": [{ k: "temp", w: 1, t: "多语言温度采样（拖动 T）" }],
    "stability": [{ k: "spike", t: "loss spike 的标准处理" }],
    "ablation": [{ k: "ablFlow", t: "两种验证数据价值的实验设计" }, { k: "noise", t: "为什么必须看种子噪声" }],
    "midtrain": [{ k: "qualityRamp", t: "各阶段数据构成怎么变（示意）" }],
    "longctx": [{ k: "rope", w: 1, t: "RoPE 每个维度的波长：PI / NTK / YaRN 到底改了什么", n: "按公式 λᵢ = 2π·base^(2i/d) 精确计算（d=128）；YaRN 取论文默认 α=1、β=32。" }],
    "cpt": [{ k: "cptLR", t: "CPT 的学习率：re-warm + re-decay（示意）" }],
    "reason-mid": [{ k: "behav", t: "4 种“认知行为”" }, { k: "rlcurve", t: "同样的 RL，不同基座的曲线（示意）", n: "定性复现 Gandhi et al. / OctoThinker 报告的现象，数值为示意。" }],
    "sft": [{ k: "mask", t: "Loss mask 与 Packing" }],
    "sft-data": [{ k: "sftFlow", t: "SFT 数据：构造 → 筛选 → 配比" }],
    "rlhf": [{ k: "clip", w: 1, t: "PPO 的裁剪目标（拖动 ε）" }],
    "dpo": [{ k: "dpo", w: 1, t: "DPO 损失与“自带难例挖掘”的梯度权重" }],
    "pref-data": [{ k: "prefLoop", t: "迭代式 on-policy 偏好数据" }],
    "grpo": [{ k: "grpo", w: 1, t: "GRPO 组内优势（点击切换对错）" }],
    "rl-tricks": [{ k: "clipdapo", w: 1, t: "DAPO 的 Clip-Higher" }, { k: "passk", t: "RLVR 前后的 pass@k（示意）", n: "用一组模拟题目难度复现 Yue et al. 2025 的定性现象：RL 后 pass@1 高，但 k 很大时基座反超。" }],
    "reason-data": [{ k: "budget", t: "思考长度控制" }],
    "agent-data": [{ k: "agentLoop", t: "Agent 数据 = 环境 + 任务 + 验证器" }],
    "eval": [{ k: "benchMap", t: "评测地图：每类能力看哪些基准" }],
    "reports": [{ k: "tokBar", t: "预训练 token 规模演进" }],
    "story": [{ k: "star", t: "STAR + 反思：项目怎么讲" }],
  };
})();

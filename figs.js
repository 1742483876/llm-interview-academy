// 大模型面试学堂 · 示意图（纯 SVG，随主题变色）
(function () {
  const box = (x, y, w, h, cls, lines, opt = {}) => {
    const lh = opt.lh || 17;
    const y0 = y + h / 2 - ((lines.length - 1) * lh) / 2 + 4;
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${opt.r != null ? opt.r : 10}" class="${cls}" stroke-width="1.2"/>` +
      lines.map((t, i) => `<text x="${x + w / 2}" y="${y0 + i * lh}" text-anchor="middle" class="${i === 0 && !opt.flat ? "f-h" : "f-s"}">${t}</text>`).join("");
  };
  const arr = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="f-ln" stroke-width="1.4" marker-end="url(#ah)"/>`;
  const defs = `<defs><marker id="ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:var(--sub)"/></marker></defs>`;
  const svg = (h, body) => `<svg viewBox="0 0 680 ${h}" xmlns="http://www.w3.org/2000/svg">${defs}${body}</svg>`;

  const F = {};

  // 1. 训练全流程
  F.pipeline = svg(200,
    box(1, 20, 118, 92, "f-b", ["预训练", "数T~数十T tokens", "学知识与语言"]) + arr(119, 66, 139, 66) +
    box(141, 20, 118, 92, "f-p", ["Mid-train", "百B~数T tokens", "退火/长文/推理"]) + arr(259, 66, 279, 66) +
    box(281, 20, 118, 92, "f-o", ["SFT", "万~百万条", "学格式与指令"]) + arr(399, 66, 419, 66) +
    box(421, 20, 118, 92, "f-o", ["偏好对齐", "RLHF / DPO", "学“人更喜欢”"]) + arr(539, 66, 559, 66) +
    box(561, 20, 118, 92, "f-o", ["推理 RL", "RLVR / GRPO", "学“想清楚”"]) +
    `<rect x="1" y="132" width="678" height="40" rx="10" class="f-g" stroke-width="1.2"/>` +
    `<text x="340" y="157" text-anchor="middle" class="f-t">评估贯穿全程：小模型数据消融 → 基座 benchmark → 对话/推理评测 → 去污染 · LLM-as-judge</text>` +
    `<text x="200" y="192" text-anchor="middle" class="f-s">◀ 决定“能力上限”（数据为王）</text><text x="540" y="192" text-anchor="middle" class="f-s">决定“怎么把能力用出来” ▶</text>`);

  // 2. tokens / 参数 比
  (function () {
    const rows = [["GPT-3 175B（2020）", 300e9 / 175e9, "300B tokens ≈ 1.7"], ["Chinchilla 70B（2022）", 1.4e12 / 70e9, "1.4T tokens ≈ 20（算力最优）"], ["Llama 2 7B（2023）", 2e12 / 7e9, "2T tokens ≈ 286"], ["Llama 3 8B（2024）", 15e12 / 8e9, "15T tokens ≈ 1875"]];
    let b = `<text x="10" y="18" class="f-s">tokens / 参数（对数刻度）—— 现在的模型远超 Chinchilla 最优，用训练算力换推理成本</text>`;
    const x0 = 170, W = 470;
    [1, 10, 100, 1000].forEach((v) => { const x = x0 + (Math.log10(v) / 3.4) * W; b += `<line x1="${x}" y1="28" x2="${x}" y2="200" class="f-ax"/><text x="${x}" y="214" text-anchor="middle" class="f-s">${v}</text>`; });
    rows.forEach((r, i) => {
      const y = 38 + i * 42, w = Math.max(4, (Math.log10(r[1]) / 3.4) * W);
      b += `<text x="${x0 - 8}" y="${y + 19}" text-anchor="end" class="f-t">${r[0]}</text><rect x="${x0}" y="${y}" width="${w}" height="28" rx="5" class="${i === 1 ? "f-o" : "f-b"}"/><text x="${x0 + w + 6 > 560 ? x0 + w - 6 : x0 + w + 6}" y="${y + 19}" text-anchor="${x0 + w + 6 > 560 ? "end" : "start"}" class="f-s">${r[2]}</text>`;
    });
    F.ratio = svg(224, b);
  })();

  // 3. 数据处理漏斗
  (function () {
    const st = [["Common Crawl 原始网页（WARC）", "URL 黑名单 · 成人/垃圾站过滤"], ["正文抽取（trafilatura 等）", "去导航栏/广告/模板"], ["语言识别（fastText lid）", "按语言分桶，置信度阈值"], ["启发式规则过滤", "Gopher / C4 / 重复行 / 符号比"], ["去重", "URL · 精确 · MinHash 近重复"], ["模型质量打分", "fastText / LLM 打分分类器"], ["PII · 毒性 · 基准去污染", "邮箱电话脱敏 · n-gram 去污染"], ["配比 & 采样 → 训练", "领域权重 · 上采样 · 多 epoch"]];
    let b = "";
    st.forEach((s, i) => {
      const w = 640 - i * 52, x = (680 - w) / 2, y = 6 + i * 40;
      b += `<rect x="${x}" y="${y}" width="${w}" height="34" rx="8" class="${i < 3 ? "f-box" : i < 6 ? "f-b" : "f-p"}" stroke-width="1.1"/><text x="340" y="${y + 15}" text-anchor="middle" class="f-t" style="font-size:12.5px;font-weight:600">${s[0]}</text><text x="340" y="${y + 29}" text-anchor="middle" class="f-s" style="font-size:10.5px">${s[1]}</text>`;
    });
    b += `<text x="340" y="338" text-anchor="middle" class="f-s">示意：越往下越贵、越精细；最终留下的通常只是原始网页的一小部分（各家阈值与口径差异很大）</text>`;
    F.funnel = svg(346, b);
  })();

  // 4. 学习率调度：cosine vs WSD
  (function () {
    const X0 = 50, X1 = 650, Y0 = 190, Y1 = 30, H = Y0 - Y1, wu = 40;
    const xs = (t) => X0 + t * (X1 - X0);
    let cos = `M${X0},${Y0} L${X0 + wu},${Y1}`, wsd = cos;
    for (let i = 1; i <= 60; i++) {
      const t = i / 60, x = X0 + wu + t * (X1 - X0 - wu);
      cos += ` L${x.toFixed(1)},${(Y0 - H * (0.1 + 0.9 * 0.5 * (1 + Math.cos(Math.PI * t)))).toFixed(1)}`;
    }
    const sd = 0.86; // 稳定段结束
    wsd += ` L${xs(sd)},${Y1}`;
    for (let i = 1; i <= 20; i++) { const t = i / 20; wsd += ` L${(xs(sd) + t * (X1 - xs(sd))).toFixed(1)},${(Y1 + H * 0.97 * t).toFixed(1)}`; }
    let b = `<line x1="${X0}" y1="${Y0}" x2="${X1}" y2="${Y0}" class="f-ax" stroke-width="1.2"/><line x1="${X0}" y1="${Y0}" x2="${X0}" y2="${Y1 - 10}" class="f-ax" stroke-width="1.2"/>`;
    b += `<rect x="${xs(sd)}" y="${Y1 - 12}" width="${X1 - xs(sd)}" height="${H + 12}" class="f-p" stroke-width="0" opacity=".7"/>`;
    b += `<path d="${cos}" fill="none" style="stroke:var(--brand)" stroke-width="2.2"/><path d="${wsd}" fill="none" style="stroke:var(--orange)" stroke-width="2.2"/>`;
    b += `<text x="${X0 - 8}" y="${Y1 + 4}" text-anchor="end" class="f-s">峰值</text><text x="${X0 - 8}" y="${Y0}" text-anchor="end" class="f-s">0</text><text x="${X1}" y="${Y0 + 16}" text-anchor="end" class="f-s">训练 token →</text>`;
    b += `<text x="${X0 + 4}" y="${Y0 + 16}" class="f-s">warmup</text><text x="${X1}" y="${Y1 - 16}" text-anchor="end" class="f-s" style="fill:var(--purple)">衰减/退火段 ≈ 放高质量数据（mid-train）</text>`;
    b += `<text x="200" y="${Y1 + 100}" class="f-t" style="fill:var(--brand)">Cosine：必须提前定好总步数</text><text x="110" y="${Y1 - 14}" class="f-t" style="fill:var(--orange)">WSD：稳定段可随时续训/分叉</text>`;
    F.lr = svg(214, b);
  })();

  // 5. MinHash LSH
  F.minhash = svg(170,
    box(1, 30, 110, 70, "f-box", ["文档", "切 n-gram", "（shingles）"]) + arr(111, 65, 131, 65) +
    box(133, 30, 130, 70, "f-b", ["MinHash", "k 个哈希取最小值", "→ 签名向量"]) + arr(263, 65, 283, 65) +
    box(285, 30, 130, 70, "f-b", ["LSH 分桶", "签名切 b 段×r 行", "任一段相同 → 候选"]) + arr(415, 65, 435, 65) +
    box(437, 30, 110, 70, "f-p", ["验证", "估计 Jaccard", "≥ 阈值(如0.8)"]) + arr(547, 65, 567, 65) +
    box(569, 30, 110, 70, "f-g", ["聚类留一", "连通分量/", "Union-Find"]) +
    `<text x="340" y="130" text-anchor="middle" class="f-t">候选概率 P(s) = 1 − (1 − sʳ)ᵇ —— 一条 S 形曲线，b、r 决定阈值位置 ≈ (1/b)^(1/r)</text>` +
    `<text x="340" y="152" text-anchor="middle" class="f-s">b 大 → 召回高、假阳多；r 大 → 更严格。FineWeb 用 5-gram、112 个哈希 = 14 桶 × 8</text>`);

  // 6. Mid-training 三段式
  F.stages = svg(200,
    `<text x="10" y="18" class="f-s">以 Qwen3 技术报告为例（长度非等比例）</text>` +
    box(1, 30, 330, 80, "f-b", ["S1 通用预训练", "30T+ tokens · 119 种语言 · 4K 上下文", "打语言与世界知识底座"]) +
    box(335, 30, 190, 80, "f-p", ["S2 推理/知识强化", "约 5T 高质量 tokens", "STEM·代码·推理·合成数据"]) +
    box(529, 30, 150, 80, "f-p", ["S3 长上下文", "数千亿 tokens", "4K→32K · ABF 调大 base"]) +
    `<text x="10" y="140" class="f-t">共性：后段数据质量↑、领域更集中、学习率加速衰减（退火）、上下文变长</text>` +
    `<text x="10" y="164" class="f-s">Llama 3：最后 40M tokens 线性退火到 0 + 上采样高质量数学/代码；MiniCPM：WSD 衰减段混入 SFT 数据；</text>` +
    `<text x="10" y="184" class="f-s">OLMo 2：Dolmino 中训练混合 + 多次退火后权重平均（model soup）</text>`);

  // 7. PPO / DPO / GRPO
  F.rl = svg(250,
    `<text x="113" y="18" text-anchor="middle" class="f-h">PPO（RLHF）</text><text x="340" y="18" text-anchor="middle" class="f-h">DPO</text><text x="567" y="18" text-anchor="middle" class="f-h">GRPO（RLVR）</text>` +
    box(10, 30, 100, 44, "f-o", ["Policy", "训练"], { lh: 15 }) + box(118, 30, 100, 44, "f-box", ["Reference", "冻结·算KL"], { lh: 15 }) +
    box(10, 82, 100, 44, "f-box", ["Reward", "冻结·打分"], { lh: 15 }) + box(118, 82, 100, 44, "f-o", ["Critic/Value", "训练·算GAE"], { lh: 15 }) +
    `<text x="113" y="150" text-anchor="middle" class="f-s">4 个模型 · 在线采样</text><text x="113" y="166" text-anchor="middle" class="f-s">显存与工程最重，上限高</text>` +
    box(240, 30, 100, 44, "f-o", ["Policy", "训练"], { lh: 15 }) + box(346, 30, 100, 44, "f-box", ["Reference", "冻结"], { lh: 15 }) +
    box(240, 82, 206, 44, "f-b", ["离线偏好对 (x, y_w, y_l)", ""], { lh: 15 }) +
    `<text x="340" y="150" text-anchor="middle" class="f-s">2 个模型 · 无奖励模型 · 无采样</text><text x="340" y="166" text-anchor="middle" class="f-s">像 SFT 一样稳，但吃数据分布</text>` +
    box(468, 30, 100, 44, "f-o", ["Policy", "训练"], { lh: 15 }) + box(574, 30, 100, 44, "f-box", ["Reference", "可省(DAPO)"], { lh: 15 }) +
    box(468, 82, 206, 44, "f-g", ["规则/验证器奖励", "答案对错·单测·格式"], { lh: 15 }) +
    `<text x="567" y="150" text-anchor="middle" class="f-s">去掉 Critic：同题采 G 个答案</text><text x="567" y="166" text-anchor="middle" class="f-s">组内标准化当优势</text>` +
    `<rect x="10" y="186" width="664" height="50" rx="10" class="f-box" stroke-width="1.1"/>` +
    `<text x="340" y="206" text-anchor="middle" class="f-t">GRPO 优势：Âᵢ = (rᵢ − mean(r₁..r_G)) / std(r₁..r_G)，同一回答内所有 token 共享</text>` +
    `<text x="340" y="226" text-anchor="middle" class="f-s">一组全对或全错 → 优势全 0 → 无梯度（DAPO 的动态采样就是把这类组丢掉再补采）</text>`);

  // 8. DeepSeek-R1 流程
  F.r1 = svg(240,
    box(1, 96, 92, 56, "f-b", ["V3-Base", "671B MoE"], { lh: 16 }) +
    arr(93, 110, 128, 46) + box(130, 14, 176, 56, "f-g", ["R1-Zero", "纯 RL（GRPO + 规则奖励）"], { lh: 16 }) +
    `<text x="318" y="38" class="f-s">出现“aha moment”、思考自发变长</text><text x="318" y="56" class="f-s">问题：可读性差、中英混杂</text>` +
    arr(93, 136, 108, 160) + box(110, 140, 104, 64, "f-o", ["冷启动 SFT", "数千条", "可读长 CoT"], { lh: 15 }) + arr(214, 172, 226, 172) +
    box(228, 140, 104, 64, "f-g", ["推理 RL", "规则奖励", "+语言一致性"], { lh: 15 }) + arr(332, 172, 344, 172) +
    box(346, 140, 116, 64, "f-o", ["拒绝采样 SFT", "~60万 推理", "+~20万 通用"], { lh: 15 }) + arr(462, 172, 474, 172) +
    box(476, 140, 104, 64, "f-g", ["全场景 RL", "推理规则奖励", "+偏好 RM"], { lh: 15 }) + arr(580, 172, 592, 172) +
    box(594, 140, 85, 64, "f-p", ["R1"], { lh: 15 }) +
    `<text x="340" y="228" text-anchor="middle" class="f-s">↑ 这约 80 万条数据也直接用来蒸馏 Qwen/Llama 小模型（只 SFT 不 RL），效果好于小模型自己做 RL</text>`);

  // 9. Scaling 示意（Kaplan vs Chinchilla）
  F.scaling = svg(150,
    box(1, 10, 330, 92, "f-box", ["Kaplan 2020（OpenAI）", "算力翻倍时参数多涨、数据少涨（N∝C^0.73）", "→ 大模型 + 相对少数据（GPT-3：300B）"]) +
    box(349, 10, 330, 92, "f-o", ["Chinchilla 2022（DeepMind）", "N 与 D 同比例增长（各 ∝ C^0.5）", "→ 约 20 tokens/参数；70B 打赢 280B Gopher"]) +
    `<text x="340" y="128" text-anchor="middle" class="f-t">分歧主因：Kaplan 固定学习率调度/未按训练长度调 cosine、小模型口径（不含 embedding）等</text>` +
    `<text x="340" y="146" text-anchor="middle" class="f-s">训练算力 C ≈ 6·N·D（前向 2ND + 反向 4ND）</text>`);

  window.FIGS = F;
})();

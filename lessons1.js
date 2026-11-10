// 大模型面试学堂 · 课程（第一部分：基础 + 预训练）
// 字段：one 一句话 | fig 示意图 | points 核心知识点 | papers 论文观点 | answer 面试这样答 | pitfall 易错点&追问
window.LESSONS = window.LESSONS || [];
window.CATS = [
  { id: "basic", tag: "basic", name: "基础架构", desc: "Transformer 现代变体、分词器、注意力加速、MoE、分布式与显存账——任何岗位都会问的底座" },
  { id: "pre", tag: "pre", name: "预训练", desc: "Scaling Law、网页数据管线、过滤/去重/配比、合成数据、训练稳定性、数据消融——数据岗的主战场" },
  { id: "mid", tag: "mid", name: "Mid-training", desc: "退火、长上下文扩展、领域持续预训练、为 RL 打底的推理型中训练——近两年最热的新考点" },
  { id: "post", tag: "post", name: "后训练", desc: "SFT 数据、RLHF/奖励模型、DPO 家族、偏好数据、RLVR/GRPO、推理蒸馏" },
  { id: "eval", tag: "eval", name: "评估与实战", desc: "评测体系、LLM-as-judge、主流技术报告横评、怎么把你的数据项目讲出彩" },
];

LESSONS.push(
  // ===================== 基础 =====================
  {
    id: "arch", cat: "basic", level: 3, title: "现代 LLM 架构：为什么大家都长成 Llama 的样子",
    one: "Decoder-only + Pre-Norm(RMSNorm) + SwiGLU + RoPE + GQA，是 2023 年以来开源模型的“标准配置”，每一项都能讲出“为什么”。",
    points: `<ul>
      <li><b>Decoder-only</b>：因果注意力天然适配自回归生成和 next-token 预训练；零样本/少样本能力好；KV Cache 复用简单。Encoder-Decoder（T5）在同算力下生成任务不占优。</li>
      <li><b>Pre-Norm vs Post-Norm</b>：Pre-Norm 把 LayerNorm 放在残差分支内（x + F(LN(x))），梯度能沿残差直通，深层更稳、可少用 warmup；代价是有效深度略降。Post-Norm 上限可能更高但难训（需要 DeepNorm 等技巧）。</li>
      <li><b>RMSNorm</b>：去掉均值中心化，只除以均方根，计算更省、效果相当。</li>
      <li><b>SwiGLU</b>：FFN 变成 (Swish(xW₁) ⊙ xW₃)W₂，三个矩阵，为保持参数量把中间维从 4d 调到约 8/3·d。</li>
      <li><b>RoPE</b>：把位置编码成对 q、k 的旋转，内积只依赖相对位置 m−n；外推性比绝对位置好，且是后面长上下文扩展（PI/NTK/YaRN）的基础。</li>
      <li><b>GQA</b>：多个 query 头共享一组 K/V 头，KV Cache 缩小数倍，质量接近 MHA；MQA 是极端情况（全部共享一组）。</li>
      <li>其他常见细节：去掉 bias、tied/untied embedding、QK-Norm（稳定性）、更大的 RoPE base（如 Llama 3 用 500000）。</li></ul>`,
    papers: [
      ["Attention Is All You Need", "2017", "提出 Transformer，原版是 Post-Norm、正弦位置编码。"],
      ["On Layer Normalization in the Transformer Architecture", "2020", "理论分析：Post-Norm 在初始化时输出层附近梯度大，必须 warmup；Pre-Norm 梯度良好，可去掉 warmup。"],
      ["GLU Variants Improve Transformer（Shazeer）", "2020", "SwiGLU/GeGLU 在同等参数下优于 ReLU/GeLU FFN。"],
      ["RoFormer（RoPE）", "2021", "旋转位置编码：绝对方式实现、相对位置效果。"],
      ["GQA（Ainslie et al.）", "2023", "MHA 与 MQA 的折中，可从 MHA checkpoint 少量 uptraining 转换。"],
    ],
    answer: `<p>按“组件 → 动机 → 代价”三段答：先列出标准配置，再逐个说为什么替换（稳定性 / 效率 / 外推性），最后补一句“架构改动对最终效果的贡献远小于数据，所以大家趋同，把精力放在数据和训练配方上”——数据岗候选人说这句很加分。</p>`,
    pitfall: `<ul><li>别把 RMSNorm 说成“去掉了缩放参数”——它保留可学习的 γ，只去掉了减均值和 β。</li>
      <li>追问：<b>为什么注意力要除以 √d</b>？点积方差随维度增长，不缩放会让 softmax 饱和、梯度消失。</li>
      <li>追问：<b>GQA 省的是什么</b>？省 KV Cache 显存和推理带宽，训练算力几乎不省。</li></ul>`,
  },
  {
    id: "tokenizer", cat: "basic", level: 2, title: "分词器：数据岗必须懂的“第一道工序”",
    one: "BPE 从字节/字符出发反复合并最高频的相邻对；词表大小、训练语料配比直接决定压缩率，进而影响“同样 token 预算能看多少内容”。",
    points: `<ul>
      <li><b>BPE</b>：统计相邻符号对频次 → 合并最高频 → 重复到目标词表大小。<b>Byte-level BPE</b>（GPT-2 起）以 256 个字节为基础，永远不会 OOV。</li>
      <li><b>WordPiece</b> 按似然增益合并；<b>Unigram LM</b>（SentencePiece）从大词表按损失贡献剪枝，可输出多种切分。</li>
      <li><b>词表大小</b>：Llama 2 32K → Llama 3 128K，Qwen 系列约 15 万。词表大 → 压缩率高、序列短、多语言友好；代价是 embedding/输出层参数和 softmax 开销变大，低频 token 训练不充分。</li>
      <li><b>压缩率</b>（bytes/token 或 字/token）是数据侧关键指标：报告里的“XT tokens”与分词器绑定，不同模型的 token 数不能直接比。</li>
      <li>数字切分（逐位切 vs 合并）、空白/缩进处理（代码）、特殊 token（chat template）都会影响下游能力。</li>
      <li>训练分词器的语料配比要和预训练配比一致，否则某些语言/领域会被切得很碎。</li></ul>`,
    papers: [
      ["Neural Machine Translation of Rare Words with Subword Units（BPE）", "2016", "把 BPE 压缩算法用到子词切分。"],
      ["SentencePiece", "2018", "语言无关、直接处理原始文本（含空格）的分词工具，支持 BPE / Unigram。"],
      ["Llama 3 Herd of Models", "2024", "128K 词表（tiktoken 100K + 28K 非英语），英文压缩率从 3.17 提到 3.94 字符/token。"],
    ],
    answer: `<p>从数据岗视角答：分词器决定“token 预算到底买到多少信息”。举例：中文压缩率差的分词器，同样 1T tokens 只覆盖更少的中文内容；所以换分词器后，配比、epoch 数、去重统计都要按 token 重新算。</p>`,
    pitfall: `<ul><li>追问：<b>扩词表做中文 CPT 要注意什么</b>？新 token embedding 初始化（如用子 token 均值）、先冻结主体只训 embedding、再全量训。</li>
      <li>追问：<b>为什么 LLM 数不清 strawberry 里的 r</b>？模型看到的是 token 而非字符。</li></ul>`,
  },
  {
    id: "attention-eff", cat: "basic", level: 2, title: "注意力效率：FlashAttention、KV Cache、MQA/GQA/MLA",
    one: "标准注意力的瓶颈不是算力而是显存读写；FlashAttention 用分块 + 在线 softmax 把 O(N²) 的中间矩阵留在片上 SRAM，推理侧则靠压缩 KV Cache 提速。",
    points: `<ul>
      <li><b>FlashAttention</b>：IO-aware，按块把 Q/K/V 搬进 SRAM，用 online softmax（维护行最大值与归一化因子）逐块累加；反向时重算注意力而不存 N×N 矩阵。结果数学上精确，显存从 O(N²) 降到 O(N)，速度 2–4 倍。</li>
      <li><b>KV Cache</b>：自回归时缓存历史 K/V，每步只算新 token。大小 = 2 × 层数 × KV头数 × 头维 × 序列长 × batch × 字节数，是长上下文推理的显存大头。</li>
      <li><b>MQA / GQA</b>：减少 KV 头数；<b>MLA</b>（DeepSeek-V2/V3）把 K/V 低秩压缩成一个潜向量缓存，推理时可吸收矩阵，Cache 极小且效果接近 MHA。</li>
      <li><b>稀疏/线性注意力、滑窗注意力</b>（Mistral SWA）：降复杂度，常与全注意力层交替使用。</li>
      <li>训练长序列还要配合序列并行/上下文并行（Ring Attention、Ulysses）。</li></ul>`,
    papers: [
      ["FlashAttention（Dao et al.）", "2022", "IO 感知的精确注意力；FA2 改进并行与工作划分，FA3 利用 Hopper 异步与 FP8。"],
      ["Fast Transformer Decoding（MQA, Shazeer）", "2019", "所有头共享 K/V，推理带宽大幅下降。"],
      ["DeepSeek-V2", "2024", "提出 MLA，KV Cache 比 MHA 降低约 93%。"],
    ],
    answer: `<p>一句话定性：“FlashAttention 不是近似算法，它省的是 HBM 读写”。再把 KV Cache 公式写出来，并能估算：如 Llama-2-7B（32 层、32 头、128 维、fp16）每 token KV ≈ 2×32×32×128×2B ≈ 0.5MB，4K 上下文单条约 2GB——面试官很吃这种现场估算。</p>`,
    pitfall: `<ul><li>别说 FlashAttention 降低了计算复杂度——FLOPs 还是 O(N²)，反向因重算略增。</li>
      <li>追问：<b>prefill 与 decode 的瓶颈有何不同</b>？prefill 算力受限，decode 显存带宽受限。</li></ul>`,
  },
  {
    id: "moe", cat: "basic", level: 2, title: "MoE：用稀疏激活换更大容量",
    one: "MoE 把 FFN 换成多个专家 + 路由器，每个 token 只激活 top-k 个专家：总参数大、激活参数小，训练与推理 FLOPs 只随激活参数增长。",
    points: `<ul>
      <li><b>路由</b>：router 输出各专家打分，取 top-k（Switch 取 1，Mixtral 取 2，DeepSeek-V3 取 8/256 路由专家 + 1 共享专家）。</li>
      <li><b>负载均衡</b>：否则会“专家坍缩”。传统做法加辅助损失（让分配均匀）；DeepSeek-V3 用<b>无辅助损失</b>方案——给每个专家加可调偏置，只影响选择不影响权重。</li>
      <li><b>细粒度专家 + 共享专家</b>（DeepSeekMoE）：专家切更小、组合更灵活；共享专家吸收通用知识，减少冗余。</li>
      <li>工程：专家并行（EP）、All-to-All 通信、容量因子与 token 丢弃、推理时显存要装下全部专家。</li>
      <li>稳定性：router z-loss（ST-MoE）、路由计算用 fp32。</li></ul>`,
    papers: [
      ["Switch Transformer", "2021", "top-1 路由、简化 MoE，首次做到万亿参数，提出 router z-loss 前身与容量因子。"],
      ["Mixtral 8x7B", "2024", "8 专家选 2，总参 47B、激活约 13B，效果比肩 Llama 2 70B。"],
      ["DeepSeekMoE / DeepSeek-V3", "2024", "细粒度+共享专家；V3 671B 总参、37B 激活，无辅助损失负载均衡 + MTP 多 token 预测。"],
    ],
    answer: `<p>结构化答：①为什么（同 FLOPs 下更大容量）；②难点（负载均衡、通信、训练不稳、显存）；③主流解法（aux loss → aux-loss-free、细粒度/共享专家、EP）。数据视角可补：MoE 更“吃数据”，激活参数小但总容量大，需要更多更多样的 token 才能把专家喂饱。</p>`,
    pitfall: `<ul><li>别说 MoE 省显存——推理需要装下全部专家，省的是计算。</li>
      <li>追问：<b>专家真的学到了“领域分工”吗</b>？多数分析显示更偏向语法/token 级模式，不是干净的学科分工。</li></ul>`,
  },
  {
    id: "infra", cat: "basic", level: 2, title: "分布式训练与显存账：6ND、16 字节/参数、3D 并行",
    one: "训练算力 ≈ 6ND；混合精度 Adam 每个参数要约 16 字节的状态；装不下就靠 ZeRO/TP/PP/CP/EP 切开。",
    points: `<ul>
      <li><b>算力</b>：C ≈ 6·N·D FLOPs（前向 2ND、反向 4ND）。MFU = 实际有效 FLOPs / 硬件峰值，大规模训练 MFU 通常在 35%–55%。</li>
      <li><b>显存</b>：bf16 权重 2B + bf16 梯度 2B + fp32 主权重 4B + Adam m、v 各 4B = 16B/参数，另加激活值。7B 模型仅状态就约 112GB。</li>
      <li><b>ZeRO</b>：Stage 1 切优化器状态、Stage 2 再切梯度、Stage 3 再切参数（≈FSDP）。</li>
      <li><b>TP（张量并行）</b>：Megatron 把矩阵按行/列切，层内通信多，适合机内 NVLink。<b>PP（流水线）</b>：按层切，1F1B 减少气泡。<b>SP/CP</b>：按序列切，长上下文必备。<b>EP</b>：MoE 专家并行。</li>
      <li><b>激活重计算</b>（gradient checkpointing）用约 1/3 额外计算换显存。</li>
      <li><b>精度</b>：bf16 动态范围同 fp32，不需要 loss scaling；FP8 训练（DeepSeek-V3）需细粒度缩放与高精度累加。</li></ul>`,
    papers: [
      ["Megatron-LM", "2019", "层内张量并行。"],
      ["ZeRO（DeepSpeed）", "2020", "切分优化器状态/梯度/参数，消除数据并行的冗余。"],
      ["Efficient Large-Scale LM Training on GPU Clusters（PTD-P）", "2021", "TP+PP+DP 组合与交错流水线调度。"],
      ["DeepSeek-V3", "2024", "大规模 FP8 混合精度训练 + DualPipe 流水线。"],
    ],
    answer: `<p>面试官问“训一个 70B 要多少卡多少天”时现场算：C = 6 × 70e9 × 15e12 ≈ 6.3e24 FLOPs；H100 bf16 稠密峰值约 1e15 FLOPS，按 40% MFU，≈ 1.6e10 GPU·秒 ≈ 4.4e6 GPU 小时，约 2000 卡跑 90 天。数量级对就很加分。</p>`,
    pitfall: `<ul><li>别忘了激活值显存，它随 batch×序列长增长，长上下文时可能超过参数状态。</li>
      <li>追问：<b>数据并行下 global batch 怎么定</b>？参考临界 batch size，过大会降低样本效率；训练中常做 batch size warmup。</li></ul>`,
  },

  // ===================== 预训练 =====================
  {
    id: "scaling", cat: "pre", level: 3, title: "Scaling Law：从 Kaplan 到 Chinchilla，再到“过度训练”",
    one: "损失随参数 N、数据 D、算力 C 呈幂律下降；Chinchilla 说算力最优约 20 tokens/参数，但现在大家为了推理便宜，故意把小模型训到上千 tokens/参数。",
    fig: "scaling",
    points: `<ul>
      <li><b>Chinchilla 形式</b>：L(N,D) = E + A/N^α + B/D^β。E 是不可约损失；给定 C=6ND，求最优 N、D 分配。</li>
      <li><b>三种拟合方法</b>（Chinchilla 论文）：固定模型改 token 数取包络线、IsoFLOP 曲线、直接参数化拟合，结论一致：N、D 等比扩。</li>
      <li><b>过度训练（over-training）</b>：推理成本 ∝ N，部署量大时宁可训练多花算力，让小模型多看数据。Llama 3 8B 训 15T tokens，损失仍在下降。</li>
      <li><b>数据受限时</b>：重复数据的价值递减（见“数据不够怎么办”一课）。</li>
      <li><b>下游任务的 scaling</b>：Llama 3 两步法——先用 FLOPs 预测基准上的负对数似然，再把 NLL 映射到准确率，提前预测 405B 的表现。</li>
      <li><b>数据质量会改变 scaling 曲线</b>：高质量数据相当于“有效 token 更多”，曲线整体下移/斜率变化，这是数据工作的价值所在。</li></ul>`,
    fig2: "ratio",
    papers: [
      ["Scaling Laws for Neural Language Models（Kaplan）", "2020", "损失与 N、D、C 呈幂律；算力增长应更多给参数。"],
      ["Training Compute-Optimal LLMs（Chinchilla）", "2022", "N 与 D 应等比扩，约 20 tokens/参数；70B+1.4T 胜过 280B Gopher。"],
      ["Beyond Chinchilla-Optimal（Sardana et al.）", "2023", "把推理成本计入后，最优解是更小模型 + 更多数据。"],
      ["Scaling Data-Constrained LMs（Muennighoff）", "2023", "数据重复下的 scaling law：约 4 个 epoch 内几乎等价新数据。"],
      ["Llama 3 Herd of Models", "2024", "用下游任务 scaling law 预测旗舰模型能力；8B/70B 远超算力最优 token 数。"],
    ],
    answer: `<p>三层回答：①公式与结论（20 tokens/参数）；②为什么现在不按 Chinchilla 训（推理成本、数据充足、小模型远未饱和）；③数据岗视角——“Scaling law 是我做数据消融的尺子：同算力下新数据让 loss/下游曲线整体下移多少，就是数据的价值，并且要在 2–3 个规模上验证趋势不反转。”</p>`,
    pitfall: `<ul><li>Chinchilla 的“20 倍”是在特定数据集和设置下的，不是普适常数；换数据、换架构要重拟合。</li>
      <li>追问：<b>Kaplan 和 Chinchilla 为何结论不同</b>？Chinchilla 认为 Kaplan 对所有模型用了固定长度的学习率调度、且模型偏小；后续研究还指出 Kaplan 不计 embedding 参数等口径问题。</li>
      <li>追问：<b>损失降低一定带来下游提升吗</b>？不一定，有“涌现”/阈值现象，也可能是评测指标不连续造成的假象。</li></ul>`,
  },
  {
    id: "pipeline", cat: "pre", level: 3, title: "网页数据管线全景：从 Common Crawl 到训练 token",
    one: "预训练数据 = 大量网页 + 精选高质量源（代码、书、论文、百科、数学）；网页侧的标准流水线是 抽取 → 语言识别 → 规则过滤 → 去重 → 模型打分 → 安全/去污染 → 配比。",
    fig: "funnel",
    points: `<ul>
      <li><b>数据源</b>：Common Crawl（每月一个快照，几十亿网页）、代码（GitHub / The Stack）、书籍、arXiv 论文、维基百科、StackExchange、专利、数学网页、多语言数据、合成数据。</li>
      <li><b>WARC vs WET</b>：WET 是 CC 自带的纯文本，质量一般；FineWeb、DCLM 都发现从 WARC 原始 HTML 用 trafilatura/resiliparse 重新抽取明显更好。</li>
      <li><b>URL 过滤</b>：成人/恶意站黑名单、按域名统计打分。</li>
      <li><b>语言识别</b>：fastText lid.176，按语言分桶并设置置信度阈值。</li>
      <li><b>规则过滤 → 去重 → 模型过滤</b>：顺序有讲究，便宜的先做，把算力省给贵的模型打分。</li>
      <li><b>安全与合规</b>：PII 脱敏（邮箱、电话、IP）、毒性/成人内容、版权 robots.txt 遵守、benchmark 去污染。</li>
      <li>每一步都要<b>记录保留率和抽样看样本</b>，并用小模型消融验证——“过滤掉了什么”比“过滤后剩多少”更重要。</li></ul>`,
    papers: [
      ["CCNet", "2019", "按段落去重 + 语言识别 + 用 Wikipedia 训的 KenLM 困惑度把网页分 head/middle/tail。"],
      ["C4（T5 论文）", "2019", "一组简单规则（句末标点、去含 lorem ipsum/花括号的页等）造出 750GB 清洁英文语料。"],
      ["The RefinedWeb Dataset（Falcon）", "2023", "只用经过严格过滤+去重的网页数据，就能训出超过 Pile 等精选语料的模型。"],
      ["FineWeb / FineWeb-Edu（HuggingFace）", "2024", "15T tokens、96 个 CC 快照；公开每一步的消融：WARC 重抽取、单快照内去重优于全局去重等。"],
      ["DataComp-LM（DCLM）", "2024", "固定训练配方、比数据；模型过滤（fastText）是最有效的一步，DCLM-Baseline 7B 用 2.6T tokens 做到 MMLU 64%。"],
    ],
    answer: `<p>这是数据岗必问。推荐结构：①画出流水线（可直接按本页漏斗图讲）；②每步说一个关键决策与证据（如“WARC 重抽比 WET 好，FineWeb 有消融”）；③讲你自己的项目里哪一步收益最大、怎么验证的、踩过什么坑（误删数学/代码/表格、过滤器偏向某类文风等）。</p>`,
    pitfall: `<ul><li>别只说“清洗”，要说清楚每一步的<b>评估方式</b>：抽样人工检查 + 小模型训练消融 + 下游基准。</li>
      <li>追问：<b>过滤太狠会怎样</b>？多样性下降、领域偏斜、长尾知识丢失；可能在 MMLU 上涨但在别的能力上跌。</li>
      <li>追问：<b>如何处理多语言</b>？各语言单独调阈值，低资源语言过滤要更宽松，否则数据量骤减。</li></ul>`,
  },
  {
    id: "heuristic", cat: "pre", level: 2, title: "启发式规则过滤：便宜、可解释、但要小心误杀",
    one: "规则过滤用文档级统计量（长度、符号比、重复行、停用词…）快速去掉明显的垃圾，是最便宜的一层，但阈值必须靠抽样和消融来定。",
    points: `<ul>
      <li><b>Gopher 规则</b>（MassiveText）：词数 50–100,000；平均词长 3–10；符号（#、…）与词之比 &lt; 0.1；以项目符号开头的行 ≤ 90%；以省略号结尾的行 ≤ 30%；≥ 80% 的词含字母；至少包含若干英文停用词。</li>
      <li><b>Gopher 重复度规则</b>：重复行/段落比例、高频 n-gram 占比过高的文档删除——专治模板页、SEO 垃圾。</li>
      <li><b>C4 规则</b>：只保留以句末标点结尾的行、每行至少若干词、去掉含“lorem ipsum”、花括号（代码/JS）或脏词表命中的页面。</li>
      <li><b>FineWeb 自定义规则</b>：通过对比高/低质量样本的统计量分布找新规则，如“以标点结尾的行占比”“重复行字符占比”“短行占比”。</li>
      <li><b>困惑度过滤</b>：用在高质量语料（如维基百科）上训的 n-gram LM 打分，困惑度过高的删除（CCNet）。</li>
      <li><b>中文常见规则</b>：繁简转换、乱码/编码错误检测、广告/联系方式密度、标点异常、繁体中文/日文混入、色情赌博词表。</li></ul>`,
    papers: [
      ["Scaling Language Models: Methods, Analysis & Insights from Training Gopher", "2021", "MassiveText 的质量与重复规则被后续大量复用。"],
      ["Exploring the Limits of Transfer Learning（C4）", "2019", "简单规则即可大幅提升网页数据质量。"],
      ["FineWeb", "2024", "单独验证每条规则的增益；C4 的“句末标点”规则有效但删得太多，最终按比例阈值使用。"],
    ],
    answer: `<p>回答要点：“规则过滤 = 低成本高召回地去掉明显垃圾，不追求挑出最好的”。然后讲<b>定阈值方法</b>：看统计量在高/低质量参考集上的分布差异；抽样被删样本看误杀率；小模型消融确认整体增益。最后提醒：规则对代码、数学公式、表格、诗歌、对话等“非标准文本”误杀严重，要分域设阈值或豁免。</p>`,
    pitfall: `<ul><li>常见误区：规则越多越好。规则叠加会产生组合偏差，最好逐条做消融。</li>
      <li>追问：<b>困惑度过滤有什么偏差</b>？偏好“像维基百科”的文风，会删掉口语、论坛、小众领域内容。</li></ul>`,
  },
  {
    id: "modelfilter", cat: "pre", level: 3, title: "模型打分过滤：fastText、LLM 标注、分类器集成",
    one: "让大模型给少量样本打“有多少教育/知识价值”的分，再蒸馏成便宜的分类器跑全量——这是 2024 年以来提升基座效果最大的单项数据技术。",
    points: `<ul>
      <li><b>DCLM 思路</b>：fastText 二分类，正例 = OpenHermes 2.5 指令数据 + Reddit ELI5 高赞回答，负例 = RefinedWeb 随机网页；按分数取 top ~10%。简单但在 MMLU 上收益巨大。</li>
      <li><b>FineWeb-Edu 思路</b>：Llama-3-70B 给约 45 万网页按“教育价值”打 0–5 分 → 训练 embedding+回归头分类器 → 阈值 3 筛出约 1.3T tokens，MMLU、ARC 显著提升。</li>
      <li><b>Llama 3</b>：fastText 判断“是否像会被维基百科引用的页面”+ 基于 Llama 2 打分标签训的 RoBERTa 类质量分类器；另有代码/推理专用分类器。</li>
      <li><b>Nemotron-CC</b>：多个分类器<b>集成</b>后分档；低分档不扔，而是用 LLM 改写成更好的文本；高分档还生成多样化 QA，兼顾质量与 token 数，适合长周期（15T）训练。</li>
      <li><b>DeepSeekMath 迭代召回</b>：以 OpenWebMath 为种子训 fastText → 从 CC 召回数学页 → 人工标注 URL 补正例 → 再训，4 轮得到 120B tokens 数学语料。</li>
      <li><b>代价与风险</b>：分类器会放大标注偏好（偏学术、偏英文、偏“教科书腔”）；只取 top 会损失多样性和常识性/口语知识。</li></ul>`,
    papers: [
      ["DataComp-LM（DCLM）", "2024", "在 50+ 种过滤方法中，fastText 质量分类器最有效；参考正例的选择比分类器结构重要。"],
      ["FineWeb-Edu", "2024", "LLM 标注 + 小分类器；在知识/推理类基准上大幅超过 FineWeb，但在 HellaSwag 等常识类上不一定占优。"],
      ["Nemotron-CC", "2024", "分类器集成 + 合成改写，在质量与数量间取舍，长训练下胜过 DCLM。"],
      ["DeepSeekMath", "2024", "迭代式 fastText 从 CC 召回数学数据，7B 模型 MATH 51.7%（不用工具）。"],
      ["Textbooks Are All You Need（Phi-1）", "2023", "GPT-4 标注“教科书质量”+ 分类器过滤代码数据。"],
    ],
    answer: `<p>经典追问链：为什么 fastText 而不是 BERT？（便宜，几十亿文档能跑完，效果差距不大）→ 正例怎么选？（决定了“你想让模型变成什么样”）→ 怎么防偏？（分域阈值、保留一定比例中低分数据、集成多个分类器、看被删数据的领域分布）→ 怎么验证？（1B 级模型 + 几十B tokens 消融，看多个基准而非只看 MMLU）。</p>`,
    pitfall: `<ul><li>别把“分数高 = 质量高”当真理：教育分类器会让模型在 MMLU 上涨，却可能伤到常识推理、对话、创意写作。</li>
      <li>追问：<b>阈值取多少</b>？没有标准答案，要看 token 预算：预算大就放宽阈值+上采样高分，预算小就取 top。</li>
      <li>追问：<b>LLM 打分的一致性怎么保证</b>？多次采样取均值、少样本示例校准、人工抽检计算一致率。</li></ul>`,
  },
  {
    id: "dedup", cat: "pre", level: 3, title: "去重：精确、近重复、语义去重",
    one: "去重同时提升训练效率、降低记忆和隐私泄漏风险；网页侧主力是 MinHash-LSH 近重复去重，此外还有 URL、精确哈希、后缀数组子串、语义 embedding 去重。",
    fig: "minhash",
    points: `<ul>
      <li><b>层次</b>：URL 去重 → 文档精确哈希 → 行/段落级去重（CCNet）→ MinHash 近重复 → 子串级（后缀数组，删 ≥50 token 的重复片段）→ 语义去重（SemDeDup、D4）。</li>
      <li><b>MinHash 原理</b>：两集合 Jaccard 相似度 = 随机排列下最小哈希相等的概率；k 个哈希构成签名，LSH 分 b 段×r 行，任一段全相同即为候选对。</li>
      <li><b>FineWeb 发现</b>：对 96 个快照<b>全局</b>去重反而变差——老快照里“幸存”的数据多是低质量的；改成<b>每个快照内</b>去重更好。重复本身可能是质量信号。</li>
      <li><b>不是越干净越好</b>：适度重复高质量数据（上采样）有益；去重粒度和阈值要和配比一起考虑。</li>
      <li><b>工程</b>：数十 TB 数据要用 Spark/Ray/datatrove 分布式，哈希分桶 + Union-Find 合并连通分量。</li></ul>`,
    papers: [
      ["Deduplicating Training Data Makes LMs Better（Lee et al.）", "2022", "精确子串 + 近重复去重，模型逐字背诵训练数据的频率降低约 10 倍，训练更高效。"],
      ["SemDeDup", "2023", "在 embedding 空间聚类后删语义重复，可删约 50% 数据而性能基本不降。"],
      ["D4（Tirumala et al.）", "2023", "先语义去重再按多样性选数据，比随机选数据训练效率更高。"],
      ["FineWeb", "2024", "单快照 MinHash（5-gram、112 哈希=14 桶×8）优于全局去重。"],
    ],
    answer: `<p>能写出 P = 1 − (1 − s^r)^b 并解释 b、r 的取舍是加分项。项目经历可讲：去重前后各取一份训小模型，比较 loss 曲线和下游指标；统计被去重最多的域名/模板，确认没把高价值数据（如法规、医学指南这类本就高度相似的文本）误当重复删掉。</p>`,
    pitfall: `<ul><li>误区：去重率越高越好。过度去重会删掉合法的“高频知识”（法律条文、药品说明书、标准答案）。</li>
      <li>追问：<b>MinHash 和 SimHash 区别</b>？MinHash 估计 Jaccard（集合相似），SimHash 估计余弦（加权特征），SimHash 更省空间但对短文本不稳。</li>
      <li>追问：<b>代码去重</b>？要先做格式归一化（去空白/注释），The Stack 还按仓库/文件近重复去重。</li></ul>`,
  },
  {
    id: "mixture", cat: "pre", level: 3, title: "数据配比：DoReMi、RegMix、Data Mixing Laws",
    one: "配比 = 各领域数据在训练中被采样的比例，直接决定模型能力画像；主流做法是用小模型实验（代理模型或回归拟合）预测大模型的最佳配比，再结合经验和能力目标调整。",
    points: `<ul>
      <li><b>经验配比</b>：Llama 3 最终约 50% 通用知识、25% 数学与推理、17% 代码、8% 多语言 tokens。</li>
      <li><b>DoReMi</b>：先训参考模型，再用 Group DRO 训小代理模型，在“超额损失”大的领域上提高权重；280M 代理得到的权重用于 8B 模型，达到基线准确率快 2.6 倍。</li>
      <li><b>RegMix</b>：训练数百个小模型（随机配比）→ 拟合“配比 → 验证损失”的回归模型 → 搜索最优配比迁移到大模型。</li>
      <li><b>Data Mixing Laws</b>：把验证损失表示为配比的函数（指数形式），结合 scaling law 由小规模推大规模。</li>
      <li><b>知识分类降采样</b>（Llama 3）：用分类器给网页打主题标签，降采样过多的类别（如娱乐、艺术）。</li>
      <li><b>阶段性配比</b>：前期多样性优先，后期提高高质量/推理/代码比例（衔接 mid-train）。</li>
      <li>注意 <b>epoch 约束</b>：高质量源量少，上采样太狠会重复过多；配比 × 总 token ÷ 源大小 = 该源的 epoch 数。</li></ul>`,
    papers: [
      ["DoReMi（Xie et al.）", "2023", "小代理模型 + Group DRO 学领域权重，可迁移到大 30 倍的模型。"],
      ["RegMix", "2024", "用大量小模型做回归找配比；发现网页数据（如 CommonCrawl）与下游表现相关性强于维基等“高质量”源。"],
      ["Data Mixing Laws（Ye et al.）", "2024", "验证损失可被配比函数化预测。"],
      ["Llama 3 Herd of Models", "2024", "知识分类降采样 + 基于 scaling law 的配比实验，最终 50/25/17/8。"],
    ],
    answer: `<p>回答框架：“配比是一个多目标优化：能力目标（通用/代码/数学/多语言）× token 预算 × 各源可用量（epoch 上限）”。方法论：小模型网格/回归实验 → 在 2 个以上规模验证趋势 → 大模型训练中通过阶段性配比微调。最好能说出一个你做过的配比实验，以及“哪个基准对哪个域最敏感”。</p>`,
    pitfall: `<ul><li>误区：小模型最优配比可直接用于大模型。实际上不同规模最优点会漂移，需要规模外推或多规模验证。</li>
      <li>追问：<b>为什么代码数据能提升推理</b>？代码结构化、逻辑链长，多项研究显示适量代码对数学/推理有正迁移，但过多会伤自然语言能力。</li></ul>`,
  },
  {
    id: "repeat-synth", cat: "pre", level: 3, title: "数据不够怎么办：重复多 epoch 与合成数据",
    one: "高质量数据快被“用完”了：重复 4 个 epoch 以内几乎和新数据一样好；合成数据（改写、教科书式生成、QA 化）能补量提质，但要防模型坍缩和多样性丢失。",
    points: `<ul>
      <li><b>重复</b>：Muennighoff 等发现约 4 epoch 内损失几乎与唯一数据相同，之后收益快速递减，约 16 epoch 后再加算力几乎无用。</li>
      <li><b>改写（rephrasing）</b>：WRAP 用指令模型把网页改写成“维基风格”“问答风格”，与原文混合训练，预训练提速约 3 倍、困惑度降低。</li>
      <li><b>教科书式生成</b>：Phi-1 用 GPT-3.5 生成约 1B tokens 合成教材+习题，配合过滤后的代码，1.3B 模型 HumanEval 50.6%。Phi 系列强调“数据质量 > 规模”。</li>
      <li><b>Nemotron-CC / Kimi K2 等</b>：对低质量网页改写、对高质量网页生成多样化 QA/知识改写，在不重复原文的情况下扩充有效 token。</li>
      <li><b>风险</b>：模型坍缩（递归用自己生成的数据训练，分布尾部消失）；多样性不足（提示模板化）；幻觉被固化；与评测集同源造成隐性污染。</li>
      <li><b>缓解</b>：合成数据与真实数据<b>累积混合</b>而非替换；多样化种子（话题/人设/难度）；事实校验与去重；控制合成占比。</li></ul>`,
    papers: [
      ["Scaling Data-Constrained Language Models", "2023", "重复数据的 scaling law；约 4 epoch 内几乎无损。"],
      ["Rephrasing the Web（WRAP）", "2024", "网页改写成多种风格，预训练提速约 3 倍。"],
      ["Textbooks Are All You Need（Phi-1）", "2023", "合成教科书 + 过滤数据，小模型高代码能力。"],
      ["AI models collapse when trained on recursively generated data（Nature）", "2024", "递归训练导致分布尾部消失、模型坍缩。"],
      ["Is Model Collapse Inevitable?（Gerstgrasser et al.）", "2024", "如果真实数据被保留并与合成数据累积，坍缩可以避免。"],
    ],
    answer: `<p>回答顺序：先量化“不够”（目标 token 数 vs 高质量可用量）→ 再给方案优先级：①放宽过滤阈值 + 多 epoch 上采样高质量源；②改写/QA 化扩充；③教科书式生成补特定能力；④多语言/代码迁移。每条都要配一个验证与风险控制手段。</p>`,
    pitfall: `<ul><li>误区：合成数据可以完全替代真实数据。主流报告里合成数据都是“补充 + 定向增强”。</li>
      <li>追问：<b>怎么判断合成数据有没有用</b>？固定总 token、替换一部分为合成数据做消融；同时看多样性指标（n-gram 多样性、embedding 覆盖）。</li></ul>`,
  },
  {
    id: "domain-data", cat: "pre", level: 2, title: "代码、数学、多语言、长尾领域数据",
    one: "代码和数学是“推理能力的燃料”，需要专门的召回、过滤与格式保留；多语言要平衡“多语言诅咒”；垂直领域（如医疗）要兼顾专业性、时效性与合规。",
    points: `<ul>
      <li><b>代码</b>：The Stack（许可证过滤、opt-out）、近重复去重、过滤自动生成/超长行/数据文件；StarCoder2 还加入 issue、PR、notebook、文档；按仓库拼接保留跨文件上下文。</li>
      <li><b>数学</b>：OpenWebMath、DeepSeekMath Corpus、MegaMath；关键是<b>保留 LaTeX/MathML</b>（通用抽取器会把公式丢掉）、专用分类器召回。</li>
      <li><b>多语言</b>：容量有限时语言之间会互相挤占（curse of multilinguality）；常用温度采样（p ∝ n^(1/T)）提升低资源语言权重。</li>
      <li><b>垂直领域（医疗举例）</b>：来源（指南、教材、论文、病历需脱敏）、术语一致性、过时知识识别、敏感信息与合规审查、领域分类体系覆盖率评估。</li>
      <li><b>结构化/长文档</b>：书籍、论文、长代码仓库是长上下文能力的主要来源，抽取时要保留章节结构。</li></ul>`,
    papers: [
      ["StarCoder / StarCoder2（The Stack v2）", "2023/2024", "宽松许可证代码 + 去重 + PII 删除 + opt-out 机制。"],
      ["OpenWebMath", "2023", "专门保留数学公式的网页抽取管线，14.7B tokens。"],
      ["DeepSeekMath", "2024", "120B 数学 token；发现 arXiv 论文对数学推理帮助不大，网页数学数据更有效。"],
      ["MegaMath", "2025", "超大规模开放数学语料（数百 B tokens），含网页重抽取、代码与合成数据。"],
    ],
    answer: `<p>结合本职：如果做过医学/垂类数据，就讲“分类体系 → 召回 → 质量标准 → 覆盖率评估”的闭环，强调你如何<b>量化覆盖</b>（学科 × 病种 × 内容类型的矩阵）和<b>发现缺口后定向补数</b>，这正是面试官想听的数据 sense。</p>`,
    pitfall: `<ul><li>追问：<b>为什么 DeepSeekMath 说 arXiv 没用</b>？论文数据风格与题目求解差异大，在他们的实验中对 GSM8K/MATH 提升有限——说明“看起来专业”≠“对目标能力有用”。</li></ul>`,
  },
  {
    id: "stability", cat: "pre", level: 2, title: "训练稳定性与学习率调度：loss spike、WSD、μP",
    one: "大模型训练最怕 loss spike 和发散；常见手段是 warmup、梯度裁剪、z-loss、QK-Norm、跳过坏 batch 回滚；调度上 WSD 正在替代 cosine，因为它天然支持续训和“退火”。",
    fig: "lr",
    points: `<ul>
      <li><b>loss spike 来源</b>：异常数据 batch、学习率过大、注意力 logits 爆炸、Adam 二阶矩估计在罕见 token 上失准、低精度溢出。</li>
      <li><b>处理</b>：PaLM 做法——spike 时回滚到之前 checkpoint，跳过附近几百个 batch；降低学习率；检查当时的数据。</li>
      <li><b>预防</b>：梯度裁剪（1.0）、z-loss（惩罚 log Z 过大）、QK-Norm、embedding 梯度缩放（GLM-130B）、bf16、更小的 Adam ε/β₂ 调整。</li>
      <li><b>WSD 调度</b>（MiniCPM）：warmup → 长时间恒定学习率 → 最后约 10% 快速衰减。好处：不需预先定总步数；衰减段可从任意 checkpoint 分叉，便于做 scaling 实验和数据实验；衰减段放入高质量数据效果显著。</li>
      <li><b>μP</b>：按宽度对初始化与学习率做参数化，使小模型调好的超参可迁移到大模型（MiniCPM、Cerebras-GPT 等使用）。</li>
      <li><b>batch size / LR 关系</b>：大 batch 需相应提高 LR，常用 batch size warmup。</li></ul>`,
    papers: [
      ["PaLM", "2022", "spike 处理：回滚 + 跳过 200–500 个 batch；使用 z-loss。"],
      ["MiniCPM", "2024", "提出 WSD 调度；在衰减段引入高质量与 SFT 数据大幅提升能力。"],
      ["Tensor Programs V（μP）", "2022", "μTransfer：小模型调超参，零样本迁移到大模型。"],
      ["Small-scale proxies for large-scale Transformer training instabilities", "2023", "在小模型上复现 logits 发散等不稳定，并验证 QK-Norm、z-loss 有效。"],
    ],
    answer: `<p>数据岗角度回答 spike：第一反应是“定位 spike 前后的 batch，检查是否有异常数据（超长重复、乱码、极端字符分布）”，再谈优化器侧。并能把 WSD 和数据结合：“衰减段就是放最好数据的窗口，也是做数据价值评估的低成本手段”。</p>`,
    pitfall: `<ul><li>误区：spike 都是数据问题。很多 spike 与数据无关，回滚后跳过同样数据仍可能再出现，需要同时排查优化器状态。</li>
      <li>追问：<b>WSD 的衰减段为什么能带来大幅 loss 下降</b>？高学习率阶段参数在“河谷”中震荡，降学习率让其下沉到谷底（river valley 视角）。</li></ul>`,
  },
  {
    id: "ablation", cat: "pre", level: 3, title: "怎么证明数据有用：数据消融、早期信号基准、去污染",
    one: "数据决策靠实验而不是直觉：固定配方用小模型跑消融，选“在小规模就有信号”的评测，配合去污染，最后在更大规模复核。",
    points: `<ul>
      <li><b>消融设置</b>：常见 1B–2B 模型 × 20–100B tokens（约 Chinchilla 最优附近）；固定架构、超参、token 数，只换数据；最好跑 2 个随机种子估计噪声。</li>
      <li><b>早期信号基准</b>：小模型上 MMLU 多选格式接近随机，要用 <b>cloze 形式</b>（比较选项文本的似然）；FineWeb 挑选“单调上升、种子间方差小、高于随机”的任务（如 HellaSwag、ARC、PIQA、MMLU-cloze）。</li>
      <li><b>DataDecide 等工作</b>：小规模排名能在多大程度上预测大规模排名——多数情况下可以，但部分任务（如代码、数学）在小规模信号很弱。</li>
      <li><b>退火评估</b>（Llama 3）：拿训练到一半的 8B 模型，用 40B tokens 线性退火，新数据占 30%，比较基准——比从头训便宜得多。</li>
      <li><b>去污染</b>：与评测集做 n-gram 重叠检测（如 13-gram）后删除；还要防改写式污染（换说法的同题），可用 embedding 相似度或 LLM 判定。</li>
      <li><b>其他评估</b>：验证集困惑度（分领域）、数据统计（长度/语言/主题分布）、人工抽检。</li></ul>`,
    papers: [
      ["FineWeb", "2024", "公开消融方法：1.82B 模型 × 28B tokens、早期信号任务选择。"],
      ["DataComp-LM", "2024", "标准化“比数据”的基准：多规模、固定训练代码。"],
      ["DataDecide（AI2）", "2025", "系统研究小规模实验对大规模数据决策的预测力。"],
      ["Llama 3 Herd of Models", "2024", "用退火实验评估新数据集价值。"],
      ["Benchmark contamination 综述/研究（如 Deng et al.）", "2023/2024", "多种污染检测方法与改写污染问题。"],
    ],
    answer: `<p>这是最能体现数据岗专业度的问题。示范回答：“我会先定义目标能力和对应评测，再选在小规模有信号的指标；用 1B 模型做 A/B，同时报告种子噪声，只有提升超过噪声 2 倍才认；对有效的数据再用退火实验在更大模型上确认；全程做去污染。”</p>`,
    pitfall: `<ul><li>误区：只看一个基准（尤其 MMLU）做决策——很容易被单一能力或污染误导。</li>
      <li>追问：<b>小模型消融不一致怎么办</b>？增大规模或 token 数、增加种子、换更稳定的评测格式，或用 loss-based 指标（目标域困惑度）。</li></ul>`,
  }
);

// 大模型面试学堂 · 论文季刊：按季度精选预训练 / Mid-training / 后训练数据相关论文（ES2015 兼容）
// v: kb = 2025 年及以前的经典论文；web = 2026 年论文，内容来自 2026-11-18 检索到的 arXiv 摘要
(function () {
  var ST = {
    pre: { n: "预训练数据", c: "var(--brand)", s: "var(--brand-soft)" },
    mid: { n: "Mid-training", c: "var(--purple)", s: "var(--purple-soft)" },
    post: { n: "后训练 / RL", c: "var(--orange)", s: "var(--orange-soft)" },
    gen: { n: "技术报告·综合", c: "var(--green)", s: "var(--green-soft)" },
  };
  var QT = {
    "2024Q1": { name: "开放语料与配比的系统化", kw: ["全开源语料", "改写合成", "配比可预测", "GRPO 诞生"], sum: "Dolma / OLMo 把“数据怎么做”第一次完整公开；WRAP 证明改写网页能提速；Data Mixing Laws 让配比从拍脑袋变成可拟合；DeepSeekMath 同时贡献了数学语料召回方法和 GRPO。" },
    "2024Q2": { name: "质量分类器时代 + 退火", kw: ["FineWeb-Edu", "DCLM", "WSD 调度", "token 级选择"], sum: "FineWeb 和 DCLM 把“模型打分过滤”做成公认最有效的单项技术，并公开了全部消融；MiniCPM 的 WSD 让“衰减段放高质量数据”成为 mid-training 的雏形。" },
    "2024Q3": { name: "工业级配方公开", kw: ["Llama 3 数据章节", "RegMix", "ProX", "logits 蒸馏"], sum: "Llama 3 报告把质量分类器、知识分类降采样、退火评估数据都写进了正文；ProX 提出“让小模型给每篇文档写清洗程序”；Gemma 2 把大模型 logits 蒸馏用进小模型预训练。" },
    "2024Q4": { name: "合成数据进入主力", kw: ["Nemotron-CC", "Phi-4", "Tülu 3 / RLVR", "DeepSeek-V3"], sum: "Nemotron-CC 用“分档 + 改写 + QA 化”同时兼顾质量和数量；Phi-4 大规模使用合成数据；Tülu 3 开源了完整后训练配方并命名 RLVR；DeepSeek-V3 用 14.8T token 做出 MoE 标杆。" },
    "2025Q1": { name: "推理 RL 元年", kw: ["DeepSeek-R1", "DAPO", "s1 / LIMO", "OLMo 2 中训练"], sum: "R1 证明纯 RL 能涌现长链推理，随后 DAPO、Dr. GRPO 修补 GRPO 的偏差，s1、LIMO 说明少量精选数据就能激活推理；OLMo 2 明确提出 mid-training 阶段，“认知行为”论文指出基座数据决定 RL 能否起飞。" },
    "2025Q2": { name: "RL 边界之争，中训练定上限", kw: ["RL 是否新增能力", "OctoThinker", "Meta-rater", "Qwen3 三阶段"], sum: "Yue 等发现大 k 下基座 pass@k 反超 RL 模型，引发“RL 激发还是新增”的争论；OctoThinker 系统证明中训练数据决定 RL 可扩展性；Qwen3 公开 36T token、三阶段预训练；数据评估方法（DataDecide、Meta-rater）更成熟。" },
    "2025Q3": { name: "细粒度清洗与 Agentic 数据", kw: ["RefineX", "Kimi K2 合成 agent 数据", "MuonClip", "GLM-4.5"], sum: "RefineX 把“删除程序”蒸馏做到规模化；Kimi K2 用大规模工具与环境合成 agentic 数据，并展示 Muon 在万亿参数稳定训练；GLM-4.5 把智能体、推理、代码统一进一个基座。" },
    "2025Q4": { name: "Agentic 中训练成为独立阶段", kw: ["OLMo 3 microanneal", "Agentic CPT", "思考数据进中训练"], sum: "OLMo 3 公开了“microanneal 轻量反馈 + 集成测试”的中训练数据方法论；通义 DeepResearch 把 agentic 继续预训练明确为 SFT、RL 之前的独立阶段。" },
    "2026Q1": { name: "数据受限下的合成与配比", kw: ["synthetic megadocs", "DeMix 模型合并找配比", "隐式课程", "SFT/RL 数据分工"], sum: "合成数据从“改写短文”走向“拼成超长 megadoc”，数据效率继续提升；配比搜索开始借助模型合并降低成本；RLVR 的课程效应得到理论解释。" },
    "2026Q2": { name: "合成数据方法论与新一代基座", kw: ["FinePhrase", "DeepSeek-V4", "数据受限混合缩放律", "预训练/中训练/RL 因果"], sum: "FinePhrase 给出合成预训练数据的系统性配方（结构化格式最好，生成器超过 1B 收益消失）；DeepSeek-V4 用 32T+ token 训练百万上下文基座；ICML 论文用受控实验厘清预训练、中训练、RL 各自贡献。" },
    "2026Q3": { name: "数据工程走向 Agent 自动化", kw: ["AutoData", "书级合成教材", "MoE 更怕重复", "不可解题课程"], sum: "AutoData 让 agent 直接搜索数据选择算法；合成教材的收益被拆解为“书级组织”本身；MoE 被发现比稠密模型更怕数据重复；RLVR 开始利用“全错题”做课程。" },
    "2026Q4": { name: "合成改写的缩放律", kw: ["Rewriting scaling law", "优化器感知数据选择", "固定曝光下的 loss 加权", "多模态配比律"], sum: "改写数据有了自己的 scaling law：最优改写占比随算力上升；数据选择开始和优化器联合设计；多模态配比的缩放律给出跨模态干扰的定量结论。（本季进行中，持续更新）" },
  };

  var P = [
    // ---------- 2024Q1 ----------
    { q: "2024Q1", id: "dolma", t: "Dolma: an Open Corpus of Three Trillion Tokens for LM Pretraining Research", org: "AI2", ax: "2402.00159", st: "pre", must: 1, v: "kb", tags: ["开放语料", "管线"],
      one: "3T token 开放语料及完整工具链，公开每一步数据决策。", how: "网页、代码、论文、书籍、社交媒体多源；语言识别、质量与毒性过滤、PII、多粒度去重，每步给出设计理由与消融。", res: "成为 OLMo 系列的训练数据，也是研究“数据决策如何影响模型”的公共基线。", take: "把每一步保留率、删除原因、版本记录下来，是可复现管线的标准做法。", ask: "你们的管线和 Dolma 相比，哪一步设计不同？为什么？" },
    { q: "2024Q1", id: "olmo", t: "OLMo: Accelerating the Science of Language Models", org: "AI2", ax: "2402.00838", st: "gen", v: "kb", tags: ["全开源", "中间 checkpoint"],
      one: "数据、代码、训练日志、中间 checkpoint 全部开源的基座模型。", how: "配套 Dolma 数据与评测框架，公开完整训练过程。", res: "让外部研究者能做“某类数据对训练过程的影响”这类过去只有大厂能做的研究。", take: "中间 checkpoint 是做数据退火实验、数据价值评估的好起点。", ask: "如果只有一个开源模型的中间 checkpoint，你会怎么低成本评估一份新数据？" },
    { q: "2024Q1", id: "wrap", t: "Rephrasing the Web: A Recipe for Compute and Data-Efficient Language Modeling（WRAP）", org: "Apple · CMU", ax: "2401.16380", st: "pre", must: 1, v: "kb", tags: ["合成数据", "改写"],
      one: "把网页改写成维基风格、问答风格，与原文混合训练，预训练提速约 3 倍。", how: "用指令模型按多种风格改写同一篇网页，真实数据与改写数据按比例混合。", res: "同等效果所需算力显著下降，困惑度改善，且风格多样性很关键。", take: "改写不引入新知识，但能让同一知识以多种形式出现——知识需要“多样化重复”。", ask: "改写数据和原文混合的比例怎么定？只用改写数据会怎样？" },
    { q: "2024Q1", id: "qurating", t: "QuRating: Selecting High-Quality Data for Training Language Models", org: "Princeton", ax: "2402.09739", st: "pre", v: "kb", tags: ["质量评估", "数据选择"],
      one: "让 LLM 成对比较文档质量，训练四维打分器，按分数温度采样。", how: "写作风格、所需专业度、事实与知识、教育价值四个维度；成对比较比直接打分更稳定。", res: "温度采样优于 top-k 硬截断，在提升质量的同时保留多样性。", take: "质量分不要硬截断，分档 + 采样更稳。", ask: "为什么成对比较比绝对打分更可靠？" },
    { q: "2024Q1", id: "dml", t: "Data Mixing Laws: Optimizing Data Mixtures by Predicting Language Modeling Performance", org: "复旦", ax: "2403.16952", st: "pre", v: "kb", tags: ["配比", "缩放律"],
      one: "把验证 loss 写成配比的函数，用小规模实验预测大规模最优配比。", how: "拟合“配比 → loss”的指数形式，再结合训练步数、模型规模的缩放律外推。", res: "预测的配比在更大模型上优于默认配比。", take: "配比可以“算”，但必须在多个规模上验证外推。", ask: "配比律在什么情况下会失效？" },
    { q: "2024Q1", id: "dsmath", t: "DeepSeekMath: Pushing the Limits of Mathematical Reasoning（含 GRPO）", org: "DeepSeek", ax: "2402.03300", st: "post", must: 1, v: "kb", tags: ["数学语料召回", "GRPO"],
      one: "迭代 fastText 从 Common Crawl 召回 120B 数学语料，并提出 GRPO。", how: "以 OpenWebMath 为种子训分类器 → 召回 → 人工标注 URL 补正例 → 再训，共 4 轮；RL 阶段用组内相对奖励替代 critic。", res: "7B 模型 MATH 51.7%（不用工具）；GRPO 成为后来 R1 的核心算法。", take: "领域数据召回的标准做法：种子 → 分类器 → 召回 → 人工校正 → 迭代。", ask: "为什么论文发现 arXiv 论文对数学题帮助不大？" },
    { q: "2024Q1", id: "long128k", t: "Data Engineering for Scaling Language Models to 128K Context", org: "Yao Fu 等", ax: "2402.10171", st: "mid", v: "kb", tags: ["长上下文", "配比"],
      one: "长上下文继续训练只需 1–5B token，关键是“保持领域配比、在域内上采样长文档”。", how: "比较只上采样书籍、全局上采样长文、按源上采样等策略。", res: "按源上采样长文档最好，只堆书籍会伤其他能力。", take: "长文本数据不是越长越好，要保持原领域分布。", ask: "长文本继续训练后短文本掉点怎么办？" },
    { q: "2024Q1", id: "less", t: "LESS: Selecting Influential Data for Targeted Instruction Tuning", org: "Princeton", ax: "2402.04333", st: "post", v: "kb", tags: ["数据选择", "梯度"],
      one: "用 LoRA 梯度 + 随机投影，按与目标任务的梯度相似度选 SFT 数据。", how: "离线计算候选样本梯度特征，与少量目标任务样本比较相似度。", res: "只用约 5% 的数据就能超过全量训练。", take: "影响力类方法适合 SFT 这种小数据量场景，预训练规模需要更便宜的近似。", ask: "为什么不能直接把 LESS 用到预训练数据选择上？" },

    // ---------- 2024Q2 ----------
    { q: "2024Q2", id: "fineweb", t: "The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale", org: "Hugging Face", ax: "2406.17557", st: "pre", must: 1, v: "kb", tags: ["网页管线", "消融", "FineWeb-Edu"],
      one: "15T token 网页语料，公开每一步消融；FineWeb-Edu 用 LLM 标注教育价值再蒸馏分类器。", how: "WARC 重新抽取、语言识别、规则过滤、单快照内 MinHash；Llama-3-70B 给约 45 万网页打 0–5 分训练分类器。", res: "单快照去重优于全局去重；Edu 子集在知识、推理基准上提升明显。", take: "最值得背的三个结论：WARC 重抽取更好、全局去重会变差、LLM 标注 + 小分类器跑全量。", ask: "为什么全局去重反而变差？" },
    { q: "2024Q2", id: "dclm", t: "DataComp-LM: In Search of the Next Generation of Training Sets", org: "多机构联合", ax: "2406.11794", st: "pre", must: 1, v: "kb", tags: ["数据基准", "fastText"],
      one: "固定训练配方、只比数据的基准；fastText 质量分类器是最有效的一步。", how: "比较 50 多种过滤方法；正例为指令数据 + ELI5 高赞回答，负例为随机网页。", res: "DCLM-Baseline 7B 用 2.6T token 做到 MMLU 64%。", take: "正例的选择比分类器结构更重要——它定义了你想要的数据长什么样。", ask: "fastText 分类器的正例为什么选指令数据？有什么偏差？" },
    { q: "2024Q2", id: "minicpm", t: "MiniCPM: Unveiling the Potential of Small Language Models with Scalable Training Strategies", org: "面壁智能", ax: "2404.06395", st: "mid", must: 1, v: "kb", tags: ["WSD", "退火"],
      one: "提出 WSD 学习率调度，并在衰减段加入高质量与 SFT 数据。", how: "warmup → 长时间恒定学习率 → 最后约 10% 快速衰减；稳定段可随时分叉做实验。", res: "衰减段加入高质量数据的收益远大于只在 SFT 阶段加入。", take: "衰减段就是放最好数据的窗口，也是低成本评估数据价值的手段。", ask: "WSD 相比 cosine 对数据实验有什么好处？" },
    { q: "2024Q2", id: "rho1", t: "Not All Tokens Are What You Need for Pretraining（RHO-1）", org: "微软 · 厦大", ax: "2404.07965", st: "pre", v: "kb", tags: ["token 级选择"],
      one: "按“当前模型 loss − 参考模型 loss”只对有价值的 token 计算损失。", how: "先在高质量数据上训参考模型，训练时跳过噪声 token 和已学会的 token。", res: "数学继续预训练的数据效率显著提升。", take: "选择可以细到 token；但它省的是有效计算，不省读取与前向。", ask: "token 级选择和文档级选择各适合什么场景？" },
    { q: "2024Q2", id: "simpo", t: "SimPO: Simple Preference Optimization with a Reference-Free Reward", org: "Princeton", ax: "2405.14734", st: "post", v: "kb", tags: ["偏好优化"],
      one: "用长度归一化的平均 log 概率当隐式奖励，去掉参考模型并加 margin。", how: "奖励 = 平均对数似然；目标 margin γ 拉开好坏回答。", res: "AlpacaEval 2 等对话评测上优于 DPO，缓解长度偏差、节省显存。", take: "偏好数据里 chosen 偏长时，长度归一化很关键。", ask: "DPO 为什么会让回答越来越长？" },
    { q: "2024Q2", id: "dsv2", t: "DeepSeek-V2: A Strong, Economical, and Efficient MoE Language Model", org: "DeepSeek", ax: "2405.04434", st: "gen", v: "kb", tags: ["MLA", "MoE"],
      one: "提出 MLA，KV Cache 比 MHA 降低约 93%。", how: "K/V 低秩压缩成潜向量缓存，配合细粒度 + 共享专家的 DeepSeekMoE。", res: "以较低训练成本达到当时开源一线水平。", take: "架构降成本 → 同样预算能训更多 token，数据需求随之上升。", ask: "MLA 省的是什么？对长上下文数据有什么意义？" },
    { q: "2024Q2", id: "sparkjoy", t: "Does your data spark joy? Performance gains from domain upsampling at the end of training", org: "Databricks", ax: "2406.03476", st: "mid", v: "kb", tags: ["末期上采样", "数据价值评估"],
      one: "在训练末尾上采样领域数据，能低成本提升目标基准，也可用来评估数据价值。", how: "改变最后一段训练的领域配比，比较不同上采样比例与时长。", res: "末期上采样带来明显收益，且成本远低于从头训练。", take: "“末期上采样实验”是数据岗最便宜的验证工具之一。", ask: "怎么用退火实验判断一份数据值不值得加入？" },
    { q: "2024Q2", id: "mates", t: "MATES: Model-Aware Data Selection for Efficient Pretraining with Data Influence Models", org: "CMU", ax: "2406.06046", st: "pre", v: "kb", tags: ["动态选择", "影响力"],
      one: "训练一个小的数据影响力模型，随预训练进程动态选择数据。", how: "定期在当前模型上探测部分样本的影响力，训练小模型泛化到全量。", res: "相同算力下优于静态选择。", take: "数据价值随训练阶段变化，静态打分会过时。", ask: "动态数据选择的工程代价在哪里？" },

    // ---------- 2024Q3 ----------
    { q: "2024Q3", id: "llama3", t: "The Llama 3 Herd of Models", org: "Meta", ax: "2407.21783", st: "gen", must: 1, v: "kb", tags: ["数据章节", "退火评估"],
      one: "15T token；质量分类器、知识分类降采样、退火评估数据、6 阶段扩到 128K。", how: "配比约 50% 通用 / 25% 数学推理 / 17% 代码 / 8% 多语言；最后 40M token 线性退火并上采样高质量数据；后训练迭代 6 轮。", res: "退火对 8B 的数学提升明显，对 405B 几乎无收益。", take: "“半程 checkpoint + 40B token 退火”的数据价值评估方法可以直接借鉴。", ask: "为什么退火对大模型收益变小？" },
    { q: "2024Q3", id: "regmix", t: "RegMix: Data Mixture as Regression for Language Model Pre-training", org: "Sea AI Lab 等", ax: "2407.01492", st: "pre", v: "kb", tags: ["配比", "回归"],
      one: "随机配比训数百个小模型，回归拟合“配比 → loss”，再搜最优配比。", how: "小模型便宜，大量采样后用回归模型代替真实训练。", res: "发现 Common Crawl 网页与下游表现的相关性强于维基等“高质量”源。", take: "直觉认为的高质量源不一定是最重要的源，要用数据说话。", ask: "RegMix 和 DoReMi 的区别？" },
    { q: "2024Q3", id: "gemma2", t: "Gemma 2: Improving Open Language Models at a Practical Size", org: "Google DeepMind", ax: "2408.00118", st: "gen", v: "kb", tags: ["logits 蒸馏"],
      one: "小模型预训练中用大模型的概率分布做知识蒸馏。", how: "学生拟合教师每个位置的 next-token 分布，而不是只学 one-hot 标签。", res: "同规模下效果明显提升。", take: "蒸馏不只是“用强模型生成数据”，也可以在预训练阶段直接用 logits。", ask: "数据蒸馏和 logits 蒸馏各自的优缺点？" },
    { q: "2024Q3", id: "prox", t: "Programming Every Example: Lifting Pre-training Data Quality like Experts at Scale（ProX）", org: "上海交大 GAIR 等", ax: "2409.17115", st: "pre", must: 1, v: "kb", tags: ["细粒度清洗", "程序化编辑"],
      one: "让小模型为每篇文档生成清洗程序（丢弃整篇或删行、删字符串）。", how: "文档级与块级两层操作，小模型批量推理执行。", res: "在多个规模上优于原始数据和规则过滤。", take: "把清洗变成“模型写程序、程序执行”，兼顾精度与可控性——RefineX 的前身。", ask: "为什么让模型输出删除操作，而不是直接输出清洗后的文本？" },
    { q: "2024Q3", id: "q25math", t: "Qwen2.5-Math Technical Report: Toward Mathematical Expert Model via Self-Improvement", org: "阿里 Qwen", ax: "2409.12122", st: "mid", v: "kb", tags: ["数学继续预训练", "自我改进"],
      one: "约 1T token 数学语料继续预训练，配合模型自我改进与 GRPO。", how: "用上一代数学模型合成数据，奖励模型引导拒绝采样。", res: "数学基准大幅领先同规模开源模型。", take: "后来“Qwen 基座 RL 更容易起飞”的现象，与这类数学中训练直接相关。", ask: "中训练数学数据为什么会影响后续 RL 的效果？" },
    { q: "2024Q3", id: "ttc", t: "Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters", org: "Google DeepMind · UC Berkeley", ax: "2408.03314", st: "post", v: "kb", tags: ["测试时计算"],
      one: "按题目难度自适应分配测试时计算，可以比单纯放大参数更划算。", how: "比较 best-of-N、过程奖励引导搜索、顺序修订等策略。", res: "最优分配下，小模型加测试时计算可以匹敌更大的模型。", take: "推理时代，训练数据要服务“会思考、会自我修正”的能力。", ask: "测试时计算的兴起对预训练数据有什么新要求？" },

    // ---------- 2024Q4 ----------
    { q: "2024Q4", id: "nemocc", t: "Nemotron-CC: Transforming Common Crawl into a Refined Long-Horizon Pretraining Dataset", org: "NVIDIA", ax: "2412.02595", st: "pre", must: 1, v: "kb", tags: ["分档", "改写", "质量 vs 数量"],
      one: "分类器集成分档，低分改写、高分生成多样化 QA，兼顾质量与 token 数量。", how: "多个质量分类器取最高分；不同档位采用保留、改写、QA 化等不同处理。", res: "在 15T 级长训练下胜过只取高分数据的 DCLM。", take: "只留 top 数据在长训练中会被重复太多次——“分档处理”是长周期训练的答案。", ask: "训练 token 预算很大时，质量过滤策略要怎么调整？" },
    { q: "2024Q4", id: "tulu3", t: "Tülu 3: Pushing Frontiers in Open Language Model Post-Training", org: "AI2", ax: "2411.15124", st: "post", must: 1, v: "kb", tags: ["全开源后训练", "RLVR"],
      one: "开源完整后训练配方：SFT 混合 + on-policy DPO + RLVR（并命名 RLVR）。", how: "按能力构建 SFT 数据并去污染；偏好数据由当前模型采样；可验证任务用规则奖励。", res: "开源后训练配方达到同期闭源水平的一部分能力。", take: "后训练数据同样需要“能力标签 + 去污染 + 消融”的数据工程。", ask: "on-policy 偏好数据为什么比 off-policy 好？" },
    { q: "2024Q4", id: "dsv3", t: "DeepSeek-V3 Technical Report", org: "DeepSeek", ax: "2412.19437", st: "gen", must: 1, v: "kb", tags: ["MoE", "FP8", "MTP"],
      one: "671B 总参 / 37B 激活，14.8T token，FP8 训练、无辅助损失负载均衡、多 token 预测。", how: "提高数学与代码比例、扩展多语言；YaRN 两阶段扩到 128K；后训练蒸馏 R1 系列推理数据。", res: "以较低训练成本达到开源顶尖水平。", take: "报告里的数据章节虽短，但“数学代码比例上调”和“推理数据蒸馏”是关键。", ask: "无辅助损失的负载均衡是怎么做的？" },
    { q: "2024Q4", id: "phi4", t: "Phi-4 Technical Report", org: "Microsoft", ax: "2412.08905", st: "pre", v: "kb", tags: ["合成数据主力"],
      one: "大量使用多智能体、自我修订等方法生成的合成数据作为预训练主力之一。", how: "多类合成数据与精选网页、代码等真实数据混合。", res: "14B 模型在推理类基准上表现突出。", take: "合成数据可以成为主力，但仍需与真实数据混合，并严格去污染。", ask: "合成数据占比很高时，最需要警惕什么？" },
    { q: "2024Q4", id: "qwen25", t: "Qwen2.5 Technical Report", org: "阿里 Qwen", ax: "2412.15115", st: "gen", v: "kb", tags: ["18T", "两阶段 RL"],
      one: "预训练扩到 18T token，后训练用离线 DPO + 在线 GRPO 两阶段 RL。", how: "更强的质量过滤与领域平衡，数学、代码专项数据。", res: "全系列开源模型能力大幅提升。", take: "领域平衡与专项数据是大厂报告的固定章节。", ask: "离线 DPO 和在线 RL 为什么要组合使用？" },

    // ---------- 2025Q1 ----------
    { q: "2025Q1", id: "r1", t: "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning", org: "DeepSeek", ax: "2501.12948", st: "post", must: 1, v: "kb", tags: ["纯 RL 涌现", "蒸馏"],
      one: "R1-Zero 纯 RL 涌现长链推理；R1 四阶段配方；80 万条数据蒸馏小模型。", how: "冷启动 SFT → 推理 RL（加语言一致性奖励）→ 拒绝采样约 60 万推理 + 20 万通用数据 SFT → 全场景 RL。", res: "推理基准接近闭源顶尖模型；蒸馏小模型优于小模型自己做 RL。", take: "RL 时代数据岗的新资产：可验证题库、冷启动数据、拒绝采样数据。", ask: "R1 为什么不用过程奖励模型？" },
    { q: "2025Q1", id: "k15", t: "Kimi k1.5: Scaling Reinforcement Learning with LLMs", org: "月之暗面", ax: "2501.12599", st: "post", v: "kb", tags: ["长上下文 RL", "long2short"],
      one: "长上下文 RL、partial rollout，并提出 long2short 压缩推理长度。", how: "长链推理模型的能力迁移到短 CoT 模型，减少“想太多”。", res: "长、短推理两条线都达到较强水平。", take: "推理数据要控制长度分布，避免模型学会啰嗦。", ask: "推理模型过度思考怎么从数据上解决？" },
    { q: "2025Q1", id: "s1", t: "s1: Simple test-time scaling", org: "Stanford 等", ax: "2501.19393", st: "post", v: "kb", tags: ["1K 精选数据", "budget forcing"],
      one: "从 59K 题中精选 1K 条长 CoT 数据，加 budget forcing 实现测试时扩展。", how: "按质量、难度、多样性三标准选题；模型想停时追加“Wait”延长思考。", res: "32B 模型在数学竞赛题上有明显提升。", take: "少量数据激活推理的前提是强基座——选题标准比数量更重要。", ask: "s1 的三个选题标准分别解决什么问题？" },
    { q: "2025Q1", id: "limo", t: "LIMO: Less is More for Reasoning", org: "上海交大 GAIR", ax: "2502.03387", st: "post", v: "kb", tags: ["少量精选"],
      one: "817 条精选样本即可大幅提升数学推理。", how: "强调高质量推理示范模板与题目难度。", res: "在多个数学基准上超过用大量数据训练的模型。", take: "“少即是多”成立的前提：基座已有知识 + 极高质量示范。", ask: "LIMO 和 LIMA 的共同前提是什么？" },
    { q: "2025Q1", id: "olmo2", t: "2 OLMo 2 Furious", org: "AI2", ax: "2501.00656", st: "mid", must: 1, v: "kb", tags: ["mid-training", "model soup"],
      one: "明确提出 mid-training 阶段（Dolmino Mix），并对多次退火结果做权重平均。", how: "高质量网页 + 数学合成/过滤数据 + 百科等组成中训练混合；不同数据顺序多次退火后平均。", res: "中训练显著提升数学等能力，全流程开源。", take: "中训练数据配方第一次被完整公开，是理解 mid-train 的必读。", ask: "为什么要对多次退火结果做 model soup？" },
    { q: "2025Q1", id: "weborg", t: "Organize the Web: Constructing Domains Enhances Pre-Training Data Curation（WebOrganizer）", org: "Princeton · AI2", ax: "2502.10341", st: "pre", v: "kb", tags: ["主题×格式", "标签体系"],
      one: "用 24 个主题 × 24 种格式两套体系给网页分域，再优化域配比。", how: "LLM 标注后蒸馏分类器；在域上用 RegMix 搜配比，与质量过滤叠加。", res: "域配比与质量过滤互补，叠加还有额外收益。", take: "标签体系是配比和诊断的基础设施——和医学分类覆盖率是同一套思路。", ask: "主题标签和质量分为什么能互补？" },
    { q: "2025Q1", id: "olmocr", t: "olmOCR: Unlocking Trillions of Tokens in PDFs with Vision Language Models", org: "AI2", ax: "2502.18443", st: "pre", v: "kb", tags: ["PDF 解析", "VLM"],
      one: "微调 VLM 并把 PDF 文本层作为锚点输入，低成本把海量 PDF 转成干净文本。", how: "图像 + 文本层锚点联合输入，减少幻觉与重复。", res: "百万页级别成本可控；OLMo 3 用它处理了上亿篇科学 PDF。", take: "高价值长文本的瓶颈在解析；VLM 解析必须配幻觉检测。", ask: "VLM 解析 PDF 最大的风险是什么？怎么检测？" },
    { q: "2025Q1", id: "cogbeh", t: "Cognitive Behaviors that Enable Self-Improving Reasoners", org: "Stanford", ax: "2503.01307", st: "mid", v: "kb", tags: ["认知行为", "RL 可扩展性"],
      one: "验证、回溯、子目标设定、逆向推理四种行为决定基座能否通过 RL 自我提升。", how: "比较 Qwen 与 Llama 基座的 RL 表现，并用含这些行为的数据预热 Llama。", res: "预热后 Llama 的 RL 曲线追上 Qwen；推理过程正确但答案错的数据也有效。", take: "中训练要注入“会检查、会回溯”的推理轨迹，而不只是答案。", ask: "为什么同样的 RL 配方在不同基座上效果差很多？" },
    { q: "2025Q1", id: "dapo", t: "DAPO: An Open-Source LLM Reinforcement Learning System at Scale", org: "字节 Seed · 清华 AIR", ax: "2503.14476", st: "post", must: 1, v: "kb", tags: ["GRPO 改进"],
      one: "Clip-Higher、动态采样、token 级损失、超长奖励整形四件套。", how: "解耦上下裁剪界防熵坍缩；丢弃全对全错的组再补采；按 token 平均损失。", res: "32B 基座在 AIME 2024 上达到 50 分。", take: "动态采样的本质是“数据筛选”：只训练有梯度信号的题。", ask: "一组回答全对时 GRPO 会怎样？DAPO 怎么处理？" },
    { q: "2025Q1", id: "drgrpo", t: "Understanding R1-Zero-Like Training: A Critical Perspective（Dr. GRPO）", org: "Sea AI Lab 等", ax: "2503.20783", st: "post", v: "kb", tags: ["偏差修正"],
      one: "指出 GRPO 的长度与难度归一化偏差；基座本身已有自我反思。", how: "去掉 1/|o| 长度归一化和 std 归一化。", res: "token 效率更高；“aha moment”部分来自基座预训练。", take: "RL 的现象要回到预训练数据里找原因。", ask: "GRPO 的长度归一化会带来什么偏差？" },

    // ---------- 2025Q2 ----------
    { q: "2025Q2", id: "qwen3", t: "Qwen3 Technical Report", org: "阿里 Qwen", ax: "2505.09388", st: "gen", must: 1, v: "kb", tags: ["36T", "三阶段", "思考模式融合"],
      one: "36T token、119 种语言；通用 → 推理强化 → 长上下文三阶段预训练。", how: "S2 约 5T 高质量 STEM / 代码 / 推理 / 合成数据；后训练长 CoT 冷启动 → 推理 RL → 思考模式融合 → 通用 RL。", res: "思考与非思考模式统一，小模型用强到弱蒸馏。", take: "三阶段预训练是 mid-training 的工业标准形态。", ask: "推理强化阶段的数据和通用阶段有什么不同？" },
    { q: "2025Q2", id: "yue", t: "Does Reinforcement Learning Really Incentivize Reasoning Capacity in LLMs Beyond the Base Model?", org: "清华", ax: "2504.13837", st: "post", must: 1, v: "kb", tags: ["pass@k", "能力边界"],
      one: "k 很大时，基座模型的 pass@k 会反超 RLVR 后的模型。", how: "在数学、代码、视觉推理上比较不同 k 的 pass@k。", res: "RLVR 主要提升采样效率、收窄覆盖面；蒸馏能引入新模式。", take: "能力边界主要由预训练和中训练数据决定——这是数据岗最有力的论据。", ask: "你怎么看“RL 只是激发而非新增能力”？" },
    { q: "2025Q2", id: "metarater", t: "Meta-rater: A Multi-dimensional Data Selection Method for Pre-training Language Models", org: "上海 AI Lab 等", ax: "2504.14194", st: "pre", v: "kb", tags: ["多维质量", "权重学习"],
      one: "用 25 个质量信号，通过代理模型学习各维度权重，综合筛选数据。", how: "专业性、可读性、推理、清洁度等维度 + 已有质量分，回归学权重。", res: "多维加权优于单一质量分。", take: "多维质量分的权重要在自己的数据上重新学，不能照搬。", ask: "多个质量维度的权重怎么确定？" },
    { q: "2025Q2", id: "datadecide", t: "DataDecide: How to Predict Best Pretraining Data with Small Experiments", org: "AI2", ax: "2504.11393", st: "gen", v: "kb", tags: ["小规模实验", "评估方法"],
      one: "系统研究小规模实验对大规模数据决策的预测力。", how: "多份语料 × 多个规模训练，比较小规模排名与大规模排名的一致性。", res: "多数情况下小规模可预测，但代码、数学等任务在小规模信号弱。", take: "做数据消融前先确认你选的指标在小规模有信号。", ask: "小模型消融结论和大模型不一致怎么办？" },
    { q: "2025Q2", id: "megamath", t: "MegaMath: Pushing the Limits of Open Math Corpora", org: "LLM360 等", ax: "2504.02807", st: "pre", v: "kb", tags: ["数学语料"],
      one: "超大规模开放数学语料：网页重抽取、代码与合成数据。", how: "专门保留公式的抽取管线，分层质量筛选。", res: "成为后续 Llama 系中训练（如 OctoThinker）的数学语料来源。", take: "数学语料的关键是“保公式 + 专用召回”。", ask: "通用网页抽取为什么会丢掉数学公式？" },
    { q: "2025Q2", id: "prorl", t: "ProRL: Prolonged Reinforcement Learning Expands Reasoning Boundaries in LLMs", org: "NVIDIA", ax: "2505.24864", st: "post", v: "kb", tags: ["长时间 RL"],
      one: "足够长、稳定的 RL 训练可以拓展推理边界。", how: "KL 控制、参考策略重置、多样化任务长时间训练。", res: "在部分任务上 pass@k 也超过基座，与 Yue 等结论形成对照。", take: "“RL 是否新增能力”仍是开放问题，面试时要能讲两边证据。", ask: "ProRL 和 Yue 等的结论矛盾吗？" },
    { q: "2025Q2", id: "entropy", t: "The Entropy Mechanism of Reinforcement Learning for Reasoning Language Models", org: "上海 AI Lab 等", ax: "2505.22617", st: "post", v: "kb", tags: ["熵坍缩"],
      one: "RL 中策略熵快速坍缩会锁死性能上限，提出基于协方差的熵控制。", how: "分析熵与性能的经验关系；对高协方差 token 做裁剪或 KL 约束。", res: "缓解熵坍缩后性能继续提升。", take: "RL 训练要监控熵；题目多样性也影响熵。", ask: "RL 训练时你会监控哪些指标？" },
    { q: "2025Q2", id: "octo", t: "OctoThinker: Mid-training Incentivizes Reinforcement Learning Scaling", org: "上海交大 GAIR", ax: "2506.20512", st: "mid", must: 1, v: "kb", tags: ["中训练 × RL"],
      one: "系统研究 Llama 基座的中训练数据如何决定 RL 可扩展性。", how: "比较数学语料、QA、长 CoT、指令数据的组合；提出先稳定后衰减的两阶段中训练。", res: "高质量数学语料显著提升 RL 后效果；长 CoT 有用但可能导致冗长和不稳定。", take: "评估中训练数据，要看“接 RL 之后”的效果，而不只看基座分数。", ask: "中训练放越多长 CoT 越好吗？" },
    { q: "2025Q2", id: "fineweb2", t: "FineWeb2: One Pipeline to Scale Them All — Adapting Pre-Training Data Processing to Every Language", org: "Hugging Face", ax: "2506.20920", st: "pre", v: "kb", tags: ["多语言"],
      one: "覆盖上千种语言的网页语料，按语言自适应调整过滤与去重。", how: "每种语言单独统计、单独调阈值，并按重复度上采样。", res: "多语言模型效果优于统一阈值的方案。", take: "英文上调好的规则不能直接套到其他语言。", ask: "多语言数据处理最大的难点是什么？" },

    // ---------- 2025Q3 ----------
    { q: "2025Q3", id: "refinex", t: "RefineX: Learning to Refine Pre-training Data at Scale from Expert-Guided Programs", org: "中科院计算所 · 阿里 Qwen", ax: "2507.03253", st: "pre", must: 1, v: "kb", tags: ["细粒度清洗", "删除程序蒸馏"],
      one: "把强模型精修结果还原成最小删除程序，蒸馏小模型刷全量。", how: "只允许删除类操作，原文未删部分保持不变，避免幻觉。", res: "750M 模型从头训练，lighteval 平均提升 2.6%–7.2%，优于直接改写和 ProX。", take: "规则太粗、改写有幻觉，删除程序是精度与保真的折中。", ask: "为什么只允许删除，不允许改写？" },
    { q: "2025Q3", id: "kimik2", t: "Kimi K2: Open Agentic Intelligence", org: "月之暗面", ax: "2507.20534", st: "gen", must: 1, v: "kb", tags: ["MuonClip", "agentic 数据合成", "改写"],
      one: "1T 总参 / 32B 激活，15.5T token，MuonClip 全程无 loss spike；大规模合成 agentic 数据。", how: "知识与数学数据改写提升 token 利用率；合成约 2 万个工具与多智能体轨迹，模拟 + 真实执行沙箱；自评判奖励扩展到主观任务。", res: "发布时开源非思考模型中 agentic 基准领先。", take: "Agent 数据 = 工具 + 任务 + 环境 + 验证器；改写是提升 token 利用率的工业做法。", ask: "agentic 数据为什么不能只保留成功轨迹？" },
    { q: "2025Q3", id: "glm45", t: "GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models", org: "智谱", ax: "2508.06471", st: "gen", v: "kb", tags: ["ARC 统一"],
      one: "把智能体、推理、代码能力统一进一个 MoE 基座，多阶段训练。", how: "预训练后接针对代码、推理、agent 的中训练，再做专家迭代与 RL。", res: "在 agent、推理、代码综合评测上进入开源前列。", take: "中训练按能力分专项，是国内厂商的共同做法。", ask: "多能力统一时，数据配比怎么平衡？" },

    // ---------- 2025Q4 ----------
    { q: "2025Q4", id: "tongyidr", t: "Tongyi DeepResearch Technical Report", org: "阿里通义", ax: "2510.24701", st: "mid", v: "kb", tags: ["Agentic CPT", "全自动合成"],
      one: "把 agentic 继续预训练（Agentic CPT）作为 SFT、RL 之前的独立阶段。", how: "32K → 128K 两段 agentic 中训练并混入少量通用数据；全自动合成高不确定性 QA；RL 训练集按初始模型能力动态筛题。", res: "30.5B 总参 / 3.3B 激活，在多个深度研究基准上表现强。", take: "“全对全错的题剔除、会了的题移出”是 RL 数据的标准筛选法。", ask: "Agent 能力为什么要在中训练阶段就开始培养？" },
    { q: "2025Q4", id: "olmo3", t: "Olmo 3", org: "AI2", ax: "2512.13961", st: "mid", must: 1, v: "kb", tags: ["microanneal", "集成测试", "去污染"],
      one: "公开中训练数据方法论：microanneal 轻量反馈 + 集成测试 + 新去污染流程。", how: "每个候选数据集 5B + 5B 网页做 10B 微退火对比；有潜力的进入 100B 集成测试，并接 SFT 看可后训练性；预训练 5.9T、中训练 100B、长文 50–100B。", res: "Olmo 3 Think 32B 是当时最强的全开源思考模型。", take: "microanneal 是最便宜的数据价值验证方法，可以直接照搬。", ask: "怎么低成本判断一份数据该不该进中训练？" },

    // ---------- 2026Q1 ----------
    { q: "2026Q1", id: "solar", t: "Solar Open Technical Report", org: "Upstage", ax: "2601.07022", st: "gen", v: "web", tags: ["双语课程", "4.5T 合成"],
      one: "102B 双语模型，合成 4.5T 面向推理与 RL 的数据，分阶段提高合成占比。", how: "从低质到高质的多阶段课程，合成数据占比从 10% 逐步提到 64%；教育质量回归打分 + embedding 主题过滤。", res: "在韩语等低资源语言上实现较强推理能力。", take: "低资源语言的答案是“合成 + 课程”，合成占比可以随阶段上升。", ask: "合成数据占比随训练阶段上升有什么道理？" },
    { q: "2026Q1", id: "demix", t: "Decouple Searching from Training: Scaling Data Mixing via Model Merging（DeMix）", org: "小红书等", ax: "2602.00747", st: "pre", v: "web", tags: ["配比搜索", "模型合并"],
      one: "在候选数据集上分别训练组件模型，用加权模型合并近似任意配比，降低配比搜索成本。", how: "不为每个配比训练代理模型，而是合并组件模型来评估采样的配比。", res: "以更低搜索成本找到更好的配比；开源 22T token 的 DeMix 语料（ICML 2026）。", take: "配比搜索的瓶颈是代理实验成本，模型合并是新的降本思路。", ask: "为什么模型合并可以近似数据配比？有什么前提？" },
    { q: "2026Q1", id: "implicitcur", t: "On the Emergence of Implicit Curriculum in RLVR Learning Dynamics", org: "CMU 等", ax: "2602.14872", st: "post", v: "web", tags: ["隐式课程", "理论"],
      one: "混合难度训练会自然形成由易到难的隐式课程，难度谱越平滑越好。", how: "在组合推理任务上分析 transformer 的 RLVR 训练动态。", res: "难度谱有断层时，训练会出现长时间停滞再突然进步。", take: "RL 题库的难度分布要连续，不能只有简单题和超难题（ICML 2026）。", ask: "RL 题库的难度分布应该怎么设计？" },
    { q: "2026Q1", id: "megadocs", t: "Data-efficient pre-training by scaling synthetic megadocs", org: "—", ax: "2603.18534", st: "pre", must: 1, v: "web", tags: ["合成数据", "数据受限"],
      one: "把同一文档的多次改写拼成一篇“超长文档”，数据效率从 1.48× 提到 1.80×。", how: "两种构造：拼接同源改写，或插入推理过程拉长原文；与网页数据按最优比例混合。", res: "每篇 32 次生成时 megadoc 明显优于简单改写，且差距随生成量扩大；长上下文 loss 改善最多。", take: "合成数据的组织方式（拼成长文档）和内容同样重要——与关联拼接思路一致。", ask: "为什么把改写拼成长文档比分开放效果更好？" },
    { q: "2026Q1", id: "dereason", t: "DeReason: A Difficulty-Aware Curriculum Improves Decoupled SFT-then-RL Training for General Reasoning", org: "苏黎世大学等", ax: "2603.11193", st: "post", v: "web", tags: ["SFT/RL 数据分工"],
      one: "按推理强度把数据分给 SFT 和 RL：覆盖面广的给 SFT，难题留给 RL。", how: "LLM 估计推理强度，划分两个子集。", res: "在通用 STEM 上优于只 SFT、只 RL 和随机划分。", take: "后训练数据不只是“选哪些”，还有“分给哪个阶段”。", ask: "通用 STEM 为什么直接 RL 效率低？" },

    // ---------- 2026Q2 ----------
    { q: "2026Q2", id: "finephrase", t: "How Can We Synthesize High-Quality Pretraining Data? A Systematic Study of Prompt Design, Generator Model, and Source Data（FinePhrase）", org: "Hugging Face 等", ax: "2604.13977", st: "pre", must: 1, v: "web", tags: ["合成方法论", "开源数据集"],
      one: "生成超过 1T token 做受控实验：结构化格式（表格、数学题、FAQ、教程）最好，生成器超过 1B 不再有收益。", how: "系统比较改写策略、生成模型、源数据三个维度。", res: "开源 486B token 的 FinePhrase，优于已有合成基线，生成成本最多降低 30 倍（COLM 2026）。", take: "合成预训练数据不需要大模型生成，选对格式和源数据更关键。", ask: "合成预训练数据时，生成器越大越好吗？" },
    { q: "2026Q2", id: "cram", t: "Cram Less to Fit More: Training Data Pruning Improves Memorization of Facts", org: "—", ax: "2604.08519", st: "pre", v: "web", tags: ["知识记忆", "数据剪枝"],
      one: "事实信息量超过模型容量、且频率分布偏斜时，事实准确率会低于容量上限；按 loss 剪枝可缓解。", how: "从信息论角度形式化事实记忆，基于训练 loss 限制事实数量并拉平频率分布。", res: "110M 模型记住的实体事实提升 1.3 倍，相当于全量训练的 1.3B 模型。", take: "长尾知识回捞要考虑模型容量——不是塞得越多记得越多。", ask: "知识数据补得越多，模型知识就越好吗？" },
    { q: "2026Q2", id: "mixlawdc", t: "Scaling Laws for Mixture Pretraining under Data Constraints", org: "—", ax: "2605.12715", st: "pre", v: "web", tags: ["数据受限", "重复"],
      one: "稀缺目标数据与通用数据混合时，目标数据可重复 15–20 次。", how: "2000 多次训练实验，覆盖多语言、领域、质量过滤混合；提出考虑重复的混合缩放律。", res: "混合训练比单源训练能容忍高得多的重复次数。", take: "垂类数据少时不必怕重复，用通用数据“稀释”即可多用几遍。", ask: "垂类数据只有几十 B，怎么安排配比和 epoch？" },
    { q: "2026Q2", id: "synpro", t: "Generating Pretraining Tokens from Organic Data for Data-Bound Scaling（SynPro）", org: "CMU", ax: "2605.17849", st: "pre", v: "web", tags: ["合成", "RL 优化生成器"],
      one: "用 RL 优化改写与重排版生成器，奖励质量、忠实度和数据影响力。", how: "生成器随预训练进展持续更新，专门针对模型还没吸收的内容。", res: "在数据受限设定下等效 token 达到重复训练的 3.4–5.2 倍。", take: "合成数据的生成器也可以“面向模型学习状态”优化。", ask: "怎么保证改写忠实于原文？" },
    { q: "2026Q2", id: "webgraph", t: "Hubs or Fringes: Pretraining Data Selection via Web Graph Centrality（WebGraphMix）", org: "Princeton", ax: "2606.11499", st: "pre", v: "web", tags: ["网页图", "无监督选择"],
      one: "用 Common Crawl 主机级链接图的中心性划分数据：中心站点给通用抽象，边缘站点给长尾知识。", how: "计算介数中心性、Katz 中心性，调节中心与边缘数据比例。", res: "中心与边缘 1:1 混合优于均匀采样，再叠加质量分进一步提升。", take: "网页结构是和内容质量正交的新信号——和站点级扩源分析可以结合。", ask: "为什么 PageRank 没用，介数中心性有用？" },
    { q: "2026Q2", id: "dsv4", t: "DeepSeek-V4: Towards Highly Efficient Million-Token Context Intelligence", org: "DeepSeek", ax: "2606.19348", st: "gen", must: 1, v: "web", tags: ["百万上下文", "32T+", "on-policy 蒸馏"],
      one: "V4-Pro 1.6T 总参 / 49B 激活，32T+ token 预训练，原生 100 万上下文。", how: "压缩稀疏注意力 + 重度压缩注意力的混合结构；Muon 优化器；后训练先分领域培养专家，再用 on-policy 蒸馏合并成一个模型。", res: "百万上下文下单 token 计算量约为 V3.2 的 27%、KV Cache 约 10%。", take: "后训练从“一个模型做所有 RL”转向“专家分训 + 蒸馏合并”，数据也随之按领域拆分。", ask: "on-policy 蒸馏合并多个专家模型有什么好处？" },
    { q: "2026Q2", id: "interplay", t: "On the Interplay of Pre-Training, Mid-Training, and RL on Reasoning Language Models", org: "CMU", ax: "", url: "https://proceedings.mlr.press/v306/zhang26en.html", st: "mid", must: 1, v: "web", tags: ["受控实验", "ICML 2026"],
      one: "用合成推理任务做受控实验，厘清预训练、中训练、RL 各自的因果贡献。", how: "显式原子操作 + 可解析推理轨迹，系统操纵各阶段训练分布。", res: "RL 只有在预训练留有余量、且题目处在“能力边缘”时才带来真正能力提升；固定算力下中训练比单独 RL 更有效；过程奖励减少奖励作弊。", take: "为“RL 是激发还是新增”给出了条件化答案——数据岗面试的必背论文。", ask: "什么情况下 RL 能真正扩展能力边界？" },

    // ---------- 2026Q3 ----------
    { q: "2026Q3", id: "booklevel", t: "Beyond Rephrasing: Book-Level Organization Improves Synthetic Textbook Data for Mid-Training", org: "—", ax: "2607.28109", st: "mid", must: 1, v: "web", tags: ["合成教材", "组织方式"],
      one: "检索 → 聚类 → 规划目录 → 组装成完整书籍，合成 68.6 万本教材（32B token，1.5 万+学科）。", how: "设计内容对齐、长度对齐、检索池对齐等对照组，拆解收益来源。", res: "替换中训练里的自然书籍平均 +1.09；“书级组织”本身贡献约 +1.02。", take: "合成数据的收益很大一部分来自“相关内容组织在一起”——和关联拼接、megadoc 结论一致。", ask: "怎么证明收益来自组织方式而不是内容本身？" },
    { q: "2026Q3", id: "moerep", t: "Data Scarcity and Model Sparsity: Mixtures-of-Experts Overfit More to Repeated Data", org: "Stanford · Meta 等", ax: "2609.11917", st: "pre", v: "web", tags: ["MoE", "数据重复"],
      one: "MoE 比稠密模型更怕数据重复，稀疏度越高越明显（由总参数决定）。", how: "80M 到 1B 激活（8.5B 总参）多种设置，系统改变重复次数。", res: "稠密模型重复 8 倍几乎无损，MoE 从 4 倍开始退化；强掩码正则可缓解。", take: "MoE 时代的多 epoch 策略要更保守，重复上限要按 MoE 重新测。", ask: "为什么 MoE 更容易对重复数据过拟合？" },
    { q: "2026Q3", id: "autodata", t: "AutoData: Agentic Search for Pre-training Data Selection", org: "—", ax: "2609.19754", st: "pre", must: 1, v: "web", tags: ["Agent 自动化", "数据选择"],
      one: "让 agent 直接搜索可执行的数据选择算法（打分、分层、随机选择规则）。", how: "基于代理模型的验证反馈迭代改写选择算法，一晚上完成搜索。", res: "搜到的算法超过人工设计的管线，并能迁移到更大规模。", take: "数据工程本身正在被 agent 自动化——会设计评估闭环的人更值钱。", ask: "让 agent 搜数据策略，最需要防什么？" },
    { q: "2026Q3", id: "unsolvable", t: "Unlocking the Unsolvable: Teacher-Guided Curriculum for Data-Efficient RLVR", org: "—", ax: "2609.13997", st: "post", v: "web", tags: ["难题利用", "课程"],
      one: "用强模型的部分推理轨迹给“全错题”提供台阶，再逐步撤掉提示。", how: "反向课程（backward-chaining）逐步减少提示，直到模型独立解出。", res: "只用 128 道原本不可解的题，就能匹配或超过 2000 道题的 GRPO，约 16 倍数据效率（EMNLP 2026 Findings）。", take: "全错题不一定要丢，可以加提示变成“能力边缘题”。", ask: "RL 中全错的题怎么处理？" },
    { q: "2026Q3", id: "graphrl", t: "Efficient RLVR Scheduling via Graph-Structured Online Difficulty Estimation", org: "—", ax: "2608.17941", st: "post", v: "web", tags: ["在线难度估计"],
      one: "在相似样本之间共享 rollout 反馈，在线估计题目难度，按难度分配采样预算。", how: "按语义与推理相似度建样本图，用潜在难度状态和 Beta-二项模型持续更新。", res: "可插入现有调度器，在多个模型和基准上提升效果。", take: "题库的“难度标签”可以在训练中在线更新，不必提前全量探测。", ask: "RL 题目难度怎么低成本估计？" },

    // ---------- 2026Q4 ----------
    { q: "2026Q4", id: "rewritelaw", t: "Rewriting Scaling Laws for Synthetic Data with Compute and Data Constraints", org: "—", ax: "2610.31867", st: "pre", must: 1, v: "web", tags: ["改写缩放律"],
      one: "给改写数据建立缩放律：最优改写占比随算力上升，从 <10% 到 32%。", how: "把改写所花算力也计入成本，拟合模型规模、token 数、改写占比、自然数据 epoch 与 loss 的关系。", res: "外推 33 倍算力训练 22B 模型，loss 误差在 1.1% 内；用同尺寸改写器改写自身数据也能胜过只用自然数据。", take: "“合成数据该放多少”第一次有了可预测的答案。", ask: "改写数据的最优占比为什么会随算力增加？" },
    { q: "2026Q4", id: "optiselect", t: "OptiSelect: How does the Optimizer Shape Data Curriculum?", org: "—", ax: "2610.03432", st: "pre", v: "web", tags: ["在线选择", "优化器"],
      one: "在线数据选择应考虑优化器对梯度的改造；Lion、Muon 会让样本价值区分度坍缩。", how: "理论推导选择收益与优化器诱导效用分数区分度的关系。", res: "即使用 Muon 训练，用 AdamW 的对角自适应几何打分仍然最好；在改写数据上同样有效。", take: "数据选择和优化器要一起设计。", ask: "为什么优化器会影响数据选择的效果？" },
    { q: "2026Q4", id: "lare", t: "Beyond Data Schedule: Fast LLM Pretraining on Data Mixtures by Loss-Reweighting（LARE）", org: "—", ax: "2610.32141", st: "mid", v: "web", tags: ["loss 加权", "多阶段"],
      one: "不改变各领域的数据曝光，只按运行中的 loss 统计调节各领域权重。", how: "归一化的逆平方根规则平衡各领域 loss 尺度，无需额外搜索。", res: "1.5B 模型 240B token，五个基准平均 +7.84pp，GSM8K +17.06pp。", take: "配比之外，还有“loss 权重”这个独立旋钮，可能缓解多阶段训练的遗忘。", ask: "loss 加权和改变采样配比有什么本质区别？" },
    { q: "2026Q4", id: "mmmix", t: "Scaling Laws for Multimodal Data Mixtures", org: "—", ax: "2610.14423", st: "pre", v: "web", tags: ["多模态配比"],
      one: "为文本、视觉、音频三种模态推导配比缩放律。", how: "268 组 MoE 实验，457M 到 8.3B 参数，最多 150B token。", res: "音频偏“模型重”，文本和视觉需平衡；视觉、音频重复超过 2 倍收益很小；视觉强烈干扰音频（NeurIPS 2026 spotlight）。", take: "多模态数据的重复上限比文本低得多。", ask: "多模态配比和纯文本配比最大的不同？" },
  ];

  var QS = [];
  P.forEach(function (p) { if (QS.indexOf(p.q) < 0) QS.push(p.q); });
  var KEY = "llmA_qread";
  var load = function () { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) { return {}; } };
  var save = function (o) { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var qLabel = function (q) { return q.slice(0, 4) + " · Q" + q.slice(5); };
  var link = function (p) { return p.url || ("https://arxiv.org/abs/" + p.ax); };

  function chart() {
    var keys = ["pre", "mid", "post", "gen"], max = 0, cnt = {};
    QS.forEach(function (q) { cnt[q] = { pre: 0, mid: 0, post: 0, gen: 0 }; });
    P.forEach(function (p) { cnt[p.q][p.st]++; });
    QS.forEach(function (q) { var t = 0; keys.forEach(function (k) { t += cnt[q][k]; }); if (t > max) max = t; });
    var W = 680, x0 = 30, bw = (W - x0 - 10) / QS.length, H = 190, base = 150, k = 120 / max, s = "";
    for (var g = 0; g <= max; g += 2) { var y = base - g * k; s += '<line x1="' + x0 + '" y1="' + y.toFixed(1) + '" x2="' + (W - 6) + '" y2="' + y.toFixed(1) + '" class="f-ax"/><text x="' + (x0 - 6) + '" y="' + (y + 4).toFixed(1) + '" text-anchor="end" class="f-s">' + g + "</text>"; }
    QS.forEach(function (q, i) {
      var x = x0 + i * bw + bw * 0.18, w = bw * 0.64, y = base;
      keys.forEach(function (kk) { var h = cnt[q][kk] * k; if (h > 0) { y -= h; s += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + w.toFixed(1) + '" height="' + (h - 1).toFixed(1) + '" rx="3" style="fill:' + ST[kk].c + '" opacity=".85"><title>' + qLabel(q) + " " + ST[kk].n + " " + cnt[q][kk] + "</title></rect>"; } });
      s += '<text x="' + (x + w / 2).toFixed(1) + '" y="' + (base + 15) + '" text-anchor="middle" class="f-s" style="font-size:10.5px">' + q.slice(2, 4) + "Q" + q.slice(5) + "</text>";
    });
    var lx = x0;
    keys.forEach(function (kk) { s += '<rect x="' + lx + '" y="' + (H - 14) + '" width="11" height="11" rx="2" style="fill:' + ST[kk].c + '"/><text x="' + (lx + 16) + '" y="' + (H - 4) + '" class="f-s">' + ST[kk].n + "</text>"; lx += 128; });
    return '<svg viewBox="0 0 680 ' + H + '" xmlns="http://www.w3.org/2000/svg">' + s + "</svg>";
  }

  function card(p, rd) {
    var s = ST[p.st], done = !!rd[p.id];
    return '<div class="pcard' + (done ? " read" : "") + '" data-id="' + p.id + '" style="border-left-color:' + s.c + '">' +
      '<div class="pc-top"><span class="pc-st" style="background:' + s.s + ";color:" + s.c + '">' + s.n + "</span>" + (p.must ? '<span class="pc-must">★ 必读</span>' : "") + (p.v === "web" ? '<span class="pc-v" title="2026 年论文：内容来自 2026-11-18 检索到的 arXiv 摘要">2026 · 摘要核对</span>' : "") + '<span class="pc-org">' + esc(p.org) + "</span></div>" +
      '<a class="pc-t" href="' + link(p) + '" target="_blank" rel="noopener">' + esc(p.t) + "</a>" +
      '<div class="pc-one">' + esc(p.one) + "</div>" +
      '<div class="pc-tags">' + p.tags.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + (p.ax ? '<span class="pc-ax">arXiv ' + p.ax + "</span>" : "") + "</div>" +
      '<div class="pc-det">' +
      '<div><b>方法</b>' + esc(p.how) + "</div><div><b>结果</b>" + esc(p.res) + "</div>" +
      '<div class="hl"><b>对数据岗的启发</b>' + esc(p.take) + '</div><div class="hl2"><b>面试可能这样问</b>' + esc(p.ask) + "</div></div>" +
      '<div class="pc-act"><button class="btn pc-open">精读卡</button><button class="btn pc-read ' + (done ? "got" : "") + '">' + (done ? "✓ 已读" : "标记已读") + '</button><a class="btn" href="' + link(p) + '" target="_blank" rel="noopener">原文 ↗</a></div></div>';
  }

  function page(app) {
    var rd = load(), st = "all", onlyMust = false, onlyUnread = false, kw = "", focus = "all";
    var total = P.length, musts = P.filter(function (p) { return p.must; });
    app.innerHTML = '<div id="qroot">' +
      '<div class="crumb"><a href="#/">首页</a> / 论文季刊</div>' +
      '<section class="qhero"><div class="qh-l"><div class="qh-k">QUARTERLY PAPERS</div><h1>📚 论文季刊：每季度必读的数据论文</h1>' +
      "<p>从 2024 Q1 到 2026 Q4，按季度精选<b>预训练数据、Mid-training、后训练 / RL 数据</b>相关论文。每篇一张精读卡：<b>一句话 · 方法 · 结果 · 对数据岗的启发 · 面试可能这样问</b>。</p>" +
      '<p class="muted">2025 年及以前为经典论文；2026 年论文内容来自 2026-11-18 检索到的 arXiv 摘要，细节以原文为准。</p></div>' +
      '<div class="qh-r"><div class="qkpi"><b>' + QS.length + "</b><span>个季度</span></div><div class=\"qkpi\"><b>" + total + "</b><span>篇论文</span></div><div class=\"qkpi\"><b>" + musts.length + '</b><span>篇必读</span></div><div class="qkpi"><b id="qk-read">0</b><span>已读</span></div>' +
      '<div class="qprog"><i id="qk-bar"></i></div></div></section>' +
      "<h2>三年趋势一图看懂</h2><div class=\"card figcard\">" + chart() + '<div class="note">每根柱子是一个季度的入选论文数，颜色代表方向：2025 Q1 起后训练 / RL 爆发，2026 年合成数据与“数据组织方式”成为预训练的新主题。</div></div>' +
      '<h2>季度时间轴</h2><div class="qline" id="qline"></div>' +
      '<div class="qbar"><div class="chips" id="qst"><button class="chip on" data-k="all">全部方向</button>' + Object.keys(ST).map(function (k) { return '<button class="chip" data-k="' + k + '">' + ST[k].n + "</button>"; }).join("") + '</div>' +
      '<div class="chips"><button class="chip" id="qmust">★ 只看必读</button><button class="chip" id="qunread">只看未读</button><button class="chip" id="qall">展开全部精读卡</button></div>' +
      '<input id="qkw" class="search" placeholder="搜论文名、机构或关键词，如 合成、MoE、RLVR、去重…"></div>' +
      '<div id="qbody"></div>' +
      '<h2>📌 必读清单（' + musts.length + ' 篇）</h2><div class="card"><ol class="mustlist">' + musts.map(function (p) { return '<li><span class="ml-q">' + qLabel(p.q) + '</span><a href="#/quarterly" data-jump="' + p.id + '">' + esc(p.t.split("：")[0].split(": ")[0]) + '</a><span class="muted"> — ' + esc(p.one) + "</span></li>"; }).join("") + "</ol></div>" +
      '<p class="disclaimer">阅读进度保存在本机浏览器。想继续补充新季度论文，告诉小白即可。</p></div>';

    function stats() {
      var n = 0; P.forEach(function (p) { if (rd[p.id]) n++; });
      document.getElementById("qk-read").textContent = n;
      document.getElementById("qk-bar").style.width = (n / total * 100).toFixed(1) + "%";
      document.getElementById("qline").innerHTML = '<button class="qpill' + (focus === "all" ? " on" : "") + '" data-q="all"><b>全部</b><span>' + total + " 篇</span></button>" + QS.map(function (q) {
        var ps = P.filter(function (p) { return p.q === q; }), r = ps.filter(function (p) { return rd[p.id]; }).length;
        return '<button class="qpill' + (focus === q ? " on" : "") + '" data-q="' + q + '"><b>' + qLabel(q) + "</b><span>" + esc(QT[q].name) + '</span><i style="width:' + (r / ps.length * 100).toFixed(0) + '%"></i></button>';
      }).join("");
    }
    function draw() {
      var html = "";
      QS.slice().reverse().forEach(function (q) {
        if (focus !== "all" && focus !== q) return;
        var ps = P.filter(function (p) { return p.q === q && (st === "all" || p.st === st) && (!onlyMust || p.must) && (!onlyUnread || !rd[p.id]) && (!kw || (p.t + p.org + p.one + p.tags.join(" ") + p.how + p.take).toLowerCase().indexOf(kw) >= 0); });
        if (!ps.length) return;
        var th = QT[q];
        html += '<section class="qsec" id="sec-' + q + '"><div class="qs-h"><div class="qs-q">' + q.slice(0, 4) + '<span>Q' + q.slice(5) + '</span></div><div class="qs-m"><div class="qs-n">' + esc(th.name) + '</div><div class="qs-kw">' + th.kw.map(function (k) { return "<span>" + esc(k) + "</span>"; }).join("") + '</div><div class="qs-s">' + esc(th.sum) + "</div></div></div>" +
          '<div class="pgrid">' + ps.map(function (p) { return card(p, rd); }).join("") + "</div></section>";
      });
      document.getElementById("qbody").innerHTML = html || '<div class="empty">没有符合条件的论文</div>';
    }
    stats(); draw();
    document.getElementById("qroot").addEventListener("click", function (e) {
      var t = e.target, c;
      if ((c = t.closest(".qpill"))) { focus = c.getAttribute("data-q"); stats(); draw(); return; }
      if ((c = t.closest("#qst .chip"))) { st = c.getAttribute("data-k"); Array.prototype.forEach.call(document.querySelectorAll("#qst .chip"), function (b) { b.classList.toggle("on", b === c); }); draw(); return; }
      if (t.id === "qmust") { onlyMust = !onlyMust; t.classList.toggle("on", onlyMust); draw(); return; }
      if (t.id === "qunread") { onlyUnread = !onlyUnread; t.classList.toggle("on", onlyUnread); draw(); return; }
      if (t.id === "qall") { var open = !t.classList.contains("on"); t.classList.toggle("on", open); Array.prototype.forEach.call(document.querySelectorAll(".pcard"), function (pc) { pc.classList.toggle("open", open); }); return; }
      if ((c = t.closest(".pc-open"))) { c.closest(".pcard").classList.toggle("open"); return; }
      if ((c = t.closest(".pc-read"))) { var id = c.closest(".pcard").getAttribute("data-id"); if (rd[id]) delete rd[id]; else rd[id] = 1; save(rd); c.classList.toggle("got", !!rd[id]); c.textContent = rd[id] ? "✓ 已读" : "标记已读"; c.closest(".pcard").classList.toggle("read", !!rd[id]); stats(); return; }
      if ((c = t.closest("[data-jump]"))) {
        e.preventDefault(); var pid = c.getAttribute("data-jump"); focus = "all"; st = "all"; onlyMust = false; onlyUnread = false; kw = ""; document.getElementById("qkw").value = ""; stats(); draw();
        var el = document.querySelector('.pcard[data-id="' + pid + '"]'); if (el) { el.classList.add("open"); el.scrollIntoView({ behavior: "smooth", block: "center" }); el.classList.add("flash"); setTimeout(function () { el.classList.remove("flash"); }, 1600); }
      }
    });
    document.getElementById("qkw").addEventListener("input", function (e) { kw = e.target.value.trim().toLowerCase(); draw(); });
  }

  window.ROUTES = window.ROUTES || {};
  window.ROUTES.quarterly = page;
  window.QPAPERS = { list: P, themes: QT, quarters: QS };
})();

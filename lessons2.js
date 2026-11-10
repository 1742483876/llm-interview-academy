// 大模型面试学堂 · 课程（第二部分：Mid-training + 后训练 + 评估）
LESSONS.push(
  // ===================== Mid-training =====================
  {
    id: "midtrain", cat: "mid", level: 3, title: "什么是 Mid-training：退火、阶段配比与“高质量数据窗口”",
    one: "Mid-training 指预训练主体之后、SFT 之前的一段继续预训练：学习率退火、数据质量与领域集中度提升、常伴随上下文变长——用较少 token 定向拉升知识、推理、代码与长文本能力。",
    fig: "stages",
    points: `<ul>
      <li><b>定义没有统一口径</b>：有的报告叫 annealing（退火），有的叫 stage 2 / decay phase / continued pretraining。共性是“<b>学习率下降 + 数据分布切换到高质量/目标能力</b>”。</li>
      <li><b>为什么有效</b>：高学习率阶段模型在噪声中探索；退火阶段学习率降低，最后看到的数据对最终参数影响最大（近因效应），把最好的数据放在这里“性价比”最高。</li>
      <li><b>典型数据</b>：高质量网页（分类器高分档）、教科书/百科、数学与代码、合成 QA、少量指令/SFT 风格数据、长文档。</li>
      <li><b>Llama 3</b>：预训练最后 40M tokens 学习率线性退火到 0，同时上采样高质量数学/代码；8B 在 GSM8K/MATH 上分别提升 24.0%/6.4%，但 405B 几乎无提升（大模型已经学得够好）。</li>
      <li><b>MiniCPM</b>：WSD 的衰减段混入高质量与 SFT 数据，效果远超只在 SFT 阶段加入。</li>
      <li><b>OLMo 2</b>：中训练用 Dolmino 混合（高质量网页 + 数学合成/过滤数据 + 百科等），并对多次不同数据顺序的退火结果做权重平均（model soup）。</li>
      <li><b>Qwen3</b>：S2 约 5T 高质量 tokens（STEM、代码、推理、合成），并加速学习率衰减；S3 做长上下文。</li>
      <li><b>风险</b>：中训练数据与 SFT/评测分布过近会造成“刷榜”；混入指令数据会让基座“对话化”，影响作为通用基座的可塑性。</li></ul>`,
    papers: [
      ["MiniCPM", "2024", "WSD 调度 + 衰减段加入高质量与 SFT 数据，小模型能力显著提升。"],
      ["Llama 3 Herd of Models", "2024", "Annealing 阶段上采样高质量数据；也用退火实验评估新数据集价值。"],
      ["2 OLMo 2 Furious", "2024/2025", "明确提出 mid-training 阶段与 Dolmino Mix；多次退火 + model soup。"],
      ["Qwen3 Technical Report", "2025", "三阶段预训练：通用 → 推理强化 → 长上下文。"],
      ["Does your data spark joy? Performance gains from domain upsampling at the end of training", "2024", "在训练末尾上采样领域数据可低成本提升目标基准，也可用作数据价值评估。"],
    ],
    answer: `<p>面试回答模板：<b>是什么</b>（学习率退火 + 数据切换）→ <b>为什么</b>（末期数据影响大、性价比高）→ <b>怎么做</b>（数据选择、token 量级通常为总预算的 1%–10%、配比、与 WSD 结合）→ <b>怎么评估</b>（基座基准 + 做一轮轻量 SFT/RL 后的效果，因为中训练的价值最终要体现在后训练之后）→ <b>风险</b>（污染、过拟合评测、遗忘）。</p>`,
    pitfall: `<ul><li>误区：mid-training 只是“换个学习率继续训”。关键在数据——它是数据团队对模型能力影响最直接的环节。</li>
      <li>追问：<b>中训练里放指令数据好不好</b>？对基准和后续 SFT 有帮助，但会降低基座的“纯度”，研究型/开源基座常有争议；工业界多数会放适量。</li>
      <li>追问：<b>怎么判断该放多少 token</b>？在多个 token 量上做退火实验画曲线，找收益饱和点，同时监控通用能力是否回退。</li></ul>`,
  },
  {
    id: "longctx", cat: "mid", level: 3, title: "长上下文扩展：PI、NTK、YaRN、ABF 与长文本数据工程",
    one: "长上下文 = 位置编码改造（让模型认识更远的位置）+ 少量长文本继续训练（让模型学会用远距离信息），数据上的关键是“保持领域配比、在每个领域内上采样长文档”。",
    points: `<ul>
      <li><b>Position Interpolation（PI）</b>：把位置 m 缩放成 m·L/L′，把新长度“压”进训练过的范围；简单但高频分量被压缩，短文本能力受损。</li>
      <li><b>NTK-aware</b>：不缩位置，而是放大 RoPE 的 base——高频（局部）几乎不变、低频（远距离）被插值。</li>
      <li><b>YaRN</b>：分频段处理（NTK-by-parts）+ 注意力温度缩放，少量数据微调即可扩到 64K–128K。</li>
      <li><b>ABF（Adjusted Base Frequency）</b>：直接把 base 从 10000 调大（如 500000、1000000）再继续训练；Llama 2 Long、Llama 3、Qwen3 等都用。</li>
      <li><b>渐进扩展</b>：Llama 3 从 8K 分 6 个阶段扩到 128K，用约 800B tokens；DeepSeek-V3 用 YaRN 分两段 4K→32K→128K。</li>
      <li><b>数据工程</b>（Fu et al. 2024）：只需 1–5B tokens 继续训练；<b>按源上采样长文档、保持原领域配比</b>最好，单纯上采样书籍等长文本源会伤其他能力。</li>
      <li><b>长文本数据来源</b>：书籍、论文、代码仓库（按依赖拼接）、长网页；合成长依赖任务（多文档 QA、检索、摘要）；同时混入短文本防止短能力回退。</li>
      <li><b>评测</b>：大海捞针（NIAH）只是入门；RULER（多针、追踪、聚合）、LongBench、∞Bench 更能反映真实能力；注意 Lost in the Middle 现象。</li></ul>`,
    papers: [
      ["Extending Context Window via Positional Interpolation（Meta）", "2023", "PI：位置线性插值 + 少量微调到 32K。"],
      ["YaRN", "2023", "NTK-by-parts + 温度缩放，数据与步数更省。"],
      ["Effective Long-Context Scaling of Foundation Models（Llama 2 Long）", "2023", "ABF：调大 RoPE base；长数据质量比长度占比更重要。"],
      ["Data Engineering for Scaling LMs to 128K Context（Fu et al.）", "2024", "按领域保持配比、域内上采样长文档，1–5B tokens 即可。"],
      ["Lost in the Middle", "2023", "信息放在上下文中间时，模型利用率显著下降。"],
      ["RULER", "2024", "很多号称 128K 的模型，有效长度远小于标称长度。"],
    ],
    answer: `<p>拆成“位置编码 + 数据 + 评测”三块答。数据岗重点讲：长文本数据如何构造（真实长文档 + 拼接 + 合成长依赖任务）、配比（长短混合、保持领域分布）、质量（长文档更难过滤，要做章节级去重和完整性检查），以及如何证明“真的用到了远处信息”而不是只在 NIAH 上好看。</p>`,
    pitfall: `<ul><li>误区：把很多短文档随机拼接就是长文本数据。随机拼接没有长距离依赖，模型学不会用远处信息；最好按相关性拼接或使用文档内长依赖。</li>
      <li>追问：<b>长上下文训练为什么要用 document mask</b>？防止拼接的不相关文档互相注意产生噪声（Llama 3 在预训练中使用）。</li>
      <li>追问：<b>扩完长度短文本掉点怎么办</b>？混入短数据、降低长数据占比、PI 换成 NTK/YaRN、最后做短文本退火。</li></ul>`,
  },
  {
    id: "cpt", cat: "mid", level: 2, title: "领域持续预训练（CPT）：学新知识又不忘旧本领",
    one: "CPT 在通用基座上用领域语料继续预训练；核心矛盾是“领域增益 vs 灾难性遗忘”，标准解法是学习率重新预热+衰减、混入通用数据回放、控制领域数据比例。",
    points: `<ul>
      <li><b>DAPT / TAPT</b>：先在领域语料继续训（DAPT），再在任务无标注文本上训（TAPT），两者叠加最好。</li>
      <li><b>学习率</b>：从已衰减的 checkpoint 出发要 re-warm 再 re-decay；学习率越大学新越快、忘旧越多。</li>
      <li><b>回放（replay）</b>：混入一定比例（常见 5%–30%）的原始通用预训练数据，有效抑制遗忘。</li>
      <li><b>配比</b>：领域数据比例过高 → 通用能力（尤其指令遵循、推理）下滑；常见做法是做比例曲线实验找拐点。</li>
      <li><b>知识注入难题</b>：模型“读过”不等于“学会”，同一事实需要多种表述/多次出现；可用改写、QA 化增强（知识需要多样化重复）。</li>
      <li><b>CPT 还是 SFT/RAG</b>：知识量大且稳定 → CPT；需要实时更新或可追溯 → RAG；只需格式和风格 → SFT。</li></ul>`,
    papers: [
      ["Don't Stop Pretraining（Gururangan et al.）", "2020", "DAPT + TAPT 在多领域分类任务上稳定提升。"],
      ["Simple and Scalable Strategies to Continually Pre-train LLMs（Ibrahim et al.）", "2024", "re-warm + re-decay + 少量 replay，效果可匹配用全部数据从头训练。"],
      ["Physics of Language Models Part 3.1（Allen-Zhu & Li）", "2023", "知识要在预训练中以多样化表述出现才能被可靠提取；数据增强（改写）至关重要。"],
      ["Synthetic Continued Pretraining（EntiGraph）", "2024", "小语料上通过实体关系合成大量多样化文本，显著提升知识习得。"],
    ],
    answer: `<p>按项目方式答：“目标领域 → 语料构成（来源、规模、质量标准）→ 配比与回放比例实验 → 学习率策略 → 评测（领域基准 + 通用基准双看）→ 结论”。医学类经历可以举：教材/指南/文献/脱敏病历的配比，如何防止过时知识，以及通用能力掉点控制在多少以内。</p>`,
    pitfall: `<ul><li>误区：CPT 后直接用。CPT 会冲掉部分指令能力，通常需要重新 SFT/对齐，或者在 base 上 CPT 后再合并对齐向量。</li>
      <li>追问：<b>怎么衡量遗忘</b>？保留一组通用基准 + 通用验证集困惑度，CPT 前后对比。</li></ul>`,
  },
  {
    id: "reason-mid", cat: "mid", level: 3, title: "为 RL 打底：推理型 Mid-training 与“认知行为”",
    one: "同样的 RL 配方，Qwen 基座涨得飞快、Llama 基座却不太动——差别在于基座是否在预训练/中训练中见过足够的数学推理与“验证、回溯”式思维数据。中训练决定了 RL 的天花板。",
    points: `<ul>
      <li><b>现象</b>：R1-Zero 式 RL 在 Qwen2.5 上容易复现“aha moment”，在 Llama 上常出现回答变长却不涨分、甚至崩溃。</li>
      <li><b>认知行为假说</b>（Gandhi et al. 2025）：有效自我提升依赖 4 种行为——验证、回溯、子目标设定、逆向推理。Qwen 基座天然具备，Llama 很少；用含这些行为的数据“预热”Llama 后，RL 提升能追上 Qwen。甚至<b>推理过程正确但答案错误</b>的数据也有效，关键是行为模式。</li>
      <li><b>OctoThinker</b>（2025）：在 Llama 上系统研究中训练——高质量数学语料（如 MegaMath-Web-Pro）显著提升 RL 后效果；QA 式数据（尤其长 CoT）有帮助但可能导致冗长和不稳定；加入指令数据能进一步释放 QA 数据的价值；提出“先稳定、后衰减（Stable-then-Decay）”两阶段中训练。</li>
      <li><b>Qwen2.5-Math</b>：用约 1T tokens 的数学语料（含 Qwen2-Math-Instruct 合成数据）对基座继续预训练，再做 SFT + GRPO。</li>
      <li><b>数据设计启示</b>：中训练要包含 (1) 足量、格式保真的数学/代码；(2) 逐步推理的 QA；(3) 带自我检查与纠错的推理轨迹；(4) 控制长度避免“学会啰嗦”。</li></ul>`,
    papers: [
      ["Cognitive Behaviors that Enable Self-Improving Reasoners（Gandhi et al.）", "2025", "验证/回溯/子目标/逆推四种行为决定 RL 是否能自我提升。"],
      ["OctoThinker: Mid-training Incentivizes RL Scaling", "2025", "中训练数据（数学语料、QA、指令）决定 Llama 系基座的 RL 可扩展性。"],
      ["Qwen2.5-Math Technical Report", "2024", "数学专用继续预训练 + 自我改进（RM 引导的拒绝采样、GRPO）。"],
      ["Understanding R1-Zero-Like Training（Dr. GRPO）", "2025", "Qwen2.5 基座在 RL 前就已表现出自我反思，“aha”不全是 RL 新学会的。"],
    ],
    answer: `<p>这是 2025–2026 面试中区分度很高的题。答法：先抛现象（Qwen vs Llama RL 差异）→ 解释机制（RL 主要放大基座已有的行为分布，采不到就学不到）→ 给出数据方案（数学语料 + 带反思的推理轨迹 + 适量指令数据，长度可控）→ 评估方法（中训练后接固定 RL 配方看 RL 曲线斜率，而不只看基座分数）。</p>`,
    pitfall: `<ul><li>误区：中训练放越多长 CoT 越好。过多会导致基座输出冗长、RL 阶段长度失控、训练不稳。</li>
      <li>追问：<b>评估中训练数据的正确指标是什么</b>？“RL 之后的效果/RL 曲线斜率”比“中训练后的基座 few-shot 分数”更关键。</li></ul>`,
  },

  // ===================== 后训练 =====================
  {
    id: "sft", cat: "post", level: 2, title: "SFT 机制：模板、loss mask、packing 与“表层对齐假说”",
    one: "SFT 用 (指令, 回答) 对做 next-token 训练，只在回答部分算 loss；它主要教模型“以什么格式和风格输出”，知识主要来自预训练。",
    points: `<ul>
      <li><b>Chat template</b>：system/user/assistant 角色标记与特殊 token；训练与推理模板必须一致，否则效果骤降。</li>
      <li><b>Loss mask</b>：只对 assistant 回复计算损失；多轮对话可对每轮回复都计算（更高效）。</li>
      <li><b>Packing</b>：把多条短样本拼成一条长序列提高效率，需配合 attention mask 防止样本间串扰，以及正确的位置编号。</li>
      <li><b>超参</b>：学习率比预训练小一个量级（如 1e-5 ~ 2e-5 对全参）、2–3 epoch，过多 epoch 会过拟合、损害多样性。</li>
      <li><b>LoRA</b>：只训练低秩增量矩阵，省显存；对“格式/风格”足够，对“大量新知识”不如全参。</li>
      <li><b>表层对齐假说</b>（LIMA）：模型的知识与能力几乎全在预训练中习得，对齐只是学会与用户交互的格式/风格——所以少量高质量数据即可。</li>
      <li>SFT 的局限：只模仿正例、不知道什么是错的；容易学到 <b>幻觉</b>（让模型回答它不知道的知识）。</li></ul>`,
    papers: [
      ["LIMA: Less Is More for Alignment", "2023", "1000 条精选样本微调 65B LLaMA，人评接近 GPT-4 的 43%（持平或更好）。"],
      ["InstructGPT", "2022", "SFT → RM → PPO 三步范式；1.3B InstructGPT 被人偏好胜过 175B GPT-3。"],
      ["LoRA", "2021", "低秩适配：冻结原权重，训练 ΔW = BA。"],
      ["Does Fine-Tuning LLMs on New Knowledge Encourage Hallucinations?（Gekhman et al.）", "2024", "SFT 中引入模型未知的新知识学得慢，且会增加幻觉倾向。"],
    ],
    answer: `<p>重点回答“SFT 学到了什么、学不到什么”：学到格式、风格、指令遵循和对已有知识的调用方式；学不到大量新知识，反而强行灌输未知事实会诱发幻觉。这自然引出“所以 SFT 数据要对齐模型已有知识”的数据设计原则。</p>`,
    pitfall: `<ul><li>追问：<b>SFT loss 为什么只算回复</b>？指令部分是条件而非目标，训练它会浪费容量、让模型学会生成提问。但也有研究显示在少数场景对指令算 loss 无害甚至有益。</li>
      <li>追问：<b>SFT 后模型多样性下降</b>？常见，可通过数据多样性、降低 epoch、后续 RL 采样温度等缓解。</li></ul>`,
  },
  {
    id: "sft-data", cat: "post", level: 3, title: "SFT 数据：构造、筛选与配比",
    one: "SFT 数据的三要素是 质量 > 多样性 > 数量；构造靠人工/自举生成/进化改写/拒绝采样，筛选靠质量与难度打分 + 多样性去重。",
    points: `<ul>
      <li><b>构造方法</b>：
        <ul><li>人工撰写（贵、质量高、适合种子和安全数据）。</li>
        <li><b>Self-Instruct</b>：175 条种子任务 → 模型生成新指令与回答 → 过滤相似；Alpaca 用它造了 52K。</li>
        <li><b>Evol-Instruct</b>（WizardLM）：深度进化（加约束、加推理步骤、具体化）+ 广度进化（新主题），逐步提升复杂度。</li>
        <li><b>Magpie</b>：只给对齐模型 chat 模板的“用户开头”，让其自动补出指令，再生成回答，零种子造大规模数据。</li>
        <li><b>拒绝采样</b>：同一问题采样多个回答，用奖励模型/验证器选最好的（Llama 3、R1 都用）。</li>
        <li><b>Persona 驱动</b>：用大量人设生成多样化问题（PersonaHub）。</li></ul></li>
      <li><b>筛选方法</b>：
        <ul><li>LLM 打分过滤（AlpaGasus 从 52K 选 9K 效果更好）。</li>
        <li><b>IFD 指标</b>：IFD = 有指令时回答的损失 / 无指令时回答的损失，越高说明指令越“难”、越有信息量。</li>
        <li><b>Deita</b>：复杂度分 × 质量分 + embedding 多样性过滤，6K 条达到强基线。</li>
        <li><b>LESS</b>：基于梯度相似度为目标任务选数据，只用 5% 数据就能超过全量。</li></ul></li>
      <li><b>配比</b>：数学、代码、推理、通用对话、写作、多轮、指令遵循（格式约束）、安全拒答、多语言；Tülu 3 开源了约 94 万条的完整混合。</li>
      <li><b>必做</b>：去污染、去重、回答正确性校验（数学/代码可执行验证）、长度分布控制、安全审核。</li></ul>`,
    papers: [
      ["Self-Instruct", "2022", "用模型自身自举生成指令数据。"],
      ["WizardLM（Evol-Instruct）", "2023", "进化式提升指令复杂度。"],
      ["From Quantity to Quality（IFD / Cherry LLM）", "2023", "用 IFD 自动挑选高价值指令样本。"],
      ["What Makes Good Data for Alignment?（Deita）", "2023", "复杂度、质量、多样性三维度选数据。"],
      ["Magpie", "2024", "从对齐模型中“抽取”指令数据，无需种子与提示工程。"],
      ["Tülu 3", "2024", "全开源后训练配方：SFT 混合 + on-policy DPO + RLVR。"],
    ],
    answer: `<p>能把“构造 → 筛选 → 配比 → 校验”串成闭环，并能说出各自的代价。结合数据背景可加：“我会建一个能力标签体系（任务类型 × 领域 × 难度 × 语言），用来量化 SFT 数据的覆盖度，找缺口定向合成，这和预训练数据分类覆盖率是同一套方法论。”</p>`,
    pitfall: `<ul><li>误区：用最强模型蒸馏的数据一定最好。学生与老师差距过大时，学生学不动（learnability gap），中等强度老师或筛选“学生可学”的样本反而更好。</li>
      <li>追问：<b>SFT 数据越多越好吗</b>？对格式/风格不是；对数学、代码等能力类任务，数量与难度仍然有显著 scaling。</li></ul>`,
  },
  {
    id: "rlhf", cat: "post", level: 3, title: "RLHF 与奖励模型：InstructGPT 三步走、PPO、reward hacking",
    one: "RLHF = 训练奖励模型模拟人类偏好 + 用 PPO 在 KL 约束下最大化奖励；难点是奖励模型被“钻空子”（reward hacking）和 PPO 的工程复杂度。",
    points: `<ul>
      <li><b>三步</b>：SFT → 奖励模型（RM） → PPO。</li>
      <li><b>RM 训练</b>：Bradley-Terry 模型，损失 −log σ(r(x,y_w) − r(x,y_l))；通常从 SFT 模型初始化，把语言头换成标量头。</li>
      <li><b>RL 目标</b>：max E[r(x,y)] − β·KL(π‖π_ref)，KL 防止模型偏离太远、钻 RM 漏洞。</li>
      <li><b>PPO</b>：4 个模型（策略、参考、奖励、价值/critic）；用 GAE 估计优势；裁剪比率 clip(ρ, 1−ε, 1+ε) 限制更新幅度。</li>
      <li><b>Reward hacking</b>：模型学会 RM 偏好的表面特征——更长、更多列表、谄媚、拒答等，奖励上升但真实质量下降。缓解：KL、奖励模型集成、长度惩罚、RM 持续更新、过程监督。</li>
      <li><b>对齐税（alignment tax）</b>：RLHF 后某些 NLP 基准掉点，InstructGPT 用 PPO-ptx（混入预训练梯度）缓解。</li>
      <li><b>生成式 RM / LLM-as-judge RM</b>：让 RM 先写评语再打分，可解释性和泛化更好。</li></ul>`,
    fig: "rl",
    papers: [
      ["Training LMs to Follow Instructions with Human Feedback（InstructGPT）", "2022", "RLHF 范式；对齐小模型可胜过未对齐大模型。"],
      ["Proximal Policy Optimization（PPO）", "2017", "裁剪目标的策略梯度算法。"],
      ["Scaling Laws for Reward Model Overoptimization（Gao et al.）", "2022", "优化代理奖励越多，真实奖励先升后降；RM 越大越抗过优化。"],
      ["A Long Way to Go: Length Correlations in RLHF", "2023", "RLHF 的提升有相当部分来自回答变长。"],
      ["Constitutional AI（Anthropic）", "2022", "用一组原则让 AI 自我批评修改 + AI 反馈做 RL（RLAIF）。"],
    ],
    answer: `<p>必会推导：RM 的 BT 损失、RL 目标的 KL 项含义、PPO 的 clip。然后讲清楚 PPO 为何难（4 个模型的显存、采样慢、超参敏感、critic 难训），以此自然过渡到 DPO（去 RM 和采样）与 GRPO（去 critic）。</p>`,
    pitfall: `<ul><li>追问：<b>KL 惩罚放在 reward 里还是 loss 里</b>？InstructGPT/PPO 通常放在每 token 奖励里；GRPO 直接加在 loss 里。</li>
      <li>追问：<b>RM 的准确率一般多少</b>？人类偏好数据上常见 65%–75%，标注者间一致性本身也就 70% 左右。</li></ul>`,
  },
  {
    id: "dpo", cat: "post", level: 3, title: "DPO 家族：DPO、IPO、KTO、SimPO、ORPO",
    one: "DPO 发现 KL 约束下的最优策略有闭式解，于是把奖励模型“藏”进策略里，直接在偏好对上做分类式训练；后续变体分别解决过拟合、无配对数据、长度偏差和参考模型开销。",
    points: `<ul>
      <li><b>推导</b>：最优策略 π*(y|x) ∝ π_ref(y|x)·exp(r(x,y)/β) ⇒ r(x,y) = β·log(π*(y|x)/π_ref(y|x)) + β·log Z(x)；代入 BT 模型，Z 被消掉。</li>
      <li><b>DPO 损失</b>：−log σ( β·[log π(y_w)/π_ref(y_w) − log π(y_l)/π_ref(y_l)] )。</li>
      <li><b>IPO</b>：偏好确定性很强时 DPO 会把 margin 推向无穷导致过拟合，IPO 改为平方损失，回归到固定 margin。</li>
      <li><b>KTO</b>：基于前景理论，只需“好/坏”二元标签，无需成对数据。</li>
      <li><b>SimPO</b>：用<b>长度归一化的平均 log 概率</b>当隐式奖励，去掉参考模型，加目标 margin γ；缓解长度偏差。</li>
      <li><b>ORPO</b>：在 SFT 损失上加 odds ratio 惩罚项，单阶段完成 SFT + 偏好对齐，无参考模型。</li>
      <li><b>已知问题</b>：chosen 与 rejected 的似然往往同时下降（“似然位移”）；对离线数据分布敏感；容易变长。</li>
      <li><b>迭代/在线 DPO</b>：每轮用当前模型采样、RM 打分构造新偏好对，再训，接近 on-policy（Llama 3、Tülu 3 做法）。</li></ul>`,
    papers: [
      ["Direct Preference Optimization（DPO）", "2023", "“你的语言模型其实是个奖励模型”，无需 RM 与 RL 采样。"],
      ["A General Theoretical Paradigm（IPO）", "2023", "指出 DPO 在确定性偏好下的过拟合并提出 IPO。"],
      ["KTO", "2024", "用非成对二元反馈做对齐。"],
      ["SimPO", "2024", "无参考模型、长度归一化奖励 + margin，AlpacaEval 2 上优于 DPO。"],
      ["ORPO", "2024", "单阶段 odds-ratio 偏好优化。"],
      ["Is DPO Superior to PPO for LLM Alignment?（Xu et al.）", "2024", "调好的 PPO 在多项任务上优于 DPO；DPO 易受分布偏移影响。"],
    ],
    answer: `<p>白板推导 DPO 是高频题，要能 3 分钟写完。之后说取舍：DPO 简单稳定、资源省，但离线、吃数据分布；PPO/GRPO 在线、上限高、贵。实际工业做法常是“SFT → 迭代 DPO（or 离线 DPO）→ 在线 RL”的组合（如 Qwen2.5 的离线 DPO + 在线 GRPO）。</p>`,
    pitfall: `<ul><li>误区：DPO 没有奖励模型所以不会 reward hacking。DPO 同样会过优化，表现为变长、似然位移。</li>
      <li>追问：<b>β 的作用</b>？β 越大越贴近参考模型（约束强），越小越激进。</li>
      <li>追问：<b>DPO 前为什么要先 SFT</b>？让参考模型和偏好数据分布接近，否则 π_ref 对偏好回答概率极低，训练不稳。</li></ul>`,
  },
  {
    id: "pref-data", cat: "post", level: 2, title: "偏好数据怎么造：人类反馈、AI 反馈、On-policy",
    one: "偏好数据的质量取决于：回答从哪来（最好是当前策略自己采样的 on-policy 数据）、谁来判（人/RM/LLM 裁判/规则）、对比是否有信息量（margin 合适、去掉长度等混杂因素）。",
    points: `<ul>
      <li><b>回答来源</b>：多模型采样（UltraFeedback 用多个模型回答 + GPT-4 多维评分）vs 当前策略采样（on-policy）。研究显示 on-policy、甚至次优的自采样数据对偏好学习更有效。</li>
      <li><b>标注者</b>：人工（贵、慢、分歧大）、奖励模型、LLM-as-judge（需控制位置/长度/自我偏好偏差）、规则/验证器（数学、代码、格式约束）。</li>
      <li><b>构造对</b>：best-of-N 选最高分为 chosen、最低分或中等为 rejected；margin 太小是噪声，太大则信息量低（太容易）。</li>
      <li><b>长度控制</b>：chosen 显著更长会让模型学到“长=好”；可做长度匹配采样或在评分时惩罚冗长。</li>
      <li><b>多轮迭代</b>（Llama 3）：每轮收集新的人类偏好 + 用最新模型采样 + 拒绝采样 SFT + DPO，共 6 轮。</li>
      <li><b>安全偏好</b>：有害请求的“恰当拒绝” vs 过度拒绝（误拒良性请求）需要成对平衡。</li>
      <li><b>RLAIF / Constitutional AI</b>：用原则 + AI 评判替代人类标注，规模化。</li></ul>`,
    papers: [
      ["UltraFeedback", "2023", "64K 指令 × 4 个模型回答 × GPT-4 多维评分，开源偏好数据标杆。"],
      ["Preference Fine-Tuning of LLMs Should Leverage Suboptimal, On-Policy Data（Tajwar et al.）", "2024", "on-policy 采样与负梯度（推低坏回答）是偏好学习有效的关键。"],
      ["Judging LLM-as-a-Judge（MT-Bench）", "2023", "GPT-4 裁判与人类一致率约 80%，存在位置、冗长、自我偏好偏差。"],
      ["Llama 3 Herd of Models", "2024", "多轮 RM + 拒绝采样 + DPO 的迭代后训练。"],
    ],
    answer: `<p>回答框架“来源 × 判别 × 配对 × 去偏 × 迭代”。最好能说一个具体去偏的手段，例如：“评判时随机交换位置各判一次，不一致的样本丢弃；chosen/rejected 长度差超过阈值的对降权”。</p>`,
    pitfall: `<ul><li>追问：<b>偏好数据中 chosen 也有错误怎么办</b>？对可验证任务先用验证器过滤；对开放任务用多裁判投票，低一致的样本剔除。</li></ul>`,
  },
  {
    id: "grpo", cat: "post", level: 3, title: "RLVR 与 GRPO：DeepSeek-R1 是怎么炼成的",
    one: "RLVR 用可验证的规则奖励（答案对不对、代码过不过单测）替代奖励模型，GRPO 用“同一题采一组答案、组内标准化”替代价值网络——R1 证明了纯 RL 就能让模型自发学会长链推理。",
    fig: "r1",
    points: `<ul>
      <li><b>RLVR</b>（Tülu 3 命名）：奖励来自程序化验证，几乎不可 hack（但仍要防格式钻空子），适合数学、代码、逻辑、指令格式约束。</li>
      <li><b>GRPO</b>（DeepSeekMath 提出）：对每个问题采 G 个回答，奖励 r₁..r_G，优势 Âᵢ = (rᵢ − mean)/std；沿用 PPO 的 clip 目标，KL（k3 估计）直接加在 loss 中；省掉 critic，显存和工程大幅简化。</li>
      <li><b>R1-Zero</b>：从 V3-Base 直接做 GRPO，奖励 = 准确性 + 格式（思考放在 &lt;think&gt; 中）；随训练回答越来越长，出现反思、“aha moment”；缺点是可读性差、语言混杂。</li>
      <li><b>R1 四阶段</b>：冷启动 SFT（数千条可读长 CoT）→ 推理 RL（加语言一致性奖励）→ 拒绝采样构造约 60 万推理 + 20 万通用数据做 SFT → 全场景 RL（推理规则奖励 + 通用 RM）。</li>
      <li><b>为什么不用 PRM / MCTS</b>：R1 报告认为过程奖励难定义、易被 hack，MCTS 在 token 空间搜索太大，都未成功规模化。</li>
      <li><b>蒸馏结论</b>：用 R1 的 80 万条数据 SFT 小模型，效果好于小模型自己做大规模 RL——小模型更适合蒸馏。</li></ul>`,
    fig2: "rl",
    papers: [
      ["DeepSeekMath", "2024", "提出 GRPO；数学继续预训练 + RL。"],
      ["DeepSeek-R1", "2025", "纯 RL 涌现推理（R1-Zero）+ 四阶段配方（R1）+ 蒸馏小模型。"],
      ["Tülu 3", "2024", "提出 RLVR 术语，开源完整配方。"],
      ["Kimi k1.5", "2025", "长上下文 RL、partial rollout、long2short 方法压缩推理长度。"],
      ["Let's Verify Step by Step（PRM800K）", "2023", "过程监督在 MATH 上优于结果监督（作为对照：R1 未采用 PRM）。"],
    ],
    answer: `<p>必须能写 GRPO 目标并解释每一项：重要性比率与 clip、组内优势、KL 项、1/|oᵢ| 长度归一化。然后说 R1 的关键启示：①基座足够强时，简单规则奖励 + 大规模 RL 即可涌现推理；②冷启动数据决定可读性；③数据与验证器是 RL 的核心资产——这对数据岗来说就是新的主战场（可验证题库的构建、难度标定、去污染）。</p>`,
    pitfall: `<ul><li>误区：GRPO 不需要参考模型。原版有 KL 项需要参考模型；DAPO 等后续工作才去掉 KL。</li>
      <li>追问：<b>一组全对/全错怎么办</b>？优势全 0、无梯度，浪费算力 → 动态采样过滤（DAPO）或按通过率筛题。</li>
      <li>追问：<b>RL 数据怎么选题</b>？答案可验证且唯一、难度适中（当前模型通过率在 0 与 1 之间）、去污染、去掉选择题/判断题等易猜题型。</li></ul>`,
  },
  {
    id: "rl-tricks", cat: "post", level: 3, title: "GRPO 之后：DAPO、Dr. GRPO、熵坍缩与“RL 到底教会了什么”",
    one: "2025 年大量工作在修 GRPO 的偏差与不稳定：DAPO 的四件套、Dr. GRPO 去掉长度和标准差归一化、防止熵坍缩；同时学界在争论 RL 是“激发”还是“新增”了推理能力。",
    points: `<ul>
      <li><b>DAPO 四件套</b>：①<b>Clip-Higher</b>：上下裁剪解耦（如 ε_low=0.2、ε_high=0.28），给低概率 token 上升空间，防熵坍缩；②<b>动态采样</b>：过滤准确率为 0 或 1 的组并补采，保证每批都有有效梯度；③<b>Token 级损失</b>：按 token 而不是按样本平均，长回答不被稀释；④<b>超长奖励整形</b>：对截断/过长回答做软惩罚。同时去掉 KL。Qwen2.5-32B 基座 AIME 2024 达到 50 分。</li>
      <li><b>Dr. GRPO</b>：GRPO 的 1/|oᵢ| 让错误的长回答惩罚更轻（导致越错越长），std 归一化让过易/过难题权重过大；去掉两者后 token 效率更高。</li>
      <li><b>熵坍缩</b>：RL 中策略熵快速下降 → 探索不足 → 性能早早饱和；手段包括 clip-higher、熵正则、提高采样温度、对高协方差 token 做裁剪等。</li>
      <li><b>RL 激发还是新增？</b>Yue et al. 2025 发现 RLVR 模型 pass@1 更高，但 k 很大时基座的 pass@k 反超——RL 主要是把基座已有的正确路径“提上来”、采样效率提高、覆盖面收窄；而蒸馏能引入新的推理模式。后续也有工作（如延长 RL 训练、ProRL）认为足够长的 RL 能拓展边界，属于开放问题。</li>
      <li><b>其他实践</b>：课程学习（由易到难）、离线难度过滤、多任务奖励混合、异步 rollout、训练-推理引擎精度不一致导致的 off-policy 问题。</li></ul>`,
    papers: [
      ["DAPO（ByteDance Seed & 清华 AIR）", "2025", "Clip-Higher、动态采样、token 级损失、超长奖励整形。"],
      ["Understanding R1-Zero-Like Training（Dr. GRPO）", "2025", "指出 GRPO 的长度与难度偏差；基座模板与预训练数据对 R1-Zero 现象影响大。"],
      ["Does RL Really Incentivize Reasoning Capacity Beyond the Base Model?（Yue et al.）", "2025", "大 k 下基座 pass@k 反超 RLVR 模型。"],
      ["The Entropy Mechanism of RL for Reasoning LMs", "2025", "熵坍缩与性能上限的经验关系，及基于协方差的熵控制。"],
      ["ProRL", "2025", "长时间、稳定的 RL 训练可扩展推理边界（与上面观点形成对照）。"],
    ],
    answer: `<p>面试官考察的是“你是否真的跑过/读懂 RL 训练细节”。推荐挑 2–3 个点讲透：比如动态采样为什么必要（梯度有效性）、长度归一化的偏差怎么推出来、熵怎么监控。最后对“RL 是否新增能力”给出有立场的观点：“我倾向于认为 RLVR 主要提升采样效率，能力边界主要由预训练与中训练数据决定——所以数据侧的投入依然最关键”。</p>`,
    pitfall: `<ul><li>误区：去掉 KL 一定更好。对推理 RL 常见去 KL，但对通用对齐 RL，KL 仍是防 reward hacking 的重要手段。</li>
      <li>追问：<b>RL 训练监控哪些指标</b>？奖励均值、回答长度、熵、clip 比例、组内全对/全错比例、验证集准确率、截断率。</li></ul>`,
  },
  {
    id: "reason-data", cat: "post", level: 3, title: "推理数据与蒸馏：s1、LIMO、PRM、长度控制与思考模式融合",
    one: "少量（约 1K）精选的长 CoT 数据就能激活强基座的推理能力；蒸馏是小模型获取推理能力最划算的方式；后期要解决“想太多”和“思考/不思考”两种模式共存。",
    points: `<ul>
      <li><b>s1</b>：从 59K 题中按质量、难度、多样性选 1K（s1K），用 Gemini 思考轨迹 SFT Qwen2.5-32B-Instruct；提出 <b>budget forcing</b>（强制结束或追加“Wait”延长思考）实现测试时扩展。</li>
      <li><b>LIMO</b>：817 条精选样本即可大幅提升数学推理——“基座已有知识 + 高质量推理示范模板”是关键。</li>
      <li><b>蒸馏数据构造</b>：强推理模型多次采样 → 答案验证 → 过滤过长/重复/语言混杂 → 难度分层；R1 蒸馏数据规模约 80 万。</li>
      <li><b>PRM vs ORM</b>：PRM 对每一步打分，监督更密；人工标注贵（PRM800K），可用 Math-Shepherd 的蒙特卡洛回滚自动标注；但大规模 RL 中易被 hack，主要用于 best-of-N 重排和搜索。</li>
      <li><b>过度思考</b>：简单题也写几千 token。对策：长度惩罚、long2short 蒸馏/合并（Kimi k1.5）、按难度自适应预算。</li>
      <li><b>思考模式融合</b>（Qwen3）：后训练四阶段——长 CoT 冷启动 → 推理 RL → 思考模式融合（混合 /think 与 /no_think 数据 SFT）→ 通用 RL；小模型用强到弱蒸馏。</li></ul>`,
    papers: [
      ["s1: Simple test-time scaling", "2025", "1K 样本 + budget forcing。"],
      ["LIMO: Less is More for Reasoning", "2025", "817 条样本激活复杂数学推理。"],
      ["Math-Shepherd", "2023", "自动构造过程监督标签（无需人工）。"],
      ["Kimi k1.5", "2025", "long2short：用短 CoT 模型或长度惩罚压缩推理开销。"],
      ["Qwen3 Technical Report", "2025", "思考/非思考模式统一，思考预算可控；强到弱蒸馏。"],
    ],
    answer: `<p>讲推理数据时突出数据工程细节：题目来源与去污染、难度标定（用模型通过率）、答案可验证性、轨迹质量过滤（重复、语言混杂、截断）、长度分布控制、多样性（学科/题型）。这些都是你做预训练数据时的能力迁移，面试官会认可。</p>`,
    pitfall: `<ul><li>误区：LIMA/LIMO 说明数据越少越好。前提是强基座 + 极高质量；而且少量数据主要“激活”格式与思维模板，不能替代能力本身。</li></ul>`,
  },
  {
    id: "agent-data", cat: "post", level: 2, title: "Agent 与工具调用数据：从函数调用 SFT 到环境中的 RL",
    one: "Agent 能力 = 规划 + 工具调用 + 读取反馈后纠错；数据从“合成函数调用轨迹做 SFT”走向“在可执行环境里用结果奖励做多轮 RL”。",
    points: `<ul>
      <li><b>函数调用 SFT 数据</b>：收集真实 API/工具 schema → 合成用户任务 → 强模型生成调用轨迹 → <b>执行校验</b>（格式、参数、真实执行结果）→ 过滤。代表：ToolBench、APIGen。</li>
      <li><b>多轮轨迹</b>：包括错误调用后的纠错、澄清提问、拒绝不可能任务；单纯成功轨迹会让模型不会处理失败。</li>
      <li><b>环境与奖励</b>：代码仓库 + 单元测试（SWE-bench 类）、网页/浏览环境、模拟用户；奖励通常是最终任务成功，配合格式与安全约束。</li>
      <li><b>挑战</b>：长轨迹的信用分配、环境搭建成本、rollout 慢（需异步）、奖励稀疏、环境与评测重叠导致的污染。</li>
      <li><b>大规模合成</b>：Kimi K2 等报告描述了“工具 schema 合成 + 多 agent 模拟用户/环境 + LLM 裁判过滤”的流水线来规模化造 agent 数据。</li></ul>`,
    papers: [
      ["Toolformer", "2023", "模型自监督学习何时调用 API。"],
      ["ToolLLM（ToolBench）", "2023", "1.6 万+ 真实 API 的工具使用数据与 DFS 决策树轨迹。"],
      ["SWE-bench", "2023", "真实 GitHub issue 修复任务，现已成为 agent 编码能力的主评测与 RL 环境来源。"],
      ["Kimi K2", "2025", "大规模 agentic 数据合成 + 可验证/不可验证任务结合的 RL。"],
    ],
    answer: `<p>如果面试岗位涉及 agent，就讲“数据 = 环境 + 任务 + 验证器”：如何批量构建可执行环境、如何生成有难度梯度的任务、如何自动判定成功。没做过也可以从数据管线的角度讲清楚验证与去污染。</p>`,
    pitfall: `<ul><li>追问：<b>agent 数据为什么不能只用成功轨迹</b>？分布偏差：真实使用中工具会报错，模型需要见过“出错 → 纠正”的模式。</li></ul>`,
  },

  // ===================== 评估与实战 =====================
  {
    id: "eval", cat: "eval", level: 2, title: "评估体系：基座、对话、推理评测与 LLM-as-judge",
    one: "不同阶段看不同的尺子：预训练看困惑度和 few-shot 基准，后训练看指令遵循、对话胜率和推理准确率；所有分数都要警惕污染、提示格式敏感和裁判偏差。",
    points: `<ul>
      <li><b>知识/综合</b>：MMLU、MMLU-Pro、C-Eval、CMMLU、GPQA（研究生级难题）。</li>
      <li><b>常识/阅读</b>：HellaSwag、ARC、PIQA、WinoGrande、BoolQ（适合小模型数据消融）。</li>
      <li><b>数学</b>：GSM8K、MATH / MATH-500、AIME（每年新题，抗污染）。</li>
      <li><b>代码</b>：HumanEval、MBPP、LiveCodeBench（按时间滚动防污染）、SWE-bench。</li>
      <li><b>指令遵循与对话</b>：IFEval（可程序验证的格式约束）、MT-Bench、AlpacaEval 2（长度控制胜率 LC）、Arena-Hard、Chatbot Arena（人类盲评 Elo）。</li>
      <li><b>长上下文</b>：NIAH、RULER、LongBench。</li>
      <li><b>LLM-as-judge 偏差</b>：位置偏差（偏好第一个）、冗长偏差、自我偏好；缓解：交换顺序、长度控制、参考答案、多裁判。</li>
      <li><b>指标陷阱</b>：pass@1 vs pass@k、贪心 vs 采样、few-shot 样例与提示格式对小模型影响巨大；报告时要固定评测框架（lm-eval-harness、OpenCompass 等）。</li></ul>`,
    papers: [
      ["MMLU", "2020", "57 学科多选题，最常用知识基准，现已接近饱和、存在标注错误。"],
      ["Judging LLM-as-a-Judge（MT-Bench & Chatbot Arena）", "2023", "系统分析 LLM 裁判的偏差与可靠性。"],
      ["Length-Controlled AlpacaEval", "2024", "用回归去掉长度对胜率的影响。"],
      ["LiveCodeBench", "2024", "按发布时间收集新题，评估去污染能力。"],
    ],
    answer: `<p>面试中常被追问“你怎么知道模型变好了”。好的回答是分层：数据消融层（小模型 + 早期信号基准）→ 基座层（多基准 + 分领域困惑度）→ 对齐层（自动评测 + 人评 + 线上指标），并且每一层都说清楚如何防污染、如何判断显著性。</p>`,
    pitfall: `<ul><li>误区：基准分高就是好模型。注意污染、过拟合评测格式，以及“刷榜数据”混入中训练/SFT。</li></ul>`,
  },
  {
    id: "reports", cat: "eval", level: 2, title: "主流技术报告横评：Llama 3、Qwen、DeepSeek、OLMo 2、Kimi K2",
    one: "面试官最爱问“你最近读过哪篇技术报告、印象最深的点是什么”——下面这张表帮你把关键数字和“数据侧亮点”一次记牢。",
    table: true,
    points: `<ul>
      <li><b>准备方法</b>：每篇报告记 3 件事——规模与 token 数、数据侧最有意思的设计、后训练配方。</li>
      <li><b>共同趋势</b>：①token 数越来越多（15T → 36T）；②多阶段预训练（通用 → 高质量/推理 → 长文本）成为标配；③合成数据与改写进入预训练；④后训练从 SFT+DPO 走向大规模 RLVR；⑤小模型主要靠蒸馏。</li>
      <li>数字以各报告原文为准，面试时说“约”即可，重点讲清设计动机。</li></ul>`,
    papers: [
      ["The Llama 3 Herd of Models", "2024", "数据质量分类器、知识分类降采样、退火评估数据、6 轮后训练。"],
      ["Qwen2.5 / Qwen3 Technical Report", "2024/2025", "18T → 36T tokens；三阶段预训练；思考模式融合。"],
      ["DeepSeek-V3 / R1", "2024/2025", "MoE + FP8 + MTP；纯 RL 涌现推理。"],
      ["OLMo 2", "2024/2025", "全开源（数据、代码、中间 checkpoint）；mid-training 与 model soup。"],
      ["Kimi K2", "2025", "MuonClip 优化器稳定训练、知识改写合成、大规模 agentic 数据。"],
    ],
    answer: `<p>推荐话术：“我印象最深的是 Llama 3 用退火实验来评估数据集价值——它把数据评估成本从‘重训一个模型’降到‘退火 40B tokens’，我在自己的数据工作里也借鉴了类似的低成本验证思路……”——永远把报告内容和你自己的工作连起来。</p>`,
    pitfall: `<ul><li>注意：报告更新很快（本学堂内容整理至 2025 年公开资料），面试前一周务必补读最新的旗舰模型报告。</li></ul>`,
  },
  {
    id: "story", cat: "eval", level: 3, title: "怎么讲你的数据项目：STAR + 数字 + 消融 + 反思",
    one: "数据岗面试最终拼的是“你做过什么、怎么证明有效、学到了什么”。用 STAR 结构讲，每一步都落到数字和实验上，并主动讲失败和取舍。",
    points: `<ul>
      <li><b>S 背景</b>：模型规模、阶段（预训练/中训练/SFT）、目标能力、数据规模（原始量 → 产出量）。</li>
      <li><b>T 任务</b>：你负责的具体环节（如“医学领域数据召回与质量分类，目标覆盖 N 个学科”）。</li>
      <li><b>A 行动</b>：方法与关键决策——为什么选这个分类器/阈值/配比，你考虑过哪些替代方案、为什么放弃。</li>
      <li><b>R 结果</b>：<b>前后数字对照</b>，如“保留率 x% → y%，1B 消融上目标基准 +a 分、通用基准变化 ±b 分（2 个种子噪声约 c 分）”；“覆盖率从 m% 提到 n%”。</li>
      <li><b>反思</b>：踩过的坑（误杀某类数据、分类器偏差、污染）、如果重做会怎么改。</li>
      <li><b>准备 3 个故事</b>：一个“做成了”的（主项目）、一个“发现问题并纠正”的（体现严谨）、一个“跨团队推动”的（体现影响力）。</li>
      <li><b>反问环节</b>：问团队的数据评估体系、数据和模型团队的协作方式、当前最大的数据瓶颈——显示你懂行。</li></ul>`,
    papers: [],
    answer: `<p>示范开头（30 秒电梯版）：“我负责 XX 模型预训练中医学领域数据，从 X TB 原始网页和文献中，通过分类体系 + fastText 召回 + LLM 质量打分 + MinHash 去重，产出 Y B tokens 高质量医学语料。在 1B 模型消融上，医学基准提升 Z 分，通用基准无显著回退；上线到主模型后……我最大的收获是：数据质量的定义必须由下游评测反推，而不是凭直觉。”</p>`,
    pitfall: `<ul><li>最大的雷：说不出数字、说不出“怎么验证有效”、把团队成果全说成自己的。</li>
      <li>被追问不会时：说清楚“我不确定，但我会这样设计实验去验证”，比硬编更加分。</li></ul>`,
  }
);

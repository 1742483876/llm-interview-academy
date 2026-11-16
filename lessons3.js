// 大模型面试学堂 · JD 专项（预训练数据算法岗）
window.CATS.push({ id: "jd", tag: "jd", name: "JD 专项", desc: "对照 8 家预训练数据岗 JD 补齐短板：数据选择、文档解析、PB 级管线、课程与蒸馏、标签体系、合成数据质检，外加公司拆解、模拟面试和简历指南" });

LESSONS.push(
  {
    id: "data-select", cat: "jd", level: 3, title: "数据选择算法：从“删掉坏的”到“挑出最有用的”",
    one: "过滤是删坏数据，选择是在好数据里挑对目标能力最有用的。按信号来源分三类：参考分布、模型信号（PPL / loss / 梯度）、多样性；按粒度分文档级和 token 级；按时机分静态和动态。",
    points: `<ul>
      <li><b>基于参考分布</b>：DSIR 用 hashed n-gram 特征分别估计“目标分布”和“原始分布”，按重要性权重 p_target/p_raw 重采样；fastText 质量分类器本质上也是“像不像目标数据”。优点是便宜，缺点是目标集决定了一切，容易偏。</li>
      <li><b>困惑度（PPL）剪枝</b>：用参考模型给文档打 PPL。Marion et al.（2023）发现<b>保留中间区间</b>往往比只留最低 PPL 更好——低 PPL 里混着模板、重复、广告，高 PPL 里是乱码，也有难的专业内容。Ankner et al.（2024）发现 125M 小模型做的 PPL 剪枝能提升 3B 模型的下游表现，但收益依赖数据的域构成。</li>
      <li><b>LLM 评分 + 采样</b>：QuRating 让 LLM 两两比较文档在写作风格、所需专业度、事实与知识、教育价值四个维度上的高低，训练打分器后<b>按分数做温度采样</b>而不是硬取 top-k，兼顾质量与多样性。</li>
      <li><b>token 级选择</b>：RHO-1 先在高质量数据上训参考模型，再按“当前模型 loss − 参考模型 loss”（excess loss）只对有价值的 token 计算损失，跳过噪声 token 和已经学会的 token。</li>
      <li><b>梯度 / 影响力</b>：LESS 用 LoRA 梯度 + 随机投影，按与目标任务梯度的相似度选 SFT 数据（5% 数据超过全量）；MATES 训练一个小的“数据影响力模型”，在预训练过程中按当前模型状态动态选数据。预训练规模下直接算影响力太贵，必须近似。</li>
      <li><b>模型驱动的清洗</b>：ProX 让小模型为每篇文档“写清洗程序”（删哪些行、替换哪些字符串），把规则过滤变成按文档定制的模型决策。</li>
      <li><b>多样性</b>：SemDeDup / D4 在 embedding 空间去冗余、按簇均衡采样，常和质量分数组合使用。</li>
      <li><b>算成本账</b>：打分推理 FLOPs ≈ 2 × 打分模型参数 × 打分 token 数；只有省下的训练算力（或带来的效果）大于它才划算。小打分模型 + 只打文档前 N 个 token 是常见做法。</li></ul>`,
    papers: [
      ["Data Selection for Language Models via Importance Resampling（DSIR）", "2023", "hashed n-gram 特征 + 重要性重采样，按目标分布选预训练数据，便宜且可扩展。"],
      ["When Less is More: Investigating Data Pruning for Pretraining LLMs at Scale（Marion et al.）", "2023", "比较 PPL、EL2N、记忆度等剪枝信号，基于 PPL 保留中间区间效果较好。"],
      ["Perplexed by Perplexity（Ankner et al.）", "2024", "小参考模型的 PPL 剪枝可以迁移到更大的模型，效果依赖域构成。"],
      ["QuRating: Selecting High-Quality Data for Training LMs（Wettig et al.）", "2024", "LLM 成对比较四个质量维度，按分数温度采样，兼顾质量和多样性。"],
      ["Not All Tokens Are What You Need（RHO-1）", "2024", "按参考模型的 excess loss 做 token 级选择，数学等任务上数据效率显著提升。"],
      ["MATES: Model-Aware Data Selection with Data Influence Models", "2024", "用小的影响力模型随训练进程动态选择预训练数据。"],
      ["Programming Every Example（ProX）", "2024", "小模型为每个样本生成清洗操作，把清洗变成可学习的程序。"],
      ["A Survey on Data Selection for Language Models（Albalak et al.）", "2024", "数据选择方法的系统综述：分布匹配、质量、多样性、在线 / 离线等维度。"],
    ],
    answer: `<p>回答框架（Shopee、小红书很可能这么问）：①<b>目标</b>是什么（通用能力 / 某个域 / 某个基准）；②<b>信号</b>选哪类（参考分布、模型信号、多样性），各自的偏差；③<b>粒度</b>是文档、段落还是 token；④<b>时机</b>是静态打一次分还是随训练动态选；⑤<b>成本账</b>；⑥<b>验证</b>：同 token 预算下和随机采样、和现有过滤比，至少两个模型规模。最后补一句：“选择会改变域分布，我会同时盯每个类目的保留率”——直接接上你做分类覆盖率的经验。</p>`,
    pitfall: `<ul><li>误区：PPL 越低越好。模板页、重复内容、SEO 文本的 PPL 都很低。</li>
      <li>误区：top-k 硬截断。容易让分布塌缩到某种文风，温度采样或分档配额更稳。</li>
      <li>追问：<b>参考模型用什么数据训？</b>它决定了“好”的定义，偏学术就会删掉口语和常识。</li>
      <li>追问：<b>选择和配比怎么配合？</b>先按域分桶，在每个域内做选择，再按配比采样，避免选择悄悄改变配比。</li></ul>`,
  },
  {
    id: "doc-parse", cat: "jd", level: 2, title: "PDF、文档与多源数据解析：被低估的高价值数据",
    one: "书籍、论文、教材、报告的知识密度远高于普通网页，但 PDF 是排版格式不是文本格式。核心是按文档分路：有可靠文本层的走快速抽取，扫描件和复杂版面走版面分析或 VLM，再用一套质检把乱序、乱码和幻觉挡住。",
    points: `<ul>
      <li><b>两条技术路线</b>：①文本层抽取（PyMuPDF、pdfminer）：快、便宜，但阅读顺序容易乱，公式和表格会丢，扫描件没有文本层；②视觉路线：版面检测 + OCR，或端到端 VLM。</li>
      <li><b>模块化管线</b>（MinerU、marker 这类）：版面检测（标题 / 正文 / 表格 / 公式 / 图）→ 阅读顺序 → 公式转 LaTeX → 表格转 HTML / Markdown → 去页眉页脚页码 → 跨页段落合并。GROBID 专门处理学术论文的结构和元数据。</li>
      <li><b>端到端 VLM</b>：Nougat 把学术 PDF 直接转成 Markdown，但长页面容易幻觉和重复；olmOCR（AI2，2025）微调 Qwen2-VL-7B，并把 PDF 文本层作为“锚点”一起输入，减少幻觉，百万页级别成本可控。</li>
      <li><b>路由策略</b>：先判断文本层是否可靠（字符数、乱码率、不可见字符、字体映射异常、与页面面积的比例）→ 可靠走抽取，否则走 OCR / VLM；再按版面复杂度分级，把贵的模型留给真正需要的页面。</li>
      <li><b>没有标注集也能做的质检</b>：乱码率、重复行 / 重复 n-gram（VLM 循环输出）、语言模型 PPL（阅读顺序错乱时 PPL 会升高）、LaTeX 能否编译、表格行列是否一致、与文本层的编辑距离（发现幻觉或漏字）；再抽样人工看，按文档类型统计错误类型。</li>
      <li><b>网页同样要“保结构”</b>：trafilatura / resiliparse 抽正文；数学公式（MathJax / KaTeX 的源码）、代码块、表格要专门保留——OpenWebMath 就是因为通用抽取器会丢公式才另起一套。</li>
      <li><b>多语言</b>：FineWeb2 的做法是每种语言单独调过滤阈值、单独做去重统计；低资源语言的语言识别容易出错，要注意混语和近亲语言混淆。</li>
      <li><b>合规</b>：版权与许可、扫描件里的身份证号、签名、病历号等 PII。</li></ul>`,
    papers: [
      ["Nougat: Neural Optical Understanding for Academic Documents（Meta）", "2023", "端到端把学术 PDF 转成 Markdown，含公式与表格。"],
      ["GROBID", "2008–", "学术文献 PDF 结构化抽取的长期开源工具。"],
      ["MinerU（OpenDataLab）", "2024", "版面检测 + 公式 + 表格识别的模块化 PDF 解析工具。"],
      ["olmOCR: Unlocking Trillions of Tokens in PDFs with VLMs（AI2）", "2025", "微调 VLM + 文本层锚点，低成本把大规模 PDF 转成干净文本。"],
      ["OpenWebMath", "2023", "保留数学公式的网页抽取管线。"],
      ["FineWeb2（HuggingFace）", "2025", "覆盖上千种语言的网页语料，按语言自适应调整过滤与去重。"],
    ],
    answer: `<p>MiniMax 和九坤都写了“高精解析”。系统设计题的答法：数据盘点（来源、页数、扫描件占比、语言、版面类型）→ 分路架构（文本层 / OCR / VLM）→ 每路的质检指标 → 成本估算（VLM 每千页 GPU 秒数 × 页数）→ 最终用小模型消融验证“解析升级带来的下游收益”，比如数学、科学类基准。</p>`,
    pitfall: `<ul><li>误区：VLM 越强越好。VLM 会“补全”原文没有的内容，这类幻觉比漏字更难发现，必须做文本层对比或重复检测。</li>
      <li>追问：<b>阅读顺序错了怎么发现？</b>PPL 异常、句子被拦腰截断的比例、双栏页面左右栏交错。</li>
      <li>追问：<b>同一本书的不同 PDF 版本怎么去重？</b>按章节或段落做近重复，而不是按整文档。</li></ul>`,
  },
  {
    id: "pipe-sys", cat: "jd", level: 3, title: "PB 级数据管线系统设计：可扩展、可复现、可追溯",
    one: "数据管线的系统设计题考三件事：能不能跑得动（分布式与成本）、能不能重跑出一样的结果（可复现）、能不能查清每条数据经历了什么（可追溯）。分层落盘、记录删除原因、按成本排序算子，是三个最实用的设计点。",
    points: `<ul>
      <li><b>分层架构</b>：原始层（WARC / PDF，不可变）→ 抽取层 → 规则过滤层 → 去重层 → 模型打分与标签层 → 混合与 tokenize 层（固定长度 shard）。每层输出带版本的中间结果（parquet / jsonl.zst），改了下游不用重跑上游。</li>
      <li><b>计算分工</b>：CPU 密集的抽取、规则用 Spark / Ray / datatrove 做 map 任务；GPU 密集的分类器打分、embedding、OCR / VLM 单独排队，批推理（如 vLLM）；去重需要全局 shuffle，单独设计。现成工具：datatrove、NVIDIA NeMo Curator（GPU 加速模糊去重）、Data-Juicer、Dolma toolkit。</li>
      <li><b>分布式 MinHash</b>：map 阶段并行算签名 → 按 (band, 桶哈希) shuffle → 桶内两两成边 → 求连通分量（Union-Find，或 MapReduce 上的 large-star / small-star 迭代）→ 每个分量留一篇。瓶颈是 shuffle 数据量和“超大簇”（模板页一个桶里几百万篇，边数爆炸），要对大桶截断或先精确去重。</li>
      <li><b>可复现</b>：固定哈希函数和随机种子；代码、配置、数据版本三者绑定（数据血缘）；分片和排序确定；<b>每篇被删的文档记录 reason code</b>（哪条规则、阈值、分数）。</li>
      <li><b>容错与成本</b>：任务幂等、断点续跑、可用抢占式实例；合并小文件、压缩；算子按“单位成本的删除量”排序——便宜的规则先跑，把 GPU 留给剩下的数据。</li>
      <li><b>可观测</b>：每步保留率，按域名 / 语言 / 主题的分布报表，抽样看板，告警（某个快照保留率突变、某个域名突然大量出现）。</li>
      <li><b>和训练对接</b>：按配比采样的 shard 支持确定性重放（断点恢复后数据顺序一致），记录每个 step 用了哪些 shard，便于排查 loss spike。</li></ul>`,
    papers: [
      ["datatrove（HuggingFace，FineWeb 所用）", "2024", "可扩展的数据处理库：读取、抽取、过滤、MinHash 去重、统计全流程。"],
      ["NeMo Curator（NVIDIA）", "2024", "GPU 加速的数据整理工具，含模糊去重、语义去重、分类器过滤。"],
      ["Data-Juicer（阿里）", "2023", "一站式大模型数据处理系统，数十个可组合算子 + 数据分析与可视化。"],
      ["Dolma（AI2）", "2024", "3T tokens 开放语料及其处理工具链，详细公开每一步设计。"],
      ["Connected Components in MapReduce and Beyond（Kiveris et al.）", "2014", "大规模图连通分量的 large-star / small-star 算法。"],
    ],
    answer: `<p>系统设计五步：①<b>澄清需求</b>：数据量、多久迭代一次、预算、是否要支持多版本并行实验；②<b>画架构</b>（本页分层图）；③<b>讲难点</b>：去重的 shuffle、GPU 打分吞吐、数据血缘；④<b>现场估算</b>（例：100 亿网页 × 每篇抽取 20 ms = 2×10⁸ 核·秒 ≈ 5.6 万核·时，2000 核约 28 小时；1 亿参数的打分模型 × 10T tokens ≈ 2×10²¹ FLOPs，按 H100 有效 4×10¹⁴ FLOPS 约 1400 GPU·时）；⑤<b>监控与演进</b>。数字是示意，关键是展示你会算。</p>`,
    pitfall: `<ul><li>只讲用什么框架，不讲数据正确性。面试官更关心“怎么保证没删错、怎么复现”。</li>
      <li>追问：<b>去重要不要跨快照做？</b>FineWeb 的消融显示单快照内去重更好，这是数据决策，不是工程决策。</li>
      <li>追问：<b>规则改了一条，要重跑多少？</b>分层落盘 + 记录删除原因后，只需要重跑受影响的层，甚至只重算被这条规则影响的文档。</li></ul>`,
  },
  {
    id: "curriculum", cat: "jd", level: 2, title: "课程学习、自训练与蒸馏：让数据持续“释放价值”",
    one: "逐样本“由易到难”的课程学习在 LLM 预训练里证据并不一致，真正稳定有效的是粗粒度的阶段配比和退火；自训练和蒸馏则是用模型自己（或更强的模型）生产数据，形成数据飞轮。",
    points: `<ul>
      <li><b>经典课程学习</b>（Bengio 2009）：先易后难。难度可以用参考模型 loss / PPL、长度、可读性、压缩率、LLM 打分来衡量。</li>
      <li><b>在 LLM 预训练里</b>：逐样本排序的收益不稳定，还会和学习率调度纠缠（高质量数据放在高学习率的早期，效果可能被后面的数据冲淡）。常见的有效形式是<b>阶段配比 + 退火段放高质量数据</b>（见 Mid-training 一课），以及<b>序列长度 warmup</b>（先短后长，提升稳定性和效率）。</li>
      <li><b>后训练中的课程</b>：RL 按题目通过率由易到难、动态过滤全对和全错的题，是目前最稳定的课程形式。</li>
      <li><b>自训练 / 自改进</b>：STaR 让模型生成推理过程，只保留答对的拿来微调，循环迭代；ReST 是“生成 → 打分过滤 → 训练”的循环。风险是确认偏差（越训越窄）和错误被固化，需要外部验证器和多样性控制。</li>
      <li><b>数据蒸馏 vs logits 蒸馏</b>：数据蒸馏是用强模型生成文本再做 SFT（如 R1 蒸馏小模型），实现简单、跨分词器；logits 蒸馏是用教师的概率分布当软标签，信息更多但要求同一词表、成本高。Gemma 2 的 2B / 9B、Llama 3.2 的 1B / 3B 都在预训练中用了大模型的 logits。</li>
      <li><b>自蒸馏</b>：用模型自己的早期版本或 EMA 版本当教师，或者用自己的高置信输出当标签。</li>
      <li><b>数据飞轮</b>：评测发现能力缺口 → 错误分析定位数据原因 → 定向召回或合成 → 小规模验证 → 进入下一轮训练 → 再评测。阶跃和九坤都把它写进了 JD。</li></ul>`,
    papers: [
      ["Curriculum Learning（Bengio et al.）", "2009", "由易到难的训练顺序可以加速收敛、提升泛化。"],
      ["The Stability-Efficiency Dilemma: Sequence Length Warmup for GPT（Li et al.）", "2022", "训练初期用短序列，可提升大 batch、大学习率下的稳定性与效率。"],
      ["STaR: Bootstrapping Reasoning With Reasoning（Zelikman et al.）", "2022", "模型生成推理 → 保留答对的 → 微调，迭代自我提升。"],
      ["Reinforced Self-Training（ReST，DeepMind）", "2023", "离线“生成—过滤—训练”的循环，样本效率高于在线 RL。"],
      ["Gemma 2", "2024", "小模型在预训练中用大模型的概率分布做知识蒸馏，同规模效果明显提升。"],
      ["MiniLLM（Gu et al.）", "2023", "用反向 KL 做生成式语言模型蒸馏，避免学生去拟合教师的低概率区域。"],
    ],
    answer: `<p>阶跃的 JD 直接问“如何利用课程学习、数据混合、合成数据、自蒸馏持续释放数据价值”。推荐答法：先承认<b>“逐样本课程”证据不足</b>，再给出你认为有效的三件事——阶段配比和退火、后训练按难度动态选题、用飞轮持续定向补数据；每一件都配上验证方法。有立场、有证据、有边界，比罗列名词强得多。</p>`,
    pitfall: `<ul><li>追问：<b>logits 蒸馏为什么要同词表？</b>要逐 token 对齐概率分布；词表不同就只能做数据蒸馏或复杂的对齐。</li>
      <li>追问：<b>自训练怎么避免越来越窄？</b>保留真实数据回放、外部验证器、多样性约束、限制迭代轮数，并监控各类任务分布。</li></ul>`,
  },
  {
    id: "taxonomy", cat: "jd", level: 3, title: "数据标签体系与多样性度量：知道你“有什么、缺什么”",
    one: "只有质量分、没有主题标签的数据集是“盲盒”：你不知道过滤删掉了什么，也不知道该往哪里补。标签体系 + 覆盖率矩阵 + 多样性指标，是配比、诊断和定向合成的共同基础——也是老大最能讲出差异化的方向。",
    points: `<ul>
      <li><b>为什么必须有标签</b>：质量分类器会系统性地偏好某些主题和文风，过滤之后领域分布悄悄改变；没有主题标签就发现不了，也没法按域配比。Llama 3 的知识分类降采样、WebOrganizer 的域配比，都建立在标签之上。</li>
      <li><b>常用维度</b>：主题 / 学科、格式 / 体裁（教程、新闻、论坛、学术、产品页、代码文档…）、质量档、难度、语言、时效性、来源、安全合规。WebOrganizer 用 24 个主题 × 24 种格式两套体系，再用 RegMix 在这些“域”上优化配比，和质量过滤叠加还有额外收益。</li>
      <li><b>体系怎么建</b>：自顶向下参考成熟分类（图书馆分类、学科目录；医学可参考 MeSH、ICD）；自底向上用 embedding 聚类 + LLM 命名，发现长尾类目；两者合并，控制层级深度和类目粒度（类目太细，分类器就不准）。</li>
      <li><b>标注怎么做</b>：LLM 少量标注（写清类目定义和正反例）→ 蒸馏成小分类器跑全量 → 人工抽检算一致率和混淆矩阵 → 对混淆严重的类目合并或细化定义。</li>
      <li><b>覆盖率矩阵</b>：类目 × 质量档，每格统计 token 数，和目标配比对照；长尾类目设最低 token 保障；发现缺口后定向召回或合成补数。</li>
      <li><b>多样性度量</b>：词汇级（distinct-n、压缩率、type-token 比）、语义级（embedding 聚类的分布熵、覆盖的簇数、Vendi score）、主题分布熵。合成数据尤其要看——单看数量会被模板化生成骗。</li>
      <li><b>用途</b>：配比旋钮、分档过滤阈值、数据审计报告、定向合成的种子、评测结果的错误归因。</li></ul>`,
    papers: [
      ["Organize the Web: Constructing Domains Enhances Pre-Training Data Curation（WebOrganizer）", "2025", "主题 × 格式两套域分类 + 域配比优化，与质量过滤互补。"],
      ["The Llama 3 Herd of Models", "2024", "用知识分类器给网页打主题标签，对过多的类别降采样。"],
      ["The Vendi Score: A Diversity Evaluation Metric for ML（Friedman & Dieng）", "2023", "基于相似度矩阵特征值的多样性度量，可理解为“有效的不同样本数”。"],
      ["D4: Improving LLM Pretraining via Document De-Duplication and Diversification", "2023", "在 embedding 空间去重并增加多样性，提升训练效率。"],
      ["Nemotron-CC", "2024", "按质量分档、分档处理（保留 / 改写 / QA 化），本质也是“标签驱动”的数据策略。"],
    ],
    answer: `<p>这是老大的主场：把医学内容分类项目讲成“<b>标签体系 → 覆盖率矩阵 → 缺口诊断 → 定向补数 → 消融验证</b>”的闭环，再泛化一句：“同样的方法可以用到通用预训练数据上，比如检查质量过滤对各主题的保留率是否均衡。”九坤的“高精细度标签系统、多样性度量”、阶跃的“质量评估体系”、Qwen 的“能力针对性”都能接住。下面的交互图正好用来讲“过滤会怎样改变领域分布”。</p>`,
    pitfall: `<ul><li>误区：类目越细越好。分类器准确率会掉，统计也会变稀疏；以“能指导决策”为准。</li>
      <li>追问：<b>标签准确率 85% 够不够？</b>看用途：用来配比，误差会被平均掉，基本够用；用来做硬过滤或合规判定，就要更高准确率或人工复核。</li>
      <li>追问：<b>多样性高一定好吗？</b>不一定，噪声也会让多样性变高，要和质量一起看。</li></ul>`,
  },
  {
    id: "synth-qa", cat: "jd", level: 3, title: "合成数据的生产与质检：怎么证明合成的数据“又对、又多样、又有用”",
    one: "合成数据的难点不在“生成”，而在“质检”：正确性、多样性、忠实度、去污染，最后用小模型消融证明有用。九坤和 Qwen 的 JD 都把“合成数据质检闭环”单独列成一条职责。",
    points: `<ul>
      <li><b>生产方式</b>：改写（保持事实，只换风格，如 WRAP）；基于种子生成（教科书、习题、对话）；把知识抽成 QA；推理轨迹蒸馏；Agent 轨迹（在环境中执行）；多智能体生成 + 自我修订（Phi-4）。</li>
      <li><b>种子决定多样性</b>：种子取自真实数据（网页主题聚类、教材目录、人设库），组合受众、难度、文体、语言；控制模板数量和采样温度。Cosmopedia 用网页聚类出的主题 × 不同受众生成约 25B tokens 合成教材。</li>
      <li><b>质检六个维度</b>：
        <ol><li><b>正确性</b>：数学用答案验证，代码执行单测，事实类用检索比对；改写类用 NLI 或 QA 一致性检查是否引入了原文没有的事实。</li>
        <li><b>多样性</b>：n-gram 和 embedding 去重、主题分布、开头句式统计（模板痕迹）。</li>
        <li><b>难度 / 信息量</b>：模型通过率、IFD 一类指标。</li>
        <li><b>忠实度</b>：改写是否保留了原文的关键信息。</li>
        <li><b>污染</b>：生成模型可能见过评测题，要和评测集做 n-gram 与语义去污染。</li>
        <li><b>风格同质化</b>：训练一个“真实 vs 合成”分类器，看合成数据的可识别程度和“AI 腔”比例。</li></ol></li>
      <li><b>自动化链路</b>：规则 → 验证器 → LLM 裁判（多裁判、交换顺序）→ 人工抽检 → <b>小模型消融</b>（最终标准）。前几步过滤，最后一步定生死。</li>
      <li><b>配比</b>：主流报告里合成数据是补充和定向增强；Phi-4 是例外，大量使用合成数据（50 类、约 400B tokens），但仍和网页、代码等真实数据混合。关注合成数据的重复次数和边际收益。</li>
      <li><b>闭环</b>：评测找能力缺口 → 定向合成 → 质检 → 消融 → 进训练 → 再评测，按下游结果反过来调整生成策略（九坤 JD 原话：“逆向迭代数据生成策略”）。</li></ul>`,
    papers: [
      ["Cosmopedia（HuggingFace）", "2024", "Mixtral 生成的大规模合成教材与故事，主题来自网页聚类，含去污染流程。"],
      ["Phi-4 Technical Report（Microsoft）", "2024", "多智能体、自我修订、指令反转等方法生成多类合成数据，作为预训练主力之一。"],
      ["Rephrasing the Web（WRAP）", "2024", "把网页改写成维基风格和问答风格，与原文混合训练提速约 3 倍。"],
      ["Best Practices and Lessons Learned on Synthetic Data（Liu et al.，Google DeepMind）", "2024", "合成数据的应用、质量控制、事实性、偏见与评测污染风险综述。"],
      ["AI models collapse when trained on recursively generated data（Nature）", "2024", "递归训练于生成数据导致分布尾部消失。"],
      ["Is Model Collapse Inevitable?（Gerstgrasser et al.）", "2024", "真实数据被保留并与合成数据累积时，坍缩可以避免。"],
    ],
    answer: `<p>答“怎么评估一批合成数据”时，按“<b>便宜到贵</b>”排：规则统计（长度、重复、模板痕迹）→ 自动验证（执行、答案判等、检索比对）→ LLM 裁判 → 人工抽检 → 小模型消融。强调最后一步不可省：“前面的指标只能告诉我数据像不像好数据，只有消融能告诉我它对模型有没有用。”</p>`,
    pitfall: `<ul><li>误区：裁判打分高就是好数据。裁判和生成模型同源时会互相“认可”，最好用不同家族的模型做裁判。</li>
      <li>追问：<b>合成数据占比多少合适？</b>没有固定答案：在固定总 token 下做占比曲线，同时看通用能力有没有回退。</li>
      <li>追问：<b>生成模型的许可问题？</b>部分模型的条款限制用其输出训练其他模型，选模型前要确认。</li></ul>`,
  },
  {
    id: "companies", cat: "jd", level: 3, title: "8 家 JD 拆解：各家考什么、怎么准备",
    one: "8 家都是预训练数据算法岗，共同主线是“清洗过滤去重 + 质量评估 + 合成数据 + 配比 + 管线 + 实验验证”，但各家侧重点差别很大。下面的热力图按 JD 原文整理，点公司名进入专属模拟面试。",
    points: `<div class="tablewrap"><table class="tbl">
      <tr><th>公司 / 岗位</th><th>侧重点</th><th>重点准备</th><th>模拟面试</th></tr>
      <tr><td class="nw"><b>阿里 Qwen</b><br>预训练数据算法</td><td>mid-train 阶段由模型驱动的合成与质检链路，覆盖知识、推理、代码、长文、Agent、多模态；多规模实验验证</td><td><a href="#/lesson/midtrain">Mid-training</a>、<a href="#/lesson/synth-qa">合成质检</a>、<a href="#/lesson/longctx">长文本</a>、<a href="#/lesson/agent-data">Agent 数据</a></td><td><a href="#/mock/qwen">进入 →</a></td></tr>
      <tr><td class="nw"><b>阶跃星辰</b><br>Pre-train data 算法研究员</td><td>偏研究：质量评估方法论（不只靠规则）、课程学习 / 混合 / 合成 / 自蒸馏、数据飞轮、数据分布与泛化和涌现</td><td><a href="#/lesson/ablation">数据消融</a>、<a href="#/lesson/curriculum">课程与蒸馏</a>、<a href="#/lesson/mixture">配比</a>、<a href="#/lesson/scaling">Scaling</a></td><td><a href="#/mock/stepfun">进入 →</a></td></tr>
      <tr><td class="nw"><b>九坤·至知研究院</b><br>预训练数据算法</td><td>全链路管线、合成数据、合成数据评估闭环、MinHash / 语义去重、标签体系与多样性、真实与合成数据的 scaling 配比</td><td><a href="#/lesson/synth-qa">合成质检</a>、<a href="#/lesson/taxonomy">标签体系</a>、<a href="#/lesson/dedup">去重</a>、<a href="#/lesson/pipe-sys">管线</a></td><td><a href="#/mock/ubiquant">进入 →</a></td></tr>
      <tr><td class="nw"><b>Shopee</b><br>LLM 数据算法</td><td>最偏算法细节：基于 loss / PPL / embedding / uncertainty 的数据选择、质量评分模型、drift 与覆盖度监控、数据 scaling、合成与蒸馏</td><td><a href="#/lesson/data-select">数据选择</a>、<a href="#/lesson/scaling">Scaling</a>、<a href="#/lesson/reason-data">推理蒸馏</a></td><td><a href="#/mock/shopee">进入 →</a></td></tr>
      <tr><td class="nw"><b>MiniMax</b><br>AI 数据算法</td><td>偏工程与实证：网页 / 代码 / PDF / 多语言的解析清洗，统计分析与错误案例，管线的正确性、效率、成本、可复现</td><td><a href="#/lesson/doc-parse">文档解析</a>、<a href="#/lesson/pipeline">数据管线</a>、<a href="#/lesson/pipe-sys">系统设计</a></td><td><a href="#/mock/minimax">进入 →</a></td></tr>
      <tr><td class="nw"><b>小红书 Dots</b><br>数据算法</td><td>海量数据筛选与质量评估、智能配比与动态增强、可复现的评测体系、面向预训练效率的训练算法、自动化流水线</td><td><a href="#/lesson/data-select">数据选择</a>、<a href="#/lesson/mixture">配比</a>、<a href="#/lesson/ablation">评测验证</a>、<a href="#/lesson/stability">训练稳定性</a></td><td><a href="#/mock/xhs">进入 →</a></td></tr>
      <tr><td class="nw"><b>面壁智能</b><br>LLM 算法研究员（数据）</td><td>数学、代码、长文本、科学领域的数据筛选与合成；唯一明确要求做 SFT / RLHF 并验证效果</td><td><a href="#/lesson/domain-data">领域数据</a>、<a href="#/lesson/sft">SFT</a>、<a href="#/lesson/dpo">DPO</a>、<a href="#/lesson/rlhf">RLHF</a></td><td><a href="#/mock/modelbest">进入 →</a></td></tr>
      <tr><td class="nw"><b>字节 AI 数据安全</b><br>模型数据算法</td><td>代码 / 文本 / 多模态数据合成、数据分析挖掘噪声与偏差、<b>自动标注</b>、质量与合规过滤——方向和其他几家差得最多</td><td><a href="#/lesson/synth-qa">合成质检</a>、<a href="#/lesson/taxonomy">标签与标注</a>、<a href="#/lesson/modelfilter">质量过滤</a></td><td><a href="#/mock/bytedance">进入 →</a></td></tr>
    </table></div>
    <ul><li><b>投递顺序建议</b>：先投方向最对口的几家（九坤、Qwen、阶跃——都看重标签、质量评估和合成数据，和你的分类项目最贴），把它们当练手和主攻；字节数据安全方向偏标注与合规，可以按兴趣放后面。</li>
      <li><b>每家面试前</b>：读该公司最新的模型技术报告（Qwen3 / Step 系列 / MiniMax-M 系列 / 面壁 MiniCPM 等），准备一个“我读了你们报告，对其中数据设计的看法”的问题。</li></ul>`,
    papers: [],
    answer: `<p>每家面试都会落到同一个问题：“讲讲你做过的数据项目，怎么证明有效？”所以主项目要准备三个版本：<b>研究向</b>（阶跃、Qwen：讲方法论和实验设计）、<b>工程向</b>（MiniMax、小红书：讲规模、效率、可复现）、<b>算法向</b>（Shopee、九坤：讲打分、选择、配比的算法细节）。故事是同一个，侧重点不同。</p>`,
    pitfall: `<ul><li>JD 信息来自老大提供的文档，其中 Qwen 那段原文有截断；岗位要求可能已更新，以招聘页为准。</li></ul>`,
  },
  {
    id: "resume", cat: "jd", level: 3, title: "简历怎么写：对齐 JD、量化结果、讲清方法论",
    one: "数据岗简历的核心是让面试官 30 秒内看到三件事：你处理过多大规模的数据、你怎么证明数据有效、结果对模型有多大影响。每条经历都写成“动作 + 方法 + 量化结果 + 验证方式”。",
    points: `<ul>
      <li><b>结构</b>（1 页，最多 2 页）：①抬头：姓名、联系方式、<b>求职方向：大模型预训练数据算法</b>；②个人优势 3 行：年限 + 核心方向 + 一个代表性数字；③项目 / 工作经历 3–4 个，按与 JD 的相关度排序；④技能分组：数据算法 / 数据工程 / 训练与评测；⑤论文、开源、技术博客（有就写）。</li>
      <li><b>每条经历的公式</b>：动词（设计 / 负责 / 主导）+ 对象 + 方法 + <b>量化结果</b> + 验证方式。</li>
      <li><b>四类必须出现的数字</b>：
        <ol><li><b>规模</b>：原始 X TB / X 亿文档 → 产出 Y B tokens，覆盖 Z 个类目。</li>
        <li><b>质量</b>：分类器准确率 / F1、人工抽检准确率、标注一致率。</li>
        <li><b>模型收益</b>：消融里目标基准 +a 分（种子噪声 ±c），通用基准变化 ±b；上线后主模型某项能力的提升。</li>
        <li><b>效率</b>：处理耗时、CPU / GPU 成本下降 x%，人工标注成本下降 y%。</li></ol></li>
      <li><b>对齐 JD 关键词</b>（只写真做过的）：质量评估体系、数据配比 / Data Mixing、合成数据、MinHash / 语义去重、数据选择、Scaling、mid-train、数据飞轮、标签体系、多样性度量。</li>
      <li><b>一份主简历 + 2–3 个变体</b>：投 Qwen、九坤、阶跃时，前排放合成数据与质量评估闭环、方法论；投 MiniMax、小红书时，前排放管线规模与工程效率；投 Shopee 时放数据选择与打分算法；投面壁时补上 SFT / 对齐经历。</li>
      <li><b>老大的素材怎么包装</b>：
        <ol><li><b>医学内容分类体系与覆盖率</b> → 标签体系、多样性与覆盖度量、缺口诊断与定向补数（对口九坤、阶跃、Qwen）。</li>
        <li><b>长病程医疗数据的多表关联与质量</b> → 数据正确性校验、质量问题分析与错误案例、复杂数据源的解析与对齐（对口 MiniMax、字节）。</li>
        <li><b>数据清洗、质量过滤</b> → 质量评估与过滤策略、保留率与误杀分析。</li>
        <li>如果做过打分 / 分类模型 → 自动化质量评分模型、LLM 标注蒸馏。</li></ol></li>
      <li><b>补短板的小项目</b>（2–4 周，放 GitHub）：①在 FineWeb 子集上比较“规则 / fastText / LLM 打分”三种过滤，用 1–4 亿参数的小模型做消融（几到几十 GPU·时）；②用开源模型对一份领域语料做改写或 QA 化，搭一条质检链路并做消融；③用 datatrove 或 Spark 实现分布式 MinHash，写一份性能和召回报告。有一个就能明显补上“合成数据”或“工程”这一块。</li>
      <li><b>避坑</b>：堆名词不写结果；写“参与”而说不清个人贡献；数字说不出来源；泄露公司保密信息（规模用量级或相对值表示）；医疗数据写清楚已脱敏、合规，不写具体机构和来源细节。</li></ul>`,
    papers: [],
    answer: `<p><b>改写示例</b></p>
      <p>❌ 负责医学数据清洗与分类工作，使用了 fastText、BERT 等模型，提升了数据质量。</p>
      <p>✅ 设计医学内容三级分类体系（N 个学科 × M 类内容），用 LLM 标注 + 蒸馏分类器对 X 亿文档打标（人工抽检准确率 Y%）；基于“类目 × 质量档”覆盖率矩阵定位 Z 个长尾缺口并定向召回补数，医学高质量 token 从 A 提升到 B；1B 模型消融中医学基准 +c 分（种子噪声 ±d），通用基准持平。</p>
      <p>❌ 参与预训练数据去重，处理了大量数据。</p>
      <p>✅ 主导 X TB 网页语料的 MinHash 近重复去重（5-gram，b×r = 14×8），基于 Spark 实现分桶与连通分量合并，耗时从 P 小时降到 Q 小时；对高重复域名做人工抽检，修正模板页误判，保留法规 / 指南类高价值文本。</p>
      <p class="muted">X、Y、Z 等请换成你的真实数字；每个数字都要能讲出“怎么算出来的”。</p>`,
    pitfall: `<ul><li>面试官会逐条追问简历上的数字和方法，写上去的每一项都要能展开讲 3 分钟：为什么这么做、试过什么替代方案、怎么验证、踩过什么坑。</li>
      <li>简历上写到的论文或方法，要能白板讲清原理（比如写了 MinHash，就要能推 LSH 的概率公式）。</li>
      <li>需要的话，把你的简历发我，小白按这几家 JD 帮你逐条改。</li></ul>`,
  }
);

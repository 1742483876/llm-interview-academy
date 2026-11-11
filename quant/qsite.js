// 小白量化学堂 · 站点配置
window.SITE = {
  key: "quantA", paperLib: "经典出处", paperUnit: "条", paperSec: "经典出处", paperCol: "论文 / 书籍 / 规则", paperPh: "搜名称或观点，如 夏普、凯利、动量…",
  paperTip: "从各课程汇总：论文、经典书籍与监管文件，每条一句话说清核心观点。",
  ansSec: "实战怎么用", pitSec: "常见坑 & 追问", qLib: "自测题库", qNav: "题库", qRel: "本课自测题",
  qTip: "先自己想 1 分钟，再展开参考答案对照。", rand: "🎲 随机抽一题：先想再看答案", pathTitle: "7 天入门路线", catTitle: "按模块学",
  quizDone: "可以开始写第一个回测了！",
  disclaimer: "仅供学习研究，不构成投资建议。交互图中的行情均为随机模拟数据，回测结果不代表未来收益。学习进度保存在本机浏览器。",
  sister: { href: "../index.html", name: "🧠 小白大模型面试学堂", nav: "🧠 面试学堂", desc: "预训练 · Mid-training · 后训练数据，知识点、论文观点与面试题" },
  hero: function (H) {
    return '<section class="hero"><h1>小白量化学堂</h1><p>从“会算收益”到“能识别假圣杯”，再到因子、择时和组合风控。每课都有<b>一句话结论 · 核心知识点 · 经典出处 · 实战怎么用 · 常见坑</b>，并配可以拖动的回测与因子模拟器。</p>' +
      '<div class="muted">面向个人投资者 · A 股规则整理至 2025 年公开信息 · 模拟器均使用随机生成的行情</div></section>' +
      '<h2>先看结论</h2><div class="grid2">' +
      '<div class="card verdict"><div class="vh"><span>量化必会 Top 10</span><span>点开直达</span></div><div class="vq">先把这 10 个点弄懂</div><ol>' +
      window.TOP.map(function (t) { return '<li><a href="#/lesson/' + t[1] + '">' + t[0] + "</a></li>"; }).join("") + "</ol></div>" +
      '<div class="card verdict o"><div class="vh"><span>给老大的上手建议</span><span>小白建议</span></div><div class="vq">先验证你常用的信号，别急着找新策略</div><ul>' +
      '<li>把 20 日线 / MACD / KDJ / RSI 写成规则，在自己持有的<b>板块 ETF</b> 上回测，扣成本后和“买入持有”比。</li>' +
      '<li>先学<a href="#/lesson/biases">回测七宗罪</a>和<a href="#/lesson/overfit">过拟合</a>——这和训练数据防泄漏是同一件事。</li>' +
      '<li>第一个实盘策略选低频：<a href="#/lesson/rotation">ETF 轮动</a>或<a href="#/lesson/riskparity">股债金配置</a>，资金 ≤ 10%。</li>' +
      '<li>按<a href="#/lesson/roadmap">4 个月学习路线</a>走：学习 → 回测 → 模拟盘 → 小额实盘。</li></ul></div></div>';
  },
  mid: function (H) {
    var picks = [["bt-basics", "双均线回测器"], ["overfit", "过拟合模拟器"], ["factor-test", "因子 IC 分层"], ["costs", "换手 × 成本"], ["riskparity", "风险平价"], ["kelly", "凯利公式"], ["mpt", "有效前沿"], ["dca-grid", "定投 vs 一次性"], ["returns", "波动拖累"]];
    return "<h2>一张图看懂量化流程</h2>" + H.figHtml("qflow") +
      '<h2>交互模拟器</h2><div class="grid3">' + picks.map(function (p) { return '<a class="card cat" href="#/lesson/' + p[0] + '"><div class="ct">' + p[1] + '<span class="badge">拖一拖</span></div><div class="muted">' + H.short(H.byId[p[0]].title) + "</div></a>"; }).join("") + "</div>";
  },
};

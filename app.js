/* 大模型面试学堂 · 页面逻辑 */
(function () {
  const L = window.LESSONS, CATS = window.CATS, Q = window.QUESTIONS, FIGS = window.FIGS || {};
  const S = Object.assign({
    key: "llmA", paperLib: "论文库", paperUnit: "篇", paperSec: "论文观点", ansSec: "面试这样答", pitSec: "易错点 & 面试官追问",
    qLib: "面试题库", qNav: "面试题", qRel: "本课相关面试题", qTip: "先自己口述 1–2 分钟，再展开参考答案对照。", rand: "🎲 模拟面试：先口述作答，再看答案",
    pathTitle: "7 天冲刺路线", catTitle: "按阶段学", quizDone: "稳了，去刷面试题吧！",
  }, window.SITE || {});
  const byId = {}; L.forEach((x) => { byId[x.id] = x; });
  const catById = {}; CATS.forEach((c) => { catById[c.id] = c; });
  const $ = (s) => document.querySelector(s);
  const app = $("#app");
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const lvStar = (n) => "●".repeat(n) + "○".repeat(3 - n);
  const tag = (cid) => `<span class="tag ${catById[cid].tag}">${catById[cid].name}</span>`;
  const short = (t) => t.split("：")[0];

  // ---------- 进度（本地存储） ----------
  const store = {
    get(k) { try { return new Set(JSON.parse(localStorage.getItem(k) || "[]")); } catch (e) { return new Set(); } },
    set(k, s) { try { localStorage.setItem(k, JSON.stringify(Array.from(s))); } catch (e) {} },
  };
  const DONE = S.key + "_done", GOT = S.key + "_got";
  const qKey = (q) => q.l + "|" + q.q.slice(0, 24);

  // ---------- 论文库：从课程中汇总 ----------
  const PAPERS = (() => {
    const m = new Map();
    L.forEach((x) => (x.papers || []).forEach(([n, y, v]) => {
      if (!m.has(n)) m.set(n, { n, y, v, cat: x.cat, ls: [x.id] });
      else if (!m.get(n).ls.includes(x.id)) m.get(n).ls.push(x.id);
    }));
    return Array.from(m.values());
  })();

  function figHtml(key, note, title) {
    if (!key || !FIGS[key]) return "";
    return `<div class="card figcard">${title ? `<div class="ftitle">${title}</div>` : ""}${FIGS[key]}${note ? `<div class="note">${note}</div>` : ""}</div>`;
  }
  function extraHtml(id) {
    const ex = (window.EXTRA || {})[id] || [];
    return ex.map((e) => e.w ? (window.WIDGETS && window.WIDGETS[e.k] ? `<div class="card figcard widget" data-w="${e.k}"><div class="ftitle">${e.t}<span class="wtag">可交互</span></div>${e.n ? `<div class="note" style="margin:0 2px 8px">${e.n}</div>` : ""}</div>` : "") : figHtml(e.k, e.n, e.t)).join("");
  }
  function initWidgets(root) {
    Array.prototype.forEach.call(root.querySelectorAll("[data-w]"), (el) => {
      try { window.WIDGETS[el.getAttribute("data-w")](el); } catch (err) { el.insertAdjacentHTML("beforeend", `<div class="muted">图表加载失败：${esc(err.message)}</div>`); }
    });
  }

  // ---------- 首页 ----------
  function home() {
    const done = store.get(DONE), got = store.get(GOT);
    const cats = CATS.map((c) => {
      const ls = L.filter((x) => x.cat === c.id), d = ls.filter((x) => done.has(x.id)).length;
      return `<a class="card cat" href="#/cat/${c.id}"><div class="ct">${c.name}<span class="badge">${d}/${ls.length} 课</span></div><div class="muted">${c.desc}</div></a>`;
    }).join("");
    const path = window.PATH.map((p) => `<div class="pday"><div class="pd">${p.day}</div><div><b>${p.t}</b><div class="plinks">${p.items.map((id) => `<a href="#/lesson/${id}">${done.has(id) ? "✓ " : ""}${short(byId[id].title)}</a>`).join("")}</div></div></div>`).join("");
    const pctL = Math.round((done.size / L.length) * 100), pctQ = Math.round((got.size / Q.length) * 100);
    const H = { figHtml: figHtml, byId: byId, short: short, done: done };
    const defHero = () => `
      <section class="hero"><h1>小白大模型面试学堂</h1><p>按“预训练 → Mid-training → 后训练 → 评估”串起大模型算法面试的知识点、论文观点和面试题。每课都有<b>一句话结论 · 核心知识点 · 论文观点 · 面试这样答 · 易错追问</b>，学完直接刷题。</p>
        <div class="muted">内容整理自 2025 年及之前的公开论文与技术报告 · 面试前请补读最新旗舰模型报告</div></section>
      <h2>面试结论卡</h2>
      <div class="grid2">
        <div class="card verdict"><div class="vh"><span>高频必考 Top 10</span><span>点开直达</span></div>
          <div class="vq">先把这 10 题背熟再说</div>
          <ol>${window.TOP.map(([t, id]) => `<li><a href="#/lesson/${id}">${t}</a></li>`).join("")}</ol></div>
        <div class="card verdict o"><div class="vh"><span>数据岗的差异化打法</span><span>小白建议</span></div>
          <div class="vq">把“数据怎么证明有效”讲透</div>
          <ul><li>每个数据决策都配 <b>消融实验 + 数字</b>（保留率、提升分数 vs 种子噪声）。</li>
            <li>重点准备：<a href="#/lesson/modelfilter">质量过滤</a>、<a href="#/lesson/dedup">去重</a>、<a href="#/lesson/mixture">配比</a>、<a href="#/lesson/midtrain">Mid-training</a>、<a href="#/lesson/ablation">数据消融</a>。</li>
            <li>后训练至少能手推 <a href="#/lesson/dpo">DPO</a>、写出 <a href="#/lesson/grpo">GRPO</a>。</li>
            <li>准备 3 个项目故事，见 <a href="#/lesson/story">怎么讲你的数据项目</a>。</li></ul></div>
      </div>
      ${S.homeExtra ? S.homeExtra() : ""}
      ${window.MOCK ? `<a class="card cat xlink" href="#/cat/jd" style="margin-top:12px"><div class="ct">🆕 JD 专项：8 家预训练数据岗拆解 + 模拟面试 + 简历指南<span class="badge">进入 →</span></div><div class="muted">${Object.keys(window.MOCK).map((k) => window.MOCK[k].name.split(" · ")[0]).join(" · ")}｜数据选择 · 文档解析 · PB 级管线 · 课程与蒸馏 · 标签体系 · 合成数据质检</div></a>` : ""}`;
    const defMid = () => `
      <h2>一张图看懂训练全流程</h2>${figHtml("pipeline")}
      <h2>预训练数据规模演进</h2>${figHtml("tokBar", "Chinchilla 最优约 20 tokens/参数；如今 8B 级模型就要训 15T+ tokens——数据成了瓶颈，过滤、去重、合成、配比也就成了核心竞争力。", "主流模型预训练 token 数")}
      <h2>交互图表精选</h2><div class="grid3">${[["scaling", "Chinchilla 算力计算器"], ["dedup", "MinHash S 曲线"], ["longctx", "RoPE 波长与 YaRN"], ["dpo", "DPO 损失曲线"], ["grpo", "GRPO 组内优势"], ["attention-eff", "KV Cache 计算器"]].map(([id, t]) => `<a class="card cat" href="#/lesson/${id}"><div class="ct">${t}<span class="badge">拖一拖</span></div><div class="muted">${short(byId[id].title)}</div></a>`).join("")}</div>`;
    app.innerHTML = `
      ${S.hero ? S.hero(H) : defHero()}
      <div class="kpis">
        <div><span>课程进度</span><b>${done.size}/${L.length}</b><em>${pctL}%</em><div class="bar"><i style="width:${pctL}%"></i></div></div>
        <div><span>${S.qNav}已掌握</span><b>${got.size}/${Q.length}</b><em>${pctQ}%</em><div class="bar"><i style="width:${pctQ}%"></i></div></div>
        <div><span>${S.paperSec}</span><b>${PAPERS.length}</b><em>${S.paperUnit}，按阶段可筛选</em></div>
        <div><span>测验 / 术语</span><b>${window.QUIZ.length} / ${window.GLOSSARY.length}</b><em>题 / 条</em></div>
      </div>
      ${S.mid ? S.mid(H) : defMid()}
      <h2>${S.pathTitle}</h2><div class="card">${path}</div>
      <h2>${S.catTitle}</h2><div class="grid3">${cats}
        <a class="card cat" href="#/papers"><div class="ct">${S.paperLib}<span class="badge">${PAPERS.length} ${S.paperUnit}</span></div><div class="muted">每篇一句话核心观点，按阶段筛选、可搜索</div></a>
        <a class="card cat" href="#/questions"><div class="ct">${S.qLib}<span class="badge">${Q.length} 题</span></div><div class="muted">参考答案折叠、标记已掌握、随机抽题自测</div></a>
        <a class="card cat" href="#/quiz"><div class="ct">小测验<span class="badge">${window.QUIZ.length} 题</span></div><div class="muted">选择题快测，点选项看解析</div></a>
        <a class="card cat" href="#/glossary"><div class="ct">术语表<span class="badge">${window.GLOSSARY.length} 条</span></div><div class="muted">遇到看不懂的缩写先查这里</div></a></div>
      ${S.sister ? `<h2>姊妹站</h2><a class="card cat xlink" href="${S.sister.href}"><div class="ct">${S.sister.name}<span class="badge">打开 →</span></div><div class="muted">${S.sister.desc}</div></a>` : ""}
      <p class="disclaimer">${S.disclaimer || "学习进度保存在本机浏览器。内容由小白整理，数字以论文原文为准；如发现错误欢迎指正。"}</p>`;
  }

  function catPage(id) {
    const c = catById[id]; if (!c) return home();
    const done = store.get(DONE), ls = L.filter((x) => x.cat === id);
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / ${c.name}</div><h1>${c.name}</h1><p class="muted">${c.desc}</p>
      <div class="list">${ls.map((x) => `<a class="card item" href="#/lesson/${x.id}"><div class="it"><span>${x.title}${done.has(x.id) ? '<span class="done-mark">✓ 已学</span>' : ""}</span><span class="lv" title="重要程度">${lvStar(x.level)}</span></div><div class="muted">${x.one}</div></a>`).join("")}</div>
      <p class="muted" style="margin-top:14px">● 越多 = 越重要。本阶段相关${S.qNav}：<a href="#/questions/${id}">去刷 ${Q.filter((q) => q.s === id).length} 题 →</a></p>`;
  }

  function qCard(q, i, open) {
    const got = store.get(GOT).has(qKey(q));
    return `<div class="card qb" data-k="${esc(qKey(q))}"><div class="qh"><div class="qt">${i != null ? i + ". " : ""}${q.q}</div>
      <div class="qm">${tag(q.s)}<span class="lv">${lvStar(q.lv)}</span><button class="btn tg">${open ? "收起" : "看答案"}</button><button class="btn gt ${got ? "got" : ""}">${got ? "✓ 已掌握" : "标记掌握"}</button></div></div>
      <div class="ans ${open ? "show" : ""}">${q.a}${q.l && byId[q.l] ? `<div class="muted" style="margin-top:6px">相关课程：<a href="#/lesson/${q.l}">${byId[q.l].title}</a></div>` : ""}</div></div>`;
  }
  function bindQ(root) {
    root.querySelectorAll(".qb").forEach((c) => {
      const tg = c.querySelector(".tg"), gt = c.querySelector(".gt"), an = c.querySelector(".ans");
      tg.onclick = () => { an.classList.toggle("show"); tg.textContent = an.classList.contains("show") ? "收起" : "看答案"; };
      gt.onclick = () => {
        const s = store.get(GOT), k = c.dataset.k;
        if (s.has(k)) s.delete(k); else s.add(k);
        store.set(GOT, s); gt.classList.toggle("got", s.has(k)); gt.textContent = s.has(k) ? "✓ 已掌握" : "标记掌握";
        const sc = $("#qscore"); if (sc) sc.textContent = `已掌握 ${s.size}/${Q.length}`;
      };
    });
  }

  function lessonPage(id) {
    const x = byId[id]; if (!x) return home();
    const cat = catById[x.cat], same = L.filter((y) => y.cat === x.cat), i = same.indexOf(x);
    const all = L, gi = all.indexOf(x), prev = all[gi - 1], next = all[gi + 1];
    const done = store.get(DONE);
    const rel = Q.filter((q) => q.l === id);
    const papers = (x.papers || []).length ? `<div class="sec ppr"><h3>${S.paperSec}</h3><div class="pp">${x.papers.map(([n, y, v]) => `<div class="pi"><div class="pn">${esc(n)} <span class="py">${y}</span></div><div>${esc(v)}</div></div>`).join("")}</div></div>` : "";
    const table = x.table ? `<div class="tablewrap"><table class="tbl"><tr><th>模型</th><th>发布</th><th>规模</th><th>预训练 tokens</th><th>预训练 / 中训练数据亮点</th><th>后训练配方</th></tr>${window.REPORTS.map((r) => `<tr><td class="nw"><b>${r.m}</b></td><td class="nw">${r.t}</td><td>${r.s}</td><td class="nw">${r.d}</td><td>${r.pre}</td><td>${r.post}</td></tr>`).join("")}</table></div><p class="muted">数字为各报告公开口径的约数，面试时说“约”即可。</p>` : "";
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / <a href="#/cat/${x.cat}">${cat.name}</a> · 第 ${i + 1}/${same.length} 课</div>
      <h1>${x.title}</h1><div class="muted">${tag(x.cat)} <span class="lv" style="margin-left:6px">重要度 ${lvStar(x.level)}</span></div>
      <div class="one">${x.one}</div>
      ${figHtml(x.fig)}${table}
      <div class="sec"><h3>核心知识点</h3><div>${x.points}</div></div>
      ${figHtml(x.fig2)}${extraHtml(id)}
      ${papers}
      <div class="sec sys"><h3>${S.ansSec}</h3><div>${x.answer}</div></div>
      <div class="sec warn"><h3>${S.pitSec}</h3><div>${x.pitfall}</div></div>
      ${rel.length ? `<h2>${S.qRel}（${rel.length}）</h2><div id="rel">${rel.map((q) => qCard(q, null, false)).join("")}</div>` : ""}
      <div style="margin-top:16px"><button id="mark" class="btn ${done.has(id) ? "got" : ""}">${done.has(id) ? "✓ 已学完（点击取消）" : "标记本课已学完"}</button></div>
      <div class="pager">${prev ? `<a href="#/lesson/${prev.id}">← ${short(prev.title)}</a>` : "<span></span>"}${next ? `<a href="#/lesson/${next.id}">${short(next.title)} →</a>` : ""}</div>`;
    initWidgets(app);
    if ($("#rel")) bindQ($("#rel"));
    $("#mark").onclick = () => {
      const s = store.get(DONE); if (s.has(id)) s.delete(id); else s.add(id); store.set(DONE, s);
      $("#mark").classList.toggle("got", s.has(id)); $("#mark").textContent = s.has(id) ? "✓ 已学完（点击取消）" : "标记本课已学完";
    };
  }

  function chipBar(id, items, cur) {
    return `<div class="chips" id="${id}">${items.map(([k, n]) => `<button class="chip ${k === cur ? "on" : ""}" data-k="${k}">${n}</button>`).join("")}</div>`;
  }
  const stageChips = [["all", "全部"]].concat(CATS.map((c) => [c.id, c.name]));

  function papersPage() {
    let cur = "all", kw = "";
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / ${S.paperLib}</div><h1>${S.paperLib}：每篇一句话记住核心观点</h1>
      <p class="muted">${S.paperTip || "从各课程汇总，面试时“论文名 + 一句话结论 + 对你工作的启发”三件套即可。"}</p>
      ${chipBar("pc", stageChips, cur)}<input id="pq" class="search" placeholder="${S.paperPh || "搜论文名或观点，如 DPO、去重、长上下文…"}">
      <div class="tablewrap"><table class="tbl" id="pt"></table></div>`;
    const draw = () => {
      const rows = PAPERS.filter((p) => (cur === "all" || p.cat === cur) && (!kw || (p.n + p.v).toLowerCase().includes(kw)));
      $("#pt").innerHTML = `<tr><th>${S.paperCol || "论文 / 报告"}</th><th>年份</th><th>阶段</th><th>核心观点</th><th>课程</th></tr>` +
        (rows.length ? rows.map((p) => `<tr><td><b>${esc(p.n)}</b></td><td class="nw">${p.y}</td><td class="nw">${tag(p.cat)}</td><td>${esc(p.v)}</td><td>${p.ls.map((l) => `<a href="#/lesson/${l}">${short(byId[l].title)}</a>`).join("<br>")}</td></tr>`).join("") : `<tr><td colspan="5" class="empty">没有匹配的结果</td></tr>`);
    };
    $("#pc").onclick = (e) => { const b = e.target.closest(".chip"); if (!b) return; cur = b.dataset.k; document.querySelectorAll("#pc .chip").forEach((c) => c.classList.toggle("on", c === b)); draw(); };
    $("#pq").oninput = (e) => { kw = e.target.value.trim().toLowerCase(); draw(); };
    draw();
  }

  function questionsPage(stage) {
    let cur = stage && catById[stage] ? stage : "all", lv = "all", only = false, kw = "", co = "all";
    const MK = window.MOCK || null;
    const coChips = MK ? `<div class="chips" id="qco"><span class="muted" style="align-self:center">按公司：</span><button class="chip on" data-c="all">全部</button>${Object.keys(MK).map((k) => `<button class="chip" data-c="${k}">${MK[k].name.split(" · ")[0]}</button>`).join("")}</div>` : "";
    const inCo = (q) => co === "all" || (q.co && q.co.indexOf(co) >= 0) || (MK[co].ls.indexOf(q.l) >= 0);
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / ${S.qLib}</div><h1>${S.qLib}</h1>
      <p class="muted">${S.qTip}<span id="qscore">已掌握 ${store.get(GOT).size}/${Q.length}</span></p>
      ${chipBar("qc", stageChips, cur)}${coChips}
      <div class="chips" id="qf"><button class="chip on" data-l="all">全部难度</button><button class="chip" data-l="3">●●● 高频/难</button><button class="chip" data-l="2">●●○ 中</button><button class="chip" data-l="1">●○○ 基础</button>
        <button class="chip" id="only">只看未掌握</button><button class="chip" id="rand">🎲 随机抽一题</button></div>
      <input id="qq" class="search" placeholder="搜题目关键词…">
      <div id="rbox"></div><div id="ql"></div>`;
    const draw = () => {
      const got = store.get(GOT);
      const rows = Q.filter((q) => (cur === "all" || q.s === cur) && inCo(q) && (lv === "all" || q.lv === +lv) && (!only || !got.has(qKey(q))) && (!kw || (q.q + q.a).toLowerCase().includes(kw)));
      $("#ql").innerHTML = rows.length ? rows.map((q, i) => qCard(q, i + 1, false)).join("") : `<div class="empty">没有符合条件的题目 🎉</div>`;
      bindQ($("#ql"));
    };
    $("#qc").onclick = (e) => { const b = e.target.closest(".chip"); if (!b) return; cur = b.dataset.k; document.querySelectorAll("#qc .chip").forEach((c) => c.classList.toggle("on", c === b)); draw(); };
    $("#qf").onclick = (e) => {
      const b = e.target.closest(".chip"); if (!b) return;
      if (b.id === "only") { only = !only; b.classList.toggle("on", only); return draw(); }
      if (b.id === "rand") {
        const pool = Q.filter((q) => (cur === "all" || q.s === cur) && !store.get(GOT).has(qKey(q)));
        const src = pool.length ? pool : Q, q = src[Math.floor(Math.random() * src.length)];
        $("#rbox").innerHTML = `<div class="muted">${S.rand}</div>${qCard(q, null, false)}`; bindQ($("#rbox")); return;
      }
      lv = b.dataset.l; document.querySelectorAll("#qf .chip[data-l]").forEach((c) => c.classList.toggle("on", c === b)); draw();
    };
    $("#qq").oninput = (e) => { kw = e.target.value.trim().toLowerCase(); draw(); };
    if ($("#qco")) $("#qco").onclick = (e) => { const b = e.target.closest(".chip"); if (!b) return; co = b.dataset.c; document.querySelectorAll("#qco .chip").forEach((c) => c.classList.toggle("on", c === b)); draw(); };
    draw();
  }

  function mockPage(k) {
    const MK = window.MOCK || {}, m = MK[k];
    if (!m) return questionsPage("jd");
    const own = Q.filter((q) => q.co && q.co.indexOf(k) >= 0), base = Q.filter((q) => !(q.co && q.co.indexOf(k) >= 0) && m.ls.indexOf(q.l) >= 0);
    const others = Object.keys(MK).filter((x) => x !== k).map((x) => `<a href="#/mock/${x}">${MK[x].name.split(" · ")[0]}</a>`).join(" · ");
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / <a href="#/lesson/companies">JD 拆解</a> / 模拟面试</div>
      <h1>模拟面试：${m.name}</h1><div class="muted">${m.city} · 共 ${own.length + base.length} 题（专项 ${own.length} + 相关基础 ${base.length}）</div>
      <div class="card verdict" style="margin:12px 0"><div class="vh"><span>JD 关注点</span><span>小白提示</span></div>
        <ul>${m.focus.map((f) => `<li>${f}</li>`).join("")}</ul><div class="one" style="margin:10px 0 0">${m.tip}</div>
        <div class="muted" style="margin-top:6px">相关课程：${m.ls.concat(own.map((q) => q.l)).filter((v, i, a) => a.indexOf(v) === i && byId[v]).map((l) => `<a href="#/lesson/${l}">${short(byId[l].title)}</a>`).join(" · ")}</div></div>
      <div class="chips"><button class="chip" id="mr">🎲 随机抽一题</button><span class="muted" style="align-self:center">建议：每题先口述 2 分钟，再展开对照</span></div><div id="rbox"></div>
      <h2>专项题（${own.length}）</h2><div id="mo">${own.map((q, i) => qCard(q, i + 1, false)).join("")}</div>
      <h2>相关基础题（${base.length}）</h2><div id="mb">${base.map((q, i) => qCard(q, i + 1, false)).join("")}</div>
      <p class="muted" style="margin-top:16px">其他公司：${others}</p>`;
    bindQ($("#mo")); bindQ($("#mb"));
    $("#mr").onclick = () => { const pool = own.concat(base), q = pool[Math.floor(Math.random() * pool.length)]; $("#rbox").innerHTML = qCard(q, null, false); bindQ($("#rbox")); };
  }

  function glossary() {
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / 术语表</div><h1>术语表</h1><input id="q" class="search" placeholder="搜一下，如 GRPO、去重、RoPE…">
      <div id="gl" class="gl">${window.GLOSSARY.map(([k, v]) => `<div class="gi"><b>${k}</b><div class="muted">${v}</div></div>`).join("")}</div>`;
    $("#q").addEventListener("input", (e) => {
      const t = e.target.value.trim().toLowerCase();
      document.querySelectorAll(".gi").forEach((n) => { n.style.display = !t || n.textContent.toLowerCase().includes(t) ? "" : "none"; });
    });
  }

  function quiz() {
    const QZ = window.QUIZ;
    app.innerHTML = `<div class="crumb"><a href="#/">首页</a> / 小测验</div><h1>小测验</h1><p class="muted">点选项看解析，覆盖预训练、Mid-training、后训练核心数字与结论。</p>
      ${QZ.map((q, i) => `<div class="card qz" data-i="${i}"><div class="qq">${i + 1}. ${q.q}</div>${q.o.map((o, j) => `<button class="opt" data-j="${j}">${String.fromCharCode(65 + j)}. ${o}</button>`).join("")}<div class="qe"></div></div>`).join("")}
      <div id="score" class="card">还没开始答题</div>`;
    let right = 0, done = 0;
    document.querySelectorAll(".qz").forEach((card) => {
      const q = QZ[+card.dataset.i];
      card.querySelectorAll(".opt").forEach((b) => b.addEventListener("click", () => {
        if (card.dataset.done) return;
        card.dataset.done = 1; done++;
        const ok = +b.dataset.j === q.a; if (ok) right++;
        b.classList.add(ok ? "ok" : "bad"); card.querySelectorAll(".opt")[q.a].classList.add("ok");
        card.querySelector(".qe").innerHTML = (ok ? "✅ 对了。" : "❌ 不对。") + q.e;
        $("#score").textContent = `已答 ${done}/${QZ.length}，答对 ${right} 题` + (done === QZ.length ? (right >= QZ.length * 0.8 ? " —— " + S.quizDone : " —— 回去把错题对应的课再看一遍～") : "");
      }));
    });
  }

  function route() {
    const h = location.hash.replace(/^#\/?/, "").split("/");
    const navKey = h[0] === "lesson" ? "cat/" + ((byId[h[1]] || {}).cat || "") : h[0] === "questions" ? "questions" : h[0] === "mock" ? "cat/jd" : h.join("/");
    document.querySelectorAll(".nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#/" + navKey));
    if (h[0] === "lesson") lessonPage(h[1]);
    else if (h[0] === "cat") catPage(h[1]);
    else if (h[0] === "papers") papersPage();
    else if (h[0] === "questions") questionsPage(h[1]);
    else if (h[0] === "mock") mockPage(h[1]);
    else if (window.ROUTES && window.ROUTES[h[0]]) window.ROUTES[h[0]](app, h);
    else if (h[0] === "glossary") glossary();
    else if (h[0] === "quiz") quiz();
    else home();
    window.scrollTo(0, 0);
  }
  $("#nav").innerHTML = `<a href="#/">首页</a>${CATS.map((c) => `<a href="#/cat/${c.id}">${c.name}</a>`).join("")}<a href="#/papers">${S.paperLib}</a><a href="#/questions">${S.qNav}</a><a href="#/quiz">测验</a><a href="#/glossary">术语</a>${(S.navExtra || []).map((n) => `<a href="${n.href}" class="xnav2">${n.name}</a>`).join("")}${S.sister ? `<a href="${S.sister.href}" class="xnav">${S.sister.nav || S.sister.name}</a>` : ""}`;
  window.addEventListener("hashchange", route);
  route();
})();

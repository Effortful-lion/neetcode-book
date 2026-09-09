// 统一构建：md 文档 → data.js（纯前端可加载的书单数据）
//   neetcode-roadmap.md → leetcode-data.js   (window.__BOOKS_DATA__.leetcode)
//   大厂面经.md          → interview-data.js  (window.__BOOKS_DATA__.interview)
// 用法：node build-books.mjs
import { readFileSync, writeFileSync } from 'fs';
import GO_CODE from './go-codes.mjs';

const unesc = (s) => s.replace(/\\([-+()_![\]{}#&*~`'"<>|.$\\/])/g, '$1').trim();

// ---------- 代码块保护（状态机，支持 C++ 等语言标记） ----------
function guardFences(raw) {
  const codeBlocks = [];
  const out = [];
  let inBlock = null;
  raw.split('\n').forEach((ln) => {
    const fm = /^```(.*)$/.exec(ln);
    if (fm) {
      if (inBlock === null) { inBlock = { lang: fm[1].trim().toLowerCase(), body: [] }; }
      else { codeBlocks.push({ lang: inBlock.lang, body: inBlock.body.join('\n') }); out.push(`\u0000CB${codeBlocks.length - 1}\u0000`); inBlock = null; }
      return;
    }
    if (inBlock) inBlock.body.push(ln);
    else out.push(ln);
  });
  if (inBlock) codeBlocks.push({ lang: inBlock.lang, body: inBlock.body.join('\n') });
  return { guarded: out.join('\n'), codeBlocks };
}

// ---------- 解析器 1：neetcode 结构化格式 ----------
function parseNeetcode(raw) {
  const { guarded, codeBlocks } = guardFences(raw.replace(/\r\n/g, '\n'));
  const lines = guarded.split('\n');

  // frontmatter
  const book = { title: '', subtitle: '', stats: [], short: '' };
  let i = 0;
  if (lines[0] && lines[0].trim() === '---') {
    for (i = 1; i < lines.length; i++) {
      const ln = lines[i];
      if (ln.trim() === '---') { i++; break; }
      const m = /^(\w+):\s*(.*)$/.exec(ln.trim());
      if (!m) continue;
      if (m[1] === 'title') book.title = m[2];
      else if (m[1] === 'subtitle') book.subtitle = m[2];
      else if (m[1] === 'stats') {
        book.stats = m[2].split('|').map((seg) => {
          const mm = /^\s*(\S+)\s+(.+?)\s*$/.exec(seg);
          return mm ? { v: mm[1], k: mm[2] } : null;
        }).filter(Boolean);
      }
    }
  }

  const secs = [];
  const prob = {};
  let curSec = null, curProb = null;
  let mode = ''; // 'steps' | 'code' | ''

  for (; i < lines.length; i++) {
    const ln = lines[i];
    const t = ln.trim();

    // 代码块占位符
    const cbm = /\u0000CB(\d+)\u0000/.exec(ln);
    if (cbm) {
      const cb = codeBlocks[+cbm[1]];
      if (cb.lang === 'svg' && curSec) curSec.svg = cb.body;
      else if (cb.lang === 'go' && curProb) curProb.code = cb.body.replace(/\t/g, '    ').replace(/\s+$/, '');
      continue;
    }

    const h1 = /^# (.+)$/.exec(t);
    const h2 = /^## (.+)$/.exec(t);
    const h3 = /^### (.+)$/.exec(t);

    if (h1) {
      curSec = { id: '', secName: '', short: '', name: h1[1].trim(), badge: '', desc: '', go: '', svg: '', notes: [], probs: [] };
      secs.push(curSec);
      curProb = null; mode = '';
      continue;
    }
    if (h2 && curSec) {
      const m = /^([0-9a-zA-Z]+)\.\s*(.+)$/.exec(h2[1].trim());
      const id = m ? m[1] : h2[1].trim();
      const title = m ? m[2].trim() : h2[1].trim();
      curProb = { title, slug: '', d: 'm', secName: curSec.secName || curSec.name, oneline: '', steps: [], code: '', tc: '', sc: '', extra: '' };
      prob[id] = curProb;
      curSec.probs.push(id);
      mode = '';
      continue;
    }
    if (h3) {
      mode = /思路/.test(h3[1]) ? 'steps' : (/代码/.test(h3[1]) ? 'code' : '');
      continue;
    }
    if (!t) continue;

    // 字段行（白名单制，非白名单的 - 行归入 notes）
    const fm2 = /^-\s+([^:：]+)[:：]\s*(.*)$/.exec(t);
    if (fm2) {
      const key = fm2[1].trim(), val = fm2[2].trim();
      if (curProb && mode !== 'steps') {
        if (key === 'slug') curProb.slug = val;
        else if (key === '难度') curProb.d = val;
        else if (key === '一句话') curProb.oneline = val;
        else if (key === '时间') curProb.tc = val;
        else if (key === '空间') curProb.sc = val;
        else if (key === '补充') curProb.extra = val;
        continue;
      }
      if (curSec && !curProb) {
        if (key === 'id') curSec.id = val;
        else if (key === 'short') curSec.short = val;
        else if (key === 'secname') curSec.secName = val;
        else if (key === 'badge') curSec.badge = val;
        else if (key === 'go') curSec.go = val;
        else curSec.notes.push(t.replace(/^-\s+/, ''));
        continue;
      }
    }
    // 引用块 → sec.desc
    if (/^>/.test(t) && curSec && !curProb) {
      curSec.desc += (curSec.desc ? ' ' : '') + t.replace(/^>\s?/, '');
      continue;
    }
    // 有序列表 → steps
    const ol = /^\d+\.\s+(.*)$/.exec(t);
    if (ol && mode === 'steps' && curProb) {
      curProb.steps.push(ol[1]);
      continue;
    }
    // 无序列表（sec 头部）→ notes
    if (/^-/.test(t) && curSec && !curProb) {
      curSec.notes.push(t.replace(/^-\s+/, ''));
      continue;
    }
  }
  return { book, secs, prob };
}

// ---------- 解析器 2：飞书面经格式 ----------
function parseFeishu(raw) {
  const { guarded, codeBlocks } = guardFences(raw.replace(/\r\n/g, '\n'));
  const clean = (s) => unesc(s.replace(/\*\*/g, '').replace(/^[ \t]+/, ''));
  const lines = guarded.split('\n');
  const sections = [];
  lines.forEach((ln, idx) => {
    const m = /^(#{1,3}) (.+)$/.exec(ln);
    if (!m) return;
    const tt = unesc(m[2]);
    if (/^(definition|class|def|import|from)\b/i.test(tt)) return;
    sections.push({ level: m[1].length, title: tt, start: idx });
  });

  const secs = [];
  const prob = {};
  let curSec = null, curProb = null, probId = 0;

  function flushProb() {
    if (!curProb || !curSec) return;
    const p = curProb;
    p.id = 'i' + (++probId);
    p.secName = curSec.name;
    prob[p.id] = p;
    curSec.probs.push(p.id);
    curProb = null;
  }

  function parseBody(p, bodyLines) {
    let mode = 'body';
    for (const ln of bodyLines) {
      const cbm = /\u0000CB(\d+)\u0000/.exec(ln);
      if (cbm) {
        const cb = codeBlocks[+cbm[1]];
        if (cb.body.trim()) p.codes.push({ lang: cb.lang, code: cb.body.replace(/\t/g, '    ').trimEnd() });
        continue;
      }
      const t = ln.trim();
      if (!t) continue;
      if (/^(java|python|c\+\+|go|golang|javascript|js)\s*:?\s*$/i.test(clean(t))) continue;
      if (/^\*\*🕵/.test(t) || (/面试评估/.test(t) && t.startsWith('**'))) {
        mode = 'assess';
        const rest = t.replace(/^\*\*[^*]*\*\*/, '').trim();
        if (rest) p.assess += (p.assess ? ' ' : '') + clean(rest);
        continue;
      }
      if (/难度系数/.test(t)) { p.stars = (t.match(/⭐/g) || []).length; mode = 'diff'; continue; }
      if (/^\*\*📝/.test(t) || (/思路分析/.test(t) && t.startsWith('**'))) {
        mode = 'ideas';
        const rest = t.replace(/^\*\*[^*]*\*\*/, '').trim();
        if (rest) p.ideas.push(clean(rest));
        continue;
      }
      if (/^\*\*👨‍💻/.test(t) || (/代码\(/.test(t) && t.startsWith('**'))) { mode = 'code'; continue; }
      if (/复杂度分析/.test(t)) { mode = 'tc'; continue; }
      if (/时间复杂度/.test(t)) { p.tc = clean(t.replace(/^时间复杂度[:：]?/, '')); continue; }
      if (/空间复杂度/.test(t)) { p.sc = clean(t.replace(/^空间复杂度[:：]?/, '')); continue; }
      if (/在线评测|Online Judge/i.test(t)) { mode = 'lc'; continue; }
      if (mode === 'lc') {
        const um = /leetcode\.cn\/problems\/([a-z0-9-]+)/i.exec(unesc(t).replace(/\\ /g, ''));
        if (um) p.lcSlug = um[1];
        continue;
      }
      if (/^\*\*示例/.test(t)) { mode = 'example'; continue; }
      if (mode === 'example') { p.examples.push(clean(t)); continue; }
      if (mode === 'assess') { p.assess += (p.assess ? ' ' : '') + clean(t); continue; }
      if (mode === 'ideas') { p.ideas.push(clean(t)); continue; }
      if (mode === 'tc') { if (!p.tc) p.tc = clean(t); else if (!p.sc) p.sc = clean(t); continue; }
      if (!p.companies && !/输入|输出/.test(t)) {
        const ut = unesc(t);
        const ms = [...ut.matchAll(/([一-龥A-Za-z][一-龥A-Za-z0-9&\s.·]*?)\s*[-−–]\s*[\(（]?\d{4}/g)];
        if (ms.length) { p.companies = [...new Set(ms.map((m) => m[1].trim()))].join(' · '); continue; }
      }
      p.examples.push(clean(t));
    }
  }

  for (let si = 0; si < sections.length; si++) {
    const sec = sections[si];
    const end = si + 1 < sections.length ? sections[si + 1].start : lines.length;
    const body = lines.slice(sec.start + 1, end);
    if (sec.level === 1) {
      flushProb();
      curSec = { id: 'is' + (secs.length + 1), short: sec.title, name: sec.title, badge: '', desc: '', go: '', svg: '', notes: [], probs: [] };
      secs.push(curSec);
      continue;
    }
    if (sec.level === 2 && curSec) {
      flushProb();
      curProb = { title: sec.title, companies: '', examples: [], assess: '', stars: 0, ideas: [], codes: [], tc: '', sc: '', lcSlug: '', d: 'm' };
      parseBody(curProb, body);
      curProb.d = curProb.stars >= 4 ? 'h' : curProb.stars <= 2 ? 'e' : 'm';
      curProb.oneline = curProb.assess ? curProb.assess.slice(0, 120) : (curProb.ideas[0] || '').slice(0, 120);
      continue;
    }
    if (sec.level === 3 && curProb) {
      curProb.ideas.push('**' + sec.title + '**');
      parseBody(curProb, body);
    }
  }
  flushProb();

  const validSecs = secs.filter((s) => s.probs.length > 0);
  validSecs.forEach((s) => { s.badge = s.probs.length + ' 题'; s.desc = '面试真题 · ' + s.probs.length + ' 道'; });

  // 应用手工 Go 实现覆盖多语言代码
  for (const id in prob) {
    prob[id].codes = GO_CODE[id] ? [{ lang: 'go', code: GO_CODE[id] }] : [];
    prob[id].code = GO_CODE[id] || '';
  }
  return { secs: validSecs, prob };
}

// ---------- 输出 ----------
function writeData(file, globalKey, data) {
  const content = 'window.__BOOKS_DATA__=window.__BOOKS_DATA__||{};\n'
    + 'window.__BOOKS_DATA__.' + globalKey + '=' + JSON.stringify(data) + ';';
  writeFileSync(file, content);
  console.log(file, 'written:', data.secs.length, 'secs,', Object.keys(data.prob).length, 'probs,', content.length, 'bytes');
}

// LeetCode
const lcRaw = readFileSync('neetcode-roadmap.md', 'utf8');
const lc = parseNeetcode(lcRaw);
lc.book.short = 'LeetCode Roadmap';
writeData('leetcode-data.js', 'leetcode', lc);

// 面经
const ivRaw = readFileSync('大厂面经.md', 'utf8');
const ivParsed = parseFeishu(ivRaw);
const nProbs = Object.keys(ivParsed.prob).length;
const iv = {
  book: {
    title: '大厂面经 · 常见算法题',
    subtitle: '字节 · 百度 · 阿里 · Momenta 等大厂面试真题 · 按题型分类 · 含面试评估 / 思路分析 / Go 参考代码 · 来源：飞书《大厂新鲜面经》整理',
    short: '大厂面经',
    stats: [
      { v: String(ivParsed.secs.length), k: '题型分类' },
      { v: String(nProbs), k: '面试真题' },
      { v: 'Go', k: '代码实现' }
    ]
  },
  secs: ivParsed.secs,
  prob: ivParsed.prob
};
writeData('interview-data.js', 'interview', iv);

// 专题算法 - 算法笔记汇总和算法原理汇总
const algoNotesRaw = readFileSync('docs/算法笔记汇总.md', 'utf8');
const algoPrincipleRaw = readFileSync('docs/算法原理汇总.md', 'utf8');

// 解析算法笔记汇总
const algoNotes = parseNeetcode(algoNotesRaw);
// 解析算法原理汇总
const algoPrinciple = parseNeetcode(algoPrincipleRaw);

// 合并两个内容到专题算法书单
const 专题算法 = {
  book: {
    title: '专题算法 · 算法笔记与原理',
    subtitle: '算法学习笔记汇总 + 核心算法原理详解 · 涵盖数据结构、算法专题与面试真题等内容',
    short: '专题算法',
    stats: [
      { v: String(algoNotes.secs.length + algoPrinciple.secs.length), k: '专题分类' },
      { v: 'Go', k: '代码实现' }
    ]
  },
  secs: [...algoNotes.secs, ...algoPrinciple.secs],
  prob: { ...algoNotes.prob, ...algoPrinciple.prob }
};

writeData('special-algorithm-data.js', 'specialAlgorithm', 专题算法);

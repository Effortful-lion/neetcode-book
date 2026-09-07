// 解析 大厂面经.md → interview-data.js（第二个书单数据）
// 结构：window.__INTERVIEW_DATA__ = { secs: [...], prob: {...} }
import { readFileSync, writeFileSync } from 'fs';

const raw = readFileSync('大厂面经.md', 'utf8').replace(/\r\n/g, '\n');

// ---------- 工具 ----------
const unesc = (s) => s.replace(/\\([-+()_![\]{}#&*~`'"<>|.$\\/])/g, '$1').trim();
const clean = (s) => unesc(s.replace(/\*\*/g, '').replace(/^[ \t]+/, ''));

// 先保护代码块（状态机逐行解析，支持 C++ 等含特殊字符的语言标记）
const codeBlocks = [];
{
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
  var guarded = out.join('\n');
}

// ---------- 按标题切分 ----------
const lines = guarded.split('\n');
const sections = [];
lines.forEach((ln, i) => {
  const m = /^(#{1,3}) (.+)$/.exec(ln);
  if (!m) return;
  const t = unesc(m[2]);
  // 排除 Python 注释样式的误报（# Definition... / # class ...）
  if (/^(definition|class|def|import|from)\b/i.test(t)) return;
  sections.push({ level: m[1].length, title: t, start: i });
});

// ---------- 组装书结构 ----------
const secs = [];
let curSec = null;
let curProb = null;
const prob = {};
let probId = 0;

const flushProb = () => {
  if (!curProb || !curSec) return;
  const p = curProb;
  p.id = 'i' + (++probId);
  p.secName = curSec.name;
  prob[p.id] = p;
  curSec.probs.push(p.id);
  curProb = null;
};

// 解析一道题的正文（section start 到下一 section 之间的所有行）
function parseProbBody(p, bodyLines) {
  let mode = 'body';
  for (let bi = 0; bi < bodyLines.length; bi++) {
    const ln = bodyLines[bi];
    // 代码块占位符
    const cbm = /\u0000CB(\d+)\u0000/.exec(ln);
    if (cbm) {
      const cb = codeBlocks[+cbm[1]];
      if (cb.body.trim()) p.codes.push({ lang: cb.lang, code: cb.body.replace(/\t/g, '    ').trimEnd() });
      continue;
    }
    const t = ln.trim();
    if (!t) continue;
    // 语言标记行（**Java: ** / **C\+\+: ** 等，clean 后匹配）
    if (/^(java|python|c\+\+|go|golang|javascript|js)\s*:?\s*$/i.test(clean(t))) continue;
    if (/^\*\*🕵/.test(t) || (/面试评估/.test(t) && t.startsWith('**'))) {
      mode = 'assess';
      const rest = t.replace(/^\*\*[^*]*\*\*/, '').trim();
      if (rest) p.assess += (p.assess ? ' ' : '') + clean(rest);
      continue;
    }
    if (/难度系数/.test(t)) {
      mode = 'diff';
      p.stars = (t.match(/⭐/g) || []).length;
      continue;
    }
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
    // body 区：公司出处行（「公司 - 日期」模式，注意飞书把 - 转义为 \-）
    if (!p.companies && !/输入|输出/.test(t)) {
      const ut = unesc(t);
      const ms = [...ut.matchAll(/([\u4e00-\u9fa5A-Za-z][\u4e00-\u9fa5A-Za-z0-9&\s.·]*?)\s*[-−–]\s*[\(（]?\d{4}/g)];
      if (ms.length) {
        p.companies = [...new Set(ms.map((m) => m[1].trim()))].join(' · ');
        continue;
      }
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
    curSec = {
      id: 'is' + (secs.length + 1),
      name: sec.title,
      short: sec.title,
      badge: '',
      desc: '',
      go: '',
      svg: '',
      notes: [],
      probs: [],
    };
    secs.push(curSec);
    continue;
  }

  if (sec.level === 2) {
    flushProb();
    curProb = {
      title: sec.title,
      companies: '',
      examples: [],
      assess: '',
      stars: 0,
      ideas: [],
      codes: [],
      tc: '',
      sc: '',
      lcSlug: '',
      d: 'm',
    };
    parseProbBody(curProb, body);
    // 难度映射：1-2星 e / 3星 m / 4-5星 h
    curProb.d = curProb.stars >= 4 ? 'h' : curProb.stars <= 2 ? 'e' : 'm';
    // 一句话思路：评估优先，否则思路第一段
    curProb.oneline = curProb.assess ? curProb.assess.slice(0, 120) : (curProb.ideas[0] || '').slice(0, 120);
    continue;
  }

  if (sec.level === 3 && curProb) {
    curProb.ideas.push('**' + sec.title + '**');
    parseProbBody(curProb, body);
  }
}
flushProb();

// sec 元信息（过滤空分类，如文档总标题）
const validSecs = secs.filter((s) => s.probs.length > 0);
validSecs.forEach((s) => {
  s.badge = s.probs.length + ' 题';
  s.desc = '面试真题 · ' + s.probs.length + ' 道';
});

const data = { secs: validSecs, prob };
writeFileSync('interview-data.js', 'window.__INTERVIEW_DATA__=' + JSON.stringify(data) + ';');
// 统计
const probs = Object.values(prob);
console.log('secs:', secs.length, 'probs:', probs.length);
console.log('with companies:', probs.filter((p) => p.companies).length);
console.log('with lcSlug:', probs.filter((p) => p.lcSlug).length);
console.log('with code:', probs.filter((p) => p.codes.length).length);
console.log('no code:', probs.filter((p) => !p.codes.length).map((p) => p.id + ' ' + p.title).join(' | '));
console.log('size:', JSON.stringify(data).length, 'bytes');

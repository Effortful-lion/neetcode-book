// 从 leetcode-roadmap.html 提取内嵌 SECS/PROB 数据 → neetcode-roadmap.md
import { readFileSync, writeFileSync } from 'fs';

const html = readFileSync('leetcode-roadmap.html', 'utf8');

// 截取数据区：「数据（分批追加）」注释之后 到 /*PROB_DATA*/ 之前
const startMark = '/* ================= 数据（分批追加） ================= */';
const endMark = '/*PROB_DATA*/';
const si = html.indexOf(startMark);
const ei = html.indexOf(endMark);
if (si < 0 || ei < 0) { console.error('data markers not found'); process.exit(1); }
const code = html.slice(si + startMark.length, ei);

// 沙箱执行数据代码
const SECS = [];
const PROB = {};
new Function('SECS', 'PROB', code)(SECS, PROB);
console.log('extracted secs:', SECS.length, 'probs:', Object.keys(PROB).length);

// ---------- 生成 md ----------
const diffName = { e: 'e', m: 'm', h: 'h' };
let md = '';
md += '---\n';
md += 'key: leetcode\n';
md += 'title: LeetCode 刷题 Roadmap · 解题手册\n';
md += 'subtitle: 16 专题 · 124 题 · 每题点击进入独立解题页（详细思路 + Go 代码 + 时空复杂度）· 来源：CSDN《LEETCODE PATTERNS & Neetcode 刷题记录》整理\n';
md += 'stats: 16 专题 | 124 收录题 | 123 去重题 | Go 代码实现\n';
md += '---\n\n';

SECS.forEach((s) => {
  md += `# ${s.name}\n\n`;
  md += `- id: ${s.id}\n`;
  md += `- short: ${s.short}\n`;
  const secName = s.probs.length && PROB[s.probs[0]] ? PROB[s.probs[0]].secName : s.name;
  md += `- secname: ${secName}\n`;
  if (s.badge) md += `- badge: ${s.badge}\n`;
  if (s.go) md += `- go: ${s.go}\n`;
  md += '\n';
  if (s.desc) md += `> ${s.desc}\n\n`;
  if (s.svg) md += '```svg\n' + s.svg + '\n```\n\n';
  if (s.notes && s.notes.length) {
    s.notes.forEach((n) => { md += `- ${n}\n`; });
    md += '\n';
  }

  s.probs.forEach((id) => {
    const p = PROB[id];
    if (!p) { console.error('missing prob', id); return; }
    md += `## ${id}. ${p.title}\n\n`;
    md += `- slug: ${p.slug}\n`;
    md += `- 难度: ${p.d}\n`;
    if (p.oneline) md += `- 一句话: ${p.oneline}\n`;
    md += '\n';
    if (p.steps && p.steps.length) {
      md += '### 思路\n\n';
      p.steps.forEach((st, i) => { md += `${i + 1}. ${st}\n`; });
      md += '\n';
    }
    if (p.code) {
      md += '### Go 代码\n\n';
      md += '```go\n' + p.code + '\n```\n\n';
    }
    md += `- 时间: ${p.tc}\n`;
    md += `- 空间: ${p.sc}\n`;
    if (p.extra) md += `- 补充: ${p.extra}\n`;
    md += '\n';
  });
});

writeFileSync('neetcode-roadmap.md', md);
console.log('neetcode-roadmap.md written,', md.length, 'chars,', md.split('\n').length, 'lines');

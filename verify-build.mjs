import { readFileSync } from 'fs';

// 1. 内联 script 语法
const html = readFileSync('leetcode-roadmap.html', 'utf8');
const m = html.match(/<script>([\s\S]*?)<\/script>/);
if (!m) { console.log('NO inline script'); process.exit(1); }
try { new Function(m[1]); console.log('inline script: syntax OK'); }
catch (e) { console.log('SYNTAX ERROR:', e.message); process.exit(1); }

// 2. 旧全局变量残留
const stale = [];
if (html.includes('__INTERVIEW_DATA__')) stale.push('__INTERVIEW_DATA__');
if (html.includes('SECS.push(')) stale.push('SECS.push(');
if (/PROB\['\d+'\]=\{/.test(html)) stale.push('PROB[...]= data');
console.log('stale references:', stale.length ? stale.join(', ') : 'NONE');

// 3. 外链标签
console.log('leetcode-data.js script:', html.includes('src="leetcode-data.js"') ? 'OK' : 'MISSING');
console.log('interview-data.js script:', html.includes('src="interview-data.js"') ? 'OK' : 'MISSING');
console.log('registerBooks:', html.includes('registerBooks') ? 'OK' : 'MISSING');

// 4. 两个 data.js 语法 + 数据完整性
for (const [f, key] of [['leetcode-data.js', 'leetcode'], ['interview-data.js', 'interview']]) {
  const js = readFileSync(f, 'utf8');
  const sb = { window: {} };
  try { new Function('window', js)(sb.window); }
  catch (e) { console.log(f, 'SYNTAX ERROR:', e.message); process.exit(1); }
  const d = sb.window.__BOOKS_DATA__ && sb.window.__BOOKS_DATA__[key];
  if (!d) { console.log(f, 'data missing'); process.exit(1); }
  console.log(f + ':', d.secs.length, 'secs /', Object.keys(d.prob).length, 'probs / book title:', d.book.title);
  // secs→probs 完整性
  let bad = 0;
  d.secs.forEach((s) => s.probs.forEach((id) => { if (!d.prob[id]) bad++; }));
  console.log('  integrity:', bad === 0 ? 'OK' : bad + ' missing');
}

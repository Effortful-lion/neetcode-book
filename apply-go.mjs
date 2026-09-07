import { readFileSync, writeFileSync } from 'fs';
import GO_CODE from './go-codes.mjs';

const s = readFileSync('interview-data.js', 'utf8');
const data = JSON.parse(s.slice('window.__INTERVIEW_DATA__='.length).replace(/;$/, ''));

const missing = [];
let withGo = 0;
for (const id in data.prob) {
  const p = data.prob[id];
  const go = GO_CODE[id];
  if (go) {
    p.codes = [{ lang: 'go', code: go }];
    withGo++;
  } else {
    p.codes = [];
    missing.push(id);
  }
}

// 输出文件
writeFileSync('interview-data.js', 'window.__INTERVIEW_DATA__=' + JSON.stringify(data) + ';');
console.log('Total probs:', Object.keys(data.prob).length);
console.log('With Go code:', withGo);
console.log('Missing Go code:', missing.length ? missing.join(', ') : 'NONE');

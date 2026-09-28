const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/useMarketData.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `  marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST';
  realTechnicals: {`;

const repl = `  marketState: 'REGULAR' | 'CLOSED' | 'PRE' | 'POST';
  pe?: number;
  pb?: number;
  eps?: number;
  marketCap?: number;
  realTechnicals: {`;

content = content.replace(target, repl);
fs.writeFileSync(file, content);
console.log('Interface updated');

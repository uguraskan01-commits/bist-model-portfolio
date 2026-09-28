const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/useMarketData.ts');
let content = fs.readFileSync(file, 'utf8');

const target = `  high52w: number | null;
  low52w: number | null;`;

const repl = `  high52w: number | null;
  low52w: number | null;
  pe?: number;
  pb?: number;
  eps?: number;`;

content = content.replace(target, repl);
fs.writeFileSync(file, content);
console.log('Interface fixed');

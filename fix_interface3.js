const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/useMarketData.ts');
let content = fs.readFileSync(file, 'utf8');

// replace the duplicates
content = content.replace("  pe?: number;\n  pb?: number;\n  eps?: number;\n", "");
content = content.replace("  pe: number | null;", "  pe: number | null;\n  pb?: number | null;");

fs.writeFileSync(file, content);
console.log('Fixed interface for good');

const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'app/api/stocks/route.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  "import yahooFinance from 'yahoo-finance2';\n\nconst yf = yahooFinance;\nyf.suppressNotices(['yahooSurvey']);",
  "import YahooFinance from 'yahoo-finance2';\n\nconst yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });"
);

fs.writeFileSync(file, content);
console.log('Fixed instantiation');

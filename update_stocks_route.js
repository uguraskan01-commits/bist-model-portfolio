const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'app/api/stocks/route.ts');
let content = fs.readFileSync(filePath, 'utf8');

if (!content.includes("yahoo-finance2")) {
  const importStr = "import yahooFinance from 'yahoo-finance2';\nconst yf = yahooFinance;\nyf.suppressNotices(['yahooSurvey']);\n";
  content = content.replace("import { NextResponse } from 'next/server';", "import { NextResponse } from 'next/server';\n" + importStr);
  
  // replace the BATCH loop in fetchWithSpark? Actually I should just do a separate fetch for quotes.
  // Wait, I can just do this through the file editor.
}

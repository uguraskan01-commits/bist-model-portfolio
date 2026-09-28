const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/useMarketData.ts');
let content = fs.readFileSync(file, 'utf8');

// Looking for the part where it applies live price.
// In applyLivePrice(), it takes `bistData: BISTStock[]` and patches it.
// Right now, `lib/bist-data.ts` returns empty values for fundamental.pe etc.
// In `lib/useMarketData.ts`, we need to read from `quotes[stock.symbol].pe`.

content = content.replace(
  "fundamental: {\n            ...stock.fundamental,",
  "fundamental: {\n            ...stock.fundamental,\n            pe: liveQuote.pe || stock.fundamental.pe,\n            pb: liveQuote.pb || stock.fundamental.pb,\n            evEbitda: stock.fundamental.evEbitda, // evEbitda may not be available from API\n            roe: stock.fundamental.roe, // maybe we calculate roe from PB / PE? ROE = PB / PE\n"
);

// Actually, let me just add a line to calculate ROE dynamically.
// ROE = P/B / P/E = EPS / Book Value. If PE is > 0, ROE = (P/B) / (P/E) * 100.
// And remove the fake foreignOwnership logic or just leave it zero.

fs.writeFileSync(file, content);
console.log('useMarketData updated');

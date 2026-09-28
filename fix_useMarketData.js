const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/useMarketData.ts');
let content = fs.readFileSync(file, 'utf8');

const target1 = `  // Temel Analiz Çarpanları
  let fundamental = (stock as any).fundamental;
  if (fundamental && quote.pe != null && quote.pe > 0) {
    fundamental = {
      ...fundamental,
      pe: +(quote.pe).toFixed(1),
    };
  }`;

const repl1 = `  // Temel Analiz Çarpanları
  let fundamental = (stock as any).fundamental || {};
  const rawPe = quote.pe || fundamental.pe || 0;
  const rawPb = quote.pb || fundamental.pb || 0;
  const eps = quote.eps || 0;
  
  let computedRoe = fundamental.roe || 0;
  if (rawPe > 0 && rawPb > 0) {
    computedRoe = (rawPb / rawPe) * 100;
  } else if (rawPb > 0 && eps > 0 && livePrice > 0) {
    const bookValue = livePrice / rawPb;
    computedRoe = (eps / bookValue) * 100;
  }

  fundamental = {
    ...fundamental,
    pe: rawPe > 0 ? +(rawPe).toFixed(1) : 0,
    pb: rawPb > 0 ? +(rawPb).toFixed(1) : 0,
    roe: computedRoe !== 0 ? +(computedRoe).toFixed(1) : 0,
  };`;

content = content.replace(target1, repl1);

const target2 = `    return {
      ...stock,
      currentPrice: livePrice,
      changePercent,
      high52w,
      low52w,`;

const repl2 = `    return {
      ...stock,
      currentPrice: livePrice,
      changePercent,
      high52w,
      low52w,
      marketCap: quote.marketCap ? +(quote.marketCap / 1000000000).toFixed(1) : stock.marketCap,`;

content = content.replace(target2, repl2);

fs.writeFileSync(file, content);
console.log('useMarketData updated');

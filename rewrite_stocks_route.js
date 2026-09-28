const fs = require('fs');
const path = require('path');

const newCode = `
import { NextResponse } from 'next/server';
import { CURATED_BIST_RAW } from '@/lib/bist-data';
import { calcSMA, calcRSI, calcMACD, calcBollinger } from '@/lib/technical-indicators';
import YahooFinance from 'yahoo-finance2';

const yf = new YahooFinance({ suppressNotices: ['yahooSurvey'] });

const BIST_TUM_SYMBOLS = CURATED_BIST_RAW.map((s) => s.symbol);
const memCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; 

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
};

async function fetchSparkChunks(symbols: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const BATCH = 20;
  
  for (let i = 0; i < symbols.length; i += BATCH) {
    const chunk = symbols.slice(i, i + BATCH);
    const batch = chunk.map(s => \`\${s}.IS\`).join(',');
    const url = \`https://query1.finance.yahoo.com/v7/finance/spark?symbols=\${batch}&range=1y&interval=1d\`;
    
    try {
      const res = await fetch(url, { headers: BROWSER_HEADERS, signal: AbortSignal.timeout(10000), cache: 'no-store' });
      if (!res.ok) continue;
      const json = await res.json();
      const sparkResults = json?.spark?.result ?? [];
      const currentYear = new Date().getFullYear();
      
      for (const r of sparkResults) {
        const symbol = r.symbol?.replace('.IS', '');
        const meta = r.response?.[0]?.meta;
        if (!symbol || !meta) continue;

        const timestamps = r.response?.[0]?.timestamp || [];
        const closes = r.response?.[0]?.indicators?.quote?.[0]?.close || [];
        
        const validData = [];
        for (let j = 0; j < closes.length; j++) {
          if (closes[j] != null && timestamps[j] != null) {
            validData.push({ t: timestamps[j], c: closes[j] });
          }
        }

        let change = null;
        if (validData.length >= 2) {
          const lastIndex = validData.length - 1;
          const currentPrice = meta.regularMarketPrice ?? validData[lastIndex].c;
          const prevDayClose = validData[lastIndex - 1].c;
          if (prevDayClose > 0) change = ((currentPrice - prevDayClose) / prevDayClose) * 100;
        }
        if (change != null) {
          if (change < -10) change = -10;
          if (change > 20) change = 20;
        }

        const closeArray = validData.map(d => d.c);
        let realTechnicals = null;
        if (closeArray.length > 50) {
          realTechnicals = {
            sma20: calcSMA(closeArray, 20),
            sma50: calcSMA(closeArray, 50),
            sma200: calcSMA(closeArray, 200),
            rsi14: calcRSI(closeArray, 14),
            macd: calcMACD(closeArray),
            bollinger: calcBollinger(closeArray, 20)
          };
        }

        results[symbol] = {
          price: meta.regularMarketPrice ?? null,
          change,
          volume: meta.regularMarketVolume ?? null,
          high52w: meta.fiftyTwoWeekHigh ?? null,
          low52w: meta.fiftyTwoWeekLow ?? null,
          realTechnicals
        };
      }
    } catch (err) {}
  }
  return results;
}

export async function GET(request: Request) {
  try {
    const now = Date.now();
    const cached = memCache.get('bist-stocks');
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ success: true, data: cached.data, fromCache: true });
    }

    const sparkData = await fetchSparkChunks(BIST_TUM_SYMBOLS);
    
    // Fetch Yahoo Quote Data using yahooFinance2
    const yfSymbols = BIST_TUM_SYMBOLS.map(s => \`\${s}.IS\`);
    let quoteData = [];
    try {
      quoteData = await yf.quote(yfSymbols);
    } catch (err) {
      console.error('Yahoo Finance quote error:', err);
    }

    // Combine Spark and Quote data
    const finalData: Record<string, any> = {};
    for (const sym of BIST_TUM_SYMBOLS) {
      const s = sparkData[sym] || {};
      const q = quoteData.find((x: any) => x.symbol === \`\${sym}.IS\`) || {};
      
      finalData[sym] = {
        ...s,
        price: q.regularMarketPrice || s.price || 0,
        change: q.regularMarketChangePercent || s.change || 0,
        volume: q.regularMarketVolume || s.volume || 0,
        high52w: q.fiftyTwoWeekHigh || s.high52w || 0,
        low52w: q.fiftyTwoWeekLow || s.low52w || 0,
        marketCap: q.marketCap || 0,
        pe: q.trailingPE || q.forwardPE || 0,
        pb: q.priceToBook || 0,
        eps: q.epsTrailingTwelveMonths || 0
      };
    }

    memCache.set('bist-stocks', { data: finalData, ts: now });
    return NextResponse.json({ success: true, data: finalData, fromCache: false });

  } catch (error: any) {
    console.error('[API/stocks] Error:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}

export async function POST() {
  memCache.clear();
  return NextResponse.json({ success: true, message: 'Cache temizlendi.' });
}
`;

fs.writeFileSync(path.join(process.cwd(), 'app/api/stocks/route.ts'), newCode);
console.log('stocks route rewritten again.');

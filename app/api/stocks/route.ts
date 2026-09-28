import { NextResponse } from 'next/server';
import { BIST_TUM_RAW } from '@/lib/bist-data';
import { calcSMA, calcRSI, calcMACD, calcBollinger } from '@/lib/technical-indicators';

// BIST TÜM — Sembol Havuzu
const BIST_TUM_SYMBOLS = BIST_TUM_RAW.map((s) => s.symbol);

// Bellek cache
const memCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 dakika

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  'Accept': 'application/json, text/plain, */*',
};

// Yahoo Finance v7 Spark API (Toplu Çekim)
async function fetchWithSpark(symbols: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const BATCH = 20; // 20 sembollük batchler (Yahoo Spark max 20 destekler)
  
  const chunks: string[][] = [];
  for (let i = 0; i < symbols.length; i += BATCH) {
    chunks.push(symbols.slice(i, i + BATCH));
  }

  // Yahoo'nun rate-limitine (429) takılmamak için chunkları sıralı veya düşük eşzamanlılıkla çekeceğiz.
  // Burada sıralı (sequential) çekim yapıyoruz, batch=50 olduğu için toplam ~12 istek atılacak (hızlıdır).
  for (const chunk of chunks) {
    const batch = chunk.map(s => `${s}.IS`).join(',');
    const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${batch}&range=1y&interval=1d`;
    
    try {
      const res = await fetch(url, {
        headers: BROWSER_HEADERS,
        signal: AbortSignal.timeout(10000),
        cache: 'no-store'
      });
      
      if (!res.ok) {
         console.error('Fetch failed for chunk starting with:', chunk[0], res.status);
         continue;
      }
      
      const json = await res.json();
      const sparkResults = json?.spark?.result ?? [];
      const currentYear = new Date().getFullYear();
      
      for (const r of sparkResults) {
        const symbol = r.symbol?.replace('.IS', '');
        const meta = r.response?.[0]?.meta;
        if (!symbol || !meta) continue;

        const timestamps = r.response?.[0]?.timestamp || [];
        const closes = r.response?.[0]?.indicators?.quote?.[0]?.close || [];
        
        // Filter out nulls but keep indices aligned
        const validData = [];
        for (let i = 0; i < closes.length; i++) {
          if (closes[i] != null && timestamps[i] != null) {
            validData.push({ t: timestamps[i], c: closes[i] });
          }
        }

        let weeklyReturn = null;
        let monthlyReturn = null;
        let ytdReturn = null;

        if (validData.length > 0) {
          const lastIndex = validData.length - 1;
          const lastClose = validData[lastIndex].c;

          // Weekly: approx 5 trading days ago
          if (validData.length >= 6) {
            const wClose = validData[lastIndex - 5].c;
            weeklyReturn = ((lastClose - wClose) / wClose) * 100;
          }

          // Monthly: approx 21 trading days ago
          if (validData.length >= 22) {
            const mClose = validData[lastIndex - 21].c;
            monthlyReturn = ((lastClose - mClose) / mClose) * 100;
          }

          // YTD: find first trading day of the current year
          const ytdStartItem = validData.find(d => new Date(d.t * 1000).getFullYear() === currentYear);
          if (ytdStartItem) {
            ytdReturn = ((lastClose - ytdStartItem.c) / ytdStartItem.c) * 100;
          }
        }
        
        let change = null;
        if (validData.length >= 2) {
          const lastIndex = validData.length - 1;
          const currentPrice = meta.regularMarketPrice ?? validData[lastIndex].c;
          
          // If market is open, validData[lastIndex] is current day, validData[lastIndex-1] is previous day
          // If market is closed, validData[lastIndex] is previous day... 
          // Wait, actually, Yahoo returns the live price as regularMarketPrice, and chartPreviousClose is the 1y old price.
          // Let's use previousClose from Yahoo quote API? Spark doesn't have yesterday's close in meta reliably.
          // But validData[lastIndex - 1] is exactly the previous day's close!
          const prevDayClose = validData[lastIndex - 1].c;
          if (prevDayClose > 0) {
            change = ((currentPrice - prevDayClose) / prevDayClose) * 100;
          }
        }
        // BIST Circuit Breaker Clamping
        if (change != null) {
          if (change < -10) change = -10;
          if (change > 20) change = 20;
        }

        // Calculate Technical Indicators
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
          symbol,
          price: meta.regularMarketPrice ?? null,
          change,
          weeklyReturn,
          monthlyReturn,
          ytdReturn,
          volume: meta.regularMarketVolume ?? null,
          previousClose: validData.length >= 2 ? validData[validData.length - 2].c : null,
          high52w: meta.fiftyTwoWeekHigh ?? null,
          low52w: meta.fiftyTwoWeekLow ?? null,
          currency: meta.currency ?? 'TRY',
          marketState: 'REGULAR',
          realTechnicals
        };
      }
    } catch (err) {
      console.error(`Spark fetch error for chunk`, chunk[0], err);
    }
  }
  
  return results;
}

export async function GET(request: Request) {
  try {
    const now = Date.now();
    const cached = memCache.get('bist-stocks');
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ 
        success: true, data: cached.data, fromCache: true,
        cachedAt: new Date(cached.ts).toISOString(),
        count: Object.keys(cached.data).length,
      });
    }

    const data = await fetchWithSpark(BIST_TUM_SYMBOLS);
    const source = 'yahoo-spark';

    if (Object.keys(data).length === 0) {
      return NextResponse.json({
        success: false,
        error: 'Tüm veri kaynakları başarısız oldu. Statik veriler kullanılıyor.',
        data: {}, count: 0, source: 'none',
      }, { status: 503 });
    }

    memCache.set('bist-stocks', { data, ts: now });

    return NextResponse.json({
      success: true, data,
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      count: Object.keys(data).length,
      source,
    });

  } catch (error: any) {
    console.error('[API/stocks] Kritik hata:', error?.message);
    return NextResponse.json({ success: false, error: error?.message, data: {}, count: 0 }, { status: 500 });
  }
}

export async function POST() {
  memCache.clear();
  return NextResponse.json({ success: true, message: 'Cache temizlendi.' });
}
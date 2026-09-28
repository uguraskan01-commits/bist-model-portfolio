import { NextResponse } from 'next/server';

export interface Candle {
  time: number;
  date: string;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  volume: number;
  change: number; // Dünkü kapanışa göre gerçek günlük değişim %
  intradayChange: number; // Açılışa göre gün içi değişim %
  isBull: boolean;
  isTaban: boolean;
  isTavan: boolean;
  sma20: number | null;
  sma50: number | null;
}

// In-memory cache for chart candles (TTL 3 minutes)
const chartCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 3 * 60 * 1000;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawSymbol = searchParams.get('symbol')?.trim().toUpperCase() || 'THYAO';
  const range = searchParams.get('range')?.trim() || '3mo';
  const interval = searchParams.get('interval')?.trim() || '1d';

  const cacheKey = `${rawSymbol}_${range}_${interval}`;
  const cached = chartCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
    return NextResponse.json(cached.data);
  }

  try {
    const yahooSymbol = `${rawSymbol}.IS`;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=${interval}&range=${range}`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json',
      },
      next: { revalidate: 180 },
    });

    if (res.ok) {
      const json = await res.json();
      const result = json?.chart?.result?.[0];

      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps: number[] = result.timestamp;
        const quotes = result.indicators.quote[0];
        const metaChartPrevClose = Number(result.meta?.chartPreviousClose ?? 0);

        const rawItems: {
          time: number;
          date: string;
          fullDate: string;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        }[] = [];

        for (let i = 0; i < timestamps.length; i++) {
          const o = quotes.open[i];
          const h = quotes.high[i];
          const l = quotes.low[i];
          const c = quotes.close[i];
          const v = quotes.volume?.[i] ?? 0;

          if (o != null && h != null && l != null && c != null) {
            const time = timestamps[i];
            const d = new Date(time * 1000);
            const dateStr = d.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
            const fullDateStr = d.toISOString().slice(0, 10);
            const openVal = Number(o.toFixed(2));
            const highVal = Number(h.toFixed(2));
            const lowVal = Number(l.toFixed(2));
            const closeVal = Number(c.toFixed(2));

            rawItems.push({
              time,
              date: dateStr,
              fullDate: fullDateStr,
              open: openVal,
              high: highVal,
              low: lowVal,
              close: closeVal,
              volume: v,
            });
          }
        }

        if (rawItems.length > 0) {
          // Borsa İstanbul kuralına göre günlük değişim dünkü kapanışa göredir!
          const candles: Candle[] = rawItems.map((c, i) => {
            const prevClose = i > 0 ? rawItems[i - 1].close : (metaChartPrevClose > 0 ? metaChartPrevClose : c.open);
            const change = prevClose > 0 ? Number((((c.close - prevClose) / prevClose) * 100).toFixed(2)) : 0;
            const intradayChange = c.open > 0 ? Number((((c.close - c.open) / c.open) * 100).toFixed(2)) : 0;

            // Boğa / Ayı: Açılış-Kapanış eşitse (örn. Taban veya Doji), dünkü kapanışa göre yön belirlenir
            const isBull = c.close > c.open ? true : c.close < c.open ? false : change >= 0;
            const isTaban = change <= -9.85;
            const isTavan = change >= 9.85;

            // SMA 20
            let sma20: number | null = null;
            if (i >= 19) {
              const slice20 = rawItems.slice(i - 19, i + 1);
              const sum = slice20.reduce((acc, curr) => acc + curr.close, 0);
              sma20 = Number((sum / 20).toFixed(2));
            }

            // SMA 50
            let sma50: number | null = null;
            if (i >= 49) {
              const slice50 = rawItems.slice(i - 49, i + 1);
              const sum = slice50.reduce((acc, curr) => acc + curr.close, 0);
              sma50 = Number((sum / 50).toFixed(2));
            }

            // SMA 5
            let sma5: number | null = null;
            if (i >= 4) {
              const slice5 = rawItems.slice(i - 4, i + 1);
              const sum = slice5.reduce((acc, curr) => acc + curr.close, 0);
              sma5 = Number((sum / 5).toFixed(2));
            }

            return {
              ...c,
              prevClose,
              change,
              intradayChange,
              isBull,
              isTaban,
              isTavan,
              sma5,
              sma20,
              sma50,
            };
          });

          const minPrice = Math.min(...candles.map((c) => c.low));
          const maxPrice = Math.max(...candles.map((c) => c.high));
          const lastCandle = candles[candles.length - 1];
          const firstCandle = candles[0];
          const totalChangePercent = firstCandle.open > 0
            ? Number((((lastCandle.close - firstCandle.open) / firstCandle.open) * 100).toFixed(2))
            : 0;

          const responseData = {
            symbol: rawSymbol,
            range,
            candles,
            minPrice,
            maxPrice,
            lastPrice: lastCandle.close,
            changePercent: totalChangePercent,
            source: 'yahoo-live',
          };

          chartCache.set(cacheKey, { data: responseData, ts: Date.now() });
          return NextResponse.json(responseData);
        }
      }
    }
    
    // If we reach here, we didn't find valid data
    return NextResponse.json({ error: 'Grafik verisi bulunamadı' }, { status: 404 });
  } catch (err) {
    console.error('Yahoo chart fetch error:', err);
    return NextResponse.json({ error: 'Grafik verisi yüklenirken hata oluştu' }, { status: 500 });
  }
}

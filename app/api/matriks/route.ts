import { NextResponse } from 'next/server';

/**
 * Matriks API Entegrasyonu — Garanti Yatırım
 * 
 * Çekilen veriler:
 * - Anlık fiyat (bid/ask/last)
 * - Günlük değişim %
 * - Hacim
 * - 52H yüksek/düşük
 * - Geçmiş bar verisi (backtest için)
 */

const BIST100_SYMBOLS = [
  'THYAO','TRALT','ASELS','TUPRS','GARAN','BIMAS','KCHOL','ASTOR','FROTO','SISE',
  'AKBNK','YKBNK','ISCTR','HALKB','VAKBN','KOZAL','KOZAA','EREGL','KRDMD','ARCLK',
  'TOASO','DOAS','PGSUS','TCELL','TTKOM','SAHOL','SASA','SOKM','MGROS','ULKER',
  'CCOLA','AEFES','TATGD','KERVT','ODAS','KCAER','ENKAI','EKGYO','ISGYO','TOKAI',
  'ENJSA','ZOREN','AKENR','AKSEN','NTHOL','OTKAR','BRISA','GOODY','PETKIM','PRKAB',
  'DOHOL','SNGYO','TLMAN','KLGYO','VKGYO','ALKIM','ALARK','AGHOL','BERA','BFREN',
  'CEMAS','CEMTS','CIMSA','CUSAN','EKSP','FENER','GESAN','GOLTS','GOZDE','GUBRF',
  'HATEK','INDES','IPEKE','IZENR','KAYSE','KERVN','KONTR','KONYA','KOPTIN','KRDMA',
  'KRDMB','KTLEV','LOGO','MAALT','MAVI','MERT','MIATK','MRTGG','NETAS','NUGYO',
  'ORGE','PARSN','PETKM','REEDR','RYSAS','SELEC','SKBNK','SMART','TAVHL','TKNSA',
];

const memCache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 dk

function getMatriksHeaders() {
  const jwt = process.env.MATRIKS_JWT;
  if (!jwt) throw new Error('MATRIKS_JWT env değişkeni tanımlı değil');
  return {
    'Authorization': `Bearer ${jwt}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
}

const BASE_URL = process.env.MATRIKS_BASE_URL ?? '';

// ─── Anlık Fiyat Snapshot ───────────────────────────────────────
async function fetchMatriksSnapshot(symbols: string[]): Promise<Record<string, any>> {
  const results: Record<string, any> = {};
  const headers = getMatriksHeaders();

  // Matriks genellikle virgülle ayrılmış sembolleri kabul eder
  // Semboller BIST için "E_THYAO" veya sadece "THYAO" formatında olabilir
  const symbolList = symbols.join(',');

  // Olası endpoint varyantları — URL doğrulanınca sadece doğru olan kalır
  const endpoints = [
    `${BASE_URL}/v2/symbol/snapshot?symbol=${symbolList}`,
    `${BASE_URL}/symbol/snapshot?symbols=${symbolList}`,
    `${BASE_URL}/api/v1/market/quotes?symbols=${symbolList}&exchange=BIST`,
    `${BASE_URL}/fin/symbol/snapshot?symbol=${symbolList}`,
  ];

  let lastError = '';

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        headers,
        signal: AbortSignal.timeout(12000),
      });

      if (!res.ok) {
        lastError = `HTTP ${res.status} — ${url}`;
        continue;
      }

      const json = await res.json();
      console.log('[Matriks] Başarılı endpoint:', url);

      // Matriks response formatını normalize et
      // Format 1: { data: [ { symbol, last, change, volume, ... } ] }
      // Format 2: { THYAO: { l: 290, c: 0.78, v: 20000000, ... } }
      // Format 3: [ { s: "THYAO", p: 290, ... } ]

      const dataArr: any[] = Array.isArray(json)
        ? json
        : Array.isArray(json?.data)
          ? json.data
          : Object.entries(json).map(([k, v]) => ({ symbol: k, ...(v as any) }));

      for (const item of dataArr) {
        const sym = (item.symbol ?? item.s ?? item.sembol ?? '').replace(/^E_/, '').toUpperCase();
        if (!sym) continue;

        results[sym] = {
          symbol: sym,
          price: item.last ?? item.l ?? item.close ?? item.price ?? null,
          change: item.changePercent ?? item.cp ?? item.change ?? item.degisim ?? null,
          volume: item.volume ?? item.v ?? item.hacim ?? null,
          marketCap: null, // ayrıca çekilebilir
          high52w: item.fiftyTwoWeekHigh ?? item.h52 ?? item.yh ?? null,
          low52w: item.fiftyTwoWeekLow ?? item.l52 ?? item.yd ?? null,
          dayHigh: item.high ?? item.yh ?? item.gunlukYuksek ?? null,
          dayLow: item.low ?? item.yd ?? item.gunlukDusuk ?? null,
          open: item.open ?? item.ac ?? null,
          previousClose: item.previousClose ?? item.oncekiKapanis ?? null,
          bid: item.bid ?? item.alis ?? null,
          ask: item.ask ?? item.satis ?? null,
          name: item.name ?? item.longName ?? sym,
          currency: 'TRY',
          marketState: item.marketStatus ?? item.durum ?? 'CLOSED',
          source: 'matriks',
        };
      }

      if (Object.keys(results).length > 0) break; // Başarılı, döngüden çık

    } catch (err: any) {
      lastError = err?.message;
    }
  }

  if (Object.keys(results).length === 0) {
    console.error('[Matriks] Tüm endpointler başarısız:', lastError);
  }

  return results;
}

// ─── Geçmiş Bar Verisi (Backtest için) ─────────────────────────
export async function fetchMatriksHistory(
  symbol: string,
  period: '1D' | '1W' | '1M' = '1W',
  fromDate?: string, // YYYY-MM-DD
  toDate?: string
): Promise<Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }>> {
  const headers = getMatriksHeaders();
  const from = fromDate ?? new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const to = toDate ?? new Date().toISOString().split('T')[0];

  const endpoints = [
    `${BASE_URL}/v2/symbol/bars?symbol=${symbol}&period=${period}&from=${from}&to=${to}`,
    `${BASE_URL}/fin/history?symbol=${symbol}&resolution=${period}&from=${from}&to=${to}`,
    `${BASE_URL}/api/v1/market/history?symbol=${symbol}&interval=${period}&startDate=${from}&endDate=${to}`,
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, { headers, signal: AbortSignal.timeout(15000) });
      if (!res.ok) continue;
      const json = await res.json();

      // Normalize
      const bars: any[] = Array.isArray(json) ? json : (json?.bars ?? json?.data ?? []);
      if (bars.length === 0) continue;

      return bars.map((b: any) => ({
        date: b.date ?? b.t ?? b.time ?? '',
        open: b.open ?? b.o ?? 0,
        high: b.high ?? b.h ?? 0,
        low: b.low ?? b.l ?? 0,
        close: b.close ?? b.c ?? 0,
        volume: b.volume ?? b.v ?? 0,
      }));
    } catch {}
  }

  return [];
}

// ─── Next.js API Route Handler ──────────────────────────────────
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('mode') ?? 'snapshot'; // snapshot | history | test

  // Test modu: JWT ve URL yapılandırmasını doğrula
  if (mode === 'test') {
    const jwt = process.env.MATRIKS_JWT;
    const baseUrl = process.env.MATRIKS_BASE_URL;
    return NextResponse.json({
      configured: !!jwt && !!baseUrl,
      jwtPrefix: jwt ? jwt.substring(0, 20) + '...' : null,
      baseUrl: baseUrl ?? null,
      useMatriks: process.env.USE_MATRIKS === 'true',
    });
  }

  // Geçmiş veri modu
  if (mode === 'history') {
    const symbol = searchParams.get('symbol') ?? 'THYAO';
    const period = (searchParams.get('period') ?? '1W') as '1D' | '1W' | '1M';
    const from = searchParams.get('from') ?? undefined;
    const to = searchParams.get('to') ?? undefined;

    try {
      const bars = await fetchMatriksHistory(symbol, period, from, to);
      return NextResponse.json({ success: true, symbol, count: bars.length, data: bars });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err?.message }, { status: 500 });
    }
  }

  // Snapshot modu (varsayılan)
  const now = Date.now();
  const cached = memCache.get('matriks_snapshot');
  if (cached && now - cached.ts < CACHE_TTL) {
    return NextResponse.json({ success: true, data: cached.data, fromCache: true, source: 'matriks', count: Object.keys(cached.data).length });
  }

  try {
    const data = await fetchMatriksSnapshot(BIST100_SYMBOLS);

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ success: false, error: 'Matriks\'ten veri alınamadı', data: {}, count: 0 }, { status: 503 });
    }

    memCache.set('matriks_snapshot', { data, ts: now });

    return NextResponse.json({
      success: true, data,
      fromCache: false,
      fetchedAt: new Date().toISOString(),
      count: Object.keys(data).length,
      source: 'matriks',
    });

  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message, data: {}, count: 0 }, { status: 500 });
  }
}

export async function POST() {
  memCache.clear();
  return NextResponse.json({ success: true, message: 'Matriks cache temizlendi.' });
}

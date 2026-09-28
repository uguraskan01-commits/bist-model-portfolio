import { useState, useEffect, useCallback, useRef } from 'react';
import { evaluateBISTStock } from './scoring-engine';

// Canlı piyasa verisi tipi (Yahoo Finance'dan gelen)
export interface LiveStockQuote {
  symbol: string;
  price: number | null;
  change: number | null;      // % günlük değişim
  weeklyReturn: number | null; // % haftalık değişim
  monthlyReturn: number | null; // % aylık değişim
  ytdReturn: number | null; // % ytd değişim
  volume: number | null;
  marketCap: number | null;   // Milyar TL
  high52w: number | null;
  low52w: number | null;
  previousClose: number | null;
  open: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  pe: number | null;
  pb?: number | null;
  eps: number | null;
  name: string;
  currency: string;
  marketState: string;
  realTechnicals?: {
    sma20: number | null;
    sma50: number | null;
    sma200: number | null;
    rsi14: number | null;
    macd: {
      macd: number;
      signal: number;
      histogram: number;
      bullishCross: boolean;
    } | null;
    bollinger: {
      upper: number;
      middle: number;
      lower: number;
      bandwidth: number;
      squeeze: boolean;
    } | null;
  } | null;
}

export interface MarketDataState {
  quotes: Record<string, LiveStockQuote>;
  isLoading: boolean;
  isError: boolean;
  errorMsg: string | null;
  lastUpdated: Date | null;
  fromCache: boolean;
  refetch: () => void;
}

// Singleton cache - aynı sayfada birden fazla hook kullanılırsa tek istek atar
let globalQuotes: Record<string, LiveStockQuote> = {};
let globalLastFetch: number | null = null;
let globalIsLoading = false;
const STALE_TIME_MS = 5 * 60 * 1000; // 5 dk stale

type Listener = () => void;
const listeners: Set<Listener> = new Set();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

async function fetchMarketData(): Promise<void> {
  if (globalIsLoading) return;
  
  // Stale değilse tekrar çekme
  if (globalLastFetch && Date.now() - globalLastFetch < STALE_TIME_MS) return;
  
  globalIsLoading = true;
  notifyListeners();
  
  try {
    const res = await fetch('/api/stocks', { cache: 'no-store' });
    const json = await res.json();
    
    if (json.success && json.data) {
      globalQuotes = json.data;
      globalLastFetch = Date.now();
    }
  } catch (err) {
    console.error('[useMarketData] Veri çekilemedi:', err);
  } finally {
    globalIsLoading = false;
    notifyListeners();
  }
}

export function useMarketData(): MarketDataState {
  const [, forceUpdate] = useState(0);
  const listenerRef = useRef<Listener>(() => forceUpdate(n => n + 1));
  
  useEffect(() => {
    const listener = listenerRef.current;
    listeners.add(listener);
    
    // İlk mount'ta veriyi çek
    fetchMarketData();
    
    return () => {
      listeners.delete(listener);
    };
  }, []);
  
  const refetch = useCallback(() => {
    globalLastFetch = null; // Stale sayılsın
    fetchMarketData();
  }, []);
  
  return {
    quotes: globalQuotes,
    isLoading: globalIsLoading,
    isError: false,
    errorMsg: null,
    lastUpdated: globalLastFetch ? new Date(globalLastFetch) : null,
    fromCache: false,
    refetch,
  };
}

// Tek bir hisse için fiyat override'ı — statik datayı canlı fiyatla yama
export function applyLivePrice<T extends { symbol: string; currentPrice: number; changePercent: number; volume24h: number; technical?: any }>(
  stock: T,
  quotes: Record<string, LiveStockQuote>
): T {
  const quote = quotes[stock.symbol];
  if (!quote || quote.price == null || quote.price <= 0) return stock;
  
  const livePrice = quote.price;
  const oldPrice = stock.currentPrice > 0 ? stock.currentPrice : livePrice;
  const ratio = oldPrice > 0 ? livePrice / oldPrice : 1;

  let technical = (stock as any).technical;
  if (technical) {
    const high52 = quote.high52w ?? (stock as any).high52w;
    const low52 = quote.low52w ?? (stock as any).low52w;
    const has52w = high52 != null && low52 != null && high52 > low52;
    const pos52 = has52w ? Math.max(0, Math.min(1, (livePrice - low52) / (high52 - low52))) : 0.5;
    const isDowntrend = pos52 < 0.38;

    let sma20: number = technical.movingAverages?.sma20 ? +(technical.movingAverages.sma20 * ratio).toFixed(2) : livePrice;
    let sma50: number = technical.movingAverages?.sma50 ? +(technical.movingAverages.sma50 * ratio).toFixed(2) : livePrice;
    let sma200: number = technical.movingAverages?.sma200 ? +(technical.movingAverages.sma200 * ratio).toFixed(2) : livePrice;
    let trend: string = technical.priceAction?.trend || (pos52 > 0.65 ? 'GÜÇLÜ YÜKSELİŞ' : pos52 > 0.45 ? 'YÜKSELİŞ' : isDowntrend ? 'DÜŞÜŞ' : 'YATAY / TEST');
    let rsi: number = technical.rsi ?? (isDowntrend ? +(32 + pos52 * 25).toFixed(1) : 50);

    if (quote.realTechnicals) {
      const rt = quote.realTechnicals;
      sma20 = rt.sma20 != null ? +(rt.sma20).toFixed(2) : sma20;
      sma50 = rt.sma50 != null ? +(rt.sma50).toFixed(2) : sma50;
      sma200 = rt.sma200 != null ? +(rt.sma200).toFixed(2) : sma200;
      rsi = rt.rsi14 != null ? +(rt.rsi14).toFixed(1) : rsi;
      
      const priceAboveSma20 = livePrice > sma20;
      const priceAboveSma50 = livePrice > sma50;
      const priceAboveSma200 = livePrice > sma200;

      const rawSupport = sma20 < livePrice ? sma20 : (sma50 < livePrice ? sma50 : livePrice * 0.95);
      const rawResistance = sma20 > livePrice ? sma20 : (sma50 > livePrice ? sma50 : livePrice * 1.05);

      technical = {
        ...technical,
        rsi,
        macd: rt.macd ? {
          macd: +(rt.macd.macd).toFixed(2),
          signal: +(rt.macd.signal).toFixed(2),
          histogram: +(rt.macd.histogram).toFixed(2),
          bullishCross: rt.macd.bullishCross
        } : technical.macd,
        momentum: {
          ...technical.momentum,
          weeklyReturn: quote.weeklyReturn ?? technical.momentum?.weeklyReturn ?? 0,
          monthlyReturn: quote.monthlyReturn ?? technical.momentum?.monthlyReturn ?? 0,
          ytdReturn: quote.ytdReturn ?? technical.momentum?.ytdReturn ?? 0,
        },
        movingAverages: {
          sma20,
          sma50,
          sma200,
          priceAboveSma20,
          priceAboveSma50,
          priceAboveSma200,
          goldenCross: sma50 > sma200 && priceAboveSma200,
        },
        ...(rt.bollinger ? {
          bollinger: {
            upper: +(rt.bollinger.upper).toFixed(2),
            middle: +(rt.bollinger.middle).toFixed(2),
            lower: +(rt.bollinger.lower).toFixed(2),
            bandwidth: +(rt.bollinger.bandwidth).toFixed(3),
            squeeze: rt.bollinger.squeeze
          }
        } : {}),
        priceAction: {
          ...technical.priceAction,
          trend: priceAboveSma50 && priceAboveSma200 ? 'GÜÇLÜ YÜKSELİŞ' : priceAboveSma20 ? 'YÜKSELİŞ' : priceAboveSma200 ? 'YATAY / TEST' : 'DÜŞÜŞ',
          supportLevel: +(rawSupport).toFixed(2),
          resistanceLevel: +(rawResistance).toFixed(2),
          stopLossLevel: +(rawSupport * 0.98).toFixed(2),
          notes: `Gerçek zamanlı göstergeler (Yahoo): RSI ${rsi}, MACD ${rt.macd?.bullishCross ? 'Pozitif' : 'Negatif'}`,
        },
      };
    } else {
      // Eskiden kalan fallback logic (mocked)
      const priceAboveSma20 = livePrice > sma20;
      const priceAboveSma50 = livePrice > sma50;
      const priceAboveSma200 = livePrice > sma200;

      const rawSupport = (technical.priceAction?.supportLevel || oldPrice * 0.94) * ratio;
      const rawResistance = (technical.priceAction?.resistanceLevel || oldPrice * 1.08) * ratio;
      const rawStop = (technical.priceAction?.stopLossLevel || oldPrice * 0.91) * ratio;

      const supportLevel = +(Math.min(livePrice * 0.98, rawSupport)).toFixed(2);
      const resistanceLevel = +(Math.max(livePrice * 1.03, isDowntrend ? sma20 : rawResistance)).toFixed(2);
      const stopLossLevel = +(Math.min(livePrice * 0.94, Math.max(livePrice * 0.88, rawStop))).toFixed(2);

      technical = {
        ...technical,
        rsi,
        momentum: {
          ...technical.momentum,
          weeklyReturn: quote.weeklyReturn ?? technical.momentum?.weeklyReturn ?? 0,
          monthlyReturn: quote.monthlyReturn ?? technical.momentum?.monthlyReturn ?? 0,
          ytdReturn: quote.ytdReturn ?? technical.momentum?.ytdReturn ?? 0,
        },
        movingAverages: {
          sma20,
          sma50,
          sma200,
          priceAboveSma20,
          priceAboveSma50,
          priceAboveSma200,
          goldenCross: sma50 > sma200 && priceAboveSma200,
        },
        ...(technical.bollinger ? {
          bollinger: {
            ...technical.bollinger,
            upper: +(technical.bollinger.upper * ratio).toFixed(2),
            middle: livePrice,
            lower: +(technical.bollinger.lower * ratio).toFixed(2),
          },
        } : {}),
        priceAction: {
          ...technical.priceAction,
          trend,
          pattern: isDowntrend ? 'Düşüş Kanalı İçi Taban Arayışı' : technical.priceAction?.pattern,
          supportLevel,
          resistanceLevel,
          stopLossLevel,
          notes: `${technical.priceAction?.pattern || 'Teknik seviyeler'}. Destek: ${supportLevel} ₺, Direnç: ${resistanceLevel} ₺.`,
        },
      };
    }
  }

  // Konsensüs Hedef Fiyat ve Analist Raporlarını Oranla
  let analysts = (stock as any).analysts;
  if (analysts) {
    const rawTarget = (analysts.consensusTarget || oldPrice * 1.30) * ratio;
    const consensusTarget = +(Math.max(livePrice * 1.12, rawTarget)).toFixed(2);
    const upsidePotential = +(((consensusTarget - livePrice) / livePrice) * 100).toFixed(1);

    analysts = {
      ...analysts,
      consensusTarget,
      currentPrice: livePrice,
      upsidePotential,
      reports: analysts.reports?.map((r: any) => {
        const repTarget = +(Math.max(livePrice * 1.10, (r.targetPrice || rawTarget) * ratio)).toFixed(2);
        return {
          ...r,
          targetPrice: repTarget,
          upside: +(((repTarget - livePrice) / livePrice) * 100).toFixed(1),
        };
      }) || [],
    };
  }

  // Temel Analiz Çarpanları
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
  };

  // Skorlama Motoru ile Canlı Fiyata Göre Yenileme
  let score = (stock as any).score;
  const activeTech = technical || (stock as any).technical;
  const activeFund = fundamental || (stock as any).fundamental;
  const activeAnalysts = analysts || (stock as any).analysts;
  const activeSentiment = (stock as any).sentiment;

  if (activeTech && activeFund && activeAnalysts && activeSentiment) {
    score = evaluateBISTStock(
      stock.symbol,
      livePrice,
      activeTech,
      activeFund,
      activeAnalysts,
      activeSentiment,
      undefined,
      quote.high52w ?? (stock as any).high52w,
      quote.low52w ?? (stock as any).low52w
    );
  }

  return {
    ...stock,
    currentPrice: livePrice,
    changePercent: quote.change ?? stock.changePercent,
    volume24h: quote.volume ?? stock.volume24h,
    ...(quote.marketCap != null ? { marketCap: quote.marketCap } : {}),
    ...(quote.high52w != null ? { high52w: quote.high52w } : {}),
    ...(quote.low52w != null ? { low52w: quote.low52w } : {}),
    ...(technical ? { technical } : {}),
    ...(analysts ? { analysts } : {}),
    ...(fundamental ? { fundamental } : {}),
    ...(score ? { score } : {}),
  };
}

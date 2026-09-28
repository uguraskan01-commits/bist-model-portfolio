'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  Activity,
  BarChart2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Lock,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

export interface CandleData {
  time: number;
  date: string;
  fullDate: string;
  open: number;
  high: number;
  low: number;
  close: number;
  prevClose: number;
  volume: number;
  change: number; // Dünkü kapanışa göre gerçek değişim %
  intradayChange: number; // Açılışa göre gün içi değişim %
  isBull: boolean;
  isTaban: boolean;
  isTavan: boolean;
  sma5: number | null;
  sma20: number | null;
  sma50: number | null;
}

interface CandlestickChartProps {
  symbol: string;
  stockName?: string;
  currentPrice?: number;
  changePercent?: number;
}

export function CandlestickChart({
  symbol,
  stockName,
  currentPrice,
  changePercent,
}: CandlestickChartProps) {
  const [range, setRange] = useState<'1mo' | '3mo' | '6mo' | '1y'>('3mo');
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Göstergeler
  const [showSMA5, setShowSMA5] = useState(true);
  const [showSMA20, setShowSMA20] = useState(true);
  const [showSMA50, setShowSMA50] = useState(true);
  const [showVolume, setShowVolume] = useState(true);

  // Fare Gezdirme (Crosshair & Hovered Candle)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [cursorSvgPos, setCursorSvgPos] = useState<{ x: number; y: number } | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Veri çekme
  useEffect(() => {
    let isCancelled = false;
    async function fetchChart() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/chart?symbol=${encodeURIComponent(symbol)}&range=${range}`);
        if (!res.ok) throw new Error('Grafik verisi alınamadı');
        const data = await res.json();
        if (!isCancelled && data.candles) {
          setCandles(data.candles);
          setHoveredIdx(null);
        }
      } catch (err: any) {
        if (!isCancelled) {
          setError(err.message || 'Veri yüklenirken hata oluştu');
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    fetchChart();
    return () => {
      isCancelled = true;
    };
  }, [symbol, range]);

  // Boyutlar ve Çizim Parametreleri
  const viewBoxWidth = 1000;
  const chartHeight = 360;
  const padding = { top: 28, right: 75, bottom: 42, left: 16 };
  const volumeHeightRatio = 0.20; // Alttaki hacim alanı oranı

  const candleAreaWidth = viewBoxWidth - padding.left - padding.right;
  const priceAreaHeight = chartHeight - padding.top - padding.bottom;
  const candleAreaHeight = showVolume ? priceAreaHeight * (1 - volumeHeightRatio) : priceAreaHeight;
  const volumeAreaHeight = priceAreaHeight * volumeHeightRatio;

  // Fiyat Min / Max Hesaplama
  const { minPrice, maxPrice, maxVolume, periodHigh, periodLow } = useMemo(() => {
    if (candles.length === 0) {
      return { minPrice: 0, maxPrice: 100, maxVolume: 1, periodHigh: 100, periodLow: 0 };
    }

    const periodHigh = Math.max(...candles.map((c) => c.high));
    const periodLow = Math.min(...candles.map((c) => c.low));
    let min = periodLow;
    let max = periodHigh;
    const maxVol = Math.max(...candles.map((c) => c.volume || 1));

    candles.forEach((c) => {
      if (showSMA5 && c.sma5 !== null) {
        min = Math.min(min, c.sma5);
        max = Math.max(max, c.sma5);
      }
      if (showSMA20 && c.sma20 !== null) {
        min = Math.min(min, c.sma20);
        max = Math.max(max, c.sma20);
      }
      if (showSMA50 && c.sma50 !== null) {
        min = Math.min(min, c.sma50);
        max = Math.max(max, c.sma50);
      }
    });

    const margin = (max - min) * 0.05 || 1;
    return {
      minPrice: Math.max(0.01, min - margin),
      maxPrice: max + margin,
      maxVolume: maxVol,
      periodHigh,
      periodLow,
    };
  }, [candles, showSMA5, showSMA20, showSMA50]);

  // Y Koordinat Dönüştürücüleri
  const getPriceY = (price: number) => {
    if (maxPrice === minPrice) return padding.top + candleAreaHeight / 2;
    const ratio = (price - minPrice) / (maxPrice - minPrice);
    return padding.top + candleAreaHeight * (1 - ratio);
  };

  const getVolumeY = (vol: number) => {
    const bottom = padding.top + priceAreaHeight;
    const ratio = maxVolume > 0 ? vol / maxVolume : 0;
    return bottom - ratio * (volumeAreaHeight - 6);
  };

  // Mum Geometrisi
  const stepX = candles.length > 0 ? candleAreaWidth / candles.length : 1;
  const candleBodyWidth = Math.max(2, Math.min(16, stepX * 0.72));
  const wickWidth = Math.max(1, Math.min(1.5, stepX * 0.18));

  // Aktif Gösterilecek Mum (Hover yoksa son işlem mumu)
  const activeCandle = useMemo(() => {
    if (candles.length === 0) return null;
    if (hoveredIdx !== null && candles[hoveredIdx]) {
      return candles[hoveredIdx];
    }
    return candles[candles.length - 1];
  }, [candles, hoveredIdx]);

  // FARE GEZDİRME (Matrix Transform ile Kusursuz SVG Koordinat Eşlemesi)
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg || candles.length === 0) return;

    try {
      const pt = svg.createSVGPoint();
      pt.x = e.clientX;
      pt.y = e.clientY;
      const ctm = svg.getScreenCTM();
      if (!ctm) return;
      const svgPoint = pt.matrixTransform(ctm.inverse());
      const svgX = svgPoint.x;
      const svgY = Math.max(padding.top, Math.min(padding.top + candleAreaHeight, svgPoint.y));

      setCursorSvgPos({ x: svgX, y: svgY });

      if (svgX >= padding.left && svgX <= viewBoxWidth - padding.right) {
        const idx = Math.floor((svgX - padding.left) / stepX);
        if (idx >= 0 && idx < candles.length) {
          setHoveredIdx(idx);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setHoveredIdx(null);
  };

  const handleMouseLeave = () => {
    setHoveredIdx(null);
    setCursorSvgPos(null);
  };

  // SMA Çizgi Noktaları
  const sma5Points = useMemo(() => {
    if (!showSMA5) return '';
    return candles
      .map((c, i) => {
        if (c.sma5 === null) return null;
        const x = padding.left + i * stepX + stepX / 2;
        const y = getPriceY(c.sma5);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [candles, showSMA5, stepX, minPrice, maxPrice]);

  const sma20Points = useMemo(() => {
    if (!showSMA20) return '';
    return candles
      .map((c, i) => {
        if (c.sma20 === null) return null;
        const x = padding.left + i * stepX + stepX / 2;
        const y = getPriceY(c.sma20);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [candles, showSMA20, stepX, minPrice, maxPrice]);

  const sma50Points = useMemo(() => {
    if (!showSMA50) return '';
    return candles
      .map((c, i) => {
        if (c.sma50 === null) return null;
        const x = padding.left + i * stepX + stepX / 2;
        const y = getPriceY(c.sma50);
        return `${x},${y}`;
      })
      .filter(Boolean)
      .join(' ');
  }, [candles, showSMA50, stepX, minPrice, maxPrice]);

  // Sağ Fiyat Skalası Izgarası (5 seviye)
  const gridLevels = useMemo(() => {
    const count = 5;
    const levels = [];
    const step = (maxPrice - minPrice) / (count - 1);
    for (let i = 0; i < count; i++) {
      const price = minPrice + i * step;
      levels.push({
        price,
        y: getPriceY(price),
      });
    }
    return levels;
  }, [minPrice, maxPrice]);

  // İmleç Fiyatı
  const cursorPrice = useMemo(() => {
    if (!cursorSvgPos) return null;
    const ratio = (cursorSvgPos.y - padding.top) / candleAreaHeight;
    return maxPrice - ratio * (maxPrice - minPrice);
  }, [cursorSvgPos, maxPrice, minPrice, candleAreaHeight]);

  return (
    <div className="relative overflow-hidden rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 p-5 sm:p-6 transition-colors">
      {/* Üst Neon Çizgi */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />

      {/* 1. ÜST KONTROL PANELİ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        {/* Sol: Başlık & Hisse Bilgisi */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-white font-mono">
                {symbol} Mum Grafiği & Fiyat Hareketi
              </h3>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-[#1E212B] text-zinc-400">
                1G (Günlük)
              </span>
              {activeCandle?.isTaban && (
                <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/40 animate-pulse">
                  TABAN
                </span>
              )}
              {activeCandle?.isTavan && (
                <span className="text-[10px] font-extrabold font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/40 animate-pulse">
                  TAVAN
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-400">
              Gerçek zamanlı Borsa İstanbul OHLCV mum çubukları, dünkü kapanışa göre değişim ve algoritmik hacim.
            </p>
          </div>
        </div>

        {/* Sağ: Periyot Seçimi & Gösterge Aç/Kapa */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Periyot Butonları */}
          <div className="flex items-center bg-[#1E212B]/80 p-1 rounded-xl border border-zinc-200/80 dark:border-zinc-700/80 text-xs font-mono font-bold">
            {(['1mo', '3mo', '6mo', '1y'] as const).map((p) => {
              const labelMap = { '1mo': '1A', '3mo': '3A', '6mo': '6A', '1y': '1Y' };
              const isSelected = range === p;
              return (
                <button
                  key={p}
                  onClick={() => setRange(p)}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    isSelected
                      ? 'bg-orange-500 text-white shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  {labelMap[p]}
                </button>
              );
            })}
          </div>

          {/* Gösterge Checkbox'ları */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              onClick={() => setShowSMA5(!showSMA5)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showSMA5
                  ? 'bg-blue-500/10 border-blue-500/40 text-blue-500 font-bold'
                  : 'bg-[#1E212B]/50 border-white/5 text-zinc-400 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              SMA 5
            </button>

            <button
              onClick={() => setShowSMA20(!showSMA20)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showSMA20
                  ? 'bg-amber-500/10 border-amber-500/40 text-amber-400 font-bold'
                  : 'bg-[#1E212B]/50 border-white/5 text-zinc-400 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              SMA 20
            </button>

            <button
              onClick={() => setShowSMA50(!showSMA50)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showSMA50
                  ? 'bg-purple-500/10 border-purple-500/40 text-purple-600 dark:text-purple-400 font-bold'
                  : 'bg-[#1E212B]/50 border-white/5 text-zinc-400 line-through'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-500" />
              SMA 50
            </button>

            <button
              onClick={() => setShowVolume(!showVolume)}
              className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                showVolume
                  ? 'bg-orange-500/10 border-orange-500/40 text-orange-600 dark:text-orange-400 font-bold'
                  : 'bg-[#1E212B]/50 border-white/5 text-zinc-400 line-through'
              }`}
            >
              <BarChart2 className="w-3 h-3" />
              Hacim
            </button>
          </div>
        </div>
      </div>

      {/* 2. CANLI OHLCV VERİ BİLGİ ŞERİDİ (HUD - BIST Gerçek Günlük Değişimi) */}
      <div className="flex items-center gap-3 sm:gap-4 text-xs font-mono flex-wrap bg-[#0F1116] p-3 rounded-2xl border border-white/5">
        {activeCandle ? (
          <>
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <span className="font-bold text-white">{activeCandle.date}</span>
              <span className="text-[10px] text-zinc-400">({activeCandle.fullDate})</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Açılış:</span>
              <span className="font-bold text-white">{activeCandle.open.toFixed(2)} ₺</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Yüksek:</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">{activeCandle.high.toFixed(2)} ₺</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Düşük:</span>
              <span className="font-bold text-rose-600 dark:text-rose-400">{activeCandle.low.toFixed(2)} ₺</span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Kapanış:</span>
              <span className="font-bold text-white">{activeCandle.close.toFixed(2)} ₺</span>
            </div>

            {/* Gerçek Günlük Değişim (Dünkü Kapanışa göre) */}
            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Günlük Fark:</span>
              <span
                className={`font-extrabold flex items-center gap-0.5 px-2 py-0.5 rounded-md ${
                  (activeCandle === candles[candles.length - 1] && changePercent !== undefined ? changePercent : activeCandle.change) >= 0
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                }`}
              >
                {(activeCandle === candles[candles.length - 1] && changePercent !== undefined ? changePercent : activeCandle.change) >= 0 ? '+' : ''}
                %{(activeCandle === candles[candles.length - 1] && changePercent !== undefined ? changePercent : activeCandle.change).toFixed(2)}
                {((activeCandle === candles[candles.length - 1] && changePercent !== undefined) ? changePercent <= -9.85 : activeCandle.isTaban) && <span className="ml-1 text-[10px]">(TABAN)</span>}
                {((activeCandle === candles[candles.length - 1] && changePercent !== undefined) ? changePercent >= 9.85 : activeCandle.isTavan) && <span className="ml-1 text-[10px]">(TAVAN)</span>}
              </span>
            </div>

            {/* Gün İçi Değişim (Açılışa göre mum yönü) */}
            <div className="flex items-center gap-1 text-zinc-400">
              <span className="text-zinc-400">Gün İçi:</span>
              <span>
                {activeCandle.intradayChange >= 0 ? '+' : ''}%{activeCandle.intradayChange.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-zinc-400">Hacim:</span>
              <span className="font-bold text-zinc-300">
                {activeCandle.volume >= 1000000
                  ? `${(activeCandle.volume / 1000000).toFixed(2)}M Lot`
                  : `${(activeCandle.volume / 1000).toFixed(0)}K Lot`}
              </span>
            </div>

            {showSMA5 && activeCandle.sma5 !== null && (
              <div className="flex items-center gap-1 text-blue-500">
                <span>SMA5:</span>
                <span className="font-bold">{activeCandle.sma5.toFixed(2)} ₺</span>
              </div>
            )}

            {showSMA20 && activeCandle.sma20 !== null && (
              <div className="flex items-center gap-1 text-amber-400">
                <span>SMA20:</span>
                <span className="font-bold">{activeCandle.sma20.toFixed(2)} ₺</span>
              </div>
            )}

            {showSMA50 && activeCandle.sma50 !== null && (
              <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                <span>SMA50:</span>
                <span className="font-bold">{activeCandle.sma50.toFixed(2)} ₺</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-zinc-400">Veri yükleniyor...</span>
        )}
      </div>

      {/* 3. MUM GRAFİK ÇİZİM ALANI */}
      <div className="relative w-full h-[360px] select-none cursor-crosshair">
        {loading && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <RefreshCw className="w-7 h-7 text-orange-500 animate-spin" />
              <span className="text-xs font-mono font-bold text-zinc-600 dark:text-zinc-300">
                Grafik Mumları Yükleniyor ({symbol})...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-white/80 dark:bg-zinc-900/80 rounded-2xl p-4 text-center">
            <div className="space-y-2">
              <p className="text-sm font-bold text-rose-500">{error}</p>
              <button
                onClick={() => setRange(range)}
                className="px-3 py-1.5 text-xs font-mono bg-[#1E212B] rounded-lg hover:bg-zinc-300 transition-all"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${viewBoxWidth} ${chartHeight}`}
          className="w-full h-full overflow-visible"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            {/* Hacim Gradyanları */}
            <linearGradient id="volGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="volRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Izgara Çizgileri & Fiyat Etiketleri */}
          {gridLevels.map((lvl, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={lvl.y}
                x2={viewBoxWidth - padding.right}
                y2={lvl.y}
                stroke="currentColor"
                className="text-zinc-200 dark:text-zinc-800/80"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={viewBoxWidth - padding.right + 8}
                y={lvl.y + 4}
                className="text-[11px] font-mono fill-zinc-400 dark:fill-zinc-500 font-semibold"
              >
                {lvl.price.toFixed(2)} ₺
              </text>
            </g>
          ))}

          {/* Zirve ve Dip Çizgileri */}
          {periodHigh && (
            <g>
              <line
                x1={padding.left}
                y1={getPriceY(periodHigh)}
                x2={viewBoxWidth - padding.right}
                y2={getPriceY(periodHigh)}
                stroke="#10b981"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.4"
              />
              <text
                x={padding.left + 4}
                y={getPriceY(periodHigh) - 4}
                className="text-[9px] font-mono fill-emerald-500 font-bold"
              >
                ZİRVE: {periodHigh.toFixed(2)} ₺
              </text>
            </g>
          )}

          {periodLow && (
            <g>
              <line
                x1={padding.left}
                y1={getPriceY(periodLow)}
                x2={viewBoxWidth - padding.right}
                y2={getPriceY(periodLow)}
                stroke="#f43f5e"
                strokeWidth="1"
                strokeDasharray="2 3"
                opacity="0.4"
              />
              <text
                x={padding.left + 4}
                y={getPriceY(periodLow) + 11}
                className="text-[9px] font-mono fill-rose-500 font-bold"
              >
                DİP: {periodLow.toFixed(2)} ₺
              </text>
            </g>
          )}

          {/* Hacim Ayrım Çizgisi */}
          {showVolume && (
            <line
              x1={padding.left}
              y1={padding.top + candleAreaHeight}
              x2={viewBoxWidth - padding.right}
              y2={padding.top + candleAreaHeight}
              stroke="currentColor"
              className="text-zinc-300 dark:text-zinc-700/60"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Hacim Barları */}
          {showVolume &&
            candles.map((c, i) => {
              const x = padding.left + i * stepX + (stepX - candleBodyWidth) / 2;
              const y = getVolumeY(c.volume);
              const bottom = padding.top + priceAreaHeight;
              const h = Math.max(1, bottom - y);

              return (
                <rect
                  key={`vol-${i}`}
                  x={x}
                  y={y}
                  width={candleBodyWidth}
                  height={h}
                  fill={c.isBull ? 'url(#volGreen)' : 'url(#volRed)'}
                  rx="1"
                />
              );
            })}

          {/* Mum Çubukları (Wicks + Bodies + Taban/Tavan Kilitleri) */}
          {candles.map((c, i) => {
            const candleColor = c.isBull ? '#10b981' : '#f43f5e';
            const centerX = padding.left + i * stepX + stepX / 2;

            const highY = getPriceY(c.high);
            const lowY = getPriceY(c.low);
            const openY = getPriceY(c.open);
            const closeY = getPriceY(c.close);

            const isHovered = hoveredIdx === i;
            const isFlat = Math.abs(openY - closeY) < 2;

            return (
              <g key={`candle-${i}`} className="transition-all duration-100">
                {/* Fitil (High to Low) */}
                <line
                  x1={centerX}
                  y1={highY}
                  x2={centerX}
                  y2={lowY}
                  stroke={candleColor}
                  strokeWidth={isHovered ? 2 : wickWidth}
                  strokeLinecap="round"
                />

                {/* Mum Gövdesi (Body) */}
                {isFlat ? (
                  // Taban, Tavan veya Doji (Açılış == Kapanış)
                  <g>
                    {/* Belirgin Yatay Çubuk */}
                    <rect
                      x={centerX - candleBodyWidth / 2}
                      y={Math.min(openY, closeY) - 1.5}
                      width={candleBodyWidth}
                      height={3}
                      fill={candleColor}
                      rx="1"
                      className={isHovered ? 'filter drop-shadow-[0_0_8px_rgba(255,255,255,0.7)]' : ''}
                    />
                    {/* Taban veya Tavan kilit işareti */}
                    {(c.isTaban || c.isTavan) && (
                      <circle
                        cx={centerX}
                        cy={Math.min(openY, closeY)}
                        r={isHovered ? 3.5 : 2.2}
                        fill={c.isTaban ? '#f43f5e' : '#10b981'}
                        stroke="#ffffff"
                        strokeWidth="1"
                      />
                    )}
                  </g>
                ) : (
                  // Standart Mum Gövdesi
                  <rect
                    x={centerX - candleBodyWidth / 2}
                    y={Math.min(openY, closeY)}
                    width={candleBodyWidth}
                    height={Math.max(2.5, Math.abs(closeY - openY))}
                    fill={candleColor}
                    stroke={candleColor}
                    strokeWidth="0.5"
                    rx="1.5"
                    className={isHovered ? 'filter drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]' : ''}
                  />
                )}
              </g>
            );
          })}

          {/* SMA 5 Çizgisi */}
          {showSMA5 && sma5Points && (
            <polyline
              points={sma5Points}
              fill="none"
              stroke="#3b82f6" // blue-500
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          )}

          {/* SMA 20 Çizgisi */}
          {showSMA20 && sma20Points && (
            <polyline
              points={sma20Points}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          )}

          {/* SMA 50 Çizgisi */}
          {showSMA50 && sma50Points && (
            <polyline
              points={sma50Points}
              fill="none"
              stroke="#a855f7"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="drop-shadow-sm"
            />
          )}

          {/* Tarih Etiketleri (X-Axis) */}
          {candles.map((c, i) => {
            const interval = Math.max(4, Math.floor(candles.length / 8));
            if (i % interval !== 0 && i !== candles.length - 1) return null;

            const x = padding.left + i * stepX + stepX / 2;
            const y = chartHeight - padding.bottom + 18;

            return (
              <text
                key={`date-${i}`}
                x={x}
                y={y}
                textAnchor="middle"
                className="text-[10px] font-mono fill-zinc-400 dark:fill-zinc-500 font-medium"
              >
                {c.date}
              </text>
            );
          })}

          {/* Crosshair (Fare Kılavuz Çizgileri - Tam Hizalama) */}
          {hoveredIdx !== null && candles[hoveredIdx] && cursorSvgPos && (
            <g pointerEvents="none">
              {/* Dikey Çizgi (Aktif Mumun Tam Ortasına Kilitli) */}
              <line
                x1={padding.left + hoveredIdx * stepX + stepX / 2}
                y1={padding.top}
                x2={padding.left + hoveredIdx * stepX + stepX / 2}
                y2={chartHeight - padding.bottom}
                stroke="#f97316"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Yatay Fiyat Çizgisi (İmleç Yüksekliğinde) */}
              <line
                x1={padding.left}
                y1={cursorSvgPos.y}
                x2={viewBoxWidth - padding.right}
                y2={cursorSvgPos.y}
                stroke="#f97316"
                strokeWidth="1.2"
                strokeDasharray="3 3"
              />

              {/* Sağ Eksen Fiyat Rozeti */}
              {cursorPrice !== null && (
                <>
                  <rect
                    x={viewBoxWidth - padding.right + 4}
                    y={cursorSvgPos.y - 10}
                    width={64}
                    height={20}
                    rx="5"
                    fill="#f97316"
                    className="shadow-md"
                  />
                  <text
                    x={viewBoxWidth - padding.right + 36}
                    y={cursorSvgPos.y + 4}
                    textAnchor="middle"
                    className="text-[10px] font-mono fill-white font-extrabold"
                  >
                    {cursorPrice.toFixed(2)} ₺
                  </text>
                </>
              )}
            </g>
          )}
        </svg>
      </div>

      {/* 4. GRAFİK ALT BİLGİ NOTU */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-400 border-t border-zinc-200/60 dark:border-zinc-800/60 pt-3">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
            Yeşil: Boğa (Pozitif Kapanış)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            Kırmızı: Ayı (Negatif Kapanış)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
            Taban Kilidi (% -10)
          </span>
        </div>

        <div className="flex items-center gap-3 font-mono">
          <span className="text-amber-500 font-semibold">• SMA 20 (Hızlı Trend)</span>
          <span className="text-purple-500 font-semibold">• SMA 50 (Ana Trend)</span>
        </div>
      </div>
    </div>
  );
}

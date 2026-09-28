'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { BISTStock } from '@/types/stock';
import { generateTrendAnalysis, TrendPillars } from '@/lib/trend-analysis-engine';
import { StockLogo } from './StockLogo';
import { WatchlistToggle } from './WatchlistToggle';
import { CandlestickChart } from './CandlestickChart';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Zap,
  BarChart3,
  Search,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Sliders,
  Sparkles,
  HelpCircle,
  Clock,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Scale,
  Maximize2,
  Eye,
  Radio,
} from 'lucide-react';

interface TrendAnalysisViewProps {
  stocks: BISTStock[];
  initialSymbol?: string;
  onSelectStock?: (stock: BISTStock) => void;
}

export function TrendAnalysisView({
  stocks,
  initialSymbol = 'THYAO',
  onSelectStock,
}: TrendAnalysisViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [searchQuery, setSearchQuery] = useState('');
  const ribbonRef = useRef<HTMLDivElement>(null);

  // Dışarıdan gelen initialSymbol değişimini dinle
  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Seçili hisseyi bul
  const currentStock = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || stocks[0] || {
      symbol: 'THYAO',
      name: 'Türk Hava Yolları',
      currentPrice: 320.5,
      changePercent: 2.4,
      volume24h: 4500000000,
      high52w: 324.0,
      low52w: 316.5,
      sector: 'Havacılık',
    };
  }, [stocks, selectedSymbol]);

  // 17 Sütunlu Trend Analizini hesapla
  const trendData = useMemo(() => {
    return generateTrendAnalysis(currentStock);
  }, [currentStock]);

  // Arama filtrelemesi
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return stocks;
    const q = searchQuery.toLowerCase().trim();
    return stocks.filter(
      (s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q)
    );
  }, [stocks, searchQuery]);

  // Hızlı şerit kaydırma
  const scrollRibbon = (direction: 'left' | 'right') => {
    if (ribbonRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      ribbonRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    const found = stocks.find((s) => s.symbol === sym);
    if (found && onSelectStock) {
      onSelectStock(found);
    }
  };

  const {
    trendAnalysis,
    priceBehavior,
    volumeAnalysis,
    patternDetection,
    rsiMacdAnalysis,
    trendBuildUp,
    volumeAlgorithm,
    liquidityAnalysis,
    directionalBias,
    bullRoadmap,
    bearRoadmap,
    scalpMode,
    swingMode,
    whenTrendStarts,
    trendLossWarning,
    criticalBands,
    technicalExecutiveSummary,
  } = trendData;

  return (
    <div className="space-y-6">
      {/* 1. ÜST ŞERİT: Arama ve Kayar Hisse Seçim Çubuğu */}
      <div className="relative overflow-hidden p-4 sm:p-5 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
        {/* Ambient Top Hairline Beam */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                17 Aşamalı Kapsamlı Trend & Price Action Analizi
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-300 border border-orange-500/30 font-mono">
                  BIST TÜM (XUTUM)
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Makro/mikro trend, mum dinamiği, likidite havuzları, algoritmik hacim ve senaryo yol haritaları.
              </p>
            </div>
          </div>

          {/* Canlı Arama Kutusu */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="BIST TÜM hissesi ara (630+ hisse)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-[#1E212B]/90 border border-white/5 focus:outline-none focus:ring-2 focus:ring-orange-500/40 text-white font-medium"
            />
            {/* Anlık Arama Sonuç Açılır Listesi */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 max-h-72 overflow-y-auto bg-[#15171E] border border-white/5 rounded-2xl shadow-2xl z-50 divide-y divide-zinc-100 dark:divide-zinc-800/80">
                {filteredStocks.slice(0, 10).map((s) => (
                  <button
                    key={s.symbol}
                    onClick={() => {
                      handleSelectSymbol(s.symbol);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-2.5 hover:bg-orange-500/10 text-left transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <StockLogo symbol={s.symbol} sector={s.sector} size="sm" />
                      <div className="min-w-0">
                        <span className="font-extrabold font-mono text-xs text-white block">
                          {s.symbol}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate block max-w-[150px]">
                          {s.name}
                        </span>
                      </div>
                    </div>
                    <div className="text-right font-mono shrink-0 ml-2">
                      <span className="font-bold text-xs text-white block">
                        {s.currentPrice.toFixed(2)} ₺
                      </span>
                      <span
                        className={`text-[10px] font-bold block ${
                          (s.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {(s.changePercent ?? 0) >= 0 ? '+' : ''}%{s.changePercent?.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
                {filteredStocks.length === 0 && (
                  <div className="p-3 text-center text-xs text-zinc-400 font-mono">
                    Hisse bulunamadı
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Kayar Şerit (Slider Carousel) */}
        <div className="relative flex items-center">
          <button
            onClick={() => scrollRibbon('left')}
            className="absolute left-0 z-20 p-2 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-white/5 shadow-md text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition-all -ml-2"
            title="Sola kaydır"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div
            ref={ribbonRef}
            className="flex items-center gap-2 overflow-x-auto scrollbar-none py-1 px-4 scroll-smooth w-full"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {filteredStocks.slice(0, 36).map((s) => {
              const isSelected = s.symbol === selectedSymbol;
              return (
                <button
                  key={s.symbol}
                  onClick={() => handleSelectSymbol(s.symbol)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl shrink-0 transition-all border text-left ${
                    isSelected
                      ? 'bg-orange-500/15 border-orange-500/50 shadow-[0_0_12px_rgba(6,182,212,0.2)] text-white ring-2 ring-orange-500/30'
                      : 'bg-[#0F1116] border-zinc-200/80 dark:border-zinc-800 hover:border-orange-500/30 text-zinc-400'
                  }`}
                >
                  <StockLogo symbol={s.symbol} sector={s.sector} size="sm" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold font-mono text-xs text-white">
                        {s.symbol}
                      </span>
                      <span
                        className={`text-[10px] font-bold font-mono ${
                          (s.changePercent ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {(s.changePercent ?? 0) >= 0 ? '+' : ''}%{s.changePercent?.toFixed(2)}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500 block">
                      {s.currentPrice.toFixed(2)} ₺
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => scrollRibbon('right')}
            className="absolute right-0 z-20 p-2 rounded-full bg-white/95 dark:bg-zinc-800/95 border border-white/5 shadow-md text-zinc-600 dark:text-zinc-300 hover:text-orange-500 transition-all -mr-2"
            title="Sağa kaydır"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. HERO KART: Seçili Hisse Fiyatı + Yön (% Boğa / % Ayı) ve Trend Barometresi */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-6 group">
        {/* Top Hairline Neon Beam */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Sol: Logo + İsim + Fiyat */}
          <div className="flex items-center gap-4">
            <StockLogo symbol={currentStock.symbol} sector={currentStock.sector} size="xl" />
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                  {currentStock.symbol}
                  <WatchlistToggle symbol={currentStock.symbol} iconSize={24} />
                </h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-[#1E212B] text-zinc-400">
                  {currentStock.sector}
                </span>
                <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
                  {trendAnalysis.macroTrend}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-zinc-400 mt-0.5">
                {currentStock.name}
              </p>
              <div className="flex items-baseline gap-3 mt-2">
                <span className="text-2xl sm:text-3xl font-black font-mono text-white">
                  {currentStock.currentPrice.toFixed(2)} ₺
                </span>
                <span
                  className={`text-sm font-bold font-mono px-2.5 py-0.5 rounded-lg ${
                    (currentStock.changePercent ?? 0) >= 0
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
                  }`}
                >
                  {(currentStock.changePercent ?? 0) >= 0 ? '+' : ''}%{currentStock.changePercent?.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Sağ: 9) Yön Hesabı (% Boğa vs % Ayı Barı) */}
          <div className="w-full lg:w-96 p-4 rounded-2xl bg-[#0F1116] border border-white/5 space-y-2.5 shadow-sm">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-orange-500" />
                9) Yön Analizi (Sentez)
              </span>
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded-md bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/25">
                {directionalBias.verdict}
              </span>
            </div>

            {/* Çift Yönlü İlerleme Barı */}
            <div className="h-4 rounded-full bg-[#1E212B] overflow-hidden flex p-0.5">
              <div
                className="bg-gradient-to-r from-emerald-500 to-orange-500 h-full rounded-full transition-all duration-700 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                style={{ width: `${directionalBias.bullishPercent}%` }}
                title={`%${directionalBias.bullishPercent} Boğa`}
              />
              <div
                className="bg-rose-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${directionalBias.bearishPercent}%` }}
                title={`%${directionalBias.bearishPercent} Ayı`}
              />
            </div>

            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                ▲ %{directionalBias.bullishPercent} BOĞA
              </span>
              <span className="text-rose-500 font-extrabold">
                ▼ %{directionalBias.bearishPercent} AYI
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 leading-tight">
              {directionalBias.weightsNote}
            </p>
          </div>
        </div>
      </div>

      {/* 2.5) İNTERAKTİF MUM GRAFİĞİ: Gerçek Zamanlı Günlük OHLCV, SMA20, SMA50 ve Hacim */}
      <CandlestickChart
        symbol={currentStock.symbol}
        stockName={currentStock.name}
        currentPrice={currentStock.currentPrice}
        changePercent={currentStock.changePercent}
      />

      {/* 3. 17 AŞAMALI ANALİZ MATRİSİ — BLOKLAR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ========================================================================= */}
        {/* 1) TREND ANALİZİ KARTI */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                1) Trend Analizi
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Güç: {trendAnalysis.strengthScore}/10
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Makro Trend</span>
              <span className="font-extrabold text-zinc-200 block mt-0.5">
                {trendAnalysis.macroTrend}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Mikro Trend</span>
              <span className="font-extrabold text-orange-600 dark:text-orange-400 block mt-0.5">
                {trendAnalysis.microTrend}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Tepe / Dip Dizisi</span>
              <span className="font-semibold text-zinc-300 block mt-0.5">
                {trendAnalysis.sequence}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Yapı Durumu</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {trendAnalysis.structureStatus}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-xs text-zinc-300">
            <strong>Çıktı Özeti:</strong> {trendAnalysis.summary}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2) FİYAT DAVRANIŞI KARTI */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                2) Fiyat Davranışı & Mum Karakteri
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              {priceBehavior.buyerSellerPressure.dominant}
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Mum Yapısı</span>
              <p className="text-zinc-300 mt-0.5">{priceBehavior.candleStructure}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Fitil / Gövde Oranı</span>
                <p className="text-zinc-300 mt-0.5">{priceBehavior.wickBodyRatio}</p>
              </div>
              <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
                <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Volatilite Durumu</span>
                <p className="text-purple-600 dark:text-purple-400 font-bold mt-0.5">{priceBehavior.volatility}</p>
              </div>
            </div>

            {/* Alıcı vs Satıcı Baskısı */}
            <div className="p-3.5 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-1.5">
              <div className="flex justify-between font-mono font-bold text-xs">
                <span className="text-emerald-500">Alıcı Gücü: %{priceBehavior.buyerSellerPressure.buyerPercent}</span>
                <span className="text-rose-500">Satıcı Gücü: %{priceBehavior.buyerSellerPressure.sellerPercent}</span>
              </div>
              <p className="text-zinc-400 text-[11px] leading-relaxed">
                {priceBehavior.buyerSellerPressure.trendChangeReadiness}
              </p>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3) HACİM ANALİZİ KARTI */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                3) Hacim Analizi
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              {volumeAnalysis.confirmation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Yükseliş Hacmi</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                {volumeAnalysis.upVolumeStatus}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Düşüş Hacmi</span>
              <span className="font-semibold text-zinc-300 block mt-0.5">
                {volumeAnalysis.downVolumeStatus}
              </span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs space-y-1">
            <span className="font-bold text-zinc-200">Absorption / Climax Durumu:</span>
            <p className="text-zinc-400 leading-relaxed">
              {volumeAnalysis.absorptionClimax.detail}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-zinc-300">
            <strong>Kırılım Teyidi:</strong> {volumeAnalysis.breakoutVolumeNote}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4) PATTERN TESPİTİ + CONFIDENCE % */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                4) Pattern Tespiti & Güven Oranı
              </h3>
            </div>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
              %{patternDetection.confidenceScore} Güven
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {patternDetection.patterns.map((pt, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-white">{pt.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-400 font-bold">
                      {pt.type}
                    </span>
                  </div>
                  <span className="text-[11px] text-zinc-500 block mt-0.5">Tetik: {pt.triggerCondition}</span>
                </div>
                <span className="font-mono font-black text-amber-400 text-sm shrink-0">
                  %{pt.confidencePercent}
                </span>
              </div>
            ))}
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300">
            <strong>Dönüş Şartı & İptal Kuralı:</strong> {patternDetection.reversalConfirmationRequirement}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5) RSI & MACD ANALİZİ */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Sliders className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                5) RSI & MACD Analizi
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30">
              {rsiMacdAnalysis.confirmation}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">RSI Değeri & Range</span>
              <span className="font-extrabold text-base font-mono text-indigo-600 dark:text-indigo-400 block mt-0.5">
                {rsiMacdAnalysis.rsiValue}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">{rsiMacdAnalysis.rsiRangeShift}</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">MACD Histogramı</span>
              <span className="font-extrabold text-base font-mono text-emerald-500 block mt-0.5">
                {rsiMacdAnalysis.macdHistogram >= 0 ? '+' : ''}{rsiMacdAnalysis.macdHistogram}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">{rsiMacdAnalysis.macdCrossState}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs">
            <span className="font-bold text-zinc-200 block mb-0.5">Divergence (Uyumsuzluk):</span>
            <span className="text-zinc-400">{rsiMacdAnalysis.rsiDivergence}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 text-xs text-zinc-300">
            <strong>Momentum Özeti:</strong> {rsiMacdAnalysis.summary}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 6) TREND BUILD-UP SKORU (0–10) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                6) Trend Build-Up Skoru (0–10)
              </h3>
            </div>
            <span className="text-base font-black font-mono px-3 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              {trendBuildUp.score} / 10
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Sıkışma (Compression)</span>
              <p className="text-zinc-300 mt-0.5">{trendBuildUp.compression}</p>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Hacim Daralması & EMA Yakınsaması</span>
              <p className="text-zinc-300 mt-0.5">{trendBuildUp.volumeContraction} {trendBuildUp.emaConvergence}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-zinc-300">
            <strong>Enerji Birikimi & Nitelik:</strong> {trendBuildUp.energyAccumulation} — {trendBuildUp.quality}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 7) HACİM ALGORİTMASI TESPİTİ */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-zinc-400/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-zinc-500/10 text-zinc-600 dark:text-zinc-300">
                <Radio className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                7) Hacim Algoritması Tespiti
              </h3>
            </div>
            <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg bg-[#1E212B] text-zinc-400">
              L2 Derinlik Doğrulama
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-zinc-400">Spoofing / Emir Aldatması:</span>
                <span className="font-mono text-zinc-500 text-[11px]">{volumeAlgorithm.spoofing}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Layering (Katmanlama):</span>
                <span className="font-mono text-zinc-500 text-[11px]">{volumeAlgorithm.layering}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Iceberg (Buzdağı Emri):</span>
                <span className="font-mono text-zinc-500 text-[11px]">{volumeAlgorithm.iceberg}</span>
              </div>
            </div>
            <p className="text-zinc-400 text-[11px] leading-relaxed">
              {volumeAlgorithm.roboticRepetition}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#1E212B]/60 border border-white/5 text-xs text-zinc-300">
            <strong>Çıktı Kararı:</strong> {volumeAlgorithm.verdict}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 8) LİKİDİTE ANALİZİ */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                8) Likidite Analizi & Stop Havuzları
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              Sweep & Reclaim Aktif
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Üst Likidite Havuzu (Buy-Side)</span>
              <span className="font-extrabold text-base font-mono text-white block mt-0.5">
                {liquidityAnalysis.upperPoolPrice} ₺
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Kurumsal Kâr Al</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Alt Likidite Havuzu (Sell-Side)</span>
              <span className="font-extrabold text-base font-mono text-rose-500 block mt-0.5">
                {liquidityAnalysis.lowerPoolPrice} ₺
              </span>
              <span className="text-[10px] text-zinc-500 block mt-0.5">Perakende Stop Bölgesi</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs space-y-1">
            <span className="font-bold text-zinc-200">Sweep / Reclaim Durumu:</span>
            <p className="text-zinc-400 leading-relaxed">
              {liquidityAnalysis.sweepGrabState} {liquidityAnalysis.reclaimState}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-blue-500/5 border border-blue-500/20 text-xs text-zinc-300">
            <strong>Stop Yoğunlaşması:</strong> {liquidityAnalysis.stopClusterNote}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 10) YOL HARİTASI (BOĞA SENARYOSU) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                10) Yol Haritası (Boğa Senaryosu)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Tetikçi Direnç: {bullRoadmap.requiredResistance} ₺
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            {bullRoadmap.targets.map((tgt, i) => (
              <div key={i} className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block font-sans font-bold uppercase">
                  Hedef {i + 1}
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                  {tgt} ₺
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs">
            <span className="font-bold text-zinc-200 block mb-0.5">Retest Alanı:</span>
            <span className="text-zinc-400">{bullRoadmap.closeRetestZone}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 text-xs text-zinc-300">
            <strong>Plan Özeti & Invalidation:</strong> {bullRoadmap.planSummary}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 11) YOL HARİTASI (AYI SENARYOSU) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                11) Yol Haritası (Ayı Senaryosu)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
              Kritik Destek: {bearRoadmap.requiredSupport} ₺
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            {bearRoadmap.downsideTargets.map((tgt, i) => (
              <div key={i} className="p-3 rounded-2xl bg-rose-500/10 border border-rose-500/25">
                <span className="text-[10px] text-rose-500 block font-sans font-bold uppercase">
                  Aşağı Hedef {i + 1}
                </span>
                <span className="text-base font-black text-rose-500 block mt-0.5">
                  {tgt} ₺
                </span>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs">
            <span className="font-bold text-zinc-200 block mb-0.5">Yeniden Satış Tetikleyicisi:</span>
            <span className="text-zinc-400">{bearRoadmap.reactivationTriggers}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-rose-500/5 border border-rose-500/20 text-xs text-zinc-300">
            <strong>Plan Özeti & Invalidation:</strong> {bearRoadmap.planSummary}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 12) SCALP MODE */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                12) Scalp Mode (Mikro İşlem Alanları)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
              {scalpMode.tradeType}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#0F1116] border border-white/5 text-xs">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Mikro Dalgalanma Bandı</span>
            <span className="text-sm font-bold font-mono text-white mt-0.5 block">
              {scalpMode.microZone}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">İlk Tepki / Arz Alanı</span>
              <span className="text-base font-bold text-zinc-200 mt-0.5 block">{scalpMode.firstReactionSupply} ₺</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Güçlü Arz / Likidite Bölgesi</span>
              <span className="text-base font-bold text-zinc-200 mt-0.5 block">{scalpMode.strongSupplyLiquidity} ₺</span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-300">
            <strong>Scalp Tavsiyesi:</strong> {scalpMode.recommendation}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 13) SWING MODE */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                13) Swing Mode (Orta-Uzun Vade Seviyeleri)
              </h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-xl bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Golden Pocket: {swingMode.fiboGoldenPocket} ₺
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Major Dirençler</span>
              <div className="font-mono font-bold text-white mt-1 flex flex-wrap gap-2">
                {swingMode.majorResistanceLevels.map((r, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800">
                    {r} ₺
                  </span>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Major Destekler (SMA)</span>
              <div className="font-mono font-bold text-white mt-1 flex flex-wrap gap-2">
                {swingMode.majorSupportLevels.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 rounded-md bg-zinc-200/80 dark:bg-zinc-800">
                    {s} ₺
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-orange-500/5 border border-orange-500/20 text-xs text-zinc-300">
            <strong>Swing Pozisyon Planı:</strong> {swingMode.recommendation}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 14) NE ZAMAN TREND BAŞLAR? */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/80 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              14) Ne Zaman Trend Başlar?
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider block">
              Tetikleyici Koşul Cümlesi:
            </span>
            <p className="text-xs sm:text-sm text-emerald-950 dark:text-emerald-200 font-medium leading-relaxed">
              "{whenTrendStarts.statement}"
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Tetikleyici Seviye</span>
              <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {whenTrendStarts.triggerLevel} ₺
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 uppercase block font-semibold">Hacim Teyidi</span>
              <span className="text-xs font-medium text-zinc-300 mt-0.5 block">
                {whenTrendStarts.volumeCondition}
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 15) ZAYIFLAMA / TREND KAYBI NASIL ANLAŞILIR? */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              15) Zayıflama / Trend Kaybı Nasıl Anlaşılır?
            </h3>
          </div>

          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 space-y-2">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-300 uppercase tracking-wider block">
              Zayıflama / Stop Koşul Cümlesi:
            </span>
            <p className="text-xs sm:text-sm text-rose-950 dark:text-rose-200 font-medium leading-relaxed">
              "{trendLossWarning.statement}"
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5 text-xs space-y-1.5">
            <span className="text-[10px] text-zinc-400 uppercase font-semibold block">Erken Uyarı Sinyalleri:</span>
            <ul className="space-y-1">
              {trendLossWarning.momentumLossSigns.map((sign, i) => (
                <li key={i} className="flex items-center gap-2 text-zinc-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                  <span>{sign}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 16) KRİTİK BANTLAR (ÜST / ALT SEVİYELER) */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 lg:col-span-2">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                <Maximize2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">
                16) Kritik Bantlar & Fiyat Denge Analizi
              </h3>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
              {criticalBands.balanceAssessment}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Alt Bant (Taban)</span>
              <span className="text-lg font-black text-rose-500 mt-0.5 block">{criticalBands.lowerBand} ₺</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Canlı Fiyat</span>
              <span className="text-lg font-black text-white mt-0.5 block">{currentStock.currentPrice.toFixed(2)} ₺</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Üst Bant (Tavan)</span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-0.5 block">{criticalBands.upperBand} ₺</span>
            </div>
            <div className="p-3 rounded-2xl bg-[#0F1116] border border-white/5">
              <span className="text-[10px] text-zinc-400 block font-sans uppercase">Kırılım Hedefi</span>
              <span className="text-lg font-black text-orange-600 dark:text-orange-400 mt-0.5 block">{criticalBands.breakoutUpsideTarget} ₺</span>
            </div>
          </div>

          {/* Bant İçi İlerleme Barı */}
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-rose-500">Alt Sınır: {criticalBands.lowerBand} ₺</span>
              <span className="text-zinc-400 font-sans">Bant İçi Konum: %{criticalBands.currentPositionInBand}</span>
              <span className="text-emerald-500">Üst Sınır: {criticalBands.upperBand} ₺</span>
            </div>
            <div className="w-full h-3 rounded-full bg-[#1E212B] overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-500 transition-all duration-500"
                style={{ width: `${criticalBands.currentPositionInBand}%` }}
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 17) SONUÇ – TEKNİK OKUMA ÖZETİ */}
        {/* ========================================================================= */}
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-5 lg:col-span-2 group">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/80 to-transparent" />
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-orange-500 to-blue-600 text-white font-bold shadow-md">
              <Eye className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                17) Sonuç — Teknik Okuma ve Karar Özeti
              </h3>
              <p className="text-xs text-zinc-400">
                Tüm başlıkların ağırlıklandırılmış senteziyle üretilen karar odaklı strateji.
              </p>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-[#0F1116] border border-white/5 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2.5">
            <p>
              <strong>Büyük Resim:</strong> {technicalExecutiveSummary.bigPicture}
            </p>
            <p className="text-zinc-400">
              <strong>Momentum & Eşikler:</strong> {technicalExecutiveSummary.momentumSummary} {technicalExecutiveSummary.criticalThresholds}
            </p>
            <div className="p-3.5 rounded-xl bg-orange-500/10 border border-orange-500/25 font-semibold text-cyan-900 dark:text-cyan-200">
              🎯 <strong>Nihai Karar & Aksiyon:</strong> {technicalExecutiveSummary.finalDecisionVerdict}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

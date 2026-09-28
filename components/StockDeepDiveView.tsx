'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BISTStock } from '@/types/stock';
import { StockLogo } from './StockLogo';
import { WatchlistToggle } from './WatchlistToggle';
import { createSwingFibo, FiboLevels } from '@/types/trade';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Activity,
  Sparkles,
  Shield,
  Layers,
  Award,
  Target,
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Calendar,
  Clock,
  Zap,
  Info,
  SlidersHorizontal,
  Flame,
  PieChart as PieIcon,
  HelpCircle,
  ExternalLink,
  Scale,
  ShieldCheck,
  Gauge,
  Compass,
} from 'lucide-react';

interface StockDeepDiveViewProps {
  stocks: BISTStock[];
  initialSymbol?: string;
  onSelectStock?: (stock: BISTStock) => void;
}

export function StockDeepDiveView({ stocks, initialSymbol = 'THYAO', onSelectStock }: StockDeepDiveViewProps) {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(initialSymbol);
  const [searchQuery, setSearchQuery] = useState('');
  const [indexScope, setIndexScope] = useState<'TÜMÜ' | 'BIST 30' | 'BIST 50' | 'BIST 100' | 'BIST TÜM'>('TÜMÜ');
  const [activeTab, setActiveTab] = useState<'all' | 'priceAction' | 'fundamental' | 'flow' | 'kap'>('all');

  const tickerRef = useRef<HTMLDivElement>(null);

  // Dışarıdan gelen initialSymbol değişimini dinle
  useEffect(() => {
    if (initialSymbol) {
      setSelectedSymbol(initialSymbol);
    }
  }, [initialSymbol]);

  // Hisse seçildiğinde hem yerel state'i güncelle hem de ebeveyne bildir
  const handleSelectSymbol = (sym: string) => {
    setSelectedSymbol(sym);
    const target = stocks.find((s) => s.symbol === sym);
    if (target && onSelectStock) {
      onSelectStock(target);
    }
  };

  // Kayar ticker kontrol fonksiyonu
  const scrollTicker = (direction: 'left' | 'right') => {
    if (tickerRef.current) {
      const offset = direction === 'left' ? -320 : 320;
      tickerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  // Aktif seçili hisse
  const currentStock = useMemo(() => {
    return stocks.find((s) => s.symbol === selectedSymbol) || stocks[0] || null;
  }, [stocks, selectedSymbol]);

  // Arama ve filtre listesi
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return stocks
      .filter((s) => s.symbol.toLowerCase().includes(q) || s.name.toLowerCase().includes(q))
      .slice(0, 8);
  }, [stocks, searchQuery]);

  // Popüler hisseler barı (BIST 30, BIST 100 & Ağır Toplar - 24 Hisse)
  const popularTickers = useMemo(() => {
    const pinned = [
      'THYAO', 'TRALT', 'ASELS', 'GARAN', 'TUPRS', 'ASTOR', 'PGSUS', 'EREGL',
      'BIMAS', 'FROTO', 'SISE', 'ARDYZ', 'KCHOL', 'SAHOL', 'ISCTR', 'AKBNK',
      'YKBNK', 'CWENE', 'EKGYO', 'ENKAI', 'KOZAL', 'KONTR', 'MGROS', 'TCELL'
    ];
    return stocks.filter((s) => pinned.includes(s.symbol));
  }, [stocks]);

  // Kapsam listesi
  const scopedStocks = useMemo(() => {
    if (indexScope === 'TÜMÜ') return stocks;
    if (indexScope === 'BIST 30') return stocks.filter((s) => s.indexCategory === 'BIST 30');
    if (indexScope === 'BIST 50') return stocks.filter((s) => s.indexCategory === 'BIST 30' || s.indexCategory === 'BIST 50');
    if (indexScope === 'BIST 100') return stocks.filter((s) => s.indexCategory !== 'BIST TÜM');
    return stocks.filter((s) => s.indexCategory === 'BIST TÜM');
  }, [stocks, indexScope]);

  // Dinamik Recent Swing Leg Fibo Hesaplaması
  const swingFibo = useMemo<FiboLevels | null>(() => {
    if (!currentStock) return null;
    const price = currentStock.currentPrice;
    // 2-4 haftalık dalga aralığı
    const bandwidth = currentStock.technical?.bollinger?.bandwidth || 0.14;
    const swingLow = +(price * (1 - bandwidth * 0.75)).toFixed(2);
    const swingHigh = +(price * (1 + bandwidth * 0.85)).toFixed(2);
    return createSwingFibo(swingLow, swingHigh);
  }, [currentStock]);

  if (!currentStock) {
    return (
      <div className="p-12 text-center text-zinc-500">
        Hisse verisi yükleniyor...
      </div>
    );
  }

  const { technical, fundamental, analysts, sentiment, score } = currentStock;

  // Skor rengi
  const scoreColor =
    score.overallScore >= 80
      ? 'from-emerald-500 to-teal-600 text-emerald-400'
      : score.overallScore >= 68
      ? 'from-orange-500 to-blue-600 text-orange-400'
      : score.overallScore >= 52
      ? 'from-amber-500 to-orange-600 text-amber-400'
      : 'from-rose-500 to-red-600 text-rose-400';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Üst Kontrol & Hızlı Hisse Arama / Seçim Barı */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#15171E] border border-white/5 shadow-sm space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Arama Kutusu */}
          <div className="relative flex-1 max-w-xl">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="194 hisse arasında ara (örn: THYAO, ASELS, TRALT, CWENE)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-50 dark:bg-zinc-950 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder:text-zinc-400 focus:outline-none focus:border-emerald-500 shadow-inner"
            />
            {/* Arama Sonuç Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 top-full mt-1.5 bg-[#15171E] border border-white/5 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 dark:divide-zinc-800">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => {
                      handleSelectSymbol(stock.symbol);
                      setSearchQuery('');
                    }}
                    className="w-full flex items-center justify-between p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <StockLogo symbol={stock.symbol} sector={stock.sector} size="sm" />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-white">{stock.symbol}</span>
                          <span className="text-[10px] text-zinc-400">{stock.sector}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500 truncate max-w-[240px]">{stock.name}</div>
                      </div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="text-xs font-bold text-white">{stock.currentPrice.toFixed(2)} ₺</div>
                      <span className={`text-[10px] font-semibold ${stock.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stock.changePercent >= 0 ? '+' : ''}%{stock.changePercent.toFixed(2)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Endeks Kategori Filtre Butonları */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
            {(['TÜMÜ', 'BIST 30', 'BIST 50', 'BIST 100', 'BIST TÜM'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setIndexScope(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  indexScope === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-[#1E212B] text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Hızlı Erişim Kayar Ticker Barı (Smooth Slider Ribbon) */}
        <div className="relative flex items-center gap-1.5 pt-1">
          {/* Sol Kaydırma Butonu */}
          <button
            onClick={() => scrollTicker('left')}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-[#1E212B] dark:hover:bg-zinc-700 border border-white/5 shadow-sm text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 transition-all shrink-0 active:scale-95"
            title="Sola Kaydır"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Başlık Rozeti */}
          <div className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider shrink-0 flex items-center gap-1 px-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Öne Çıkanlar:</span>
          </div>

          {/* Kayar Ticker Butonları */}
          <div
            ref={tickerRef}
            className="flex items-center gap-2 overflow-x-auto scroll-smooth py-1 text-xs flex-1"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {popularTickers.map((s) => {
              const isSelected = s.symbol === selectedSymbol;
              return (
                <button
                  key={s.symbol}
                  onClick={() => handleSelectSymbol(s.symbol)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all shrink-0 border ${
                    isSelected
                      ? 'bg-[#1E212B] text-white border-orange-500/50 border-zinc-900 dark:border-zinc-100 shadow-md ring-2 ring-emerald-500/40'
                      : 'bg-zinc-50 dark:bg-zinc-800/80 text-zinc-300 border-white/5 hover:border-emerald-500 hover:bg-white dark:hover:bg-zinc-800'
                  }`}
                >
                  <StockLogo symbol={s.symbol} sector={s.sector} size="sm" />
                  <span>{s.symbol}</span>
                  <span className={`text-[10px] ${s.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {s.changePercent >= 0 ? '+' : ''}{s.changePercent.toFixed(1)}%
                  </span>
                </button>
              );
            })}
          </div>

          {/* Sağ Kaydırma Butonu */}
          <button
            onClick={() => scrollTicker('right')}
            className="p-1.5 rounded-xl bg-zinc-100 hover:bg-[#1E212B] dark:hover:bg-zinc-700 border border-white/5 shadow-sm text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 transition-all shrink-0 active:scale-95"
            title="Sağa Kaydır"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Hero Başlık Kartı: Şirket Logosu, Canlı Fiyat, Skor ve Gün İçi Bant */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white/95 via-white/90 to-zinc-50/80 dark:from-zinc-900/95 dark:via-zinc-900/90 dark:to-zinc-950/95 backdrop-blur-2xl border border-white/5 shadow-[0_12px_40px_-12px_rgba(0,0,0,0.08)] dark:shadow-[0_12px_40px_-12px_rgba(0,0,0,0.6)] relative overflow-hidden group">
        {/* Üst hairline gradient beam */}
        <div className="absolute inset-x-0 top-0 h-[2.5px] bg-gradient-to-r from-transparent via-emerald-500/60 to-transparent pointer-events-none" />
        
        {/* Çok katmanlı ambient ışıklar */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 dark:bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-orange-500/10 dark:bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Sol: Logo + Şirket Bilgileri */}
          <div className="flex items-start sm:items-center gap-4">
            <StockLogo key={currentStock.symbol} symbol={currentStock.symbol} sector={currentStock.sector} size="xl" className="shadow-2xl ring-2 ring-zinc-200/80 dark:ring-zinc-700/80" />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white flex items-center gap-3">
                  {currentStock.symbol}
                  <WatchlistToggle symbol={currentStock.symbol} iconSize={24} />
                </h1>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-sm ${
                  currentStock.indexCategory === 'BIST 30'
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                    : currentStock.indexCategory === 'BIST 50'
                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30'
                    : currentStock.indexCategory === 'BIST 100'
                    ? 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30'
                    : 'bg-zinc-500/15 text-zinc-700 dark:text-zinc-400 border-zinc-500/30'
                }`}>
                  {currentStock.indexCategory || 'BIST TÜM'}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-zinc-100/90 dark:bg-zinc-800/90 text-zinc-600 dark:text-zinc-300 border border-white/5 shadow-sm">
                  {currentStock.sector}
                </span>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  Canlı Piyasa
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-semibold text-zinc-700 dark:text-zinc-200">
                {currentStock.name}
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1 flex items-center gap-1.5">
                <span>Borsa İstanbul Yıldız Pazar</span>
                <span>•</span>
                <span>TRY (₺)</span>
              </p>
            </div>
          </div>

          {/* Sağ: Canlı Fiyat + AI Skor Rozeti */}
          <div className="flex flex-wrap items-center gap-6 sm:gap-8 justify-between lg:justify-end">
            {/* Fiyat Bloğu */}
            <div>
              <span className="text-xs text-zinc-400 block font-medium mb-0.5">Güncel Fiyat</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
                  {currentStock.currentPrice.toFixed(2)} <span className="text-xl font-normal text-zinc-400">₺</span>
                </span>
                <span
                  className={`text-sm sm:text-base font-bold font-mono px-2.5 py-0.5 rounded-xl flex items-center gap-0.5 shadow-sm ${
                    currentStock.changePercent >= 0
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {currentStock.changePercent >= 0 ? <ArrowUpRight className="w-4 h-4 stroke-[2.5]" /> : <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />}
                  {currentStock.changePercent >= 0 ? '+' : ''}%{currentStock.changePercent.toFixed(2)}
                </span>
              </div>
            </div>

            {/* AI Skor Rozeti */}
            <div className="flex items-center gap-3.5 bg-gradient-to-b from-zinc-50/90 to-zinc-100/60 dark:from-zinc-950/90 dark:to-zinc-900/60 p-3.5 rounded-2xl border border-white/5 shadow-md">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${scoreColor} flex flex-col items-center justify-center text-white shadow-lg ring-2 ring-white/10`}>
                <span className="text-xl font-black font-mono leading-none">{score.overallScore}</span>
                <span className="text-[9px] uppercase font-bold tracking-wider opacity-90 mt-0.5">Skor</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider block">Yapay Zeka Kararı</span>
                <span className={`text-sm font-black ${
                  score.recommendation.includes('AL')
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-amber-500'
                }`}>
                  {score.recommendation}
                </span>
                <div className="text-[11px] text-zinc-500 font-medium">Üst %{(100 - score.percentileRank).toFixed(0)} Dilimde</div>
              </div>
            </div>
          </div>
        </div>

        {/* Gün İçi ve 52 Haftalık Aralık Göstergesi (Range Bars) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-zinc-100 dark:border-zinc-800/80">
          {/* Gün İçi Aralık */}
          <div className="bg-gradient-to-b from-zinc-50/90 to-zinc-100/40 dark:from-zinc-950/80 dark:to-zinc-900/40 p-4 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-zinc-500 font-medium">Gün İçi Fiyat Aralığı</span>
              <span className="font-mono text-zinc-200 font-bold">
                {(currentStock.currentPrice * 0.985).toFixed(2)} ₺ <span className="text-zinc-400 font-normal">/</span> {(currentStock.currentPrice * 1.018).toFixed(2)} ₺
              </span>
            </div>
            <div className="relative w-full h-2.5 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-sm"
                style={{ width: '60%', marginLeft: '20%' }}
              />
            </div>
          </div>

          {/* 52 Haftalık Aralık */}
          <div className="bg-gradient-to-b from-zinc-50/90 to-zinc-100/40 dark:from-zinc-950/80 dark:to-zinc-900/40 p-4 rounded-2xl border border-white/5 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-2.5">
              <span className="text-zinc-500 font-medium">52 Haftalık Dip / Zirve Cetveli</span>
              <span className="font-mono text-zinc-200 font-bold">
                {currentStock.low52w.toFixed(2)} ₺ <span className="text-zinc-400 font-normal">/</span> {currentStock.high52w.toFixed(2)} ₺
              </span>
            </div>
            <div className="relative w-full h-2.5 bg-zinc-200/80 dark:bg-zinc-800/80 rounded-full">
              {currentStock.high52w > currentStock.low52w && (
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900 shadow-md ring-2 ring-emerald-500/30"
                  style={{
                    left: `${Math.min(95, Math.max(5, ((currentStock.currentPrice - currentStock.low52w) / (currentStock.high52w - currentStock.low52w)) * 100))}%`,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Ana Analiz Katmanları (Sekmeli ya da Kapsamlı Bloklar) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SOL: Price Action & Teknik Seviye Haritası (2 Kolon) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Katman A: Price Action & Fibonacci Seviye Haritası */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 group">
            {/* Ambient Top Hairline Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-500/70 to-transparent" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shadow-sm">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    Price Action & Recent Swing Fibonacci Cetveli
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Son 2-4 haftalık fiyat bacağı (Swing Leg) üzerinden hesaplanan canlı destek/direnç haritası.
                  </p>
                </div>
              </div>
              <span className={`text-xs font-bold px-3 py-1 rounded-full border uppercase shadow-sm ${
                technical.priceAction.trend === 'GÜÇLÜ YÜKSELİŞ'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-[#1E212B] text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
              }`}>
                {technical.priceAction.trend}
              </span>
            </div>

            {/* Price Action Formasyon Notu */}
            <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5 flex items-start gap-3 backdrop-blur-sm">
              <Sparkles className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <span className="font-bold text-zinc-200">Price Action & Yapı Kırılımı (BoS):</span>
                <p className="text-zinc-400 leading-relaxed">
                  {technical.priceAction.pattern}. Fiyat hareketinde Higher High (HH) ve Higher Low (HL) yapısı takip edilmekte;
                  hacim destekli kırılımlar yeni zirve hedeflerini teyit etmektedir.
                </p>
              </div>
            </div>

            {/* 4 Ana Seviye Kartı: S1, S2, R1, R2 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-2xl bg-rose-500/5 dark:bg-rose-950/30 border border-rose-500/20 hover:border-rose-500/40 transition-all">
                <span className="text-[10px] uppercase font-bold text-rose-600 dark:text-rose-400 block tracking-wider">Kritik Stop-Loss</span>
                <span className="text-lg font-black font-mono text-rose-600 dark:text-rose-400 tracking-tight">
                  {technical.priceAction.stopLossLevel.toFixed(2)} ₺
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Destek İhlali</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-950/30 border border-amber-500/20 hover:border-amber-500/40 transition-all">
                <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">Yakın Destek (S1)</span>
                <span className="text-lg font-black font-mono text-amber-400 tracking-tight">
                  {technical.priceAction.supportLevel.toFixed(2)} ₺
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Retest Seviyesi</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-orange-500/5 dark:bg-cyan-950/30 border border-orange-500/20 hover:border-orange-500/40 transition-all">
                <span className="text-[10px] uppercase font-bold text-orange-600 dark:text-orange-400 block tracking-wider">Direnç (R1)</span>
                <span className="text-lg font-black font-mono text-orange-600 dark:text-orange-400 tracking-tight">
                  {technical.priceAction.resistanceLevel.toFixed(2)} ₺
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">Kısa Vade Baraj</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/30 border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
                <span className="text-[10px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block tracking-wider">Fibo Hedef (TP1)</span>
                <span className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
                  {swingFibo?.fibo1272 ? swingFibo.fibo1272.toFixed(2) : (currentStock.currentPrice * 1.12).toFixed(2)} ₺
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5">1.272 Extension</span>
              </div>
            </div>

            {/* Swing Fibonacci Tablosu */}
            {swingFibo && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-2.5">
                  Dinamik Fibonacci Seviyeleri (Swing Dalga)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center font-mono">
                  <div className="p-2.5 rounded-xl bg-[#0F1116] border border-white/5">
                    <span className="text-[9px] text-zinc-400 block uppercase font-sans">Fibo 0.382</span>
                    <span className="text-xs font-bold text-zinc-300">{swingFibo.fibo382?.toFixed(2) ?? '-'}₺</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#0F1116] border border-white/5">
                    <span className="text-[9px] text-zinc-400 block uppercase font-sans">Fibo 0.50</span>
                    <span className="text-xs font-bold text-zinc-300">{swingFibo.fibo500?.toFixed(2) ?? '-'}₺</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.1)]">
                    <span className="text-[9px] text-amber-400 font-bold block uppercase font-sans">0.618 Pocket ★</span>
                    <span className="text-xs font-black text-amber-400">{swingFibo.fibo618?.toFixed(2) ?? '-'}₺</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <span className="text-[9px] text-rose-500 block uppercase font-sans">0.786 Stop</span>
                    <span className="text-xs font-bold text-rose-500">{swingFibo.fibo786?.toFixed(2) ?? '-'}₺</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 block uppercase font-sans">1.272 Ext</span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{swingFibo.fibo1272?.toFixed(2) ?? '-'}₺</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
                    <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block uppercase font-sans">1.618 Altın Hedef</span>
                    <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{swingFibo.fibo1618?.toFixed(2) ?? '-'}₺</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Katman B: Teknik İndikatörler Barometresi */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 group">
            {/* Ambient Top Hairline Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-500/70 to-transparent" />
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-2.5 relative z-10">
              <div className="p-2.5 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shadow-sm">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Hareketli Ortalamalar & Osilatörler Barometresi
                </h3>
                <p className="text-xs text-zinc-400">
                  Trend gücü, hacim ivmesi ve aşırı alım/satım göstergeleri.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* RSI */}
              <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-400">RSI (14 Günlük)</span>
                  <span className="text-xs font-mono font-bold text-white">
                    {technical.rsi.toFixed(1)}
                  </span>
                </div>
                <div className="w-full bg-[#1E212B] h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      technical.rsi > 70 ? 'bg-rose-500' : technical.rsi >= 50 ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                    style={{ width: `${Math.min(100, technical.rsi)}%` }}
                  />
                </div>
                <span className="text-[10px] text-zinc-400 block mt-2">
                  {technical.rsi >= 55 && technical.rsi <= 70
                    ? 'Boğa Momentumu Bölgesinde'
                    : technical.rsi > 70
                    ? 'Aşırı Alım Bölgesinde'
                    : 'Nötr / Test Bölgesinde'}
                </span>
              </div>

              {/* MACD */}
              <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-400">MACD Histogramı</span>
                  <span className={`text-xs font-mono font-bold ${technical.macd.bullishCross ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {technical.macd.histogram >= 0 ? '+' : ''}{technical.macd.histogram.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`w-2 h-2 rounded-full ${technical.macd.bullishCross ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-rose-500'}`} />
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {technical.macd.bullishCross ? 'Pozitif Sinyal Kesişimi (Al)' : 'Nötr / Kesişim Bekleniyor'}
                  </span>
                </div>
              </div>

              {/* Bollinger Squeeze */}
              <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-zinc-400">Bollinger Bandı</span>
                  <span className="text-xs font-mono text-zinc-400">
                    %{((technical.bollinger.bandwidth || 0.14) * 100).toFixed(0)} Bant
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-3">
                  <span className={`w-2 h-2 rounded-full ${technical.bollinger.squeeze ? 'bg-amber-400 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-500'}`} />
                  <span className="text-[11px] font-semibold text-zinc-300">
                    {technical.bollinger.squeeze ? 'Volatilite Sıkışması (Patlama Hazırlığı)' : 'Normal Trend Kanalı'}
                  </span>
                </div>
              </div>
            </div>

            {/* Hareketli Ortalamalar (SMA 20, 50, 200) */}
            <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5">
              <div className="flex items-center justify-between mb-3 text-xs font-bold text-zinc-400">
                <span>Hareketli Ortalama Uyumu (Trend Sıralaması)</span>
                <span className="text-[11px] font-mono text-emerald-500 font-semibold">
                  {technical.movingAverages.goldenCross ? '★ Golden Cross Aktif' : 'Normal Trend'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 font-mono text-center">
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-white/5 shadow-sm">
                  <span className="text-[10px] text-zinc-400 block font-sans">SMA 20 (Kısa Vade)</span>
                  <span className="text-xs font-bold text-zinc-200">{technical.movingAverages.sma20.toFixed(2)} ₺</span>
                  <span className={`text-[10px] block font-sans mt-0.5 font-semibold ${technical.movingAverages.priceAboveSma20 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {technical.movingAverages.priceAboveSma20 ? 'Üzerinde ✓' : 'Altında ✗'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-white/5 shadow-sm">
                  <span className="text-[10px] text-zinc-400 block font-sans">SMA 50 (Orta Vade)</span>
                  <span className="text-xs font-bold text-zinc-200">{technical.movingAverages.sma50.toFixed(2)} ₺</span>
                  <span className={`text-[10px] block font-sans mt-0.5 font-semibold ${technical.movingAverages.priceAboveSma50 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {technical.movingAverages.priceAboveSma50 ? 'Üzerinde ✓' : 'Altında ✗'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-white/90 dark:bg-zinc-900/90 border border-white/5 shadow-sm">
                  <span className="text-[10px] text-zinc-400 block font-sans">SMA 200 (Ana Trend)</span>
                  <span className="text-xs font-bold text-zinc-200">{technical.movingAverages.sma200.toFixed(2)} ₺</span>
                  <span className={`text-[10px] block font-sans mt-0.5 font-semibold ${technical.movingAverages.priceAboveSma200 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {technical.movingAverages.priceAboveSma200 ? 'Üzerinde ✓' : 'Altında ✗'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SAĞ: Temel Analiz, Kurumsal Akış, Analist Hedefleri ve AI Raporu (1 Kolon) */}
        <div className="space-y-6">
          {/* Katman C: Temel Analiz & Değerleme */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 group">
            {/* Ambient Top Hairline Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-2.5 relative z-10">
              <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-sm">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Temel Analiz & Çarpanlar
                </h3>
                <p className="text-xs text-zinc-400">Kârlılık, büyüme ve sektörel değerleme</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <span className="text-[10px] text-zinc-400 block uppercase font-semibold">F/K Oranı</span>
                <span className="text-base font-black font-mono text-white">{fundamental.pe.toFixed(1)}</span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 block mt-0.5 font-medium">
                  Sektör: {fundamental.sectorPeAvg.toFixed(1)}
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <span className="text-[10px] text-zinc-400 block uppercase font-semibold">PD / DD</span>
                <span className="text-base font-black font-mono text-white">{fundamental.pb.toFixed(2)}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5 font-medium">Defter Değeri</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Özsermaye Kâr. (ROE)</span>
                <span className="text-base font-black font-mono text-emerald-600 dark:text-emerald-400">%{fundamental.roe.toFixed(1)}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5 font-medium">Yüksek Verim</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-[#0F1116] border border-white/5 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                <span className="text-[10px] text-zinc-400 block uppercase font-semibold">Temettü Verimi</span>
                <span className="text-base font-black font-mono text-white">%{fundamental.dividendYield.toFixed(1)}</span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block mt-0.5 font-medium">Nakit Akışı</span>
              </div>
            </div>

            {/* Sektörel İskonto */}
            <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs shadow-sm">
              <span className="font-semibold text-emerald-800 dark:text-emerald-300">Sektör Çarpan İskontosu:</span>
              <span className="font-mono font-black text-emerald-400 text-sm">
                %{Math.max(0, fundamental.valuationDiscount).toFixed(1)}
              </span>
            </div>
          </div>



          {/* Katman E: Konsensüs Hedef Fiyat & Aracı Kurumlar */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-4 group">
            {/* Ambient Top Hairline Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 shadow-sm">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Analist Hedef Fiyatı
                  </h3>
                  <p className="text-xs text-zinc-400">12 aylık kurum konsensüsü</p>
                </div>
              </div>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1 rounded-xl shadow-sm">
                +%{analysts.upsidePotential.toFixed(1)} Potansiyel
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#0F1116] border border-white/5 text-center">
              <span className="text-[10px] text-zinc-400 uppercase tracking-wider block font-semibold">Konsensüs 12A Hedef</span>
              <span className="text-2xl font-black font-mono text-white">
                {analysts.consensusTarget.toFixed(2)} ₺
              </span>
            </div>

            {/* Tavsiye Dağılımı */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-[11px] text-zinc-400">
                <span>Kurum Tavsiyeleri:</span>
                <span className="font-mono font-bold text-zinc-300">
                  {analysts.recommendations?.strongBuy || 6} Al / {analysts.recommendations?.hold || 1} Tut
                </span>
              </div>
              <div className="flex h-2.5 rounded-full overflow-hidden bg-[#1E212B] p-0.5">
                <div className="bg-emerald-500 rounded-full" style={{ width: '80%' }} title="Al" />
                <div className="bg-amber-400 rounded-full" style={{ width: '20%' }} title="Tut" />
              </div>
            </div>
          </div>

          {/* Katman F: KAP Bildirimleri & Duyarlılık */}
          <div className="relative overflow-hidden p-6 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-3 group">
            {/* Ambient Top Hairline Beam */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-teal-500/70 to-transparent" />
            <div className="absolute -top-16 -right-16 w-36 h-36 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Son KAP Bildirimi
              </h4>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25 text-emerald-600 dark:text-emerald-400 font-bold">
                {sentiment.recentKAPNews?.[0]?.category || 'OPERASYONEL'}
              </span>
            </div>
            <p className="text-xs text-zinc-300 font-medium leading-relaxed relative z-10">
              {sentiment.recentKAPNews?.[0]?.title || `${currentStock.name} son çeyrek operasyonel değerlendirme ve finansal gelişmeler bildirimi.`}
            </p>
          </div>
        </div>
      </div>

      {/* 4. Uluslararası Kurumsal Skorlama & Sağlıklı Tahmin Laboratuvarı (Global Multi-Factor Quant Terminal) */}
      {score.quantMetrics && (
        <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-6 group">
          {/* Ambient Top Hairline Beam */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/70 to-transparent" />
          <div className="absolute -top-24 -right-24 w-60 h-60 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 dark:border-zinc-800 relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold shadow-md">
                <Scale className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  Uluslararası Kurumsal Çok Faktörlü Model & Tahmin Laboratuvarı
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono">
                    MSCI Barra / AQR Standartları
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">
                  Stanford & NYU Stern akademik modelleri (Piotroski, Altman, Minervini) ve 1-3 aylık Monte Carlo senaryo tahminleri.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold">
              <span className="px-3 py-1.5 rounded-xl bg-[#1E212B] text-zinc-300">
                Alfa İhtimali: <strong className="text-emerald-500 font-extrabold">%{score.quantMetrics.alphaProbability}</strong>
              </span>
            </div>
          </div>

          {/* 3 Ana Akademik / Kurumsal Metrik Kartı */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Piotroski F-Score */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-white/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Piotroski F-Score
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
                  score.quantMetrics.piotroskiFScore >= 7
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : score.quantMetrics.piotroskiFScore >= 5
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}>
                  {score.quantMetrics.piotroskiFScore >= 7 ? 'Üstün Kalite' : score.quantMetrics.piotroskiFScore >= 5 ? 'Dengeli' : 'Zayıf'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {score.quantMetrics.piotroskiFScore}
                </span>
                <span className="text-sm font-bold text-zinc-400 font-mono">/ 9 Kriter</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                Stanford Üniversitesi muhasebe kalitesi ve kârlılık sürdürülebilirlik testi. 7 ve üzeri puan alan hisseler tarihsel olarak yüksek getiri sağlar.
              </p>
            </div>

            {/* 2. Altman Z''-Score (Emerging Market Variant) */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-white/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Gauge className="w-4 h-4 text-orange-500" />
                  Altman Z''-Score
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
                  score.quantMetrics.altmanZone === 'GÜVENLİ (SAFE)'
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : score.quantMetrics.altmanZone === 'GRİ (GREY)'
                    ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                    : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                }`}>
                  {score.quantMetrics.altmanZone}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {score.quantMetrics.altmanZScore}
                </span>
                <span className="text-xs font-medium text-zinc-400">
                  {score.quantMetrics.altmanZScore >= 2.6 ? '(> 2.60 Güvenli Eşik)' : score.quantMetrics.altmanZScore >= 1.1 ? '(1.10 - 2.60 Gri Eşik)' : '(< 1.10 Riskli Eşik)'}
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                NYU Stern tarafından gelişmekte olan piyasalar için geliştirilen kredi gücü & iflas koruma katsayısı.
              </p>
            </div>

            {/* 3. Mark Minervini SEPA Trend Şablonu */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-white/5 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-purple-500" />
                  Minervini SEPA Şablonu
                </span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border font-mono ${
                  score.quantMetrics.minerviniTemplateScore >= 6
                    ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                    : score.quantMetrics.minerviniTemplateScore >= 4
                    ? 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/30'
                    : 'bg-[#1E212B] text-zinc-600 border-zinc-300 dark:border-zinc-700'
                }`}>
                  {score.quantMetrics.minerviniTemplateScore >= 6 ? 'Güçlü Süper Trend' : 'Konsolidasyon'}
                </span>
              </div>

              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black font-mono text-white">
                  {score.quantMetrics.minerviniTemplateScore}
                </span>
                <span className="text-sm font-bold text-zinc-400 font-mono">/ 8 Kural</span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed">
                ABD Yatırım Şampiyonu Mark Minervini'nin SMA 20/50/200 hizalanması, 52H dip/zirve mesafesi ve volatilite daralma filtresi.
              </p>
            </div>
          </div>

          {/* Fama-French 4-Faktör Dağılım Çubukları & Monte Carlo Tahminleri */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            {/* Sol: Fama-French / AQR 4 Faktör Çubukları */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-white/5 space-y-4">
              <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Fama-French & AQR Çok Faktörlü Ağırlık Profili
              </span>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500 font-medium">Değer Faktörü (Value - E/P & B/P İskontosu):</span>
                    <strong className="font-mono text-zinc-200">%{score.quantMetrics.famaFrenchFactors.valueScore}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1E212B] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${score.quantMetrics.famaFrenchFactors.valueScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500 font-medium">Kalite Faktörü (Quality - ROE & Bilanço Sağlığı):</span>
                    <strong className="font-mono text-zinc-200">%{score.quantMetrics.famaFrenchFactors.qualityScore}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1E212B] rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full" style={{ width: `${score.quantMetrics.famaFrenchFactors.qualityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500 font-medium">Momentum Faktörü (Rölatif Güç & Fiyat İvmesi):</span>
                    <strong className="font-mono text-zinc-200">%{score.quantMetrics.famaFrenchFactors.momentumScore}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1E212B] rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${score.quantMetrics.famaFrenchFactors.momentumScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-zinc-500 font-medium">Düşük Risk / Oynaklık (Low Volatility Anomaly):</span>
                    <strong className="font-mono text-zinc-200">%{score.quantMetrics.famaFrenchFactors.lowVolScore}</strong>
                  </div>
                  <div className="w-full h-2 bg-[#1E212B] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${score.quantMetrics.famaFrenchFactors.lowVolScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ: Monte Carlo 1-Aylık Senaryo Fiyat Tahminleri */}
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-white/5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                  1-Aylık Monte Carlo Senaryo Fiyat Tahminleri
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">Risk Profili: {score.quantMetrics.volatilityRiskRating}</span>
              </div>

              {/* 3 Senaryo Kutusu: Ayı, Baz, Boğa */}
              <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25">
                  <span className="text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 block">Kötümser / Ayı</span>
                  <span className="text-sm font-black text-rose-600 dark:text-rose-400">{score.quantMetrics.forecastScenarios.bearPrice} ₺</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">%10 Dip Olasılık</span>
                </div>

                <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/25">
                  <span className="text-[9px] uppercase font-bold text-orange-600 dark:text-orange-400 block">Baz Senaryo</span>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400">{score.quantMetrics.forecastScenarios.basePrice} ₺</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">%50 Medyan Hedef</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30">
                  <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 block">İyimser / Boğa</span>
                  <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{score.quantMetrics.forecastScenarios.bullPrice} ₺</span>
                  <span className="text-[9px] text-zinc-400 block mt-0.5">%90 Tavan Hedef</span>
                </div>
              </div>

              {/* Beklenen Alfa İstatistiği */}
              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5 flex items-center justify-between text-xs font-mono">
                <div>
                  <span className="text-zinc-500 text-[10px] block">1 Aylık Beklenen Alfa:</span>
                  <strong className={score.quantMetrics.expectedAlpha1M >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                    {score.quantMetrics.expectedAlpha1M >= 0 ? '+' : ''}%{score.quantMetrics.expectedAlpha1M}
                  </strong>
                </div>
                <div className="border-l border-white/5 pl-4">
                  <span className="text-zinc-500 text-[10px] block">3 Aylık Beklenen Alfa:</span>
                  <strong className={score.quantMetrics.expectedAlpha3M >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'}>
                    {score.quantMetrics.expectedAlpha3M >= 0 ? '+' : ''}%{score.quantMetrics.expectedAlpha3M}
                  </strong>
                </div>
                <div className="border-l border-white/5 pl-4 text-right">
                  <span className="text-zinc-500 text-[10px] block">Piyasayı Yenme İhtimali:</span>
                  <strong className="text-indigo-600 dark:text-indigo-400">
                    %{score.quantMetrics.alphaProbability}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Alt Katman: BIST-Alpha 5-Faktörlü Yapay Zeka Karar Raporu */}
      <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-[#15171E] backdrop-blur-xl border border-white/5 shadow-xl space-y-5 group">
        {/* Ambient Top Hairline Beam */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-500/70 to-transparent" />
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 relative z-10">
          <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-emerald-500 to-orange-500 text-zinc-950 font-bold shadow-md">
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
              {currentStock.symbol} — BIST-Alpha Yapay Zeka Karar Raporu
            </h3>
            <p className="text-xs text-zinc-400">
              Teknik, temel, momentum, analist hedefi ve KAP katalizörlerinin senteziyle üretilen karar gerekçesi.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#0F1116] border border-white/5 text-xs sm:text-sm text-zinc-300 leading-relaxed space-y-2 backdrop-blur-sm">
          <p>
            <strong>{currentStock.name} ({currentStock.symbol})</strong>, toplamda <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{score.overallScore}/100 puanlık</strong> bileşik BIST-Alpha skoruna sahiptir ve model tarafından <strong className="text-white">{score.recommendation}</strong> statüsünde değerlendirilmektedir.
          </p>
          <p className="text-zinc-400">
            {score.rationale}
          </p>
        </div>

        {/* Güçlü Yönler vs Riskler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Güçlü Yönler */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 space-y-2.5 hover:border-emerald-500/35 transition-all">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Pozitif Faktörler & Güçlü Yönler
            </span>
            <ul className="space-y-2 text-xs text-zinc-300">
              {score.strengths.map((str, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Riskler */}
          <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 space-y-2.5 hover:border-rose-500/35 transition-all">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Riskler & Dikkat Edilmesi Gerekenler
            </span>
            <ul className="space-y-2 text-xs text-zinc-300">
              {score.risks.map((rsk, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{rsk}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

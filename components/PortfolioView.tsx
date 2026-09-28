'use client';

import React, { useState } from 'react';
import { ModelPortfolio, PortfolioHolding, BISTStock, WeeklyPortfolioSnapshot } from '@/types/stock';
import {
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Compass,
  Scale,
  Zap,
  Activity,
  Calendar,
  Clock,
  Sparkles,
  ArrowRight,
  History,
  Layers,
} from 'lucide-react';
import { StockLogo } from './StockLogo';
import { WatchlistToggle } from './WatchlistToggle';

interface PortfolioViewProps {
  portfolios: ModelPortfolio[];
  onSelectStock: (stock: BISTStock) => void;
}

export function PortfolioView({ portfolios, onSelectStock }: PortfolioViewProps) {
  const [selectedStrategy, setSelectedStrategy] = useState<string>(portfolios[0]?.id || 'portfolio-trend-alpha');
  const [selectedWeekId, setSelectedWeekId] = useState<string>('2026-W40');
  const [expandedHolding, setExpandedHolding] = useState<string | null>(null);

  const activePortfolio = portfolios.find((p) => p.id === selectedStrategy) || portfolios[0];
  const weeklySnapshots: WeeklyPortfolioSnapshot[] = activePortfolio.weeklySnapshots || [];
  const activeSnapshot = weeklySnapshots.find((w) => w.weekId === selectedWeekId) || weeklySnapshots[0];

  const displayHoldings = activeSnapshot?.holdings || activePortfolio.holdings;

  const toggleExpand = (symbol: string) => {
    setExpandedHolding((prev) => (prev === symbol ? null : symbol));
  };

  if (!activeSnapshot) return null;

  return (
    <div className="space-y-6">
      {/* 1. Strateji Seçici Sekmeleri */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-[24px] bg-[#0F1116] border border-white/5">
        {portfolios.map((portfolio) => {
          const isActive = portfolio.id === activePortfolio.id;
          return (
            <button
              key={portfolio.id}
              onClick={() => setSelectedStrategy(portfolio.id)}
              className={`flex-1 min-w-[220px] text-left px-4 py-3 rounded-[16px] transition-all ${
                isActive
                  ? 'bg-[#1E212B] text-white shadow-md border border-orange-500/50 ring-2 ring-orange-500/20'
                  : 'text-zinc-400 hover:text-white hover:bg-[#1E212B]/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <Compass className={`w-3.5 h-3.5 ${isActive ? 'text-orange-500' : 'text-zinc-400'}`} />
                  {portfolio.name}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                    isActive ? 'bg-orange-500/20 text-orange-400' : 'bg-[#1E212B] text-zinc-400'
                  }`}
                >
                  +{portfolio.portfolioReturnYTD.toFixed(1)}%
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 line-clamp-1">{portfolio.description}</p>
            </button>
          );
        })}
      </div>

      {/* 2. Seçili Strateji Üst Özet Kartı (Premium Midas Stili) */}
      <div className="rounded-[32px] bg-gradient-to-br from-[#15171E] to-[#1A1110] border border-orange-500/10 shadow-[0_8px_32px_rgba(249,115,22,0.05)] overflow-hidden relative">
        <div className="absolute -top-32 -right-32 p-8 opacity-20 blur-[100px] pointer-events-none">
          <div className="w-96 h-96 bg-orange-500 rounded-full"></div>
        </div>
        
        <div className="p-8 lg:p-10 relative z-10 flex flex-col lg:flex-row items-start justify-between gap-10">
          <div className="space-y-4 max-w-2xl">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-black text-xs font-bold shadow-sm">
                <Calendar className="w-3.5 h-3.5" />
                {activeSnapshot.weekLabel}
              </span>
              <span className="text-xs text-zinc-400 font-medium tracking-wide">Kaynak: {activeSnapshot.fridayLabel}</span>
              {activeSnapshot.isCurrentWeek && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A2E20] text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                  Aktif Takipte
                </span>
              )}
            </div>

            <div>
              <h2 className="text-4xl lg:text-5xl font-black text-white tracking-tighter leading-tight">
                {activePortfolio.name}
              </h2>
              <p className="text-zinc-400 text-sm mt-3 leading-relaxed font-medium">
                {activeSnapshot.summary}
              </p>
            </div>
          </div>

          {/* Sağ Taraftaki Metrikler */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 lg:gap-8 bg-[#0F1116]/80 backdrop-blur-xl p-6 rounded-[24px] border border-white/5 flex-shrink-0 w-full lg:w-auto shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Haftalık Getiri</div>
              <div className={`text-4xl font-black tracking-tighter ${activeSnapshot.weeklyReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {activeSnapshot.weeklyReturn >= 0 ? '+' : ''}%{activeSnapshot.weeklyReturn.toFixed(1)}
              </div>
            </div>
            
            <div className="w-px h-16 bg-white/10 hidden lg:block"></div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">BIST Alfa</div>
              <div className={`text-3xl font-extrabold tracking-tight ${activeSnapshot.weeklyAlpha >= 0 ? 'text-emerald-500' : 'text-zinc-500'}`}>
                {activeSnapshot.weeklyAlpha >= 0 ? '+' : ''}%{activeSnapshot.weeklyAlpha.toFixed(1)}
              </div>
            </div>

            <div className="w-px h-16 bg-white/10 hidden lg:block"></div>

            <div className="space-y-1">
              <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Kümülatif</div>
              <div className="text-3xl font-extrabold tracking-tight text-orange-500">
                +{activeSnapshot.cumulativeReturn.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Haftalık Seçici Bar */}
      <div className="bg-[#15171E]/80 backdrop-blur-xl border border-white/5 rounded-[24px] p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm sm:text-base font-extrabold text-white">Geçmiş Dönem Performansları</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {weeklySnapshots.map((snap) => {
            const isSnapActive = snap.weekId === activeSnapshot.weekId;
            return (
              <button
                key={snap.weekId}
                onClick={() => setSelectedWeekId(snap.weekId)}
                className={`p-4 rounded-[16px] text-left border transition-all ${
                  isSnapActive
                    ? 'bg-[#1E212B] text-white border-orange-500/50 ring-2 ring-orange-500/20 shadow-lg'
                    : 'bg-[#0F1116] text-zinc-400 border-white/5 hover:border-white/20 hover:bg-[#1E212B]'
                }`}
              >
                <div className="flex justify-between mb-2">
                  <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    snap.isCurrentWeek ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'
                  }`}>
                    {snap.isCurrentWeek ? 'CANLI' : 'KAPANDI'}
                  </span>
                  <span className={`text-xs font-black ${snap.weeklyReturn >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {snap.weeklyReturn >= 0 ? '+' : ''}%{snap.weeklyReturn.toFixed(1)}
                  </span>
                </div>
                <div className="font-bold text-xs text-white">{snap.weekLabel}</div>
                <div className="text-[10px] text-zinc-500 mt-1">{snap.fridayLabel}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Tablo Bölümü (Midas Compact Style) */}
      <div className="bg-[#15171E]/80 backdrop-blur-xl border border-white/5 rounded-[24px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-[#0A0B0E]/50">
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Hisse / Varlık</th>
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Skor</th>
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Cuma Giriş / Cari</th>
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Haftalık Getiri</th>
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Hedef / Stop</th>
                <th className="py-4 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">Aksiyon</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {displayHoldings.map((holding) => {
                const s = holding.stock;
                const isPositive = holding.returnPercent >= 0;
                const isExpanded = expandedHolding === s.symbol;

                return (
                  <React.Fragment key={s.symbol}>
                    <tr 
                      className="hover:bg-[#1E212B]/50 transition-colors cursor-pointer group"
                      onClick={() => toggleExpand(s.symbol)}
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <WatchlistToggle symbol={s.symbol} iconSize={16} className="shrink-0" />
                          <StockLogo symbol={s.symbol} name={s.name} size="sm" />
                          <div>
                            <div className="font-extrabold text-white text-sm group-hover:text-orange-400 transition-colors">
                              {s.symbol}
                            </div>
                            <div className="text-[10px] text-zinc-500 line-clamp-1">{s.name}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#1E212B] flex items-center justify-center font-bold text-orange-400 text-xs border border-white/5 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
                            {Math.round(holding.trendScore)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" /> %{holding.bullishPercent}
                            </span>
                            <span className="text-[9px] text-zinc-500 font-medium">Güç: {holding.trendStrength}/10</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-zinc-500 font-medium">Giriş: {holding.entryPrice.toFixed(2)} ₺</span>
                          <span className="text-sm font-bold text-white mt-0.5">{s.currentPrice.toFixed(2)} ₺</span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className={`inline-flex font-bold text-sm px-2.5 py-1 rounded-[8px] ${
                          isPositive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                        }`}>
                          {isPositive ? '+' : ''}%{holding.returnPercent.toFixed(2)}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <ArrowUpRight className="w-3 h-3" /> {holding.targetPrice.toFixed(2)} ₺
                          </span>
                          <span className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                            <ChevronDown className="w-3 h-3" /> {holding.stopLossPrice.toFixed(2)} ₺
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className={`text-[10px] font-bold px-3 py-1 rounded-full ${
                            holding.rebalanceAction === 'AĞIRLIK ARTIR' 
                              ? 'bg-orange-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.4)]'
                              : holding.rebalanceAction === 'YENİ GİRİŞ'
                              ? 'bg-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                              : 'bg-white/10 text-zinc-400'
                          }`}>
                            {holding.rebalanceAction}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expandable Detail */}
                    {isExpanded && (
                      <tr className="bg-[#0A0B0E]/80">
                        <td colSpan={6} className="py-4 px-6 border-l-2 border-orange-500">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                              <Info className="w-5 h-5 text-orange-500" />
                            </div>
                            <div>
                              <h4 className="text-white font-bold text-sm mb-1">Pozisyon Özeti</h4>
                              <p className="text-zinc-400 text-sm leading-relaxed">{holding.holdingRationale}</p>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onSelectStock(s);
                                }}
                                className="mt-4 flex items-center gap-2 text-xs font-bold text-orange-500 hover:text-orange-400 transition-colors"
                              >
                                Detaylı Hisse Analizine Git <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
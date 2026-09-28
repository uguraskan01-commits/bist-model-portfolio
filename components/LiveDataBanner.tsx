'use client';

import React from 'react';
import { RefreshCw, Wifi, WifiOff, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { MarketDataState } from '@/lib/useMarketData';

interface LiveDataBannerProps {
  marketData: MarketDataState;
  liveCount: number; // Kaç hisse canlı veriye sahip
  totalCount: number;
}

export function LiveDataBanner({ marketData, liveCount, totalCount }: LiveDataBannerProps) {
  const { isLoading, lastUpdated, refetch } = marketData;
  
  const isLive = liveCount > 0;
  const coveragePercent = totalCount > 0 ? Math.round((liveCount / totalCount) * 100) : 0;
  
  // Son güncelleme zamanını formatla
  const timeAgo = lastUpdated
    ? (() => {
        const diffMs = Date.now() - lastUpdated.getTime();
        const diffMin = Math.floor(diffMs / 60000);
        if (diffMin < 1) return 'Az önce';
        if (diffMin < 60) return `${diffMin} dakika önce`;
        const diffHr = Math.floor(diffMin / 60);
        return `${diffHr} saat önce`;
      })()
    : null;
  
  if (!isLive && !isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
        <WifiOff className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
        <span className="text-amber-400 font-medium">
          Yahoo Finance bağlantısı kurulamadı — Statik veriler gösteriliyor
        </span>
        <button
          onClick={refetch}
          className="ml-auto flex items-center gap-1 text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 font-semibold transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Tekrar Dene
        </button>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border text-xs transition-all ${
      isLoading
        ? 'bg-[#15171E]/60 border-white/5'
        : isLive
          ? 'bg-emerald-500/8 border-emerald-500/25 dark:bg-emerald-950/30 dark:border-emerald-500/20'
          : 'bg-[#15171E]/60 border-white/5'
    }`}>
      
      {isLoading ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 text-zinc-500 animate-spin flex-shrink-0" />
          <span className="text-zinc-400 font-medium">
            Yahoo Finance'dan canlı fiyatlar çekiliyor...
          </span>
        </>
      ) : isLive ? (
        <>
          {/* Yeşil canlı göstergesi */}
          <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          
          <span className="font-semibold text-emerald-400">
            Canlı Piyasa Verisi
          </span>
          
          <span className="text-zinc-400">
            {liveCount}/{totalCount} hisse
          </span>
          
          {/* Kapsama bar */}
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-[#1E212B] rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${coveragePercent}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">%{coveragePercent}</span>
          </div>
          
          {timeAgo && (
            <span className="flex items-center gap-1 text-zinc-400 dark:text-zinc-500 ml-1">
              <Clock className="w-3 h-3" />
              {timeAgo}
            </span>
          )}
          
          <button
            onClick={refetch}
            title="Yenile"
            className="ml-auto p-1 text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors rounded-lg hover:bg-emerald-500/10"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </>
      ) : null}
    </div>
  );
}

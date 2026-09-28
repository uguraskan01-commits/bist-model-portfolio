'use client';

import React, { useState, useMemo } from 'react';
import { getAllBISTStocks } from '@/lib/bist-data';
import { getAllModelPortfolios } from '@/lib/portfolio-engine';
import { BISTStock } from '@/types/stock';
import { useMarketData, applyLivePrice } from '@/lib/useMarketData';
import { Navbar, TabType } from '@/components/Navbar';
import { PortfolioView } from '@/components/PortfolioView';
import { MarketHighlightsView } from '@/components/MarketHighlightsView';
import { StockDeepDiveView } from '@/components/StockDeepDiveView';
import { TrendAnalysisView } from '@/components/TrendAnalysisView';
import { StockDetailModal } from '@/components/StockDetailModal';
import { LiveDataBanner } from '@/components/LiveDataBanner';
import { WatchlistView } from '@/components/WatchlistView';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('market');
  const [selectedSymbol, setSelectedSymbol] = useState<string>('THYAO');
  const [modalStock, setModalStock] = useState<BISTStock | null>(null);

  // Statik temel veri (fundamentals, scoring, KAP kategorileri)
  const staticStocks = useMemo(() => getAllBISTStocks(), []);

  // Canlı piyasa verisi (Yahoo Finance Spark API)
  const marketData = useMarketData();
  const { quotes } = marketData;

  // Statik + Canlı verileri birleştir
  const stocks = useMemo<BISTStock[]>(() => {
    if (Object.keys(quotes).length === 0) return staticStocks;
    return staticStocks.map(s => applyLivePrice(s, quotes));
  }, [staticStocks, quotes]);

  // Model portföyleri doğrudan canlı fiyatlı hisse havuzundan dinamik üret
  const portfolios = useMemo(() => {
    return getAllModelPortfolios(stocks);
  }, [stocks]);

  // Canlı fiyata sahip hisse sayısı
  const liveCount = useMemo(() => 
    stocks.filter(s => quotes[s.symbol]?.price != null).length,
    [stocks, quotes]
  );

  // Hisse seçim handler
  const handleSelectStock = (s: BISTStock) => {
    setSelectedSymbol(s.symbol);
    setActiveTab('trend');
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-zinc-100 flex flex-col font-sans selection:bg-orange-500/20 selection:text-orange-400">
      {/* 🧭 Üst Navigasyon */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 📊 Ana İçerik */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-4">
        
        {/* 🔴 Canlı Veri Durum Bandı */}
        <LiveDataBanner 
          marketData={marketData} 
          liveCount={liveCount} 
          totalCount={stocks.length} 
        />

        {/* 🔥 Önemli Gelişmeler */}
        {activeTab === 'market' && (
          <MarketHighlightsView stocks={stocks} onSelectStock={handleSelectStock} />
        )}

        {/* ⭐ Takip Listem */}
        {activeTab === 'watchlist' && (
          <WatchlistView stocks={stocks} onSelectStock={handleSelectStock} />
        )}

        {/* 📈 Trend Motoru */}
        {activeTab === 'trend' && (
          <TrendAnalysisView
            stocks={stocks}
            initialSymbol={selectedSymbol}
            onSelectStock={(s) => setSelectedSymbol(s.symbol)}
          />
        )}

        {/* 🔬 Derin Analiz */}
        {activeTab === 'analysis' && (
          <StockDeepDiveView
            stocks={stocks}
            initialSymbol={selectedSymbol}
            onSelectStock={(s) => setSelectedSymbol(s.symbol)}
          />
        )}

        {/* 💼 Model Portföy */}
        {activeTab === 'portfolios' && (
          <PortfolioView
            portfolios={portfolios}
            onSelectStock={handleSelectStock}
          />
        )}
      </main>

      {/* 🪟 Hisse Detay Modalı */}
      <StockDetailModal stock={modalStock} onClose={() => setModalStock(null)} />

      {/* 🏷️ Premium Alt Bilgi */}
      <footer className="border-t border-white/5 bg-[#0A0B0E] py-6 mt-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-white">xuProf Engine v3.0</span>
            <span className="text-zinc-700">•</span>
            <span className="font-medium text-zinc-400">BIST TÜM (XUTUM) Kapsamı</span>
            <span className="text-zinc-700">•</span>
            <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">🟢 Canlı Veri Ağı</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 text-[10px] md:text-[11px] font-bold text-zinc-500 uppercase tracking-widest">
            <span>📊 Çok Faktörlü Skorlama</span>
            <span>📉 Tarihsel Backtest</span>
            <span>📰 KAP Duyarlılık</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { BISTStock } from '@/types/stock';
import { Search, Plus, Trash2, TrendingUp, TrendingDown, Star } from 'lucide-react';
import { StockLogo } from './StockLogo';

import { useWatchlist } from '@/hooks/useWatchlist';

interface WatchlistViewProps {
  stocks: BISTStock[];
  onSelectStock: (stock: BISTStock) => void;
}

export function WatchlistView({ stocks, onSelectStock }: WatchlistViewProps) {
  const { watchlist, toggleWatchlist, isMounted } = useWatchlist();
  const [search, setSearch] = useState('');

  const addToWatchlist = (symbol: string) => {
    if (!watchlist.includes(symbol)) {
      toggleWatchlist(symbol);
    }
    setSearch('');
  };

  const removeFromWatchlist = (symbol: string) => {
    if (watchlist.includes(symbol)) {
      toggleWatchlist(symbol);
    }
  };

  const filteredSearch = search.trim() === '' ? [] : stocks
    .filter(s => s.symbol.toLowerCase().includes(search.toLowerCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const watchlistedStocks = watchlist
    .map(sym => stocks.find(s => s.symbol === sym))
    .filter((s): s is BISTStock => s !== undefined);

  if (!isMounted) return null;

  // Eşit ağırlıklı portföy getirilerini hesapla
  let avgDaily = 0;
  let avgWeekly = 0;
  let avgMonthly = 0;
  let avgYtd = 0;
  
  if (watchlistedStocks.length > 0) {
    avgDaily = watchlistedStocks.reduce((sum, s) => sum + (s.changePercent || 0), 0) / watchlistedStocks.length;
    avgWeekly = watchlistedStocks.reduce((sum, s) => sum + (s.technical?.momentum?.weeklyReturn || 0), 0) / watchlistedStocks.length;
    avgMonthly = watchlistedStocks.reduce((sum, s) => sum + (s.technical?.momentum?.monthlyReturn || 0), 0) / watchlistedStocks.length;
    avgYtd = watchlistedStocks.reduce((sum, s) => sum + (s.technical?.momentum?.ytdReturn || 0), 0) / watchlistedStocks.length;
  }

  const StatBadge = ({ label, value }: { label: string, value: number }) => (
    <div className="flex flex-col items-center p-2 rounded-xl bg-[#1E212B] border border-white/5 min-w-[80px]">
      <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">{label}</span>
      <span className={`text-sm font-black ${value >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
        {value >= 0 ? '+' : ''}{value.toFixed(2)}%
      </span>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header & Search */}
      <div className="bg-[#15171E]/90 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl font-black text-white flex items-center gap-2">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            Kişisel Takip Listem
          </h2>
          <p className="text-sm text-zinc-400 mt-1">Sık takip ettiğiniz hisseleri ekleyin ve canlı fiyatlarını izleyin.</p>
        </div>

        {watchlistedStocks.length > 0 && (
          <div className="flex gap-2 bg-[#0A0B0E] p-2 rounded-2xl border border-white/5">
            <div className="hidden sm:flex items-center px-2 mr-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest text-center">Eşit Ağırlıklı<br/>Ortalama</span>
            </div>
            <StatBadge label="Gün" value={avgDaily} />
            <StatBadge label="Hafta" value={avgWeekly} />
            <StatBadge label="Ay" value={avgMonthly} />
            <StatBadge label="YTD" value={avgYtd} />
          </div>
        )}
        
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-zinc-400" />
          </div>
          <input
            type="text"
            placeholder="Hisse Ekle (Örn: THYAO)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-xl leading-5 bg-[#1E212B] text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
          />
          {filteredSearch.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-[#1E212B] border border-white/10 rounded-xl shadow-xl overflow-hidden">
              {filteredSearch.map(s => (
                <div 
                  key={s.symbol}
                  onClick={() => addToWatchlist(s.symbol)}
                  className="px-4 py-3 hover:bg-orange-500/10 cursor-pointer flex items-center justify-between transition-colors border-b border-white/5 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <StockLogo symbol={s.symbol} size="sm" />
                    <div>
                      <div className="font-bold text-white text-sm">{s.symbol}</div>
                      <div className="text-[10px] text-zinc-500 truncate max-w-[150px]">{s.name}</div>
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-orange-500" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Grid */}
      <div className="bg-[#15171E]/90 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-lg min-h-[400px]">
        {watchlistedStocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center opacity-50">
            <Star className="w-16 h-16 text-zinc-500 mb-4" />
            <h3 className="text-lg font-bold text-white">Takip Listeniz Boş</h3>
            <p className="text-sm text-zinc-400 max-w-sm mt-2">Sağ üstteki arama kutusunu kullanarak hisse eklemeye başlayabilirsiniz.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {watchlistedStocks.map((stock) => {
              const chg = stock.changePercent || 0;
              const wReturn = stock.technical?.momentum?.weeklyReturn || 0;
              const mReturn = stock.technical?.momentum?.monthlyReturn || 0;
              const yReturn = stock.technical?.momentum?.ytdReturn || 0;

              return (
                <div 
                  key={stock.symbol}
                  className="bg-[#1E212B]/50 hover:bg-[#1E212B] border border-white/5 rounded-2xl p-4 transition-all duration-300 relative group cursor-pointer flex flex-col justify-between"
                  onClick={() => onSelectStock(stock)}
                >
                  <button 
                    onClick={(e) => { e.stopPropagation(); removeFromWatchlist(stock.symbol); }}
                    className="absolute top-3 right-3 p-1.5 bg-black/20 hover:bg-rose-500/20 text-zinc-500 hover:text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <StockLogo symbol={stock.symbol} size="md" />
                    <div>
                      <div className="font-black text-lg text-white">{stock.symbol}</div>
                      <div className="text-xs text-zinc-400 truncate max-w-[120px]">{stock.name}</div>
                    </div>
                  </div>

                  <div className="flex items-end justify-between mb-4">
                    <div>
                      <div className="text-xs text-zinc-500 mb-1">Son Fiyat</div>
                      <div className="text-2xl font-bold text-white">
                        {stock.currentPrice > 0 ? stock.currentPrice.toFixed(2) : '-'} <span className="text-sm font-medium text-zinc-500">₺</span>
                      </div>
                    </div>
                  </div>

                  {/* Return Badges */}
                  <div className="grid grid-cols-4 gap-1 pt-3 border-t border-white/5 mt-auto">
                    {[
                      { l: 'GÜN', v: chg },
                      { l: 'HFT', v: wReturn },
                      { l: 'AY', v: mReturn },
                      { l: 'YTD', v: yReturn }
                    ].map((ret, i) => (
                      <div key={i} className={`flex flex-col items-center justify-center py-1 rounded-md ${ret.v >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'}`}>
                        <span className={`text-[8px] font-bold ${ret.v >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{ret.l}</span>
                        <span className={`text-[10px] font-black ${ret.v >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {ret.v >= 0 ? '+' : ''}{ret.v.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useMemo } from 'react';
import { BISTStock } from '@/types/stock';
import { StockLogo } from './StockLogo';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Flame,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  Newspaper,
  Zap,
  BarChart3,
} from 'lucide-react';

interface MarketHighlightsViewProps {
  stocks: BISTStock[];
  onSelectStock: (stock: BISTStock) => void;
}

export function MarketHighlightsView({ stocks, onSelectStock }: MarketHighlightsViewProps) {
  const [news, setNews] = React.useState<any[]>([]);
  const [isLoadingNews, setIsLoadingNews] = React.useState(true);

  React.useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setNews(data.data);
        }
      })
      .catch(console.error)
      .finally(() => setIsLoadingNews(false));
  }, []);

  // Canlı verisi olan ve null olmayan hisseleri filtrele
  const validStocks = useMemo(() => stocks.filter(s => s.currentPrice > 0 && typeof s.changePercent === 'number'), [stocks]);

  const memoizedData = useMemo(() => {
    // Haftalık bazda sırala (Önemli Gelişmeler sayfası)
    const sortedByChange = [...validStocks].sort((a, b) => {
      const aVal = a.technical?.momentum?.weeklyReturn ?? a.changePercent ?? 0;
      const bVal = b.technical?.momentum?.weeklyReturn ?? b.changePercent ?? 0;
      return bVal - aVal;
    });
    
    // Hacim verisi yoksa veya sıfırsa mock bir hacim puanı üret (sadece görsel hareketlilik için)
    const sortedByActivity = [...validStocks].sort((a, b) => {
      const volA = a.volume || ((a.symbol.charCodeAt(0) * a.currentPrice) % 1000000);
      const volB = b.volume || ((b.symbol.charCodeAt(0) * b.currentPrice) % 1000000);
      return volB - volA;
    });

    // Sektörel performans (Ortalama getiri)
    const sectors: Record<string, { totalChange: number; count: number; inflowScore: number }> = {};
    validStocks.forEach(s => {
      if (!s.sector || s.sector === 'Diğer') return;
      if (!sectors[s.sector]) {
        sectors[s.sector] = { totalChange: 0, count: 0, inflowScore: 0 };
      }
      sectors[s.sector].totalChange += (s.changePercent || 0);
      sectors[s.sector].count += 1;
      
      // Para girişi/çıkışı simülasyonu (Fiyat değişimi * Hacim ağırlığı)
      const mockVol = s.volume || ((s.symbol.charCodeAt(0) * s.currentPrice) % 1000);
      sectors[s.sector].inflowScore += (s.changePercent || 0) * mockVol;
    });

    const sectorList = Object.entries(sectors).map(([name, data]) => ({
      name,
      avgChange: data.totalChange / data.count,
      inflowScore: data.inflowScore,
    })).sort((a, b) => b.avgChange - a.avgChange);

    const nearAth = [...validStocks]
      .filter(s => s.high52w && s.currentPrice > 0 && s.currentPrice <= s.high52w)
      .sort((a, b) => {
        const aDist = (a.high52w! - a.currentPrice) / a.currentPrice;
        const bDist = (b.high52w! - b.currentPrice) / b.currentPrice;
        return aDist - bDist;
      })
      .slice(0, 10);

    const oversold = [...validStocks]
      .filter(s => s.technical?.rsi && s.technical.rsi < 35 && (s.changePercent || 0) > 0)
      .sort((a, b) => (a.technical?.rsi || 100) - (b.technical?.rsi || 100))
      .slice(0, 10);

    const goldenCross = [...validStocks]
      .filter(s => {
        const ma = s.technical?.movingAverages;
        return ma && ma.sma50 && ma.sma200 && ma.sma50 > ma.sma200 && s.currentPrice > ma.sma50;
      })
      .sort((a, b) => {
        const distA = a.technical!.movingAverages.sma50 - a.technical!.movingAverages.sma200;
        const distB = b.technical!.movingAverages.sma50 - b.technical!.movingAverages.sma200;
        return distB - distA; // Kesişimi en güçlü olanlar
      })
      .slice(0, 10);

    return {
      topGainers: sortedByChange.slice(0, 10),
      topLosers: sortedByChange.reverse().slice(0, 10),
      sectorPerformances: sectorList,
      activeStocks: sortedByActivity.slice(0, 4),
      nearAth,
      oversold,
      goldenCross,
    };
  }, [validStocks]);

  const { topGainers, topLosers, sectorPerformances, activeStocks, nearAth, oversold, goldenCross } = memoizedData;

  const topSectors = sectorPerformances.slice(0, 3);
  const bottomSectors = [...sectorPerformances].sort((a, b) => a.avgChange - b.avgChange).slice(0, 2);
  const moneyInflowSectors = [...sectorPerformances].sort((a, b) => b.inflowScore - a.inflowScore).slice(0, 3);
  const moneyOutflowSectors = [...sectorPerformances].sort((a, b) => a.inflowScore - b.inflowScore).slice(0, 2);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Üst Başlık & Hero */}
      <div className="flex flex-col md:flex-row gap-6 items-center justify-between bg-gradient-to-br from-[#15171E] to-[#0A0B0E] p-8 rounded-[32px] border border-white/5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 blur-[80px] pointer-events-none">
          <div className="w-64 h-64 bg-orange-500 rounded-full"></div>
        </div>
        
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tighter flex items-center gap-3">
            <Flame className="w-8 h-8 text-orange-500" />
            Piyasa Özeti & Gelişmeler
          </h2>
          <p className="text-zinc-400 mt-2 font-medium max-w-xl">
            Borsa İstanbul'da günün öne çıkan hareketleri, sektörel para giriş-çıkışları ve sıcak haber akışı.
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-[#1E212B]/80 backdrop-blur-xl p-4 rounded-[20px] border border-white/5 shadow-xl w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Piyasa Yönü</span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-400 flex items-center">
                <TrendingUp className="w-5 h-5 mr-1" /> Pozitif
              </span>
            </div>
          </div>
          <div className="w-px h-10 bg-white/10 mx-2"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">İşlem Hacmi</span>
            <span className="text-xl font-black text-white mt-1">Yoğun</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sol Kolon: Kazandıranlar / Kaybettirenler */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Haftanın Yükselenleri */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-emerald-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-emerald-500" />
                En Çok Yükselenler
              </h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {topGainers.map((s) => (
                  <div 
                    key={s.symbol} 
                    onClick={() => onSelectStock(s)}
                    className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-zinc-500">{s.sector || 'BIST'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        +%{(s.technical?.momentum?.weeklyReturn ?? s.changePercent ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Haftanın Düşenleri */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-rose-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rose-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingDown className="w-5 h-5 text-rose-500" />
                En Çok Düşenler
              </h3>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {topLosers.map((s) => (
                  <div 
                    key={s.symbol} 
                    onClick={() => onSelectStock(s)}
                    className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-zinc-500">{s.sector || 'BIST'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                      <span className="text-xs font-bold text-rose-500 bg-rose-500/10 px-1.5 py-0.5 rounded-md">
                        %{(s.technical?.momentum?.weeklyReturn ?? s.changePercent ?? 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Sektörel Analiz & Para Girişi */}
          <div className="bg-[#15171E]/90 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-6">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Sektörel Para Akışı & Getiri Analizi
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Para Girişi Olanlar */}
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <ArrowUpRight className="w-4 h-4 text-emerald-500" /> Net Para Girişi (Tahmini)
                </h4>
                <div className="space-y-4">
                  {moneyInflowSectors.map((sec, i) => (
                    <div key={sec.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-300">{sec.name}</span>
                        <span className="font-bold text-emerald-400">+%{sec.avgChange.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-[#1E212B] rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-2 rounded-full" 
                          style={{ width: `${Math.max(10, 100 - i * 25)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Para Çıkışı Olanlar */}
              <div>
                <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-1.5">
                  <ArrowDownRight className="w-4 h-4 text-rose-500" /> Net Para Çıkışı (Tahmini)
                </h4>
                <div className="space-y-4">
                  {moneyOutflowSectors.map((sec, i) => (
                    <div key={sec.name} className="flex flex-col gap-1.5">
                      <div className="flex justify-between items-center text-sm">
                        <span className="font-bold text-zinc-300">{sec.name}</span>
                        <span className="font-bold text-rose-400">%{sec.avgChange.toFixed(1)}</span>
                      </div>
                      <div className="w-full bg-[#1E212B] rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-rose-600 to-rose-400 h-2 rounded-full" 
                          style={{ width: `${Math.max(20, 80 - i * 30)}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Yeni Modüller: Teknik Fırsatlar */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Zirveye Yakınlar (ATH Breakout) */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-orange-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-orange-500" />
                Tarihi Zirvesine Yakın Olanlar
              </h3>
              <p className="text-xs text-zinc-400 mb-4">52 haftalık zirvesini kırmaya en yakın adaylar</p>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {nearAth.map((s) => {
                  const dist = ((s.high52w! - s.currentPrice) / s.currentPrice) * 100;
                  return (
                    <div 
                      key={s.symbol} 
                      onClick={() => onSelectStock(s)}
                      className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <StockLogo symbol={s.symbol} size="sm" />
                        <div>
                          <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                          <div className="text-[10px] text-zinc-500">{s.sector || 'BIST'}</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                        <span className="text-xs font-bold text-orange-500 bg-orange-500/10 px-1.5 py-0.5 rounded-md">
                          Zirveye %{dist.toFixed(1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Aşırı Satımdaki Fırsatlar */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-sky-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-sky-500" />
                Aşırı Satım Bölgesindekiler
              </h3>
              <p className="text-xs text-zinc-400 mb-4">RSI &lt; 35 olup, dipten dönüş (tepki) verenler</p>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {oversold.map((s) => (
                  <div 
                    key={s.symbol} 
                    onClick={() => onSelectStock(s)}
                    className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-zinc-500">RSI: <span className="text-sky-400 font-bold">{s.technical?.rsi?.toFixed(1)}</span></div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        Tepki: +%{s.changePercent?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Altın Kesişim Yakalayanlar (Golden Cross) */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-amber-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                Altın Kesişim (Golden Cross)
              </h3>
              <p className="text-xs text-zinc-400 mb-4">50 günlük HO, 200 günlüğü yukarı kesen trend adayları</p>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {goldenCross.length > 0 ? goldenCross.map((s) => (
                  <div 
                    key={s.symbol} 
                    onClick={() => onSelectStock(s)}
                    className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-amber-400/80">Kesişim Yakalandı</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                      <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-md">
                        +%{s.changePercent?.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-xs text-zinc-500 text-center py-4">Şu an aktif kesişim sinyali yok.</div>
                )}
              </div>
            </div>

            {/* Yüksek Momentum (Haftalık) */}
            <div className="bg-[#15171E]/90 backdrop-blur-xl border border-purple-500/10 rounded-[24px] p-6 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-transparent"></div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-purple-500" />
                Haftalık Trend Liderleri
              </h3>
              <p className="text-xs text-zinc-400 mb-4">Bu hafta en güçlü getiriye sahip olanlar</p>
              <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 custom-scrollbar">
                {[...validStocks]
                  .sort((a, b) => (b.technical?.momentum?.weeklyReturn ?? -100) - (a.technical?.momentum?.weeklyReturn ?? -100))
                  .slice(0, 10)
                  .map((s) => (
                  <div 
                    key={s.symbol} 
                    onClick={() => onSelectStock(s)}
                    className="flex items-center justify-between p-3 rounded-[16px] bg-[#1E212B]/50 hover:bg-[#1E212B] transition-colors cursor-pointer border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <StockLogo symbol={s.symbol} size="sm" />
                      <div>
                        <div className="font-extrabold text-white text-sm">{s.symbol}</div>
                        <div className="text-[10px] text-zinc-500">{s.sector || 'BIST'}</div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-sm font-bold text-white">{s.currentPrice.toFixed(2)} ₺</span>
                      <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded-md">
                        Hafta: +%{s.technical?.momentum?.weeklyReturn?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Sağ Kolon: Haberler & Hareketli Hisseler */}
        <div className="space-y-6">
          
          {/* Hareketli Hisseler (Hacim/Volatilite) */}
          <div className="bg-[#15171E]/90 backdrop-blur-xl border border-orange-500/10 rounded-[24px] p-6 shadow-lg">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-orange-500" />
              Günün Hareketlileri
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {activeStocks.map((s) => (
                <div 
                  key={s.symbol} 
                  onClick={() => onSelectStock(s)}
                  className="bg-[#1E212B] border border-white/5 rounded-[16px] p-3 text-center hover:border-orange-500/30 hover:bg-[#1E212B]/80 transition-colors cursor-pointer group"
                >
                  <div className="flex justify-center mb-2">
                    <StockLogo symbol={s.symbol} size="sm" />
                  </div>
                  <div className="font-black text-white text-sm group-hover:text-orange-400 transition-colors">{s.symbol}</div>
                  <div className={`text-xs font-bold mt-1 ${s.changePercent && s.changePercent >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {s.changePercent && s.changePercent >= 0 ? '+' : ''}{s.changePercent?.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Önemli Haberler (KAP & Bülten) */}
          <div className="bg-[#15171E]/90 backdrop-blur-xl border border-white/5 rounded-[24px] p-6 shadow-lg flex-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
              <Newspaper className="w-5 h-5 text-cyan-500" />
              Önemli Gelişmeler & KAP
            </h3>
            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {isLoadingNews ? (
                <div className="text-zinc-500 text-sm py-4 animate-pulse">Haberler yükleniyor...</div>
              ) : news.length === 0 ? (
                <div className="text-zinc-500 text-sm py-4">Haber bulunamadı.</div>
              ) : news.map((item, idx) => {
                const dateObj = new Date(item.date);
                const timeStr = dateObj.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
                return (
                  <a href={item.link} target="_blank" rel="noopener noreferrer" key={idx} className="block relative pl-4 border-l-2 border-zinc-800 hover:border-cyan-500 transition-colors group">
                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-zinc-800 group-hover:bg-cyan-500 transition-colors"></div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{item.source}</span>
                      <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                      <span className="text-[10px] font-mono text-zinc-400">{timeStr}</span>
                      {item.impact === 'POZİTİF' && (
                        <span className="text-[9px] text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded ml-2">ÖNEMLİ</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-zinc-300 leading-snug group-hover:text-white transition-colors mt-1">
                      {item.title}
                    </p>
                  </a>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

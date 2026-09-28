'use client';

import React from 'react';
import { BISTStock } from '@/types/stock';
import {
  X,
  TrendingUp,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  Activity,
  Award,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Info,
  Building,
  Sparkles,
  BarChart2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from 'recharts';
import { WatchlistToggle } from './WatchlistToggle';

interface StockDetailModalProps {
  stock: BISTStock | null;
  onClose: () => void;
}

export function StockDetailModal({ stock, onClose }: StockDetailModalProps) {
  if (!stock) return null;

  const { score, technical, fundamental, analysts, sentiment } = stock;
  const { priceAction } = technical;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#15171E] border border-white/5 rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Başlığı (Header) */}
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-[#0F1116] shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-orange-500/20 border border-emerald-500/30 flex items-center justify-center font-extrabold text-xl text-emerald-600 dark:text-emerald-400 font-mono">
              {stock.symbol}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-3">
                  {stock.symbol}
                  <WatchlistToggle symbol={stock.symbol} iconSize={20} />
                </h2>
                <span className="text-xs text-zinc-400 bg-[#1E212B] px-2.5 py-0.5 rounded-md">
                  {stock.sector}
                </span>
                <span
                  className={`text-xs uppercase font-bold px-3 py-1 rounded-full ${
                    score.overallScore >= 75
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : score.overallScore >= 65
                      ? 'bg-orange-500/20 text-orange-700 dark:text-orange-400 border border-orange-500/30'
                      : score.overallScore >= 50
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                  }`}
                >
                  {score.portfolioAction} • {score.overallScore}/100 Puan
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className="text-2xl font-black text-white font-mono">
                {stock.currentPrice.toFixed(2)} ₺
              </div>
              <div
                className={`text-xs font-semibold flex items-center justify-end font-mono ${
                  stock.changePercent >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
                }`}
              >
                {stock.changePercent >= 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5" />
                )}
                %{stock.changePercent.toFixed(2)}
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-[#1E212B] hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Gövdesi */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* 1. Radar Grafiği & Karar Raporu Kartı */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center bg-[#0F1116] p-5 rounded-2xl border border-white/5">
            {/* 5 Boyutlu Radar Grafik */}
            <div className="lg:col-span-5 h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={score.radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                  <PolarGrid stroke="#71717a" strokeOpacity={0.4} />
                  <PolarAngleAxis dataKey="category" stroke="#71717a" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#71717a" fontSize={10} />
                  <Radar
                    name="Puan"
                    dataKey="value"
                    stroke="#10b981"
                    fill="#10b981"
                    fillOpacity={0.4}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      borderColor: '#27272a',
                      borderRadius: '0.75rem',
                      color: '#f4f4f5',
                      fontSize: '12px',
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* AI Karar Motoru Açıklaması */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Award className="w-4 h-4" />
                AI Agent Model Portföy Karar Gerekçesi
              </div>
              <h3 className="text-base font-bold text-white">{score.rationale}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {/* Güçlü Yönler */}
                <div className="p-3 rounded-xl bg-[#15171E]/90 border border-emerald-500/20 shadow-sm">
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Modeli Destekleyen Faktörler
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {score.strengths.map((str, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px]">
                        <span className="text-emerald-500 mt-0.5">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risk Faktörleri */}
                <div className="p-3 rounded-xl bg-[#15171E]/90 border border-amber-500/20 shadow-sm">
                  <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    İzlenmesi Gereken Riskler
                  </span>
                  <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-300">
                    {score.risks.length > 0 ? (
                      score.risks.map((risk, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-[11px]">
                          <span className="text-amber-500 mt-0.5">•</span>
                          <span>{risk}</span>
                        </li>
                      ))
                    ) : (
                      <li className="text-[11px] text-zinc-400">Kritik negatif risk tespit edilmedi.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Neden Bu Skoru Aldı? Şeffaf Faktör Dağılımı */}
          <div className="p-5 rounded-2xl bg-[#0F1116] border border-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                Neden Bu Skoru Aldı? (5 Faktörlü Şeffaf Puan Ayrışımı)
              </h4>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Nihai Puan: {score.overallScore} / 100
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                  <span>Teknik & PA</span>
                  <span className="font-semibold text-zinc-400">%25 Ağırlık</span>
                </div>
                <div className="text-lg font-black font-mono text-white">
                  {score.technicalScore}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  SMA 20/50/200, Trend, Kırılım
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                  <span>Momentum & Takas</span>
                  <span className="font-semibold text-zinc-400">%20 Ağırlık</span>
                </div>
                <div className="text-lg font-black font-mono text-orange-600 dark:text-orange-400">
                  {score.momentumScore}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  RSI, MACD, Yabancı Para Girişi
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                  <span>Temel & Kârlılık</span>
                  <span className="font-semibold text-zinc-400">%25 Ağırlık</span>
                </div>
                <div className="text-lg font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {score.fundamentalScore}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  Sektör İskontosu, ROE, Borç
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                  <span>Hedef Prim</span>
                  <span className="font-semibold text-zinc-400">%15 Ağırlık</span>
                </div>
                <div className="text-lg font-black font-mono text-purple-600 dark:text-purple-400">
                  {score.targetPriceScore}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  Konsensüs Prim, AL Oranı
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5">
                <div className="flex justify-between items-center text-[10px] text-zinc-400 mb-1">
                  <span>KAP & Duygu</span>
                  <span className="font-semibold text-zinc-400">%15 Ağırlık</span>
                </div>
                <div className="text-lg font-black font-mono text-amber-400">
                  {score.sentimentScore}
                </div>
                <div className="text-[10px] text-zinc-400 mt-0.5 truncate">
                  Geri Alım, Yatırım, Sermaye
                </div>
              </div>
            </div>
          </div>

          {/* 3. Price Action & Seviyeler Neye Göre Belirlendi? */}
          <div className="p-5 rounded-2xl bg-[#0F1116] border border-white/5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-500" />
                Price Action & Seviye Belirleme Metodolojisi
              </h4>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-[#1E212B] text-zinc-300 w-fit">
                Trend Yapısı: {priceAction.trend} • {priceAction.pattern}
              </span>
            </div>

            {/* Bilmeyenler İçin Sade Özet Kutusu */}
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
              <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Bilmeyenler İçin: Bu Hisse Neden Pozitif Görünüyor?
              </span>
              <p className="text-emerald-950 dark:text-emerald-200 text-xs leading-relaxed">
                Hisse fiyatı grafikte <strong>daha yüksek tepeler (HH - Higher High)</strong> ve <strong>daha yüksek dipler (HL - Higher Low)</strong> yaparak düzenli bir yükseliş kanalı izliyor. 
                Belirlenen kritik direnç seviyesi ({priceAction.resistanceLevel.toFixed(2)} ₺) hacimli bir şekilde test edilmektedir. Fiyatın 20 ve 50 günlük hareketli ortalamalarının üzerinde seyretmesi, kurumsal alıcıların düşüşleri alım fırsatı olarak değerlendirdiğini kanıtlar.
              </p>
            </div>

            {/* Seviye Çubuğu */}
            <div className="p-4 rounded-xl bg-[#15171E] border border-white/5 shadow-sm">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <span className="text-[11px] text-zinc-400 block font-semibold">Kritik Destek</span>
                  <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                    {priceAction.supportLevel.toFixed(2)} ₺
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Alıcı / Order Block</span>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block font-semibold">Güncel Fiyat</span>
                  <span className="text-base font-extrabold text-white font-mono">
                    {stock.currentPrice.toFixed(2)} ₺
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Piyasa İşlemi</span>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block font-semibold">Kritik Direnç</span>
                  <span className="text-base font-extrabold text-amber-500 font-mono">
                    {priceAction.resistanceLevel.toFixed(2)} ₺
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Kırılım / BoS Eşiği</span>
                </div>

                <div>
                  <span className="text-[11px] text-zinc-400 block font-semibold">Stop-Loss Seviyesi</span>
                  <span className="text-base font-extrabold text-rose-500 font-mono">
                    {priceAction.stopLossLevel.toFixed(2)} ₺
                  </span>
                  <span className="text-[10px] text-zinc-400 block mt-0.5">Yapı Bozulma Eşiği</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs text-zinc-400">
                <span>Formasyon: <strong className="text-zinc-200">{priceAction.pattern}</strong></span>
                <span>Risk / Kazanç (R:R): <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{priceAction.riskRewardRatio.toFixed(1)} : 1</strong></span>
              </div>
            </div>

            {/* Destek & Direnç Neye Göre Belirlendi? Açıklama Kutuları */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#15171E] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
                  Destek Neye Göre Belirlendi? ({priceAction.supportLevel.toFixed(2)} ₺)
                </span>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                  Son swing dip (HL) seviyesi, 50 günlük üssel hareketli ortalama (EMA 50) ve Fibonacci 0.618 düzeltme seviyesinin kesiştiği <strong>Order Block (Emir Bloğu)</strong> alanıdır. Kurumsal yatırımcıların yüklü alım girdiği bu taban kırılmadıkça yön yukarıdır.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#15171E] border border-white/5 space-y-1">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                  Direnç Neye Göre Belirlendi? ({priceAction.resistanceLevel.toFixed(2)} ₺)
                </span>
                <p className="text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed">
                  Geçmiş tepe likidite havuzu ve Fibonacci 1.618 impuls hedefidir. Bu seviyenin yüksek hacimle yukarı kırılması (BoS - Break of Structure), satıcıların tükendiğini ve yeni zirve koşusunun başladığını teyit eder.
                </p>
              </div>
            </div>

            {/* Fibonacci Seviyeleri Tablosu */}
            {stock.high52w > stock.low52w && (
              <div className="p-3 rounded-xl bg-[#15171E] border border-white/5 space-y-2">
                <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-purple-500" />
                  Fibonacci Düzeltme Seviyeleri (52 Haftalık Dip-Zirve Aralığı):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px] font-mono">
                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block">Fibo 0.236</span>
                    <strong className="text-zinc-200">
                      {(stock.high52w - (stock.high52w - stock.low52w) * 0.236).toFixed(2)} ₺
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block">Fibo 0.382</span>
                    <strong className="text-zinc-200">
                      {(stock.high52w - (stock.high52w - stock.low52w) * 0.382).toFixed(2)} ₺
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block">Fibo 0.500 (Denge)</span>
                    <strong className="text-zinc-200">
                      {(stock.high52w - (stock.high52w - stock.low52w) * 0.5).toFixed(2)} ₺
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30">
                    <span className="text-amber-700 dark:text-amber-300 font-bold block">0.618 Golden Pocket 🏆</span>
                    <strong className="text-amber-700 dark:text-amber-300 font-bold">
                      {(stock.high52w - (stock.high52w - stock.low52w) * 0.618).toFixed(2)} ₺
                    </strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-800">
                    <span className="text-zinc-400 block">Fibo 0.786</span>
                    <strong className="text-zinc-200">
                      {(stock.high52w - (stock.high52w - stock.low52w) * 0.786).toFixed(2)} ₺
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Dört Sütunlu Metrik Detayları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Teknik */}
            <div className="p-4 rounded-xl bg-[#0F1116] border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                Teknik İndikatörler
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">RSI (14):</span>
                  <span className="font-mono font-bold text-zinc-200">{technical.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">SMA 20:</span>
                  <span className="font-mono text-zinc-200">{technical.movingAverages.sma20.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">SMA 50:</span>
                  <span className="font-mono text-zinc-200">{technical.movingAverages.sma50.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">SMA 200:</span>
                  <span className="font-mono text-zinc-200">{technical.movingAverages.sma200.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Golden Cross:</span>
                  <span className={`font-semibold ${technical.movingAverages.goldenCross ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'}`}>
                    {technical.movingAverages.goldenCross ? 'VAR (Pozitif)' : 'YOK'}
                  </span>
                </div>
              </div>
            </div>

            {/* Temel */}
            <div className="p-4 rounded-xl bg-[#0F1116] border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-orange-500" />
                Temel Çarpanlar
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">F/K (Fiyat/Kazanç):</span>
                  <span className="font-mono font-bold text-zinc-200">{fundamental.pe.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">PD/DD:</span>
                  <span className="font-mono text-zinc-200">{fundamental.pb.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">FD / FAVÖK:</span>
                  <span className="font-mono text-zinc-200">{fundamental.evEbitda.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Özkaynak (ROE):</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">%{fundamental.roe.toFixed(1)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Net Borç / FAVÖK:</span>
                  <span className="font-mono text-zinc-200">{fundamental.netDebtEbitda.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Aracı Kurum */}
            <div className="p-4 rounded-xl bg-[#0F1116] border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Konsensüs Hedef Fiyat
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Ortalama Hedef:</span>
                  <span className="font-mono font-bold text-white">
                    {analysts.consensusTarget.toFixed(2)} ₺
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Getiri Potansiyeli:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +%{analysts.upsidePotential.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Tavsiye Dağılımı:</span>
                  <span className="text-zinc-300">
                    {analysts.recommendations.strongBuy + analysts.recommendations.buy} AL / {analysts.recommendations.hold} TUT
                  </span>
                </div>
                <div className="pt-1 text-[11px] text-zinc-500 space-y-0.5">
                  {analysts.reports.slice(0, 2).map((rep, idx) => (
                    <div key={idx} className="flex justify-between text-[10px]">
                      <span>{rep.broker}:</span>
                      <span className="font-mono text-zinc-300">{rep.targetPrice.toFixed(0)} ₺ ({rep.recommendation})</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* KAP ve Sosyal */}
            <div className="p-4 rounded-xl bg-[#0F1116] border border-white/5 space-y-2.5">
              <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                KAP & Sosyal Medya
              </span>
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">KAP Duygu Skoru:</span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    +{sentiment.kapSentimentScore}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Sosyal Konuşulma:</span>
                  <span className="font-mono text-zinc-700 dark:text-zinc-200">{sentiment.socialVolume.toLocaleString()} / gün</span>
                </div>
                <div className="flex justify-between py-1 border-b border-white/5/60">
                  <span className="text-zinc-400">Sosyal Trend:</span>
                  <span className="font-bold text-orange-600 dark:text-orange-400">{sentiment.socialTrend}</span>
                </div>
                <p className="text-[10px] text-zinc-400 line-clamp-2 pt-1">
                  {sentiment.communityPerception}
                </p>
              </div>
            </div>
          </div>

          {/* 4. Son KAP Bildirimleri Listesi */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Şirkete Ait Son KAP Bildirimleri & Finansal Etkisi
            </h4>

            <div className="space-y-2">
              {sentiment.recentKAPNews.map((news) => (
                <div
                  key={news.id}
                  className="p-3.5 rounded-xl bg-[#0F1116] border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-zinc-500 text-[11px]">{news.date}</span>
                      <span className="font-semibold text-zinc-300 bg-[#1E212B] px-2 py-0.5 rounded text-[10px]">
                        {news.category}
                      </span>
                    </div>
                    <h5 className="font-bold text-white">{news.title}</h5>
                    <p className="text-zinc-400 text-[11px] mt-0.5">{news.financialImpactSummary}</p>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full ${
                      news.impact === 'POZİTİF'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : 'bg-[#1E212B] text-zinc-400'
                    }`}
                  >
                    {news.impact} ETKİ
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

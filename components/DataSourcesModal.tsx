'use client';

import React from 'react';
import {
  X,
  Database,
  Globe,
  FileText,
  TrendingUp,
  MessageSquare,
  Building,
  CheckCircle2,
  ExternalLink,
  Cpu,
} from 'lucide-react';

interface DataSourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DataSourcesModal({ isOpen, onClose }: DataSourcesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50 dark:bg-zinc-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                BIST-Alpha Veri Kaynakları & Platform Entegrasyon Mimarisi
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Modelin teknik, temel, KAP, hedef fiyat ve momentum analizini besleyen platformlar.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-zinc-600 dark:text-zinc-300">
          <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
            <Cpu className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-0.5">
                Açık ve Modüler Entegrasyon Mimarisi
              </span>
              <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed text-[11px]">
                Sistem hibrit bir veri adaptör katmanına sahiptir. Şu anda entegre edilen platformların yanı sıra önereceğiniz herhangi bir yerel veri sağlayıcı (Matriks, Fintables, İdealData, Finnet veya özel scraper) sisteme doğrudan modül olarak eklenebilir.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. Fiyat ve Teknik Momentum */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                1. Fiyat, Hacim & Fiyat Momentumu
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Yahoo Finance API:</strong> BIST hisselerinin `.IS` uzantılı sembolleri (örn: `THYAO.IS`, `TRALT.IS`) üzerinden 1D, 1W OHLCV geçmişi.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>TradingView UDF API:</strong> Price Action destek/direnç, RSI, MACD ve volatilite hesaplamaları.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                  <span><strong>Matriks / IdealData API:</strong> Canlı derinlik ve anlık emir akışı (opsiyonel entegrasyon).</span>
                </li>
              </ul>
            </div>

            {/* 2. Temel Analiz & Bilanço */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Building className="w-4 h-4 text-cyan-500" />
                2. Temel Analiz & Mali Tablolar
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span><strong>İş Yatırım Mali Analiz:</strong> Tarihsel F/K, PD/DD, FD/FAVÖK ve sektör çarpan iskontoları.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span><strong>Fintables / Finnet:</strong> Çeyreklik ciro büyümesi, FAVÖK marjı, Net Borç / FAVÖK ve Özkaynak Kârlılığı (ROE).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-500 shrink-0 mt-0.5" />
                  <span><strong>BIST Endeks Veritabanı:</strong> Temettü verimleri ve sermaye artırımı verileri.</span>
                </li>
              </ul>
            </div>

            {/* 3. KAP Haber Akışı ve Duygu */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <FileText className="w-4 h-4 text-purple-500" />
                3. KAP Bildirimleri & Finansal Etki
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>kap.org.tr RSS / API:</strong> Şirketlerin yeni iş ilişkisi, pay geri alımı, kapasite artışı ve finansal rapor bildirimleri.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                  <span><strong>NLP Duyarlılık Motoru:</strong> Bildirimin şirket cirosuna oranını tespit edip olumlu (+), nötr veya olumsuz (-) olarak puanlayan yapay zeka sınıflandırıcısı.</span>
                </li>
              </ul>
            </div>

            {/* 4. Aracı Kurum ve Konsensüs */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <Globe className="w-4 h-4 text-amber-500" />
                4. Aracı Kurum Konsensüs Hedef Fiyatları
              </div>
              <ul className="space-y-1.5 text-[11px] text-zinc-600 dark:text-zinc-400">
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>Konsensüs Rapor Havuzu:</strong> İş Yatırım, Garanti BBVA, Ak Yatırım, Deniz Yatırım, Yapı Kredi, Gedik vb. kurumların yayımladığı 12 aylık hedef fiyatlar.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span><strong>ForInvest / Fintables Konsensüs:</strong> Kurum tavsiyelerinin AL / TUT / SAT oranları ve ortalama prim marjı.</span>
                </li>
              </ul>
            </div>

            {/* 5. Sosyal Medya ve Topluluk Algısı */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 space-y-2 md:col-span-2">
              <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-bold text-sm">
                <MessageSquare className="w-4 h-4 text-pink-500" />
                5. Sosyal Medya & Topluluk İlgisi
              </div>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                <strong>X (Twitter) Finans Akışları (`$THYAO`, `$TRALT`), Investing.com TR Forumları ve Finans Sözlükleri:</strong> Belirli bir hissenin anlık konuşulma hacminde olağan dışı artış (patlama) olup olmadığını ve yatırımcı algısının pozitif/negatif yönünü ölçer.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
            <span>Farklı bir veri kaynağı veya API öneriniz var mı? Sohbet üzerinden belirtebilirsiniz!</span>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-colors"
            >
              Tamam
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

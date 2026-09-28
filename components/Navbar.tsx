'use client';

import React from 'react';
import {
  Activity,
  BarChart2,
  TrendingUp,
  Layers,
  Flame,
  Star,
} from 'lucide-react';

export type TabType = 'trend' | 'analysis' | 'portfolios' | 'market' | 'watchlist';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="border-b border-white/5 bg-[#0A0B0E]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 md:h-20 gap-4 md:gap-0">
          
          {/* 🔥 Logo & Brand */}
          <div className="flex items-center gap-4 w-full md:w-auto justify-center md:justify-start">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] ring-1 ring-white/10 shrink-0">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tighter text-white">
                  xu<span className="text-orange-500">Prof</span>
                </span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest shrink-0">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-400 tracking-wide hidden sm:block">
                Premium Yatırım Terminali
              </span>
            </div>
          </div>

          {/* 🧭 Navigation Tabs */}
          <div className="w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            <nav className="flex items-center gap-1.5 p-1.5 bg-[#15171E] rounded-2xl border border-white/5 w-max mx-auto md:mx-0">
              {[
                { id: 'market', label: '🔥 Önemli Gelişmeler', icon: Flame },
                { id: 'watchlist', label: '⭐ Takip Listem', icon: Star },
                { id: 'trend', label: '📈 Trend Motoru', icon: TrendingUp },
                { id: 'analysis', label: '🔬 Derin Analiz', icon: BarChart2 },
                { id: 'portfolios', label: '💼 Model Portföy', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 whitespace-nowrap ${
                      isActive
                        ? 'bg-[#232736] text-white shadow-lg shadow-black/20'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-orange-500' : 'text-zinc-500'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

        </div>
      </div>
    </header>
  );
}

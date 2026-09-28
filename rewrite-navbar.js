const fs = require('fs');
const navbarPath = 'C:\\Users\\HERO\\.gemini\\antigravity\\scratch\\bist-model-portfolio\\components\\Navbar.tsx';
const navbarCode = 
'use client';

import React from 'react';
import {
  Activity,
  Compass,
  BarChart2,
  TrendingUp,
  Layers,
  Search,
} from 'lucide-react';

export type TabType = 'trend' | 'analysis' | 'screener' | 'portfolios';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  return (
    <header className="border-b border-white/5 bg-[#0A0B0E]/90 backdrop-blur-xl sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-orange-400 to-rose-600 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.3)] ring-1 ring-white/10">
              <Activity className="w-6 h-6 text-white stroke-[2.5]" />
            </div>
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tighter text-white">
                  BIST<span className="text-orange-500">Alpha</span>
                </span>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 tracking-widest">
                  PRO
                </span>
              </div>
              <span className="text-[11px] font-medium text-zinc-400 tracking-wide hidden sm:block">
                Premium Yatýrým Terminali
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 p-1.5 bg-[#15171E] rounded-2xl border border-white/5">
            {[
              { id: 'trend', label: 'Trend Motoru', icon: TrendingUp },
              { id: 'analysis', label: 'Derin Analiz', icon: BarChart2 },
              { id: 'screener', label: 'Hisse Tarayýcý', icon: Search },
              { id: 'portfolios', label: 'Model Portföy', icon: Layers },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={\lex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 \\}
                >
                  <Icon className={\w-4 h-4 \\} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
;
fs.writeFileSync(navbarPath, navbarCode, 'utf8');

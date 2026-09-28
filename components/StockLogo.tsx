'use client';

import React, { useState, useEffect } from 'react';
import { SectorType } from '@/types/stock';

interface StockLogoProps {
  symbol: string;
  name?: string;
  sector?: SectorType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SVG_LOGOS = new Set(['LILAK', 'MEGMT', 'TABGD', 'TRALT', 'LMKDC']);

// Boyut haritası (Premium Midas Squircle / Rounded-Full Stili)
const SIZE_CONFIGS = {
  sm: {
    container: 'w-8 h-8 min-w-[32px] rounded-full p-1.5',
    textSize: 'text-[10px]',
  },
  md: {
    container: 'w-12 h-12 min-w-[48px] rounded-full p-2',
    textSize: 'text-xs',
  },
  lg: {
    container: 'w-16 h-16 min-w-[64px] rounded-full p-2.5',
    textSize: 'text-sm',
  },
  xl: {
    container: 'w-24 h-24 min-w-[96px] rounded-full p-4 shadow-2xl',
    textSize: 'text-xl',
  },
};

export function StockLogo({ symbol, name, sector, size = 'md', className = '' }: StockLogoProps) {
  const sym = (symbol || '').toUpperCase().trim();
  const isSvg = SVG_LOGOS.has(sym);
  
  const primarySrc = `/logos/${sym}.${isSvg ? 'svg' : 'png'}`;
  const cdnFallbackSrc = `https://cdn.jsdelivr.net/gh/ahmeterenodaci/Istanbul-Stock-Exchange--BIST--including-symbols-and-logos/logos/${sym}.png`;

  const [currentSrc, setCurrentSrc] = useState<string>(primarySrc);
  const [hasError, setHasError] = useState(false);
  const [triedCdn, setTriedCdn] = useState(false);

  useEffect(() => {
    setCurrentSrc(`/logos/${sym}.${isSvg ? 'svg' : 'png'}`);
    setHasError(false);
    setTriedCdn(false);
  }, [sym, isSvg]);

  const sizeConf = SIZE_CONFIGS[size];

  const handleError = () => {
    if (!triedCdn) {
      setTriedCdn(true);
      setCurrentSrc(cdnFallbackSrc);
    } else {
      setHasError(true);
    }
  };

  // Sembole göre sabit bir renk gradyanı üret (Böylece aynı hisse hep aynı renk kalır)
  const getGradient = (s: string) => {
    const hash = s.charCodeAt(0) + (s.charCodeAt(1) || 0) + (s.charCodeAt(2) || 0);
    const gradients = [
      'from-blue-500 to-indigo-600',
      'from-emerald-500 to-teal-600',
      'from-orange-500 to-red-600',
      'from-purple-500 to-fuchsia-600',
      'from-rose-500 to-pink-600',
      'from-cyan-500 to-blue-600',
      'from-amber-500 to-orange-600',
      'from-lime-500 to-emerald-600'
    ];
    return gradients[hash % gradients.length];
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none overflow-hidden ${
        hasError ? 'bg-transparent border-none' : 'bg-white dark:bg-white border-2 border-zinc-100 dark:border-zinc-800'
      } shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-transform hover:scale-105 duration-300 ${sizeConf.container} ${className}`}
      title={`${sym}${name ? ` - ${name}` : ''}${sector ? ` (${sector})` : ''}`}
    >
      {!hasError ? (
        <img
          key={`${sym}-${currentSrc}`}
          src={currentSrc}
          alt={`${sym} logo`}
          className="w-full h-full object-contain drop-shadow-sm transition-opacity duration-200"
          onError={handleError}
          loading="eager"
        />
      ) : (
        <div className={`absolute inset-0 w-full h-full rounded-full flex flex-col items-center justify-center bg-gradient-to-br ${getGradient(sym)} text-white font-black shadow-inner`}>
          <span className={`${sizeConf.textSize} tracking-tighter leading-none opacity-90`}>
            {sym.slice(0, 2)}
          </span>
        </div>
      )}
    </div>
  );
}

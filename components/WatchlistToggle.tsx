'use client';

import React from 'react';
import { Star } from 'lucide-react';
import { useWatchlist } from '@/hooks/useWatchlist';

interface WatchlistToggleProps {
  symbol: string;
  className?: string;
  iconSize?: number;
}

export function WatchlistToggle({ symbol, className = '', iconSize = 20 }: WatchlistToggleProps) {
  const { isInWatchlist, toggleWatchlist, isMounted } = useWatchlist();

  if (!isMounted) return <div style={{ width: iconSize, height: iconSize }} className={className} />;

  const isSaved = isInWatchlist(symbol);

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        toggleWatchlist(symbol);
      }}
      className={`transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center rounded-full p-1.5 ${
        isSaved 
          ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20' 
          : 'bg-zinc-800/50 text-zinc-500 hover:bg-zinc-700/50 hover:text-zinc-300'
      } ${className}`}
      title={isSaved ? "Takip Listesinden Çıkar" : "Takip Listesine Ekle"}
    >
      <Star 
        size={iconSize} 
        className={isSaved ? 'fill-yellow-500 text-yellow-500' : ''} 
      />
    </button>
  );
}

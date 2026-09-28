'use client';

import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'xuProf_watchlist';

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  // Sync from local storage
  const syncWatchlist = useCallback(() => {
    try {
      const saved = localStorage.getItem(WATCHLIST_KEY);
      if (saved) {
        setWatchlist(JSON.parse(saved));
      } else {
        setWatchlist([]);
      }
    } catch (e) {
      setWatchlist([]);
    }
  }, []);

  useEffect(() => {
    setIsMounted(true);
    syncWatchlist();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === WATCHLIST_KEY) {
        syncWatchlist();
      }
    };
    
    // Custom event for same-window syncing
    const handleCustomEvent = () => {
      syncWatchlist();
    };

    window.addEventListener('storage', handleStorage);
    window.addEventListener('watchlist-updated', handleCustomEvent);
    
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('watchlist-updated', handleCustomEvent);
    };
  }, [syncWatchlist]);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => {
      let newList;
      if (prev.includes(symbol)) {
        newList = prev.filter(s => s !== symbol);
      } else {
        newList = [...prev, symbol];
      }
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(newList));
      window.dispatchEvent(new Event('watchlist-updated'));
      return newList;
    });
  };

  const isInWatchlist = (symbol: string) => {
    return watchlist.includes(symbol);
  };

  return {
    watchlist,
    toggleWatchlist,
    isInWatchlist,
    isMounted
  };
}

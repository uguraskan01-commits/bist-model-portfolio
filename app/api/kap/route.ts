import { NextResponse } from 'next/server';

// KAP (Kamuyu Aydınlatma Platformu) RSS Feed'den güncel haberler
// KAP'ın public RSS endpoint'i
const KAP_RSS_URL = 'https://www.kap.org.tr/tr/rss/duyuru';

// 5 dakika cache
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

interface KAPNews {
  id: string;
  symbol: string;
  companyName: string;
  title: string;
  date: string;
  url: string;
  category: string;
  impact: 'POZİTİF' | 'NÖTR' | 'NEGATİF';
}

// Haber başlığına göre KAP kategorisi ve etkisi tespiti
function classifyKAPNews(title: string): { category: string; impact: 'POZİTİF' | 'NÖTR' | 'NEGATİF' } {
  const t = title.toUpperCase();
  
  if (t.includes('GERİ ALIM') || t.includes('GERİ ALIMI') || t.includes('PAY ALIM')) {
    return { category: 'PAY GERİ ALIMI', impact: 'POZİTİF' };
  }
  if (t.includes('SERMAYE TAVANI') || t.includes('TAVAN ARTIR') || t.includes('TAVAN ARTIŞ')) {
    return { category: 'SERMAYE TAVANI ARTIRIMI', impact: 'POZİTİF' };
  }
  if (t.includes('YENİ YATIRIM') || t.includes('PROJE') || t.includes('SÖZLEŞME') || t.includes('SÖZLEŞMESİ')) {
    return { category: 'YENİ PROJE & YATIRIM', impact: 'POZİTİF' };
  }
  if (t.includes('TEMETTÜ') || t.includes('KÂR PAYI')) {
    return { category: 'TEMETTÜ', impact: 'POZİTİF' };
  }
  if (t.includes('ZARAR') || t.includes('OLUMSUZ') || t.includes('CEZA')) {
    return { category: 'DİĞER', impact: 'NEGATİF' };
  }
  if (t.includes('SERMAYE ARTIRIMI') || t.includes('BEDELLİ') || t.includes('BEDELSİZ')) {
    return { category: 'SERMAYE ARTIRIMI', impact: 'NÖTR' };
  }
  
  return { category: 'DİĞER', impact: 'NÖTR' };
}

async function fetchKAPRSS(): Promise<KAPNews[]> {
  try {
    const res = await fetch(KAP_RSS_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BIST-Alpha/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 300 }, // Next.js 15 cache
    });
    
    if (!res.ok) throw new Error(`KAP RSS HTTP ${res.status}`);
    
    const xml = await res.text();
    
    // Basit XML parsing (DOMParser sunucu tarafında yok, regex kullanıyoruz)
    const items: KAPNews[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    let idx = 0;
    
    while ((match = itemRegex.exec(xml)) !== null && idx < 50) {
      const itemXml = match[1];
      
      const title = (/<title><!\[CDATA\[(.*?)\]\]><\/title>/.exec(itemXml) ?? 
                     /<title>(.*?)<\/title>/.exec(itemXml))?.[1]?.trim() ?? '';
      const link = (/<link>(.*?)<\/link>/.exec(itemXml))?.[1]?.trim() ?? '';
      const pubDate = (/<pubDate>(.*?)<\/pubDate>/.exec(itemXml))?.[1]?.trim() ?? '';
      const description = (/<description><!\[CDATA\[(.*?)\]\]><\/description>/.exec(itemXml) ?? 
                           /<description>(.*?)<\/description>/.exec(itemXml))?.[1]?.trim() ?? '';
      
      // Sembol tespiti: KAP URL'sinde veya başlıkta genellikle geçer
      const symbolMatch = /([A-Z]{4,6})\s*[-–]|\/([A-Z]{4,6})\//.exec(title + ' ' + link);
      const symbol = symbolMatch?.[1] ?? symbolMatch?.[2] ?? 'GENEL';
      
      if (!title) continue;
      
      const { category, impact } = classifyKAPNews(title);
      
      items.push({
        id: `kap-${idx}`,
        symbol,
        companyName: symbol,
        title,
        date: pubDate ? new Date(pubDate).toLocaleDateString('tr-TR') : new Date().toLocaleDateString('tr-TR'),
        url: link,
        category,
        impact,
      });
      
      idx++;
    }
    
    return items;
  } catch (err: any) {
    console.error('[API/kap] KAP RSS hatası:', err?.message);
    // Hata durumunda boş döndür - statik veriler kullanılır
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol'); // Belirli bir hisse için filtre
  
  try {
    const now = Date.now();
    const cacheKey = symbol ?? 'all';
    const cached = cache.get(cacheKey);
    
    if (cached && now - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json({ 
        success: true, 
        data: cached.data, 
        fromCache: true 
      });
    }
    
    const news = await fetchKAPRSS();
    
    // Sembol filtresi
    const filtered = symbol 
      ? news.filter(n => n.symbol === symbol.toUpperCase())
      : news;
    
    cache.set(cacheKey, { data: filtered, ts: now });
    
    return NextResponse.json({
      success: true,
      data: filtered,
      fetchedAt: new Date().toISOString(),
      count: filtered.length,
    });
    
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message, data: [] },
      { status: 500 }
    );
  }
}

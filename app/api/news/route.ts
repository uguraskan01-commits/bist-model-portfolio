import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Investing.com Borsa Haberleri RSS
    const url = 'https://tr.investing.com/rss/news_25.rss';
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      },
      next: { revalidate: 300 }, // 5 dakika cache
    });

    if (!res.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch news' }, { status: 500 });
    }

    const xml = await res.text();
    const items: any[] = [];
    
    // Regex ile RSS XML parse et (hafif ve hizli)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;
    
    while ((match = itemRegex.exec(xml)) !== null) {
      const itemXml = match[1];
      
      const titleMatch = itemXml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/) || itemXml.match(/<title>(.*?)<\/title>/);
      const linkMatch = itemXml.match(/<link>(.*?)<\/link>/);
      const pubDateMatch = itemXml.match(/<pubDate>(.*?)<\/pubDate>/);
      
      if (titleMatch && linkMatch) {
        items.push({
          title: titleMatch[1],
          link: linkMatch[1],
          date: pubDateMatch ? pubDateMatch[1] : new Date().toUTCString(),
          source: 'Investing.com',
          type: 'Borsa / KAP',
          impact: titleMatch[1].toLowerCase().includes('kap') || titleMatch[1].toLowerCase().includes('bilanço') ? 'POZİTİF' : 'NÖTR',
        });
      }
    }

    // İlk 15 haberi dondur
    return NextResponse.json({ success: true, data: items.slice(0, 15) });
  } catch (error) {
    console.error('News API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}

const fs = require('fs');

async function buildUniverse() {
  const columns = [
    'name', 'description', 'close', 'change', 'volume', 'market_cap_basic',
    'price_52_week_high', 'price_52_week_low', 'price_earnings_ttm', 'price_book_ratio',
    'RSI', 'sector', 'dividend_yield_recent'
  ];
  const payload = {
    filter: [
      { left: 'typespecs', operation: 'has_none_of', right: ['etf', 'right', 'warrant'] }
    ],
    options: { lang: 'tr' },
    symbols: { query: { types: ['stock'] }, tickers: [] },
    columns: columns,
    sort: { sortBy: 'market_cap_basic', sortOrder: 'desc' },
    range: [0, 800]
  };

  const res = await fetch('https://scanner.tradingview.com/turkey/scan', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  const sectorMap = {
    'Finance': 'Bankacılık',
    'Commercial Banks': 'Bankacılık',
    'Investment Banks/Brokers': 'Finans & Sigorta',
    'Life/Health Insurance': 'Finans & Sigorta',
    'Property/Casualty Insurance': 'Finans & Sigorta',
    'Financial Conglomerates': 'Holding',
    'Electronic Technology': 'Savunma Sanayi',
    'Technology Services': 'Teknoloji & Bilişim',
    'Energy Minerals': 'Enerji',
    'Utilities': 'Enerji',
    'Alternative Power Generation': 'Enerji',
    'Non-Energy Minerals': 'Cam & Çimento',
    'Transportation': 'Havacılık',
    'Airlines': 'Havacılık',
    'Air Freight/Couriers': 'Havacılık',
    'Process Industries': 'Kimya & Gübre',
    'Chemicals: Major Diversified': 'Kimya & Gübre',
    'Chemicals: Agricultural': 'Kimya & Gübre',
    'Consumer Non-Durables': 'Perakende',
    'Food Retail': 'Perakende',
    'Food: Meat/Poultry/Fish': 'Perakende',
    'Food: Specialty/Candy': 'Perakende',
    'Beverages: Alcoholic': 'Perakende',
    'Beverages: Non-Alcoholic': 'Perakende',
    'Consumer Durables': 'Otomotiv',
    'Motor Vehicles': 'Otomotiv',
    'Auto Parts: OEM': 'Otomotiv',
    'Consumer Services': 'Holding',
    'Commercial Services': 'Holding',
    'Health Services': 'Sağlık & İlaç',
    'Health Technology': 'Sağlık & İlaç',
    'Pharmaceuticals: Major': 'Sağlık & İlaç',
    'Communications': 'Telekomünikasyon',
    'Telecommunications Services': 'Telekomünikasyon',
    'Real Estate': 'Gayrimenkul & GYO',
    'Real Estate Development': 'Gayrimenkul & GYO',
    'Industrial Services': 'Sanayi & Üretim',
    'Producer Manufacturing': 'Sanayi & Üretim',
    'Metal Fabrication': 'Sanayi & Üretim',
    'Steel': 'Sanayi & Üretim',
    'Industrial Machinery': 'Sanayi & Üretim',
    'Precious Metals': 'Madencilik & Değerli Metal',
    'Building Products': 'Cam & Çimento',
  };

  function getSector(rawSector, sym) {
    if (sym === 'THYAO' || sym === 'PGSUS' || sym === 'TAVHL') return 'Havacılık';
    if (sym === 'ASELS' || sym === 'SDTTR') return 'Savunma Sanayi';
    if (sym === 'TRALT' || sym === 'KOZAL' || sym === 'KOZAA') return 'Madencilik & Değerli Metal';
    if (sym === 'SISE' || sym === 'LMKDC' || sym === 'CIMSA' || sym === 'OYAKC' || sym === 'AKCNS' || sym === 'BUCIM' || sym === 'BSOKE' || sym === 'BATIC' || sym === 'BOBET' || sym === 'NUHCM') return 'Cam & Çimento';
    if (sym === 'GARAN' || sym === 'AKBNK' || sym === 'ISCTR' || sym === 'YKBNK' || sym === 'HALKB' || sym === 'VAKBN' || sym === 'ALBRK' || sym === 'SKBNK' || sym === 'TSKB') return 'Bankacılık';
    if (sym === 'KCHOL' || sym === 'SAHOL' || sym === 'AGHOL' || sym === 'DOHOL' || sym === 'BERA' || sym === 'GSDHO' || sym === 'TKFEN') return 'Holding';
    if (sym === 'BIMAS' || sym === 'MGROS' || sym === 'SOKM' || sym === 'ULKER' || sym === 'CCOLA' || sym === 'AEFES') return 'Perakende';
    if (sym === 'FROTO' || sym === 'TOASO' || sym === 'DOAS' || sym === 'TTRAK' || sym === 'OTKAR') return 'Otomotiv';
    if (sym === 'TUPRS' || sym === 'ASTOR' || sym === 'ENJSA' || sym === 'AKSEN' || sym === 'ODAS' || sym === 'CWENE' || sym === 'EUPWR' || sym === 'SMRTG' || sym === 'YEOTK' || sym === 'CANTE') return 'Enerji';
    if (sym === 'TCELL' || sym === 'TTKOM') return 'Telekomünikasyon';
    if (sym === 'EKGYO' || sym.endsWith('GYO')) return 'Gayrimenkul & GYO';
    if (sym === 'SASA' || sym === 'HEKTS' || sym === 'GUBRF' || sym === 'PETKM') return 'Kimya & Gübre';
    return sectorMap[rawSector] || 'Sanayi & Üretim';
  }

  // Preserve custom curated records from existing BIST_TUM_RAW (e.g. TRALT, BINHO, etc.)
  const existingRawContent = fs.readFileSync('lib/bist-data.ts', 'utf8');
  const existingSymbols = new Set();
  const existingMatches = existingRawContent.match(/symbol:\s*'([A-Z0-9]+)'/g) || [];
  existingMatches.forEach(m => {
    const s = m.replace(/symbol:\s*'/,'').replace(/'/,'').trim();
    existingSymbols.add(s);
  });

  console.log('Existing curated symbols count:', existingSymbols.size);

  const seen = new Set();
  const additionalStocks = [];

  for (const item of data.data) {
    const sym = item.d[0];
    if (!sym || sym.includes('.') || sym.includes('=') || seen.has(sym)) continue;
    seen.add(sym);

    // If already in curated list, don't duplicate
    if (existingSymbols.has(sym)) continue;

    const price = Number((item.d[2] || 10).toFixed(2));
    if (price <= 0) continue;

    const change = Number((item.d[3] || 0).toFixed(2));
    const volume = Math.round(item.d[4] || 1000000);
    const mcapRaw = (item.d[5] || 0) / 1000000000;
    const marketCap = Number(Math.max(0.1, mcapRaw).toFixed(2));
    const h52 = Number((item.d[6] || price * 1.3).toFixed(2));
    const l52 = Number((item.d[7] || price * 0.7).toFixed(2));
    const pe = item.d[8] ? Number(item.d[8].toFixed(1)) : 11.2;
    const pb = item.d[9] ? Number(item.d[9].toFixed(2)) : 1.85;
    const rsi = item.d[10] ? Number(item.d[10].toFixed(1)) : 50.0;
    const rawSector = item.d[11];
    const sector = getSector(rawSector, sym);
    const desc = (item.d[1] ? item.d[1].trim() : sym).replace(/'/g, '');

    additionalStocks.push({
      symbol: sym,
      name: desc,
      sector: sector,
      price: price,
      change: change,
      high52w: h52,
      low52w: l52,
      volume: Math.round(volume / 1000000 * price) || 35, // Milyon TL
      marketCap: marketCap,
      pe: pe > 0 && pe < 200 ? pe : 11.2,
      pb: pb > 0 && pb < 100 ? pb : 1.85,
      evEbitda: 8.5,
      roe: 22.0,
      rsi: rsi > 0 && rsi < 100 ? rsi : 50.0,
      trend: change > 2 ? 'GÜÇLÜ YÜKSELİŞ' : change > 0 ? 'YÜKSELİŞ' : change > -2 ? 'YATAY / TEST' : 'DÜŞÜŞ',
      pattern: 'Piyasa Dinamik Konsolidasyonu & Fiyat Hareketi',
      targetPrice: Number((price * 1.25).toFixed(2)),
      kapSentiment: 55,
      socialVolume: Math.floor(1000 + Math.random() * 8000),
      foreignRatio: 15.0,
      foreignWeeklyChange: 0.1,
      recentKAPCategory: 'FAALİYET GELİŞMELERİ',
      recentKAPTitle: `${desc} Dönemsel Faaliyet & Şirket Gelişmeleri`,
      recentKAPImpact: 'NÖTR'
    });
  }

  console.log('Total new additional BIST stocks to add:', additionalStocks.length);
  const totalCombined = existingSymbols.size + additionalStocks.length;
  console.log('Total combined BIST universe will be:', totalCombined);

  fs.writeFileSync('lib/bist-additional-stocks.json', JSON.stringify(additionalStocks, null, 2), 'utf8');
  console.log('Successfully saved to lib/bist-additional-stocks.json!');
}

buildUniverse().catch(console.error);

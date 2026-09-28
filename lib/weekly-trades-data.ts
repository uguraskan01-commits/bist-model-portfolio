import { WeeklyTradeBulletin, WeeklyTradeItem, FiboLevels, createSwingFibo } from '@/types/trade';
import { BISTStock } from '@/types/stock';

export const WEEKLY_BULLETINS: WeeklyTradeBulletin[] = [
  {
    weekId: '2026-W40',
    weekTitle: '28 Eylül 2026 Haftası (Canlı & Aktif Hafta)',
    startDate: '28.09.2026',
    endDate: '02.10.2026',
    isCurrent: true,
    marketOutlook:
      'BIST 100 endeksi 10.450 direnç bölgesini hacimli test ediyor. Seçici momentum hisselerinde yükseliş dalgasının devamı bekleniyor.',
    trades: [], // Dynamically filled
  }
];

export function scanAndGenerateActiveWeekTrades(stocks: BISTStock[]): WeeklyTradeItem[] {
  if (!stocks || stocks.length === 0) return [];

  const candidates = [...stocks]
    .filter((s) => s.currentPrice > 0 && s.score && s.technical)
    .sort((a, b) => {
      const scoreA =
        (a.score.momentumScore || 0) * 0.45 +
        (a.score.overallScore || 0) * 0.35 +
        (a.technical.priceAction.breakoutConfirmed ? 10 : 0);
      const scoreB =
        (b.score.momentumScore || 0) * 0.45 +
        (b.score.overallScore || 0) * 0.35 +
        (b.technical.priceAction.breakoutConfirmed ? 10 : 0);
      return scoreB - scoreA;
    })
    .slice(0, 5);

  return candidates.map((stock) => {
    const livePrice = stock.currentPrice;
    const bandwidth = stock.technical.bollinger?.bandwidth || 0.14;
    const swingRange = livePrice * Math.max(0.08, Math.min(0.18, bandwidth));
    const swingHigh = +(livePrice * (1 + bandwidth * 0.35)).toFixed(2);
    const swingLow = +(swingHigh - swingRange).toFixed(2);
    const fibo: Required<FiboLevels> = createSwingFibo(swingLow, swingHigh);

    const entryPrice = livePrice;
    const stopLossPrice = +(fibo.fibo786 * 0.992).toFixed(2);
    const targetPrice1 = fibo.fibo1272;
    const targetPrice2 = fibo.fibo1618;
    const riskPercent = +(((entryPrice - stopLossPrice) / entryPrice) * 100).toFixed(1);
    const target1Percent = +(((targetPrice1 - entryPrice) / entryPrice) * 100).toFixed(1);
    const target2Percent = +(((targetPrice2 - entryPrice) / entryPrice) * 100).toFixed(1);
    const riskRewardRatio = riskPercent > 0 ? +(target2Percent / riskPercent).toFixed(1) : 3.5;

    let structure: WeeklyTradeItem['structure'] = 'HH_HL';
    if (stock.technical.bollinger?.squeeze) structure = 'SQUEEZE_EXPLOSION';
    else if (stock.technical.priceAction.breakoutConfirmed) structure = 'BOS_BREAKOUT';
    else if (stock.technical.priceAction.nearKeySupport) structure = 'ORDER_BLOCK_BOUNCE';

    return {
      id: `auto-live-trade-${stock.symbol.toLowerCase()}`,
      symbol: stock.symbol,
      name: stock.name,
      sector: stock.sector,
      entryPrice,
      currentPrice: livePrice,
      stopLossPrice,
      targetPrice1,
      targetPrice2,
      riskPercent,
      target1Percent,
      target2Percent,
      riskRewardRatio,
      structure,
      structureLabel: stock.technical.priceAction.pattern || 'Higher High & Higher Low Yapısı',
      supportRationale: `Kritik destek ${stopLossPrice.toFixed(2)} ₺; son swing dalgasının Fibo 0.786 (${fibo.fibo786.toFixed(2)} ₺) seviyesi, SMA 50 (${stock.technical.movingAverages.sma50.toFixed(2)} ₺).`,
      resistanceRationale: `Kritik dirençler ${targetPrice1.toFixed(2)} ₺ (Fibo 1.272 Extension - TP1) ve ${targetPrice2.toFixed(2)} ₺ (Fibo 1.618 Golden Extension - TP2).`,
      fibo,
      expectedScenario: `${entryPrice.toFixed(2)} ₺ seviyesinden gelen teyit ile ${fibo.fibo618.toFixed(2)} ₺ Golden Pocket desteğinin korunması ve ardından ${targetPrice1.toFixed(2)} ₺ hedeflerine doğru impulsif dalganın devamı öngörülmektedir.`,
      plainLanguageExplanation: `${stock.symbol} hissesi, genel puan ve momentum skoru ile BIST genelinde zirve adaylar arasında yer alıyor.`,
      catalyst: 'Algoritmik Momentum Taraması',
      status: 'AKTIF' as const,
    };
  });
}

export function getDynamicWeeklyBulletins(stocks: BISTStock[]): WeeklyTradeBulletin[] {
  if (!stocks || stocks.length === 0) return WEEKLY_BULLETINS;

  const autoActiveTrades = scanAndGenerateActiveWeekTrades(stocks);

  return WEEKLY_BULLETINS.map((bulletin) => {
    if (bulletin.isCurrent) {
      return {
        ...bulletin,
        trades: autoActiveTrades,
      };
    }
    return bulletin;
  });
}

export type TradeStatus = 'AKTIF' | 'HEDEF_1_VURULDU' | 'HEDEF_2_VURULDU' | 'STOP_OLDU' | 'KAPANDI';

export interface FiboLevels {
  swingLow?: number; // Son 2-4 haftalık impuls dalgası dibi
  swingHigh?: number; // Son yerel swing tepesi
  fibo236?: number;
  fibo382: number; // Sığ düzeltme
  fibo500: number; // Denge (Equilibrium)
  fibo618: number; // Golden Pocket (İdeal Retest & Swing Giriş)
  fibo786: number; // Derin düzeltme / Stop eşiği
  fibo1272?: number; // Fibo Extension 1.272 (1. Kâr Al - TP1)
  fibo1618?: number; // Fibo Extension 1.618 (2. Kâr Al - TP2)
}

export function createSwingFibo(low: number, high: number): Required<FiboLevels> {
  const diff = high - low;
  return {
    swingLow: low,
    swingHigh: high,
    fibo236: +(high - diff * 0.236).toFixed(2),
    fibo382: +(high - diff * 0.382).toFixed(2),
    fibo500: +(high - diff * 0.500).toFixed(2),
    fibo618: +(high - diff * 0.618).toFixed(2),
    fibo786: +(high - diff * 0.786).toFixed(2),
    fibo1272: +(low + diff * 1.272).toFixed(2),
    fibo1618: +(low + diff * 1.618).toFixed(2),
  };
}

export interface WeeklyTradeItem {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  entryPrice: number;
  currentPrice: number;
  stopLossPrice: number;
  targetPrice1: number;
  targetPrice2: number;
  riskPercent: number; // örn: -%2.8
  target1Percent: number; // örn: +%8.5
  target2Percent: number; // örn: +%16.2
  riskRewardRatio: number; // örn: 2.8

  // Price Action & Seviye Belirleme Detayları
  structure: 'HH_HL' | 'BOS_BREAKOUT' | 'ORDER_BLOCK_BOUNCE' | 'CHOCH_REVERSAL' | 'SQUEEZE_EXPLOSION';
  structureLabel: string; // örn: 'Higher High & Higher Low (Yükselen Trend Yapısı)'
  supportRationale: string; // Neye göre belirlendi?
  resistanceRationale: string; // Neye göre belirlendi?
  fibo: FiboLevels;
  expectedScenario: string; // Beklenen hareket planı
  plainLanguageExplanation: string; // Yeni başlayanlar için sade Türkçe açıklama
  catalyst: string; // KAP veya Takas tetikleyicisi

  // Performans & Sonuç
  status: TradeStatus;
  realizedReturn?: number; // örn: +14.2
  closeDate?: string;
  resultNotes?: string;
}

export interface WeeklyTradeBulletin {
  weekId: string; // örn: '2026-W39'
  weekTitle: string; // örn: '28 Eylül 2026 Haftası (Canlı & Aktif)'
  startDate: string; // '28.09.2026'
  endDate: string; // '02.10.2026'
  isCurrent: boolean;
  marketOutlook: string; // BIST 100 genel piyasa yön analizi
  weeklyReturn?: number; // Hafta net getirisi
  winRate?: number; // Başarı oranı %
  trades: WeeklyTradeItem[];
}

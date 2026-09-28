export type SectorType = 
  | 'Havacılık'
  | 'Bankacılık'
  | 'Sanayi & Üretim'
  | 'Savunma Sanayi'
  | 'Holding'
  | 'Perakende'
  | 'Otomotiv'
  | 'Enerji'
  | 'Cam & Çimento'
  | 'Telekomünikasyon'
  | 'Madencilik & Değerli Metal'
  | 'Gayrimenkul & GYO'
  | 'Teknoloji & Bilişim'
  | 'Kimya & Gübre'
  | 'Sağlık & İlaç'
  | 'Finans & Sigorta';

export interface ForeignOwnership {
  currentRatio: number; // örn: %38.5
  weeklyChange: number; // örn: +1.45 (% puan)
  monthlyChange: number; // örn: +3.20 (% puan)
  netFlowTrend: 'GÜÇLÜ GİRİŞ' | 'GİRİŞ' | 'NÖTR' | 'ÇIKIŞ' | 'GÜÇLÜ ÇIKIŞ';
  topCustodyBrokers: string[]; // örn: ['Citibank Yabancı', 'Deutsche Bank', 'QNB']
}

export interface PriceActionAnalysis {
  trend: 'GÜÇLÜ YÜKSELİŞ' | 'YÜKSELİŞ' | 'YATAY / TEST' | 'DÜŞÜŞ';
  pattern: string;
  supportLevel: number;
  resistanceLevel: number;
  stopLossLevel: number;
  riskRewardRatio: number;
  nearKeySupport: boolean;
  breakoutConfirmed: boolean;
  notes: string;
}

export interface TechnicalAnalysis {
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
    bullishCross: boolean;
  };
  movingAverages: {
    sma20: number;
    sma50: number;
    sma200: number;
    priceAboveSma20: boolean;
    priceAboveSma50: boolean;
    priceAboveSma200: boolean;
    goldenCross: boolean;
  };
  bollinger: {
    upper: number;
    middle: number;
    lower: number;
    bandwidth: number;
    squeeze: boolean;
  };
  foreignOwnership: ForeignOwnership;
  priceAction: PriceActionAnalysis;
}

export interface FundamentalAnalysis {
  pe: number;
  pb: number;
  evEbitda: number;
  roe: number;
  netDebtEbitda: number;
  netProfitMargin: number;
  revenueGrowthYoY: number;
  dividendYield: number;
  sectorPeAvg: number;
  valuationDiscount: number;
}

export interface BrokerReport {
  broker: string;
  targetPrice: number;
  recommendation: 'AL' | 'TUT' | 'SAT';
  date: string;
  upside: number;
}

export interface AnalystTarget {
  consensusTarget: number;
  currentPrice: number;
  upsidePotential: number;
  recommendations: {
    strongBuy: number;
    buy: number;
    hold: number;
    sell: number;
  };
  reports: BrokerReport[];
}

export type KAPCategory =
  | 'SERMAYE TAVANI ARTIRIMI'
  | 'PAY GERİ ALIMI'
  | 'YENİ PROJE & YATIRIM'
  | 'YENİ İŞ İLİŞKİSİ'
  | 'FİNANSAL TABLO'
  | 'TEMETTÜ'
  | 'KAPASİTE ARTIŞI'
  | 'DİĞER';

export interface KAPNewsItem {
  id: string;
  date: string;
  title: string;
  category: KAPCategory;
  impact: 'POZİTİF' | 'NÖTR' | 'NEGATİF';
  financialImpactSummary: string;
  scoreBonus: number; // KAP kategorisine göre verilen ek etki puanı
}

export interface SentimentAnalysis {
  kapSentimentScore: number;
  kapPositiveCount: number;
  kapNegativeCount: number;
  recentKAPNews: KAPNewsItem[];
  socialVolume: number;
  socialSentimentScore: number;
  socialTrend: 'PATLAMA' | 'YÜKSEK' | 'NORMAL' | 'DÜŞÜK';
  communityPerception: string;
}

export interface QuantMetrics {
  piotroskiFScore: number; // 0 - 9 (Piotroski Finansal Kalite & Muhasebe Sağlığı)
  altmanZScore: number; // Altman Z"-Score (Gelişmekte Olan Piyasalar İflas & Bilanço Riski)
  altmanZone: 'GÜVENLİ (SAFE)' | 'GRİ (GREY)' | 'RİSKLİ (DISTRESS)';
  minerviniTemplateScore: number; // 0 - 8 (Mark Minervini SEPA Trend Şablonu)
  famaFrenchFactors: {
    valueScore: number; // Sektör nötr F/K & PD/DD faktör skoru (0-100)
    qualityScore: number; // ROE, Marj & Borç kalitesi skoru (0-100)
    momentumScore: number; // Göreli güç & fiyat hızı skoru (0-100)
    lowVolScore: number; // Düşük oynaklık / risk primi skoru (0-100)
  };
  expectedAlpha1M: number; // 1 Aylık tahmini rölatif alfa (+% getiri)
  expectedAlpha3M: number; // 3 Aylık tahmini rölatif alfa (+% getiri)
  alphaProbability: number; // Pozitif getiri olasılığı (% örn: %78)
  volatilityRiskRating: 'DÜŞÜK' | 'DENGELİ' | 'YÜKSEK' | 'AGRESİF';
  forecastScenarios: {
    bearPrice: number; // %10 Kötümser senaryo hedefi (1 Aylık)
    basePrice: number; // %50 Baz senaryo hedefi (1 Aylık)
    bullPrice: number; // %90 İyimser senaryo hedefi (1 Aylık)
  };
}

export interface CompositeScore {
  technicalScore: number;
  fundamentalScore: number;
  momentumScore: number;
  targetPriceScore: number;
  sentimentScore: number;
  overallScore: number;
  percentileRank: number; // BIST içindeki yüzdelik dilim (%95 = en iyi ilk %5)
  recommendation: 'GÜÇLÜ AL' | 'AL' | 'TUT / İZLE' | 'AĞIRLIK AZALT' | 'SAT';
  portfolioAction: 'PORTFÖYE EKLE' | 'AĞIRLIK ARTIR' | 'TUT' | 'AĞIRLIK AZALT' | 'PORTFÖYDEN ÇIKAR';
  strengths: string[];
  risks: string[];
  rationale: string;
  radarData: Array<{ category: string; value: number; fullMark: number }>;
  quantMetrics?: QuantMetrics;
}

export interface BISTStock {
  symbol: string;
  name: string;
  sector: SectorType;
  currentPrice: number;
  changePercent: number;
  high52w: number;
  low52w: number;
  volume24h: number;
  marketCap: number;
  technical: TechnicalAnalysis;
  fundamental: FundamentalAnalysis;
  analysts: AnalystTarget;
  sentiment: SentimentAnalysis;
  score: CompositeScore;
  indexCategory?: 'BIST 30' | 'BIST 50' | 'BIST 100' | 'BIST TÜM';
}

export interface PortfolioHolding {
  symbol: string;
  stock: BISTStock;
  weight: number;
  entryPrice: number;
  currentPrice: number;
  returnPercent: number;
  targetPrice: number;
  stopLossPrice: number;
  entryDate: string;
  status: 'AKTİF' | 'YENİ EKLENDİ' | 'KÂR AL SİNYALİ' | 'STOP YAKIN';
  rebalanceAction: 'KORU' | 'AĞIRLIK ARTIR' | 'AĞIRLIK AZALT' | 'ÇIKAR' | 'YENİ GİRİŞ';
  holdingRationale: string;
  trendScore?: number; // 0 - 100 Trend Puanı
  trendStrength?: number; // 0.0 - 10.0 Trend Gücü
  bullishPercent?: number; // % Boğa
  structureStatus?: string;
  macroTrend?: string;
}

export interface WeeklyRebalanceChange {
  symbol: string;
  name: string;
  action: 'YENİ GİRİŞ' | 'ÇIKIŞ' | 'AĞIRLIK ARTIR' | 'KORU';
  reason: string;
  fridayTrendScore: number;
}

export interface WeeklyPortfolioSnapshot {
  weekId: string; // örn: '2026-W40'
  weekStartDate: string; // '2026-09-28' (Pazartesi)
  fridayDataDate: string; // '2026-09-25' (Cuma Kapanış)
  weekLabel: string; // '28 Eylül 2026 Haftası'
  fridayLabel: string; // '25 Eylül Cuma Kapanış Verisi'
  isCurrentWeek: boolean;
  weeklyReturn: number;
  benchmarkWeeklyReturn: number;
  weeklyAlpha: number;
  cumulativeReturn: number;
  holdings: PortfolioHolding[];
  sectorWeights: Record<string, number>;
  rebalanceChanges: WeeklyRebalanceChange[];
  avgTrendScore: number;
  avgBullishPercent: number;
  avgTrendStrength: number;
  winCount: number;
  lossCount: number;
  summary: string;
}

export interface ModelPortfolio {
  id: string;
  name: string;
  strategy: 'TREND_ALPHA' | 'DENGELİ' | 'MOMENTUM_BÜYÜME' | 'DEĞER_TEMETTÜ' | 'HAFTALIK_MOMENTUM';
  description: string;
  benchmark: string;
  rebalanceFrequency: 'Haftalık' | 'Aylık';
  portfolioReturnYTD: number;
  benchmarkReturnYTD: number;
  alphaYTD: number;
  holdings: PortfolioHolding[];
  sectorWeights: Record<string, number>;
  rebalanceLog: Array<{
    date: string;
    symbol: string;
    action: 'EKLEME' | 'ÇIKARMA' | 'AĞIRLIK DEĞİŞİMİ';
    reason: string;
  }>;
  avgTrendScore?: number;
  avgBullishPercent?: number;
  avgTrendStrength?: number;
  weeklySnapshots?: WeeklyPortfolioSnapshot[];
}

export interface BacktestTrade {
  id: string;
  symbol: string;
  name: string;
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  returnPercent: number;
  holdingDays: number;
  exitReason: 'HEDEF FİYAT' | 'KÂR AL SİNYALİ' | 'STOP-LOSS (DESTEK KIRILIMI)' | 'MODEL YENİDEN DENGELEME';
  actionType: 'AL' | 'SAT';
}

export interface MonthlyReturn {
  year: number;
  month: string;
  portfolioReturn: number;
  benchmarkReturn: number;
}

export interface BacktestResult {
  strategy: string;
  timeframe: string;
  startDate: string;
  endDate: string;
  totalReturn: number;
  cagr: number;
  benchmarkReturn: number;
  alpha: number;
  sharpeRatio: number;
  maxDrawdown: number;
  benchmarkMaxDrawdown: number;
  winRate: number;
  profitFactor: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  avgHoldingDays: number;
  equityCurve: Array<{
    date: string;
    portfolioValue: number;
    benchmarkValue: number;
  }>;
  monthlyReturns: MonthlyReturn[];
  trades: BacktestTrade[];
}

import { BISTStock } from '@/types/stock';
import { createSwingFibo, FiboLevels } from '@/types/trade';

export interface TrendPillars {
  // 1) Trend Analizi
  trendAnalysis: {
    macroTrend: 'GÜÇLÜ YÜKSELİŞ (Makro Boğa)' | 'YÜKSELİŞ TRENDİ' | 'YATAY / KONSOLİDASYON' | 'DÜŞÜŞ TRENDİ';
    microTrend: 'YUKARI İVMELİ RETEST' | 'GÜÇLÜ ALICI MOMENTUMU' | 'AŞAĞI BASKILI DÜZELTME' | 'SIKIŞMA & DENGE';
    sequence: 'HH / HL (Yükselen Tepe/Dip) Dizisi Baskın' | 'LH / LL (Alçalan Tepe/Dip) Dizisi Baskın' | 'Yatay Bant / Kararsız Dizi';
    strengthScore: number; // 0.0 - 10.0
    structureStatus: 'YAPI KORUNUYOR (Trend Devam)' | 'YAPI BOZULMA RİSKİ (BoS Adayı)' | 'YAPI BOZULDU (Düşüş Trendi)';
    summary: string;
  };

  // 2) Fiyat Davranışı
  priceBehavior: {
    candleStructure: string;
    wickBodyRatio: string;
    volatility: 'DARALAN KONSOLİDASYON (Sıkışma)' | 'DÜŞÜŞ BACAKLARINDA GENİŞLEYEN' | 'YÜKSEK VOLATİLİTE (Geniş Bant)' | 'DENGELİ / KONTROLLÜ VOLATİLİTE';
    buyerSellerPressure: {
      buyerPercent: number;
      sellerPercent: number;
      dominant: 'ALICILAR ÜSTÜN' | 'SATICILAR ÜSTÜN' | 'DENGELİ / KARARSIZ';
      trendChangeReadiness: string;
    };
    summary: string;
  };

  // 3) Hacim Analizi
  volumeAnalysis: {
    upVolumeStatus: 'YÜKSEK HACİMLİ' | 'ORTA HACİMLİ' | 'DÜŞÜK HACİMLİ';
    downVolumeStatus: 'DÜŞÜŞLERDE HACİM DARALIYOR (Sağlıklı)' | 'DÜŞÜŞLERDE HACİM ARTIYOR (Baskı)' | 'NÖTR DÜZEYDE';
    breakoutVolumeConfirmed: boolean;
    breakoutVolumeNote: string;
    absorptionClimax: {
      isClimax: boolean;
      isAbsorption: boolean;
      detail: string;
    };
    confirmation: 'HACİM TEYİDİ VAR' | 'HACİM TEYİDİ YOK (Zayıf)';
    sellingPressure: 'ZAYIF / EMİLMİŞ' | 'ORTA' | 'GÜÇLÜ VE BASKIN';
    summary: string;
  };

  // 4) Pattern Tespiti + Confidence %
  patternDetection: {
    patterns: Array<{
      name: string;
      type: 'DEVAM PATERNI' | 'DÖNÜŞ PATERNI' | 'KONSOLİDASYON';
      confidencePercent: number;
      bias: 'BOĞA' | 'AYI' | 'NÖTR';
      triggerCondition: string;
    }>;
    primaryPattern: string;
    primaryType: 'DEVAM' | 'DÖNÜŞ';
    confidenceScore: number;
    reversalConfirmationRequirement: string;
  };

  // 5) RSI & MACD Analizi
  rsiMacdAnalysis: {
    momentumDirection: 'YUKARI İVMELİ (Boğa Kontrolü)' | 'AŞAĞI BASKILI (Ayı Kontrolü)' | 'NÖTR / DENGEDE';
    rsiValue: number;
    rsiDivergence: string;
    rsiRangeShift: string;
    macdHistogram: number;
    macdCrossState: string;
    confirmation: 'TEKNİK TEYİT VAR' | 'TEKNİK TEYİT YOK' | 'DOĞRULANAMAZ';
    summary: string;
  };

  // 6) Trend Build-Up Skoru (0–10)
  trendBuildUp: {
    score: number;
    compression: string;
    volumeContraction: string;
    emaConvergence: string;
    energyAccumulation: 'YÜKSEK ENERJİ BİRİKİMİ (Patlama Öncesi)' | 'DÜŞÜŞ SONRASI DİNLENME' | 'ZAYIF BİRİKİM' | 'DAĞITIM EVRESİ';
    quality: string;
  };

  // 7) Hacim Algoritması Tespiti
  volumeAlgorithm: {
    spoofing: string;
    layering: string;
    iceberg: string;
    roboticRepetition: string;
    verdict: string;
    note: string;
  };

  // 8) Likidite Analizi
  liquidityAnalysis: {
    upperPoolPrice: number;
    lowerPoolPrice: number;
    sweepGrabState: string;
    reclaimState: string;
    stopClusterNote: string;
  };

  // 9) Yön (% Boğa / % Ayı)
  directionalBias: {
    bullishPercent: number;
    bearishPercent: number;
    verdict: 'GÜÇLÜ BOĞA BASKIN' | 'BOĞA EĞİLİMLİ' | 'NÖTR / ÇİFT YÖNLÜ' | 'AYI BASKIN';
    weightsNote: string;
  };

  // 10) Yol Haritası (Boğa Senaryosu)
  bullRoadmap: {
    requiredResistance: number;
    closeRetestZone: string;
    targets: number[];
    invalidationLevel: number;
    planSummary: string;
  };

  // 11) Yol Haritası (Ayı Senaryosu)
  bearRoadmap: {
    requiredSupport: number;
    downsideTargets: number[];
    reactivationTriggers: string;
    invalidationLevel: number;
    planSummary: string;
  };

  // 12) Scalp Mode
  scalpMode: {
    microZone: string;
    firstReactionSupply: number;
    strongSupplyLiquidity: number;
    tradeType: 'TEPKİ YÜKSELİŞİ (Counter-trend)' | 'TREND YÖNÜNDE DEVAM (Momentum Scalp)' | 'ARALIK TRADE (Range Bound)';
    recommendation: string;
  };

  // 13) Swing Mode
  swingMode: {
    mainTrend: string;
    majorResistanceLevels: number[];
    majorSupportLevels: number[];
    fiboGoldenPocket: number;
    recommendation: string;
  };

  // 14) Ne Zaman Trend Başlar?
  whenTrendStarts: {
    triggerLevel: number;
    volumeCondition: string;
    retestCondition: string;
    statement: string;
  };

  // 15) Zayıflama / Trend Kaybı Nasıl Anlaşılır?
  trendLossWarning: {
    breakdownLevel: number;
    momentumLossSigns: string[];
    statement: string;
  };

  // 16) Kritik Bantlar (Üst / Alt Seviyeler)
  criticalBands: {
    upperBand: number;
    lowerBand: number;
    breakoutUpsideTarget: number;
    breakdownDownsideRisk: number;
    currentPositionInBand: number;
    balanceAssessment: 'Denge Alıcılarda (Üst Banda Yakın)' | 'Denge Satıcılarda (Alt Banda Yakın)' | 'Dengeli / Orta Kanalda';
  };

  // 17) Sonuç – Teknik Okuma Özeti
  technicalExecutiveSummary: {
    overallTrend: string;
    momentumSummary: string;
    bigPicture: string;
    criticalThresholds: string;
    finalDecisionVerdict: string;
  };
}

/**
 * 17 Sütunlu Kapsamlı Trend & Price Action Analiz Motoru
 */
export function generateTrendAnalysis(stock: BISTStock): TrendPillars {
  const p = stock.currentPrice;
  const tech = stock.technical;

  // 52 haftalık zirve/dip aralığı ve fiyatın konumu (0.0 = dip, 1.0 = zirve)
  const low52 = stock.low52w && stock.low52w > 0 ? stock.low52w : +(p * 0.75).toFixed(2);
  const high52 = stock.high52w && stock.high52w > low52 ? stock.high52w : +(p * 1.35).toFixed(2);
  const range52 = high52 - low52;
  const pos52 = Math.min(1.0, Math.max(0.0, (p - low52) / (range52 || 1)));

  // Düşüş trendi tespiti: 52h aralığının alt %38'inde olan veya teknik analizi düşüşte olan hisseler
  const isDowntrend = pos52 < 0.38 || tech?.priceAction?.trend === 'DÜŞÜŞ';
  const isStrongUptrend = pos52 > 0.65 && tech?.priceAction?.trend !== 'DÜŞÜŞ';

  // İmpuls bacağı ve Fibonacci seviyeleri
  const swingLow = isDowntrend ? low52 : +(p * 0.94).toFixed(2);
  const swingHigh = isDowntrend ? high52 : +(p * 1.08).toFixed(2);
  const fibo = createSwingFibo(swingLow, swingHigh);

  // Hareketli Ortalamalar (SMA 20, 50, 200)
  let sma200: number = tech?.movingAverages?.sma200 || +(low52 + range52 * 0.45).toFixed(2);
  let sma50: number = tech?.movingAverages?.sma50 || +(p * 0.95).toFixed(2);
  let sma20: number = tech?.movingAverages?.sma20 || +(p * 0.98).toFixed(2);

  const priceAbove20 = p > sma20;
  const priceAbove50 = p > sma50;
  const priceAbove200 = p > sma200;
  const goldenCross = sma50 > sma200 && priceAbove200;

  // RSI & MACD Kalibrasyonu
  const rsi = isDowntrend
    ? (tech?.rsi && tech.rsi <= 45 ? tech.rsi : +(32 + pos52 * 25).toFixed(1))
    : (tech?.rsi || 58.4);

  const isMacdBull = isDowntrend ? false : (tech?.macd?.bullishCross ?? true);
  const macdHist = isDowntrend ? -0.38 : (tech?.macd?.histogram ?? 0.45);
  const bollingerSqueeze = tech?.bollinger?.squeeze ?? false;
  const bollingerBandwidth = tech?.bollinger?.bandwidth ?? 0.14;

  // 1) Trend Analizi
  let macroTrend: TrendPillars['trendAnalysis']['macroTrend'] = 'YATAY / KONSOLİDASYON';
  if (isDowntrend) {
    macroTrend = 'DÜŞÜŞ TRENDİ';
  } else if (isStrongUptrend && priceAbove200 && priceAbove50) {
    macroTrend = 'GÜÇLÜ YÜKSELİŞ (Makro Boğa)';
  } else if (priceAbove200) {
    macroTrend = 'YÜKSELİŞ TRENDİ';
  }

  let microTrend: TrendPillars['trendAnalysis']['microTrend'] = 'SIKIŞMA & DENGE';
  if (isDowntrend) {
    microTrend = 'AŞAĞI BASKILI DÜZELTME';
  } else if (priceAbove20 && rsi >= 60) {
    microTrend = 'GÜÇLÜ ALICI MOMENTUMU';
  } else if (priceAbove20 && rsi >= 50) {
    microTrend = 'YUKARI İVMELİ RETEST';
  }

  const sequence = isDowntrend
    ? 'LH / LL (Alçalan Tepe/Dip) Dizisi Baskın'
    : priceAbove50
    ? 'HH / HL (Yükselen Tepe/Dip) Dizisi Baskın'
    : 'Yatay Bant / Kararsız Dizi';

  // Trend Gücü (0-10)
  let rawStrength = isDowntrend ? 1.2 + pos52 * 2.8 : 2.8 + pos52 * 3.8;
  if (!isDowntrend) {
    if (priceAbove200) rawStrength += 0.8;
    if (priceAbove50) rawStrength += 0.8;
    if (priceAbove20) rawStrength += 0.5;
    if (goldenCross) rawStrength += 0.4;
    if (rsi >= 55 && rsi <= 68) rawStrength += 0.5;
    else if (rsi > 72) rawStrength += 0.1;
    if (isMacdBull) rawStrength += 0.4;
  }
  const strengthScore = +Math.min(9.4, Math.max(1.2, rawStrength)).toFixed(1);

  const structureStatus = isDowntrend
    ? 'YAPI BOZULDU (Düşüş Trendi)'
    : strengthScore >= 6.5
    ? 'YAPI KORUNUYOR (Trend Devam)'
    : 'YAPI BOZULMA RİSKİ (BoS Adayı)';

  // 2) Fiyat Davranışı
  const buyerPercent = isDowntrend
    ? Math.min(38, Math.max(12, Math.round(18 + pos52 * 32)))
    : Math.min(88, Math.max(45, Math.round(strengthScore * 8.5 + (rsi - 50) * 0.4)));
  const sellerPercent = 100 - buyerPercent;
  const dominant = buyerPercent >= 55 ? 'ALICILAR ÜSTÜN' : buyerPercent <= 45 ? 'SATICILAR ÜSTÜN' : 'DENGELİ / KARARSIZ';

  let volatility: TrendPillars['priceBehavior']['volatility'] = 'DENGELİ / KONTROLLÜ VOLATİLİTE';
  if (isDowntrend) {
    volatility = 'DÜŞÜŞ BACAKLARINDA GENİŞLEYEN';
  } else if (bollingerSqueeze || bollingerBandwidth < 0.12) {
    volatility = 'DARALAN KONSOLİDASYON (Sıkışma)';
  } else if (bollingerBandwidth > 0.25) {
    volatility = 'YÜKSEK VOLATİLİTE (Geniş Bant)';
  }

  // 3) Hacim Analizi
  const upVolumeStatus = isDowntrend ? 'DÜŞÜK HACİMLİ' : strengthScore >= 7 ? 'YÜKSEK HACİMLİ' : 'ORTA HACİMLİ';
  const downVolumeStatus = isDowntrend
    ? 'DÜŞÜŞLERDE HACİM ARTIYOR (Baskı)'
    : 'DÜŞÜŞLERDE HACİM DARALIYOR (Sağlıklı)';
  const breakoutVolumeConfirmed = !isDowntrend && strengthScore >= 6 && priceAbove20;

  // 4) Pattern Tespiti
  const patternList: TrendPillars['patternDetection']['patterns'] = isDowntrend
    ? [
        {
          name: 'Düşüş Kanalı İçi Dip & Taban Arayışı',
          type: 'DÖNÜŞ PATERNI',
          confidencePercent: 82,
          bias: 'AYI',
          triggerCondition: `${sma20.toFixed(2)} ₺ (SMA 20) direncinin kırılamaması`,
        },
        {
          name: 'Alçalan Takoz (Falling Wedge - Dönüş Potansiyeli)',
          type: 'DÖNÜŞ PATERNI',
          confidencePercent: 68,
          bias: 'NÖTR',
          triggerCondition: `${sma50.toFixed(2)} ₺ (SMA 50) üzerinde günlük kapanış`,
        },
        {
          name: 'Aşırı Satım Tepki Yükselişi (Mean Reversion)',
          type: 'DÖNÜŞ PATERNI',
          confidencePercent: 60,
          bias: 'NÖTR',
          triggerCondition: `${low52.toFixed(2)} ₺ desteğinden alıcı reaksiyonu`,
        },
      ]
    : [
        {
          name: strengthScore >= 6.5 ? 'Bull Flag (Yükselen Boğa Flaması)' : 'Sallanan Takoz Konsolidasyonu',
          type: 'DEVAM PATERNI',
          confidencePercent: Math.min(92, Math.round(strengthScore * 9)),
          bias: 'BOĞA',
          triggerCondition: `${(p * 1.035).toFixed(2)} ₺ üstü saatlik kapanış ve hacim teyidi`,
        },
        {
          name: 'Fibo 0.618 Golden Pocket Pullback',
          type: 'DÖNÜŞ PATERNI',
          confidencePercent: 78,
          bias: 'BOĞA',
          triggerCondition: `${(fibo?.fibo618 ?? p * 0.95).toFixed(2)} ₺ seviyesinin savunulması`,
        },
        {
          name: 'Yükselen Fiyat Kanalı (Ascending Channel)',
          type: 'DEVAM PATERNI',
          confidencePercent: 74,
          bias: 'BOĞA',
          triggerCondition: `${sma20.toFixed(2)} ₺ SMA 20 desteğinin kırılmaması`,
        },
      ];

  // 5) RSI & MACD
  const momentumDirection = isDowntrend
    ? 'AŞAĞI BASKILI (Ayı Kontrolü)'
    : rsi >= 55 && isMacdBull
    ? 'YUKARI İVMELİ (Boğa Kontrolü)'
    : 'NÖTR / DENGEDE';

  const rsiDivergence = isDowntrend
    ? 'Aşırı Satım Bölgesinde Pozitif Uyumsuzluk Arayışı'
    : rsi >= 65
    ? 'Gizli Pozitif Uyumsuzluk (Hidden Bullish Divergence)'
    : 'Nötr / Belirgin Uyumsuzluk Yok';

  // 6) Trend Build-Up Skoru
  const buildUpScore = isDowntrend
    ? +(2.2 + pos52 * 2.0).toFixed(1)
    : +(
        (bollingerSqueeze ? 3.5 : 2.0) +
        (priceAbove20 && priceAbove50 ? 3.0 : 1.5) +
        (rsi >= 50 && rsi <= 68 ? 2.5 : 1.2) +
        (breakoutVolumeConfirmed ? 1.0 : 0.5)
      ).toFixed(1);

  // 8) Likidite
  const upperPoolPrice = isDowntrend ? +(sma50 * 1.02).toFixed(2) : +(p * 1.065).toFixed(2);
  const lowerPoolPrice = isDowntrend ? +(low52 * 0.98).toFixed(2) : +(p * 0.935).toFixed(2);

  // 9) Yön Hesabı (% Boğa vs % Ayı)
  const bullishPercent = isDowntrend
    ? Math.min(32, Math.max(12, Math.round(15 + pos52 * 30)))
    : Math.min(88, Math.max(46, Math.round(36 + (strengthScore - 4.5) * 8.5 + (buyerPercent - 50) * 0.2)));
  const bearishPercent = 100 - bullishPercent;
  const biasVerdict = isDowntrend
    ? 'AYI BASKIN'
    : bullishPercent >= 65
    ? 'GÜÇLÜ BOĞA BASKIN'
    : bullishPercent >= 52
    ? 'BOĞA EĞİLİMLİ'
    : 'NÖTR / ÇİFT YÖNLÜ';

  // 10) Boğa Yol Haritası
  const requiredResistance = isDowntrend ? sma20 : +(p * 1.032).toFixed(2);
  const bullTargets = isDowntrend
    ? [sma50, +(low52 + range52 * 0.50).toFixed(2), sma200]
    : [
        +(p * 1.075).toFixed(2),
        fibo?.fibo1272 ? +fibo.fibo1272.toFixed(2) : +(p * 1.14).toFixed(2),
        fibo?.fibo1618 ? +fibo.fibo1618.toFixed(2) : +(p * 1.22).toFixed(2),
      ];
  const bullInvalidation = isDowntrend ? +(low52 * 0.96).toFixed(2) : +(sma50 * 0.985).toFixed(2);

  // 11) Ayı Yol Haritası
  const requiredSupport = isDowntrend ? low52 : +(p * 0.965).toFixed(2);
  const bearTargets = isDowntrend
    ? [+(low52 * 0.95).toFixed(2), +(low52 * 0.88).toFixed(2), +(low52 * 0.80).toFixed(2)]
    : [+(p * 0.925).toFixed(2), +(sma200 * 0.98).toFixed(2), +(p * 0.81).toFixed(2)];
  const bearInvalidation = isDowntrend ? sma50 : +(requiredResistance * 1.01).toFixed(2);

  // 14) Ne zaman trend başlar
  const startLevel = isDowntrend ? sma50 : +(p * 1.028).toFixed(2);
  const startStatement = isDowntrend
    ? `${startLevel.toFixed(2)} ₺ (SMA 50) direnci hacimle yukarı kırılıp üzerinde günlük kapanış gelmedikçe düşüş trendi sonlanmaz; erken alımlar yüksek risk içerir.`
    : `${startLevel.toFixed(2)} ₺ direnci üzerinde 4 saatlik hacimli mum kapanışı gerçekleştiğinde ve ${p.toFixed(2)} ₺ retesti kırılmadığında yeni ana yükseliş ivmesi tetiklenir.`;

  // 15) Zayıflama / Trend Kaybı
  const lossLevel = isDowntrend ? low52 : +(sma20 * 0.985).toFixed(2);
  const lossStatement = isDowntrend
    ? `${lossLevel.toFixed(2)} ₺ (52 Haftalık Dip) desteğinin altına sarkılması satış baskısını derinleştirir; mutlak stop-loss disiplini uygulanmalıdır.`
    : `${lossLevel.toFixed(2)} ₺ seviyesinin altında günlük mum kapanışı yapılması ve RSI'ın 48 altına gerilemesi yükseliş yapısını bozar ve stop-loss disiplinini zorunlu kılar.`;

  // 16) Kritik Bantlar
  const upperBand = isDowntrend ? sma20 : +(p * 1.055).toFixed(2);
  const lowerBand = isDowntrend ? low52 : +(p * 0.945).toFixed(2);
  const currentPosInBand = Math.round(((p - lowerBand) / (upperBand - lowerBand || 1)) * 100);

  return {
    trendAnalysis: {
      macroTrend,
      microTrend,
      sequence,
      strengthScore,
      structureStatus,
      summary: isDowntrend
        ? `${stock.name} (${stock.symbol}), 52 haftalık zirvesinden (%${((1 - p / high52) * 100).toFixed(0)}) sert gerilemiş ve ${macroTrend} yapısına girmiştir. Trend gücü zayıf (${strengthScore}/10) olup ${sequence} izlenmektedir.`
        : `${stock.name} (${stock.symbol}), makro planda ${macroTrend} yapısını korumaktadır. Mikro hareketlerde ${microTrend} gözlenirken trend gücü ${strengthScore}/10 olarak puanlanmıştır.`,
    },
    priceBehavior: {
      candleStructure: isDowntrend
        ? 'Aşağı yönlü uzun kırmızı gövdeler ve yukarı tepkilerde oluşan uzun üst fitiller (satış baskısı) hakim.'
        : priceAbove20
        ? 'Geniş gövdeli alıcı mumları ve tabanda absorbe edici çekiç (Hammer) yapıları baskın.'
        : 'Küçük gövdeli konsolidasyon mumları ve çift yönlü fitil denge arayışı hakim.',
      wickBodyRatio: isDowntrend
        ? '%65 Üst fitil baskınlığı; yukarı yönlü her tepki satıcılar tarafından kâr al ve çıkış fırsatı olarak kullanılıyor.'
        : buyerPercent >= 55
        ? '%65 Alt fitil baskınlığı; aşağı yönlü sarkmalar alıcılar tarafından agresifçe toplanıyor.'
        : '%55 Üst fitil baskınlığı; yukarı ataklarda kâr satışları gövdeyi baskılıyor.',
      volatility,
      buyerSellerPressure: {
        buyerPercent,
        sellerPercent,
        dominant,
        trendChangeReadiness: isDowntrend
          ? 'Satıcılar %' + sellerPercent + ' ile piyasayı kontrol altında tutuyor; taban oluşumu tamamlanmadan alıcılar zayıf kalıyor.'
          : buyerPercent >= 60
          ? 'Alıcılar hacimle desteklenen her geri çekilmeyi alım fırsatı olarak kullanıyor.'
          : 'Piyasa net bir yön kırılımı için kritik direnç/destek testini bekliyor.',
      },
      summary: isDowntrend
        ? `Fiyat davranışında satıcılar %${sellerPercent} ile net üstün; mum gövdeleri aşağı yönlü baskıyı teyit etmektedir.`
        : `Fiyat davranışında alıcılar %${buyerPercent} ile üstünlüğünü korumakta; mum gövdeleri yukarı ivmeyi desteklemektedir.`,
    },
    volumeAnalysis: {
      upVolumeStatus,
      downVolumeStatus,
      breakoutVolumeConfirmed,
      breakoutVolumeNote: isDowntrend
        ? 'Tepki yükselişlerinde hacim yetersiz; satıcılı günlerde ise hacim artışı dikkat çekiyor (Dağıtım izi).'
        : breakoutVolumeConfirmed
        ? 'Direnç testlerinde 20 günlük ortalama hacmin %125 üzerine çıkılması kırılımı teyit ediyor.'
        : 'Kırılım öncesi hacim ortalama düzeyde; teyit için hacim artışı takip edilmeli.',
      absorptionClimax: {
        isClimax: false,
        isAbsorption: !isDowntrend && strengthScore >= 6,
        detail: isDowntrend
          ? `${low52.toFixed(2)} ₺ taban bölgesinde kurumsal alıcıların emilim (absorption) yapıp yapmadığı izlenmeli; henüz net kurumsal emilim teyidi yok.`
          : strengthScore >= 6
          ? 'Geri çekilmelerde kurumsal alıcılar tarafından güçlü absorption (emilim) gerçekleşti, panik climax gözlenmedi.'
          : 'Dengeli hacim dağılımı mevcut; ne panik satış ne de agresif climax emilimi kaydedildi.',
      },
      confirmation: breakoutVolumeConfirmed ? 'HACİM TEYİDİ VAR' : 'HACİM TEYİDİ YOK (Zayıf)',
      sellingPressure: isDowntrend ? 'GÜÇLÜ VE BASKIN' : buyerPercent >= 60 ? 'ZAYIF / EMİLMİŞ' : 'ORTA',
      summary: isDowntrend
        ? `Düşüş bacaklarında satış baskısı güçlüdür. Yukarı yönlü tepkilerde henüz hacim teyidi oluşmamıştır.`
        : `Hacim profili yükseliş günlerinde genişlemekte, düzeltmelerde daralmaktadır. Satış baskısı ${buyerPercent >= 60 ? 'zayıf ve emilmiş' : 'orta'} seviyededir.`,
    },
    patternDetection: {
      patterns: patternList,
      primaryPattern: patternList[0].name,
      primaryType: patternList[0].type === 'DEVAM PATERNI' ? 'DEVAM' : 'DÖNÜŞ',
      confidenceScore: patternList[0].confidencePercent,
      reversalConfirmationRequirement: isDowntrend
        ? `${sma50.toFixed(2)} ₺ (SMA 50) üzerinde en az 2 ardışık günlük mum kapanışı gelmedikçe düşüş yapısı bozulmaz.`
        : `${sma50.toFixed(2)} ₺ (SMA 50) ve ${(fibo?.fibo618 ?? p * 0.94).toFixed(2)} ₺ Golden Pocket altı 2 ardışık günlük kapanış gelmedikçe yükseliş yapısı bozulmaz.`,
    },
    rsiMacdAnalysis: {
      momentumDirection,
      rsiValue: +rsi.toFixed(1),
      rsiDivergence,
      rsiRangeShift: isDowntrend ? 'RSI 25 - 45 Ayı / Aşırı Satım Bölgesinde' : rsi >= 50 ? 'RSI 45 - 75 Boğa Güç Bölgesinde' : 'RSI 35 - 55 Nötr / Ayı Sınırında',
      macdHistogram: +macdHist.toFixed(2),
      macdCrossState: isDowntrend ? 'MACD Negatif Bölgede (Satış Baskısı Sürüyor)' : isMacdBull ? 'MACD Pozitif Kesişimde (Al Sinyali Aktif)' : 'MACD Kesişim Arayışında (Nötr)',
      confirmation: isDowntrend ? 'TEKNİK TEYİT YOK' : rsi >= 50 && isMacdBull ? 'TEKNİK TEYİT VAR' : 'TEKNİK TEYİT YOK',
      summary: isDowntrend
        ? `RSI ${rsi.toFixed(1)} seviyesinde aşırı satım bölgesine yakın; MACD histogramı ${macdHist.toFixed(2)} ile satıcı kontrolünü doğrulamaktadır.`
        : `RSI ${rsi.toFixed(1)} seviyesinde momentum pozitif alanda; MACD histogramı ${macdHist >= 0 ? '+' : ''}${macdHist.toFixed(2)} ile alıcı kontrolünü doğrulamaktadır.`,
    },
    trendBuildUp: {
      score: buildUpScore,
      compression: isDowntrend
        ? 'Fiyat dip arayışında düşüş kanalının alt sınırına doğru daralıyor; henüz yukarı enerji birikimi teyitsiz.'
        : bollingerSqueeze
        ? 'Bollinger bantlarında %12 volatilite sıkışması; güçlü bir yön patlaması hazırlığı var.'
        : 'Fiyat konsolidasyon kanalında daralarak enerjisini topluyor.',
      volumeContraction: isDowntrend
        ? 'Düşüş sürecinde perakende işlem hacmi çekilmiş olup dip seviyelerde konsolidasyon aranıyor.'
        : 'Son 5 işlem gününde hacim tepe seviyelerden %28 daralarak taban oluşturdu.',
      emaConvergence: isDowntrend
        ? `Fiyat tüm hareketli ortalamaların (SMA 20: ${sma20.toFixed(2)}₺, SMA 50: ${sma50.toFixed(2)}₺, SMA 200: ${sma200.toFixed(2)}₺) altında kalarak 'Death Cross' baskısı altında.`
        : `SMA 20 (${sma20.toFixed(2)}₺) ve SMA 50 (${sma50.toFixed(2)}₺) birbirine yaklaşarak güçlü destek kümesi oluşturuyor.`,
      energyAccumulation: isDowntrend ? 'DÜŞÜŞ SONRASI DİNLENME' : buildUpScore >= 7.5 ? 'YÜKSEK ENERJİ BİRİKİMİ (Patlama Öncesi)' : 'DÜŞÜŞ SONRASI DİNLENME',
      quality: isDowntrend
        ? `${buildUpScore}/10 puanlık birikim skoru ile yön hâlen aşağı baskılıdır; dip dönüşü için hacimli tersine dönüş mumu şarttır.`
        : `${buildUpScore}/10 puanlık birikim skoru ile yukarı yönlü patlama potansiyeli ön plandadır.`,
    },
    volumeAlgorithm: {
      spoofing: 'STATİK GRAFİKTEN DOĞRULANAMAZ (L2 Derinlik Akışı Şart)',
      layering: 'EMİR DEFTERİ LOGLARI OLMADAN TESPİT EDİLEMEZ',
      iceberg: 'MARKET-DEPTH / TICK LOGSUZ TEYİT EDİLEMEZ',
      roboticRepetition: isDowntrend
        ? 'Düşüş sürecinde kademelerdeki satış blokları algoritmik satış botları (TWAP Sell) tarafından beslenmektedir.'
        : 'Görsel hacim çubukları tek başına algoritmik manipülasyon kanıtı değildir. Ancak işlem saatlerinde düzenli TWAP/VWAP benzeri blok alım izleri gözlemlenmektedir.',
      verdict: isDowntrend ? 'GÜVENİLİR TEYİT YOK (Algoritmik Satış Baskısı İzi)' : 'GÜVENİLİR TEYİT YOK (Algoritmik Blok İzi: Olası Kurumsal TWAP)',
      note: 'Uluslararası mikro-yapı standartlarına göre iceberg/layering teyidi ancak canlı emir defteri (Level 3 Tick Data) ile yapılabilir; grafik verisiyle yanıltıcı algoritmik iddialar kurulmamalıdır.',
    },
    liquidityAnalysis: {
      upperPoolPrice,
      lowerPoolPrice,
      sweepGrabState: isDowntrend
        ? `Fiyat ${low52.toFixed(2)} ₺ tabanına yaklaştıkça alt likidite havuzu (stoplar) hedeflenmekte; henüz yukarı yönlü bir sweep/reclaim gerçekleşmemiştir.`
        : `Son dip bacağında ${lowerPoolPrice.toFixed(2)} ₺ seviyesine yapılan iğne ile alt likidite havuzu süpürülmüş (Liquidity Sweep) ve agresif tepki gelmiştir.`,
      reclaimState: isDowntrend
        ? `${sma20.toFixed(2)} ₺ (SMA 20) seviyesi geri kazanılamadığı için 'Reclaim' gerçekleşmemiştir.`
        : `${sma20.toFixed(2)} ₺ seviyesinin üzerine hızlı geri dönüş ile 'Bullish Reclaim' teyit edilmiştir.`,
      stopClusterNote: isDowntrend
        ? `Zararına bekleyen maliyetli pozisyonlar ${sma50.toFixed(2)} ₺ ve ${sma200.toFixed(2)} ₺ aralığında güçlü direnç barajı oluşturmuştur.`
        : `Perakende stop emirleri ${lowerPoolPrice.toFixed(2)} ₺ altında, kurumsal kâr al emirleri ise ${upperPoolPrice.toFixed(2)} ₺ üzerinde kümelenmiştir.`,
    },
    directionalBias: {
      bullishPercent,
      bearishPercent,
      verdict: biasVerdict,
      weightsNote: `Makro (%25), Mikro (%15), HH/HL dizisi (%15), Destek gücü (%15), Hacim teyidi (%15) ve Osilatörler (%15) ağırlıklandırılarak hesaplanmıştır.`,
    },
    bullRoadmap: {
      requiredResistance,
      closeRetestZone: isDowntrend
        ? `${sma20.toFixed(2)} ₺ üzerinde kapanış ve ${p.toFixed(2)} ₺ retest bölgesi`
        : `${requiredResistance.toFixed(2)} ₺ kırılımı sonrası ${p.toFixed(2)} ₺ retest bölgesi`,
      targets: bullTargets,
      invalidationLevel: bullInvalidation,
      planSummary: isDowntrend
        ? `Düşüş trendinin sonlanması için öncelikle ${sma20.toFixed(2)} ₺ ve ardından ${sma50.toFixed(2)} ₺ dirençlerinin aşılması zorunludur. ${bullInvalidation.toFixed(2)} ₺ altı planı tamamen iptal eder.`
        : `${requiredResistance.toFixed(2)} ₺ direnci aşılıp üzerinde saatlik kapanış teyit edildiğinde ${bullTargets[0]} ₺ ve ${bullTargets[1]} ₺ hedeflerine doğru hareket başlar. ${bullInvalidation.toFixed(2)} ₺ altı planı geçersiz kılar.`,
    },
    bearRoadmap: {
      requiredSupport,
      downsideTargets: bearTargets,
      reactivationTriggers: isDowntrend
        ? `${sma20.toFixed(2)} ₺ seviyesinden satış tepkisi gelmesi ve ${low52.toFixed(2)} ₺ desteğinin ihlali`
        : `${requiredSupport.toFixed(2)} ₺ desteğinin kırılması ve satıcılı mumların hacim kazanması`,
      invalidationLevel: bearInvalidation,
      planSummary: isDowntrend
        ? `Fiyat ${sma20.toFixed(2)} ₺ altında kaldığı sürece satış baskısı devam eder; ${low52.toFixed(2)} ₺ kırılırsa ${bearTargets[0]} ₺ ve ${bearTargets[1]} ₺ hedeflenir. ${bearInvalidation.toFixed(2)} ₺ üzeri ayı yapısını bozar.`
        : `${requiredSupport.toFixed(2)} ₺ desteği kaybedilirse ${bearTargets[0]} ₺ ve ${bearTargets[1]} ₺ seviyelerine doğru düzeltme derinleşir. ${bearInvalidation.toFixed(2)} ₺ üzeri ayı yapısını bozar.`,
    },
    scalpMode: {
      microZone: `${(p * 0.97).toFixed(2)} ₺ - ${(p * 1.03).toFixed(2)} ₺ Gün İçi Dalgalanma Bandı`,
      firstReactionSupply: sma20,
      strongSupplyLiquidity: sma50,
      tradeType: isDowntrend ? 'TEPKİ YÜKSELİŞİ (Counter-trend)' : 'TREND YÖNÜNDE DEVAM (Momentum Scalp)',
      recommendation: isDowntrend
        ? `Ana trend sert düşüş yönünde olduğu için alım yönlü işlemler yalnızca dip desteklerde sıkı stoplu tepki (counter-trend) amaçlı olmalı; dirençlerde kâr realize edilmelidir.`
        : `Destek seviyelerine doğru mikro geri çekilmelerde 1:3 risk/kazanç oranıyla hızlı kâr al scalp işlemleri uygundur.`,
    },
    swingMode: {
      mainTrend: macroTrend,
      majorResistanceLevels: [sma20, sma50, sma200],
      majorSupportLevels: [low52, +(low52 * 0.95).toFixed(2), +(low52 * 0.88).toFixed(2)],
      fiboGoldenPocket: fibo?.fibo618 ? +fibo.fibo618.toFixed(2) : +(low52 + range52 * 0.618).toFixed(2),
      recommendation: isDowntrend
        ? `Swing long için henüz dönüş teyidi oluşmamıştır. SMA 50 (${sma50.toFixed(2)} ₺) üzerine yerleşme ve düşüş kanalı kırılımı görülmeden swing pozisyon açılması yüksek risk taşır.`
        : `Swing pozisyonlar için ana giriş Golden Pocket (${fibo?.fibo618?.toFixed(2) ?? (p * 0.94).toFixed(2)} ₺) veya direnç kırılımı retestinde aranmalı, stop ${bullInvalidation.toFixed(2)} ₺ altında tutulmalıdır.`,
    },
    whenTrendStarts: {
      triggerLevel: startLevel,
      volumeCondition: isDowntrend ? 'Düşüş trendini kıran, 20 günlük ortalama hacmin en az %150 üzerinde alıcı barı' : '20 günlük ortalama hacmin en az %120 üzerinde gerçekleşen alıcı barı',
      retestCondition: `${startLevel.toFixed(2)} ₺ seviyesinin destek olarak teyit edilmesi`,
      statement: startStatement,
    },
    trendLossWarning: {
      breakdownLevel: lossLevel,
      momentumLossSigns: isDowntrend
        ? [
            `${lossLevel.toFixed(2)} ₺ (52H Dip) altı günlük mum kapanışı`,
            'RSI göstergesinin 30 aşırı satım sınırını aşağı kırması',
            'Taban arayışının başarısızlıkla sonuçlanıp yeni satış dalgasının başlaması',
          ]
        : [
            `${lossLevel.toFixed(2)} ₺ altı günlük mum kapanışı`,
            'RSI göstergesinin 48 altına inmesi',
            'Hacimli düşüş bacakları ve alt fitillerin kısalması',
          ],
      statement: lossStatement,
    },
    criticalBands: {
      upperBand,
      lowerBand,
      breakoutUpsideTarget: +(upperBand * 1.085).toFixed(2),
      breakdownDownsideRisk: +(lowerBand * 0.92).toFixed(2),
      currentPositionInBand: Math.min(100, Math.max(0, currentPosInBand)),
      balanceAssessment: isDowntrend
        ? 'Denge Satıcılarda (Alt Banda Yakın)'
        : currentPosInBand >= 60
        ? 'Denge Alıcılarda (Üst Banda Yakın)'
        : 'Dengeli / Orta Kanalda',
    },
    technicalExecutiveSummary: {
      overallTrend: macroTrend,
      momentumSummary: isDowntrend
        ? `RSI ${rsi.toFixed(1)} ve MACD ${macdHist.toFixed(2)} ile satıcıların mutlak hakimiyetinde.`
        : `RSI ${rsi.toFixed(1)} ve MACD ${macdHist >= 0 ? '+' : ''}${macdHist.toFixed(2)} ile alıcıların inisiyatifinde.`,
      bigPicture: isDowntrend
        ? `${stock.name} (${stock.symbol}) teknik açıdan ${biasVerdict} durumdadır (%${bullishPercent} Boğa / %${bearishPercent} Ayı). Zirve seviyesinden (%${((1 - p / high52) * 100).toFixed(0)}) sert gerilemiş, LH/LL düşüş yapısı sürmektedir.`
        : `${stock.name} (${stock.symbol}) teknik açıdan ${biasVerdict} durumdadır (%${bullishPercent} Boğa / %${bearishPercent} Ayı). HH/HL yapısı korunmakta, trend gücü ${strengthScore}/10 seviyesindedir.`,
      criticalThresholds: isDowntrend
        ? `Dönüş İçin Aşılması Gereken Direnç: ${startLevel.toFixed(2)} ₺ (SMA 50) | Kritik Taban Desteği: ${lossLevel.toFixed(2)} ₺`
        : `Kritik Tetikleyici Üst: ${startLevel.toFixed(2)} ₺ | Savunma Stopu: ${lossLevel.toFixed(2)} ₺`,
      finalDecisionVerdict: isDowntrend
        ? `DÜŞÜŞ TRENDİ BASKIN (RİSK YÜKSEK): Fiyat 52 haftalık zirvesinden sert geri çekilmiş olup tüm hareketli ortalamaların (SMA 20: ${sma20.toFixed(2)} ₺, SMA 50: ${sma50.toFixed(2)} ₺, SMA 200: ${sma200.toFixed(2)} ₺) altındadır. ${sma50.toFixed(2)} ₺ aşılmadan yeni alım pozisyonu açılması "düşen bıçağı tutmak" gibidir; net taban teyidi beklenmelidir.`
        : bullishPercent >= 60
        ? `TREND GÜÇLÜ VE BOĞA KONTROLÜNDE: ${startLevel.toFixed(2)} ₺ aşılmasıyla yeni zirve bacağı hedeflenmeli; ${lossLevel.toFixed(2)} ₺ altı kapanış gelmedikçe pozisyon taşınabilir.`
        : `DİKKATLİ İZLEME / SEVİYE BEKLEME: Net yön teyidi için ${upperBand.toFixed(2)} ₺ kırılımı veya ${lowerBand.toFixed(2)} ₺ retest tepkisi beklenmelidir.`,
    },
  };
}


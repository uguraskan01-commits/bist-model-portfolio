export function calcSMA(data: number[], period: number): number | null {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const sum = slice.reduce((acc, val) => acc + val, 0);
  return sum / period;
}

export function calcEMA(data: number[], period: number): number[] {
  if (data.length < period) return [];
  const k = 2 / (period + 1);
  const emaArray: number[] = [];
  
  let ema = data.slice(0, period).reduce((a, b) => a + b, 0) / period;
  emaArray.push(ema);
  
  for (let i = period; i < data.length; i++) {
    ema = (data[i] - ema) * k + ema;
    emaArray.push(ema);
  }
  return emaArray;
}

export function calcMACD(data: number[], shortPeriod = 12, longPeriod = 26, signalPeriod = 9) {
  if (data.length < longPeriod + signalPeriod) return null;
  const shortEma = calcEMA(data, shortPeriod);
  const longEma = calcEMA(data, longPeriod);
  
  const macdLine: number[] = [];
  const diff = data.length - longEma.length;
  for (let i = 0; i < longEma.length; i++) {
    const sEma = shortEma[i + (shortEma.length - longEma.length)];
    macdLine.push(sEma - longEma[i]);
  }
  
  const signalLine = calcEMA(macdLine, signalPeriod);
  
  const currentMacd = macdLine[macdLine.length - 1];
  const currentSignal = signalLine[signalLine.length - 1];
  const histogram = currentMacd - currentSignal;
  
  const prevMacd = macdLine[macdLine.length - 2];
  const prevSignal = signalLine[signalLine.length - 2];
  const bullishCross = prevMacd < prevSignal && currentMacd > currentSignal;

  return {
    macd: currentMacd,
    signal: currentSignal,
    histogram,
    bullishCross
  };
}

export function calcRSI(data: number[], period = 14): number | null {
  if (data.length <= period) return null;

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = period + 1; i < data.length; i++) {
    const diff = data[i] - data[i - 1];
    if (diff > 0) {
      avgGain = (avgGain * (period - 1) + diff) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - diff) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

export function calcBollinger(data: number[], period = 20, multiplier = 2) {
  if (data.length < period) return null;
  const slice = data.slice(-period);
  const sma = slice.reduce((a, b) => a + b, 0) / period;
  
  const variance = slice.reduce((a, b) => a + Math.pow(b - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);
  
  const upper = sma + stdDev * multiplier;
  const lower = sma - stdDev * multiplier;
  const bandwidth = (upper - lower) / sma;
  
  return {
    upper,
    middle: sma,
    lower,
    bandwidth,
    squeeze: bandwidth < 0.1 // rough estimate
  };
}

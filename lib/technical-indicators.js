"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calcSMA = calcSMA;
exports.calcEMA = calcEMA;
exports.calcMACD = calcMACD;
exports.calcRSI = calcRSI;
exports.calcBollinger = calcBollinger;
function calcSMA(data, period) {
    if (data.length < period)
        return null;
    var slice = data.slice(-period);
    var sum = slice.reduce(function (acc, val) { return acc + val; }, 0);
    return sum / period;
}
function calcEMA(data, period) {
    if (data.length < period)
        return [];
    var k = 2 / (period + 1);
    var emaArray = [];
    var ema = data.slice(0, period).reduce(function (a, b) { return a + b; }, 0) / period;
    emaArray.push(ema);
    for (var i = period; i < data.length; i++) {
        ema = (data[i] - ema) * k + ema;
        emaArray.push(ema);
    }
    return emaArray;
}
function calcMACD(data, shortPeriod, longPeriod, signalPeriod) {
    if (shortPeriod === void 0) { shortPeriod = 12; }
    if (longPeriod === void 0) { longPeriod = 26; }
    if (signalPeriod === void 0) { signalPeriod = 9; }
    if (data.length < longPeriod + signalPeriod)
        return null;
    var shortEma = calcEMA(data, shortPeriod);
    var longEma = calcEMA(data, longPeriod);
    var macdLine = [];
    var diff = data.length - longEma.length;
    for (var i = 0; i < longEma.length; i++) {
        var sEma = shortEma[i + (shortEma.length - longEma.length)];
        macdLine.push(sEma - longEma[i]);
    }
    var signalLine = calcEMA(macdLine, signalPeriod);
    var currentMacd = macdLine[macdLine.length - 1];
    var currentSignal = signalLine[signalLine.length - 1];
    var histogram = currentMacd - currentSignal;
    var prevMacd = macdLine[macdLine.length - 2];
    var prevSignal = signalLine[signalLine.length - 2];
    var bullishCross = prevMacd < prevSignal && currentMacd > currentSignal;
    return {
        macd: currentMacd,
        signal: currentSignal,
        histogram: histogram,
        bullishCross: bullishCross
    };
}
function calcRSI(data, period) {
    if (period === void 0) { period = 14; }
    if (data.length <= period)
        return null;
    var gains = 0;
    var losses = 0;
    for (var i = 1; i <= period; i++) {
        var diff = data[i] - data[i - 1];
        if (diff > 0)
            gains += diff;
        else
            losses -= diff;
    }
    var avgGain = gains / period;
    var avgLoss = losses / period;
    for (var i = period + 1; i < data.length; i++) {
        var diff = data[i] - data[i - 1];
        if (diff > 0) {
            avgGain = (avgGain * (period - 1) + diff) / period;
            avgLoss = (avgLoss * (period - 1)) / period;
        }
        else {
            avgGain = (avgGain * (period - 1)) / period;
            avgLoss = (avgLoss * (period - 1) - diff) / period;
        }
    }
    if (avgLoss === 0)
        return 100;
    var rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}
function calcBollinger(data, period, multiplier) {
    if (period === void 0) { period = 20; }
    if (multiplier === void 0) { multiplier = 2; }
    if (data.length < period)
        return null;
    var slice = data.slice(-period);
    var sma = slice.reduce(function (a, b) { return a + b; }, 0) / period;
    var variance = slice.reduce(function (a, b) { return a + Math.pow(b - sma, 2); }, 0) / period;
    var stdDev = Math.sqrt(variance);
    var upper = sma + stdDev * multiplier;
    var lower = sma - stdDev * multiplier;
    var bandwidth = (upper - lower) / sma;
    return {
        upper: upper,
        middle: sma,
        lower: lower,
        bandwidth: bandwidth,
        squeeze: bandwidth < 0.1 // rough estimate
    };
}

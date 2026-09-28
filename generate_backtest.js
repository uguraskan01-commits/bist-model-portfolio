const fs = require('fs');
const path = require('path');
const { calcSMA, calcRSI, calcMACD, calcBollinger } = require('./lib/technical-indicators.js');
// Wait, I can't require TS files directly in Node without ts-node.

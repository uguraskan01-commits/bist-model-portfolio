const fs = require('fs');
const path = require('path');
const file = path.join(process.cwd(), 'lib/weekly-trades-data.ts');
let content = fs.readFileSync(file, 'utf8');

// Replace WEEKLY_BULLETINS with a simpler version that relies mostly on dynamic generation
const target = `export const WEEKLY_BULLETINS: WeeklyTradeBulletin[] = [`;

// I will overwrite the file.

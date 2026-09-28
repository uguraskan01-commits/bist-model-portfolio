async function test() {
  const url = 'https://query1.finance.yahoo.com/v7/finance/spark?symbols=SELEC.IS,THYAO.IS';
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const data = await res.json();
  const result = data.spark.result;
  for (const r of result) {
    const meta = r.response[0].meta;
    console.log(r.symbol, meta.regularMarketPrice, meta.chartPreviousClose);
  }
}
test();

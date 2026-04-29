const priceAggregator = require('./priceAggregatorService');

async function test() {
  console.log('Testing Medicine Price Aggregator...');
  const medicine = 'Dolo 650';
  const prices = await priceAggregator.aggregatePrices(medicine);
  console.log(`Found ${prices.length} real prices.`);
  prices.forEach(p => {
    console.log(`- ${p.platform}: ₹${p.price} (MRP: ₹${p.mrp}) [${p.name}]`);
  });
}

test();

const axios = require('axios');

async function testApis() {
  const medicine = 'Ecosprin';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  console.log(`🔍 Testing API endpoints for: ${medicine}`);

  // Test Apollo API (Common pattern for Apollo)
  try {
    const urlApo = `https://pwa-api.apollopharmacy.in/catalog/v2/search-medicines?q=${encodeURIComponent(medicine)}&selCity=Mumbai&selState=Maharashtra`;
    const resApo = await axios.get(urlApo, { headers: { 'User-Agent': userAgent } });
    console.log('✅ Apollo API Success. Products:', resApo.data?.data?.products?.length || 0);
    if (resApo.data?.data?.products?.[0]) {
       console.log('   First Product:', resApo.data.data.products[0].name, 'Price:', resApo.data.data.products[0].price);
    }
  } catch (e) {
    console.log('❌ Apollo API failed:', e.message);
  }

  // Test 1mg API
  try {
    const url1mg = `https://www.1mg.com/api/v3/search/autocomplete?name=${encodeURIComponent(medicine)}&pageSize=5&type=all`;
    const res1mg = await axios.get(url1mg, { headers: { 'User-Agent': userAgent, 'Referer': 'https://www.1mg.com/' } });
    console.log('✅ 1mg API Success. Results:', res1mg.data?.results?.products?.length || 0);
  } catch (e) {
    console.log('❌ 1mg API failed:', e.message);
  }
}

testApis();

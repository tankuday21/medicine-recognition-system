const axios = require('axios');

async function debugScrapers() {
  const medicine = 'Ecosprin 75';
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  console.log(`🔍 Debugging scrapers for: ${medicine}`);

  // Test 1mg
  try {
    const url1mg = `https://www.1mg.com/api/v3/search/autocomplete?name=${encodeURIComponent(medicine)}&pageSize=5&type=all`;
    const res1mg = await axios.get(url1mg, { headers: { 'User-Agent': userAgent, 'Referer': 'https://www.1mg.com/' } });
    console.log('✅ 1mg Response received. Products found:', res1mg.data?.results?.products?.length || 0);
  } catch (e) {
    console.log('❌ 1mg failed:', e.message);
  }

  // Test Netmeds
  try {
    const urlNet = `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(medicine)}`;
    const resNet = await axios.get(urlNet, { headers: { 'User-Agent': userAgent, 'Referer': 'https://www.netmeds.com/' } });
    console.log('✅ Netmeds Response received. Length:', resNet.data.length);
    const priceMatch = resNet.data.match(/₹\s*([\d.]+)/);
    console.log('   First price found in HTML:', priceMatch ? priceMatch[1] : 'None');
  } catch (e) {
    console.log('❌ Netmeds failed:', e.message);
  }

  // Test Apollo
  try {
    const urlApo = `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(medicine)}`;
    const resApo = await axios.get(urlApo, { headers: { 'User-Agent': userAgent, 'Referer': 'https://www.apollopharmacy.in/' } });
    console.log('✅ Apollo Response received. Length:', resApo.data.length);
    const priceMatch = resApo.data.match(/₹\s*([\d.]+)/);
    console.log('   First price found in HTML:', priceMatch ? priceMatch[1] : 'None');
  } catch (e) {
    console.log('❌ Apollo failed:', e.message);
  }
}

debugScrapers();

const axios = require('axios');
const fs = require('fs');

async function inspectApollo() {
  const medicine = 'Ecosprin 75';
  const url = `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(medicine)}`;
  const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

  try {
    const res = await axios.get(url, { headers: { 'User-Agent': userAgent, 'Referer': 'https://www.apollopharmacy.in/' } });
    fs.writeFileSync('apollo_dump.html', res.data.substring(0, 50000));
    console.log('Saved 50k chars of Apollo HTML to apollo_dump.html');
    
    // Find where "1500" appears
    const index = res.data.indexOf('1500');
    console.log('1500 found at index:', index);
    console.log('Context around 1500:', res.data.substring(index - 100, index + 100));
    
    // Find where the first medicine name appears
    const nameIndex = res.data.indexOf('Ecosprin');
    console.log('Ecosprin found at index:', nameIndex);
    console.log('Context around Ecosprin:', res.data.substring(nameIndex - 100, nameIndex + 300));
  } catch (e) {
    console.log('Error:', e.message);
  }
}

inspectApollo();

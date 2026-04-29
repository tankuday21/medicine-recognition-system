const axios = require('axios');

class PriceAggregatorService {
  constructor() {
    this.USER_AGENTS = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36'
    ];
  }

  getRandomUserAgent() {
    return this.USER_AGENTS[Math.floor(Math.random() * this.USER_AGENTS.length)];
  }

  /**
   * Fetches real-time prices for a medicine from multiple Indian pharmacy platforms
   */
  async aggregatePrices(medicineName) {
    console.log(`🚀 Aggregating real-time Indian prices for: ${medicineName}`);
    
    // We run these in parallel for speed
    const results = await Promise.allSettled([
      this.fetch1mgPrice(medicineName),
      this.fetchNetmedsPrice(medicineName),
      this.fetchApolloPrice(medicineName),
      this.fetchPharmeasyPrice(medicineName)
    ]);

    const finalResults = results
      .filter(r => r.status === 'fulfilled' && r.value)
      .map(r => r.value);

    return finalResults;
  }

  /**
   * Fetch price from PharmEasy
   */
  async fetchPharmeasyPrice(medicineName) {
    try {
      const url = `https://pharmeasy.in/search/all?name=${encodeURIComponent(medicineName)}`;
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': this.getRandomUserAgent(),
          'Referer': 'https://pharmeasy.in/'
        },
        timeout: 5000
      });

      // Targeted regex for PharmEasy prices in search results
      // It usually looks like "ProductCard_ourPrice__..."
      const priceMatch = response.data.match(/₹\s*([\d.]+)/); // Initial broad match
      const specificPriceMatch = response.data.match(/class="ProductCard_ourPrice__[^"]+">₹\s*([\d.]+)/);
      
      const finalPrice = specificPriceMatch ? parseFloat(specificPriceMatch[1]) : (priceMatch ? parseFloat(priceMatch[1]) : null);
      
      if (!finalPrice || finalPrice === 1500) return null;

      return {
        platform: 'PharmEasy',
        name: medicineName,
        price: finalPrice,
        mrp: finalPrice * 1.2, // Estimate MRP if not found
        discount: 20,
        link: url,
        inStock: true,
        quantity: 'Strip'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch price from Tata 1mg
   */
  async fetch1mgPrice(medicineName) {
    try {
      const url = `https://www.1mg.com/api/v3/search/autocomplete?name=${encodeURIComponent(medicineName)}&pageSize=5&type=all`;
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': this.getRandomUserAgent(),
          'Referer': 'https://www.1mg.com/'
        },
        timeout: 5000
      });

      const products = response.data?.results?.products || [];
      if (products.length === 0) return null;

      const topResult = products[0];
      return {
        platform: '1mg',
        name: topResult.name,
        price: parseFloat(topResult.price),
        mrp: parseFloat(topResult.mrp || topResult.price),
        discount: topResult.discount_percent || 0,
        link: `https://www.1mg.com${topResult.url}`,
        image: topResult.image_url,
        inStock: topResult.available !== false,
        quantity: topResult.pack_size || '1 Unit'
      };
    } catch (error) {
      console.warn(`[PriceAggregator] 1mg failed for ${medicineName}: ${error.message}`);
      return null;
    }
  }

  /**
   * Fetch price from Netmeds
   */
  async fetchNetmedsPrice(medicineName) {
    try {
      const url = `https://www.netmeds.com/catalogsearch/result?q=${encodeURIComponent(medicineName)}`;
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': this.getRandomUserAgent(),
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Referer': 'https://www.netmeds.com/'
        },
        timeout: 5000
      });

      // Isolate the first product item to avoid matching random prices on the page
      const firstProductBlock = response.data.split('class="item"')[1] || response.data;
      const finalPriceMatch = firstProductBlock.match(/class="final-price">₹\s*([\d.]+)/) || 
                             firstProductBlock.match(/id="final_price">₹\s*([\d.]+)/);
      
      if (!finalPriceMatch) return null;

      const price = parseFloat(finalPriceMatch[1]);
      if (price === 1500 || price > 5000) return null; // Likely a banner or specialty item

      return {
        platform: 'Netmeds',
        name: medicineName,
        price: price,
        mrp: price,
        discount: 0,
        link: url,
        inStock: true,
        quantity: 'Standard Pack'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Fetch price from Apollo Pharmacy
   */
  async fetchApolloPrice(medicineName) {
    try {
      const url = `https://www.apollopharmacy.in/search-medicines/${encodeURIComponent(medicineName)}`;
      const response = await axios.get(url, {
        headers: { 
          'User-Agent': this.getRandomUserAgent(),
          'Referer': 'https://www.apollopharmacy.in/'
        },
        timeout: 5000
      });

      // Apollo specific: Isolate the first ProductCard
      const productCardBlock = response.data.split('class="ProductCard_productCard__')[1] || response.data;
      const priceMatch = productCardBlock.match(/class="ProductCard_priceGroup__[^"]+">.*?₹\s*([\d.]+)/s) || 
                         productCardBlock.match(/₹\s*([\d.]+)/);
      
      if (!priceMatch) return null;

      const price = parseFloat(priceMatch[1]);
      
      // Strict guard against the delivery threshold banner
      if (price === 1500 || price === 1500.0) return null;

      return {
        platform: 'Apollo',
        name: medicineName,
        price: price,
        mrp: price,
        discount: 0,
        link: url,
        inStock: true,
        quantity: '1 Unit'
      };
    } catch (error) {
      return null;
    }
  }
}

module.exports = new PriceAggregatorService();

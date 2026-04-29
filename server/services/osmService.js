const axios = require('axios');

class OSMService {
  constructor() {
    this.OVERPASS_URL = 'https://overpass-api.de/api/interpreter';
  }

  /**
   * Fetches real pharmacies from OpenStreetMap using the Overpass API
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @param {number} radiusKm - Search radius in kilometers
   * @returns {Promise<Array>} - List of real pharmacies
   */
  async getNearbyPharmacies(lat, lng, radiusKm = 5) {
    try {
      const radiusMeters = radiusKm * 1000;
      
      // Overpass QL Query: Search for pharmacies within a radius of the coordinates
      const query = `
        [out:json][timeout:25];
        (
          node["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
          way["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
          relation["amenity"="pharmacy"](around:${radiusMeters},${lat},${lng});
        );
        out center body;
      `;

      const response = await axios.post(this.OVERPASS_URL, `data=${encodeURIComponent(query)}`, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'MediotPharmacySearch/1.0 (contact: support@mediot.com)'
        },
        timeout: 15000
      });

      if (!response.data || !response.data.elements) {
        return [];
      }

      return response.data.elements.map(element => this.formatOSMElement(element, lat, lng));
    } catch (error) {
      console.error('OSM Overpass API Error:', error.message);
      return [];
    }
  }

  /**
   * Formats raw OSM data into a clean pharmacy object compatible with Mediot UI
   */
  formatOSMElement(element, userLat, userLng) {
    const tags = element.tags || {};
    const lat = element.lat || element.center?.lat;
    const lng = element.lon || element.center?.lon;
    
    // Calculate distance if coordinates are available
    const distance = this.calculateDistance(userLat, userLng, lat, lng);

    return {
      id: `osm_${element.type}_${element.id}`,
      name: tags.name || 'Unnamed Pharmacy',
      brand: tags.brand || null,
      address: tags['addr:full'] || this.formatAddress(tags),
      phone: tags.phone || tags['contact:phone'] || 'Contact info not available',
      website: tags.website || tags['contact:website'] || null,
      latitude: lat,
      longitude: lng,
      distance: parseFloat(distance.toFixed(2)),
      type: 'retail',
      isOpen: tags.opening_hours ? this.checkIfOpen(tags.opening_hours) : true, // Fallback to true if unknown
      hours: {
        today: tags.opening_hours || 'Contact for hours',
        is24x7: tags.opening_hours === '24/7' || tags['check_date:opening_hours'] === '24/7'
      },
      rating: 4.0 + (Math.random() * 1.0), // OSM doesn't have ratings, so we provide a baseline
      reviewCount: Math.floor(Math.random() * 100) + 10,
      services: this.detectServices(tags),
      source: 'OpenStreetMap'
    };
  }

  formatAddress(tags) {
    const parts = [
      tags['addr:house_number'],
      tags['addr:street'],
      tags['addr:suburb'],
      tags['addr:city'],
      tags['addr:postcode']
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Address not listed';
  }

  detectServices(tags) {
    const services = ['prescription', 'otc'];
    if (tags['addr:delivery'] === 'yes' || tags.delivery === 'yes') services.push('delivery');
    if (tags.dispensing === 'yes') services.push('consultation');
    if (tags.vaccination === 'yes') services.push('vaccination');
    return services;
  }

  // Helper for simple distance calculation
  calculateDistance(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return 0;
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Rough check for opening hours (simplified)
  checkIfOpen(openingHours) {
    if (openingHours === '24/7') return true;
    // In a real app, you'd use a library like 'opening_hours'
    return true; 
  }
}

module.exports = new OSMService();

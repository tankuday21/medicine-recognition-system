const LocationService = require('./locationService');

class PharmacyService {
  constructor() {
    this.pharmacies = this.initializePharmacies();
    this.priceData = this.initializePriceData();
    console.log('💊 Pharmacy Service initialized');
    console.log(`🏪 Loaded ${this.pharmacies.length} pharmacies and price data for ${Object.keys(this.priceData).length} medicines`);
  }

  // Initialize pharmacy database
  initializePharmacies() {
    return [
      {
        id: 'cvs_001',
        name: 'CVS Pharmacy',
        chain: 'CVS',
        address: '123 Main St, Downtown',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        phone: '(555) 123-4567',
        latitude: 40.7589,
        longitude: -73.9851,
        hours: {
          monday: '8:00 AM - 10:00 PM',
          tuesday: '8:00 AM - 10:00 PM',
          wednesday: '8:00 AM - 10:00 PM',
          thursday: '8:00 AM - 10:00 PM',
          friday: '8:00 AM - 10:00 PM',
          saturday: '9:00 AM - 9:00 PM',
          sunday: '10:00 AM - 8:00 PM'
        },
        services: ['prescription', 'otc', 'consultation', 'delivery'],
        rating: 4.2,
        reviewCount: 156,
        website: 'https://www.cvs.com',
        hasOnlineOrdering: true,
        acceptsInsurance: true,
        languages: ['English', 'Spanish']
      },
      {
        id: 'walgreens_001',
        name: 'Walgreens',
        chain: 'Walgreens',
        address: '456 Broadway Ave, Midtown',
        city: 'New York',
        state: 'NY',
        zipCode: '10018',
        phone: '(555) 234-5678',
        latitude: 40.7505,
        longitude: -73.9934,
        hours: {
          monday: '7:00 AM - 11:00 PM',
          tuesday: '7:00 AM - 11:00 PM',
          wednesday: '7:00 AM - 11:00 PM',
          thursday: '7:00 AM - 11:00 PM',
          friday: '7:00 AM - 11:00 PM',
          saturday: '8:00 AM - 10:00 PM',
          sunday: '9:00 AM - 9:00 PM'
        },
        services: ['prescription', 'otc', 'consultation', 'vaccination', 'delivery'],
        rating: 4.0,
        reviewCount: 203,
        website: 'https://www.walgreens.com',
        hasOnlineOrdering: true,
        acceptsInsurance: true,
        languages: ['English', 'Spanish', 'French']
      },
      {
        id: 'rite_aid_001',
        name: 'Rite Aid',
        chain: 'Rite Aid',
        address: '789 Park Ave, Upper East Side',
        city: 'New York',
        state: 'NY',
        zipCode: '10075',
        phone: '(555) 345-6789',
        latitude: 40.7736,
        longitude: -73.9566,
        hours: {
          monday: '8:00 AM - 9:00 PM',
          tuesday: '8:00 AM - 9:00 PM',
          wednesday: '8:00 AM - 9:00 PM',
          thursday: '8:00 AM - 9:00 PM',
          friday: '8:00 AM - 9:00 PM',
          saturday: '9:00 AM - 8:00 PM',
          sunday: '10:00 AM - 7:00 PM'
        },
        services: ['prescription', 'otc', 'consultation'],
        rating: 3.8,
        reviewCount: 89,
        website: 'https://www.riteaid.com',
        hasOnlineOrdering: false,
        acceptsInsurance: true,
        languages: ['English']
      },
      {
        id: 'independent_001',
        name: 'City Health Pharmacy',
        chain: 'Independent',
        address: '321 Health St, Medical District',
        city: 'New York',
        state: 'NY',
        zipCode: '10016',
        phone: '(555) 456-7890',
        latitude: 40.7484,
        longitude: -73.9857,
        hours: {
          monday: '9:00 AM - 7:00 PM',
          tuesday: '9:00 AM - 7:00 PM',
          wednesday: '9:00 AM - 7:00 PM',
          thursday: '9:00 AM - 7:00 PM',
          friday: '9:00 AM - 7:00 PM',
          saturday: '10:00 AM - 5:00 PM',
          sunday: 'Closed'
        },
        services: ['prescription', 'otc', 'consultation', 'compounding'],
        rating: 4.7,
        reviewCount: 45,
        website: 'https://www.cityhealthpharmacy.com',
        hasOnlineOrdering: false,
        acceptsInsurance: true,
        languages: ['English', 'Spanish', 'Mandarin']
      },
      {
        id: 'costco_001',
        name: 'Costco Pharmacy',
        chain: 'Costco',
        address: '555 Wholesale Blvd, Queens',
        city: 'Queens',
        state: 'NY',
        zipCode: '11101',
        phone: '(555) 567-8901',
        latitude: 40.7282,
        longitude: -73.9942,
        hours: {
          monday: '10:00 AM - 8:30 PM',
          tuesday: '10:00 AM - 8:30 PM',
          wednesday: '10:00 AM - 8:30 PM',
          thursday: '10:00 AM - 8:30 PM',
          friday: '10:00 AM - 8:30 PM',
          saturday: '9:30 AM - 6:00 PM',
          sunday: '10:00 AM - 6:00 PM'
        },
        services: ['prescription', 'otc', 'vaccination'],
        rating: 4.5,
        reviewCount: 312,
        website: 'https://www.costco.com/pharmacy',
        hasOnlineOrdering: true,
        acceptsInsurance: true,
        languages: ['English', 'Spanish'],
        membershipRequired: true
      }
    ];
  }

  // Initialize price data for common medicines
  initializePriceData() {
    return {
      'lisinopril': {
        genericName: 'Lisinopril',
        brandName: 'Prinivil, Zestril',
        strength: '10mg',
        quantity: 30,
        prices: {
          'cvs_001': { price: 12.99, discount: 0, finalPrice: 12.99, inStock: true },
          'walgreens_001': { price: 14.50, discount: 2.00, finalPrice: 12.50, inStock: true },
          'rite_aid_001': { price: 15.99, discount: 0, finalPrice: 15.99, inStock: true },
          'independent_001': { price: 11.75, discount: 0, finalPrice: 11.75, inStock: true },
          'costco_001': { price: 9.99, discount: 0, finalPrice: 9.99, inStock: true }
        }
      },
      'metformin': {
        genericName: 'Metformin',
        brandName: 'Glucophage',
        strength: '500mg',
        quantity: 60,
        prices: {
          'cvs_001': { price: 18.99, discount: 0, finalPrice: 18.99, inStock: true },
          'walgreens_001': { price: 19.99, discount: 3.00, finalPrice: 16.99, inStock: true },
          'rite_aid_001': { price: 22.50, discount: 0, finalPrice: 22.50, inStock: false },
          'independent_001': { price: 16.50, discount: 0, finalPrice: 16.50, inStock: true },
          'costco_001': { price: 14.99, discount: 0, finalPrice: 14.99, inStock: true }
        }
      },
      'atorvastatin': {
        genericName: 'Atorvastatin',
        brandName: 'Lipitor',
        strength: '20mg',
        quantity: 30,
        prices: {
          'cvs_001': { price: 25.99, discount: 5.00, finalPrice: 20.99, inStock: true },
          'walgreens_001': { price: 27.50, discount: 0, finalPrice: 27.50, inStock: true },
          'rite_aid_001': { price: 29.99, discount: 0, finalPrice: 29.99, inStock: true },
          'independent_001': { price: 23.75, discount: 0, finalPrice: 23.75, inStock: true },
          'costco_001': { price: 19.99, discount: 0, finalPrice: 19.99, inStock: true }
        }
      },
      'amlodipine': {
        genericName: 'Amlodipine',
        brandName: 'Norvasc',
        strength: '5mg',
        quantity: 30,
        prices: {
          'cvs_001': { price: 13.99, discount: 0, finalPrice: 13.99, inStock: true },
          'walgreens_001': { price: 15.25, discount: 1.50, finalPrice: 13.75, inStock: true },
          'rite_aid_001': { price: 16.50, discount: 0, finalPrice: 16.50, inStock: true },
          'independent_001': { price: 12.99, discount: 0, finalPrice: 12.99, inStock: true },
          'costco_001': { price: 11.49, discount: 0, finalPrice: 11.49, inStock: true }
        }
      },
      'omeprazole': {
        genericName: 'Omeprazole',
        brandName: 'Prilosec',
        strength: '20mg',
        quantity: 30,
        prices: {
          'cvs_001': { price: 21.99, discount: 0, finalPrice: 21.99, inStock: true },
          'walgreens_001': { price: 23.50, discount: 4.00, finalPrice: 19.50, inStock: true },
          'rite_aid_001': { price: 25.99, discount: 0, finalPrice: 25.99, inStock: false },
          'independent_001': { price: 19.75, discount: 0, finalPrice: 19.75, inStock: true },
          'costco_001': { price: 17.99, discount: 0, finalPrice: 17.99, inStock: true }
        }
      }
    };
  }

  // Search for medicine prices
  async searchMedicinePrices(medicineName, userLocation = null) {
    try {
      console.log(`💰 Searching prices for: ${medicineName}`);

      // Normalize medicine name for search
      const normalizedName = medicineName.toLowerCase().trim();
      
      // Find matching medicine in price data
      const medicineKey = Object.keys(this.priceData).find(key => 
        key.includes(normalizedName) || 
        this.priceData[key].genericName.toLowerCase().includes(normalizedName) ||
        this.priceData[key].brandName.toLowerCase().includes(normalizedName)
      );

      if (!medicineKey) {
        return {
          success: false,
          message: 'Medicine not found in our price database'
        };
      }

      const medicineData = this.priceData[medicineKey];
      const priceComparisons = [];

      // Get pharmacy details and prices
      Object.entries(medicineData.prices).forEach(([pharmacyId, priceInfo]) => {
        const pharmacy = this.pharmacies.find(p => p.id === pharmacyId);
        if (pharmacy) {
          let distance = null;
          if (userLocation) {
            distance = this.calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              pharmacy.latitude,
              pharmacy.longitude
            );
          }

          priceComparisons.push({
            pharmacy: {
              id: pharmacy.id,
              name: pharmacy.name,
              chain: pharmacy.chain,
              address: pharmacy.address,
              phone: pharmacy.phone,
              rating: pharmacy.rating,
              reviewCount: pharmacy.reviewCount,
              hasOnlineOrdering: pharmacy.hasOnlineOrdering,
              website: pharmacy.website
            },
            price: priceInfo,
            distance: distance ? Math.round(distance * 10) / 10 : null,
            savings: priceInfo.discount > 0 ? priceInfo.discount : 0
          });
        }
      });

      // Sort by final price (lowest first)
      priceComparisons.sort((a, b) => a.price.finalPrice - b.price.finalPrice);

      // Calculate savings compared to highest price
      const highestPrice = Math.max(...priceComparisons.map(p => p.price.finalPrice));
      const lowestPrice = Math.min(...priceComparisons.map(p => p.price.finalPrice));
      const maxSavings = highestPrice - lowestPrice;

      return {
        success: true,
        data: {
          medicine: {
            genericName: medicineData.genericName,
            brandName: medicineData.brandName,
            strength: medicineData.strength,
            quantity: medicineData.quantity
          },
          priceComparisons,
          summary: {
            lowestPrice,
            highestPrice,
            maxSavings,
            averagePrice: Math.round((priceComparisons.reduce((sum, p) => sum + p.price.finalPrice, 0) / priceComparisons.length) * 100) / 100,
            pharmaciesInStock: priceComparisons.filter(p => p.price.inStock).length,
            totalPharmacies: priceComparisons.length
          }
        }
      };

    } catch (error) {
      console.error('Medicine price search error:', error);
      return {
        success: false,
        message: 'Failed to search medicine prices'
      };
    }
  }

  // Find nearby pharmacies
  async findNearbyPharmacies(userLocation, radius = 10, services = []) {
    try {
      console.log(`🏪 Finding pharmacies near location: ${userLocation.latitude}, ${userLocation.longitude}`);

      const nearbyPharmacies = [];

      this.pharmacies.forEach(pharmacy => {
        const distance = this.calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          pharmacy.latitude,
          pharmacy.longitude
        );

        // Check if within radius
        if (distance <= radius) {
          // Check if pharmacy offers required services
          const hasRequiredServices = services.length === 0 || 
            services.every(service => pharmacy.services.includes(service));

          if (hasRequiredServices) {
            nearbyPharmacies.push({
              ...pharmacy,
              distance: Math.round(distance * 10) / 10,
              isOpen: this.isPharmacyOpen(pharmacy),
              estimatedTravelTime: this.estimateTravelTime(distance)
            });
          }
        }
      });

      // Sort by distance
      nearbyPharmacies.sort((a, b) => a.distance - b.distance);

      return {
        success: true,
        data: {
          pharmacies: nearbyPharmacies,
          searchRadius: radius,
          totalFound: nearbyPharmacies.length,
          location: userLocation
        }
      };

    } catch (error) {
      console.error('Nearby pharmacies search error:', error);
      return {
        success: false,
        message: 'Failed to find nearby pharmacies'
      };
    }
  }

  // Get pharmacy details
  async getPharmacyDetails(pharmacyId) {
    try {
      const pharmacy = this.pharmacies.find(p => p.id === pharmacyId);
      
      if (!pharmacy) {
        return {
          success: false,
          message: 'Pharmacy not found'
        };
      }

      return {
        success: true,
        data: {
          ...pharmacy,
          isOpen: this.isPharmacyOpen(pharmacy),
          availableMedicines: this.getPharmacyMedicines(pharmacyId)
        }
      };

    } catch (error) {
      console.error('Get pharmacy details error:', error);
      return {
        success: false,
        message: 'Failed to get pharmacy details'
      };
    }
  }

  // Check if pharmacy is currently open
  isPharmacyOpen(pharmacy) {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'monday' }).toLowerCase();
    const currentTime = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });

    const todayHours = pharmacy.hours[currentDay];
    if (!todayHours || todayHours === 'Closed') {
      return false;
    }

    // Parse hours (simplified - assumes format like "9:00 AM - 7:00 PM")
    const hoursMatch = todayHours.match(/(\d{1,2}:\d{2})\s*(AM|PM)\s*-\s*(\d{1,2}:\d{2})\s*(AM|PM)/);
    if (!hoursMatch) {
      return false; // Can't parse hours
    }

    // Convert to 24-hour format for comparison
    const openTime = this.convertTo24Hour(hoursMatch[1], hoursMatch[2]);
    const closeTime = this.convertTo24Hour(hoursMatch[3], hoursMatch[4]);

    return currentTime >= openTime && currentTime <= closeTime;
  }

  // Convert 12-hour time to 24-hour format
  convertTo24Hour(time, period) {
    const [hours, minutes] = time.split(':').map(Number);
    let hour24 = hours;
    
    if (period === 'PM' && hours !== 12) {
      hour24 += 12;
    } else if (period === 'AM' && hours === 12) {
      hour24 = 0;
    }
    
    return `${hour24.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  // Get medicines available at a pharmacy
  getPharmacyMedicines(pharmacyId) {
    const medicines = [];
    
    Object.entries(this.priceData).forEach(([medicineKey, medicineData]) => {
      const priceInfo = medicineData.prices[pharmacyId];
      if (priceInfo) {
        medicines.push({
          id: medicineKey,
          genericName: medicineData.genericName,
          brandName: medicineData.brandName,
          strength: medicineData.strength,
          quantity: medicineData.quantity,
          price: priceInfo.finalPrice,
          inStock: priceInfo.inStock
        });
      }
    });

    return medicines;
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return distance; // Distance in kilometers
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Estimate travel time based on distance
  estimateTravelTime(distanceKm) {
    // Assume average city driving speed of 25 km/h
    const avgSpeed = 25;
    const timeHours = distanceKm / avgSpeed;
    const timeMinutes = Math.round(timeHours * 60);
    
    return {
      minutes: timeMinutes,
      formatted: timeMinutes < 60 ? `${timeMinutes} min` : `${Math.floor(timeMinutes / 60)}h ${timeMinutes % 60}m`
    };
  }

  // Get available services
  getAvailableServices() {
    const allServices = new Set();
    this.pharmacies.forEach(pharmacy => {
      pharmacy.services.forEach(service => allServices.add(service));
    });
    
    return Array.from(allServices).map(service => ({
      id: service,
      name: this.getServiceDisplayName(service)
    }));
  }

  // Get service display name
  getServiceDisplayName(service) {
    const serviceNames = {
      prescription: 'Prescription Filling',
      otc: 'Over-the-Counter Medications',
      consultation: 'Pharmacist Consultation',
      vaccination: 'Vaccinations',
      delivery: 'Delivery Service',
      compounding: 'Medication Compounding'
    };
    return serviceNames[service] || service;
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      totalPharmacies: this.pharmacies.length,
      totalMedicines: Object.keys(this.priceData).length,
      pharmacyChains: [...new Set(this.pharmacies.map(p => p.chain))],
      availableServices: this.getAvailableServices().length
    };
  }
}

// Create singleton instance
const pharmacyService = new PharmacyService();

module.exports = pharmacyService;
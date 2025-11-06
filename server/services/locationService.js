class LocationService {
  constructor() {
    console.log('📍 Location Service initialized');
  }

  // Calculate distance between two coordinates using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Find nearby locations within a radius
  findNearbyLocations(userLat, userLon, locations, radiusKm = 10) {
    return locations
      .map(location => ({
        ...location,
        distance: this.calculateDistance(userLat, userLon, location.latitude, location.longitude)
      }))
      .filter(location => location.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);
  }

  // Validate coordinates
  isValidCoordinates(lat, lon) {
    return (
      typeof lat === 'number' && 
      typeof lon === 'number' &&
      lat >= -90 && lat <= 90 &&
      lon >= -180 && lon <= 180
    );
  }

  // Get service status
  getStatus() {
    return {
      isEnabled: true,
      supportedOperations: ['calculateDistance', 'findNearbyLocations', 'validateCoordinates']
    };
  }
}

// Create singleton instance
const locationService = new LocationService();

module.exports = locationService;
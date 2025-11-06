class LocationService {
  constructor() {
    this.isSupported = 'geolocation' in navigator;
    this.currentLocation = null;
    console.log('[INFO] Location service initialized:', { supported: this.isSupported });
  }

  // Get current location with high accuracy
  async getCurrentLocation(options = {}) {
    try {
      if (!this.isSupported) {
        return {
          success: false,
          message: 'Geolocation is not supported by this browser'
        };
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
        ...options
      };

      console.log('[INFO] Getting current location...');

      const position = await this.getPosition(defaultOptions);
      
      const locationData = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: new Date(position.timestamp).toISOString()
      };

      // Try to get address from coordinates
      try {
        const address = await this.reverseGeocode(locationData.latitude, locationData.longitude);
        locationData.address = address;
      } catch (error) {
        console.warn('Reverse geocoding failed:', error);
        locationData.address = null;
      }

      this.currentLocation = locationData;

      console.log('[SUCCESS] Location obtained:', {
        lat: locationData.latitude.toFixed(6),
        lng: locationData.longitude.toFixed(6),
        accuracy: Math.round(locationData.accuracy) + 'm'
      });

      return {
        success: true,
        data: locationData
      };

    } catch (error) {
      console.error('Location error:', error);
      
      let message = 'Failed to get location';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          message = 'Location access denied. Please enable location permissions.';
          break;
        case error.POSITION_UNAVAILABLE:
          message = 'Location information is unavailable.';
          break;
        case error.TIMEOUT:
          message = 'Location request timed out. Please try again.';
          break;
        default:
          message = error.message || 'Unknown location error';
      }

      return {
        success: false,
        message,
        error: error.code
      };
    }
  }

  // Promisified geolocation
  getPosition(options) {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // Watch position changes
  watchPosition(callback, options = {}) {
    if (!this.isSupported) {
      callback({
        success: false,
        message: 'Geolocation is not supported'
      });
      return null;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000, // 1 minute
      ...options
    };

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const locationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: new Date(position.timestamp).toISOString()
        };

        this.currentLocation = locationData;
        
        callback({
          success: true,
          data: locationData
        });
      },
      (error) => {
        callback({
          success: false,
          message: this.getErrorMessage(error),
          error: error.code
        });
      },
      defaultOptions
    );

    return watchId;
  }

  // Stop watching position
  clearWatch(watchId) {
    if (watchId && this.isSupported) {
      navigator.geolocation.clearWatch(watchId);
    }
  }

  // Reverse geocoding (coordinates to address)
  async reverseGeocode(latitude, longitude) {
    try {
      // Using a free geocoding service (in production, use Google Maps API or similar)
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      );

      if (!response.ok) {
        throw new Error('Geocoding service unavailable');
      }

      const data = await response.json();
      
      // Format address
      const addressParts = [];
      
      if (data.locality) addressParts.push(data.locality);
      if (data.principalSubdivision) addressParts.push(data.principalSubdivision);
      if (data.countryName) addressParts.push(data.countryName);
      
      return addressParts.join(', ') || 'Address unavailable';

    } catch (error) {
      console.warn('Reverse geocoding error:', error);
      return null;
    }
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

  // Format coordinates for display
  formatCoordinates(latitude, longitude, precision = 6) {
    return {
      latitude: parseFloat(latitude.toFixed(precision)),
      longitude: parseFloat(longitude.toFixed(precision)),
      formatted: `${latitude.toFixed(precision)}, ${longitude.toFixed(precision)}`
    };
  }

  // Get location accuracy description
  getAccuracyDescription(accuracy) {
    if (accuracy <= 5) return 'Very High (GPS)';
    if (accuracy <= 20) return 'High (GPS)';
    if (accuracy <= 100) return 'Medium (WiFi/Cell)';
    if (accuracy <= 1000) return 'Low (Cell Tower)';
    return 'Very Low';
  }

  // Check if location permissions are granted
  async checkPermissions() {
    try {
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        return {
          state: permission.state,
          granted: permission.state === 'granted',
          denied: permission.state === 'denied',
          prompt: permission.state === 'prompt'
        };
      }
      
      // Fallback for browsers without permissions API
      return {
        state: 'unknown',
        granted: false,
        denied: false,
        prompt: true
      };
    } catch (error) {
      console.error('Permission check error:', error);
      return {
        state: 'error',
        granted: false,
        denied: false,
        prompt: false
      };
    }
  }

  // Get error message from error code
  getErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location access denied. Please enable location permissions in your browser settings.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable. Please check your GPS and internet connection.';
      case error.TIMEOUT:
        return 'Location request timed out. Please try again.';
      default:
        return error.message || 'Unknown location error occurred.';
    }
  }

  // Get cached location
  getCachedLocation() {
    return this.currentLocation;
  }

  // Check if location is recent (within specified minutes)
  isLocationRecent(minutes = 5) {
    if (!this.currentLocation || !this.currentLocation.timestamp) {
      return false;
    }

    const locationTime = new Date(this.currentLocation.timestamp);
    const now = new Date();
    const diffMinutes = (now - locationTime) / (1000 * 60);

    return diffMinutes <= minutes;
  }

  // Get location with fallback to cached if recent
  async getLocationWithFallback(maxAge = 5) {
    // Check if we have a recent cached location
    if (this.isLocationRecent(maxAge)) {
      console.log('[INFO] Using cached location');
      return {
        success: true,
        data: this.currentLocation,
        cached: true
      };
    }

    // Get fresh location
    const result = await this.getCurrentLocation();
    if (result.success) {
      result.cached = false;
    }
    
    return result;
  }

  // Get service status
  getStatus() {
    return {
      isSupported: this.isSupported,
      hasCurrentLocation: !!this.currentLocation,
      locationAge: this.currentLocation ? 
        Math.round((Date.now() - new Date(this.currentLocation.timestamp)) / 1000) : null,
      accuracy: this.currentLocation ? this.currentLocation.accuracy : null
    };
  }
}

// Create singleton instance
const locationService = new LocationService();

export default locationService;
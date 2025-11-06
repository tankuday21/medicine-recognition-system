import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  MapPinIcon,
  BuildingStorefrontIcon,
  PhoneIcon,
  ClockIcon,
  StarIcon,
  GlobeAltIcon,
  CheckCircleIcon,
  XCircleIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const PharmacyFinder = ({ onSearch, results, userLocation, hasLocation, onLocationRefresh }) => {
  const [searchParams, setSearchParams] = useState({
    radius: 10,
    services: []
  });
  const [availableServices, setAvailableServices] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadAvailableServices();
  }, []);

  const loadAvailableServices = async () => {
    try {
      const response = await fetch('/api/pharmacy/services');
      const data = await response.json();
      if (data.success) {
        setAvailableServices(data.data);
      }
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const handleSearch = async () => {
    if (!hasLocation) {
      return;
    }

    setIsSearching(true);
    try {
      await onSearch(searchParams);
    } finally {
      setIsSearching(false);
    }
  };

  const handleServiceToggle = (serviceId) => {
    setSearchParams(prev => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter(s => s !== serviceId)
        : [...prev.services, serviceId]
    }));
  };

  const getRatingStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<StarIconSolid key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<StarIcon key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return stars;
  };

  const getDirectionsUrl = (pharmacy) => {
    const address = encodeURIComponent(pharmacy.address);
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const formatDistance = (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance}km`;
  };

  return (
    <div>
      {/* Search Controls */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-900">Search Filters</h3>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
          </button>
        </div>

        {/* Location Status */}
        <div className="mb-4">
          {hasLocation ? (
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="text-sm">Location available for search</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-red-700">
                <XCircleIcon className="h-5 w-5" />
                <span className="text-sm">Location required to find nearby pharmacies</span>
              </div>
              <button
                onClick={onLocationRefresh}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Enable Location
              </button>
            </div>
          )}
        </div>

        {/* Basic Search */}
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Radius
            </label>
            <select
              value={searchParams.radius}
              onChange={(e) => setSearchParams(prev => ({ ...prev, radius: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={5}>5 km</option>
              <option value={10}>10 km</option>
              <option value={15}>15 km</option>
              <option value={25}>25 km</option>
              <option value={50}>50 km</option>
            </select>
          </div>

          <div className="flex-shrink-0">
            <button
              onClick={handleSearch}
              disabled={!hasLocation || isSearching}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSearching ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                'Find Pharmacies'
              )}
            </button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Services
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {availableServices.map((service) => (
                <label key={service.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={searchParams.services.includes(service.id)}
                    onChange={() => handleServiceToggle(service.id)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{service.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {results ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">
              Found {results.totalFound} pharmacies within {results.searchRadius}km
            </h3>
          </div>

          {results.pharmacies.length > 0 ? (
            <div className="space-y-4">
              {results.pharmacies.map((pharmacy) => (
                <div key={pharmacy.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Pharmacy Header */}
                      <div className="flex items-center space-x-3 mb-3">
                        <BuildingStorefrontIcon className="h-6 w-6 text-blue-600" />
                        <div>
                          <h4 className="font-semibold text-gray-900">{pharmacy.name}</h4>
                          <p className="text-sm text-gray-600">{pharmacy.chain}</p>
                        </div>
                        {pharmacy.isOpen && (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                            Open Now
                          </span>
                        )}
                      </div>

                      {/* Pharmacy Details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="flex items-start space-x-2 mb-2">
                            <MapPinIcon className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-gray-700">{pharmacy.address}</p>
                              <p className="text-gray-500">
                                {formatDistance(pharmacy.distance)} away
                                {pharmacy.estimatedTravelTime && (
                                  <span> • {pharmacy.estimatedTravelTime.formatted}</span>
                                )}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-2">
                            <PhoneIcon className="h-4 w-4 text-gray-400" />
                            <a
                              href={`tel:${pharmacy.phone}`}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              {pharmacy.phone}
                            </a>
                          </div>

                          {pharmacy.website && (
                            <div className="flex items-center space-x-2">
                              <GlobeAltIcon className="h-4 w-4 text-gray-400" />
                              <a
                                href={pharmacy.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                              >
                                Visit Website
                              </a>
                            </div>
                          )}
                        </div>

                        <div>
                          {/* Rating */}
                          <div className="flex items-center space-x-2 mb-2">
                            <div className="flex items-center">
                              {getRatingStars(pharmacy.rating)}
                            </div>
                            <span className="text-gray-600">
                              {pharmacy.rating} ({pharmacy.reviewCount} reviews)
                            </span>
                          </div>

                          {/* Services */}
                          <div className="mb-2">
                            <p className="font-medium text-gray-700 mb-1">Services:</p>
                            <div className="flex flex-wrap gap-1">
                              {pharmacy.services.slice(0, 3).map((service) => (
                                <span
                                  key={service}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full"
                                >
                                  {availableServices.find(s => s.id === service)?.name || service}
                                </span>
                              ))}
                              {pharmacy.services.length > 3 && (
                                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                                  +{pharmacy.services.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Additional Features */}
                          <div className="space-y-1">
                            {pharmacy.hasOnlineOrdering && (
                              <div className="flex items-center space-x-2">
                                <GlobeAltIcon className="h-4 w-4 text-green-500" />
                                <span className="text-green-700 text-sm">Online Ordering</span>
                              </div>
                            )}
                            {pharmacy.acceptsInsurance && (
                              <div className="flex items-center space-x-2">
                                <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                                <span className="text-blue-700 text-sm">Accepts Insurance</span>
                              </div>
                            )}
                            {pharmacy.membershipRequired && (
                              <div className="flex items-center space-x-2">
                                <ClockIcon className="h-4 w-4 text-orange-500" />
                                <span className="text-orange-700 text-sm">Membership Required</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col space-y-2">
                      <a
                        href={getDirectionsUrl(pharmacy)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors text-center"
                      >
                        Get Directions
                      </a>
                      
                      <a
                        href={`tel:${pharmacy.phone}`}
                        className="px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors text-center"
                      >
                        Call Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-lg">
              <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No pharmacies found in your area</p>
              <p className="text-sm text-gray-400 mt-1">Try increasing the search radius</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
          <BuildingStorefrontIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Search for nearby pharmacies</p>
          <p className="text-sm text-gray-400 mt-1">Enable location and click "Find Pharmacies" to get started</p>
        </div>
      )}
    </div>
  );
};

PharmacyFinder.propTypes = {
  onSearch: PropTypes.func.isRequired,
  results: PropTypes.object,
  userLocation: PropTypes.object,
  hasLocation: PropTypes.bool.isRequired,
  onLocationRefresh: PropTypes.func.isRequired
};

export default PharmacyFinder;
import React, { useState, useEffect } from 'react';
import MedicineSearch from '../components/PriceLookup/MedicineSearch';
import PriceComparison from '../components/PriceLookup/PriceComparison';
import PharmacyFinder from '../components/PriceLookup/PharmacyFinder';
import LocationService from '../services/locationService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  CurrencyDollarIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const PriceLookup = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState(null);
  const [nearbyPharmacies, setNearbyPharmacies] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [error, setError] = useState('');

  const tabs = [
    { id: 'search', name: 'Price Search', icon: MagnifyingGlassIcon },
    { id: 'pharmacies', name: 'Find Pharmacies', icon: BuildingStorefrontIcon }
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    try {
      const locationResult = await LocationService.getCurrentLocation();
      if (locationResult.success) {
        setUserLocation(locationResult.data);
      }
    } catch (error) {
      console.error('Location error:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMedicineSearch = async (medicineName) => {
    try {
      setError('');
      
      const params = new URLSearchParams({
        medicine: medicineName
      });

      if (userLocation) {
        params.append('lat', userLocation.latitude);
        params.append('lng', userLocation.longitude);
      }

      const response = await fetch(`/api/pharmacy/prices/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data);
      } else {
        setError(data.message);
        setSearchResults(null);
      }
    } catch (error) {
      console.error('Medicine search error:', error);
      setError('Failed to search medicine prices');
      setSearchResults(null);
    }
  };

  const handlePharmacySearch = async (searchParams) => {
    try {
      setError('');

      if (!userLocation) {
        setError('Location is required to find nearby pharmacies');
        return;
      }

      const params = new URLSearchParams({
        lat: userLocation.latitude,
        lng: userLocation.longitude,
        radius: searchParams.radius || 10
      });

      if (searchParams.services && searchParams.services.length > 0) {
        params.append('services', searchParams.services.join(','));
      }

      const response = await fetch(`/api/pharmacy/nearby?${params}`);
      const data = await response.json();

      if (data.success) {
        setNearbyPharmacies(data.data);
      } else {
        setError(data.message);
        setNearbyPharmacies(null);
      }
    } catch (error) {
      console.error('Pharmacy search error:', error);
      setError('Failed to find nearby pharmacies');
      setNearbyPharmacies(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <CurrencyDollarIcon className="h-12 w-12 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Medicine Price Lookup</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Compare medicine prices across different pharmacies and find the best deals near you.
          Save money on your prescriptions and over-the-counter medications.
        </p>
      </div>

      {/* Location Status */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <MapPinIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Location Status</h3>
            {isLoadingLocation ? (
              <p className="text-blue-800 text-sm mt-1">Getting your location...</p>
            ) : userLocation ? (
              <div className="text-blue-800 text-sm mt-1">
                <p className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Location available for distance calculations</p>
                <p className="text-xs mt-1">
                  {userLocation.address || `${userLocation.latitude.toFixed(4)}, ${userLocation.longitude.toFixed(4)}`}
                </p>
              </div>
            ) : (
              <div className="text-blue-800 text-sm mt-1">
                <p className="flex items-center gap-2"><XCircleIcon className="h-4 w-4" /> Location not available - distances won't be shown</p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Enable location
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-500 text-green-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Price Search Tab */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Search Medicine Prices</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Search Form */}
                <div className="lg:col-span-1">
                  <MedicineSearch onSearch={handleMedicineSearch} />
                </div>

                {/* Results */}
                <div className="lg:col-span-2">
                  {searchResults ? (
                    <PriceComparison 
                      results={searchResults}
                      userLocation={userLocation}
                    />
                  ) : (
                    <div className="text-center py-12 bg-gray-50 border border-gray-200 rounded-lg">
                      <CurrencyDollarIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-500">Search for a medicine to compare prices</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Pharmacy Finder Tab */}
          {activeTab === 'pharmacies' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Find Nearby Pharmacies</h2>
              
              <PharmacyFinder
                onSearch={handlePharmacySearch}
                results={nearbyPharmacies}
                userLocation={userLocation}
                hasLocation={!!userLocation}
                onLocationRefresh={getCurrentLocation}
              />
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center mb-3">
            <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
            <h3 className="ml-3 font-medium text-green-900">Save Money</h3>
          </div>
          <p className="text-green-800 text-sm">
            Compare prices across multiple pharmacies to find the best deals on your medications.
          </p>
        </div>

        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <MapPinIcon className="h-8 w-8 text-blue-600" />
            <h3 className="ml-3 font-medium text-blue-900">Find Nearby</h3>
          </div>
          <p className="text-blue-800 text-sm">
            Locate pharmacies near you with directions, hours, and available services.
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center mb-3">
            <BuildingStorefrontIcon className="h-8 w-8 text-purple-600" />
            <h3 className="ml-3 font-medium text-purple-900">Compare Options</h3>
          </div>
          <p className="text-purple-800 text-sm">
            View pharmacy ratings, services, and availability to make informed decisions.
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <svg className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-yellow-800">
            <p className="font-medium">Price Disclaimer</p>
            <p className="text-sm mt-1">
              Prices shown are estimates and may vary. Always verify current prices and availability 
              with the pharmacy before making a purchase. Insurance coverage may affect final costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceLookup;
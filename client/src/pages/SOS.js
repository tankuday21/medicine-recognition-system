import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import SOSButton from '../components/SOS/SOSButton';
import EmergencyContacts from '../components/SOS/EmergencyContacts';
import LocationService from '../services/locationService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  ExclamationTriangleIcon,
  PhoneIcon,
  MapPinIcon,
  UserGroupIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SOS = () => {
  const [activeTab, setActiveTab] = useState('sos');
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [emergencyContacts, setEmergencyContacts] = useState([]);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  const tabs = [
    { id: 'sos', name: 'Emergency SOS', icon: ExclamationTriangleIcon },
    { id: 'contacts', name: 'Emergency Contacts', icon: UserGroupIcon }
  ];

  useEffect(() => {
    if (isAuthenticated) {
      loadEmergencyContacts();
      getCurrentLocation();
    }
  }, [isAuthenticated]);

  const getCurrentLocation = async () => {
    setIsLoadingLocation(true);
    setLocationError('');

    try {
      const locationResult = await LocationService.getCurrentLocation();
      
      if (locationResult.success) {
        setLocation(locationResult.data);
      } else {
        setLocationError(locationResult.message);
      }
    } catch (error) {
      console.error('Location error:', error);
      setLocationError('Failed to get current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const loadEmergencyContacts = async () => {
    try {
      const response = await fetch('/api/emergency/contacts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setEmergencyContacts(data.data);
      }
    } catch (error) {
      console.error('Failed to load emergency contacts:', error);
    }
  };

  const handleEmergencyTrigger = async (emergencyData) => {
    try {
      setError('');

      // Use current location or get new one
      let currentLocation = location;
      if (!currentLocation) {
        const locationResult = await LocationService.getCurrentLocation();
        if (locationResult.success) {
          currentLocation = locationResult.data;
          setLocation(currentLocation);
        } else {
          throw new Error('Location is required for emergency alerts');
        }
      }

      const response = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...emergencyData,
          location: currentLocation
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Emergency triggered successfully
        return { success: true, data: data.data };
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      console.error('Emergency trigger error:', error);
      setError(error.message);
      return { success: false, message: error.message };
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Sign In Required</h2>
          <p className="text-gray-600">
            Please sign in to access emergency SOS features and manage your emergency contacts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Emergency SOS</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Get help quickly in emergency situations. Your location and emergency contacts 
          will be notified immediately when you trigger an SOS alert.
        </p>
      </div>

      {/* Emergency Numbers */}
      <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <PhoneIcon className="h-6 w-6 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-red-900">Emergency Numbers</h3>
            <p className="text-red-800 text-sm mt-1">
              For immediate life-threatening emergencies, call 911 directly. 
              This SOS system is for alerting your personal emergency contacts.
            </p>
            <div className="mt-3 flex space-x-4">
              <a
                href="tel:911"
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Call 911</span>
              </a>
              <a
                href="tel:988"
                className="flex items-center space-x-2 px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
              >
                <PhoneIcon className="h-4 w-4" />
                <span>Crisis Hotline (988)</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Location Status */}
      <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <MapPinIcon className="h-6 w-6 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-medium text-blue-900">Location Status</h3>
            {isLoadingLocation ? (
              <p className="text-blue-800 text-sm mt-1">Getting your location...</p>
            ) : location ? (
              <div className="text-blue-800 text-sm mt-1">
                <p className="flex items-center gap-2"><CheckCircleIcon className="h-4 w-4" /> Location available: {location.address || 'Coordinates obtained'}</p>
                <p className="text-xs mt-1">
                  Lat: {location.latitude.toFixed(6)}, Lng: {location.longitude.toFixed(6)}
                </p>
              </div>
            ) : (
              <div className="text-blue-800 text-sm mt-1">
                <p className="flex items-center gap-2"><XCircleIcon className="h-4 w-4" /> Location not available: {locationError}</p>
                <button
                  onClick={getCurrentLocation}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  Try again
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
                    ? 'border-red-500 text-red-600'
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
          {/* SOS Tab */}
          {activeTab === 'sos' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency SOS</h2>
              
              <SOSButton
                onEmergencyTrigger={handleEmergencyTrigger}
                emergencyContacts={emergencyContacts}
                hasLocation={!!location}
                onLocationRefresh={getCurrentLocation}
              />

              {/* Instructions */}
              <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">How Emergency SOS Works:</h3>
                <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                  <li>Press and hold the SOS button for 3 seconds</li>
                  <li>Select the type of emergency you're experiencing</li>
                  <li>Choose which emergency contacts to notify (or all)</li>
                  <li>Your location and emergency details are sent immediately</li>
                  <li>Emergency contacts receive SMS and email alerts</li>
                </ol>
              </div>
            </div>
          )}

          {/* Emergency Contacts Tab */}
          {activeTab === 'contacts' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Emergency Contacts</h2>
              
              <EmergencyContacts
                contacts={emergencyContacts}
                onContactsChange={loadEmergencyContacts}
              />
            </div>
          )}
        </div>
      </div>

      {/* Important Information */}
      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium">Important Safety Information</p>
            <ul className="text-sm mt-2 space-y-1 list-disc list-inside">
              <li>This SOS system alerts your personal emergency contacts</li>
              <li>For immediate life-threatening emergencies, call 911 first</li>
              <li>Ensure your emergency contacts are up to date</li>
              <li>Test your emergency contacts periodically</li>
              <li>Keep your phone charged and location services enabled</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SOS;
import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  ExclamationTriangleIcon,
  MapPinIcon,
  UserGroupIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const SOSButton = ({ onEmergencyTrigger, emergencyContacts, hasLocation, onLocationRefresh }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [selectedEmergencyType, setSelectedEmergencyType] = useState('');
  const [selectedContacts, setSelectedContacts] = useState([]);
  const [customMessage, setCustomMessage] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [triggerResult, setTriggerResult] = useState(null);
  
  const pressTimerRef = useRef(null);
  const countdownTimerRef = useRef(null);

  const emergencyTypes = [
    { id: 'medical_emergency', name: 'Medical Emergency', icon: '🚑', color: 'red' },
    { id: 'accident', name: 'Accident', icon: '🚗', color: 'orange' },
    { id: 'personal_safety', name: 'Personal Safety', icon: '🛡️', color: 'yellow' },
    { id: 'natural_disaster', name: 'Natural Disaster', icon: '🌪️', color: 'purple' },
    { id: 'other', name: 'Other Emergency', icon: '⚠️', color: 'gray' }
  ];

  useEffect(() => {
    return () => {
      if (pressTimerRef.current) {
        clearTimeout(pressTimerRef.current);
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, []);

  const handleMouseDown = () => {
    if (showConfirmation || isTriggering) return;
    
    setIsPressed(true);
    setCountdown(3);
    
    // Start countdown
    countdownTimerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownTimerRef.current);
          setIsPressed(false);
          setShowConfirmation(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleMouseUp = () => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
    setIsPressed(false);
    setCountdown(0);
  };

  const handleCancel = () => {
    setShowConfirmation(false);
    setSelectedEmergencyType('');
    setSelectedContacts([]);
    setCustomMessage('');
    setTriggerResult(null);
  };

  const handleContactToggle = (contactId) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  const handleSelectAllContacts = () => {
    if (selectedContacts.length === emergencyContacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(emergencyContacts.map(contact => contact.id));
    }
  };

  const handleConfirmEmergency = async () => {
    if (!selectedEmergencyType) {
      alert('Please select an emergency type');
      return;
    }

    if (!hasLocation) {
      alert('Location is required for emergency alerts. Please enable location services.');
      return;
    }

    setIsTriggering(true);
    setTriggerResult(null);

    try {
      const result = await onEmergencyTrigger({
        emergencyType: selectedEmergencyType,
        message: customMessage || 'Emergency assistance needed',
        selectedContacts: selectedContacts.length > 0 ? selectedContacts : null
      });

      setTriggerResult(result);
      
      if (result.success) {
        // Auto-close after 5 seconds on success
        setTimeout(() => {
          handleCancel();
        }, 5000);
      }
    } catch (error) {
      setTriggerResult({
        success: false,
        message: error.message
      });
    } finally {
      setIsTriggering(false);
    }
  };

  const getEmergencyTypeColor = (type) => {
    const colors = {
      red: 'bg-red-100 text-red-800 border-red-200',
      orange: 'bg-orange-100 text-orange-800 border-orange-200',
      yellow: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200',
      gray: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[type] || colors.gray;
  };

  return (
    <div className="text-center">
      {!showConfirmation ? (
        <div>
          {/* Main SOS Button */}
          <div className="relative inline-block">
            <button
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleMouseDown}
              onTouchEnd={handleMouseUp}
              disabled={!hasLocation}
              className={`
                relative w-48 h-48 rounded-full border-8 font-bold text-2xl transition-all duration-200
                ${isPressed 
                  ? 'bg-red-700 border-red-800 text-white scale-95 shadow-inner' 
                  : 'bg-red-600 border-red-700 text-white hover:bg-red-700 shadow-lg'
                }
                ${!hasLocation ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                select-none
              `}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <ExclamationTriangleIcon className="h-12 w-12 mb-2" />
                <span>SOS</span>
                {isPressed && countdown > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-4xl font-bold animate-pulse">
                      {countdown}
                    </div>
                  </div>
                )}
              </div>
            </button>

            {/* Countdown Ring */}
            {isPressed && (
              <div className="absolute inset-0 rounded-full">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="2"
                    fill="none"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    stroke="white"
                    strokeWidth="2"
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 46}`}
                    strokeDashoffset={`${2 * Math.PI * 46 * (countdown / 3)}`}
                    className="transition-all duration-1000 ease-linear"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="mt-6 space-y-2">
            <p className="text-lg font-medium text-gray-900">
              Press and hold for 3 seconds to activate
            </p>
            <p className="text-sm text-gray-600">
              Emergency alerts will be sent to your contacts
            </p>
          </div>

          {/* Status Indicators */}
          <div className="mt-6 flex justify-center space-x-6">
            <div className="flex items-center space-x-2">
              <MapPinIcon className={`h-5 w-5 ${hasLocation ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm ${hasLocation ? 'text-green-700' : 'text-red-700'}`}>
                {hasLocation ? 'Location Ready' : 'Location Required'}
              </span>
              {!hasLocation && (
                <button
                  onClick={onLocationRefresh}
                  className="text-blue-600 hover:text-blue-800 text-sm underline"
                >
                  Enable
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <UserGroupIcon className={`h-5 w-5 ${emergencyContacts.length > 0 ? 'text-green-500' : 'text-yellow-500'}`} />
              <span className={`text-sm ${emergencyContacts.length > 0 ? 'text-green-700' : 'text-yellow-700'}`}>
                {emergencyContacts.length} Contact{emergencyContacts.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Confirmation Dialog */
        <div className="bg-white border border-gray-200 rounded-lg p-6 max-w-md mx-auto">
          <div className="text-center mb-6">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900">Confirm Emergency Alert</h3>
            <p className="text-sm text-gray-600 mt-1">
              This will immediately notify your emergency contacts
            </p>
          </div>

          {triggerResult ? (
            /* Result Display */
            <div className="text-center">
              {triggerResult.success ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-medium text-green-900">Emergency Alert Sent!</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Your emergency contacts have been notified
                  </p>
                  <p className="text-xs text-green-700 mt-2">
                    Emergency ID: {triggerResult.data?.emergencyId}
                  </p>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <XMarkIcon className="h-8 w-8 text-red-500 mx-auto mb-2" />
                  <h4 className="font-medium text-red-900">Alert Failed</h4>
                  <p className="text-sm text-red-800 mt-1">
                    {triggerResult.message}
                  </p>
                </div>
              )}
              
              <button
                onClick={handleCancel}
                className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Close
              </button>
            </div>
          ) : (
            /* Configuration Form */
            <div className="space-y-4">
              {/* Emergency Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Type *
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {emergencyTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedEmergencyType(type.id)}
                      className={`
                        p-3 border rounded-lg text-left transition-colors
                        ${selectedEmergencyType === type.id
                          ? getEmergencyTypeColor(type.color) + ' border-current'
                          : 'border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{type.icon}</span>
                        <span className="font-medium">{type.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Contact Selection */}
              {emergencyContacts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Notify Contacts
                    </label>
                    <button
                      onClick={handleSelectAllContacts}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      {selectedContacts.length === emergencyContacts.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {emergencyContacts.map((contact) => (
                      <label key={contact.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={selectedContacts.includes(contact.id)}
                          onChange={() => handleContactToggle(contact.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <span className="font-medium">{contact.name}</span>
                          <span className="text-sm text-gray-500 ml-2">({contact.relationship})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty to notify all contacts
                  </p>
                </div>
              )}

              {/* Custom Message */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Message (Optional)
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your situation..."
                  maxLength={200}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancel}
                  disabled={isTriggering}
                  className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmEmergency}
                  disabled={isTriggering || !selectedEmergencyType}
                  className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {isTriggering ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    'Send Emergency Alert'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

SOSButton.propTypes = {
  onEmergencyTrigger: PropTypes.func.isRequired,
  emergencyContacts: PropTypes.array.isRequired,
  hasLocation: PropTypes.bool.isRequired,
  onLocationRefresh: PropTypes.func.isRequired
};

export default SOSButton;
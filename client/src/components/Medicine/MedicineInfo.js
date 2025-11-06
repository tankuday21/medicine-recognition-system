import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  HeartIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CurrencyDollarIcon,
  ClockIcon,
  ShareIcon,
  BookmarkIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';
import {
  HeartIcon as HeartSolidIcon,
  BookmarkIcon as BookmarkSolidIcon
} from '@heroicons/react/24/solid';

const MedicineInfo = ({ medicine, onCreateReminder, onShare, showActions = true }) => {
  const [isFavorited, setIsFavorited] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  if (!medicine) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <InformationCircleIcon className="h-12 w-12 mx-auto mb-3 text-gray-400" />
          <p>No medicine information available</p>
        </div>
      </div>
    );
  }

  const handleFavorite = () => {
    setIsFavorited(!isFavorited);
    // TODO: Implement favorite functionality
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleShare = () => {
    if (onShare) {
      onShare(medicine);
    } else {
      // Default share functionality
      if (navigator.share) {
        navigator.share({
          title: medicine.name,
          text: `${medicine.name} (${medicine.genericName}) - ${medicine.dosage}`,
          url: window.location.href
        });
      }
    }
  };

  const handleCreateReminder = () => {
    if (onCreateReminder) {
      onCreateReminder(medicine);
    }
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: InformationCircleIcon },
    { id: 'uses', name: 'Uses & Effects', icon: HeartIcon },
    { id: 'safety', name: 'Safety Info', icon: ExclamationTriangleIcon },
    { id: 'pricing', name: 'Pricing', icon: CurrencyDollarIcon }
  ];

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'high':
      case 'severe':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
      case 'moderate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low':
      case 'mild':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {medicine.name}
            </h1>
            {medicine.genericName && medicine.genericName !== medicine.name && (
              <p className="text-lg text-gray-600 mb-2">
                Generic: {medicine.genericName}
              </p>
            )}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {medicine.dosage}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                {medicine.category || 'Medicine'}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              Manufactured by {medicine.manufacturer}
            </p>
          </div>

          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={handleFavorite}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isFavorited ? (
                  <HeartSolidIcon className="h-6 w-6 text-red-500" />
                ) : (
                  <HeartIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={handleBookmark}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                {isBookmarked ? (
                  <BookmarkSolidIcon className="h-6 w-6 text-blue-500" />
                ) : (
                  <BookmarkIcon className="h-6 w-6 text-gray-400" />
                )}
              </button>
              
              <button
                onClick={handleShare}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              >
                <ShareIcon className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {showActions && (
          <div className="flex space-x-3 mt-4">
            <button
              onClick={handleCreateReminder}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ClockIcon className="h-4 w-4" />
              <span>Set Reminder</span>
            </button>
            
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              <PhoneIcon className="h-4 w-4" />
              <span>Consult Doctor</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Medicine Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Basic Information</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Name:</dt>
                      <dd className="text-gray-900">{medicine.name}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Generic:</dt>
                      <dd className="text-gray-900">{medicine.genericName || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Dosage:</dt>
                      <dd className="text-gray-900">{medicine.dosage}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="text-gray-900">{medicine.category || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Manufacturer Info</h4>
                  <dl className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Company:</dt>
                      <dd className="text-gray-900">{medicine.manufacturer}</dd>
                    </div>
                    {medicine.barcode && (
                      <div className="flex justify-between">
                        <dt className="text-gray-600">Barcode:</dt>
                        <dd className="text-gray-900 font-mono">{medicine.barcode}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
            </div>

            {medicine.uses && medicine.uses.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Primary Uses</h4>
                <div className="flex flex-wrap gap-2">
                  {medicine.uses.slice(0, 3).map((use, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800"
                    >
                      {use}
                    </span>
                  ))}
                  {medicine.uses.length > 3 && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                      +{medicine.uses.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Uses & Effects Tab */}
        {activeTab === 'uses' && (
          <div className="space-y-6">
            {medicine.uses && medicine.uses.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Medical Uses</h3>
                <ul className="space-y-2">
                  {medicine.uses.map((use, index) => (
                    <li key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                      <span className="text-gray-700">{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {medicine.sideEffects && medicine.sideEffects.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Side Effects</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-yellow-800 mb-2">
                        Common side effects may include:
                      </p>
                      <ul className="space-y-1">
                        {medicine.sideEffects.map((effect, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            • {effect}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Info Tab */}
        {activeTab === 'safety' && (
          <div className="space-y-6">
            {medicine.interactions && medicine.interactions.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Drug Interactions</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-800 mb-2">
                        This medicine may interact with:
                      </p>
                      <ul className="space-y-1">
                        {medicine.interactions.map((interaction, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {interaction}
                          </li>
                        ))}
                      </ul>
                      <p className="text-sm text-red-800 mt-3 font-medium">
                        Always consult your doctor before combining medications.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Safety Guidelines</h3>
              <div className="space-y-3">
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Take this medication exactly as prescribed by your healthcare provider.
                  </p>
                </div>
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Store in a cool, dry place away from direct sunlight.
                  </p>
                </div>
                <div className="flex items-start">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <p className="text-sm text-gray-700">
                    Keep out of reach of children and pets.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Pricing Tab */}
        {activeTab === 'pricing' && (
          <div className="space-y-6">
            {medicine.price && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Information</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-green-800">
                        ₹{medicine.price.amount}
                      </p>
                      <p className="text-sm text-green-600">
                        Source: {medicine.price.source}
                      </p>
                      {medicine.price.lastUpdated && (
                        <p className="text-xs text-green-600">
                          Updated: {new Date(medicine.price.lastUpdated).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600" />
                  </div>
                </div>
              </div>
            )}

            <div>
              <h4 className="font-medium text-gray-900 mb-3">Find Better Prices</h4>
              <div className="space-y-2">
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Compare prices online</span>
                    <span className="text-xs text-gray-500">→</span>
                  </div>
                </button>
                <button className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">Find nearby pharmacies</span>
                    <span className="text-xs text-gray-500">→</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

MedicineInfo.propTypes = {
  medicine: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string.isRequired,
    genericName: PropTypes.string,
    dosage: PropTypes.string,
    manufacturer: PropTypes.string,
    uses: PropTypes.arrayOf(PropTypes.string),
    sideEffects: PropTypes.arrayOf(PropTypes.string),
    interactions: PropTypes.arrayOf(PropTypes.string),
    barcode: PropTypes.string,
    category: PropTypes.string,
    price: PropTypes.shape({
      amount: PropTypes.number,
      currency: PropTypes.string,
      source: PropTypes.string,
      lastUpdated: PropTypes.string
    })
  }),
  onCreateReminder: PropTypes.func,
  onShare: PropTypes.func,
  showActions: PropTypes.bool
};

export default MedicineInfo;
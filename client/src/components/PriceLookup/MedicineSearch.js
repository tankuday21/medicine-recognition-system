import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';

const MedicineSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const commonMedicines = [
    { name: 'Lisinopril', type: 'Blood Pressure', generic: true },
    { name: 'Metformin', type: 'Diabetes', generic: true },
    { name: 'Atorvastatin', type: 'Cholesterol', generic: true },
    { name: 'Amlodipine', type: 'Blood Pressure', generic: true },
    { name: 'Omeprazole', type: 'Acid Reflux', generic: true },
    { name: 'Lipitor', type: 'Cholesterol', generic: false },
    { name: 'Norvasc', type: 'Blood Pressure', generic: false },
    { name: 'Prilosec', type: 'Acid Reflux', generic: false }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      return;
    }

    setIsSearching(true);
    try {
      await onSearch(searchTerm.trim());
    } finally {
      setIsSearching(false);
    }
  };

  const handleQuickSearch = (medicineName) => {
    setSearchTerm(medicineName);
    onSearch(medicineName);
  };

  return (
    <div>
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500"
            placeholder="Enter medicine name (e.g., Lisinopril, Metformin)"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSearching || !searchTerm.trim()}
          className="w-full mt-3 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Searching...</span>
            </div>
          ) : (
            'Search Prices'
          )}
        </button>
      </form>

      {/* Quick Search Options */}
      <div>
        <h3 className="font-medium text-gray-900 mb-3">Popular Medicines</h3>
        <div className="space-y-2">
          {commonMedicines.map((medicine, index) => (
            <button
              key={index}
              onClick={() => handleQuickSearch(medicine.name)}
              className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 focus:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <BeakerIcon className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">{medicine.name}</p>
                    <p className="text-sm text-gray-600">{medicine.type}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {medicine.generic && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Generic
                    </span>
                  )}
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Search Tips */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Try both generic and brand names (e.g., "Lisinopril" or "Prinivil")</li>
          <li>Use partial names if you're not sure of the exact spelling</li>
          <li>Common medicines are more likely to have price data</li>
          <li>Enable location for distance-based results</li>
        </ul>
      </div>
    </div>
  );
};

MedicineSearch.propTypes = {
  onSearch: PropTypes.func.isRequired
};

export default MedicineSearch;
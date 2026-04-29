import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

const MedicineSearch = ({ onSelectMedicine, placeholder, initialValue, onQueryChange }) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialValue || '');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);

  // Sync with initialValue if it changes
  useEffect(() => {
    if (initialValue !== undefined) {
      setQuery(initialValue);
    }
  }, [initialValue]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentMedicineSearches');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load recent searches:', error);
      }
    }
  }, []);

  // Debounced search function
  const searchMedicines = useCallback(async (searchQuery) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/scanner/search?q=${encodeURIComponent(searchQuery)}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
      } else {
        console.error('Search failed:', data.message);
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query) {
        searchMedicines(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query, searchMedicines]);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    if (onQueryChange) {
      onQueryChange(val);
    }
  };

  const handleSelectMedicine = (medicine) => {
    setQuery(medicine.name);
    setIsOpen(false);
    
    // Add to recent searches
    const newRecentSearches = [
      medicine,
      ...recentSearches.filter(item => item._id !== medicine._id)
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentMedicineSearches', JSON.stringify(newRecentSearches));
    
    if (onSelectMedicine) {
      onSelectMedicine(medicine);
    }

    if (onQueryChange) {
      onQueryChange(medicine.name);
    }
  };

  const handleRecentSearch = (medicine) => {
    handleSelectMedicine(medicine);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    if (onQueryChange) {
      onQueryChange('');
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentMedicineSearches');
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder || t('medicine.searchMedicines')}
          className="block w-full !pl-14 pr-12 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white transition-all text-base min-h-[48px]"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-4 flex items-center touch-target"
            aria-label="Clear search"
          >
            <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-80 sm:max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
          {/* Loading State */}
          {isLoading && (
            <div className="px-4 py-3 text-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-500 mt-2">{t('common.searching')}</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && results.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50">
                {t('medicine.searchResults')}
              </div>
              {results.map((medicine) => (
                <button
                  key={medicine._id}
                  onClick={() => handleSelectMedicine(medicine)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none touch-target"
                >
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                        {medicine.name}
                      </p>
                      {medicine.genericName && medicine.genericName !== medicine.name && (
                        <p className="text-xs text-gray-500 truncate">
                          Generic: {medicine.genericName}
                        </p>
                      )}
                      <div className="flex items-center space-x-2 mt-1 flex-wrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {medicine.dosage}
                        </span>
                        {medicine.manufacturer && (
                          <span className="text-xs text-gray-500 truncate">
                            {medicine.manufacturer}
                          </span>
                        )}
                      </div>
                    </div>
                    {medicine.price && (
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium text-gray-900">
                          ₹{medicine.price.amount}
                        </p>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-gray-500">{t('medicine.noMedicinesFound')} "{query}"</p>
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide bg-gray-50 flex items-center justify-between">
                <span>{t('medicine.recentSearches')}</span>
                <button
                  onClick={clearRecentSearches}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {t('common.clear')}
                </button>
              </div>
              {recentSearches.map((medicine) => (
                <button
                  key={medicine._id}
                  onClick={() => handleRecentSearch(medicine)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none touch-target"
                >
                  <div className="flex items-center space-x-3">
                    <ClockIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {medicine.name}
                      </p>
                      {medicine.genericName && medicine.genericName !== medicine.name && (
                        <p className="text-xs text-gray-500 truncate">
                          {medicine.genericName}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {!query && recentSearches.length === 0 && (
            <div className="px-4 py-3 text-center">
              <p className="text-sm text-gray-500">{t('medicine.startTyping')}</p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

MedicineSearch.propTypes = {
  onSelectMedicine: PropTypes.func,
  placeholder: PropTypes.string,
  initialValue: PropTypes.string,
  onQueryChange: PropTypes.func
};

export default MedicineSearch;
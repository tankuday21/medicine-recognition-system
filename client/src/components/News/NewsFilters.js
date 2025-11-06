import React, { useState, useEffect } from 'react';
import {
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const NewsFilters = ({ filters, onFilterChange, personalized = false }) => {
  const [categories, setCategories] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(false);

  const sortOptions = [
    { value: 'publishedAt', label: 'Most Recent' },
    { value: 'relevancy', label: 'Most Relevant' },
    { value: 'popularity', label: 'Most Popular' }
  ];

  const languageOptions = [
    { value: 'en', label: 'English' },
    { value: 'hi', label: 'Hindi' },
    { value: 'es', label: 'Spanish' },
    { value: 'fr', label: 'French' }
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/news/categories');
      const data = await response.json();
      
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const resetFilters = () => {
    onFilterChange({
      category: 'general',
      sortBy: 'publishedAt',
      language: 'en'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'general') count++;
    if (filters.sortBy !== 'publishedAt') count++;
    if (filters.language !== 'en') count++;
    return count;
  };

  if (personalized) {
    return (
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4">
        <div className="flex items-center space-x-2">
          <div className="p-2 bg-purple-100 rounded-lg">
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-medium text-purple-900">Personalized News Feed</h3>
            <p className="text-sm text-purple-700">
              Articles curated based on your health profile and interests
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Filter Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <span className="font-medium text-gray-900">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={resetFilters}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Reset
            </button>
          )}
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
          >
            <span>{showFilters ? 'Hide' : 'Show'} Filters</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Options */}
      {showFilters && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              >
                <option value="general">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Language
              </label>
              <select
                value={filters.language}
                onChange={(e) => handleFilterChange('language', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-gray-700">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'general' && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Category: {categories.find(c => c.id === filters.category)?.name || filters.category}
                    <button
                      onClick={() => handleFilterChange('category', 'general')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.sortBy !== 'publishedAt' && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Sort: {sortOptions.find(s => s.value === filters.sortBy)?.label}
                    <button
                      onClick={() => handleFilterChange('sortBy', 'publishedAt')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
                
                {filters.language !== 'en' && (
                  <span className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                    Language: {languageOptions.find(l => l.value === filters.language)?.label}
                    <button
                      onClick={() => handleFilterChange('language', 'en')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NewsFilters;
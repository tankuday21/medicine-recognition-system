import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const NewsSearch = ({ onSearch, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const healthSearchSuggestions = [
    'diabetes treatment',
    'heart disease prevention',
    'mental health awareness',
    'covid-19 updates',
    'vaccine news',
    'nutrition research',
    'cancer breakthrough',
    'fitness tips',
    'medication safety',
    'healthcare policy'
  ];

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('newsSearchHistory');
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse search history:', error);
      }
    }
  }, []);

  const saveSearchToHistory = (searchQuery) => {
    if (!searchQuery.trim()) return;

    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(updatedSearches);
    localStorage.setItem('newsSearchHistory', JSON.stringify(updatedSearches));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuery = query.trim();
    
    if (trimmedQuery) {
      saveSearchToHistory(trimmedQuery);
      onSearch(trimmedQuery);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    saveSearchToHistory(suggestion);
    onSearch(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
    setShowSuggestions(false);
  };

  const clearSearchHistory = () => {
    setRecentSearches([]);
    localStorage.removeItem('newsSearchHistory');
  };

  return (
    <div className="relative">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search health news..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-medium text-gray-700">Recent Searches</h4>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-1">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Health Topics */}
          <div className="p-3">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Popular Health Topics</h4>
            <div className="space-y-1">
              {healthSearchSuggestions
                .filter(suggestion => 
                  !query || suggestion.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center w-full px-2 py-1 text-sm text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-2" />
                    {suggestion}
                  </button>
                ))
              }
            </div>
          </div>

          {/* Search Tips */}
          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <h4 className="text-sm font-medium text-gray-700 mb-1">Search Tips</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Use specific medical terms for better results</li>
              <li>• Try "condition + treatment" or "disease + prevention"</li>
              <li>• Search for recent studies or breakthrough news</li>
            </ul>
          </div>
        </div>
      )}

      {/* Overlay to close suggestions */}
      {showSuggestions && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowSuggestions(false)}
        />
      )}
    </div>
  );
};

export default NewsSearch;
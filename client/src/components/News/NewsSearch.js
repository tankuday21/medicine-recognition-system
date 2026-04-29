import React, { useState, useEffect } from 'react';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { PremiumInput } from '../ui/PremiumComponents';
import { useAuth } from '../../contexts/AuthContext';

const NewsSearch = ({ onSearch, initialQuery = '' }) => {
  const { user, isAuthenticated, updateProfile } = useAuth();
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
    if (isAuthenticated && user?.newsSearchHistory) {
      setRecentSearches(user.newsSearchHistory);
    } else {
      // Load recent searches from localStorage
      const saved = localStorage.getItem('newsSearchHistory');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (error) {
          console.error('Failed to parse search history:', error);
        }
      }
    }
  }, [isAuthenticated, user]);

  const saveSearchToHistory = async (searchQuery) => {
    if (!searchQuery.trim()) return;

    const updatedSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, 10); // Keep only last 10 searches

    setRecentSearches(updatedSearches);
    localStorage.setItem('newsSearchHistory', JSON.stringify(updatedSearches));

    if (isAuthenticated) {
      await updateProfile({
        newsSearchHistory: updatedSearches
      });
    }
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
    <div className="relative z-50">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative">
        <PremiumInput
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          placeholder="Search health news..."
          icon={MagnifyingGlassIcon}
          className="w-full"
          inputClassName="!py-4 !pl-16 !rounded-2xl shadow-sm border-gray-200 focus:border-primary-500"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}
      </form>

      {/* Search Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-gray-800 rounded-2xl shadow-premium-lg z-50 max-h-96 overflow-y-auto">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between px-3 py-2">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Recent</h4>
                <button
                  onClick={clearSearchHistory}
                  className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium"
                >
                  Clear all
                </button>
              </div>
              <div className="space-y-0.5">
                {recentSearches.slice(0, 5).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(search)}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <ClockIcon className="h-4 w-4 text-gray-400 mr-3" />
                    {search}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular Health Topics */}
          <div className="p-2">
            <h4 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Popular Topics</h4>
            <div className="space-y-0.5">
              {healthSearchSuggestions
                .filter(suggestion =>
                  !query || suggestion.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 8)
                .map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="flex items-center w-full px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 mr-3" />
                    {suggestion}
                  </button>
                ))
              }
            </div>
          </div>

          {/* Search Tips */}
          <div className="p-3 bg-gray-50/50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800 rounded-b-2xl">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">PRO TIPS</h4>
            <ul className="text-xs text-gray-500 dark:text-gray-400 space-y-1.5 pl-1">
              <li>• Use specific medical terms for better results</li>
              <li>• Try "condition + treatment" or "disease + prevention"</li>
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
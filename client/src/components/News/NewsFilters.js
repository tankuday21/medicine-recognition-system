import React, { useState, useEffect } from 'react';
import {
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { GlassCard, PremiumSelect } from '../ui/PremiumComponents';

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
        setCategories(data.data.map(cat => ({ value: cat.id, label: cat.name })));
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Fallback
      setCategories([
        { value: 'health', label: 'Health' },
        { value: 'science', label: 'Science' },
        { value: 'medical_research', label: 'Medical Research' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    onFilterChange({ [key]: value });
  };

  const resetFilters = () => {
    onFilterChange({
      category: 'health',
      sortBy: 'publishedAt',
      language: 'en'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.category !== 'health') count++;
    if (filters.sortBy !== 'publishedAt') count++;
    if (filters.language !== 'en') count++;
    return count;
  };

  // Convert categories state to options format for PremiumSelect if not already
  const categoryOptions = [
    { value: 'health', label: 'Results for: Health' },
    ...(Array.isArray(categories) && categories.length > 0 && categories[0].label ? categories.filter(c => c.value !== 'health') : [])
  ];

  if (personalized) {
    return (
      <GlassCard className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-xl">
            <svg className="h-6 w-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-purple-900 dark:text-purple-100">Personalized News Feed</h3>
            <p className="text-sm text-purple-700 dark:text-purple-300">
              Articles curated based on your health profile and interests
            </p>
          </div>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="mb-6">
      {/* Filter Toggle */}
      <GlassCard
        className="mb-4 flex items-center justify-between !p-4 cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors"
        padding="p-0"
        onClick={() => setShowFilters(!showFilters)}
      >
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <FunnelIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <span className="font-bold text-gray-900 dark:text-white">Filters</span>
          {getActiveFiltersCount() > 0 && (
            <span className="px-2.5 py-0.5 bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold rounded-full">
              {getActiveFiltersCount()} active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                resetFilters();
              }}
              className="text-sm text-gray-500 hover:text-red-500 font-medium transition-colors"
            >
              Reset
            </button>
          )}

          <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
        </div>
      </GlassCard>

      {/* Filter Options */}
      {showFilters && (
        <GlassCard className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PremiumSelect
              label="Category"
              options={categoryOptions}
              value={filters.category}
              onChange={(value) => handleFilterChange('category', value)}
            />

            <PremiumSelect
              label="Sort By"
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => handleFilterChange('sortBy', value)}
            />

            <PremiumSelect
              label="Language"
              options={languageOptions}
              value={filters.language}
              onChange={(value) => handleFilterChange('language', value)}
            />
          </div>

          {/* Active Filters Display */}
          {getActiveFiltersCount() > 0 && (
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center space-x-2 mb-3">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Active Filters</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.category !== 'health' && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-xl border border-primary-100 dark:border-primary-800">
                    Category: {categoryOptions.find(c => c.value === filters.category)?.label || filters.category}
                    <button
                      onClick={() => handleFilterChange('category', 'health')}
                      className="ml-2 text-primary-400 hover:text-primary-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {filters.sortBy !== 'publishedAt' && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-xl border border-primary-100 dark:border-primary-800">
                    Sort: {sortOptions.find(s => s.value === filters.sortBy)?.label}
                    <button
                      onClick={() => handleFilterChange('sortBy', 'publishedAt')}
                      className="ml-2 text-primary-400 hover:text-primary-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}

                {filters.language !== 'en' && (
                  <span className="inline-flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 text-sm font-medium rounded-xl border border-primary-100 dark:border-primary-800">
                    Language: {languageOptions.find(l => l.value === filters.language)?.label}
                    <button
                      onClick={() => handleFilterChange('language', 'en')}
                      className="ml-2 text-primary-400 hover:text-primary-600"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </GlassCard>
      )}
    </div>
  );
};

export default NewsFilters;
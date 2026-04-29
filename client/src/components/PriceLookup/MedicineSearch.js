import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  SparklesIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const MedicineSearch = ({ onSearch, isSearching = false }) => {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceTimer = useRef(null);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('mediot_recent_price_searches');
    if (saved) {
      setRecentSearches(JSON.parse(saved).slice(0, 3));
    }
  }, []);

  // Debounced autocomplete
  const fetchSuggestions = useCallback(async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(`/api/pharmacy/autocomplete?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success && data.data) {
        setSuggestions(data.data.slice(0, 5));
        setShowSuggestions(true);
      }
    } catch (error) {
      console.warn('Autocomplete error:', error);
    }
  }, []);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!searchTerm.trim() || isSearching) return;

    setShowSuggestions(false);
    setIsFocused(false);

    // Save to recent searches
    const updated = [searchTerm.trim(), ...recentSearches.filter(s => s !== searchTerm.trim())].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('mediot_recent_price_searches', JSON.stringify(updated));

    await onSearch(searchTerm.trim());
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchTerm(suggestion);
    setShowSuggestions(false);
    setIsFocused(false);

    const updated = [suggestion, ...recentSearches.filter(s => s !== suggestion)].slice(0, 3);
    setRecentSearches(updated);
    localStorage.setItem('mediot_recent_price_searches', JSON.stringify(updated));

    onSearch(suggestion);
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Popular medicines for quick search
  const popularMedicines = ['Paracetamol', 'Ibuprofen', 'Amoxicillin'];

  return (
    <div className="relative z-[60]">
      {/* Search Bar Overlay Background */}
      <AnimatePresence>
        {isFocused && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-[55]"
            onClick={() => setIsFocused(false)}
          />
        )}
      </AnimatePresence>

      <div className={`relative transition-all duration-500 ease-out z-[60] ${isFocused ? '-translate-y-2' : ''}`}>
        <form onSubmit={handleSubmit} className="relative" ref={suggestionsRef}>
          <div className={`
            relative bg-white dark:bg-slate-900 rounded-[1.75rem] transition-all duration-300
            ${isFocused 
              ? 'shadow-2xl shadow-primary-500/20 scale-[1.02]' 
              : 'shadow-lg shadow-black/5'
            }
          `}>
            <div className="flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={handleInputChange}
                onFocus={() => { 
                  setIsFocused(true); 
                  setShowSuggestions(true);
                }}
                className="flex-1 py-4 pl-6 pr-2 bg-transparent text-slate-900 dark:text-white font-bold placeholder-slate-400 text-[15px]"
                style={{ 
                  outline: 'none', 
                  border: 'none', 
                  boxShadow: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  appearance: 'none'
                }}
                placeholder={t('price.searchPlaceholder')}
                autoComplete="off"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={handleClear}
                  className="p-2 mr-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              )}
              <button
                type="submit"
                disabled={isSearching || !searchTerm.trim()}
                className="mr-2 w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all active:scale-90 flex-shrink-0"
              >
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <MagnifyingGlassIcon className="w-5 h-5 stroke-[2.5]" />
                )}
              </button>
            </div>
          </div>

          {/* Combined Suggestions Dropdown */}
          <AnimatePresence>
            {isFocused && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden z-[70]"
              >
                <div className="p-3 space-y-4">
                  {/* Real-time Suggestions (Only if typing) */}
                  {searchTerm.length >= 2 && suggestions.length > 0 && (
                    <div>
                      <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {t('price.resultsFor', { query: searchTerm })}
                      </p>
                      <div className="space-y-1">
                        {suggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-primary-50 dark:hover:bg-primary-950/20 rounded-xl transition-colors text-left group"
                          >
                            <div className="w-8 h-8 bg-primary-50 dark:bg-primary-950/30 rounded-lg flex items-center justify-center flex-shrink-0">
                              <SparklesIcon className="w-4 h-4 text-primary-500" />
                            </div>
                            <span className="text-sm font-bold text-slate-900 dark:text-white flex-1 truncate capitalize">
                              {suggestion}
                            </span>
                            <ArrowRightIcon className="w-4 h-4 text-slate-300 group-hover:text-primary-500 transition-colors" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* History & Popular (If not typing or no suggestions) */}
                  {searchTerm.length < 2 && (
                    <div className="space-y-4">
                      {/* Recent Searches */}
                      {recentSearches.length > 0 && (
                        <div>
                          <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                            {t('price.recentSearches')}
                          </p>
                          <div className="flex flex-wrap gap-2 px-3">
                            {recentSearches.map((search, idx) => (
                              <button
                                key={idx}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => handleSuggestionClick(search)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:border-primary-200 transition-all"
                              >
                                <ClockIcon className="w-3.5 h-3.5" />
                                <span className="truncate max-w-[100px]">{search}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Popular Medicines */}
                      <div>
                        <p className="px-3 py-2 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          {t('price.popular')}
                        </p>
                        <div className="flex flex-wrap gap-2 px-3 pb-2">
                          {popularMedicines.map((medicine, idx) => (
                            <button
                              key={idx}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSuggestionClick(medicine)}
                              className="px-3 py-2 bg-primary-50 dark:bg-primary-950/20 border border-primary-100 dark:border-primary-900/30 rounded-xl text-xs font-bold text-primary-700 dark:text-primary-400 hover:bg-primary-100 transition-all"
                            >
                              {medicine}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>
    </div>
  );
};

MedicineSearch.propTypes = {
  onSearch: PropTypes.func.isRequired,
  isSearching: PropTypes.bool
};

export default MedicineSearch;
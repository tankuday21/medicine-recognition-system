import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const SymptomInput = ({ onSymptomSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Don't search for very short queries
    if (query.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    // Debounce search
    searchTimeoutRef.current = setTimeout(() => {
      searchSymptoms(query.trim());
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [query]);

  const searchSymptoms = async (searchQuery) => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/symptoms/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();

      if (data.success) {
        setResults(data.data);
        setShowResults(true);
      } else {
        setError(data.message);
        setResults([]);
      }
    } catch (error) {
      console.error('Symptom search error:', error);
      setError('Failed to search symptoms');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    onSymptomSelect(symptom);
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleInputFocus = () => {
    if (results.length > 0) {
      setShowResults(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding results to allow clicking on them
    setTimeout(() => {
      setShowResults(false);
    }, 200);
  };

  const getCategoryColor = (category) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      neurological: 'bg-purple-100 text-purple-800',
      respiratory: 'bg-green-100 text-green-800',
      cardiovascular: 'bg-red-100 text-red-800',
      gastrointestinal: 'bg-yellow-100 text-yellow-800',
      musculoskeletal: 'bg-indigo-100 text-indigo-800',
      dermatological: 'bg-pink-100 text-pink-800',
      ent: 'bg-orange-100 text-orange-800',
      ophthalmological: 'bg-teal-100 text-teal-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          placeholder="Search symptoms (e.g., headache, fever, cough...)"
        />
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {showResults && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
          {results.length > 0 ? (
            <div className="py-2">
              {results.map((symptom) => (
                <button
                  key={symptom.id}
                  onClick={() => handleSymptomSelect(symptom)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(symptom.category)}`}>
                          {symptom.category}
                        </span>
                        <span className="text-xs text-gray-500">
                          {symptom.bodyParts.join(', ')}
                        </span>
                      </div>
                    </div>
                    <PlusIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </button>
              ))}
            </div>
          ) : query.trim().length >= 2 && !isLoading ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <p>No symptoms found for "{query}"</p>
              <p className="text-sm mt-1">Try different keywords or browse by body part</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-2 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Search Tips */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Search Tips:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use simple terms like "headache", "fever", "cough"</li>
          <li>• Try synonyms if you don't find what you're looking for</li>
          <li>• You can also browse symptoms by body part below</li>
        </ul>
      </div>
    </div>
  );
};

SymptomInput.propTypes = {
  onSymptomSelect: PropTypes.func.isRequired
};

export default SymptomInput;
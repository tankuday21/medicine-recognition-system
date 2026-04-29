import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  MagnifyingGlassIcon,
  PlusIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const SymptomInput = ({ onSymptomSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [aiResults, setAiResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAISearching, setIsAISearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState('');
  const searchTimeoutRef = useRef(null);
  const aiTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);

    if (query.trim().length < 2) {
      setResults([]);
      setAiResults([]);
      setShowResults(false);
      return;
    }

    // Instant local/fuzzy search (300ms debounce)
    searchTimeoutRef.current = setTimeout(() => {
      searchSymptoms(query.trim());
    }, 300);

    // AI search kicks in after 800ms (gives local search time to show first)
    aiTimeoutRef.current = setTimeout(() => {
      aiSearchSymptoms(query.trim());
    }, 800);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (aiTimeoutRef.current) clearTimeout(aiTimeoutRef.current);
    };
  }, [query]);

  // Regular search (includes fuzzy matching on server)
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
    } catch (err) {
      console.error('Symptom search error:', err);
      setError('Failed to search symptoms');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  // AI-powered search (handles typos, natural language, related suggestions)
  const aiSearchSymptoms = async (searchQuery) => {
    setIsAISearching(true);
    try {
      const response = await fetch('/api/symptoms/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        // Filter out any AI results that already exist in local results
        const localIds = new Set(results.map(r => r.id));
        const unique = data.data.filter(s => !localIds.has(s.id));
        setAiResults(unique);
        setShowResults(true);
      } else {
        setAiResults([]);
      }
    } catch (err) {
      console.error('AI symptom search error:', err);
      setAiResults([]);
    } finally {
      setIsAISearching(false);
    }
  };

  const handleSymptomSelect = (symptom) => {
    onSymptomSelect(symptom);
    setQuery('');
    setResults([]);
    setAiResults([]);
    setShowResults(false);
    if (inputRef.current) inputRef.current.focus();
  };

  const getCategoryStyles = (category) => {
    const styles = {
      general: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      neurological: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      respiratory: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      cardiovascular: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      gastrointestinal: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      musculoskeletal: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      dermatological: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300',
      ent: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      ophthalmological: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300'
    };
    return styles[category] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const allResults = [...results, ...aiResults];
  const hasAny = allResults.length > 0;

  return (
    <div className="relative space-y-4">
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <MagnifyingGlassIcon className={`h-5 w-5 transition-colors ${query ? 'text-primary-500' : 'text-slate-400'}`} />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => allResults.length > 0 && setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="w-full !pl-12 pr-12 py-4 bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary-500/50 focus:bg-white dark:focus:bg-slate-800 rounded-2xl text-sm font-bold transition-all shadow-sm"
          placeholder="Try 'hedache', 'stomac ache', 'feeling dizzy'..."
        />

        <div className="absolute inset-y-0 right-0 pr-4 flex items-center gap-2">
          {(isLoading || isAISearching) ? (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 border-2 border-primary-500/20 border-t-primary-500 rounded-full animate-spin" />
              {isAISearching && <span className="text-[9px] font-bold text-primary-500 uppercase">AI</span>}
            </div>
          ) : (
            <SparklesIcon className="w-5 h-5 text-slate-300 group-hover:text-primary-500/50 transition-colors" />
          )}
        </div>

        {/* Dropdown Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute z-[100] w-full mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-h-96 overflow-y-auto custom-scrollbar p-2"
            >
              {hasAny ? (
                <div className="space-y-1">
                  {/* Local / fuzzy results */}
                  {results.map((symptom) => (
                    <button
                      key={`local-${symptom.id}`}
                      onClick={() => handleSymptomSelect(symptom)}
                      className="w-full px-4 py-3 text-left hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-2xl transition-all flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <h4 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-primary-600 transition-colors">{symptom.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${getCategoryStyles(symptom.category)}`}>
                            {symptom.category}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 capitalize">
                            {symptom.bodyParts?.join(', ')}
                          </span>
                        </div>
                      </div>
                      <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary-500 group-hover:text-white transition-all">
                        <PlusIcon className="h-4 w-4 stroke-[3]" />
                      </div>
                    </button>
                  ))}

                  {/* AI-suggested results */}
                  {aiResults.length > 0 && (
                    <>
                      <div className="px-4 pt-2 pb-1 flex items-center gap-2">
                        <SparklesIcon className="w-3.5 h-3.5 text-purple-500" />
                        <span className="text-[9px] font-black text-purple-500 uppercase tracking-widest">AI Suggestions</span>
                        <div className="flex-1 h-px bg-purple-100 dark:bg-purple-900" />
                      </div>
                      {aiResults.map((symptom) => (
                        <button
                          key={`ai-${symptom.id}`}
                          onClick={() => handleSymptomSelect(symptom)}
                          className="w-full px-4 py-3 text-left hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-2xl transition-all flex items-center justify-between group"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-black text-slate-900 dark:text-white text-sm group-hover:text-purple-600 transition-colors">{symptom.name}</h4>
                              {symptom.isRelated && (
                                <span className="text-[8px] font-black text-purple-500 bg-purple-50 px-1.5 py-0.5 rounded uppercase">Related</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-md ${getCategoryStyles(symptom.category)}`}>
                                {symptom.category}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 capitalize">
                                {symptom.bodyParts?.join(', ')}
                              </span>
                            </div>
                          </div>
                          <div className="w-7 h-7 rounded-full bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-all">
                            <PlusIcon className="h-4 w-4 stroke-[3]" />
                          </div>
                        </button>
                      ))}
                    </>
                  )}

                  {/* Still loading AI? */}
                  {isAISearching && results.length > 0 && (
                    <div className="px-4 py-2 flex items-center gap-2">
                      <div className="w-3 h-3 border-2 border-purple-300 border-t-purple-500 rounded-full animate-spin" />
                      <span className="text-[10px] font-bold text-purple-400">AI finding more suggestions...</span>
                    </div>
                  )}
                </div>
              ) : query.trim().length >= 2 && !isLoading ? (
                <div className="px-4 py-6 text-center">
                  {isAISearching ? (
                    <>
                      <div className="w-6 h-6 border-2 border-purple-300 border-t-purple-500 rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs font-bold text-purple-500">AI is searching for symptoms...</p>
                      <p className="text-[10px] text-slate-400 mt-1">Handles typos and natural language</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Matches Found</p>
                      <p className="text-xs font-bold text-slate-400 mt-1">Try another term or browse body parts below</p>
                    </>
                  )}
                </div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="px-2 text-xs font-bold text-rose-500">
          {error}
        </motion.div>
      )}

      {/* Quick Tips */}
      <div className="p-4 bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-transparent hover:border-slate-200 dark:hover:border-slate-800 transition-all">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
          <InformationCircleIcon className="w-4 h-4" />
          Smart Search Tips
        </h4>
        <div className="grid grid-cols-1 gap-1.5">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <div className="w-1 h-1 bg-primary-500 rounded-full" />
            Typos OK — "hedache" finds Headache
          </div>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
            <div className="w-1 h-1 bg-purple-500 rounded-full" />
            AI suggests related symptoms automatically
          </div>
        </div>
      </div>
    </div>
  );
};

SymptomInput.propTypes = {
  onSymptomSelect: PropTypes.func.isRequired
};

export default SymptomInput;
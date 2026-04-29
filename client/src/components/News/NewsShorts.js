import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  XMarkIcon, 
  ChevronUpIcon, 
  ChevronDownIcon, 
  ArrowTopRightOnSquareIcon,
  HeartIcon as HeartOutline,
  BookmarkIcon as BookmarkOutline,
  ShareIcon,
  SparklesIcon,
  ClockIcon,
  GlobeAltIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, BookmarkIcon as BookmarkSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import { useLayout } from '../../contexts/LayoutContext';

const swipeConfidenceThreshold = 10000;
const swipePower = (offset, velocity) => {
  return Math.abs(offset) * velocity;
};

/**
 * NewsShorts: Immersive, editorial news feed with DeepSeek AI summarization.
 * Automatically generates editorial summaries for each article for a premium experience.
 */
const NewsShorts = ({ articles, initialSummaries = {}, onClose, fetchMore, hasMore, isLoading, selectedCountry, onCountryChange, selectedCategory, onCategoryChange }) => {
  const { setHideBottomNav } = useLayout();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [tuple, setTuple] = useState([0, 0]);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const lastTap = useRef(0);

  // AI State
  const [aiSummaries, setAiSummaries] = useState(initialSummaries); 
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isFirstSummarizing, setIsFirstSummarizing] = useState(false);

  // Interaction States
  const [likedArticles, setLikedArticles] = useState(() => JSON.parse(localStorage.getItem('likedNews') || '[]'));
  const [savedArticles, setSavedArticles] = useState(() => JSON.parse(localStorage.getItem('savedNews') || '[]'));
  const [seenArticles, setSeenArticles] = useState(() => JSON.parse(localStorage.getItem('seenNews') || '[]'));
  
  // New Filter State
  const [filterDate, setFilterDate] = useState('all'); // all, today, week
  const [showFilters, setShowFilters] = useState(false);

  // Pending filter states for the modal
  const [pendingCountry, setPendingCountry] = useState(selectedCountry);
  const [pendingCategory, setPendingCategory] = useState(selectedCategory);
  const [pendingDate, setPendingDate] = useState(filterDate);

  // Update pending state when modal opens
  useEffect(() => {
    if (showFilters) {
      setPendingCountry(selectedCountry);
      setPendingCategory(selectedCategory);
      setPendingDate(filterDate);
    }
  }, [showFilters, selectedCountry, selectedCategory, filterDate]);
  
  // Reset index when articles change
  useEffect(() => {
    setCurrentIndex(0);
  }, [articles]);

  const DURATION = 20000; 

  // Stabilize validArticles: Filter by 'seen' only once on mount
  // to prevent the feed from jumping when an article is marked as seen.
  const validArticles = useMemo(() => {
    const initialSeen = JSON.parse(localStorage.getItem('seenNews') || '[]');
    return articles.filter(a => {
      const basic = a.urlToImage && a.title && !initialSeen.includes(a.url);
      if (!basic) return false;

      // Filter by Date
      if (filterDate !== 'all') {
        const pubDate = new Date(a.publishedAt);
        const now = new Date();
        if (filterDate === 'today') {
          if (pubDate.toDateString() !== now.toDateString()) return false;
        } else if (filterDate === 'week') {
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          if (pubDate < weekAgo) return false;
        }
      }

      return true;
    });
  }, [articles, filterDate]); // Only re-run if the base articles prop or date filter changes

  // Sync tuple for animation
  if (tuple[1] !== currentIndex) {
    setTuple([tuple[1], currentIndex]);
  }

  // Continuous AI Summarization
  useEffect(() => {
    // Check if we need to summarize the CURRENT article immediately
    if (validArticles[currentIndex] && !aiSummaries[validArticles[currentIndex].url] && !isSummarizing) {
      const currentArticle = validArticles[currentIndex];
      
      // If it's the very first article and not summarized, show special loading
      if (currentIndex === 0) {
        setIsFirstSummarizing(true);
      }
      
      const batch = validArticles.slice(currentIndex, currentIndex + 10);
      summarizeBatch(batch);
    }
    
    // Background batching
    const summarizeThreshold = 3;
    const currentSummarizedCount = Object.keys(aiSummaries).length;
    
    if (currentIndex >= currentSummarizedCount - summarizeThreshold && !isSummarizing) {
      const startIndex = currentSummarizedCount;
      const nextBatch = validArticles.slice(startIndex, startIndex + 10);
      
      if (nextBatch.length > 0) {
        summarizeBatch(nextBatch);
      }
    }
  }, [currentIndex, validArticles, aiSummaries, isSummarizing]);

  const summarizeBatch = async (batch) => {
    try {
      setIsSummarizing(true);
      const response = await api.post('/news/summarize', { articles: batch });
      
      if (response.data.success) {
        const summaries = response.data.data;
        const newSummaries = {};
        batch.forEach((article, index) => {
          if (summaries[index]) {
            newSummaries[article.url] = summaries[index];
          }
        });
        setAiSummaries(prev => ({ ...prev, ...newSummaries }));
      }
    } catch (error) {
      console.error('🤖 AI: Batch summarization failed:', error);
    } finally {
      setIsSummarizing(false);
      setIsFirstSummarizing(false);
    }
  };

  // Seen tracking - update localStorage but don't trigger a re-filter of validArticles
  useEffect(() => {
    if (validArticles[currentIndex]) {
      const url = validArticles[currentIndex].url;
      const seen = JSON.parse(localStorage.getItem('seenNews') || '[]');
      if (!seen.includes(url)) {
        seen.push(url);
        localStorage.setItem('seenNews', JSON.stringify(seen));
        // We update the state just to keep track, but it won't affect the memoized validArticles 
        // because seenArticles is no longer a dependency of the filter.
        setSeenArticles(seen);
      }
    }
  }, [currentIndex, validArticles]);

  // Hide Nav & Scroll Lock
  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow;
    const originalHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    setHideBottomNav(true);

    return () => {
      document.body.style.overflow = originalBodyOverflow;
      document.documentElement.style.overflow = originalHtmlOverflow;
      setHideBottomNav(false);
    };
  }, [setHideBottomNav]);

  // Timer Logic
  useEffect(() => {
    // Determine if we have a summary for the current article
    const currentArticle = validArticles[currentIndex];
    const hasSummary = currentArticle && aiSummaries[currentArticle.url];

    // Pause timer if manually paused, no articles, OR if AI summary is still pending
    if (isPaused || validArticles.length === 0 || (!hasSummary && articles.length > 0)) {
      return;
    }

    const intervalTime = 200; // Reduced frequency for better mobile performance
    const step = (intervalTime / DURATION) * 100;
    const timer = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          if (currentIndex < validArticles.length - 1) {
            setCurrentIndex(c => c + 1);
            return 0; 
          }
          return 100;
        }
        return p + step;
      });
    }, intervalTime);
    return () => clearInterval(timer);
  }, [currentIndex, isPaused, validArticles.length, aiSummaries, articles.length]);

  useEffect(() => { setProgress(0); }, [currentIndex]);

  const handleNext = () => currentIndex < validArticles.length - 1 && setCurrentIndex(prev => prev + 1);
  const handlePrev = () => currentIndex > 0 && setCurrentIndex(prev => prev - 1);

  const toggleLike = (url) => {
    setLikedArticles(prev => {
      const next = prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url];
      localStorage.setItem('likedNews', JSON.stringify(next));
      return next;
    });
  };

  const toggleSave = (url) => {
    setSavedArticles(prev => {
      const next = prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url];
      localStorage.setItem('savedNews', JSON.stringify(next));
      return next;
    });
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const article = validArticles[currentIndex];
      if (!likedArticles.includes(article.url)) toggleLike(article.url);
      setShowHeartAnimation(true);
      setTimeout(() => setShowHeartAnimation(false), 1000);
    }
    lastTap.current = now;
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} • ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  if (validArticles.length === 0) {
    if (articles.length > 0) {
       return (
         <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center">
           <div className="bg-white rounded-[2rem] p-8 text-center max-w-xs">
             <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
               <FunnelIcon className="w-8 h-8 text-primary-600" />
             </div>
             <h3 className="text-xl font-black text-slate-900 mb-2">No matching Snips</h3>
             <p className="text-slate-500 text-sm mb-6">Try adjusting your filters or region to see more health news.</p>
             <button onClick={() => { setFilterDate('all'); onCountryChange('us'); }} className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold">Reset Filters</button>
             <button onClick={onClose} className="w-full py-3 mt-2 text-slate-500 font-bold">Close Snips</button>
           </div>
         </div>
       );
    }
    return null;
  }

  const article = validArticles[currentIndex];
  const direction = currentIndex > tuple[0] ? 1 : -1;
  const isLiked = likedArticles.includes(article.url);
  const isSaved = savedArticles.includes(article.url);
  
  const displayTitle = aiSummaries[article.url] || article.title;
  const isAISummarized = !!aiSummaries[article.url];

  const variants = {
    enter: (direction) => ({ y: direction > 0 ? 1000 : -1000, opacity: 0 }),
    center: { zIndex: 1, y: 0, opacity: 1 },
    exit: (direction) => ({ zIndex: 0, y: direction < 0 ? 1000 : -1000, opacity: 0 })
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xl flex items-center justify-center overflow-hidden font-sans select-none touch-none">
      
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-200 z-[110] overflow-hidden">
          <div className="h-full bg-primary-600 shadow-[0_0_10px_rgba(37,99,235,0.5)] transition-all ease-linear duration-100" style={{ width: `${progress}%` }} />
      </div>

      <div className="relative w-full h-full sm:w-[420px] sm:h-[85vh] sm:rounded-[3rem] overflow-hidden bg-[#FAF9F6] shadow-2xl flex flex-col border border-white/20">
        

        <div className="absolute top-4 left-6 right-6 z-50 flex justify-between items-center pointer-events-none">
           <div className="flex flex-col">
             <div className="flex items-center">
               <span className="text-slate-900 flex items-baseline select-none">
                 <span style={{ fontFamily: 'Allura', fontSize: '3.5rem' }} className="leading-none drop-shadow-sm">S</span>
                 <span style={{ fontFamily: 'DM Serif Display', fontStyle: 'italic' }} className="text-2xl ml-[-2px] tracking-tight drop-shadow-sm">nips</span>
               </span>
             </div>
           </div>
           <div className="flex gap-2 items-center pointer-events-auto">
             <button onClick={onClose} className="p-2 bg-white/60 backdrop-blur-md rounded-full text-slate-700 hover:bg-white transition-all pointer-events-auto shadow-md border border-white active:scale-90">
               <XMarkIcon className="w-4 h-4" />
             </button>
           </div>
        </div>

        {/* Filters Modal */}
        <AnimatePresence>
          {showFilters && (
            <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowFilters(false)}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden z-[160]"
              >
                <div className="p-6 pb-2 flex justify-between items-center">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Personalize Feed</h3>
                  <button onClick={() => setShowFilters(false)} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full text-slate-500"><XMarkIcon className="w-5 h-5" /></button>
                </div>

                <div className="p-6 pt-2 space-y-6 max-h-[60vh] overflow-y-auto no-scrollbar">
                  {/* Category Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <SparklesIcon className="w-4 h-4 text-primary-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Topic</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'health', name: 'Health' },
                        { id: 'science', name: 'Science' },
                        { id: 'technology', name: 'Tech' },
                        { id: 'business', name: 'Business' },
                        { id: 'entertainment', name: 'Entertainment' },
                        { id: 'sports', name: 'Sports' },
                        { id: 'general', name: 'General' }
                      ].map(cat => (
                        <button 
                          key={cat.id} 
                          onClick={() => setPendingCategory(cat.id)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${pendingCategory === cat.id ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Region Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <GlobeAltIcon className="w-4 h-4 text-indigo-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Region</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'us', name: 'United States', flag: '🇺🇸' },
                        { id: 'in', name: 'India', flag: '🇮🇳' },
                        { id: 'gb', name: 'United Kingdom', flag: '🇬🇧' },
                        { id: 'ca', name: 'Canada', flag: '🇨🇦' },
                        { id: 'au', name: 'Australia', flag: '🇦🇺' }
                      ].map(reg => (
                        <button 
                          key={reg.id} 
                          onClick={() => setPendingCountry(reg.id)}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-[10px] font-bold transition-all ${pendingCountry === reg.id ? 'bg-indigo-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                          <span className="text-base">{reg.flag}</span>
                          <span className="truncate">{reg.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Date Filter */}
                  <div>
                    <div className="flex items-center gap-2 mb-3 ml-1">
                      <CalendarIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Timeframe</span>
                    </div>
                    <div className="flex gap-2">
                      {[
                        { id: 'all', label: 'Anytime' },
                        { id: 'today', label: 'Today' },
                        { id: 'week', label: 'This Week' }
                      ].map(d => (
                        <button 
                          key={d.id} 
                          onClick={() => setPendingDate(d.id)}
                          className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${pendingDate === d.id ? 'bg-emerald-600 text-white shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                        >
                          {d.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 flex flex-col gap-3">
                   <button 
                     onClick={() => {
                       onCategoryChange(pendingCategory);
                       onCountryChange(pendingCountry);
                       setFilterDate(pendingDate);
                       setShowFilters(false);
                     }}
                     className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all"
                   >
                     Apply Filters
                   </button>
                   <button 
                     onClick={() => { 
                       setPendingCategory('health'); 
                       setPendingCountry('us'); 
                       setPendingDate('all'); 
                     }} 
                     className="w-full py-2 text-slate-500 dark:text-slate-400 font-bold text-[10px] uppercase tracking-widest"
                   >
                     Reset Selections
                   </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={`shorts-${currentIndex}`}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ y: { type: "spring", stiffness: 350, damping: 35 }, opacity: { duration: 0.2 } }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, { offset, velocity }) => {
              const swipe = swipePower(offset.y, velocity.y);
              if (swipe < -swipeConfidenceThreshold) handleNext();
              else if (swipe > swipeConfidenceThreshold) handlePrev();
            }}
            onPointerDown={() => setIsPaused(true)}
            onPointerUp={() => setIsPaused(false)}
            onClick={handleDoubleTap}
            className="absolute inset-0 w-full h-full flex flex-col z-10 cursor-pointer"
          >
            <div className="h-[35%] w-full relative p-6 pt-16 pb-2 flex items-center justify-center pointer-events-none">
               <div className="relative w-full h-full rounded-[2rem] overflow-hidden shadow-2xl border-2 border-white">
                                   <motion.img 
                    key={article.url}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    src={article.urlToImage} 
                    alt={article.title} 
                    className="w-full h-full object-cover" 
                    draggable={false}
                    loading="eager"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://images.unsplash.com/photo-1576091160550-2173bdb999ef?q=80&w=1000&auto=format&fit=crop';
                    }}
                  />

                 
                 <AnimatePresence>
                    {showHeartAnimation && (
                      <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1.5, opacity: 1 }} exit={{ scale: 2, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                         <HeartSolid className="w-20 h-20 text-red-500 drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
                      </motion.div>
                    )}
                 </AnimatePresence>


               </div>
            </div>

            {/* Horizontal Action Bar */}
            <div className="px-6 flex items-center gap-5 z-30 mb-2">
               <button onClick={(e) => { e.stopPropagation(); toggleLike(article.url); }} className="flex items-center gap-1.5 group">
                  <div className={`p-1.5 rounded-full transition-all ${isLiked ? 'bg-red-50 text-red-500' : 'bg-slate-100 text-slate-500'}`}>
                    {isLiked ? <HeartSolid className="w-4 h-4" /> : <HeartOutline className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tight ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>Like</span>
               </button>

               <button onClick={(e) => { e.stopPropagation(); toggleSave(article.url); }} className="flex items-center gap-1.5 group">
                  <div className={`p-1.5 rounded-full transition-all ${isSaved ? 'bg-primary-50 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    {isSaved ? <BookmarkSolid className="w-4 h-4" /> : <BookmarkOutline className="w-4 h-4" />}
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-tight ${isSaved ? 'text-primary-600' : 'text-slate-500'}`}>Save</span>
               </button>

               <button onClick={(e) => { e.stopPropagation(); if (navigator.share) navigator.share({ title: article.title, url: article.url }); }} className="flex items-center gap-1.5 group">
                  <div className="p-1.5 bg-slate-100 text-slate-500 rounded-full">
                    <ShareIcon className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">Share</span>
               </button>
            </div>

            <div className="h-[65%] w-full px-6 pb-16 flex flex-col relative z-20 pointer-events-none">
               <div className="flex-1 flex flex-col justify-start pt-2 overflow-y-auto no-scrollbar">
                  {/* Original Title for Context */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 whitespace-nowrap">
                      {article.provider ? `${article.provider}` : (article.source?.name || 'News')}
                    </span>
                    <span className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                      <ClockIcon className="w-3 h-3 text-primary-500" />
                      {formatDateTime(article.publishedAt)}
                    </span>
                    {article.country && (
                      <span className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[9px] font-black uppercase tracking-widest rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 whitespace-nowrap">
                        <GlobeAltIcon className="w-3 h-3 text-indigo-500" />
                        {article.country.toUpperCase()}
                      </span>
                    )}
                  </div>

                   <div className="min-h-[160px] flex flex-col justify-start">
                    {isFirstSummarizing ? (
                      <div className="space-y-3 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded-full w-full"></div>
                        <div className="h-4 bg-slate-200 rounded-full w-5/6"></div>
                        <div className="h-4 bg-slate-200 rounded-full w-4/6"></div>
                        <div className="h-4 bg-slate-100 rounded-full w-5/6 pt-8"></div>
                        <div className="h-3 bg-slate-100 rounded-full w-2/6"></div>
                      </div>
                    ) : (
                      <p className="text-slate-900 text-sm sm:text-base font-bold leading-relaxed text-left">
                        {displayTitle}
                      </p>
                    )}
                   </div>
               </div>

               <div className="absolute bottom-[5.5rem] left-0 right-0 flex justify-center items-center gap-1.5 opacity-40">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Hold to pause</span>
               </div>

                <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between pointer-events-auto">
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePrev(); }} 
                      disabled={currentIndex === 0} 
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border shadow-lg ${currentIndex === 0 ? 'bg-slate-100/50 border-slate-100 text-slate-300' : 'bg-white/90 backdrop-blur-md border-white/20 text-slate-900 hover:bg-white active:scale-90'}`}
                    >
                      <ChevronUpIcon className="w-6 h-6 stroke-[2.5]" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleNext(); }} 
                      disabled={currentIndex === validArticles.length - 1 && !hasMore} 
                      className={`w-12 h-12 flex items-center justify-center rounded-full transition-all border shadow-lg ${currentIndex === validArticles.length - 1 && !hasMore ? 'bg-slate-100/50 border-slate-100 text-slate-300' : 'bg-white/90 backdrop-blur-md border-white/20 text-slate-900 hover:bg-white active:scale-90'}`}
                    >
                      <ChevronDownIcon className="w-6 h-6 stroke-[2.5]" />
                    </button>
                  </div>
                  
                  <div className="relative flex flex-col items-end gap-3">
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowFilters(true); }} 
                      className="w-12 h-12 flex items-center justify-center bg-white/90 backdrop-blur-md border border-white/20 text-slate-900 rounded-full shadow-lg hover:bg-white active:scale-90 transition-all group"
                    >
                      <FunnelIcon className="w-5 h-5 stroke-[2.5] group-hover:rotate-12 transition-transform" />
                    </button>
                    
                    <button onClick={(e) => { e.stopPropagation(); window.open(article.url, '_blank'); }} className="flex items-center gap-3 px-7 py-4 bg-slate-900 text-white rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-black transition-all active:scale-95 shadow-2xl">
                      Full Story
                      <ArrowTopRightOnSquareIcon className="w-4 h-4 stroke-[3]" />
                    </button>
                  </div>
                </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default NewsShorts;

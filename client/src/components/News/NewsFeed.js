import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookmarkIcon, 
  ShareIcon, 
  ClockIcon, 
  ArrowTopRightOnSquareIcon, 
  FireIcon
} from '@heroicons/react/24/outline';
import { BoltIcon } from '@heroicons/react/24/solid';
import { SkeletonCard, EmptyState, Alert } from '../ui/PremiumComponents';
import { useLanguage } from '../../contexts/LanguageContext';
import api from '../../services/api';
import NewsShorts from './NewsShorts';

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 400, damping: 30 } }
};

const NewsFeed = ({ searchQuery = '', selectedCategory = 'health', selectedCountry = 'us', onCountryChange, onCategoryChange }) => {
  const { t } = useLanguage();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showShorts, setShowShorts] = useState(false);
  const [initialSummaries, setInitialSummaries] = useState({});
  const [isPreSummarizing, setIsPreSummarizing] = useState(false);

  const observerTarget = useRef(null);

  const loadNews = useCallback(async (pageNum = 1, reset = false) => {
    if (loading && pageNum > 1) return;
    setLoading(true);
    setError('');

    try {
      let url = searchQuery ? '/api/news/search' : '/api/news/health';
      let params = new URLSearchParams({
        page: pageNum,
        pageSize: 20,
        ...(searchQuery ? { q: searchQuery } : { category: selectedCategory, country: selectedCountry })
      });

      const response = await fetch(`${url}?${params}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && { 'Authorization': `Bearer ${localStorage.getItem('token')}` })
        }
      });

      const data = await response.json();
      if (data.success) {
        const newArticles = (data.data.articles || []).filter(a => a.title);
        
        setArticles(prev => {
          const combined = reset ? newArticles : [...prev, ...newArticles];
          const unique = combined.filter((v, i, a) => a.findIndex(t => (t.url === v.url)) === i);
          return unique;
        });
        
        setHasMore(newArticles.length > 0);
        setPage(pageNum);
      } else {
        setError(data.message || 'Failed to load news');
      }
    } catch (err) {
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, selectedCountry]);

  useEffect(() => {
    loadNews(1, true);
  }, [searchQuery, selectedCategory, selectedCountry]);

  // Pre-summarize first 10 articles in the background
  useEffect(() => {
    const triggerPreSummarize = async () => {
      if (articles.length >= 5 && Object.keys(initialSummaries).length === 0 && !isPreSummarizing) {
        try {
          setIsPreSummarizing(true);
          const batch = articles.slice(0, 10);
          console.log('🤖 Background: Pre-summarizing 10 articles for Snips...');
          const response = await api.post('/news/summarize', { articles: batch });
          
          if (response.data.success) {
            const summaries = response.data.data;
            const newSummaries = {};
            batch.forEach((article, index) => {
              if (summaries[index]) {
                newSummaries[article.url] = summaries[index];
              }
            });
            setInitialSummaries(newSummaries);
            console.log('✅ Background: Pre-summarization complete.');
          }
        } catch (err) {
          console.warn('Background summarization failed:', err.message);
        } finally {
          setIsPreSummarizing(false);
        }
      }
    };

    triggerPreSummarize();
  }, [articles, initialSummaries, isPreSummarizing]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) loadNews(page + 1, false);
      },
      { threshold: 0.1 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading, page, loadNews]);

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({ title: article.title, text: article.description, url: article.url });
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Recent';
    const diff = Math.floor((new Date() - new Date(dateString)) / (1000 * 60));
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  if (error && articles.length === 0) {
    return (
      <div className="p-5">
        <Alert type="error" title="Oops!" message={error} action={<button onClick={() => loadNews(1, true)}>Retry</button>} />
      </div>
    );
  }

  const heroArticle = articles[0];
  const secondaryArticles = articles.slice(1, 4); 
  const listArticles = articles.slice(4);

  return (
    <div className="pb-10 pt-4">
      {loading && articles.length === 0 && (
        <div className="p-4 space-y-4">
          <SkeletonCard lines={4} />
          <SkeletonCard lines={2} />
        </div>
      )}

      {!loading && articles.length === 0 && !error && (
        <div className="p-5">
          <EmptyState title="No News Found" description="Try a different topic or category." />
        </div>
      )}

      {/* Advanced Layout */}
      {articles.length > 0 && (
        <>
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* Main Hero Card (Large) */}
            {heroArticle && (
              <div className="px-4">
                <motion.div 
                  variants={itemVariants}
                  onClick={() => window.open(heroArticle.url, '_blank')}
                  className="relative w-full aspect-[3/2] sm:aspect-[21/9] rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer block"
                >
                  {heroArticle.urlToImage ? (
                    <img 
                      src={heroArticle.urlToImage} 
                      alt={heroArticle.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      loading="eager"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80';
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-tr from-primary-600 to-violet-600" />
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                    <div className="flex items-center justify-between mb-3">
                      <span className="px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-white/20 backdrop-blur-md border border-white/20 text-white rounded-xl">
                        Featured
                      </span>
                      <button onClick={(e) => { e.stopPropagation(); handleShare(heroArticle); }} className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/10">
                        <ShareIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <h2 className="text-white text-xl sm:text-2xl font-black leading-tight mb-2 line-clamp-3 font-display drop-shadow-lg">
                      {heroArticle.title}
                    </h2>
                    <div className="flex items-center gap-2 text-white/80 text-xs font-medium">
                      <span className="truncate max-w-[150px]">{heroArticle.source?.name || 'Medical News'}</span>
                      <span className="w-1 h-1 rounded-full bg-primary-500"></span>
                      <span className="flex items-center gap-1">
                        <ClockIcon className="w-3 h-3" />
                        {formatTimeAgo(heroArticle.publishedAt)}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}

            {/* Horizontal Scrolling Highlights */}
            {secondaryArticles.length > 0 && (
              <div className="pl-4">
                <div className="flex gap-4 overflow-x-auto pb-4 pr-4 no-scrollbar">
                  {secondaryArticles.map((article, idx) => (
                    <motion.div 
                      variants={itemVariants}
                      key={idx}
                      onClick={() => window.open(article.url, '_blank')}
                      className="relative w-60 sm:w-72 flex-none aspect-[4/3] rounded-[2rem] overflow-hidden shadow-lg group cursor-pointer block"
                    >
                      {article.urlToImage ? (
                        <img 
                          src={article.urlToImage} 
                          alt={article.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-800 to-slate-900" />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent pointer-events-none" />
                      
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-white font-bold text-sm leading-snug line-clamp-3 mb-1.5 drop-shadow-md">
                          {article.title}
                        </h3>
                        <p className="text-primary-400 text-[9px] font-black uppercase tracking-wider">
                          {formatTimeAgo(article.publishedAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Liquid Compact List */}
            {listArticles.length > 0 && (
              <div className="px-4 space-y-4">
                <h3 className="text-lg font-black text-slate-900 dark:text-white font-display ml-1 mb-1">Trending Topics</h3>
                {listArticles.map((article, idx) => (
                  <motion.div 
                    variants={itemVariants}
                    key={idx}
                    onClick={() => window.open(article.url, '_blank')}
                    className="flex items-stretch gap-4 p-2.5 rounded-[2rem] bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 shadow-premium group cursor-pointer transition-all active:scale-[0.98]"
                  >
                    <div className="w-24 h-24 flex-shrink-0 rounded-[1.5rem] overflow-hidden relative block">
                      {article.urlToImage ? (
                        <img 
                          src={article.urlToImage} 
                          alt={article.title} 
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?w=400&q=80';
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 w-full h-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center">
                           <FireIcon className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-1 pr-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug line-clamp-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {article.title}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-2">
                        <span className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate max-w-[90px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                          {article.source?.name || 'Health'}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                        <span className="text-[9px] font-bold text-primary-500 truncate">
                          {formatTimeAgo(article.publishedAt)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Snips Entry FAB */}
          <div className="fixed bottom-24 right-6 z-40">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowShorts(true)}
            className="relative group flex items-center gap-3 pl-5 pr-2 py-2 bg-white text-slate-900 rounded-full shadow-2xl border-2 border-black overflow-hidden"
          >
            <div className="flex flex-col items-start relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest leading-none text-slate-500">Discover</span>
              <span className="text-[14px] font-black tracking-tight text-slate-900">Read Snips</span>
            </div>
            <div className="relative z-10 flex-shrink-0">
              <img src="/snips_logo_official.png" alt="Snips" className="w-9 h-9 object-contain rounded-full border border-slate-100 shadow-sm" />
            </div>
          </motion.button>
          </div>

          <AnimatePresence>
            {showShorts && (
              <NewsShorts 
                articles={articles} 
                initialSummaries={initialSummaries}
                onClose={() => setShowShorts(false)} 
                fetchMore={() => loadNews(page + 1, false)}
                hasMore={hasMore}
                isLoading={loading}
                selectedCountry={selectedCountry}
                onCountryChange={onCountryChange}
                selectedCategory={selectedCategory}
                onCategoryChange={onCategoryChange}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {hasMore && !loading && <div ref={observerTarget} className="h-10" />}
      {loading && articles.length > 0 && (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
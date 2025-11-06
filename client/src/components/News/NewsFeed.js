import React, { useState, useEffect, useCallback } from 'react';
import NewsCard from './NewsCard';
import NewsFilters from './NewsFilters';
import {
  NewspaperIcon,
  MagnifyingGlassIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';

const NewsFeed = ({ category = 'general', searchQuery = '', personalized = false, userId = null }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalResults, setTotalResults] = useState(0);
  const [filters, setFilters] = useState({
    category: category,
    sortBy: 'publishedAt',
    language: 'en'
  });

  const loadNews = useCallback(async (pageNum = 1, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError('');

    try {
      let url, params;

      if (searchQuery) {
        // Search mode
        url = '/api/news/search';
        params = new URLSearchParams({
          q: searchQuery,
          page: pageNum,
          pageSize: 10,
          sortBy: filters.sortBy,
          language: filters.language
        });
      } else if (personalized && userId) {
        // Personalized mode
        url = '/api/news/personalized';
        params = new URLSearchParams({
          page: pageNum,
          pageSize: 20
        });
      } else {
        // Category mode
        url = '/api/news/health';
        params = new URLSearchParams({
          category: filters.category,
          page: pageNum,
          pageSize: 20,
          sortBy: filters.sortBy,
          language: filters.language
        });
      }

      const response = await fetch(`${url}?${params}`, {
        headers: {
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        }
      });

      const data = await response.json();

      if (data.success) {
        const newArticles = data.data.articles || [];
        
        if (reset || pageNum === 1) {
          setArticles(newArticles);
        } else {
          setArticles(prev => [...prev, ...newArticles]);
        }

        setTotalResults(data.data.totalResults || newArticles.length);
        setHasMore(newArticles.length === (searchQuery ? 10 : 20));
        setPage(pageNum);
      } else {
        setError(data.message || 'Failed to load news');
      }
    } catch (error) {
      console.error('News loading error:', error);
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, personalized, userId, filters, loading]);

  useEffect(() => {
    loadNews(1, true);
  }, [searchQuery, filters.category, filters.sortBy, personalized]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      loadNews(page + 1, false);
    }
  };

  const handleBookmark = async (articleId, isBookmarked) => {
    // TODO: Implement bookmarking functionality
    console.log('Bookmark article:', articleId, isBookmarked);
    
    // Update local state optimistically
    setArticles(prev => 
      prev.map(article => 
        article.id === articleId 
          ? { ...article, isBookmarked: isBookmarked }
          : article
      )
    );
  };

  const handleShare = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.description,
        url: article.url
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(article.url);
      // TODO: Show toast notification
    }
  };

  if (error && articles.length === 0) {
    return (
      <div className="text-center py-12">
        <ExclamationCircleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to Load News</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={() => loadNews(1, true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      {!searchQuery && (
        <NewsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          personalized={personalized}
        />
      )}

      {/* Results Summary */}
      {(searchQuery || totalResults > 0) && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {searchQuery ? (
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            ) : (
              <NewspaperIcon className="h-5 w-5 text-gray-400" />
            )}
            <span className="text-sm text-gray-600">
              {searchQuery ? (
                <>Showing results for "{searchQuery}"</>
              ) : personalized ? (
                <>Personalized news feed</>
              ) : (
                <>Latest {filters.category.replace('_', ' ')} news</>
              )}
              {totalResults > 0 && (
                <span className="ml-2">({totalResults} articles)</span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && articles.length === 0 && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading news...</p>
        </div>
      )}

      {/* Articles Grid */}
      {articles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article, index) => (
            <NewsCard
              key={`${article.id}-${index}`}
              article={article}
              onBookmark={handleBookmark}
              onShare={handleShare}
            />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {hasMore && articles.length > 0 && (
        <div className="text-center">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Loading...</span>
              </div>
            ) : (
              'Load More Articles'
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && !error && (
        <div className="text-center py-12">
          <NewspaperIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Articles Found</h3>
          <p className="text-gray-600">
            {searchQuery ? (
              <>No articles found for "{searchQuery}". Try a different search term.</>
            ) : (
              <>No articles available in this category right now.</>
            )}
          </p>
        </div>
      )}

      {/* Error Message (when there are existing articles) */}
      {error && articles.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default NewsFeed;
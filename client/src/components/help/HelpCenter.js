// Help Center Component
// Main help center with searchable documentation and content organization

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { helpContentManager } from '../../utils/helpSystem';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ArticleView } from './ArticleView';
import { VideoView } from './VideoView';

/**
 * Main Help Center Component
 */
export const HelpCenter = ({ 
  initialQuery = '',
  initialCategory = null,
  onClose,
  context = null 
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedContent, setSelectedContent] = useState(null);
  const [viewMode, setViewMode] = useState('browse'); // browse, search, article, video
  const [isLoading, setIsLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [recommendedContent, setRecommendedContent] = useState([]);

  const categories = [
    { id: 'getting-started', name: 'Getting Started', icon: 'RocketLaunchIcon', color: 'blue' },
    { id: 'core-features', name: 'Core Features', icon: 'StarIcon', color: 'green' },
    { id: 'advanced', name: 'Advanced', icon: 'WrenchIcon', color: 'purple' },
    { id: 'troubleshooting', name: 'Troubleshooting', icon: 'MagnifyingGlassIcon', color: 'orange' },
    { id: 'integrations', name: 'Integrations', icon: 'LinkIcon', color: 'indigo' },
    { id: 'mobile', name: 'Mobile', icon: 'DevicePhoneMobileIcon', color: 'pink' }
  ];

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, [context]);

  // Handle search query changes
  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
      setViewMode('browse');
    }
  }, [searchQuery]);

  // Load search suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const suggestions = helpContentManager.getSearchSuggestions(searchQuery);
      setSearchSuggestions(suggestions);
    } else {
      setSearchSuggestions([]);
    }
  }, [searchQuery]);

  const loadInitialData = useCallback(() => {
    // Load recommended content
    const recommended = helpContentManager.getRecommendedContent(context);
    setRecommendedContent(recommended);

    // Load recently viewed content
    const recent = helpContentManager.viewHistory
      .slice(-5)
      .reverse()
      .map(view => helpContentManager.getContentById(view.contentId, view.contentType))
      .filter(Boolean);
    setRecentlyViewed(recent);
  }, [context]);

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setViewMode('search');

    // Simulate search delay for better UX
    setTimeout(() => {
      const results = helpContentManager.search(searchQuery, {
        category: selectedCategory,
        limit: 20
      });
      setSearchResults(results);
      setIsLoading(false);
    }, 300);
  }, [searchQuery, selectedCategory]);

  const handleContentSelect = useCallback((content, type) => {
    setSelectedContent({ ...content, type });
    setViewMode(type === 'video' ? 'video' : 'article');
    
    // Track view
    helpContentManager.trackView(content.id, type, context);
    
    // Update recently viewed
    loadInitialData();
  }, [context, loadInitialData]);

  const handleSearchSuggestionSelect = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
    if (searchQuery.trim()) {
      handleSearch();
    }
  };

  const handleBack = () => {
    if (viewMode === 'article' || viewMode === 'video') {
      setViewMode(searchQuery.trim() ? 'search' : 'browse');
      setSelectedContent(null);
    } else if (viewMode === 'search') {
      setSearchQuery('');
      setViewMode('browse');
    }
  };

  const filteredContent = useMemo(() => {
    if (selectedCategory) {
      return Array.from(helpContentManager.helpArticles.values())
        .filter(article => article.category === selectedCategory);
    }
    return [];
  }, [selectedCategory]);

  const renderHeader = () => (
    <div className="flex items-center justify-between p-6 border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {(viewMode !== 'browse' || selectedCategory) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="p-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Button>
        )}
        
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'article' && selectedContent ? selectedContent.title :
             viewMode === 'video' && selectedContent ? selectedContent.title :
             viewMode === 'search' ? 'Search Results' :
             selectedCategory ? categories.find(c => c.id === selectedCategory)?.name :
             'Help Center'}
          </h1>
          {viewMode === 'browse' && !selectedCategory && (
            <p className="text-gray-600">Find answers and learn how to use MedIoT Premium</p>
          )}
        </div>
      </div>
      
      {onClose && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="p-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </Button>
      )}
    </div>
  );

  const renderSearchBar = () => (
    <div className="p-6 border-b border-gray-200">
      <div className="relative">
        <div className="relative">
          <Input
            type="text"
            placeholder="Search help articles, tutorials, and guides..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10 pr-4"
          />
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        
        {/* Search Suggestions */}
        {showSuggestions && searchSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            {searchSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSearchSuggestionSelect(suggestion)}
                className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
              >
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm text-gray-700">{suggestion}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2 mt-4">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategorySelect(category.id)}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === category.id
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{category.icon}</span>
            <span>{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'search':
        return <SearchResults results={searchResults} onSelect={handleContentSelect} isLoading={isLoading} />;
      case 'article':
        return <ArticleView article={selectedContent} onRelatedSelect={handleContentSelect} />;
      case 'video':
        return <VideoView video={selectedContent} onRelatedSelect={handleContentSelect} />;
      case 'browse':
      default:
        return (
          <BrowseView
            categories={categories}
            selectedCategory={selectedCategory}
            filteredContent={filteredContent}
            recommendedContent={recommendedContent}
            recentlyViewed={recentlyViewed}
            onContentSelect={handleContentSelect}
            onCategorySelect={handleCategorySelect}
          />
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {renderHeader()}
      {(viewMode === 'browse' || viewMode === 'search') && renderSearchBar()}
      
      <div className="flex-1 overflow-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode + (selectedContent?.id || '')}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

/**
 * Browse View Component
 */
const BrowseView = ({ 
  categories, 
  selectedCategory, 
  filteredContent, 
  recommendedContent, 
  recentlyViewed, 
  onContentSelect, 
  onCategorySelect 
}) => {
  if (selectedCategory) {
    return (
      <div className="p-6">
        <div className="grid gap-4">
          {filteredContent.map((article) => (
            <ContentCard
              key={article.id}
              content={article}
              type="article"
              onClick={() => onContentSelect(article, 'article')}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Categories Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Browse by Category</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className="p-4 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{category.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-600">Browse {category.name.toLowerCase()} topics</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recommended Content */}
      {recommendedContent.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recommended for You</h2>
          <div className="grid gap-4">
            {recommendedContent.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                type="article"
                onClick={() => onContentSelect(content, 'article')}
                showCategory
              />
            ))}
          </div>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recently Viewed</h2>
          <div className="grid gap-4">
            {recentlyViewed.map((content) => (
              <ContentCard
                key={content.id}
                content={content}
                type="article"
                onClick={() => onContentSelect(content, 'article')}
                compact
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Search Results Component
 */
const SearchResults = ({ results, onSelect, isLoading }) => {
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="p-6 text-center">
        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-600">Try adjusting your search terms or browse by category.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Found {results.length} result{results.length !== 1 ? 's' : ''}
        </p>
      </div>
      
      <div className="space-y-4">
        {results.map((result) => {
          const content = helpContentManager.getContentById(result.id, result.type);
          return (
            <ContentCard
              key={`${result.type}-${result.id}`}
              content={content}
              type={result.type}
              onClick={() => onSelect(content, result.type)}
              showCategory
              searchScore={result.score}
            />
          );
        })}
      </div>
    </div>
  );
};

/**
 * Content Card Component
 */
const ContentCard = ({ 
  content, 
  type, 
  onClick, 
  showCategory = false, 
  compact = false, 
  searchScore = null 
}) => {
  if (!content) return null;

  const getCategoryInfo = (categoryId) => {
    const categoryMap = {
      'getting-started': { name: 'Getting Started', color: 'blue' },
      'core-features': { name: 'Core Features', color: 'green' },
      'advanced': { name: 'Advanced', color: 'purple' },
      'troubleshooting': { name: 'Troubleshooting', color: 'orange' }
    };
    return categoryMap[categoryId] || { name: categoryId, color: 'gray' };
  };

  const categoryInfo = showCategory && content.category ? getCategoryInfo(content.category) : null;

  return (
    <Card 
      className={`p-4 hover:shadow-md transition-shadow cursor-pointer ${
        compact ? 'py-3' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className={`font-medium text-gray-900 ${
              compact ? 'text-sm' : 'text-base'
            }`}>
              {content.title}
            </h3>
            
            {type === 'video' && (
              <Badge variant="secondary" size="sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM15.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM4 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                </svg>
                Video
              </Badge>
            )}
            
            {categoryInfo && (
              <Badge variant="secondary" size="sm">
                {categoryInfo.name}
              </Badge>
            )}
          </div>
          
          {!compact && (
            <p className="text-sm text-gray-600 mb-2">
              {type === 'video' ? content.description : content.content?.overview}
            </p>
          )}
          
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            {content.estimatedReadTime && (
              <span>{content.estimatedReadTime} min read</span>
            )}
            {content.duration && (
              <span>{Math.ceil(content.duration / 60)} min video</span>
            )}
            {content.difficulty && (
              <span className="capitalize">{content.difficulty}</span>
            )}
            {searchScore && (
              <span>Relevance: {Math.round(searchScore * 10) / 10}</span>
            )}
          </div>
        </div>
        
        <div className="ml-4">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Card>
  );
};

export default HelpCenter;
import React from 'react';
import {
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';

const NewsCard = ({ article, onBookmark, onShare }) => {
  const {
    id,
    title,
    description,
    url,
    urlToImage,
    publishedAt,
    source,
    author,
    category,
    reliability,
    readTime,
    isBookmarked,
    tags,
    recommendationReason
  } = article;

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getReliabilityColor = (score) => {
    if (score >= 0.9) return 'text-green-600 bg-green-50';
    if (score >= 0.8) return 'text-blue-600 bg-blue-50';
    if (score >= 0.7) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      medical_research: 'bg-purple-100 text-purple-800',
      diseases: 'bg-red-100 text-red-800',
      medications: 'bg-green-100 text-green-800',
      mental_health: 'bg-indigo-100 text-indigo-800',
      public_health: 'bg-orange-100 text-orange-800'
    };
    return colors[cat] || 'bg-gray-100 text-gray-800';
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark(id, !isBookmarked);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onShare(article);
  };

  const handleCardClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      {/* Image */}
      {urlToImage && (
        <div className="aspect-w-16 aspect-h-9">
          <img
            src={urlToImage}
            alt={title}
            className="w-full h-48 object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xs font-medium text-gray-600 truncate">
              {source?.name || 'Unknown Source'}
            </span>
            {reliability && (
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getReliabilityColor(reliability)}`}>
                <StarIcon className="h-3 w-3" />
                <span>{Math.round(reliability * 100)}%</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            <button
              onClick={handleBookmarkClick}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
              title={isBookmarked ? 'Remove bookmark' : 'Bookmark article'}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-4 w-4 text-blue-600" />
              ) : (
                <BookmarkIcon className="h-4 w-4" />
              )}
            </button>
            
            <button
              onClick={handleShareClick}
              className="p-1 text-gray-400 hover:text-green-600 transition-colors"
              title="Share article"
            >
              <ShareIcon className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Category and Recommendation */}
        <div className="flex items-center space-x-2 mb-3">
          {category && (
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(category)}`}>
              {category.replace('_', ' ')}
            </span>
          )}
          
          {recommendationReason && (
            <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Recommended: {recommendationReason}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 
          className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 hover:text-blue-600 transition-colors"
          onClick={handleCardClick}
        >
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                +{tags.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            {author && (
              <span>By {author}</span>
            )}
            
            <div className="flex items-center space-x-1">
              <ClockIcon className="h-3 w-3" />
              <span>{formatTimeAgo(publishedAt)}</span>
            </div>
            
            {readTime && (
              <span>{readTime} min read</span>
            )}
          </div>
          
          <button
            onClick={handleCardClick}
            className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <span>Read more</span>
            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewsCard;
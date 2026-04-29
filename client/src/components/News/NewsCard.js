import React from 'react';
import {
  BookmarkIcon,
  ShareIcon,
  ClockIcon,
  ArrowTopRightOnSquareIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { GlassCard } from '../ui/PremiumComponents';

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
    if (score >= 0.9) return 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800';
    if (score >= 0.8) return 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
    if (score >= 0.7) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800';
    return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800';
  };

  const getCategoryColor = (cat) => {
    const colors = {
      general: 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300',
      medical_research: 'bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300',
      diseases: 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300',
      medications: 'bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300',
      mental_health: 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-300',
      public_health: 'bg-orange-100 dark:bg-orange-900/40 text-orange-800 dark:text-orange-300'
    };
    return colors[cat] || 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300';
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
    <GlassCard
      className="overflow-hidden group hover:shadow-premium-lg border border-gray-100 dark:border-gray-800"
      padding="p-0"
      onClick={handleCardClick}
    >
      {/* Image */}
      {urlToImage && (
        <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
          <img
            src={urlToImage}
            alt={title}
            className="w-full h-48 object-cover transition-transform duration-700 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1576091160550-2173bdb999ef?q=80&w=1000&auto=format&fit=crop';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />

          <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
            <div className="flex items-center space-x-2">
              {category && (
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold backdrop-blur-md ${getCategoryColor(category)}`}>
                  {category.replace('_', ' ')}
                </span>
              )}
              {reliability && (
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium backdrop-blur-md border ${getReliabilityColor(reliability)}`}>
                  <StarIcon className="h-3 w-3" />
                  <span>{Math.round(reliability * 100)}%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-5">
        {/* Header Info */}
        <div className="flex items-center justify-between mb-3 text-xs text-gray-500 dark:text-gray-400">
          <span className="font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
            {source?.name || 'News Source'}
          </span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <ClockIcon className="h-3.5 w-3.5" />
              {formatTimeAgo(publishedAt)}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description}
          </p>
        )}

        {/* Tags */}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-xs rounded-md border border-gray-100 dark:border-gray-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
          <button
            className="text-sm font-medium text-primary-600 dark:text-primary-400 flex items-center gap-1 group/btn"
          >
            Read Article
            <ArrowTopRightOnSquareIcon className="w-4 h-4 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title="Share"
            >
              <ShareIcon className="h-5 w-5" />
            </button>
            <button
              onClick={handleBookmarkClick}
              className={`p-2 rounded-xl transition-colors ${isBookmarked
                  ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'text-gray-400 hover:text-primary-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              title={isBookmarked ? 'Remove' : 'Save'}
            >
              {isBookmarked ? (
                <BookmarkSolidIcon className="h-5 w-5" />
              ) : (
                <BookmarkIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};

export default NewsCard;
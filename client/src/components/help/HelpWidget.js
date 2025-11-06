// Help Widget Component
// Floating help widget for quick access to help and support

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { helpContentManager } from '../../utils/helpSystem';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

/**
 * Floating Help Widget
 */
export const HelpWidget = ({ 
  position = 'bottom-right',
  context = null,
  onOpenHelpCenter,
  onStartTour,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('quick-help');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [quickHelp, setQuickHelp] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const widgetRef = useRef(null);

  const tabs = [
    { id: 'quick-help', name: 'Quick Help', icon: '⚡' },
    { id: 'search', name: 'Search', icon: '🔍' },
    { id: 'contact', name: 'Contact', icon: '💬' }
  ];

  useEffect(() => {
    loadQuickHelp();
  }, [context]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const loadQuickHelp = () => {
    const recommended = helpContentManager.getRecommendedContent(context);
    const quickHelpItems = recommended.slice(0, 3).map(item => ({
      id: item.id,
      type: 'article',
      title: item.title,
      description: item.content?.overview || item.description,
      icon: '📖',
      action: () => handleContentSelect(item, 'article')
    }));

    setQuickHelp(quickHelpItems);
  };

  const handleSearch = () => {
    setIsSearching(true);
    
    setTimeout(() => {
      const results = helpContentManager.search(searchQuery, { limit: 5 });
      setSearchResults(results);
      setIsSearching(false);
    }, 300);
  };

  const handleContentSelect = (content, type) => {
    if (onOpenHelpCenter) {
      onOpenHelpCenter(content.id, type);
    }
    setIsOpen(false);
  };

  const handleStartTour = () => {
    if (onStartTour) {
      onStartTour(context);
    }
    setIsOpen(false);
  };

  const getPositionClasses = () => {
    const positions = {
      'bottom-right': 'bottom-6 right-6',
      'bottom-left': 'bottom-6 left-6',
      'top-right': 'top-6 right-6',
      'top-left': 'top-6 left-6'
    };
    return positions[position] || positions['bottom-right'];
  };

  const renderQuickHelp = () => (
    <div className="space-y-3">
      {quickHelp.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-2">🎯</div>
          <p className="text-gray-600 text-sm">No quick help available</p>
        </div>
      ) : (
        quickHelp.map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <span className="text-lg">{item.icon}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {item.description}
                </p>
              </div>
            </div>
          </button>
        ))
      )}
      
      <div className="pt-3 border-t border-gray-200 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleStartTour}
          className="w-full justify-start text-sm"
        >
          Start Interactive Tour
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onOpenHelpCenter && onOpenHelpCenter()}
          className="w-full justify-start text-sm"
        >
          Browse Help Center
        </Button>
      </div>
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-3">
      <Input
        type="text"
        placeholder="Search help articles..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />
      
      {isSearching ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          <p className="text-sm text-gray-600 mt-2">Searching...</p>
        </div>
      ) : searchResults.length > 0 ? (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {searchResults.map((result) => {
            const content = helpContentManager.getContentById(result.id, result.type);
            return (
              <button
                key={`${result.type}-${result.id}`}
                onClick={() => handleContentSelect(content, result.type)}
                className="w-full text-left p-2 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <h4 className="font-medium text-gray-900 text-sm mb-1 truncate">
                  {content?.title || result.title}
                </h4>
                <Badge variant="secondary" size="sm">
                  {result.type}
                </Badge>
              </button>
            );
          })}
        </div>
      ) : searchQuery.trim() ? (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">No results found</p>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600 text-sm">Start typing to search</p>
        </div>
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-4xl mb-2">💬</div>
        <h3 className="font-medium text-gray-900 mb-2">Need More Help?</h3>
        <p className="text-sm text-gray-600 mb-4">
          Get in touch with our support team.
        </p>
      </div>
      
      <div className="space-y-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => window.open('mailto:support@mediot.com', '_blank')}
        >
          Email Support
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start"
          onClick={() => window.open('/support/chat', '_blank')}
        >
          Live Chat
        </Button>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'search':
        return renderSearch();
      case 'contact':
        return renderContact();
      case 'quick-help':
      default:
        return renderQuickHelp();
    }
  };

  return (
    <div ref={widgetRef} className={`fixed z-40 ${getPositionClasses()} ${className}`}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4"
          >
            <Card className="w-80 max-h-96 shadow-xl border-2 border-gray-200">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Help & Support</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex border-b border-gray-200">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 px-3 py-2 text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-center space-x-1">
                      <span>{tab.icon}</span>
                      <span className="hidden sm:inline">{tab.name}</span>
                    </div>
                  </button>
                ))}
              </div>

              <div className="p-4 max-h-80 overflow-y-auto">
                {renderTabContent()}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg transition-colors flex items-center justify-center ${
          isOpen ? 'bg-blue-700' : ''
        }`}
        title="Help & Support"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.button>
    </div>
  );
};

/**
 * Compact Help Button (for toolbars)
 */
export const HelpButton = ({ 
  context,
  onOpenHelpCenter,
  size = 'md',
  variant = 'ghost'
}) => {
  const handleClick = () => {
    if (onOpenHelpCenter) {
      onOpenHelpCenter(null, null, context);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleClick}
      title="Help & Support"
    >
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </Button>
  );
};

export default HelpWidget;
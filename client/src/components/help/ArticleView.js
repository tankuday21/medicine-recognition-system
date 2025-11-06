// Article View Component
// Detailed view for help articles with rich content and navigation

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { helpContentManager } from '../../utils/helpSystem';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';

/**
 * Article View Component
 */
export const ArticleView = ({ article, onRelatedSelect, onBack }) => {
  const [activeSection, setActiveSection] = useState(null);
  const [expandedFAQs, setExpandedFAQs] = useState(new Set());
  const [isHelpful, setIsHelpful] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [relatedContent, setRelatedContent] = useState([]);

  useEffect(() => {
    if (article?.content?.relatedArticles) {
      const related = article.content.relatedArticles
        .map(id => helpContentManager.helpArticles.get(id))
        .filter(Boolean);
      setRelatedContent(related);
    }
  }, [article]);

  useEffect(() => {
    // Set first section as active by default
    if (article?.content?.sections && article.content.sections.length > 0) {
      setActiveSection(article.content.sections[0].id);
    }
  }, [article]);

  if (!article) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">Article not found</p>
      </div>
    );
  }

  const handleSectionClick = (sectionId) => {
    setActiveSection(sectionId);
    
    // Scroll to section
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleFAQToggle = (index) => {
    const newExpanded = new Set(expandedFAQs);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFAQs(newExpanded);
  };

  const handleHelpfulClick = (helpful) => {
    setIsHelpful(helpful);
    setShowFeedback(true);
    
    // Track feedback
    helpContentManager.trackView(article.id, 'article', {
      feedback: helpful ? 'helpful' : 'not-helpful'
    });
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'green',
      intermediate: 'yellow',
      advanced: 'red'
    };
    return colors[difficulty] || 'gray';
  };

  const formatLastUpdated = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="flex h-full">
      {/* Table of Contents Sidebar */}
      {article.content.sections && article.content.sections.length > 1 && (
        <div className="w-64 border-r border-gray-200 bg-gray-50 p-4 overflow-y-auto">
          <h3 className="font-medium text-gray-900 mb-4">Contents</h3>
          <nav className="space-y-2">
            {article.content.sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {section.title}
              </button>
            ))}
            
            {article.content.faqs && article.content.faqs.length > 0 && (
              <button
                onClick={() => handleSectionClick('faqs')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                  activeSection === 'faqs'
                    ? 'bg-blue-100 text-blue-900 font-medium'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                Frequently Asked Questions
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          {/* Article Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              {article.tags?.map((tag) => (
                <Badge key={tag} variant="secondary" size="sm">
                  {tag}
                </Badge>
              ))}
              <Badge 
                variant={getDifficultyColor(article.difficulty)} 
                size="sm"
              >
                {article.difficulty}
              </Badge>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <div className="flex items-center space-x-6 text-sm text-gray-600 mb-6">
              {article.estimatedReadTime && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{article.estimatedReadTime} min read</span>
                </div>
              )}
              
              {article.lastUpdated && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>Updated {formatLastUpdated(article.lastUpdated)}</span>
                </div>
              )}
            </div>
            
            {article.content.overview && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-900">{article.content.overview}</p>
              </div>
            )}
          </div>

          {/* Article Sections */}
          {article.content.sections && (
            <div className="space-y-8 mb-8">
              {article.content.sections.map((section) => (
                <motion.section
                  key={section.id}
                  id={`section-${section.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="scroll-mt-6"
                >
                  <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                    {section.title}
                  </h2>
                  
                  <div className="prose prose-blue max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {section.content}
                    </p>
                  </div>

                  {/* Steps */}
                  {section.steps && (
                    <div className="mb-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Steps:</h3>
                      <ol className="space-y-3">
                        {section.steps.map((step, index) => (
                          <li key={index} className="flex items-start space-x-3">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <p className="text-gray-700">{step}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}

                  {/* Tips */}
                  {section.tips && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-900 mb-2 flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        Tips
                      </h4>
                      <ul className="space-y-1">
                        {section.tips.map((tip, index) => (
                          <li key={index} className="text-yellow-800 text-sm">
                            • {tip}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.section>
              ))}
            </div>
          )}

          {/* FAQs */}
          {article.content.faqs && article.content.faqs.length > 0 && (
            <section id="section-faqs" className="mb-8 scroll-mt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              
              <div className="space-y-4">
                {article.content.faqs.map((faq, index) => (
                  <Card key={index} className="overflow-hidden">
                    <button
                      onClick={() => handleFAQToggle(index)}
                      className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <h3 className="font-medium text-gray-900 pr-4">
                        {faq.question}
                      </h3>
                      <svg
                        className={`w-5 h-5 text-gray-500 transition-transform ${
                          expandedFAQs.has(index) ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {expandedFAQs.has(index) && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 border-t border-gray-200"
                      >
                        <p className="text-gray-700 pt-4">{faq.answer}</p>
                      </motion.div>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Feedback Section */}
          <section className="border-t border-gray-200 pt-8">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Was this article helpful?
              </h3>
              
              {!showFeedback ? (
                <div className="flex items-center justify-center space-x-4">
                  <Button
                    variant={isHelpful === true ? 'primary' : 'outline'}
                    onClick={() => handleHelpfulClick(true)}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                    </svg>
                    <span>Yes</span>
                  </Button>
                  
                  <Button
                    variant={isHelpful === false ? 'primary' : 'outline'}
                    onClick={() => handleHelpfulClick(false)}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                    </svg>
                    <span>No</span>
                  </Button>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 max-w-md mx-auto">
                  <p className="text-green-800">
                    {isHelpful 
                      ? '✅ Thank you for your feedback! We\'re glad this article was helpful.'
                      : '📝 Thank you for your feedback. We\'ll work on improving this article.'
                    }
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ArticleView;
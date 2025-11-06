import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import NewsFeed from '../components/News/NewsFeed';
import NewsSearch from '../components/News/NewsSearch';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import {
  NewspaperIcon,
  UserIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  InformationCircleIcon,
  BuildingOffice2Icon,
  BeakerIcon,
  ExclamationCircleIcon,
  CubeIcon,
  SparklesIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';

const News = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, user } = useAuth();

  const tabs = [
    { id: 'feed', name: 'Latest News', icon: NewspaperIcon },
    { id: 'search', name: 'Search', icon: MagnifyingGlassIcon },
    { id: 'categories', name: 'Categories', icon: Squares2X2Icon },
    ...(isAuthenticated ? [{ id: 'personalized', name: 'For You', icon: UserIcon }] : [])
  ];

  const newsCategories = [
    {
      id: 'general',
      name: 'General Health',
      description: 'Latest health and wellness news',
      icon: BuildingOffice2Icon,
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'medical_research',
      name: 'Medical Research',
      description: 'Clinical trials and breakthrough studies',
      icon: BeakerIcon,
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      id: 'diseases',
      name: 'Diseases & Conditions',
      description: 'Updates on diseases and health conditions',
      icon: ExclamationCircleIcon,
      color: 'bg-red-50 border-red-200 text-red-800'
    },
    {
      id: 'medications',
      name: 'Medications & Drugs',
      description: 'Pharmaceutical news and drug updates',
      icon: CubeIcon,
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'mental_health',
      name: 'Mental Health',
      description: 'Mental wellness and psychology news',
      icon: SparklesIcon,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-800'
    },
    {
      id: 'public_health',
      name: 'Public Health',
      description: 'Healthcare policy and public health news',
      icon: GlobeAltIcon,
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    }
  ];

  const [selectedCategory, setSelectedCategory] = useState('general');

  const handleSearch = (query) => {
    setSearchQuery(query);
    if (query) {
      setActiveTab('search');
    }
  };

  const handleCategorySelect = (categoryId) => {
    setSelectedCategory(categoryId);
    setActiveTab('feed');
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <NewspaperIcon className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Healthcare News</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Stay informed with the latest healthcare news, medical research, and health updates 
          from trusted sources around the world.
        </p>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl mx-auto mb-8">
        <NewsSearch onSearch={handleSearch} initialQuery={searchQuery} />
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id !== 'search') {
                    setSearchQuery('');
                  }
                }}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Latest News Feed */}
          {activeTab === 'feed' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedCategory === 'general' ? 'Latest Health News' : 
                   newsCategories.find(c => c.id === selectedCategory)?.name || 'News Feed'}
                </h2>
                {selectedCategory !== 'general' && (
                  <button
                    onClick={() => setSelectedCategory('general')}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    View All Categories
                  </button>
                )}
              </div>
              <NewsFeed category={selectedCategory} />
            </div>
          )}

          {/* Search Results */}
          {activeTab === 'search' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Search Results</h2>
              <NewsFeed searchQuery={searchQuery} />
            </div>
          )}

          {/* Categories */}
          {activeTab === 'categories' && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Browse by Category</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {newsCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`p-6 border-2 rounded-lg text-left hover:shadow-md transition-all ${category.color}`}
                  >
                    <div className="flex items-start space-x-4">
                      <category.icon className="h-8 w-8 flex-shrink-0" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{category.name}</h3>
                        <p className="text-sm opacity-75">{category.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Personalized Feed */}
          {activeTab === 'personalized' && isAuthenticated && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Personalized for You</h2>
              <NewsFeed personalized={true} userId={user?._id} />
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center mb-3">
            <NewspaperIcon className="h-8 w-8 text-blue-600" />
            <h3 className="ml-3 font-medium text-blue-900">Trusted Sources</h3>
          </div>
          <p className="text-blue-800 text-sm">
            All news articles are sourced from reputable medical journals, health organizations, 
            and verified news outlets.
          </p>
        </div>

        <div className="bg-green-50 p-6 rounded-lg border border-green-200">
          <div className="flex items-center mb-3">
            <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="ml-3 font-medium text-green-900">Fact-Checked</h3>
          </div>
          <p className="text-green-800 text-sm">
            Our news feed prioritizes articles from sources with high reliability scores 
            and medical accuracy.
          </p>
        </div>

        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center mb-3">
            <UserIcon className="h-8 w-8 text-purple-600" />
            <h3 className="ml-3 font-medium text-purple-900">Personalized</h3>
          </div>
          <p className="text-purple-800 text-sm">
            {isAuthenticated ? (
              'Get news recommendations based on your health profile and interests.'
            ) : (
              'Sign in to get personalized news recommendations based on your health profile.'
            )}
          </p>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-2">
          <InformationCircleIcon className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="text-yellow-800">
            <p className="font-medium">Medical Information Disclaimer</p>
            <p className="text-sm mt-1">
              The news articles provided are for informational purposes only and should not be 
              considered as medical advice. Always consult with healthcare professionals for 
              medical decisions and treatment options.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default News;
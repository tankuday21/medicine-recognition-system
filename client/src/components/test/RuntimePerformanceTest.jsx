// Runtime Performance Test Component
// Demonstrates all runtime performance optimization features

import React, { useState, useCallback, useMemo } from 'react';
import { 
  MemoizationProvider,
  OptimizedSearch,
  MemoizedDataGrid,
  OptimizedForm,
  MemoizedFormField,
  OptimizedList
} from '../performance/RuntimeOptimizations';
import { 
  OptimizedImage,
  VirtualScrollList,
  DebouncedInput,
  SkeletonLoading,
  PerformanceMonitor
} from '../performance/PerformanceComponents';
import { useWebVitals, usePerformanceBudget, useMemoryMonitoring } from '../../hooks/usePerformance';
import { combineClasses } from '../../utils/design-system';

// Mock data generators
const generateMockData = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    name: `Item ${index + 1}`,
    email: `user${index + 1}@example.com`,
    status: ['active', 'inactive', 'pending'][index % 3],
    score: Math.floor(Math.random() * 100),
    createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
    description: `This is a description for item ${index + 1}. It contains some sample text to demonstrate the performance optimizations.`
  }));
};

const generateSearchSuggestions = () => [
  'Medical Records', 'Patient Data', 'Vital Signs', 'Medications',
  'Appointments', 'Lab Results', 'Imaging', 'Allergies',
  'Treatment Plans', 'Discharge Summary', 'Insurance', 'Billing'
];

// Form validation rules
const validationRules = {
  name: [
    (value) => !value ? 'Name is required' : null,
    (value) => value && value.length < 2 ? 'Name must be at least 2 characters' : null
  ],
  email: [
    (value) => !value ? 'Email is required' : null,
    (value) => value && !/\S+@\S+\.\S+/.test(value) ? 'Email is invalid' : null
  ],
  age: [
    (value) => !value ? 'Age is required' : null,
    (value) => value && (isNaN(value) || value < 0 || value > 150) ? 'Age must be between 0 and 150' : null
  ]
};

const RuntimePerformanceTest = () => {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState([]);
  const [gridData] = useState(() => generateMockData(10000));
  const [listData] = useState(() => generateMockData(5000));
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [isLoading, setIsLoading] = useState(false);

  // Performance monitoring
  const vitals = useWebVitals((metric, value) => {
    console.log(`Web Vital - ${metric}: ${value}`);
  });

  const { violations, score } = usePerformanceBudget({
    totalJSSize: 200000, // 200KB
    firstContentfulPaint: 1000,
    largestContentfulPaint: 2000
  });

  const memoryInfo = useMemoryMonitoring(3000);

  // Memoized columns for data grid
  const gridColumns = useMemo(() => [
    {
      key: 'id',
      title: 'ID',
      sortable: true
    },
    {
      key: 'name',
      title: 'Name',
      sortable: true
    },
    {
      key: 'email',
      title: 'Email',
      sortable: true
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (value) => (
        <span className={combineClasses(
          'px-2 py-1 rounded-full text-xs font-medium',
          value === 'active' ? 'bg-green-100 text-green-800' :
          value === 'inactive' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        )}>
          {value}
        </span>
      )
    },
    {
      key: 'score',
      title: 'Score',
      sortable: true
    }
  ], []);

  // Optimized search handler
  const handleSearch = useCallback(async (query) => {
    setIsLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const results = gridData
      .filter(item => 
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.email.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 50);
    
    setSearchResults(results);
    setIsLoading(false);
  }, [gridData]);

  // Optimized sort handler
  const handleSort = useCallback((column, direction) => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);

  // Optimized row click handler
  const handleRowClick = useCallback((item, index) => {
    console.log('Row clicked:', item, index);
  }, []);

  // Optimized form submit handler
  const handleFormSubmit = useCallback((values) => {
    console.log('Form submitted:', values);
    alert('Form submitted successfully!');
  }, []);

  // Optimized list item renderer
  const renderListItem = useCallback((item, index) => (
    <div className="flex items-center justify-between w-full">
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{item.name}</h4>
        <p className="text-sm text-gray-500">{item.email}</p>
      </div>
      <div className="text-right">
        <div className="text-sm font-medium text-gray-900">Score: {item.score}</div>
        <div className="text-xs text-gray-500">#{item.id}</div>
      </div>
    </div>
  ), []);

  const tabs = [
    { id: 'search', label: 'Optimized Search' },
    { id: 'grid', label: 'Virtual Data Grid' },
    { id: 'list', label: 'Virtual List' },
    { id: 'form', label: 'Optimized Form' },
    { id: 'images', label: 'Image Optimization' },
    { id: 'performance', label: 'Performance Monitor' }
  ];

  return (
    <MemoizationProvider>
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Runtime Performance Optimization Demo
          </h1>
          <p className="text-gray-600 mb-6">
            Comprehensive demonstration of runtime performance optimizations including virtual scrolling,
            memoization, debouncing, and caching strategies.
          </p>

          {/* Performance Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Performance Score</h3>
              <p className="text-2xl font-bold text-blue-600">{score}/100</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900">Memory Usage</h3>
              <p className="text-2xl font-bold text-green-600">{memoryInfo.used}MB</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900">Budget Violations</h3>
              <p className="text-2xl font-bold text-yellow-600">{violations.length}</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900">FCP</h3>
              <p className="text-2xl font-bold text-purple-600">
                {vitals.fcp ? `${Math.round(vitals.fcp)}ms` : 'N/A'}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={combineClasses(
                    'py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200',
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'search' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Optimized Search with Debouncing</h2>
                <div className="max-w-md">
                  <OptimizedSearch
                    onSearch={handleSearch}
                    placeholder="Search patients, records, medications..."
                    suggestions={generateSearchSuggestions()}
                    onSuggestionSelect={(suggestion) => console.log('Selected:', suggestion)}
                    className="w-full"
                  />
                </div>
                
                {isLoading && (
                  <div className="space-y-2">
                    <SkeletonLoading lines={3} />
                    <SkeletonLoading lines={2} />
                  </div>
                )}
                
                {!isLoading && searchResults.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-gray-900">
                      Search Results ({searchResults.length})
                    </h3>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div key={result.id} className="p-3 border border-gray-200 rounded-lg">
                          <div className="font-medium">{result.name}</div>
                          <div className="text-sm text-gray-600">{result.email}</div>
                          <div className="text-xs text-gray-500">Score: {result.score}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'grid' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Virtual Data Grid ({gridData.length.toLocaleString()} items)
                </h2>
                <p className="text-gray-600">
                  Demonstrates virtual scrolling with memoized cells and optimized sorting.
                </p>
                <MemoizedDataGrid
                  data={gridData}
                  columns={gridColumns}
                  rowHeight={60}
                  maxHeight={500}
                  onRowClick={handleRowClick}
                  onSort={handleSort}
                  sortColumn={sortColumn}
                  sortDirection={sortDirection}
                />
              </div>
            )}

            {activeTab === 'list' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">
                  Virtual List ({listData.length.toLocaleString()} items)
                </h2>
                <p className="text-gray-600">
                  Demonstrates virtual scrolling with memoized list items for optimal performance.
                </p>
                <OptimizedList
                  items={listData}
                  renderItem={renderListItem}
                  itemHeight={80}
                  maxHeight={500}
                  onItemClick={handleRowClick}
                />
              </div>
            )}

            {activeTab === 'form' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Optimized Form with Validation</h2>
                <p className="text-gray-600">
                  Demonstrates debounced validation and memoized form fields.
                </p>
                <div className="max-w-md">
                  <OptimizedForm
                    initialValues={{ name: '', email: '', age: '' }}
                    validationRules={validationRules}
                    onSubmit={handleFormSubmit}
                  >
                    <MemoizedFormField
                      name="name"
                      label="Full Name"
                      placeholder="Enter your full name"
                    />
                    <MemoizedFormField
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                    />
                    <MemoizedFormField
                      name="age"
                      type="number"
                      label="Age"
                      placeholder="Enter your age"
                    />
                    <button
                      type="submit"
                      className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200"
                    >
                      Submit Form
                    </button>
                  </OptimizedForm>
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Image Optimization</h2>
                <p className="text-gray-600">
                  Demonstrates lazy loading, format optimization, and progressive loading.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Array.from({ length: 12 }, (_, i) => (
                    <OptimizedImage
                      key={i}
                      src={`https://picsum.photos/300/200?random=${i}`}
                      alt={`Sample image ${i + 1}`}
                      width={300}
                      height={200}
                      className="rounded-lg"
                      priority={i < 4} // Prioritize first 4 images
                    />
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'performance' && (
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-900">Performance Monitoring</h2>
                <p className="text-gray-600">
                  Real-time performance metrics and optimization recommendations.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Web Vitals</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>First Contentful Paint:</span>
                        <span className="font-mono">{vitals.fcp ? `${Math.round(vitals.fcp)}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Largest Contentful Paint:</span>
                        <span className="font-mono">{vitals.lcp ? `${Math.round(vitals.lcp)}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>First Input Delay:</span>
                        <span className="font-mono">{vitals.fid ? `${Math.round(vitals.fid)}ms` : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Cumulative Layout Shift:</span>
                        <span className="font-mono">{vitals.cls ? vitals.cls.toFixed(3) : 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-gray-900">Memory Usage</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Used Memory:</span>
                        <span className="font-mono">{memoryInfo.used}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Memory:</span>
                        <span className="font-mono">{memoryInfo.total}MB</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Memory Limit:</span>
                        <span className="font-mono">{memoryInfo.limit}MB</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${memoryInfo.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {violations.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium text-red-900">Performance Budget Violations</h3>
                    <div className="space-y-1">
                      {violations.map((violation, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {violation.metric}: {violation.current} (budget: {violation.budget})
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Performance Monitor Component */}
        <PerformanceMonitor />
      </div>
    </MemoizationProvider>
  );
};

export default RuntimePerformanceTest;
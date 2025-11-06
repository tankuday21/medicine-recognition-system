// Performance Testing Component
// Comprehensive performance monitoring and testing interface

import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Container,
  Grid,
  Modal,
  BottomSheet,
  OptimizedImage,
  VirtualScrollList,
  SkeletonLoading,
  PullToRefresh,
  InfiniteScroll
} from '../ui';
import { 
  useWebVitals, 
  usePerformanceBudget, 
  useMemoryMonitoring, 
  useNetworkInfo,
  useResourceLoading 
} from '../../hooks/usePerformance';
import { 
  performanceBudgetManager,
  bundleOptimizationManager 
} from '../../utils/performanceOptimization';
import { offlineManager, apiCache } from '../../services/cacheManager';

const PerformanceTest = () => {
  const [activeTab, setActiveTab] = useState('web-vitals');
  const [performanceReport, setPerformanceReport] = useState(null);
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [offlineStatus, setOfflineStatus] = useState(offlineManager.getStatus());

  // Performance hooks
  const webVitals = useWebVitals((metric, value) => {
    console.log(`${metric}: ${value}`);
  });

  const { violations, score, checkBudgets } = usePerformanceBudget({
    totalJSSize: 250000,
    totalCSSSize: 50000,
    firstContentfulPaint: 1500,
    largestContentfulPaint: 2500
  });

  const memoryInfo = useMemoryMonitoring(2000);
  const networkInfo = useNetworkInfo();
  const { resources, getTotalSize, getSlowestResources } = useResourceLoading();

  // Update offline status
  useEffect(() => {
    const handleOfflineStatusChange = (event) => {
      setOfflineStatus(offlineManager.getStatus());
    };

    offlineManager.addEventListener(handleOfflineStatusChange);
    
    return () => {
      offlineManager.removeEventListener(handleOfflineStatusChange);
    };
  }, []);

  const runPerformanceTest = async () => {
    setIsTestRunning(true);
    
    try {
      // Check performance budgets
      await checkBudgets();
      
      // Get bundle analysis
      const bundleAnalysis = bundleOptimizationManager.analyzeBundlePerformance();
      
      // Get cache statistics
      const cacheStats = apiCache.getStats();
      
      // Generate comprehensive report
      const report = {
        timestamp: Date.now(),
        webVitals,
        budgetViolations: violations,
        performanceScore: score,
        bundleAnalysis,
        cacheStats,
        memoryInfo,
        networkInfo,
        resourceSummary: {
          totalResources: resources.length,
          totalSize: getTotalSize(),
          slowestResources: getSlowestResources(3)
        }
      };
      
      setPerformanceReport(report);
      
    } catch (error) {
      console.error('Performance test failed:', error);
    } finally {
      setIsTestRunning(false);
    }
  };

  const renderWebVitalsTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Core Web Vitals</h3>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap={4} className="md:grid-cols-2 lg:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {webVitals.fcp ? `${Math.round(webVitals.fcp)}ms` : 'Measuring...'}
              </div>
              <div className="text-sm text-blue-600 font-medium">First Contentful Paint</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 1.8s</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {webVitals.lcp ? `${Math.round(webVitals.lcp)}ms` : 'Measuring...'}
              </div>
              <div className="text-sm text-green-600 font-medium">Largest Contentful Paint</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 2.5s</div>
            </div>
            
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {webVitals.fid ? `${Math.round(webVitals.fid)}ms` : 'Measuring...'}
              </div>
              <div className="text-sm text-yellow-600 font-medium">First Input Delay</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 100ms</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {webVitals.cls ? webVitals.cls.toFixed(3) : 'Measuring...'}
              </div>
              <div className="text-sm text-purple-600 font-medium">Cumulative Layout Shift</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 0.1</div>
            </div>
            
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {webVitals.ttfb ? `${Math.round(webVitals.ttfb)}ms` : 'Measuring...'}
              </div>
              <div className="text-sm text-red-600 font-medium">Time to First Byte</div>
              <div className="text-xs text-gray-500 mt-1">Target: &lt; 800ms</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {score}
              </div>
              <div className="text-sm text-gray-600 font-medium">Performance Score</div>
              <div className="text-xs text-gray-500 mt-1">Out of 100</div>
            </div>
          </Grid>
        </CardBody>
      </Card>

      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-red-600">Budget Violations</h3>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {violations.map((violation, index) => (
                <div key={index} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-red-800">{violation.metric}</div>
                      <div className="text-sm text-red-600">
                        Current: {typeof violation.current === 'number' ? 
                          Math.round(violation.current) : violation.current}
                        {violation.metric.includes('Size') ? ' bytes' : 
                         violation.metric.includes('Paint') || violation.metric.includes('Delay') ? 'ms' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-red-600">
                        Budget: {typeof violation.budget === 'number' ? 
                          Math.round(violation.budget) : violation.budget}
                        {violation.metric.includes('Size') ? ' bytes' : 
                         violation.metric.includes('Paint') || violation.metric.includes('Delay') ? 'ms' : ''}
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        violation.severity === 'critical' ? 'bg-red-600 text-white' :
                        violation.severity === 'high' ? 'bg-red-500 text-white' :
                        violation.severity === 'medium' ? 'bg-yellow-500 text-white' :
                        'bg-gray-500 text-white'
                      }`}>
                        {violation.severity}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}
    </div>
  );

  const renderResourcesTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Resource Loading</h3>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap={4} className="md:grid-cols-3">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(getTotalSize('script') / 1024)}KB
              </div>
              <div className="text-sm text-blue-600 font-medium">JavaScript</div>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Math.round(getTotalSize('stylesheet') / 1024)}KB
              </div>
              <div className="text-sm text-green-600 font-medium">CSS</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(getTotalSize('img') / 1024)}KB
              </div>
              <div className="text-sm text-purple-600 font-medium">Images</div>
            </div>
          </Grid>

          {getSlowestResources().length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium mb-3">Slowest Resources</h4>
              <div className="space-y-2">
                {getSlowestResources().map((resource, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="truncate flex-1 mr-4">
                      <div className="font-medium text-sm truncate">
                        {resource.name.split('/').pop()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {resource.type} • {Math.round(resource.size / 1024)}KB
                      </div>
                    </div>
                    <div className="text-sm font-medium text-red-600">
                      {Math.round(resource.duration)}ms
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderMemoryTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Memory Usage</h3>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap={4} className="md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {memoryInfo.used}MB
                </div>
                <div className="text-sm text-blue-600 font-medium">Used Memory</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {memoryInfo.total}MB
                </div>
                <div className="text-sm text-green-600 font-medium">Total Allocated</div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {memoryInfo.limit}MB
                </div>
                <div className="text-sm text-purple-600 font-medium">Memory Limit</div>
              </div>
              
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {memoryInfo.percentage}%
                </div>
                <div className="text-sm text-yellow-600 font-medium">Usage Percentage</div>
              </div>
            </div>
          </Grid>

          {/* Memory Usage Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Memory Usage</span>
              <span>{memoryInfo.used}MB / {memoryInfo.limit}MB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  memoryInfo.percentage > 80 ? 'bg-red-500' :
                  memoryInfo.percentage > 60 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(memoryInfo.percentage, 100)}%` }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderNetworkTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Network Information</h3>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap={4} className="md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Connection Status:</span>
                <span className={`font-medium ${networkInfo.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {networkInfo.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Effective Type:</span>
                <span className="font-medium">{networkInfo.effectiveType}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Downlink:</span>
                <span className="font-medium">{networkInfo.downlink} Mbps</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Round Trip Time:</span>
                <span className="font-medium">{networkInfo.rtt}ms</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Save Data:</span>
                <span className="font-medium">{networkInfo.saveData ? 'Enabled' : 'Disabled'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Connection Quality:</span>
                <span className={`font-medium ${
                  networkInfo.effectiveType === '4g' ? 'text-green-600' :
                  networkInfo.effectiveType === '3g' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {networkInfo.effectiveType === '4g' ? 'Excellent' :
                   networkInfo.effectiveType === '3g' ? 'Good' :
                   'Poor'}
                </span>
              </div>
            </div>
          </Grid>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Offline Status</h3>
        </CardHeader>
        <CardBody>
          <Grid cols={1} gap={4} className="md:grid-cols-2">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Service Worker:</span>
                <span className={`font-medium ${offlineStatus.hasServiceWorker ? 'text-green-600' : 'text-red-600'}`}>
                  {offlineStatus.hasServiceWorker ? 'Active' : 'Not Available'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">IndexedDB:</span>
                <span className={`font-medium ${offlineStatus.hasIndexedDB ? 'text-green-600' : 'text-red-600'}`}>
                  {offlineStatus.hasIndexedDB ? 'Available' : 'Not Available'}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">Pending Actions:</span>
                <span className="font-medium">{offlineStatus.pendingActions}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Sync Status:</span>
                <span className={`font-medium ${offlineStatus.syncInProgress ? 'text-blue-600' : 'text-gray-600'}`}>
                  {offlineStatus.syncInProgress ? 'Syncing...' : 'Idle'}
                </span>
              </div>
              
              <Button
                onClick={() => offlineManager.forcSync()}
                disabled={!networkInfo.isOnline || offlineStatus.syncInProgress}
                size="sm"
                className="w-full"
              >
                Force Sync
              </Button>
            </div>
          </Grid>
        </CardBody>
      </Card>
    </div>
  );

  const renderCacheTab = () => {
    const [cacheStats, setCacheStats] = useState(null);

    useEffect(() => {
      const updateCacheStats = () => {
        const stats = apiCache.getStats();
        setCacheStats(stats);
      };

      updateCacheStats();
      const interval = setInterval(updateCacheStats, 5000);
      
      return () => clearInterval(interval);
    }, []);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Cache Statistics</h3>
          </CardHeader>
          <CardBody>
            {cacheStats && (
              <Grid cols={1} gap={4} className="md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-3">Memory Cache</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entries:</span>
                      <span className="font-medium">{cacheStats.memory.size}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hit Rate:</span>
                      <span className="font-medium">{(cacheStats.memory.hitRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired Items:</span>
                      <span className="font-medium">{cacheStats.memory.expiredItems}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Storage Cache</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Entries:</span>
                      <span className="font-medium">{cacheStats.storage.itemCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Size:</span>
                      <span className="font-medium">{Math.round(cacheStats.storage.totalSize / 1024)}KB</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Expired Items:</span>
                      <span className="font-medium">{cacheStats.storage.expiredCount}</span>
                    </div>
                  </div>
                </div>
              </Grid>
            )}

            <div className="mt-6 flex space-x-3">
              <Button
                onClick={() => apiCache.cleanup()}
                variant="secondary"
                size="sm"
              >
                Cleanup Cache
              </Button>
              <Button
                onClick={() => {
                  apiCache.memoryCache.clear();
                  apiCache.persistentCache.clear();
                }}
                variant="secondary"
                size="sm"
              >
                Clear All Cache
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderPerformanceReportTab = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Performance Report</h3>
            <Button
              onClick={runPerformanceTest}
              disabled={isTestRunning}
              size="sm"
            >
              {isTestRunning ? 'Running Test...' : 'Run Performance Test'}
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          {performanceReport ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {performanceReport.performanceScore}
                  </div>
                  <div className="text-sm text-blue-600 font-medium">Overall Score</div>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {performanceReport.budgetViolations.length}
                  </div>
                  <div className="text-sm text-green-600 font-medium">Budget Violations</div>
                </div>
                
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {performanceReport.resourceSummary.totalResources}
                  </div>
                  <div className="text-sm text-purple-600 font-medium">Total Resources</div>
                </div>
                
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-600">
                    {Math.round(performanceReport.resourceSummary.totalSize / 1024)}KB
                  </div>
                  <div className="text-sm text-yellow-600 font-medium">Total Size</div>
                </div>
              </div>

              {performanceReport.bundleAnalysis && (
                <div>
                  <h4 className="font-medium mb-3">Bundle Analysis</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">JavaScript</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Files:</span>
                          <span>{performanceReport.bundleAnalysis.javascript.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{Math.round(performanceReport.bundleAnalysis.javascript.totalSize / 1024)}KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Load Time:</span>
                          <span>{Math.round(performanceReport.bundleAnalysis.javascript.loadTime)}ms</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h5 className="font-medium mb-2">CSS</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Files:</span>
                          <span>{performanceReport.bundleAnalysis.css.count}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Size:</span>
                          <span>{Math.round(performanceReport.bundleAnalysis.css.totalSize / 1024)}KB</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Load Time:</span>
                          <span>{Math.round(performanceReport.bundleAnalysis.css.loadTime)}ms</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>Click "Run Performance Test" to generate a comprehensive report</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const tabs = [
    { id: 'web-vitals', label: 'Web Vitals', content: renderWebVitalsTab },
    { id: 'resources', label: 'Resources', content: renderResourcesTab },
    { id: 'memory', label: 'Memory', content: renderMemoryTab },
    { id: 'network', label: 'Network', content: renderNetworkTab },
    { id: 'cache', label: 'Cache', content: renderCacheTab },
    { id: 'report', label: 'Report', content: renderPerformanceReportTab }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className="py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Performance Monitoring Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive performance monitoring and optimization tools
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveTab(tab.id)}
                className="whitespace-nowrap"
              >
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Tab Content */}
          {tabs.find(tab => tab.id === activeTab)?.content()}
        </div>
      </Container>
    </div>
  );
};

export default PerformanceTest;
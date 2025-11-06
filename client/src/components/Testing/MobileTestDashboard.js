import React, { useState, useEffect } from 'react';
import responsiveTestSuite from '../../utils/responsiveTest';
import visualTestSuite from '../../utils/visualTest';
import performanceMonitor from '../../utils/performanceMonitor';
import {
  PlayIcon,
  StopIcon,
  DocumentTextIcon,
  PhotoIcon,
  ChartBarIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';

const MobileTestDashboard = () => {
  const [testResults, setTestResults] = useState(null);
  const [visualTests, setVisualTests] = useState(null);
  const [performanceData, setPerformanceData] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('responsive');

  useEffect(() => {
    // Load existing performance data
    const perfData = performanceMonitor.getAllMetrics();
    if (Object.keys(perfData).length > 0) {
      setPerformanceData(perfData);
    }
  }, []);

  const runResponsiveTests = async () => {
    setIsRunning(true);
    try {
      const results = await responsiveTestSuite.runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Failed to run responsive tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runVisualTests = async () => {
    setIsRunning(true);
    try {
      const screenshots = await visualTestSuite.testResponsiveBreakpoints();
      const report = visualTestSuite.generateVisualReport();
      setVisualTests(report);
    } catch (error) {
      console.error('Failed to run visual tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceTests = () => {
    setIsRunning(true);
    try {
      performanceMonitor.measurePageLoad();
      performanceMonitor.measureCoreWebVitals();
      performanceMonitor.measureMemoryUsage();
      performanceMonitor.monitorFrameRate(3000);
      
      setTimeout(() => {
        const data = performanceMonitor.getAllMetrics();
        setPerformanceData(data);
        setIsRunning(false);
      }, 3500);
    } catch (error) {
      console.error('Failed to run performance tests:', error);
      setIsRunning(false);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    try {
      await runResponsiveTests();
      await runVisualTests();
      runPerformanceTests();
    } catch (error) {
      console.error('Failed to run all tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const exportResults = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      responsive: testResults,
      visual: visualTests,
      performance: performanceData
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-test-results-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 90) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const tabs = [
    { id: 'responsive', name: 'Responsive Tests', icon: DocumentTextIcon },
    { id: 'visual', name: 'Visual Tests', icon: PhotoIcon },
    { id: 'performance', name: 'Performance', icon: ChartBarIcon }
  ];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mobile Test Dashboard</h1>
          <p className="text-gray-600">Comprehensive mobile responsiveness testing</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {isRunning ? (
              <>
                <StopIcon className="h-5 w-5 mr-2" />
                Running...
              </>
            ) : (
              <>
                <PlayIcon className="h-5 w-5 mr-2" />
                Run All Tests
              </>
            )}
          </button>
          
          {(testResults || visualTests || performanceData) && (
            <button
              onClick={exportResults}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Export Results
            </button>
          )}
        </div>
      </div>

      {/* Overall Score */}
      {testResults && (
        <div className={`p-6 rounded-lg border-2 mb-6 ${getScoreBg(testResults.summary.score)}`}>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Overall Mobile Score</h2>
              <p className="text-gray-600">Based on responsiveness, performance, and accessibility</p>
            </div>
            <div className="text-center">
              <div className={`text-4xl font-bold ${getScoreColor(testResults.summary.score)}`}>
                {testResults.summary.score}/100
              </div>
              <p className="text-sm text-gray-500 mt-1">Mobile Score</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                ${activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="min-h-96">
        {/* Responsive Tests Tab */}
        {activeTab === 'responsive' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Responsive Tests</h3>
              <button
                onClick={runResponsiveTests}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRunning ? 'Running...' : 'Run Tests'}
              </button>
            </div>

            {testResults ? (
              <div className="space-y-4">
                {/* Test Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{testResults.summary.passed}</p>
                        <p className="text-sm text-green-700">Tests Passed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-red-600">{testResults.summary.failed}</p>
                        <p className="text-sm text-red-700">Tests Failed</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <DocumentTextIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{testResults.summary.totalTests}</p>
                        <p className="text-sm text-blue-700">Total Tests</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Test Results */}
                <div className="space-y-3">
                  {testResults.results.map((test, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        test.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start">
                          {test.passed ? (
                            <CheckCircleIcon className="h-5 w-5 text-green-600 mr-3 mt-0.5" />
                          ) : (
                            <XCircleIcon className="h-5 w-5 text-red-600 mr-3 mt-0.5" />
                          )}
                          <div>
                            <h4 className="font-medium text-gray-900">{test.test}</h4>
                            <p className={`text-sm ${test.passed ? 'text-green-700' : 'text-red-700'}`}>
                              {test.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Recommendations */}
                {testResults.recommendations.length > 0 && (
                  <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start">
                      <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-900 mb-2">Recommendations</h4>
                        <ul className="space-y-1">
                          {testResults.recommendations.map((rec, index) => (
                            <li key={index} className="text-sm text-yellow-800">
                              • {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No responsive test results yet. Click "Run Tests" to start.</p>
              </div>
            )}
          </div>
        )}

        {/* Visual Tests Tab */}
        {activeTab === 'visual' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Visual Tests</h3>
              <button
                onClick={runVisualTests}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRunning ? 'Running...' : 'Run Visual Tests'}
              </button>
            </div>

            {visualTests ? (
              <div className="space-y-6">
                {/* Visual Test Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <PhotoIcon className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{visualTests.summary.totalScreenshots}</p>
                        <p className="text-sm text-blue-700">Screenshots Captured</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-2xl font-bold text-purple-600">{visualTests.summary.totalComparisons}</p>
                        <p className="text-sm text-purple-700">Comparisons Made</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Screenshots Grid */}
                {visualTests.screenshots.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Screenshots</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {visualTests.screenshots.map((screenshot, index) => (
                        <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                          <img
                            src={screenshot.dataUrl}
                            alt={screenshot.name}
                            className="w-full h-32 object-cover rounded mb-2"
                          />
                          <h5 className="font-medium text-sm text-gray-900">{screenshot.name}</h5>
                          <p className="text-xs text-gray-500">
                            {screenshot.viewport.width}x{screenshot.viewport.height}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <PhotoIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No visual test results yet. Click "Run Visual Tests" to start.</p>
              </div>
            )}
          </div>
        )}

        {/* Performance Tab */}
        {activeTab === 'performance' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
              <button
                onClick={runPerformanceTests}
                disabled={isRunning}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isRunning ? 'Running...' : 'Run Performance Tests'}
              </button>
            </div>

            {performanceData ? (
              <div className="space-y-6">
                {/* Core Web Vitals */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Core Web Vitals</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {performanceData.lcp && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">LCP</h5>
                        <p className="text-2xl font-bold text-blue-600">{performanceData.lcp.toFixed(0)}ms</p>
                        <p className="text-sm text-gray-500">Largest Contentful Paint</p>
                      </div>
                    )}
                    
                    {performanceData.fid && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">FID</h5>
                        <p className="text-2xl font-bold text-green-600">{performanceData.fid.toFixed(0)}ms</p>
                        <p className="text-sm text-gray-500">First Input Delay</p>
                      </div>
                    )}
                    
                    {performanceData.cls && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900">CLS</h5>
                        <p className="text-2xl font-bold text-purple-600">{performanceData.cls.toFixed(3)}</p>
                        <p className="text-sm text-gray-500">Cumulative Layout Shift</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Memory Usage */}
                {performanceData.memory && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Memory Usage</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Used Memory</p>
                          <p className="text-xl font-bold text-gray-900">
                            {Math.round(performanceData.memory.used / 1048576)} MB
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Total Memory</p>
                          <p className="text-xl font-bold text-gray-900">
                            {Math.round(performanceData.memory.total / 1048576)} MB
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Frame Rate */}
                {performanceData.fps && (
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Frame Rate</h4>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <p className="text-2xl font-bold text-green-600">{performanceData.fps} FPS</p>
                      <p className="text-sm text-gray-500">Average frame rate</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No performance data yet. Click "Run Performance Tests" to start.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTestDashboard;
// Cross-Device Test Runner Component
// Comprehensive cross-device testing interface
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  CardDescription,
  Button,
  Badge,
  Progress,
  Input
} from '../ui';
import { ResponsiveGrid } from '../Layout/ResponsiveLayout';
import { crossDeviceTestManager, getDeviceProfiles } from '../../utils/crossDeviceTesting';
import { deviceOptimizationManager } from '../../utils/deviceOptimization';

/**
 * Cross-Device Test Runner Component
 * Interface for running and managing cross-device tests
 */
export const CrossDeviceTestRunner = ({ onTestComplete }) => {
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState(new Set());
  const [selectedTestSuites, setSelectedTestSuites] = useState(new Set(['layout', 'interaction', 'performance', 'accessibility']));
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [currentDevice, setCurrentDevice] = useState('');
  const [testProgress, setTestProgress] = useState(0);
  const [testConfig, setTestConfig] = useState({
    parallel: false,
    timeout: 30000,
    retries: 1
  });

  const testSuites = [
    { id: 'layout', name: 'Layout & Responsiveness', description: 'Test responsive design and layout adaptation' },
    { id: 'interaction', name: 'User Interactions', description: 'Test touch targets, gestures, and input methods' },
    { id: 'performance', name: 'Performance', description: 'Test load times, memory usage, and animations' },
    { id: 'accessibility', name: 'Accessibility', description: 'Test screen reader support and keyboard navigation' }
  ];

  useEffect(() => {
    // Load device profiles
    const profiles = getDeviceProfiles();
    setDeviceProfiles(profiles);
    
    // Select all devices by default
    setSelectedDevices(new Set(profiles.map(p => p.id)));
  }, []);

  const handleDeviceToggle = (deviceId) => {
    const newSelected = new Set(selectedDevices);
    if (newSelected.has(deviceId)) {
      newSelected.delete(deviceId);
    } else {
      newSelected.add(deviceId);
    }
    setSelectedDevices(newSelected);
  };

  const handleTestSuiteToggle = (suiteId) => {
    const newSelected = new Set(selectedTestSuites);
    if (newSelected.has(suiteId)) {
      newSelected.delete(suiteId);
    } else {
      newSelected.add(suiteId);
    }
    setSelectedTestSuites(newSelected);
  };

  const runTests = async () => {
    if (selectedDevices.size === 0 || selectedTestSuites.size === 0) {
      alert('Please select at least one device and one test suite');
      return;
    }

    setIsRunning(true);
    setTestProgress(0);
    setCurrentDevice('');

    try {
      const config = {
        devices: Array.from(selectedDevices),
        testSuites: Array.from(selectedTestSuites),
        parallel: testConfig.parallel,
        timeout: testConfig.timeout,
        retries: testConfig.retries
      };

      // Mock progress updates
      const progressInterval = setInterval(() => {
        setTestProgress(prev => {
          const newProgress = prev + (100 / (selectedDevices.size * 10));
          return Math.min(newProgress, 95);
        });
      }, 200);

      // Run the actual tests
      const results = await crossDeviceTestManager.runCrossDeviceTests(config);
      
      clearInterval(progressInterval);
      setTestProgress(100);
      
      setTestResults(results);
      
      if (onTestComplete) {
        onTestComplete(results);
      }

    } catch (error) {
      console.error('Test execution failed:', error);
      alert('Test execution failed: ' + error.message);
    } finally {
      setIsRunning(false);
      setTestProgress(0);
      setCurrentDevice('');
    }
  };

  const getDeviceStatusBadge = (deviceResult) => {
    if (!deviceResult) return <Badge variant="secondary">Not Tested</Badge>;
    
    const score = deviceResult.overallScore;
    if (score >= 90) return <Badge variant="success">Excellent</Badge>;
    if (score >= 75) return <Badge variant="success">Good</Badge>;
    if (score >= 60) return <Badge variant="warning">Fair</Badge>;
    return <Badge variant="danger">Poor</Badge>;
  };

  const getTestSuiteScore = (deviceResult, suiteId) => {
    if (!deviceResult || !deviceResult.testSuites[suiteId]) return 'N/A';
    return Math.round(deviceResult.testSuites[suiteId].score);
  };

  const renderDeviceSelection = () => (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Device Selection</CardTitle>
        <CardDescription>
          Select devices to test against ({selectedDevices.size} selected)
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDevices(new Set(deviceProfiles.map(p => p.id)))}
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDevices(new Set())}
            >
              Clear All
            </Button>
          </div>
          
          <ResponsiveGrid cols={{ base: 1, md: 2, lg: 3 }} gap={3}>
            {deviceProfiles.map((device) => (
              <div
                key={device.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedDevices.has(device.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleDeviceToggle(device.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{device.name}</div>
                    <div className="text-xs text-gray-500">
                      {device.viewport.width}×{device.viewport.height}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {device.category}
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <input
                      type="checkbox"
                      checked={selectedDevices.has(device.id)}
                      onChange={() => handleDeviceToggle(device.id)}
                      className="mb-1"
                    />
                    {testResults && (
                      getDeviceStatusBadge(testResults.deviceResults?.find(r => r.deviceId === device.id))
                    )}
                  </div>
                </div>
              </div>
            ))}
          </ResponsiveGrid>
        </div>
      </CardBody>
    </Card>
  );

  const renderTestSuiteSelection = () => (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Test Suite Selection</CardTitle>
        <CardDescription>
          Select test suites to run ({selectedTestSuites.size} selected)
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="space-y-3">
          {testSuites.map((suite) => (
            <div
              key={suite.id}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                selectedTestSuites.has(suite.id)
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => handleTestSuiteToggle(suite.id)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-sm">{suite.name}</div>
                  <div className="text-xs text-gray-500">{suite.description}</div>
                </div>
                <input
                  type="checkbox"
                  checked={selectedTestSuites.has(suite.id)}
                  onChange={() => handleTestSuiteToggle(suite.id)}
                />
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );

  const renderTestConfiguration = () => (
    <Card variant="outline">
      <CardHeader>
        <CardTitle>Test Configuration</CardTitle>
        <CardDescription>
          Configure test execution parameters
        </CardDescription>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="parallel"
              checked={testConfig.parallel}
              onChange={(e) => setTestConfig(prev => ({ ...prev, parallel: e.target.checked }))}
            />
            <label htmlFor="parallel" className="text-sm">
              Run tests in parallel (faster but may be less accurate)
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Timeout (seconds)
            </label>
            <Input
              type="number"
              value={testConfig.timeout / 1000}
              onChange={(e) => setTestConfig(prev => ({ 
                ...prev, 
                timeout: parseInt(e.target.value) * 1000 
              }))}
              min="10"
              max="300"
              className="w-24"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Retries on failure
            </label>
            <Input
              type="number"
              value={testConfig.retries}
              onChange={(e) => setTestConfig(prev => ({ 
                ...prev, 
                retries: parseInt(e.target.value) 
              }))}
              min="0"
              max="5"
              className="w-24"
            />
          </div>
        </div>
      </CardBody>
    </Card>
  );

  const renderTestResults = () => {
    if (!testResults) return null;

    return (
      <div className="space-y-6">
        {/* Summary */}
        <Card variant="medical">
          <CardHeader>
            <CardTitle>Test Results Summary</CardTitle>
            <CardDescription>
              Tested {testResults.summary.totalDevices} devices with {selectedTestSuites.size} test suites
            </CardDescription>
          </CardHeader>
          <CardBody>
            <ResponsiveGrid cols={{ base: 2, md: 4 }} gap={4}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {testResults.summary.averageScore}%
                </div>
                <div className="text-sm text-blue-700">Average Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {testResults.summary.passedDevices}
                </div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">
                  {testResults.summary.failedDevices}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {testResults.summary.criticalIssues}
                </div>
                <div className="text-sm text-orange-700">Critical Issues</div>
              </div>
            </ResponsiveGrid>
          </CardBody>
        </Card>

        {/* Device Results */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Device Test Results</CardTitle>
            <CardDescription>
              Detailed results for each tested device
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">Device</th>
                    <th className="text-center p-2">Overall</th>
                    {Array.from(selectedTestSuites).map(suiteId => (
                      <th key={suiteId} className="text-center p-2 capitalize">
                        {suiteId}
                      </th>
                    ))}
                    <th className="text-center p-2">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {testResults.deviceResults.map((deviceResult) => {
                    const device = deviceProfiles.find(d => d.id === deviceResult.deviceId);
                    return (
                      <tr key={deviceResult.deviceId} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{device?.name}</div>
                            <div className="text-xs text-gray-500">
                              {device?.viewport.width}×{device?.viewport.height}
                            </div>
                          </div>
                        </td>
                        <td className="text-center p-2">
                          <div className="flex flex-col items-center">
                            <div className="font-bold">{deviceResult.overallScore}%</div>
                            {getDeviceStatusBadge(deviceResult)}
                          </div>
                        </td>
                        {Array.from(selectedTestSuites).map(suiteId => (
                          <td key={suiteId} className="text-center p-2">
                            <div className="font-medium">
                              {getTestSuiteScore(deviceResult, suiteId)}%
                            </div>
                          </td>
                        ))}
                        <td className="text-center p-2">
                          <Badge variant="warning" size="xs">
                            {deviceResult.recommendations?.length || 0}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>

        {/* Recommendations */}
        {testResults.recommendations && testResults.recommendations.length > 0 && (
          <Card variant="outline">
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>
                Suggested improvements based on test results
              </CardDescription>
            </CardHeader>
            <CardBody>
              <div className="space-y-3">
                {testResults.recommendations.slice(0, 10).map((rec, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                    <Badge variant={rec.priority === 'high' ? 'danger' : 'warning'} size="xs">
                      {rec.priority}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{rec.category}</div>
                      <div className="text-sm text-gray-700">{rec.message}</div>
                      {rec.details && rec.details.length > 0 && (
                        <div className="text-xs text-gray-600 mt-1">
                          {rec.details.slice(0, 2).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Test Controls */}
      <Card variant="medical">
        <CardHeader>
          <CardTitle>Cross-Device Testing Suite</CardTitle>
          <CardDescription>
            Test your premium UI across different devices and screen sizes
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedDevices.size} devices × {selectedTestSuites.size} test suites = {selectedDevices.size * selectedTestSuites.size} total tests
            </div>
            <Button
              variant="medical"
              size="lg"
              onClick={runTests}
              loading={isRunning}
              disabled={isRunning || selectedDevices.size === 0 || selectedTestSuites.size === 0}
            >
              {isRunning ? 'Running Tests...' : 'Run Cross-Device Tests'}
            </Button>
          </div>
          
          {/* Progress Bar */}
          {isRunning && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {currentDevice || 'Preparing tests...'}
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(testProgress)}%
                </span>
              </div>
              <Progress value={testProgress} variant="primary" size="lg" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Configuration */}
      <ResponsiveGrid cols={{ base: 1, lg: 3 }} gap={6}>
        {renderDeviceSelection()}
        {renderTestSuiteSelection()}
        {renderTestConfiguration()}
      </ResponsiveGrid>

      {/* Results */}
      {renderTestResults()}
    </div>
  );
};

export default CrossDeviceTestRunner;
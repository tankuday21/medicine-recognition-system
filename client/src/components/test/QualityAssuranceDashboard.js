// Quality Assurance Dashboard Component
// Comprehensive QA interface for premium mobile UI
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
import { qualityAssuranceManager, runQualityAssurance, getQASummary, getCriticalIssues } from '../../utils/qualityAssurance';

/**
 * Quality Assurance Dashboard Component
 * Central interface for quality assurance and validation
 */
export const QualityAssuranceDashboard = ({ onQAComplete }) => {
  const [qaResults, setQAResults] = useState(null);
  const [qaSummary, setQASummary] = useState(null);
  const [criticalIssues, setCriticalIssues] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [qaProgress, setQAProgress] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState(new Set(['UI/UX', 'Accessibility', 'Performance', 'Functionality', 'Medical']));
  const [selectedPriorities, setSelectedPriorities] = useState(new Set(['critical', 'high', 'medium']));
  const [activeTab, setActiveTab] = useState('overview');

  const categories = [
    { id: 'UI/UX', name: 'UI/UX', description: 'User interface and experience quality', icon: '🎨' },
    { id: 'Accessibility', name: 'Accessibility', description: 'WCAG compliance and inclusive design', icon: '♿' },
    { id: 'Performance', name: 'Performance', description: 'Loading and runtime performance', icon: '⚡' },
    { id: 'Functionality', name: 'Functionality', description: 'Feature functionality and reliability', icon: '⚙️' },
    { id: 'Medical', name: 'Medical', description: 'Medical app specific requirements', icon: '🏥' }
  ];

  const priorities = [
    { id: 'critical', name: 'Critical', description: 'Must fix issues', color: 'red' },
    { id: 'high', name: 'High', description: 'Important issues', color: 'orange' },
    { id: 'medium', name: 'Medium', description: 'Moderate issues', color: 'yellow' },
    { id: 'low', name: 'Low', description: 'Minor issues', color: 'blue' }
  ];

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'results', name: 'Detailed Results', icon: '📋' },
    { id: 'critical', name: 'Critical Issues', icon: '🚨' },
    { id: 'trends', name: 'Trends', icon: '📈' },
    { id: 'recommendations', name: 'Recommendations', icon: '💡' }
  ];

  useEffect(() => {
    // Load initial data
    loadQAData();
  }, []);

  const loadQAData = () => {
    const summary = getQASummary();
    const critical = getCriticalIssues();
    
    setQASummary(summary);
    setCriticalIssues(critical);
  };

  const handleCategoryToggle = (categoryId) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryId)) {
      newSelected.delete(categoryId);
    } else {
      newSelected.add(categoryId);
    }
    setSelectedCategories(newSelected);
  };

  const handlePriorityToggle = (priorityId) => {
    const newSelected = new Set(selectedPriorities);
    if (newSelected.has(priorityId)) {
      newSelected.delete(priorityId);
    } else {
      newSelected.add(priorityId);
    }
    setSelectedPriorities(newSelected);
  };

  const runQA = async () => {
    if (selectedCategories.size === 0) {
      alert('Please select at least one category');
      return;
    }

    setIsRunning(true);
    setQAProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setQAProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const options = {
        categories: Array.from(selectedCategories),
        priority: Array.from(selectedPriorities),
        skipCache: true
      };

      const results = await runQualityAssurance(options);
      
      clearInterval(progressInterval);
      setQAProgress(100);
      
      setQAResults(results);
      loadQAData(); // Refresh summary and critical issues
      
      if (onQAComplete) {
        onQAComplete(results);
      }

    } catch (error) {
      console.error('QA execution failed:', error);
      alert('QA execution failed: ' + error.message);
    } finally {
      setIsRunning(false);
      setTimeout(() => setQAProgress(0), 1000);
    }
  };

  const getScoreBadgeVariant = (score) => {
    if (score >= 90) return 'success';
    if (score >= 75) return 'warning';
    if (score >= 60) return 'warning';
    return 'danger';
  };

  const getPriorityBadgeVariant = (priority) => {
    switch (priority) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* QA Summary */}
      <Card variant="medical">
        <CardHeader>
          <CardTitle>Quality Assurance Summary</CardTitle>
          <CardDescription>
            Overall quality metrics and status
          </CardDescription>
        </CardHeader>
        <CardBody>
          <ResponsiveGrid cols={{ base: 2, md: 4 }} gap={4}>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {qaSummary?.latestScore || 0}%
              </div>
              <div className="text-sm text-blue-700">Latest Score</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {qaSummary?.averageScore || 0}%
              </div>
              <div className="text-sm text-green-700">Average Score</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {qaSummary?.criticalIssues || 0}
              </div>
              <div className="text-sm text-red-700">Critical Issues</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {qaSummary?.totalSessions || 0}
              </div>
              <div className="text-sm text-purple-700">QA Sessions</div>
            </div>
          </ResponsiveGrid>
        </CardBody>
      </Card>

      {/* Category Status */}
      {qaSummary?.trends && qaSummary.trends.length > 0 && (
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Category Status</CardTitle>
            <CardDescription>
              Quality status by category
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              {qaSummary.trends.map((trend) => (
                <div key={trend.category} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {categories.find(c => c.id === trend.category)?.icon || '📋'}
                    </span>
                    <div>
                      <div className="font-medium">{trend.category}</div>
                      <div className="text-sm text-gray-500">
                        {categories.find(c => c.id === trend.category)?.description}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getScoreBadgeVariant(trend.current)}>
                      {trend.current}%
                    </Badge>
                    <div className={`text-sm ${
                      trend.trend === 'improving' ? 'text-green-600' : 
                      trend.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                    }`}>
                      {trend.change > 0 ? '+' : ''}{trend.change}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {/* Quick Actions */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="medical"
              onClick={runQA}
              loading={isRunning}
              disabled={isRunning}
            >
              Run Full QA
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('critical')}
              disabled={criticalIssues.length === 0}
            >
              View Critical Issues ({criticalIssues.length})
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('results')}
              disabled={!qaResults}
            >
              View Detailed Results
            </Button>
            <Button
              variant="outline"
              onClick={() => setActiveTab('recommendations')}
              disabled={!qaResults}
            >
              View Recommendations
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderResults = () => {
    if (!qaResults) {
      return (
        <Card variant="outline">
          <CardBody>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No QA results available</p>
              <Button variant="medical" onClick={runQA}>
                Run Quality Assurance
              </Button>
            </div>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="space-y-6">
        {/* Results Summary */}
        <Card variant="medical">
          <CardHeader>
            <CardTitle>QA Results Summary</CardTitle>
            <CardDescription>
              Results from {new Date(qaResults.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardBody>
            <ResponsiveGrid cols={{ base: 2, md: 4 }} gap={4}>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-xl font-bold text-blue-600">
                  {qaResults.summary.totalChecks}
                </div>
                <div className="text-sm text-blue-700">Total Checks</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-xl font-bold text-green-600">
                  {qaResults.summary.passedChecks}
                </div>
                <div className="text-sm text-green-700">Passed</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-xl font-bold text-red-600">
                  {qaResults.summary.failedChecks}
                </div>
                <div className="text-sm text-red-700">Failed</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-xl font-bold text-orange-600">
                  {qaResults.summary.overallScore}%
                </div>
                <div className="text-sm text-orange-700">Overall Score</div>
              </div>
            </ResponsiveGrid>
          </CardBody>
        </Card>

        {/* Detailed Results by Rule */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Detailed Results by Rule</CardTitle>
            <CardDescription>
              Individual rule results and scores
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              {Array.from(qaResults.results.entries()).map(([ruleId, ruleResult]) => (
                <div key={ruleId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{ruleResult.rule.description}</h4>
                      <div className="text-sm text-gray-500">
                        {ruleResult.rule.category} • {ruleResult.checks.length} checks
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getPriorityBadgeVariant(ruleResult.rule.priority)}>
                        {ruleResult.rule.priority}
                      </Badge>
                      <Badge variant={getScoreBadgeVariant(ruleResult.score)}>
                        {ruleResult.score}%
                      </Badge>
                    </div>
                  </div>
                  
                  {ruleResult.issues.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm text-red-700 mb-2">Issues:</h5>
                      <div className="space-y-1">
                        {ruleResult.issues.slice(0, 3).map((issue, index) => (
                          <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                            {issue}
                          </div>
                        ))}
                        {ruleResult.issues.length > 3 && (
                          <div className="text-sm text-gray-500">
                            +{ruleResult.issues.length - 3} more issues
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {ruleResult.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-blue-700 mb-2">Recommendations:</h5>
                      <div className="space-y-1">
                        {ruleResult.recommendations.slice(0, 2).map((rec, index) => (
                          <div key={index} className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                            {rec}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>
    );
  };

  const renderCriticalIssues = () => (
    <div className="space-y-6">
      <Card variant="medical">
        <CardHeader>
          <CardTitle>Critical Issues</CardTitle>
          <CardDescription>
            Issues that require immediate attention ({criticalIssues.length} found)
          </CardDescription>
        </CardHeader>
        <CardBody>
          {criticalIssues.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-green-600 text-4xl mb-4">✅</div>
              <p className="text-green-700 font-medium">No critical issues found!</p>
              <p className="text-gray-600 text-sm">Your premium UI meets all critical quality standards.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {criticalIssues.map((issue, index) => (
                <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-red-900">{issue.rule.description}</h4>
                    <Badge variant="danger">{issue.score}%</Badge>
                  </div>
                  <div className="text-sm text-red-700 mb-3">
                    Category: {issue.rule.category}
                  </div>
                  
                  {issue.issues.length > 0 && (
                    <div className="mb-3">
                      <h5 className="font-medium text-sm text-red-800 mb-2">Issues:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {issue.issues.map((issueText, issueIndex) => (
                          <li key={issueIndex} className="text-sm text-red-700">
                            {issueText}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {issue.recommendations.length > 0 && (
                    <div>
                      <h5 className="font-medium text-sm text-red-800 mb-2">Recommended Actions:</h5>
                      <ul className="list-disc list-inside space-y-1">
                        {issue.recommendations.map((rec, recIndex) => (
                          <li key={recIndex} className="text-sm text-red-700">
                            {rec}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );

  const renderConfiguration = () => (
    <div className="space-y-6">
      {/* Category Selection */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Category Selection</CardTitle>
          <CardDescription>
            Select quality categories to check ({selectedCategories.size} selected)
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {categories.map((category) => (
              <div
                key={category.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedCategories.has(category.id)
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{category.name}</div>
                      <div className="text-xs text-gray-500">{category.description}</div>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Priority Selection */}
      <Card variant="outline">
        <CardHeader>
          <CardTitle>Priority Selection</CardTitle>
          <CardDescription>
            Select issue priorities to check ({selectedPriorities.size} selected)
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="space-y-3">
            {priorities.map((priority) => (
              <div
                key={priority.id}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedPriorities.has(priority.id)
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handlePriorityToggle(priority.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-sm">{priority.name}</div>
                    <div className="text-xs text-gray-500">{priority.description}</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedPriorities.has(priority.id)}
                    onChange={() => handlePriorityToggle(priority.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'results':
        return renderResults();
      case 'critical':
        return renderCriticalIssues();
      case 'trends':
        return renderOverview(); // For now, trends are in overview
      case 'recommendations':
        return renderResults(); // For now, recommendations are in results
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card variant="medical">
        <CardHeader>
          <CardTitle>Quality Assurance Dashboard</CardTitle>
          <CardDescription>
            Comprehensive quality validation for premium mobile UI
          </CardDescription>
        </CardHeader>
        <CardBody>
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {selectedCategories.size} categories • {selectedPriorities.size} priorities
            </div>
            <Button
              variant="medical"
              size="lg"
              onClick={runQA}
              loading={isRunning}
              disabled={isRunning || selectedCategories.size === 0}
            >
              {isRunning ? 'Running QA...' : 'Run Quality Assurance'}
            </Button>
          </div>
          
          {/* Progress Bar */}
          {isRunning && (
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Running quality checks...
                </span>
                <span className="text-sm text-gray-500">
                  {Math.round(qaProgress)}%
                </span>
              </div>
              <Progress value={qaProgress} variant="primary" size="lg" />
            </div>
          )}
        </CardBody>
      </Card>

      {/* Tab Navigation */}
      <div className="flex overflow-x-auto border-b bg-gray-50 rounded-lg">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.name}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {renderTabContent()}
      </div>

      {/* Configuration Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderConfiguration()}
      </div>
    </div>
  );
};

export default QualityAssuranceDashboard;
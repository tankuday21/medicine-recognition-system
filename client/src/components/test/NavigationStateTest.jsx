// Navigation State Management Test Component
// Demonstrates navigation state, analytics, and deep linking features

import React, { useState, useEffect } from 'react';
import {
  NavigationProvider,
  useNavigation,
  Card,
  CardHeader,
  CardBody,
  Button,
  Container,
  Grid,
  Breadcrumb,
  MedicalBreadcrumb
} from '../ui';

const NavigationStateDemo = () => {
  const navigation = useNavigation();
  const [insights, setInsights] = useState(null);
  const [shareableLink, setShareableLink] = useState('');
  const [medicalLink, setMedicalLink] = useState('');

  // Sample breadcrumb data
  const breadcrumbs = [
    { id: 'patients', label: 'Patients', route: '/patients' },
    { id: 'patient-123', label: 'John Doe', route: '/patients/123' },
    { id: 'medical-records', label: 'Medical Records', route: '/patients/123/records' }
  ];

  useEffect(() => {
    // Update insights periodically
    const interval = setInterval(() => {
      if (navigation.enableAnalytics) {
        const newInsights = navigation.getNavigationInsights();
        setInsights(newInsights);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [navigation]);

  const handleNavigate = (route) => {
    navigation.navigate(route, {
      metadata: { source: 'demo', timestamp: Date.now() }
    });
  };

  const handleGenerateShareableLink = () => {
    const link = navigation.generateShareableLink({
      includeState: true,
      includeMetadata: true,
      trackable: true,
      campaign: 'demo_share'
    });
    setShareableLink(link);
  };

  const handleGenerateMedicalLink = () => {
    const link = navigation.generateMedicalLink('patient', {
      patientId: '123'
    }, {
      includeMetadata: true,
      securityLevel: 'high'
    });
    setMedicalLink(link);
  };

  const handleBreadcrumbClick = (breadcrumb) => {
    navigation.navigate(breadcrumb.route, {
      metadata: { breadcrumbNavigation: true }
    });
  };

  const handleSharePage = async () => {
    const success = await navigation.shareCurrentPage({
      title: 'Medical App Demo',
      text: 'Check out this medical app navigation demo'
    });
    
    if (success) {
      alert('Page shared successfully!');
    } else {
      alert('Failed to share page');
    }
  };

  const handleCopyLink = async () => {
    const success = await navigation.copyCurrentPageLink();
    
    if (success) {
      alert('Link copied to clipboard!');
    } else {
      alert('Failed to copy link');
    }
  };

  return (
    <Container>
      <div className="py-8 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Navigation State Management Demo
          </h1>
          <p className="text-gray-600">
            Comprehensive navigation with state persistence, analytics, and deep linking
          </p>
        </div>

        {/* Current Navigation State */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Current Navigation State</h2>
          </CardHeader>
          <CardBody>
            <Grid cols={1} gap={4} className="md:grid-cols-2">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Route Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Current Route:</span> {navigation.currentRoute}</p>
                  <p><span className="font-medium">History Length:</span> {navigation.navigationHistory.length}</p>
                  <p><span className="font-medium">Can Go Back:</span> {navigation.canGoBack() ? 'Yes' : 'No'}</p>
                  <p><span className="font-medium">Active Tab:</span> {navigation.activeTab}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Features Enabled</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Analytics:</span> {navigation.enableAnalytics ? 'Enabled' : 'Disabled'}</p>
                  <p><span className="font-medium">Deep Linking:</span> {navigation.enableDeepLinking ? 'Enabled' : 'Disabled'}</p>
                  <p><span className="font-medium">Session ID:</span> {navigation.sessionData?.sessionId?.slice(-8)}</p>
                </div>
              </div>
            </Grid>
          </CardBody>
        </Card>

        {/* Navigation Controls */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Navigation Controls</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Basic Navigation</h3>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => handleNavigate('/')} size="sm">
                    Home
                  </Button>
                  <Button onClick={() => handleNavigate('/patients')} size="sm">
                    Patients
                  </Button>
                  <Button onClick={() => handleNavigate('/appointments')} size="sm">
                    Appointments
                  </Button>
                  <Button onClick={() => handleNavigate('/medications')} size="sm">
                    Medications
                  </Button>
                  <Button onClick={() => handleNavigate('/reports')} size="sm">
                    Reports
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-2">Navigation History</h3>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    onClick={navigation.goBack} 
                    disabled={!navigation.canGoBack()}
                    variant="secondary"
                    size="sm"
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={navigation.goForward} 
                    disabled={!navigation.canGoForward()}
                    variant="secondary"
                    size="sm"
                  >
                    Go Forward
                  </Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Breadcrumb Navigation */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Breadcrumb Navigation</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Standard Breadcrumb</h3>
              <Breadcrumb
                items={breadcrumbs}
                onItemClick={handleBreadcrumbClick}
              />
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Medical Breadcrumb</h3>
              <MedicalBreadcrumb
                items={breadcrumbs}
                onItemClick={handleBreadcrumbClick}
              />
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Current Breadcrumbs</h3>
              {navigation.breadcrumbs.length > 0 ? (
                <Breadcrumb
                  items={navigation.breadcrumbs}
                  onItemClick={(breadcrumb) => navigation.navigateToBreadcrumb(breadcrumb)}
                />
              ) : (
                <p className="text-gray-500 text-sm">No breadcrumbs available</p>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Deep Linking */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-semibold">Deep Linking & Sharing</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Generate Links</h3>
                <div className="space-y-2">
                  <Button onClick={handleGenerateShareableLink} size="sm" className="w-full">
                    Generate Shareable Link
                  </Button>
                  <Button onClick={handleGenerateMedicalLink} size="sm" className="w-full">
                    Generate Medical Link
                  </Button>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Share Current Page</h3>
                <div className="space-y-2">
                  <Button onClick={handleSharePage} size="sm" className="w-full">
                    Share Page
                  </Button>
                  <Button onClick={handleCopyLink} size="sm" className="w-full">
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>

            {shareableLink && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Generated Shareable Link</h3>
                <div className="p-3 bg-gray-100 rounded-lg">
                  <code className="text-sm break-all">{shareableLink}</code>
                </div>
              </div>
            )}

            {medicalLink && (
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Generated Medical Link</h3>
                <div className="p-3 bg-primary-50 rounded-lg">
                  <code className="text-sm break-all">{medicalLink}</code>
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Analytics Insights */}
        {insights && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">Navigation Analytics</h2>
            </CardHeader>
            <CardBody>
              <Grid cols={1} gap={6} className="md:grid-cols-2">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Session Metrics</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Page Views:</span> {insights.session.pageViews}</p>
                    <p><span className="font-medium">Session Duration:</span> {Math.round(insights.session.totalTimeSpent / 1000)}s</p>
                    <p><span className="font-medium">User Flow Length:</span> {insights.session.userFlow.length}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Performance Metrics</h3>
                  <div className="space-y-1 text-sm">
                    <p><span className="font-medium">Avg Time/Page:</span> {Math.round(insights.performanceMetrics.averageTimePerPage / 1000)}s</p>
                    <p><span className="font-medium">Navigation Efficiency:</span> {Math.round(insights.performanceMetrics.navigationEfficiency)}%</p>
                    <p><span className="font-medium">Pages/Session:</span> {insights.performanceMetrics.pagesPerSession}</p>
                  </div>
                </div>

                {insights.popularPages.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-900 mb-2">Popular Pages</h3>
                    <div className="space-y-1">
                      {insights.popularPages.slice(0, 5).map((page, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span>{page.route}</span>
                          <span className="text-gray-500">{page.visits} visits</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {insights.navigationPatterns.length > 0 && (
                  <div className="md:col-span-2">
                    <h3 className="font-medium text-gray-900 mb-2">Navigation Patterns</h3>
                    <div className="space-y-1">
                      {insights.navigationPatterns.slice(0, 3).map((pattern, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="font-mono">{pattern.pattern}</span>
                          <span className="text-gray-500">{pattern.count}x</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Grid>
            </CardBody>
          </Card>
        )}

        {/* User Journey */}
        {insights && insights.userJourney.length > 0 && (
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold">User Journey</h2>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                {insights.userJourney.slice(-10).map((step, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                    <div className="flex-shrink-0 w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <span className="font-medium">{step.route}</span>
                      <span className="text-gray-500 text-sm ml-2">({step.trigger})</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {Math.round(step.timeSpent / 1000)}s
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </Container>
  );
};

const NavigationStateTest = () => {
  return (
    <NavigationProvider
      initialRoute="/"
      persistNavigation={true}
      enableAnalytics={true}
      enableDeepLinking={true}
      analyticsConfig={{
        enableConsoleLogging: true,
        batchSize: 5,
        flushInterval: 10000
      }}
      deepLinkingConfig={{
        enableTracking: true,
        enableSharing: true
      }}
    >
      <NavigationStateDemo />
    </NavigationProvider>
  );
};

export default NavigationStateTest;
// Animation and Interaction System Test Component
// Comprehensive testing and demonstration of all animation features

import React, { useState, useEffect, useRef } from 'react';
import {
  MotionWrapper,
  AnimatedButton,
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  LoadingSpinner,
  LoadingDots,
  SkeletonLoader,
  HeartbeatAnimation,
  NotificationToast
} from '../animations/MotionComponents';
import {
  PageTransition,
  RouteTransition,
  ModalTransition,
  BottomSheetTransition,
  DrawerTransition,
  StaggeredListTransition,
  MedicalPageTransition
} from '../animations/PageTransitions';
import {
  SwipeGesture,
  PinchToZoom,
  LongPressGesture,
  PullToRefresh,
  Draggable,
  SwipeToDelete
} from '../gestures/GestureComponents';
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Container,
  Grid,
  Input
} from '../ui';
import { useAnimations, useInViewAnimation } from '../../hooks/useAnimations';
import { useHapticFeedback } from '../../hooks/useGestures';
import { 
  performanceMonitor, 
  AnimationPerformanceTester,
  detectReducedMotion,
  classifyDevicePerformance,
  calculateAnimationBudget
} from '../../utils/animationPerformance';

const AnimationSystemTest = () => {
  const [activeDemo, setActiveDemo] = useState('micro-interactions');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [performanceReport, setPerformanceReport] = useState(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [listItems, setListItems] = useState([
    { id: 1, title: 'Swipe me left to delete', content: 'This item can be deleted' },
    { id: 2, title: 'Another deletable item', content: 'Try swiping this one too' },
    { id: 3, title: 'Third item', content: 'This one is also swipeable' }
  ]);

  const { 
    animationsEnabled, 
    performanceLevel, 
    toggleAnimations,
    getAnimationConfig 
  } = useAnimations();
  
  const { triggerHaptic, isSupported: hapticSupported } = useHapticFeedback();
  const { ref: inViewRef, isInView, animationProps } = useInViewAnimation();

  // Performance monitoring
  const startPerformanceTest = () => {
    setIsMonitoring(true);
    performanceMonitor.startMonitoring();
    
    setTimeout(() => {
      const report = performanceMonitor.stopMonitoring();
      setPerformanceReport(report);
      setIsMonitoring(false);
    }, 5000);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
    triggerHaptic('success');
  };

  const handleDeleteItem = async (itemId) => {
    setListItems(prev => prev.filter(item => item.id !== itemId));
    triggerHaptic('medium');
  };

  const handleLongPress = () => {
    triggerHaptic('heavy');
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const renderMicroInteractionsDemo = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Motion Components</h3>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Animation Variants */}
          <div>
            <h4 className="font-medium mb-4">Animation Variants</h4>
            <Grid cols={2} gap={4} className="md:grid-cols-4">
              <MotionWrapper variant="fadeIn" delay={0}>
                <div className="p-4 bg-primary-50 rounded-lg text-center">
                  <span className="text-sm font-medium">Fade In</span>
                </div>
              </MotionWrapper>
              <MotionWrapper variant="fadeInUp" delay={0.1}>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <span className="text-sm font-medium">Fade In Up</span>
                </div>
              </MotionWrapper>
              <MotionWrapper variant="scaleIn" delay={0.2}>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <span className="text-sm font-medium">Scale In</span>
                </div>
              </MotionWrapper>
              <MotionWrapper variant="slideInLeft" delay={0.3}>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <span className="text-sm font-medium">Slide In Left</span>
                </div>
              </MotionWrapper>
            </Grid>
          </div>

          {/* Interactive Buttons */}
          <div>
            <h4 className="font-medium mb-4">Interactive Buttons</h4>
            <div className="flex flex-wrap gap-4">
              <AnimatedButton 
                variant="buttonTap"
                className="px-4 py-2 bg-primary-500 text-white rounded-lg"
                onClick={() => triggerHaptic('light')}
              >
                Tap Animation
              </AnimatedButton>
              <AnimatedButton 
                variant="buttonPress"
                className="px-4 py-2 bg-green-500 text-white rounded-lg"
                onClick={() => triggerHaptic('medium')}
              >
                Press Animation
              </AnimatedButton>
            </div>
          </div>

          {/* Animated Cards */}
          <div>
            <h4 className="font-medium mb-4">Animated Cards</h4>
            <Grid cols={1} gap={4} className="md:grid-cols-2">
              <AnimatedCard 
                variant="cardHover"
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <h5 className="font-medium mb-2">Hover Card</h5>
                <p className="text-sm text-gray-600">Hover over this card to see the animation</p>
              </AnimatedCard>
              <AnimatedCard 
                variant="cardFloat"
                className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
              >
                <h5 className="font-medium mb-2">Float Card</h5>
                <p className="text-sm text-gray-600">This card has a floating animation</p>
              </AnimatedCard>
            </Grid>
          </div>

          {/* Loading Animations */}
          <div>
            <h4 className="font-medium mb-4">Loading Animations</h4>
            <div className="flex items-center space-x-8">
              <div className="text-center">
                <LoadingSpinner size="md" color="primary" />
                <p className="text-sm mt-2">Spinner</p>
              </div>
              <div className="text-center">
                <LoadingDots size="md" color="primary" />
                <p className="text-sm mt-2">Dots</p>
              </div>
              <div className="text-center">
                <HeartbeatAnimation active={true}>
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                  </div>
                </HeartbeatAnimation>
                <p className="text-sm mt-2">Heartbeat</p>
              </div>
            </div>
          </div>

          {/* Skeleton Loader */}
          <div>
            <h4 className="font-medium mb-4">Skeleton Loader</h4>
            <SkeletonLoader lines={3} avatar={true} />
          </div>
        </CardBody>
      </Card>

      {/* Staggered Animations */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Staggered Animations</h3>
        </CardHeader>
        <CardBody>
          <StaggerContainer variant="staggerChildren">
            {[1, 2, 3, 4, 5].map((item) => (
              <StaggerItem key={item} variant="fadeInUp">
                <div className="p-4 bg-gray-50 rounded-lg mb-2">
                  <span className="font-medium">Staggered Item {item}</span>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </CardBody>
      </Card>

      {/* In-View Animation */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Scroll-Triggered Animation</h3>
        </CardHeader>
        <CardBody>
          <div className="h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
            <div className="h-64 bg-gray-100 rounded-lg mb-8 flex items-center justify-center">
              <span className="text-gray-500">Scroll down to see animation</span>
            </div>
            <div ref={inViewRef} {...animationProps} className="p-6 bg-primary-50 rounded-lg">
              <h4 className="font-medium mb-2">Animated on Scroll</h4>
              <p className="text-sm text-gray-600">
                This element animates when it comes into view. Status: {isInView ? 'In View' : 'Out of View'}
              </p>
            </div>
            <div className="h-64 bg-gray-100 rounded-lg mt-8"></div>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPageTransitionsDemo = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Modal Transitions</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => setIsModalOpen(true)}>
              Open Modal
            </Button>
            <Button onClick={() => setIsBottomSheetOpen(true)}>
              Open Bottom Sheet
            </Button>
            <Button onClick={() => setIsDrawerOpen(true)}>
              Open Drawer
            </Button>
          </div>

          <ModalTransition
            isOpen={isModalOpen}
            onBackdropClick={() => setIsModalOpen(false)}
          >
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold mb-4">Modal Dialog</h3>
              <p className="text-gray-600 mb-4">
                This is a modal with smooth transition animations.
              </p>
              <Button onClick={() => setIsModalOpen(false)}>
                Close Modal
              </Button>
            </div>
          </ModalTransition>

          <BottomSheetTransition
            isOpen={isBottomSheetOpen}
            onBackdropClick={() => setIsBottomSheetOpen(false)}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Bottom Sheet</h3>
              <p className="text-gray-600 mb-4">
                This bottom sheet slides up from the bottom with smooth animations.
              </p>
              <Button onClick={() => setIsBottomSheetOpen(false)}>
                Close Bottom Sheet
              </Button>
            </div>
          </BottomSheetTransition>

          <DrawerTransition
            isOpen={isDrawerOpen}
            position="left"
            onBackdropClick={() => setIsDrawerOpen(false)}
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">Drawer</h3>
              <p className="text-gray-600 mb-4">
                This drawer slides in from the left side.
              </p>
              <Button onClick={() => setIsDrawerOpen(false)}>
                Close Drawer
              </Button>
            </div>
          </DrawerTransition>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Medical Page Transitions</h3>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-2 gap-4">
            {['patient-flow', 'appointment', 'emergency', 'report'].map((type) => (
              <MedicalPageTransition key={type} transitionType={type}>
                <div className="p-4 bg-primary-50 rounded-lg text-center">
                  <span className="text-sm font-medium capitalize">{type.replace('-', ' ')}</span>
                </div>
              </MedicalPageTransition>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Staggered List Transition</h3>
        </CardHeader>
        <CardBody>
          <StaggeredListTransition variant="fadeInUp">
            {[1, 2, 3, 4, 5].map((item) => (
              <div key={item} className="p-3 bg-gray-50 rounded-lg mb-2">
                List Item {item}
              </div>
            ))}
          </StaggeredListTransition>
        </CardBody>
      </Card>
    </div>
  );

  const renderGesturesDemo = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Swipe Gestures</h3>
        </CardHeader>
        <CardBody>
          <SwipeGesture
            onSwipeLeft={() => {
              triggerHaptic('light');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
            }}
            onSwipeRight={() => {
              triggerHaptic('light');
              setShowToast(true);
              setTimeout(() => setShowToast(false), 2000);
            }}
            className="p-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-dashed border-gray-300 text-center"
          >
            <p className="text-lg font-medium mb-2">Swipe Me!</p>
            <p className="text-sm text-gray-600">
              Swipe left or right to trigger haptic feedback and toast notification
            </p>
          </SwipeGesture>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Long Press Gesture</h3>
        </CardHeader>
        <CardBody>
          <LongPressGesture
            onLongPress={handleLongPress}
            duration={1000}
            showFeedback={true}
            className="p-8 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-dashed border-gray-300 text-center cursor-pointer"
          >
            <p className="text-lg font-medium mb-2">Long Press Me!</p>
            <p className="text-sm text-gray-600">
              Hold for 1 second to trigger the action
            </p>
          </LongPressGesture>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pinch to Zoom</h3>
        </CardHeader>
        <CardBody>
          <PinchToZoom
            minScale={0.5}
            maxScale={3}
            className="h-64 bg-gray-100 rounded-lg overflow-hidden"
          >
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white">
              <div className="text-center">
                <p className="text-xl font-bold mb-2">Pinch to Zoom</p>
                <p className="text-sm">Use two fingers to zoom in/out</p>
                <p className="text-sm">Double-click to reset</p>
              </div>
            </div>
          </PinchToZoom>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Pull to Refresh</h3>
        </CardHeader>
        <CardBody>
          <PullToRefresh
            onRefresh={handleRefresh}
            refreshing={refreshing}
            className="h-64 bg-gray-50 rounded-lg"
          >
            <div className="p-4">
              <p className="text-center text-gray-600 mb-4">
                Pull down to refresh this content
              </p>
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="p-3 bg-white rounded-lg shadow-sm">
                    Content Item {item}
                  </div>
                ))}
              </div>
            </div>
          </PullToRefresh>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Swipe to Delete</h3>
        </CardHeader>
        <CardBody>
          <div className="space-y-2">
            {listItems.map((item) => (
              <SwipeToDelete
                key={item.id}
                onDelete={() => handleDeleteItem(item.id)}
                className="bg-white rounded-lg shadow-sm"
              >
                <div className="p-4">
                  <h4 className="font-medium">{item.title}</h4>
                  <p className="text-sm text-gray-600">{item.content}</p>
                </div>
              </SwipeToDelete>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Draggable Element</h3>
        </CardHeader>
        <CardBody>
          <div className="h-64 bg-gray-50 rounded-lg relative overflow-hidden">
            <Draggable
              constraints={{ left: 0, right: 200, top: 0, bottom: 200 }}
              snapBack={false}
              className="absolute w-16 h-16 bg-primary-500 rounded-lg flex items-center justify-center text-white font-bold cursor-move"
            >
              Drag
            </Draggable>
          </div>
        </CardBody>
      </Card>
    </div>
  );

  const renderPerformanceDemo = () => (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Performance Monitoring</h3>
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium mb-2">Animation Settings</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Animations Enabled:</span>
                  <span className="text-sm font-medium">{animationsEnabled ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Performance Level:</span>
                  <span className="text-sm font-medium capitalize">{performanceLevel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Reduced Motion:</span>
                  <span className="text-sm font-medium">{detectReducedMotion() ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Haptic Support:</span>
                  <span className="text-sm font-medium">{hapticSupported ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Device Performance</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Classification:</span>
                  <span className="text-sm font-medium capitalize">{classifyDevicePerformance()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">CPU Cores:</span>
                  <span className="text-sm font-medium">{navigator.hardwareConcurrency || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Device Memory:</span>
                  <span className="text-sm font-medium">{navigator.deviceMemory || 'Unknown'} GB</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={toggleAnimations}
              variant={animationsEnabled ? 'primary' : 'secondary'}
            >
              {animationsEnabled ? 'Disable' : 'Enable'} Animations
            </Button>
            <Button 
              onClick={startPerformanceTest}
              disabled={isMonitoring}
            >
              {isMonitoring ? 'Monitoring...' : 'Start Performance Test'}
            </Button>
          </div>

          {performanceReport && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-3">Performance Report</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Average FPS:</span>
                  <div className="font-medium">{performanceReport.averageFPS.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Min FPS:</span>
                  <div className="font-medium">{performanceReport.minFPS.toFixed(1)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Frame Drops:</span>
                  <div className="font-medium">{performanceReport.frameDrops}</div>
                </div>
                <div>
                  <span className="text-gray-600">Performance:</span>
                  <div className={`font-medium capitalize ${
                    performanceReport.performanceLevel === 'excellent' ? 'text-green-600' :
                    performanceReport.performanceLevel === 'good' ? 'text-blue-600' :
                    performanceReport.performanceLevel === 'poor' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {performanceReport.performanceLevel}
                  </div>
                </div>
              </div>

              {performanceReport.recommendations.length > 0 && (
                <div className="mt-4">
                  <h5 className="font-medium mb-2">Recommendations:</h5>
                  <ul className="space-y-1 text-sm">
                    {performanceReport.recommendations.map((rec, index) => (
                      <li key={index} className="text-gray-600">
                        • {rec.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">Animation Budget</h3>
        </CardHeader>
        <CardBody>
          {(() => {
            const budget = calculateAnimationBudget(classifyDevicePerformance());
            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Max Simultaneous Animations:</span>
                    <span className="font-medium">{budget.maxSimultaneousAnimations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Max Animation Duration:</span>
                    <span className="font-medium">{budget.maxAnimationDuration}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target FPS:</span>
                    <span className="font-medium">{budget.targetFPS}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Complex Easing:</span>
                    <span className="font-medium">{budget.allowComplexEasing ? 'Allowed' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>3D Transforms:</span>
                    <span className="font-medium">{budget.allowTransforms3D ? 'Allowed' : 'Disabled'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Filters:</span>
                    <span className="font-medium">{budget.allowFilters ? 'Allowed' : 'Disabled'}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </CardBody>
      </Card>
    </div>
  );

  const renderDemo = () => {
    switch (activeDemo) {
      case 'micro-interactions':
        return renderMicroInteractionsDemo();
      case 'page-transitions':
        return renderPageTransitionsDemo();
      case 'gestures':
        return renderGesturesDemo();
      case 'performance':
        return renderPerformanceDemo();
      default:
        return renderMicroInteractionsDemo();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold text-gray-900">
              Animation & Interaction System Demo
            </h1>
            <div className="flex space-x-2">
              <Button
                variant={activeDemo === 'micro-interactions' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('micro-interactions')}
              >
                Micro-Interactions
              </Button>
              <Button
                variant={activeDemo === 'page-transitions' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('page-transitions')}
              >
                Page Transitions
              </Button>
              <Button
                variant={activeDemo === 'gestures' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('gestures')}
              >
                Gestures
              </Button>
              <Button
                variant={activeDemo === 'performance' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('performance')}
              >
                Performance
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Demo Content */}
      <Container>
        <div className="py-8">
          {renderDemo()}
        </div>
      </Container>

      {/* Toast Notification */}
      <NotificationToast
        isVisible={showToast}
        position="top-right"
        className="bg-white border border-gray-200 rounded-lg shadow-lg p-4"
      >
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm font-medium">Gesture detected!</span>
        </div>
      </NotificationToast>
    </div>
  );
};

export default AnimationSystemTest;
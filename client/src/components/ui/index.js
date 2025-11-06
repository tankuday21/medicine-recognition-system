// UI Components Index
// Exports all premium UI components for easy importing

// Button Components
export { default as Button } from './Button';
export { default as IconButton } from './IconButton';
export { default as ButtonGroup } from './ButtonGroup';
export { default as FloatingActionButton, SpeedDialFAB } from './FloatingActionButton';
export {
  EmergencyButton,
  ScanButton,
  HealthStatusButton,
  MedicationButton,
  ReportUploadButton,
  AIChatButton
} from './MedicalButtons';

// Card Components
export {
  default as Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  CardDescription,
  CardImage,
  CardBadge,
  CardActions
} from './Card';

// Badge Component
export { default as Badge } from './Badge';

// Medical Card Components
export {
  HealthMetricCard,
  MedicationCard,
  AppointmentCard,
  ReportCard
} from './MedicalCards';

// Layout Components
export {
  Container,
  Grid,
  Stack,
  Flex,
  Section,
  CardGrid,
  MasonryGrid,
  StickyContainer,
  Divider
} from './Layout';

// Navigation Components
export {
  default as BottomNavigation,
  BottomNavTab,
  MedicalBottomNavigation
} from './BottomNavigation';
export {
  default as TabBar,
  Tab,
  MedicalTabBar,
  SegmentedControl
} from './TabBar';
export {
  default as DrawerNavigation,
  DrawerNavItem,
  DrawerHeader,
  DrawerFooter,
  MedicalDrawerNavigation
} from './DrawerNavigation';
export {
  default as HamburgerMenu,
  HamburgerIcon,
  FloatingHamburgerMenu,
  MedicalHamburgerMenu,
  HamburgerMenuWithBreadcrumb
} from './HamburgerMenu';
export {
  default as NavigationSystem,
  NavigationHeader,
  MedicalNavigationSystem,
  NavigationContent
} from './NavigationSystem';
export {
  default as Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  MedicalBreadcrumb,
  ResponsiveBreadcrumb,
  BreadcrumbWithDropdown
} from './Breadcrumb';

// Form Components
export { default as Input } from './Input';
export { default as Textarea } from './Textarea';
export { default as Select } from './Select';
export { default as Checkbox } from './Checkbox';
export { default as Radio, RadioGroup } from './Radio';
export { default as Progress } from './Progress';

// Medical Form Components
export {
  BloodPressureInput,
  MedicationDosageInput,
  SymptomSeverityScale,
  MedicalHistoryForm
} from './MedicalForms';

// Animation Components
export {
  default as MotionWrapper,
  AnimatedButton,
  AnimatedCard,
  StaggerContainer,
  StaggerItem,
  LoadingSpinner,
  LoadingDots,
  SkeletonLoader,
  HeartbeatAnimation,
  NotificationToast,
  animationVariants
} from '../animations/MotionComponents';

export {
  default as PageTransition,
  RouteTransition,
  ModalTransition,
  BottomSheetTransition,
  DrawerTransition,
  StaggeredListTransition,
  MedicalPageTransition,
  BreadcrumbTransition,
  pageTransitionVariants
} from '../animations/PageTransitions';

// Gesture Components
export {
  default as SwipeGesture,
  PinchToZoom,
  LongPressGesture,
  Draggable,
  SwipeToDelete
} from '../gestures/GestureComponents';

// Layout Components
export {
  default as ResponsiveGrid,
  ResponsiveContainer,
  FlexibleLayout,
  AdaptiveLayout,
  MasonryLayout,
  SidebarLayout,
  StackLayout,
  InlineLayout,
  MedicalDashboardLayout,
  PatientRecordLayout,
  useResponsiveClasses
} from '../Layout/ResponsiveLayout';

// Modal Components
export {
  default as Modal,
  ModalBackdrop,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ConfirmationModal,
  MedicalModal
} from './Modal';

// Bottom Sheet Components
export {
  default as BottomSheet,
  BottomSheetHandle,
  BottomSheetHeader,
  BottomSheetContent,
  BottomSheetFooter,
  ActionSheet,
  MedicalBottomSheet,
  PickerBottomSheet
} from './BottomSheet';

// Mobile Pattern Components
export {
  PullToRefresh,
  InfiniteScroll,
  VirtualList,
  MobileDataTable,
  StickyHeader
} from './MobilePatterns';

// Performance Components
export { default as OptimizedImage } from '../performance/PerformanceComponents';
export {
  VirtualScrollList,
  MemoizedListItem,
  DebouncedInput,
  LazyLoadContainer,
  OptimizedDataTable,
  SkeletonLoading,
  OptimizedModal,
  CodeSplitWrapper,
  PerformanceMonitor
} from '../performance/PerformanceComponents';

export {
  MemoizationProvider,
  OptimizedSearch,
  MemoizedDataGrid,
  OptimizedForm,
  MemoizedFormField,
  OptimizedList,
  useMemoization,
  useFormContext
} from '../performance/RuntimeOptimizations';

// Offline Components
export {
  OfflineStatusBanner,
  ConnectionQualityIndicator,
  OfflineModeToggle,
  SyncStatusIndicator,
  GracefulDegradation
} from '../offline/OfflineIndicator';

// Accessibility Components
export {
  AccessibleButton,
  AccessibleInput,
  AccessibleModal,
  AccessibleDropdown,
  AccessibleTabs,
  AccessibleAlert
} from '../accessibility/AccessibleComponents';

export {
  SkipLinks,
  LandmarkNavigation,
  MainContent,
  NavigationWrapper,
  HeaderWrapper,
  FooterWrapper,
  SidebarWrapper,
  SearchWrapper,
  BreadcrumbNavigation,
  PageTitle,
  FocusIndicator
} from '../accessibility/SkipNavigation';

export {
  AccessibilitySettingsPanel,
  AccessibilityToolbar,
  StatusIndicator,
  ContrastChecker
} from '../accessibility/VisualAccessibility';

export {
  TouchTargetButton,
  AlternativeInputGesture,
  TimeoutWarning,
  StepByStepGuide,
  ConfirmationDialog,
  MotorAccessibilitySettings
} from '../accessibility/MotorCognitiveAccessibility';

// Smart Interface Components
export {
  SmartHelpSystem,
  AdaptiveContainer,
  SmartForm,
  RecommendationPanel,
  InterfaceDensityControl,
  PersonalizationSettings
} from '../smart/SmartInterface';

export {
  DashboardWidget,
  QuickActionsWidget,
  RecentActivityWidget,
  HealthMetricsWidget,
  ShortcutsWidget,
  PersonalizedDashboard
} from '../smart/PersonalizedDashboard';

// Page Layout Components
export {
  default as PageWrapper,
  PageHeader,
  PageSection,
  TabNavigation,
  EmptyState,
  SignInRequired
} from './PageWrapper';

// Test Components
export { default as RuntimePerformanceTest } from '../test/RuntimePerformanceTest';
export { default as OfflineTest } from '../test/OfflineTest';
export { default as AccessibilityTest } from '../test/AccessibilityTest';
export { default as VisualAccessibilityTest } from '../test/VisualAccessibilityTest';
export { default as MotorCognitiveTest } from '../test/MotorCognitiveTest';
export { default as SmartInterfaceTest } from '../test/SmartInterfaceTest';

// Re-export design system utilities for convenience
// Note: Wildcard exports commented out to avoid duplicate export conflicts
// Import these directly from their source files if needed:
// - ../../utils/design-system
// - ../../hooks/useDesignSystem
// - ../../hooks/useAnimations
// - ../../hooks/useGestures
// - ../../hooks/usePerformance
// - ../../hooks/useOfflineData
// - ../../hooks/useAccessibility
// - ../../hooks/useVisualAccessibility
// - ../../hooks/useMotorAccessibility
// - ../../hooks/useSmartInterface
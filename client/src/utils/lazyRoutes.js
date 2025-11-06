import { lazy } from 'react';
import LazyComponent from '../components/Optimized/LazyComponent';
import { SkeletonDashboard, SkeletonCard, SkeletonNews } from '../components/Optimized/SkeletonLoader';

// Lazy load page components with appropriate fallbacks
export const LazyHome = lazy(() => 
  import('../pages/Home').then(module => ({ default: module.default }))
);

export const LazyDashboard = lazy(() => 
  import('../pages/Dashboard').then(module => ({ default: module.default }))
);

export const LazyScanner = lazy(() => 
  import('../pages/Scanner').then(module => ({ default: module.default }))
);

export const LazyChat = lazy(() => 
  import('../pages/Chat').then(module => ({ default: module.default }))
);

export const LazyReminders = lazy(() => 
  import('../pages/Reminders').then(module => ({ default: module.default }))
);

export const LazyReports = lazy(() => 
  import('../pages/Reports').then(module => ({ default: module.default }))
);

export const LazySymptoms = lazy(() => 
  import('../pages/Symptoms').then(module => ({ default: module.default }))
);

export const LazySOS = lazy(() => 
  import('../pages/SOS').then(module => ({ default: module.default }))
);

export const LazyPriceLookup = lazy(() => 
  import('../pages/PriceLookup').then(module => ({ default: module.default }))
);

export const LazyNews = lazy(() => 
  import('../pages/News').then(module => ({ default: module.default }))
);

export const LazyProfile = lazy(() => 
  import('../pages/Profile').then(module => ({ default: module.default }))
);

export const LazyLogin = lazy(() => 
  import('../pages/Login').then(module => ({ default: module.default }))
);

export const LazyRegister = lazy(() => 
  import('../pages/Register').then(module => ({ default: module.default }))
);

// Wrapper components with appropriate fallbacks
export const HomeWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-64" />}>
    <LazyHome {...props} />
  </LazyComponent>
);

export const DashboardWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonDashboard />}>
    <LazyDashboard {...props} />
  </LazyComponent>
);

export const ScannerWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-96" />}>
    <LazyScanner {...props} />
  </LazyComponent>
);

export const ChatWithFallback = (props) => (
  <LazyComponent fallback={
    <div className="space-y-4">
      <SkeletonCard lines={2} />
      <SkeletonCard lines={1} />
      <SkeletonCard lines={3} />
    </div>
  }>
    <LazyChat {...props} />
  </LazyComponent>
);

export const RemindersWithFallback = (props) => (
  <LazyComponent fallback={
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonCard key={i} showImage={false} lines={2} />
      ))}
    </div>
  }>
    <LazyReminders {...props} />
  </LazyComponent>
);

export const ReportsWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-80" />}>
    <LazyReports {...props} />
  </LazyComponent>
);

export const SymptomsWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-96" />}>
    <LazySymptoms {...props} />
  </LazyComponent>
);

export const SOSWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-64" />}>
    <LazySOS {...props} />
  </LazyComponent>
);

export const PriceLookupWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-80" />}>
    <LazyPriceLookup {...props} />
  </LazyComponent>
);

export const NewsWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonNews />}>
    <LazyNews {...props} />
  </LazyComponent>
);

export const ProfileWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-96" />}>
    <LazyProfile {...props} />
  </LazyComponent>
);

export const LoginWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-80" />}>
    <LazyLogin {...props} />
  </LazyComponent>
);

export const RegisterWithFallback = (props) => (
  <LazyComponent fallback={<SkeletonCard className="h-96" />}>
    <LazyRegister {...props} />
  </LazyComponent>
);

// Route configuration with lazy loading
export const lazyRoutes = [
  {
    path: '/',
    component: HomeWithFallback,
    preload: true // Preload this route
  },
  {
    path: '/dashboard',
    component: DashboardWithFallback,
    protected: true
  },
  {
    path: '/scanner',
    component: ScannerWithFallback
  },
  {
    path: '/chat',
    component: ChatWithFallback
  },
  {
    path: '/reminders',
    component: RemindersWithFallback,
    protected: true
  },
  {
    path: '/reports',
    component: ReportsWithFallback,
    protected: true
  },
  {
    path: '/symptoms',
    component: SymptomsWithFallback
  },
  {
    path: '/sos',
    component: SOSWithFallback
  },
  {
    path: '/price-lookup',
    component: PriceLookupWithFallback
  },
  {
    path: '/news',
    component: NewsWithFallback
  },
  {
    path: '/profile',
    component: ProfileWithFallback,
    protected: true
  },
  {
    path: '/login',
    component: LoginWithFallback
  },
  {
    path: '/register',
    component: RegisterWithFallback
  }
];

// Preload critical routes
export const preloadCriticalRoutes = () => {
  const criticalRoutes = lazyRoutes.filter(route => route.preload);
  
  criticalRoutes.forEach(route => {
    try {
      // Safely preload the component by accessing the lazy component
      const LazyComponent = route.component.type;
      if (LazyComponent && typeof LazyComponent._payload === 'object' && LazyComponent._payload._fn) {
        LazyComponent._payload._fn();
      }
    } catch (error) {
      console.warn('Failed to preload route:', route.path, error);
    }
  });
};

// Preload route on hover/focus
export const preloadRoute = (routePath) => {
  try {
    const route = lazyRoutes.find(r => r.path === routePath);
    if (route) {
      const LazyComponent = route.component.type;
      if (LazyComponent && typeof LazyComponent._payload === 'object' && LazyComponent._payload._fn) {
        LazyComponent._payload._fn();
      }
    }
  } catch (error) {
    console.warn('Failed to preload route:', routePath, error);
  }
};
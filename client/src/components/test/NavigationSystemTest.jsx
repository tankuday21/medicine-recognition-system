// Navigation System Test Component
// Demonstrates all navigation components and their interactions

import React, { useState } from 'react';
import {
  NavigationSystem,
  MedicalNavigationSystem,
  NavigationContent,
  HamburgerMenu,
  MedicalHamburgerMenu,
  FloatingHamburgerMenu,
  DrawerNavigation,
  MedicalDrawerNavigation,
  Card,
  CardHeader,
  CardBody,
  Button,
  Container,
  Grid
} from '../ui';

const NavigationSystemTest = () => {
  const [activeDemo, setActiveDemo] = useState('medical-system');
  const [activeNavItem, setActiveNavItem] = useState('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Sample user info
  const userInfo = {
    name: 'Dr. Sarah Johnson',
    role: 'Cardiologist',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face'
  };

  const handleNavItemClick = (itemId, item) => {
    setActiveNavItem(itemId);
    console.log('Navigation item clicked:', itemId, item);
  };

  const handleDrawerToggle = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const renderDemo = () => {
    switch (activeDemo) {
      case 'medical-system':
        return (
          <MedicalNavigationSystem
            title="MedIoT Healthcare"
            subtitle="Patient Management System"
            userInfo={userInfo}
            activeItem={activeNavItem}
            onItemClick={handleNavItemClick}
            showNotifications={true}
            notificationCount={5}
          >
            <NavigationContent padding="default" maxWidth="lg" centered>
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Medical Navigation System Demo
                  </h2>
                  <p className="text-gray-600">
                    Complete navigation system with hamburger menu and drawer navigation
                  </p>
                </div>

                <Grid cols={1} gap={6} className="md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Active Navigation Item</h3>
                    </CardHeader>
                    <CardBody>
                      <p className="text-gray-600">
                        Currently selected: <span className="font-medium text-primary-600">{activeNavItem}</span>
                      </p>
                    </CardBody>
                  </Card>

                  <Card>
                    <CardHeader>
                      <h3 className="text-lg font-semibold">Features</h3>
                    </CardHeader>
                    <CardBody>
                      <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Responsive hamburger menu</li>
                        <li>• Slide-out drawer navigation</li>
                        <li>• Medical-themed styling</li>
                        <li>• Touch gesture support</li>
                        <li>• Keyboard shortcuts (Ctrl+B)</li>
                        <li>• Notification badges</li>
                      </ul>
                    </CardBody>
                  </Card>
                </Grid>

                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Sample Content</h3>
                  </CardHeader>
                  <CardBody>
                    <p className="text-gray-600 mb-4">
                      This is the main content area. The navigation system provides:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-primary-50 p-4 rounded-lg">
                        <h4 className="font-medium text-primary-900 mb-2">Header Navigation</h4>
                        <p className="text-sm text-primary-700">
                          Sticky header with hamburger menu, title, and action buttons
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h4 className="font-medium text-green-900 mb-2">Drawer Navigation</h4>
                        <p className="text-sm text-green-700">
                          Slide-out drawer with hierarchical menu structure
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-900 mb-2">Responsive Design</h4>
                        <p className="text-sm text-blue-700">
                          Adapts to different screen sizes and device capabilities
                        </p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </NavigationContent>
          </MedicalNavigationSystem>
        );

      case 'hamburger-menu':
        return (
          <Container>
            <div className="py-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Hamburger Menu Components
                </h2>
                <p className="text-gray-600">
                  Various hamburger menu styles and configurations
                </p>
              </div>

              <Grid cols={1} gap={6} className="md:grid-cols-2 lg:grid-cols-3">
                {/* Default Hamburger Menu */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Default Style</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <HamburgerMenu
                      isOpen={false}
                      onClick={() => console.log('Default hamburger clicked')}
                      variant="default"
                      size="md"
                    />
                    <HamburgerMenu
                      isOpen={true}
                      onClick={() => console.log('Default hamburger clicked')}
                      variant="default"
                      size="md"
                    />
                  </CardBody>
                </Card>

                {/* Medical Hamburger Menu */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Medical Style</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <MedicalHamburgerMenu
                      isOpen={false}
                      onClick={() => console.log('Medical hamburger clicked')}
                      showNotification={true}
                      notificationCount={3}
                    />
                    <MedicalHamburgerMenu
                      isOpen={true}
                      onClick={() => console.log('Medical hamburger clicked')}
                      showNotification={true}
                      notificationCount={12}
                    />
                  </CardBody>
                </Card>

                {/* Floating Hamburger Menu */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Floating Style</h3>
                  </CardHeader>
                  <CardBody className="relative h-32">
                    <FloatingHamburgerMenu
                      isOpen={false}
                      onClick={() => console.log('Floating hamburger clicked')}
                      position="top-left"
                      className="relative top-0 left-0"
                    />
                  </CardBody>
                </Card>

                {/* Different Sizes */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Different Sizes</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <HamburgerMenu size="sm" variant="primary" />
                      <HamburgerMenu size="md" variant="primary" />
                      <HamburgerMenu size="lg" variant="primary" />
                    </div>
                  </CardBody>
                </Card>

                {/* Different Variants */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">Different Variants</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <HamburgerMenu variant="default" size="sm" />
                      <HamburgerMenu variant="primary" size="sm" />
                      <HamburgerMenu variant="secondary" size="sm" />
                      <HamburgerMenu variant="ghost" size="sm" />
                    </div>
                  </CardBody>
                </Card>

                {/* With Labels */}
                <Card>
                  <CardHeader>
                    <h3 className="text-lg font-semibold">With Labels</h3>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <HamburgerMenu
                      showLabel={true}
                      label="Menu"
                      variant="primary"
                      size="md"
                    />
                    <HamburgerMenu
                      isOpen={true}
                      showLabel={true}
                      label="Menu"
                      variant="secondary"
                      size="md"
                    />
                  </CardBody>
                </Card>
              </Grid>
            </div>
          </Container>
        );

      case 'drawer-navigation':
        return (
          <Container>
            <div className="py-8 space-y-8">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Drawer Navigation Demo
                </h2>
                <p className="text-gray-600">
                  Slide-out navigation drawer with medical theming
                </p>
              </div>

              <div className="flex justify-center space-x-4">
                <Button
                  onClick={handleDrawerToggle}
                  variant="primary"
                >
                  {isDrawerOpen ? 'Close' : 'Open'} Medical Drawer
                </Button>
              </div>

              <MedicalDrawerNavigation
                isOpen={isDrawerOpen}
                onClose={handleDrawerClose}
                activeItem={activeNavItem}
                onItemClick={handleNavItemClick}
                userInfo={userInfo}
                showBadges={true}
              />

              <Card>
                <CardHeader>
                  <h3 className="text-lg font-semibold">Drawer Features</h3>
                </CardHeader>
                <CardBody>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Navigation Features</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Hierarchical menu structure</li>
                        <li>• Active state indicators</li>
                        <li>• Badge notifications</li>
                        <li>• Smooth animations</li>
                        <li>• Touch gesture support</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">Interaction Features</h4>
                      <ul className="space-y-1 text-sm text-gray-600">
                        <li>• Click outside to close</li>
                        <li>• Escape key to close</li>
                        <li>• Swipe gestures</li>
                        <li>• Keyboard navigation</li>
                        <li>• Focus management</li>
                      </ul>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </Container>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Demo Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <Container>
          <div className="flex items-center justify-between py-4">
            <h1 className="text-xl font-bold text-gray-900">
              Navigation System Demo
            </h1>
            <div className="flex space-x-2">
              <Button
                variant={activeDemo === 'medical-system' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('medical-system')}
              >
                Medical System
              </Button>
              <Button
                variant={activeDemo === 'hamburger-menu' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('hamburger-menu')}
              >
                Hamburger Menu
              </Button>
              <Button
                variant={activeDemo === 'drawer-navigation' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setActiveDemo('drawer-navigation')}
              >
                Drawer Navigation
              </Button>
            </div>
          </div>
        </Container>
      </div>

      {/* Demo Content */}
      {renderDemo()}
    </div>
  );
};

export default NavigationSystemTest;
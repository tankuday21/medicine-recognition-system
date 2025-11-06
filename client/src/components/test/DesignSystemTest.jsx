// Design System Test Component
// Simple component to test our premium design system implementation

import React, { useState } from 'react';
import { 
  Button, 
  IconButton, 
  ButtonGroup,
  EmergencyButton,
  ScanButton,
  HealthStatusButton,
  MedicationButton,
  ReportUploadButton,
  AIChatButton,
  FloatingActionButton,
  Container,
  Grid,
  Stack,
  Flex,
  Section,
  CardGrid,
  Divider,
  HealthMetricCard,
  MedicationCard,
  AppointmentCard,
  ReportCard,
  Input,
  Textarea,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  BloodPressureInput,
  MedicationDosageInput,
  SymptomSeverityScale,
  MedicalHistoryForm,
  BottomNavigation,
  BottomNavTab,
  MedicalBottomNavigation,
  TabBar,
  Tab,
  MedicalTabBar,
  SegmentedControl
} from '../ui';
import Card, { 
  CardHeader, 
  CardBody, 
  CardTitle, 
  CardDescription, 
  CardImage, 
  CardBadge, 
  CardActions 
} from '../ui/Card';

const DesignSystemTest = () => {
  // Form state for testing
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    country: '',
    newsletter: false,
    gender: '',
    systolic: '',
    diastolic: '',
    dosageAmount: '',
    dosageUnit: 'mg',
    severity: 0,
    conditions: [],
    allergies: [],
    medications: '',
    activeBottomTab: 'home',
    activeTabBarTab: 'overview',
    segmentedValue: 'option1'
  });

  const countryOptions = [
    { value: 'us', label: 'United States' },
    { value: 'uk', label: 'United Kingdom' },
    { value: 'ca', label: 'Canada' },
    { value: 'au', label: 'Australia' },
    { value: 'de', label: 'Germany' },
    { value: 'fr', label: 'France' },
    { value: 'in', label: 'India' }
  ];

  return (
    <div className="min-h-screen bg-secondary-50 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-secondary-900 mb-2">
            Premium Medical UI Design System
          </h1>
          <p className="text-secondary-600">
            Testing our mobile-first, premium components
          </p>
        </div>

        {/* Enhanced Button Variants */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Enhanced Button Components</CardTitle>
            <CardDescription>
              Premium button variants with icons, animations, and medical themes
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Basic Variants */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Basic Variants</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="medical">Medical</Button>
                  <Button variant="danger">Danger</Button>
                  <Button variant="success">Success</Button>
                </div>
              </div>

              {/* Sizes */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Button Sizes</h4>
                <div className="flex flex-wrap items-center gap-3">
                  <Button size="xs" variant="primary">Extra Small</Button>
                  <Button size="sm" variant="primary">Small</Button>
                  <Button size="md" variant="primary">Medium</Button>
                  <Button size="lg" variant="primary">Large</Button>
                  <Button size="xl" variant="primary">Extra Large</Button>
                </div>
              </div>

              {/* With Icons */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Buttons with Icons</h4>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    variant="primary" 
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    }
                  >
                    Add Item
                  </Button>
                  <Button 
                    variant="secondary" 
                    rightIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    }
                  >
                    Continue
                  </Button>
                  <Button 
                    variant="outline" 
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                    }
                  >
                    Download
                  </Button>
                </div>
              </div>

              {/* States */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Button States</h4>
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" loading>Loading...</Button>
                  <Button variant="primary" loading loadingText="Processing">Processing</Button>
                  <Button variant="secondary" disabled>Disabled</Button>
                  <Button variant="primary" fullWidth>Full Width Button</Button>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Enhanced Card Variants */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Enhanced Card Components</CardTitle>
            <CardDescription>
              Premium card variants with animations and medical theming
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Grid cols={{ xs: 1, md: 2, lg: 3 }} gap={6}>
              <Card variant="elevated" hoverable>
                <CardHeader
                  icon={
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  }
                  action={<CardBadge variant="primary">NEW</CardBadge>}
                >
                  <CardTitle size="sm">Elevated Card</CardTitle>
                  <CardDescription>Hover for animation effect</CardDescription>
                </CardHeader>
                <CardBody padding="sm">
                  <p className="text-secondary-600 text-sm">
                    Enhanced with icons, badges, and smooth hover animations.
                  </p>
                </CardBody>
              </Card>

              <Card variant="glass" hoverable pressable>
                <CardHeader>
                  <CardTitle size="sm">Glass Card</CardTitle>
                  <CardDescription>Frosted glass effect</CardDescription>
                </CardHeader>
                <CardBody padding="sm">
                  <p className="text-secondary-600 text-sm">
                    Modern glass morphism design with backdrop blur.
                  </p>
                </CardBody>
              </Card>

              <Card variant="gradient" borderAccent="success">
                <CardHeader>
                  <CardTitle size="sm">Gradient Card</CardTitle>
                  <CardDescription>With accent border</CardDescription>
                </CardHeader>
                <CardBody padding="sm">
                  <p className="text-secondary-600 text-sm">
                    Subtle gradient background with colored accent.
                  </p>
                </CardBody>
              </Card>

              <Card variant="outline" hoverable>
                <CardHeader>
                  <CardTitle size="sm">Outline Card</CardTitle>
                  <CardDescription>Clean outline style</CardDescription>
                </CardHeader>
                <CardBody padding="sm">
                  <p className="text-secondary-600 text-sm">
                    Minimal design with border-only styling.
                  </p>
                </CardBody>
              </Card>

              <Card variant="compact" size="sm">
                <CardBody padding="sm">
                  <Stack spacing={2}>
                    <CardTitle size="sm">Compact Card</CardTitle>
                    <CardDescription size="xs">
                      Smaller padding for dense layouts
                    </CardDescription>
                  </Stack>
                </CardBody>
              </Card>

              <Card variant="medical" 
                icon={
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                }
              >
                <CardHeader>
                  <CardTitle size="sm">Medical Card</CardTitle>
                  <CardDescription>With background icon</CardDescription>
                </CardHeader>
                <CardBody padding="sm">
                  <p className="text-secondary-600 text-sm">
                    Medical-themed with subtle background icon.
                  </p>
                </CardBody>
              </Card>
            </Grid>
          </CardBody>
        </Card>

        {/* Medical-Specific Cards */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Medical-Specific Cards</CardTitle>
            <CardDescription>
              Specialized cards for medical application use cases
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Grid cols={{ xs: 1, md: 2 }} gap={6}>
              <HealthMetricCard
                title="Blood Pressure"
                value="120/80"
                unit="mmHg"
                status="normal"
                trend={-2.5}
                lastUpdated="2 hours ago"
                onClick={() => alert('View blood pressure details')}
              />
              
              <HealthMetricCard
                title="Heart Rate"
                value="72"
                unit="bpm"
                status="normal"
                trend={1.2}
                lastUpdated="5 minutes ago"
              />

              <MedicationCard
                name="Lisinopril"
                dosage="10mg"
                frequency="Once daily"
                nextDose="Tomorrow 8:00 AM"
                onTake={() => alert('Medication marked as taken')}
                onSkip={() => alert('Medication skipped')}
              />

              <MedicationCard
                name="Metformin"
                dosage="500mg"
                frequency="Twice daily"
                taken={true}
              />

              <AppointmentCard
                doctorName="Dr. Sarah Johnson"
                specialty="Cardiologist"
                date="March 15, 2024"
                time="2:30 PM"
                location="Medical Center, Room 205"
                type="in-person"
                status="scheduled"
                onReschedule={() => alert('Reschedule appointment')}
                onCancel={() => alert('Cancel appointment')}
              />

              <ReportCard
                title="Blood Test Results"
                date="March 10, 2024"
                type="Laboratory Report"
                status="processed"
                summary="Complete blood count and metabolic panel results showing normal values across all parameters."
                abnormalCount={0}
                onView={() => alert('View report details')}
                onDownload={() => alert('Download report')}
              />
            </Grid>
          </CardBody>
        </Card>

        {/* Layout Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Layout Components</CardTitle>
            <CardDescription>
              Responsive layout components for mobile-first design
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Stack spacing={8}>
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Flex Layout</h4>
                <Flex justify="between" align="center" className="p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm">Left Content</span>
                  <CardBadge variant="primary">Center Badge</CardBadge>
                  <Button size="sm" variant="outline">Right Action</Button>
                </Flex>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Stack Layout</h4>
                <Stack spacing={3} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">Stack Item 1</div>
                  <div className="text-sm text-secondary-600">Stack Item 2</div>
                  <div className="text-sm text-secondary-600">Stack Item 3</div>
                </Stack>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Divider</h4>
                <div className="space-y-4">
                  <p className="text-sm text-secondary-600">Content above divider</p>
                  <Divider />
                  <p className="text-sm text-secondary-600">Content below divider</p>
                  <Divider>With Text</Divider>
                  <p className="text-sm text-secondary-600">Content after text divider</p>
                </div>
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* Loading States */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
            <CardDescription>
              Various loading indicators and skeleton screens
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="loading-spinner" />
                <span className="text-secondary-600">Loading spinner</span>
              </div>
              
              <div className="space-y-2">
                <div className="loading-skeleton h-4 w-3/4 rounded" />
                <div className="loading-skeleton h-4 w-1/2 rounded" />
                <div className="loading-skeleton h-4 w-2/3 rounded" />
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Status Indicators */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Status Indicators</CardTitle>
            <CardDescription>
              Success, error, and warning states
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-3">
              <div className="status-success p-3 rounded-lg border">
                <strong>Success:</strong> Operation completed successfully
              </div>
              <div className="status-error p-3 rounded-lg border">
                <strong>Error:</strong> Something went wrong
              </div>
              <div className="status-warning p-3 rounded-lg border">
                <strong>Warning:</strong> Please review this information
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Medical-Specific Buttons */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Medical-Specific Buttons</CardTitle>
            <CardDescription>
              Specialized buttons for medical application use cases
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Medical Actions</h4>
                <div className="flex flex-wrap gap-3">
                  <ScanButton />
                  <AIChatButton />
                  <ReportUploadButton />
                  <EmergencyButton>Emergency SOS</EmergencyButton>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Health Status</h4>
                <div className="flex flex-wrap gap-3">
                  <HealthStatusButton status="good">Excellent</HealthStatusButton>
                  <HealthStatusButton status="normal">Normal</HealthStatusButton>
                  <HealthStatusButton status="warning">Warning</HealthStatusButton>
                  <HealthStatusButton status="critical">Critical</HealthStatusButton>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Medication</h4>
                <div className="flex flex-wrap gap-3">
                  <MedicationButton>Take Medication</MedicationButton>
                  <MedicationButton taken>Medication Taken</MedicationButton>
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Button Groups and Icon Buttons */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Button Groups & Icon Buttons</CardTitle>
            <CardDescription>
              Grouped buttons and icon-only interactions
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Horizontal Button Group</h4>
                <ButtonGroup>
                  <Button variant="outline">Day</Button>
                  <Button variant="outline">Week</Button>
                  <Button variant="primary">Month</Button>
                </ButtonGroup>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Vertical Button Group</h4>
                <ButtonGroup orientation="vertical">
                  <Button variant="outline">Profile</Button>
                  <Button variant="outline">Settings</Button>
                  <Button variant="outline">Logout</Button>
                </ButtonGroup>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-3">Icon Buttons</h4>
                <div className="flex flex-wrap gap-3">
                  <IconButton
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    }
                    aria-label="Like"
                    variant="ghost"
                  />
                  <IconButton
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                      </svg>
                    }
                    aria-label="Share"
                    variant="primary"
                  />
                  <IconButton
                    icon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                      </svg>
                    }
                    aria-label="More options"
                    variant="ghost"
                  />
                </div>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Medical Gradients */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="medical-gradient p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Medical Gradient</h3>
            <p className="opacity-90">Primary medical theme gradient</p>
          </div>
          
          <div className="medical-gradient-light p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Light Gradient</h3>
            <p className="opacity-80">Subtle medical theme for backgrounds</p>
          </div>
          
          <div className="accent-gradient p-6 rounded-xl">
            <h3 className="text-lg font-semibold mb-2">Accent Gradient</h3>
            <p className="opacity-90">Warm accent for call-to-action elements</p>
          </div>
        </div>

        {/* Floating Action Button */}
        <FloatingActionButton
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
          label="Add New"
          variant="medical"
          onClick={() => alert('FAB clicked!')}
        />

        {/* Enhanced Form Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Enhanced Form Components</CardTitle>
            <CardDescription>
              Premium form components with floating labels, validation, and medical theming
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Stack spacing={8}>
              {/* Basic Form Inputs */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Basic Form Inputs</h4>
                <Grid cols={{ xs: 1, md: 2 }} gap={4}>
                  <Input
                    label="Full Name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                  
                  <Input
                    variant="floating"
                    label="Email Address"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    leftIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    }
                  />
                  
                  <Input
                    variant="filled"
                    label="Password"
                    type="password"
                    placeholder="Enter password"
                    rightIcon={
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    }
                  />
                  
                  <Input
                    variant="medical"
                    label="Medical ID"
                    placeholder="Enter medical ID"
                    helperText="Your unique medical identification number"
                  />
                </Grid>
              </div>

              {/* Textarea and Select */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Textarea & Select</h4>
                <Grid cols={{ xs: 1, md: 2 }} gap={4}>
                  <Textarea
                    label="Message"
                    placeholder="Enter your message..."
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    autoResize
                    maxLength={500}
                    showCharCount
                  />
                  
                  <Select
                    label="Country"
                    placeholder="Select your country"
                    options={countryOptions}
                    value={formData.country}
                    onChange={(value) => setFormData({...formData, country: value})}
                    searchable
                  />
                </Grid>
              </div>

              {/* Checkbox and Radio */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Checkbox & Radio</h4>
                <Stack spacing={4}>
                  <Checkbox
                    label="Subscribe to newsletter"
                    description="Get updates about new features and health tips"
                    checked={formData.newsletter}
                    onChange={(checked) => setFormData({...formData, newsletter: checked})}
                    variant="medical"
                  />
                  
                  <RadioGroup
                    label="Gender"
                    name="gender"
                    value={formData.gender}
                    onChange={(value) => setFormData({...formData, gender: value})}
                  >
                    <Radio value="male" label="Male" />
                    <Radio value="female" label="Female" />
                    <Radio value="other" label="Other" />
                    <Radio value="prefer-not-to-say" label="Prefer not to say" />
                  </RadioGroup>
                </Stack>
              </div>

              {/* Medical-Specific Forms */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Medical-Specific Forms</h4>
                <Stack spacing={6}>
                  <BloodPressureInput
                    systolic={formData.systolic}
                    diastolic={formData.diastolic}
                    onSystolicChange={(value) => setFormData({...formData, systolic: value})}
                    onDiastolicChange={(value) => setFormData({...formData, diastolic: value})}
                  />
                  
                  <MedicationDosageInput
                    amount={formData.dosageAmount}
                    unit={formData.dosageUnit}
                    onAmountChange={(value) => setFormData({...formData, dosageAmount: value})}
                    onUnitChange={(value) => setFormData({...formData, dosageUnit: value})}
                  />
                  
                  <SymptomSeverityScale
                    value={formData.severity}
                    onChange={(value) => setFormData({...formData, severity: value})}
                  />
                </Stack>
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* Navigation Components */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Navigation Components</CardTitle>
            <CardDescription>
              Mobile-first navigation with bottom tabs, tab bars, and segmented controls
            </CardDescription>
          </CardHeader>
          <CardBody>
            <Stack spacing={8}>
              {/* Tab Bar */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Tab Bar</h4>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <MedicalTabBar
                    activeTab={formData.activeTabBarTab}
                    onTabChange={(tab) => setFormData({...formData, activeTabBarTab: tab})}
                    sections={['overview', 'vitals', 'medications', 'reports']}
                  />
                  <div className="p-4 bg-gray-50">
                    <p className="text-sm text-secondary-600">
                      Active tab: <span className="font-medium">{formData.activeTabBarTab}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Segmented Control */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Segmented Control</h4>
                <div className="space-y-4">
                  <SegmentedControl
                    options={[
                      { value: 'option1', label: 'Daily' },
                      { value: 'option2', label: 'Weekly' },
                      { value: 'option3', label: 'Monthly' }
                    ]}
                    value={formData.segmentedValue}
                    onChange={(value) => setFormData({...formData, segmentedValue: value})}
                  />
                  
                  <SegmentedControl
                    variant="medical"
                    size="lg"
                    options={[
                      { value: 'chart', label: 'Chart View' },
                      { value: 'list', label: 'List View' },
                      { value: 'grid', label: 'Grid View' }
                    ]}
                    value="chart"
                  />
                </div>
              </div>

              {/* Bottom Navigation Preview */}
              <div>
                <h4 className="text-sm font-semibold text-secondary-700 mb-4">Bottom Navigation Preview</h4>
                <div className="relative border border-gray-200 rounded-lg overflow-hidden bg-gray-50" style={{ height: '200px' }}>
                  <div className="p-4">
                    <p className="text-sm text-secondary-600 mb-2">
                      Active tab: <span className="font-medium">{formData.activeBottomTab}</span>
                    </p>
                    <p className="text-xs text-secondary-500">
                      This is a preview of the bottom navigation. In a real app, this would be fixed to the bottom of the screen.
                    </p>
                  </div>
                  
                  {/* Bottom Navigation positioned at bottom of preview */}
                  <div className="absolute bottom-0 left-0 right-0">
                    <MedicalBottomNavigation
                      activeTab={formData.activeBottomTab}
                      onTabChange={(tab) => setFormData({...formData, activeBottomTab: tab})}
                      showBadges={true}
                    />
                  </div>
                </div>
              </div>
            </Stack>
          </CardBody>
        </Card>

        {/* Responsive Text */}
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Responsive Typography</CardTitle>
            <CardDescription>
              Text that scales appropriately across devices
            </CardDescription>
          </CardHeader>
          <CardBody>
            <div className="space-y-2">
              <p className="text-responsive-xl">Extra large responsive text</p>
              <p className="text-responsive-lg">Large responsive text</p>
              <p className="text-responsive-base">Base responsive text</p>
              <p className="text-responsive-sm">Small responsive text</p>
            </div>
          </CardBody>
        </Card>

      </div>
    </div>
  );
};

export default DesignSystemTest;
// Mobile Layout System Test Component
// Comprehensive testing and demonstration of mobile layout features

import React, { useState } from 'react';
import {
    ResponsiveGrid,
    ResponsiveContainer,
    FlexibleLayout,
    AdaptiveLayout,
    MasonryLayout,
    SidebarLayout,
    StackLayout,
    InlineLayout,
    MedicalDashboardLayout,
    PatientRecordLayout,
    Modal,
    ConfirmationModal,
    MedicalModal,
    BottomSheet,
    ActionSheet,
    MedicalBottomSheet,
    PickerBottomSheet,
    PullToRefresh,
    InfiniteScroll,
    VirtualList,
    FloatingActionButton,
    SpeedDialFAB,
    MobileDataTable,
    StickyHeader,
    Card,
    CardHeader,
    CardBody,
    Button,
    Container
} from '../ui';

const MobileLayoutTest = () => {
    const [activeDemo, setActiveDemo] = useState('responsive-layouts');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isMedicalModalOpen, setIsMedicalModalOpen] = useState(false);
    const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
    const [isActionSheetOpen, setIsActionSheetOpen] = useState(false);
    const [isMedicalBottomSheetOpen, setIsMedicalBottomSheetOpen] = useState(false);
    const [isPickerOpen, setIsPickerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [items, setItems] = useState(Array.from({ length: 20 }, (_, i) => ({ id: i, name: `Item ${i + 1}` })));
    const [hasMore, setHasMore] = useState(true);
    const [selectedValue, setSelectedValue] = useState('');

    // Sample data for various components
    const masonryItems = Array.from({ length: 12 }, (_, i) => ({
        id: i,
        title: `Card ${i + 1}`,
        content: `This is content for card ${i + 1}. ${i % 3 === 0 ? 'This card has more content to demonstrate variable heights in the masonry layout.' : ''}`,
        height: Math.floor(Math.random() * 100) + 100
    }));

    const tableData = [
        { id: 1, name: 'John Doe', age: 30, status: 'Active', department: 'Engineering' },
        { id: 2, name: 'Jane Smith', age: 25, status: 'Active', department: 'Design' },
        { id: 3, name: 'Bob Johnson', age: 35, status: 'Inactive', department: 'Marketing' },
        { id: 4, name: 'Alice Brown', age: 28, status: 'Active', department: 'Sales' },
        { id: 5, name: 'Charlie Wilson', age: 32, status: 'Active', department: 'Engineering' }
    ];

    const tableColumns = [
        { key: 'name', title: 'Name' },
        { key: 'age', title: 'Age' },
        {
            key: 'status', title: 'Status', render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs ${value === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {value}
                </span>
            )
        },
        { key: 'department', title: 'Department' }
    ];

    const pickerOptions = [
        { value: 'option1', label: 'Option 1', description: 'First option description' },
        { value: 'option2', label: 'Option 2', description: 'Second option description' },
        { value: 'option3', label: 'Option 3', description: 'Third option description' },
        { value: 'option4', label: 'Option 4', description: 'Fourth option description' }
    ];

    const speedDialActions = [
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
            ),
            label: 'Add Item',
            onClick: () => console.log('Add item clicked')
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            ),
            label: 'Edit',
            onClick: () => console.log('Edit clicked')
        },
        {
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            label: 'Delete',
            onClick: () => console.log('Delete clicked'),
            variant: 'danger'
        }
    ];

    const actionSheetActions = [
        {
            title: 'Edit Profile',
            subtitle: 'Update your profile information',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
            ),
            onPress: () => console.log('Edit profile')
        },
        {
            title: 'Share',
            subtitle: 'Share with others',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
            ),
            onPress: () => console.log('Share')
        },
        {
            title: 'Delete Account',
            subtitle: 'Permanently delete your account',
            icon: (
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            ),
            onPress: () => console.log('Delete account')
        }
    ];

    const handleRefresh = async () => {
        setRefreshing(true);
        await new Promise(resolve => setTimeout(resolve, 2000));
        setRefreshing(false);
    };

    const loadMoreItems = async () => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newItems = Array.from({ length: 10 }, (_, i) => ({
            id: items.length + i,
            name: `Item ${items.length + i + 1}`
        }));
        setItems(prev => [...prev, ...newItems]);

        if (items.length >= 50) {
            setHasMore(false);
        }
    };

    const renderResponsiveLayoutsDemo = () => (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Responsive Grid System</h3>
                </CardHeader>
                <CardBody>
                    <ResponsiveGrid cols={{ xs: 1, sm: 2, md: 3, lg: 4 }} gap={4}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="p-4 bg-primary-50 rounded-lg text-center">
                                <span className="text-sm font-medium">Grid Item {i + 1}</span>
                            </div>
                        ))}
                    </ResponsiveGrid>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Flexible Layout</h3>
                </CardHeader>
                <CardBody>
                    <FlexibleLayout direction="row" responsive={true} gap={4}>
                        <div className="flex-1 p-4 bg-blue-50 rounded-lg text-center">
                            <span className="text-sm font-medium">Flexible Item 1</span>
                        </div>
                        <div className="flex-1 p-4 bg-green-50 rounded-lg text-center">
                            <span className="text-sm font-medium">Flexible Item 2</span>
                        </div>
                        <div className="flex-1 p-4 bg-purple-50 rounded-lg text-center">
                            <span className="text-sm font-medium">Flexible Item 3</span>
                        </div>
                    </FlexibleLayout>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Masonry Layout</h3>
                </CardHeader>
                <CardBody>
                    <MasonryLayout columns={{ xs: 1, sm: 2, md: 3 }} gap={4}>
                        {masonryItems.map((item) => (
                            <Card key={item.id} className="mb-0">
                                <CardBody>
                                    <h4 className="font-medium mb-2">{item.title}</h4>
                                    <p className="text-sm text-gray-600">{item.content}</p>
                                </CardBody>
                            </Card>
                        ))}
                    </MasonryLayout>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Stack Layout</h3>
                </CardHeader>
                <CardBody>
                    <StackLayout spacing={4}>
                        {Array.from({ length: 4 }, (_, i) => (
                            <div key={i} className="p-4 bg-gray-50 rounded-lg">
                                <span className="font-medium">Stack Item {i + 1}</span>
                            </div>
                        ))}
                    </StackLayout>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Inline Layout</h3>
                </CardHeader>
                <CardBody>
                    <InlineLayout spacing={2} wrap={true}>
                        {Array.from({ length: 8 }, (_, i) => (
                            <div key={i} className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                                Tag {i + 1}
                            </div>
                        ))}
                    </InlineLayout>
                </CardBody>
            </Card>
        </div>
    );

    const renderModalsDemo = () => (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Modal Components</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={() => setIsModalOpen(true)}>
                            Open Modal
                        </Button>
                        <Button onClick={() => setIsConfirmModalOpen(true)}>
                            Confirmation Modal
                        </Button>
                        <Button onClick={() => setIsMedicalModalOpen(true)}>
                            Medical Modal
                        </Button>
                    </div>

                    <Modal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        title="Sample Modal"
                        subtitle="This is a subtitle"
                    >
                        <p className="text-gray-600 mb-4">
                            This is a sample modal with various features including backdrop blur,
                            escape key handling, and smooth animations.
                        </p>
                        <div className="flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={() => setIsModalOpen(false)}>
                                Confirm
                            </Button>
                        </div>
                    </Modal>

                    <ConfirmationModal
                        isOpen={isConfirmModalOpen}
                        onClose={() => setIsConfirmModalOpen(false)}
                        onConfirm={() => {
                            console.log('Confirmed');
                            setIsConfirmModalOpen(false);
                        }}
                        title="Delete Item"
                        message="Are you sure you want to delete this item? This action cannot be undone."
                        variant="danger"
                    />

                    <MedicalModal
                        isOpen={isMedicalModalOpen}
                        onClose={() => setIsMedicalModalOpen(false)}
                        title="Patient Information"
                        priority="urgent"
                        patientInfo={{
                            name: 'John Doe',
                            id: 'P12345',
                            initials: 'JD'
                        }}
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Blood Pressure
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="120/80"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Heart Rate
                                </label>
                                <input
                                    type="text"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                    placeholder="72 bpm"
                                />
                            </div>
                        </div>
                    </MedicalModal>
                </CardBody>
            </Card>
        </div>
    );

    const renderBottomSheetsDemo = () => (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Bottom Sheet Components</h3>
                </CardHeader>
                <CardBody className="space-y-4">
                    <div className="flex flex-wrap gap-4">
                        <Button onClick={() => setIsBottomSheetOpen(true)}>
                            Bottom Sheet
                        </Button>
                        <Button onClick={() => setIsActionSheetOpen(true)}>
                            Action Sheet
                        </Button>
                        <Button onClick={() => setIsMedicalBottomSheetOpen(true)}>
                            Medical Bottom Sheet
                        </Button>
                        <Button onClick={() => setIsPickerOpen(true)}>
                            Picker Bottom Sheet
                        </Button>
                    </div>

                    <BottomSheet
                        isOpen={isBottomSheetOpen}
                        onClose={() => setIsBottomSheetOpen(false)}
                        title="Sample Bottom Sheet"
                        subtitle="This is a subtitle"
                    >
                        <div className="space-y-4">
                            <p className="text-gray-600">
                                This is a bottom sheet that slides up from the bottom of the screen.
                                It supports swipe-to-close gestures and has a drag handle.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {Array.from({ length: 6 }, (_, i) => (
                                    <div key={i} className="p-3 bg-gray-50 rounded-lg text-center">
                                        Option {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </BottomSheet>

                    <ActionSheet
                        isOpen={isActionSheetOpen}
                        onClose={() => setIsActionSheetOpen(false)}
                        title="Choose an action"
                        actions={actionSheetActions}
                        destructiveIndex={2}
                    />

                    <MedicalBottomSheet
                        isOpen={isMedicalBottomSheetOpen}
                        onClose={() => setIsMedicalBottomSheetOpen(false)}
                        title="Patient Vitals"
                        priority="critical"
                        patientInfo={{
                            name: 'Jane Smith',
                            id: 'P67890',
                            initials: 'JS'
                        }}
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-red-50 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-red-600">180/120</div>
                                    <div className="text-sm text-red-600">Blood Pressure</div>
                                </div>
                                <div className="p-3 bg-yellow-50 rounded-lg text-center">
                                    <div className="text-2xl font-bold text-yellow-600">95</div>
                                    <div className="text-sm text-yellow-600">Heart Rate</div>
                                </div>
                            </div>
                        </div>
                    </MedicalBottomSheet>

                    <PickerBottomSheet
                        isOpen={isPickerOpen}
                        onClose={() => setIsPickerOpen(false)}
                        title="Select an Option"
                        options={pickerOptions}
                        selectedValue={selectedValue}
                        onSelect={setSelectedValue}
                        searchable={true}
                    />
                </CardBody>
            </Card>
        </div>
    );

    const renderMobilePatternsDemo = () => (
        <div className="space-y-8">
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
                                {Array.from({ length: 5 }, (_, i) => (
                                    <div key={i} className="p-3 bg-white rounded-lg shadow-sm">
                                        Content Item {i + 1}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </PullToRefresh>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Infinite Scroll</h3>
                </CardHeader>
                <CardBody>
                    <InfiniteScroll
                        hasMore={hasMore}
                        loadMore={loadMoreItems}
                        className="h-64 bg-gray-50 rounded-lg p-4"
                    >
                        <div className="space-y-2">
                            {items.map((item) => (
                                <div key={item.id} className="p-3 bg-white rounded-lg shadow-sm">
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </InfiniteScroll>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Virtual List</h3>
                </CardHeader>
                <CardBody>
                    <VirtualList
                        items={Array.from({ length: 1000 }, (_, i) => ({ id: i, name: `Virtual Item ${i + 1}` }))}
                        itemHeight={50}
                        containerHeight={300}
                        renderItem={(item, index) => (
                            <div className="flex items-center px-4 py-2 border-b border-gray-200">
                                <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white text-sm mr-3">
                                    {index + 1}
                                </div>
                                <span>{item.name}</span>
                            </div>
                        )}
                        className="border border-gray-200 rounded-lg"
                    />
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Mobile Data Table</h3>
                </CardHeader>
                <CardBody>
                    <MobileDataTable
                        data={tableData}
                        columns={tableColumns}
                        onRowClick={(row) => console.log('Row clicked:', row)}
                    />
                </CardBody>
            </Card>

            {/* Floating Action Buttons */}
            <FloatingActionButton
                icon={
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                }
                onClick={() => console.log('FAB clicked')}
                position="bottom-right"
            />

            <SpeedDialFAB
                actions={speedDialActions}
                position="bottom-left"
            />
        </div>
    );

    const renderMedicalLayoutsDemo = () => (
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Medical Dashboard Layout</h3>
                </CardHeader>
                <CardBody>
                    <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                        <MedicalDashboardLayout
                            header={
                                <div className="p-4 bg-primary-500 text-white">
                                    <h2 className="text-lg font-semibold">Medical Dashboard</h2>
                                </div>
                            }
                            sidebar={
                                <div className="p-4">
                                    <h3 className="font-medium mb-4">Navigation</h3>
                                    <div className="space-y-2">
                                        {['Dashboard', 'Patients', 'Appointments', 'Reports'].map((item) => (
                                            <div key={item} className="p-2 hover:bg-gray-100 rounded cursor-pointer">
                                                {item}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            }
                            quickActions={
                                <div>
                                    <h3 className="font-medium mb-4">Quick Actions</h3>
                                    <div className="space-y-2">
                                        <Button size="sm" className="w-full">Add Patient</Button>
                                        <Button size="sm" variant="secondary" className="w-full">Schedule</Button>
                                    </div>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Dashboard Content</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-blue-50 rounded-lg">
                                        <h4 className="font-medium">Total Patients</h4>
                                        <div className="text-2xl font-bold text-blue-600">1,234</div>
                                    </div>
                                    <div className="p-4 bg-green-50 rounded-lg">
                                        <h4 className="font-medium">Appointments Today</h4>
                                        <div className="text-2xl font-bold text-green-600">28</div>
                                    </div>
                                </div>
                            </div>
                        </MedicalDashboardLayout>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardHeader>
                    <h3 className="text-lg font-semibold">Patient Record Layout</h3>
                </CardHeader>
                <CardBody>
                    <div className="h-96 border border-gray-200 rounded-lg overflow-hidden">
                        <PatientRecordLayout
                            patientInfo={
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-white font-bold">
                                        JD
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-semibold">John Doe</h2>
                                        <p className="text-white/80">Patient ID: P12345 • Age: 45</p>
                                    </div>
                                </div>
                            }
                            navigation={
                                <div className="flex space-x-4 p-4">
                                    {['Overview', 'Vitals', 'History', 'Medications'].map((tab) => (
                                        <button key={tab} className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-primary-600">
                                            {tab}
                                        </button>
                                    ))}
                                </div>
                            }
                            actions={
                                <div className="space-y-3">
                                    <Button size="sm" className="w-full">Add Note</Button>
                                    <Button size="sm" variant="secondary" className="w-full">Schedule</Button>
                                    <Button size="sm" variant="secondary" className="w-full">Print</Button>
                                </div>
                            }
                        >
                            <div className="space-y-4">
                                <h3 className="text-lg font-semibold">Patient Overview</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <h4 className="font-medium mb-2">Recent Vitals</h4>
                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between">
                                                <span>Blood Pressure:</span>
                                                <span className="font-medium">120/80</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span>Heart Rate:</span>
                                                <span className="font-medium">72 bpm</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 bg-white border border-gray-200 rounded-lg">
                                        <h4 className="font-medium mb-2">Allergies</h4>
                                        <div className="space-y-1">
                                            <span className="inline-block px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                                                Penicillin
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </PatientRecordLayout>
                    </div>
                </CardBody>
            </Card>
        </div>
    );

    const renderDemo = () => {
        switch (activeDemo) {
            case 'responsive-layouts':
                return renderResponsiveLayoutsDemo();
            case 'modals':
                return renderModalsDemo();
            case 'bottom-sheets':
                return renderBottomSheetsDemo();
            case 'mobile-patterns':
                return renderMobilePatternsDemo();
            case 'medical-layouts':
                return renderMedicalLayoutsDemo();
            default:
                return renderResponsiveLayoutsDemo();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Sticky Header */}
            <StickyHeader className="bg-white border-b border-gray-200">
                <Container>
                    <div className="flex items-center justify-between py-4">
                        <h1 className="text-xl font-bold text-gray-900">
                            Mobile Layout System Demo
                        </h1>
                        <div className="flex space-x-2 overflow-x-auto">
                            <Button
                                variant={activeDemo === 'responsive-layouts' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveDemo('responsive-layouts')}
                            >
                                Layouts
                            </Button>
                            <Button
                                variant={activeDemo === 'modals' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveDemo('modals')}
                            >
                                Modals
                            </Button>
                            <Button
                                variant={activeDemo === 'bottom-sheets' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveDemo('bottom-sheets')}
                            >
                                Bottom Sheets
                            </Button>
                            <Button
                                variant={activeDemo === 'mobile-patterns' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveDemo('mobile-patterns')}
                            >
                                Mobile Patterns
                            </Button>
                            <Button
                                variant={activeDemo === 'medical-layouts' ? 'primary' : 'secondary'}
                                size="sm"
                                onClick={() => setActiveDemo('medical-layouts')}
                            >
                                Medical Layouts
                            </Button>
                        </div>
                    </div>
                </Container>
            </StickyHeader>

            {/* Demo Content */}
            <Container>
                <div className="py-8">
                    {renderDemo()}
                </div>
            </Container>
        </div>
    );
};

export default MobileLayoutTest;
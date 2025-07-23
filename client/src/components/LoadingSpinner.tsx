import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = "Processing..." 
}) => {
  return (
    <div className="card max-w-2xl mx-auto text-center">
      <div className="space-y-6">
        {/* Animated Spinner */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Outer ring */}
            <div className="w-16 h-16 border-4 border-medical-200 rounded-full animate-spin">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-medical-600 rounded-full animate-spin"></div>
            </div>
            
            {/* Inner pulse */}
            <div className="absolute inset-2 bg-medical-100 rounded-full animate-pulse"></div>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <svg 
                className="w-6 h-6 text-medical-600" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Loading Message */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {message}
          </h3>
          <p className="text-gray-600">
            Our AI is analyzing your medicine image...
          </p>
        </div>

        {/* Progress Steps */}
        <div className="space-y-3">
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="flex items-center space-x-2 text-green-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Image uploaded</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm">
            <div className="flex items-center space-x-2 text-medical-600">
              <div className="w-4 h-4 border-2 border-medical-600 border-t-transparent rounded-full animate-spin"></div>
              <span>Analyzing with AI vision</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            <span>Fetching medicine information</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
            <div className="w-4 h-4 border-2 border-gray-300 rounded-full"></div>
            <span>Preparing results</span>
          </div>
        </div>

        {/* Estimated Time */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-center space-x-2 text-blue-800">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm">
              This usually takes 10-30 seconds
            </span>
          </div>
        </div>

        {/* Fun Facts */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">💡 Did you know?</h4>
          <p className="text-sm text-gray-600">
            Our AI can identify medicines by analyzing visual features like shape, color, 
            markings, and text on packaging. It uses advanced computer vision to read 
            even small text and compare against comprehensive medicine databases.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;

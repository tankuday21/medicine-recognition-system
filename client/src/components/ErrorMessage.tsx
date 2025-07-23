import React from 'react';

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  type?: 'error' | 'warning' | 'info';
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  message, 
  onRetry, 
  type = 'error' 
}) => {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200',
          icon: 'text-yellow-400',
          title: 'text-yellow-800',
          text: 'text-yellow-700'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200',
          icon: 'text-blue-400',
          title: 'text-blue-800',
          text: 'text-blue-700'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200',
          icon: 'text-red-400',
          title: 'text-red-800',
          text: 'text-red-700'
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    switch (type) {
      case 'warning':
        return (
          <path 
            fillRule="evenodd" 
            d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
            clipRule="evenodd" 
          />
        );
      case 'info':
        return (
          <path 
            fillRule="evenodd" 
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" 
            clipRule="evenodd" 
          />
        );
      default:
        return (
          <path 
            fillRule="evenodd" 
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" 
            clipRule="evenodd" 
          />
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'warning':
        return 'Warning';
      case 'info':
        return 'Information';
      default:
        return 'Error';
    }
  };

  const getTroubleshootingTips = () => {
    if (type !== 'error') return null;

    return (
      <div className="mt-4 space-y-2">
        <h4 className={`font-medium ${styles.title}`}>
          Troubleshooting Tips:
        </h4>
        <ul className={`text-sm ${styles.text} space-y-1`}>
          <li>• Ensure your image is clear and well-lit</li>
          <li>• Check that the medicine or packaging is fully visible</li>
          <li>• Try uploading a different image of the same medicine</li>
          <li>• Make sure your internet connection is stable</li>
          <li>• Verify the image file is not corrupted</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="card max-w-2xl mx-auto">
      <div className={`border rounded-lg p-6 ${styles.container}`}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg 
              className={`h-6 w-6 ${styles.icon}`} 
              fill="currentColor" 
              viewBox="0 0 20 20"
            >
              {getIcon()}
            </svg>
          </div>
          
          <div className="ml-3 flex-1">
            <h3 className={`text-lg font-medium ${styles.title}`}>
              {getTitle()}
            </h3>
            
            <div className={`mt-2 text-sm ${styles.text}`}>
              <p>{message}</p>
            </div>

            {getTroubleshootingTips()}

            {onRetry && (
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={onRetry}
                  className="btn-primary"
                >
                  <svg className="w-4 h-4 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Try Again
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="btn-secondary"
                >
                  Refresh Page
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Help */}
      <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">
          Need Help?
        </h4>
        <p className="text-sm text-gray-600 mb-3">
          If you continue to experience issues, here are some alternatives:
        </p>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Try taking a new photo with better lighting</li>
          <li>• Ensure the medicine name or markings are clearly visible</li>
          <li>• Use the manual search feature if available</li>
          <li>• Consult with a pharmacist or healthcare provider</li>
        </ul>
      </div>

      {/* Safety Reminder */}
      <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <svg className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <div>
            <h4 className="text-sm font-medium text-yellow-800">
              Safety Reminder
            </h4>
            <p className="text-sm text-yellow-700 mt-1">
              Never take medicine that you cannot positively identify. Always consult 
              with healthcare professionals for medicine identification and usage guidance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;

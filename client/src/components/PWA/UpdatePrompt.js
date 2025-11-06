import React from 'react';
import { useAppUpdate } from '../../hooks/usePWA';

const UpdatePrompt = () => {
  const { updateAvailable, updateApp } = useAppUpdate();
  const [showPrompt, setShowPrompt] = React.useState(false);

  React.useEffect(() => {
    if (updateAvailable) {
      setShowPrompt(true);
    }
  }, [updateAvailable]);

  if (!showPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-2xl p-4 z-50 animate-slide-up">
      <div className="flex items-start gap-3 text-white">
        <div className="flex-shrink-0">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold mb-1">
            Update Available
          </h3>
          <p className="text-sm text-blue-100 mb-3">
            A new version of Mediot is available with improvements and bug fixes.
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={updateApp}
              className="flex-1 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors"
            >
              Update Now
            </button>
            <button
              onClick={() => setShowPrompt(false)}
              className="px-4 py-2 text-white hover:bg-blue-800 rounded-lg transition-colors"
            >
              Later
            </button>
          </div>
        </div>
        
        <button
          onClick={() => setShowPrompt(false)}
          className="flex-shrink-0 text-blue-200 hover:text-white"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default UpdatePrompt;

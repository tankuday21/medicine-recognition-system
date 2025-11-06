import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const ProgressiveImage = ({
  src,
  placeholderSrc,
  alt,
  className = '',
  onLoad,
  onError,
  ...props
}) => {
  const [currentSrc, setCurrentSrc] = useState(placeholderSrc || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!src) return;

    const img = new Image();
    
    img.onload = () => {
      setCurrentSrc(src);
      setLoading(false);
      onLoad && onLoad();
    };
    
    img.onerror = () => {
      setError(true);
      setLoading(false);
      onError && onError();
    };
    
    img.src = src;
  }, [src, onLoad, onError]);

  if (error) {
    return (
      <div className={`bg-gray-100 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm">Image failed to load</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <img
        src={currentSrc}
        alt={alt}
        className={`
          transition-all duration-500 ease-in-out
          ${loading ? 'blur-sm scale-105' : 'blur-0 scale-100'}
          ${!placeholderSrc && loading ? 'opacity-0' : 'opacity-100'}
        `}
        {...props}
      />
      
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-75">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};

ProgressiveImage.propTypes = {
  src: PropTypes.string.isRequired,
  placeholderSrc: PropTypes.string,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  onLoad: PropTypes.func,
  onError: PropTypes.func
};

export default ProgressiveImage;
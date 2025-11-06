import React, { useState, useRef, useEffect } from 'react';
import { lazyImageLoader } from '../../utils/performance';

const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = null,
  blurDataURL = null,
  priority = false,
  quality = 75,
  sizes = '100vw',
  onLoad = () => {},
  onError = () => {},
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(priority ? src : null);
  const imgRef = useRef(null);
  const observerRef = useRef(null);

  // Generate responsive image sources
  const generateSrcSet = (baseSrc, widths = [640, 750, 828, 1080, 1200, 1920, 2048, 3840]) => {
    if (!baseSrc || baseSrc.startsWith('data:') || baseSrc.startsWith('blob:')) {
      return baseSrc;
    }

    // For external URLs, return as-is
    if (baseSrc.startsWith('http')) {
      return baseSrc;
    }

    // Generate srcset for different widths
    return widths
      .map(w => `${baseSrc}?w=${w}&q=${quality} ${w}w`)
      .join(', ');
  };

  // Handle image load
  const handleLoad = (event) => {
    setIsLoaded(true);
    setIsError(false);
    onLoad(event);
  };

  // Handle image error
  const handleError = (event) => {
    setIsError(true);
    setIsLoaded(false);
    onError(event);
  };

  // Lazy loading setup
  useEffect(() => {
    const img = imgRef.current;
    if (!img || priority) return;

    // Use intersection observer for lazy loading
    if ('IntersectionObserver' in window) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setCurrentSrc(src);
              observerRef.current?.unobserve(img);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.01
        }
      );

      observerRef.current.observe(img);
    } else {
      // Fallback for browsers without IntersectionObserver
      setCurrentSrc(src);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [src, priority]);

  // Preload critical images
  useEffect(() => {
    if (priority && src) {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      document.head.appendChild(link);

      return () => {
        document.head.removeChild(link);
      };
    }
  }, [src, priority]);

  // Base64 blur placeholder
  const blurPlaceholder = blurDataURL || 
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiNmM2Y0ZjYiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiNlNWU3ZWIiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';

  const containerStyle = {
    position: 'relative',
    overflow: 'hidden',
    ...(width && { width }),
    ...(height && { height })
  };

  const imageStyle = {
    transition: 'opacity 0.3s ease-in-out',
    opacity: isLoaded ? 1 : 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  };

  const placeholderStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: isLoaded ? 0 : 1,
    transition: 'opacity 0.3s ease-in-out',
    backgroundImage: `url(${blurPlaceholder})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'blur(10px)',
    transform: 'scale(1.1)' // Prevent blur edge artifacts
  };

  return (
    <div style={containerStyle} className={className}>
      {/* Blur placeholder */}
      <div style={placeholderStyle} />
      
      {/* Custom placeholder */}
      {placeholder && !isLoaded && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f3f4f6',
            opacity: isLoaded ? 0 : 1,
            transition: 'opacity 0.3s ease-in-out'
          }}
        >
          {placeholder}
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fee2e2',
            color: '#dc2626',
            fontSize: '14px'
          }}
        >
          Failed to load image
        </div>
      )}

      {/* Main image */}
      {currentSrc && (
        <img
          ref={imgRef}
          src={currentSrc}
          srcSet={generateSrcSet(currentSrc)}
          sizes={sizes}
          alt={alt}
          style={imageStyle}
          onLoad={handleLoad}
          onError={handleError}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          {...props}
        />
      )}
    </div>
  );
};

// Higher-order component for image optimization
export const withImageOptimization = (Component) => {
  return React.forwardRef((props, ref) => {
    const optimizedProps = {
      ...props,
      // Add optimization defaults
      loading: props.loading || 'lazy',
      decoding: props.decoding || 'async'
    };

    return <Component ref={ref} {...optimizedProps} />;
  });
};

// Avatar component with optimization
export const OptimizedAvatar = ({
  src,
  alt,
  size = 40,
  fallback = null,
  className = '',
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    setHasError(true);
  };

  const avatarStyle = {
    width: size,
    height: size,
    borderRadius: '50%',
    objectFit: 'cover'
  };

  if (hasError || !src) {
    return (
      <div
        style={{
          ...avatarStyle,
          backgroundColor: '#e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          fontSize: size * 0.4,
          fontWeight: 'bold'
        }}
        className={className}
      >
        {fallback || (alt ? alt.charAt(0).toUpperCase() : '?')}
      </div>
    );
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      onError={handleError}
      style={avatarStyle}
      {...props}
    />
  );
};

// Icon component with optimization
export const OptimizedIcon = ({
  src,
  alt,
  size = 24,
  className = '',
  fallback = null,
  ...props
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return fallback || <div style={{ width: size, height: size }} />;
  }

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      width={size}
      height={size}
      className={className}
      priority={size <= 32} // Prioritize small icons
      onError={() => setHasError(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain'
      }}
      {...props}
    />
  );
};

// Background image component with optimization
export const OptimizedBackgroundImage = ({
  src,
  children,
  className = '',
  overlay = false,
  overlayOpacity = 0.5,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (src) {
      const img = new Image();
      img.onload = () => setIsLoaded(true);
      img.src = src;
    }
  }, [src]);

  const containerStyle = {
    position: 'relative',
    backgroundImage: isLoaded ? `url(${src})` : 'none',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    transition: 'background-image 0.3s ease-in-out'
  };

  return (
    <div style={containerStyle} className={className} {...props}>
      {overlay && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})`,
            zIndex: 1
          }}
        />
      )}
      <div style={{ position: 'relative', zIndex: 2 }}>
        {children}
      </div>
    </div>
  );
};

export default OptimizedImage;
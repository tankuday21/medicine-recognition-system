import React from 'react';
import PropTypes from 'prop-types';

const SkeletonLoader = ({ 
  className = '', 
  width = 'w-full', 
  height = 'h-4',
  rounded = 'rounded',
  animate = true 
}) => {
  return (
    <div
      className={`
        bg-gray-200 ${width} ${height} ${rounded}
        ${animate ? 'animate-pulse' : ''}
        ${className}
      `}
    />
  );
};

const SkeletonCard = ({ className = '', showImage = true, lines = 3 }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      {showImage && (
        <SkeletonLoader className="mb-4" height="h-32" rounded="rounded-lg" />
      )}
      
      <div className="space-y-3">
        <SkeletonLoader height="h-5" width="w-3/4" />
        
        {Array.from({ length: lines }).map((_, index) => (
          <SkeletonLoader
            key={index}
            height="h-4"
            width={index === lines - 1 ? 'w-1/2' : 'w-full'}
          />
        ))}
      </div>
    </div>
  );
};

const SkeletonList = ({ items = 5, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <SkeletonLoader width="w-12" height="h-12" rounded="rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonLoader height="h-4" width="w-3/4" />
            <SkeletonLoader height="h-3" width="w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

const SkeletonTable = ({ rows = 5, columns = 4, className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, index) => (
          <SkeletonLoader key={index} height="h-5" width="w-full" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader key={colIndex} height="h-4" width="w-full" />
          ))}
        </div>
      ))}
    </div>
  );
};

const SkeletonDashboard = ({ className = '' }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <SkeletonLoader height="h-8" width="w-64" />
          <SkeletonLoader height="h-4" width="w-48" />
        </div>
        <SkeletonLoader height="h-10" width="w-24" rounded="rounded-lg" />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <SkeletonLoader height="h-6" width="w-16" />
                <SkeletonLoader height="h-4" width="w-20" />
              </div>
              <SkeletonLoader width="w-8" height="h-8" rounded="rounded-lg" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <SkeletonCard showImage={false} lines={5} />
          <SkeletonCard showImage={false} lines={3} />
        </div>
        
        <div className="space-y-6">
          <SkeletonList items={3} />
          <SkeletonCard showImage={false} lines={2} />
        </div>
      </div>
    </div>
  );
};

const SkeletonMedicine = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
      <div className="flex items-start space-x-4">
        <SkeletonLoader width="w-16" height="h-16" rounded="rounded-lg" />
        
        <div className="flex-1 space-y-3">
          <SkeletonLoader height="h-5" width="w-3/4" />
          <SkeletonLoader height="h-4" width="w-1/2" />
          
          <div className="flex items-center space-x-2">
            <SkeletonLoader height="h-6" width="w-16" rounded="rounded-full" />
            <SkeletonLoader height="h-6" width="w-20" rounded="rounded-full" />
          </div>
          
          <div className="flex items-center justify-between">
            <SkeletonLoader height="h-4" width="w-24" />
            <SkeletonLoader height="h-6" width="w-16" />
          </div>
        </div>
      </div>
    </div>
  );
};

const SkeletonNews = ({ className = '' }) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex space-x-4">
            <SkeletonLoader width="w-20" height="h-20" rounded="rounded-lg" />
            
            <div className="flex-1 space-y-2">
              <SkeletonLoader height="h-5" width="w-full" />
              <SkeletonLoader height="h-4" width="w-3/4" />
              <SkeletonLoader height="h-3" width="w-1/2" />
              
              <div className="flex items-center space-x-2 pt-2">
                <SkeletonLoader height="h-3" width="w-16" />
                <SkeletonLoader height="h-3" width="w-20" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// PropTypes
SkeletonLoader.propTypes = {
  className: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  rounded: PropTypes.string,
  animate: PropTypes.bool
};

SkeletonCard.propTypes = {
  className: PropTypes.string,
  showImage: PropTypes.bool,
  lines: PropTypes.number
};

SkeletonList.propTypes = {
  items: PropTypes.number,
  className: PropTypes.string
};

SkeletonTable.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  className: PropTypes.string
};

SkeletonDashboard.propTypes = {
  className: PropTypes.string
};

SkeletonMedicine.propTypes = {
  className: PropTypes.string
};

SkeletonNews.propTypes = {
  className: PropTypes.string
};

export {
  SkeletonLoader as default,
  SkeletonCard,
  SkeletonList,
  SkeletonTable,
  SkeletonDashboard,
  SkeletonMedicine,
  SkeletonNews
};
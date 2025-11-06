// Medical-Specific Card Components
// Specialized cards for medical application use cases

import React from 'react';
import PropTypes from 'prop-types';
import Card, { CardHeader, CardBody, CardFooter, CardTitle, CardDescription, CardBadge, CardActions } from './Card';
import { Button } from './';

/**
 * Health Metric Card Component
 * Displays health metrics with status indicators
 */
export const HealthMetricCard = ({
  title,
  value,
  unit,
  status = 'normal',
  trend = null,
  lastUpdated,
  onClick,
  className = '',
  ...props
}) => {
  const statusColors = {
    critical: 'danger',
    high: 'warning',
    normal: 'success',
    low: 'warning'
  };

  const statusIcons = {
    critical: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    high: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    normal: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    low: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  const trendIcon = trend && (
    <div className={`flex items-center ${trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-400'}`}>
      {trend > 0 ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      ) : trend < 0 ? (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 7l-9.2 9.2M7 7v10h10" />
        </svg>
      ) : (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      )}
      <span className="text-xs ml-1">{Math.abs(trend)}%</span>
    </div>
  );

  return (
    <Card
      variant="elevated"
      hoverable={!!onClick}
      pressable={!!onClick}
      onClick={onClick}
      borderAccent={statusColors[status]}
      className={className}
      {...props}
    >
      <CardHeader
        icon={statusIcons[status]}
        action={<CardBadge variant={statusColors[status]} size="xs">{status.toUpperCase()}</CardBadge>}
      >
        <CardTitle size="sm">{title}</CardTitle>
      </CardHeader>
      
      <CardBody padding="sm">
        <div className="flex items-baseline justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-secondary-900">{value}</span>
            {unit && <span className="text-sm text-secondary-500">{unit}</span>}
          </div>
          {trendIcon}
        </div>
        
        {lastUpdated && (
          <p className="text-xs text-secondary-400 mt-2">
            Updated {lastUpdated}
          </p>
        )}
      </CardBody>
    </Card>
  );
};

/**
 * Medication Card Component
 * Displays medication information with reminder functionality
 */
export const MedicationCard = ({
  name,
  dosage,
  frequency,
  nextDose,
  taken = false,
  onTake,
  onSkip,
  className = '',
  ...props
}) => {
  const pillIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  );

  return (
    <Card
      variant={taken ? 'outline' : 'elevated'}
      borderAccent={taken ? 'success' : 'primary'}
      className={`${taken ? 'opacity-75' : ''} ${className}`}
      {...props}
    >
      <CardHeader
        icon={pillIcon}
        action={taken && <CardBadge variant="success" size="xs">TAKEN</CardBadge>}
      >
        <CardTitle size="sm">{name}</CardTitle>
        <CardDescription>{dosage} • {frequency}</CardDescription>
      </CardHeader>
      
      <CardBody padding="sm">
        {nextDose && (
          <p className="text-sm text-secondary-600 mb-3">
            Next dose: <span className="font-medium">{nextDose}</span>
          </p>
        )}
        
        <CardActions alignment="between">
          {!taken ? (
            <>
              <Button variant="outline" size="sm" onClick={onSkip}>
                Skip
              </Button>
              <Button variant="success" size="sm" onClick={onTake}>
                Mark as Taken
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" fullWidth disabled>
              Completed
            </Button>
          )}
        </CardActions>
      </CardBody>
    </Card>
  );
};

/**
 * Appointment Card Component
 * Displays appointment information with actions
 */
export const AppointmentCard = ({
  doctorName,
  specialty,
  date,
  time,
  location,
  type = 'in-person',
  status = 'scheduled',
  onReschedule,
  onCancel,
  onJoin,
  className = '',
  ...props
}) => {
  const statusColors = {
    scheduled: 'primary',
    confirmed: 'success',
    cancelled: 'danger',
    completed: 'secondary'
  };

  const typeIcons = {
    'in-person': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    'video-call': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    'phone-call': (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    )
  };

  return (
    <Card
      variant="elevated"
      hoverable
      borderAccent={statusColors[status]}
      className={className}
      {...props}
    >
      <CardHeader
        icon={typeIcons[type]}
        action={<CardBadge variant={statusColors[status]} size="xs">{status.toUpperCase()}</CardBadge>}
      >
        <CardTitle size="sm">{doctorName}</CardTitle>
        <CardDescription>{specialty}</CardDescription>
      </CardHeader>
      
      <CardBody padding="sm">
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-secondary-600">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {date} at {time}
          </div>
          
          {location && (
            <div className="flex items-center gap-2 text-sm text-secondary-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {location}
            </div>
          )}
        </div>
        
        <CardActions alignment="between">
          {status === 'scheduled' && (
            <>
              <Button variant="outline" size="sm" onClick={onReschedule}>
                Reschedule
              </Button>
              {type === 'video-call' ? (
                <Button variant="primary" size="sm" onClick={onJoin}>
                  Join Call
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </>
          )}
        </CardActions>
      </CardBody>
    </Card>
  );
};

/**
 * Report Card Component
 * Displays medical report information
 */
export const ReportCard = ({
  title,
  date,
  type,
  status = 'processed',
  summary,
  abnormalCount = 0,
  onView,
  onDownload,
  className = '',
  ...props
}) => {
  const statusColors = {
    processing: 'warning',
    processed: 'success',
    failed: 'danger'
  };

  const reportIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );

  return (
    <Card
      variant="elevated"
      hoverable
      pressable
      onClick={onView}
      borderAccent={abnormalCount > 0 ? 'warning' : 'primary'}
      className={className}
      {...props}
    >
      <CardHeader
        icon={reportIcon}
        action={<CardBadge variant={statusColors[status]} size="xs">{status.toUpperCase()}</CardBadge>}
      >
        <CardTitle size="sm">{title}</CardTitle>
        <CardDescription>{type} • {date}</CardDescription>
      </CardHeader>
      
      <CardBody padding="sm">
        {summary && (
          <p className="text-sm text-secondary-600 mb-3 line-clamp-2">
            {summary}
          </p>
        )}
        
        {abnormalCount > 0 && (
          <div className="flex items-center gap-2 mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <svg className="w-4 h-4 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-yellow-700">
              {abnormalCount} abnormal value{abnormalCount > 1 ? 's' : ''} found
            </span>
          </div>
        )}
        
        <CardActions alignment="between">
          <Button variant="outline" size="sm" onClick={onView}>
            View Details
          </Button>
          <Button variant="ghost" size="sm" onClick={onDownload}>
            Download
          </Button>
        </CardActions>
      </CardBody>
    </Card>
  );
};

// PropTypes for all components
HealthMetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  status: PropTypes.oneOf(['critical', 'high', 'normal', 'low']),
  trend: PropTypes.number,
  lastUpdated: PropTypes.string,
  onClick: PropTypes.func,
  className: PropTypes.string
};

MedicationCard.propTypes = {
  name: PropTypes.string.isRequired,
  dosage: PropTypes.string.isRequired,
  frequency: PropTypes.string.isRequired,
  nextDose: PropTypes.string,
  taken: PropTypes.bool,
  onTake: PropTypes.func,
  onSkip: PropTypes.func,
  className: PropTypes.string
};

AppointmentCard.propTypes = {
  doctorName: PropTypes.string.isRequired,
  specialty: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired,
  location: PropTypes.string,
  type: PropTypes.oneOf(['in-person', 'video-call', 'phone-call']),
  status: PropTypes.oneOf(['scheduled', 'confirmed', 'cancelled', 'completed']),
  onReschedule: PropTypes.func,
  onCancel: PropTypes.func,
  onJoin: PropTypes.func,
  className: PropTypes.string
};

ReportCard.propTypes = {
  title: PropTypes.string.isRequired,
  date: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  status: PropTypes.oneOf(['processing', 'processed', 'failed']),
  summary: PropTypes.string,
  abnormalCount: PropTypes.number,
  onView: PropTypes.func,
  onDownload: PropTypes.func,
  className: PropTypes.string
};
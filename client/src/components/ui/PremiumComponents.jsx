import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Listbox, Transition, Popover } from '@headlessui/react';
import {
    CheckIcon,
    ChevronUpDownIcon,
    CalendarIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { Fragment, useState, useEffect } from 'react';

// Animation variants for reuse
const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, ease: [0.23, 1, 0.32, 1] }
    }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

/**
 * Premium Glass Card Component
 * A beautiful glassmorphism card with hover effects
 */
export const GlassCard = ({
    children,
    className = '',
    hoverEffect = true,
    onClick,
    delay = 0,
    padding = 'p-6',
    as: Component = 'div'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
            className={`glass-panel rounded-2xl ${padding} transition-all duration-300 ${onClick ? 'cursor-pointer' : ''} ${hoverEffect ? 'glass-card-hover' : ''} ${className}`}
            onClick={onClick}
        >
            {children}
        </motion.div>
    );
};

/**
 * Premium Feature Card with gradient border effect
 */
export const FeatureCard = ({
    icon: Icon,
    title,
    description,
    gradient = 'from-primary-500 to-primary-600',
    onClick,
    delay = 0
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
        className="relative group cursor-pointer feature-card-hover"
        onClick={onClick}
    >
        {/* Gradient border effect on hover */}
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-100 blur transition-opacity duration-300`} />

        <div className="relative bg-white rounded-2xl p-6 shadow-premium hover:shadow-premium-lg transition-all duration-300 border border-gray-100/50">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {Icon && <Icon className="w-7 h-7 text-white" />}
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{title}</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{description}</p>
        </div>
    </motion.div>
);

/**
 * Stat Card with visual indicator
 */
export const StatCard = ({
    value,
    label,
    icon: Icon,
    trend,
    trendUp = true,
    gradient = 'from-primary-50 to-primary-100',
    iconColor = 'text-primary-600',
    delay = 0
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
    >
        <GlassCard className="relative overflow-hidden" hoverEffect={false}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 mb-1 font-medium">{label}</p>
                    <p className="text-3xl font-display font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm mt-2 font-medium flex items-center gap-1 ${trendUp ? 'text-emerald-600' : 'text-red-500'}`}>
                            <span>{trendUp ? '↑' : '↓'}</span>
                            <span>{trend}</span>
                        </p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${iconColor}`} />
                    </div>
                )}
            </div>
            {/* Decorative gradient */}
            <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary-100 to-transparent rounded-full opacity-50" />
        </GlassCard>
    </motion.div>
);

/**
 * Gradient Button Component
 * High-impact button for primary actions
 */
export const GradientButton = ({
    children,
    onClick,
    icon: Icon,
    iconRight: IconRight,
    fullWidth = false,
    size = 'md',
    variant = 'primary',
    loading = false,
    disabled = false,
    className = '',
    ...props
}) => {
    const sizeClasses = {
        sm: 'px-4 py-2 text-sm gap-1.5',
        md: 'px-6 py-3 text-base gap-2',
        lg: 'px-8 py-4 text-lg font-semibold gap-2.5',
    };

    const variantClasses = {
        primary: 'bg-gradient-to-r from-primary-600 to-primary-500 text-white shadow-lg hover:shadow-xl',
        luxury: 'bg-primary-600 dark:bg-primary-500 text-white border-none shadow-lg shadow-primary-500/20',
        accent: 'bg-gradient-to-r from-accent-500 to-accent-400 text-white shadow-lg hover:shadow-xl',
        success: 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg hover:shadow-xl',
        danger: 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg hover:shadow-xl',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02, y: -2 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={`
                relative overflow-hidden rounded-xl font-medium
                transition-all duration-300
                ${variantClasses[variant]}
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled || loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}
                ${className}
            `}
            onClick={onClick}
            disabled={disabled || loading}
            {...props}
        >
            <div className="relative z-10 flex items-center justify-center">
                {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        {Icon && <Icon className="w-5 h-5" />}
                        {children}
                        {IconRight && <IconRight className="w-5 h-5" />}
                    </>
                )}
            </div>
            {/* Shine effect */}
            <div className="absolute inset-0 -translate-x-full hover:animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.button>
    );
};

/**
 * Action Button (Secondary/Ghost)
 */
export const ActionButton = ({
    children,
    onClick,
    variant = 'secondary',
    icon: Icon,
    size = 'md',
    fullWidth = false,
    disabled = false,
    className = ''
}) => {
    const variants = {
        secondary: 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm',
        ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
        glass: 'glass-panel text-primary-700 hover:bg-white/80',
        outline: 'bg-transparent text-primary-600 border-2 border-primary-200 hover:bg-primary-50 hover:border-primary-300',
    };

    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm gap-1.5',
        md: 'px-5 py-2.5 text-base gap-2',
        lg: 'px-6 py-3 text-lg gap-2',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.02 } : {}}
            whileTap={!disabled ? { scale: 0.98 } : {}}
            className={`
                rounded-xl font-medium transition-all duration-200 
                flex items-center justify-center
                ${variants[variant]} 
                ${sizeClasses[size]}
                ${fullWidth ? 'w-full' : ''}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
            onClick={onClick}
            disabled={disabled}
        >
            {Icon && <Icon className="w-5 h-5" />}
            {children}
        </motion.button>
    );
};

/**
 * Icon Button
 */
export const IconButton = ({
    icon: Icon,
    onClick,
    variant = 'default',
    size = 'md',
    label,
    className = '',
    ...props
}) => {
    const variants = {
        default: 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800',
        primary: 'bg-primary-100 text-primary-600 hover:bg-primary-200',
        ghost: 'bg-transparent text-gray-500 hover:bg-gray-100 hover:text-gray-700',
        danger: 'bg-red-100 text-red-600 hover:bg-red-200',
    };

    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                rounded-xl flex items-center justify-center transition-all duration-200
                ${variants[variant]}
                ${sizeClasses[size]}
                ${className}
            `}
            onClick={onClick}
            aria-label={label}
            {...props}
        >
            {Icon && <Icon className={iconSizes[size]} />}
        </motion.button>
    );
};

/**
 * Animated Section Header
 */
export const SectionHeader = ({
    title,
    subtitle,
    centered = false,
    action,
    className = ''
}) => {
    return (
        <div className={`mb-8 ${centered ? 'text-center' : 'flex items-end justify-between'} ${className}`}>
            <div>
                <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-2xl sm:text-3xl font-display font-bold text-gray-900 mb-2"
                >
                    {title}
                </motion.h2>
                {subtitle && (
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className={`text-base sm:text-lg text-gray-600 ${centered ? 'max-w-2xl mx-auto' : ''}`}
                    >
                        {subtitle}
                    </motion.p>
                )}
            </div>
            {action && !centered && (
                <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                >
                    {action}
                </motion.div>
            )}
        </div>
    );
};

/**
 * Status Badge
 */
export const StatusBadge = ({ status, text, size = 'md', dot = false }) => {
    const styles = {
        success: 'bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm shadow-emerald-500/10',
        warning: 'bg-amber-100 text-amber-700 border-amber-200 shadow-sm shadow-amber-500/10',
        error: 'bg-red-100 text-red-700 border-red-200 shadow-sm shadow-red-500/10',
        info: 'bg-blue-100 text-blue-700 border-blue-200 shadow-sm shadow-blue-500/10',
        neutral: 'bg-gray-100 text-gray-700 border-gray-200 shadow-sm',
        primary: 'bg-primary-100 text-primary-700 border-primary-200 shadow-sm',
    };

    const dotColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        neutral: 'bg-gray-500',
        primary: 'bg-primary-500',
    };

    const sizeClasses = {
        xs: 'px-2.5 py-1 text-[10px]',
        sm: 'px-3 py-1 text-xs',
        md: 'px-4 py-1.5 text-xs',
        lg: 'px-5 py-2 text-sm',
    };

    return (
        <span className={`inline-flex items-center gap-2 rounded-full font-black uppercase tracking-widest border transition-all ${styles[status] || styles.neutral} ${sizeClasses[size]}`}>
            {dot && (
                <span className="relative flex h-2 w-2">
                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${dotColors[status] || dotColors.neutral}`}></span>
                    <span className={`relative inline-flex rounded-full h-2 w-2 ${dotColors[status] || dotColors.neutral}`}></span>
                </span>
            )}
            {text}
        </span>
    );
};


/**
 * Premium Input with icon support
 */
export const PremiumInput = ({
    label,
    type = 'text',
    icon: Icon,
    error,
    helper,
    className = '',
    inputClassName = '',
    ...props
}) => (
    <div className={className}>
        {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
        )}
        <div className="relative input-wrapper">
            {Icon && (
                <Icon className="input-icon" />
            )}
            <input
                type={type}
                className={`
                    w-full px-4 py-3.5 ${Icon ? 'pl-16' : ''} 
                    bg-slate-100/30 dark:bg-slate-800/30 border-2 border-slate-200/50 dark:border-slate-700/50 rounded-xl
                    text-gray-900 placeholder-gray-400
                    focus:bg-white focus:border-primary-500 focus:ring-0 focus:shadow-sm
                    transition-all duration-200
                    ${error ? 'border-red-300 bg-red-50/50 focus:border-red-500' : ''}
                    ${inputClassName}
                `}
                style={{ fontSize: '16px' }}
                {...props}
            />
        </div>
        {error && <p className="mt-2 text-sm text-red-600 flex items-center gap-1.5">{error}</p>}
        {helper && !error && <p className="mt-2 text-sm text-gray-500">{helper}</p>}
    </div>
);

/**
 * Premium Textarea
 */
export const PremiumTextarea = ({
    label,
    error,
    helper,
    rows = 4,
    className = '',
    ...props
}) => (
    <div className={className}>
        {label && (
            <label className="block text-sm font-medium text-gray-700 mb-2">
                {label}
            </label>
        )}
        <textarea
            rows={rows}
            className={`
                w-full px-4 py-3.5
                bg-gray-50 border-2 border-gray-200 rounded-xl
                text-gray-900 placeholder-gray-400
                focus:bg-white focus:border-primary-500 focus:ring-0 focus:shadow-sm
                transition-all duration-200 resize-none
                ${error ? 'border-red-300 bg-red-50/50 focus:border-red-500' : ''}
            `}
            style={{ fontSize: '16px' }}
            {...props}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        {helper && !error && <p className="mt-2 text-sm text-gray-500">{helper}</p>}
    </div>
);

/**
 * Skeleton Loader Components
 */
export const Skeleton = ({ className = '', variant = 'text' }) => {
    const variants = {
        text: 'h-4 w-full',
        title: 'h-6 w-3/4',
        avatar: 'h-12 w-12 rounded-full',
        thumbnail: 'h-24 w-24 rounded-xl',
        card: 'h-48 w-full rounded-2xl',
        button: 'h-12 w-32 rounded-xl',
    };

    return (
        <div className={`loading-skeleton ${variants[variant]} ${className}`} />
    );
};

export const SkeletonCard = ({ lines = 3 }) => (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-slate-700">
        <div className="flex items-start gap-4">
            <Skeleton variant="avatar" />
            <div className="flex-1 space-y-3">
                <Skeleton variant="title" />
                {Array.from({ length: lines }).map((_, i) => (
                    <Skeleton key={i} className={i === lines - 1 ? 'w-2/3' : ''} />
                ))}
            </div>
        </div>
    </div>
);

/**
 * Loading Skeleton for larger areas
 */
export const LoadingSkeleton = ({ className = '', children }) => (
    <div className={`loading-skeleton rounded-2xl ${className}`}>
        {children}
    </div>
);

/**
 * Empty State Component
 */
export const EmptyState = ({
    icon: Icon,
    title,
    description,
    action,
    className = ''
}) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-center py-12 px-6 ${className}`}
    >
        {Icon && (
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                <Icon className="w-8 h-8 text-gray-400" />
            </div>
        )}
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
        {description && (
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">{description}</p>
        )}
        {action}
    </motion.div>
);

/**
 * Alert/Notification Component
 */
export const Alert = ({
    type = 'info',
    title,
    message,
    icon: CustomIcon,
    onClose,
    action,
    className = ''
}) => {
    const styles = {
        info: {
            bg: 'bg-blue-50 border-blue-200',
            icon: 'text-blue-500',
            title: 'text-blue-800',
            text: 'text-blue-700',
        },
        success: {
            bg: 'bg-emerald-50 border-emerald-200',
            icon: 'text-emerald-500',
            title: 'text-emerald-800',
            text: 'text-emerald-700',
        },
        warning: {
            bg: 'bg-amber-50 border-amber-200',
            icon: 'text-amber-500',
            title: 'text-amber-800',
            text: 'text-amber-700',
        },
        error: {
            bg: 'bg-red-50 border-red-200',
            icon: 'text-red-500',
            title: 'text-red-800',
            text: 'text-red-700',
        },
    };

    const style = styles[type];

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`rounded-xl border p-4 ${style.bg} ${className}`}
        >
            <div className="flex gap-3">
                {CustomIcon && (
                    <CustomIcon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${style.icon}`} />
                )}
                <div className="flex-1 min-w-0">
                    {title && (
                        <h4 className={`font-semibold mb-1 ${style.title}`}>{title}</h4>
                    )}
                    {message && (
                        <p className={`text-sm ${style.text}`}>{message}</p>
                    )}
                    {action && <div className="mt-3">{action}</div>}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`flex-shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors ${style.icon}`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </motion.div>
    );
};

/**
 * Divider with optional text
 */
export const Divider = ({ text, className = '' }) => (
    <div className={`flex items-center gap-4 ${className}`}>
        <div className="flex-1 h-px bg-gray-200" />
        {text && <span className="text-sm text-gray-500 font-medium">{text}</span>}
        <div className="flex-1 h-px bg-gray-200" />
    </div>
);

/**
 * Avatar Component
 */
export const Avatar = ({
    src,
    alt,
    name,
    size = 'md',
    status,
    className = ''
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
    };

    const statusColors = {
        online: 'bg-emerald-500',
        offline: 'bg-gray-400',
        busy: 'bg-red-500',
        away: 'bg-amber-500',
    };

    const getInitials = (name) => {
        if (!name) return '?';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    return (
        <div className={`relative inline-flex ${className}`}>
            {src ? (
                <img
                    src={src}
                    alt={alt || name}
                    className={`rounded-full object-cover ${sizeClasses[size]}`}
                />
            ) : (
                <div className={`rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-white font-semibold flex items-center justify-center ${sizeClasses[size]}`}>
                    {getInitials(name)}
                </div>
            )}
            {status && (
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`} />
            )}
        </div>
    );
};

/**
 * Progress Bar
 */
export const ProgressBar = ({
    value = 0,
    max = 100,
    size = 'md',
    color = 'primary',
    showLabel = false,
    className = ''
}) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

    const sizeClasses = {
        sm: 'h-1.5',
        md: 'h-2.5',
        lg: 'h-4',
    };

    const colorClasses = {
        primary: 'bg-gradient-to-r from-primary-500 to-primary-400',
        success: 'bg-gradient-to-r from-emerald-500 to-emerald-400',
        warning: 'bg-gradient-to-r from-amber-500 to-amber-400',
        error: 'bg-gradient-to-r from-red-500 to-red-400',
    };

    return (
        <div className={className}>
            {showLabel && (
                <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-medium text-gray-900">{Math.round(percentage)}%</span>
                </div>
            )}
            <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`h-full rounded-full ${colorClasses[color]}`}
                />
            </div>
        </div>
    );
};

/**
 * Tooltip Component
 */
export const Tooltip = ({ children, content, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const positions = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-flex"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg whitespace-nowrap ${positions[position]}`}
                    >
                        {content}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

/**
 * Page Transition Wrapper
 */
export const PageTransition = ({ children, className = '' }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
        className={className}
    >
        {children}
    </motion.div>
);

/**
 * Animated List Container
 */
export const AnimatedList = ({ children, className = '' }) => (
    <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={className}
    >
        {children}
    </motion.div>
);

/**
 * Animated List Item
 */
export const AnimatedListItem = ({ children, className = '' }) => (
    <motion.div
        variants={fadeInUp}
        className={className}
    >
        {children}
    </motion.div>
);

/**
 * Premium Custom Dropdown using Headless UI
 */
export const PremiumSelect = ({
    label,
    options,
    value,
    onChange,
    placeholder = "Select an option",
    error,
    className = ""
}) => {
    const selectedOption = options.find(opt => opt.value === value) || null;

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 pl-1">
                    {label}
                </label>
            )}
            <Listbox value={value} onChange={onChange}>
                <div className="relative mt-1">
                    <Listbox.Button className={`
                        relative w-full cursor-pointer rounded-xl bg-slate-100/30 dark:bg-slate-800/30 
                        backdrop-blur-sm pl-4 pr-10 py-3.5 text-left border-2 
                        border-slate-200/50 dark:border-slate-700/50
                    `}>
                        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                            {selectedOption ? selectedOption.label : placeholder}
                        </span>
                        <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon
                                className="h-5 w-5 text-slate-400"
                                aria-hidden="true"
                            />
                        </span>
                    </Listbox.Button>
                    <Transition
                        as={Fragment}
                        leave="transition ease-in duration-100"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-xl bg-white dark:bg-slate-800 py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50 scroller">
                            {options.map((option, personIdx) => (
                                <Listbox.Option
                                    key={personIdx}
                                    className={({ active }) =>
                                        `relative cursor-default select-none py-2 pl-10 pr-4 ${active ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100' : 'text-slate-900 dark:text-slate-100'
                                        }`
                                    }
                                    value={option.value}
                                >
                                    {({ selected }) => (
                                        <>
                                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                                {option.label}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                    <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                        </>
                                    )}
                                </Listbox.Option>
                            ))}
                        </Listbox.Options>
                    </Transition>
                </div>
            </Listbox>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

/**
 * Premium Custom Date Picker
 * Supports Year/Month selection for DOB
 */
export const PremiumDatePicker = ({
    label,
    value,
    onChange,
    minYear = 1900,
    maxYear = new Date().getFullYear(),
    placeholder = "Select date",
    error,
    className = ""
}) => {
    // Helper to generate days in month
    const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
    const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

    const [date, setDate] = useState(value ? new Date(value) : null);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());

    // Sync internal state if prop changes
    useEffect(() => {
        if (value) {
            const newDate = new Date(value);
            setDate(newDate);
            setViewDate(newDate);
        }
    }, [value]);

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const generateYears = () => {
        const years = [];
        for (let i = maxYear; i >= minYear; i--) years.push(i);
        return years;
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentYear, currentMonth, day);
        // Adjust for timezone offset if needed, but keeping it simple for now
        // We want YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const d = String(newDate.getDate()).padStart(2, '0');

        onChange(`${year}-${month}-${d}`);
        // Close popover handled by Popover.Button wrapping inside if possible, 
        // but Headless UI Popover panel doesn't auto close on internal clicks unless it's a Button or we use close(). 
        // We will pass close to the render prop.
    };

    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 pl-1">
                    {label}
                </label>
            )}
            <Popover className="relative">
                {({ close }) => (
                    <>
                        <Popover.Button className={`
                            w-full flex items-center justify-between px-4 py-3.5 rounded-xl 
                            bg-slate-100/30 dark:bg-slate-800/30 backdrop-blur-sm border-2 
                            border-slate-200/50 dark:border-slate-700/50
                            text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 
                            focus-visible:ring-blue-500
                            ${error ? 'border-red-300' : ''}
                        `}>
                            <span className={`block truncate ${!value ? 'text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                                {value ? new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : placeholder}
                            </span>
                            <CalendarIcon className="w-5 h-5 text-slate-400" />
                        </Popover.Button>

                        <Transition
                            as={Fragment}
                            enter="transition ease-out duration-200"
                            enterFrom="opacity-0 translate-y-1"
                            enterTo="opacity-100 translate-y-0"
                            leave="transition ease-in duration-150"
                            leaveFrom="opacity-100 translate-y-0"
                            leaveTo="opacity-0 translate-y-1"
                        >
                            <Popover.Panel className="absolute z-50 mt-2 w-full sm:w-80 max-w-[90vw] -left-0 sm:left-auto p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
                                {/* Header: Year/Month Selectors */}
                                <div className="flex items-center justify-between mb-4 gap-2">
                                    <select
                                        className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 cursor-pointer outline-none hover:text-blue-600"
                                        value={currentMonth}
                                        onChange={(e) => setViewDate(new Date(currentYear, parseInt(e.target.value), 1))}
                                    >
                                        {months.map((m, i) => <option key={m} value={i}>{m}</option>)}
                                    </select>

                                    <select
                                        className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 cursor-pointer outline-none hover:text-blue-600"
                                        value={currentYear}
                                        onChange={(e) => setViewDate(new Date(parseInt(e.target.value), currentMonth, 1))}
                                    >
                                        {generateYears().map(y => <option key={y} value={y}>{y}</option>)}
                                    </select>
                                </div>

                                {/* Days Grid */}
                                <div className="grid grid-cols-7 text-center mb-2">
                                    {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                                        <div key={d} className="text-xs font-medium text-slate-400 py-1">{d}</div>
                                    ))}
                                </div>
                                <div className="grid grid-cols-7 gap-1">
                                    {/* Empty cells for start of month */}
                                    {Array.from({ length: getFirstDayOfMonth(currentYear, currentMonth) }).map((_, i) => (
                                        <div key={`empty-${i}`} />
                                    ))}

                                    {/* Days */}
                                    {Array.from({ length: getDaysInMonth(currentYear, currentMonth) }).map((_, i) => {
                                        const day = i + 1;
                                        const isSelected = value &&
                                            new Date(value).getDate() === day &&
                                            new Date(value).getMonth() === currentMonth &&
                                            new Date(value).getFullYear() === currentYear;

                                        return (
                                            <button
                                                key={day}
                                                type="button"
                                                onClick={() => {
                                                    handleDateClick(day);
                                                    close();
                                                }}
                                                className={`
                                                    h-8 w-8 rounded-lg text-sm flex items-center justify-center transition-colors
                                                    ${isSelected
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30'
                                                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'}
                                                `}
                                            >
                                                {day}
                                            </button>
                                        );
                                    })}
                                </div>
                            </Popover.Panel>
                        </Transition>
                    </>
                )}
            </Popover>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    );
};

/**
 * Back Button
 */
export const BackButton = ({ onClick, className = '', ...props }) => {
    const navigate = useNavigate();
    const handleClick = onClick || (() => navigate(-1));

    return (
        <button
            onClick={handleClick}
            className={`p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 transition-colors active:scale-95 ${className}`}
            {...props}
        >
            <ChevronLeftIcon className="w-6 h-6" />
        </button>
    );
};

export const PremiumLoading = ({
    fullScreen = false,
    text = "Loading...",
    className = ""
}) => {
    const containerClasses = fullScreen
        ? "fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
        : "flex flex-col items-center justify-center py-12";

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`${containerClasses} ${className}`}
        >
            <div className="relative">
                {/* Outer Ring */}
                <div className="w-16 h-16 rounded-full border-4 border-gray-100 dark:border-slate-800" />

                {/* Spinning Gradient Ring */}
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-blue-500 border-b-transparent border-l-transparent"
                />

                {/* Inner Pulse */}
                <motion.div
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 m-auto w-8 h-8 bg-blue-500/20 rounded-full blur-md"
                />
            </div>

            {text && (
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400 animate-pulse"
                >
                    {text}
                </motion.p>
            )}
        </motion.div>
    );
};

export default {
    BackButton,
    GlassCard,
    FeatureCard,
    StatCard,
    GradientButton,
    ActionButton,
    IconButton,
    SectionHeader,
    StatusBadge,
    PremiumInput,
    PremiumSelect,
    PremiumTextarea,
    Skeleton,
    SkeletonCard,
    LoadingSkeleton,
    EmptyState,
    Alert,
    Divider,
    Avatar,
    ProgressBar,
    Tooltip,
    PageTransition,
    AnimatedList,
    AnimatedListItem,
    PremiumLoading
};


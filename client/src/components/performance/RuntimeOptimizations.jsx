// Runtime Performance Optimization Components
// Advanced memoization and re-render optimization techniques

import React, {
    memo,
    useMemo,
    useCallback,
    useState,
    useEffect,
    useRef,
    createContext,
    useContext
} from 'react';
import PropTypes from 'prop-types';
import { combineClasses } from '../../utils/design-system';
import { useDebouncedValue, useThrottledCallback } from '../../hooks/usePerformance';

/**
 * Memoization Context for sharing expensive calculations
 */
const MemoizationContext = createContext({});

export const MemoizationProvider = ({ children }) => {
    const cache = useRef(new Map());

    const memoize = useCallback((key, computeFn, dependencies = []) => {
        const cacheKey = `${key}-${JSON.stringify(dependencies)}`;

        if (cache.current.has(cacheKey)) {
            return cache.current.get(cacheKey);
        }

        const result = computeFn();
        cache.current.set(cacheKey, result);

        // Clean up old cache entries (keep last 100)
        if (cache.current.size > 100) {
            const firstKey = cache.current.keys().next().value;
            cache.current.delete(firstKey);
        }

        return result;
    }, []);

    const clearCache = useCallback((pattern) => {
        if (pattern) {
            for (const key of cache.current.keys()) {
                if (key.includes(pattern)) {
                    cache.current.delete(key);
                }
            }
        } else {
            cache.current.clear();
        }
    }, []);

    const value = useMemo(() => ({
        memoize,
        clearCache,
        cacheSize: cache.current.size
    }), [memoize, clearCache]);

    return (
        <MemoizationContext.Provider value={value}>
            {children}
        </MemoizationContext.Provider>
    );
};

/**
 * Hook for using memoization context
 */
export const useMemoization = () => {
    const context = useContext(MemoizationContext);
    if (!context) {
        throw new Error('useMemoization must be used within MemoizationProvider');
    }
    return context;
};

/**
 * Optimized Search Component with debouncing and memoization
 */
export const OptimizedSearch = memo(({
    onSearch,
    placeholder = 'Search...',
    debounceMs = 300,
    minLength = 2,
    className = '',
    suggestions = [],
    onSuggestionSelect,
    ...props
}) => {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const inputRef = useRef(null);
    const { memoize } = useMemoization();

    const debouncedQuery = useDebouncedValue(query, debounceMs);

    // Memoized filtered suggestions
    const filteredSuggestions = useMemo(() => {
        if (!query || query.length < minLength) return [];

        return memoize(
            'search-suggestions',
            () => suggestions.filter(item =>
                item.toLowerCase().includes(query.toLowerCase())
            ).slice(0, 10),
            [query, suggestions]
        );
    }, [query, suggestions, minLength, memoize]);

    // Debounced search callback
    useEffect(() => {
        if (debouncedQuery && debouncedQuery.length >= minLength) {
            onSearch?.(debouncedQuery);
        }
    }, [debouncedQuery, onSearch, minLength]);

    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);
        setShowSuggestions(value.length >= minLength);
        setSelectedIndex(-1);
    }, [minLength]);

    const handleKeyDown = useCallback((e) => {
        if (!showSuggestions || filteredSuggestions.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev < filteredSuggestions.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev =>
                    prev > 0 ? prev - 1 : filteredSuggestions.length - 1
                );
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    const suggestion = filteredSuggestions[selectedIndex];
                    setQuery(suggestion);
                    setShowSuggestions(false);
                    onSuggestionSelect?.(suggestion);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                setSelectedIndex(-1);
                break;
        }
    }, [showSuggestions, filteredSuggestions, selectedIndex, onSuggestionSelect]);

    const handleSuggestionClick = useCallback((suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
        onSuggestionSelect?.(suggestion);
        inputRef.current?.focus();
    }, [onSuggestionSelect]);

    const handleBlur = useCallback(() => {
        // Delay hiding suggestions to allow click events
        setTimeout(() => setShowSuggestions(false), 150);
    }, []);

    return (
        <div className="relative">
            <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                onFocus={() => query.length >= minLength && setShowSuggestions(true)}
                onBlur={handleBlur}
                placeholder={placeholder}
                className={combineClasses(
                    'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent',
                    className
                )}
                {...props}
            />

            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredSuggestions.map((suggestion, index) => (
                        <button
                            key={suggestion}
                            type="button"
                            className={combineClasses(
                                'w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none',
                                index === selectedIndex ? 'bg-primary-50 text-primary-700' : ''
                            )}
                            onClick={() => handleSuggestionClick(suggestion)}
                        >
                            {suggestion}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
});

/**
 * Memoized Data Grid with virtual scrolling and optimized rendering
 */
export const MemoizedDataGrid = memo(({
    data = [],
    columns = [],
    rowHeight = 50,
    maxHeight = 400,
    onRowClick,
    onSort,
    sortColumn,
    sortDirection = 'asc',
    className = '',
    ...props
}) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef(null);
    const { memoize } = useMemoization();

    // Memoized sorted data
    const sortedData = useMemo(() => {
        if (!sortColumn) return data;

        return memoize(
            'sorted-data',
            () => [...data].sort((a, b) => {
                const aVal = a[sortColumn];
                const bVal = b[sortColumn];

                if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
                return 0;
            }),
            [data, sortColumn, sortDirection]
        );
    }, [data, sortColumn, sortDirection, memoize]);

    // Throttled scroll handler
    const handleScroll = useThrottledCallback((e) => {
        const scrollTop = e.target.scrollTop;
        const itemsPerPage = Math.ceil(maxHeight / rowHeight);
        const start = Math.floor(scrollTop / rowHeight);
        const end = Math.min(start + itemsPerPage + 5, sortedData.length);

        setVisibleRange({ start, end });
    }, 16); // 60fps

    // Memoized visible items
    const visibleItems = useMemo(() => {
        return sortedData.slice(visibleRange.start, visibleRange.end);
    }, [sortedData, visibleRange]);

    // Memoized row component
    const MemoizedRow = memo(({ item, index, columns, onRowClick }) => {
        const handleClick = useCallback(() => {
            onRowClick?.(item, index);
        }, [item, index, onRowClick]);

        return (
            <tr
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                onClick={handleClick}
                style={{ height: rowHeight }}
            >
                {columns.map((column) => (
                    <td key={column.key} className="px-4 py-2 border-b border-gray-200">
                        {column.render ? column.render(item[column.key], item) : item[column.key]}
                    </td>
                ))}
            </tr>
        );
    });

    const handleSort = useCallback((columnKey) => {
        const newDirection = sortColumn === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
        onSort?.(columnKey, newDirection);
    }, [sortColumn, sortDirection, onSort]);

    const totalHeight = sortedData.length * rowHeight;
    const offsetY = visibleRange.start * rowHeight;

    return (
        <div className={combineClasses('border border-gray-200 rounded-lg overflow-hidden', className)} {...props}>
            <table className="w-full">
                <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={combineClasses(
                                    'px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
                                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                                )}
                                onClick={column.sortable ? () => handleSort(column.key) : undefined}
                            >
                                <div className="flex items-center space-x-1">
                                    <span>{column.title}</span>
                                    {column.sortable && sortColumn === column.key && (
                                        <span className="text-primary-500">
                                            {sortDirection === 'asc' ? '↑' : '↓'}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
            </table>

            <div
                ref={containerRef}
                className="overflow-auto"
                style={{ height: maxHeight }}
                onScroll={handleScroll}
            >
                <div style={{ height: totalHeight, position: 'relative' }}>
                    <table className="w-full">
                        <tbody style={{ transform: `translateY(${offsetY}px)` }}>
                            {visibleItems.map((item, index) => (
                                <MemoizedRow
                                    key={item.id || visibleRange.start + index}
                                    item={item}
                                    index={visibleRange.start + index}
                                    columns={columns}
                                    onRowClick={onRowClick}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
});

/**
 * Optimized Form with memoized validation
 */
export const OptimizedForm = memo(({
    initialValues = {},
    validationRules = {},
    onSubmit,
    children,
    className = '',
    ...props
}) => {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const { memoize } = useMemoization();

    // Memoized validation function
    const validateField = useCallback((fieldName, value) => {
        const rules = validationRules[fieldName];
        if (!rules) return null;

        return memoize(
            `validation-${fieldName}`,
            () => {
                for (const rule of rules) {
                    const error = rule(value, values);
                    if (error) return error;
                }
                return null;
            },
            [value, values]
        );
    }, [validationRules, values, memoize]);

    // Debounced validation
    const debouncedValidation = useDebouncedValue(values, 300);

    useEffect(() => {
        const newErrors = {};
        Object.keys(debouncedValidation).forEach(fieldName => {
            if (touched[fieldName]) {
                const error = validateField(fieldName, debouncedValidation[fieldName]);
                if (error) newErrors[fieldName] = error;
            }
        });
        setErrors(newErrors);
    }, [debouncedValidation, touched, validateField]);

    const handleChange = useCallback((fieldName, value) => {
        setValues(prev => ({ ...prev, [fieldName]: value }));
    }, []);

    const handleBlur = useCallback((fieldName) => {
        setTouched(prev => ({ ...prev, [fieldName]: true }));
    }, []);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();

        // Validate all fields
        const allErrors = {};
        Object.keys(values).forEach(fieldName => {
            const error = validateField(fieldName, values[fieldName]);
            if (error) allErrors[fieldName] = error;
        });

        if (Object.keys(allErrors).length === 0) {
            onSubmit?.(values);
        } else {
            setErrors(allErrors);
            setTouched(Object.keys(values).reduce((acc, key) => ({ ...acc, [key]: true }), {}));
        }
    }, [values, validateField, onSubmit]);

    const formContext = useMemo(() => ({
        values,
        errors,
        touched,
        handleChange,
        handleBlur
    }), [values, errors, touched, handleChange, handleBlur]);

    return (
        <FormContext.Provider value={formContext}>
            <form
                onSubmit={handleSubmit}
                className={combineClasses('space-y-4', className)}
                {...props}
            >
                {children}
            </form>
        </FormContext.Provider>
    );
});

/**
 * Form Context for optimized form field rendering
 */
const FormContext = createContext({});

export const useFormContext = () => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error('useFormContext must be used within OptimizedForm');
    }
    return context;
};

/**
 * Memoized Form Field Component
 */
export const MemoizedFormField = memo(({
    name,
    type = 'text',
    label,
    placeholder,
    className = '',
    ...props
}) => {
    const { values, errors, touched, handleChange, handleBlur } = useFormContext();

    const value = values[name] || '';
    const error = errors[name];
    const isTouched = touched[name];

    const handleInputChange = useCallback((e) => {
        handleChange(name, e.target.value);
    }, [name, handleChange]);

    const handleInputBlur = useCallback(() => {
        handleBlur(name);
    }, [name, handleBlur]);

    const inputClasses = combineClasses(
        'w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors duration-200',
        error && isTouched ? 'border-red-500' : 'border-gray-300',
        className
    );

    return (
        <div className="space-y-1">
            {label && (
                <label htmlFor={name} className="block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                placeholder={placeholder}
                className={inputClasses}
                {...props}
            />
            {error && isTouched && (
                <p className="text-sm text-red-600">{error}</p>
            )}
        </div>
    );
});

/**
 * Optimized List with memoized items and virtual scrolling
 */
export const OptimizedList = memo(({
    items = [],
    renderItem,
    keyExtractor = (item, index) => item.id || index,
    itemHeight = 60,
    maxHeight = 400,
    onItemClick,
    className = '',
    ...props
}) => {
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const containerRef = useRef(null);

    // Throttled scroll handler
    const handleScroll = useThrottledCallback((e) => {
        const scrollTop = e.target.scrollTop;
        const itemsPerPage = Math.ceil(maxHeight / itemHeight);
        const start = Math.floor(scrollTop / itemHeight);
        const end = Math.min(start + itemsPerPage + 5, items.length);

        setVisibleRange({ start, end });
    }, 16);

    // Memoized list item component
    const MemoizedListItem = memo(({ item, index, onClick }) => {
        const handleClick = useCallback(() => {
            onClick?.(item, index);
        }, [item, index, onClick]);

        return (
            <div
                className="flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
                style={{ height: itemHeight }}
                onClick={handleClick}
            >
                {renderItem(item, index)}
            </div>
        );
    });

    const visibleItems = items.slice(visibleRange.start, visibleRange.end);
    const totalHeight = items.length * itemHeight;
    const offsetY = visibleRange.start * itemHeight;

    return (
        <div
            ref={containerRef}
            className={combineClasses('overflow-auto border border-gray-200 rounded-lg', className)}
            style={{ height: maxHeight }}
            onScroll={handleScroll}
            {...props}
        >
            <div style={{ height: totalHeight, position: 'relative' }}>
                <div style={{ transform: `translateY(${offsetY}px)` }}>
                    {visibleItems.map((item, index) => (
                        <MemoizedListItem
                            key={keyExtractor(item, visibleRange.start + index)}
                            item={item}
                            index={visibleRange.start + index}
                            onClick={onItemClick}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
});

// PropTypes
OptimizedSearch.propTypes = {
    onSearch: PropTypes.func,
    placeholder: PropTypes.string,
    debounceMs: PropTypes.number,
    minLength: PropTypes.number,
    className: PropTypes.string,
    suggestions: PropTypes.array,
    onSuggestionSelect: PropTypes.func
};

MemoizedDataGrid.propTypes = {
    data: PropTypes.array,
    columns: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        title: PropTypes.string.isRequired,
        sortable: PropTypes.bool,
        render: PropTypes.func
    })),
    rowHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    onRowClick: PropTypes.func,
    onSort: PropTypes.func,
    sortColumn: PropTypes.string,
    sortDirection: PropTypes.oneOf(['asc', 'desc']),
    className: PropTypes.string
};

OptimizedForm.propTypes = {
    initialValues: PropTypes.object,
    validationRules: PropTypes.object,
    onSubmit: PropTypes.func,
    children: PropTypes.node,
    className: PropTypes.string
};

MemoizedFormField.propTypes = {
    name: PropTypes.string.isRequired,
    type: PropTypes.string,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    className: PropTypes.string
};

OptimizedList.propTypes = {
    items: PropTypes.array,
    renderItem: PropTypes.func.isRequired,
    keyExtractor: PropTypes.func,
    itemHeight: PropTypes.number,
    maxHeight: PropTypes.number,
    onItemClick: PropTypes.func,
    className: PropTypes.string
};

export default {
    MemoizationProvider,
    OptimizedSearch,
    MemoizedDataGrid,
    OptimizedForm,
    MemoizedFormField,
    OptimizedList
};
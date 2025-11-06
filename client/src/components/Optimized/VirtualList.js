import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { throttle } from '../../utils/performance';

const VirtualList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  overscan = 5,
  className = '',
  onScroll = () => {},
  estimatedItemHeight = null,
  getItemHeight = null,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Use dynamic heights if provided
  const isDynamic = Boolean(getItemHeight);
  const heights = useRef(new Map());
  const positions = useRef(new Map());

  // Calculate item positions for dynamic heights
  const calculatePositions = useCallback(() => {
    if (!isDynamic) return;

    let offset = 0;
    for (let i = 0; i < items.length; i++) {
      positions.current.set(i, offset);
      const height = heights.current.get(i) || estimatedItemHeight || itemHeight;
      offset += height;
    }
  }, [items.length, isDynamic, estimatedItemHeight, itemHeight]);

  // Get item position
  const getItemPosition = useCallback((index) => {
    if (isDynamic) {
      return positions.current.get(index) || 0;
    }
    return index * itemHeight;
  }, [isDynamic, itemHeight]);

  // Get total height
  const getTotalHeight = useCallback(() => {
    if (isDynamic) {
      const lastIndex = items.length - 1;
      const lastPosition = positions.current.get(lastIndex) || 0;
      const lastHeight = heights.current.get(lastIndex) || estimatedItemHeight || itemHeight;
      return lastPosition + lastHeight;
    }
    return items.length * itemHeight;
  }, [items.length, isDynamic, estimatedItemHeight, itemHeight]);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    if (items.length === 0) {
      return { start: 0, end: 0 };
    }

    let start = 0;
    let end = items.length - 1;

    if (isDynamic) {
      // Binary search for start index
      let low = 0;
      let high = items.length - 1;
      
      while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const position = getItemPosition(mid);
        
        if (position < scrollTop) {
          low = mid + 1;
        } else {
          high = mid - 1;
        }
      }
      
      start = Math.max(0, high);
      
      // Find end index
      let currentPosition = getItemPosition(start);
      end = start;
      
      while (end < items.length && currentPosition < scrollTop + containerHeight) {
        const height = heights.current.get(end) || estimatedItemHeight || itemHeight;
        currentPosition += height;
        end++;
      }
      
      end = Math.min(items.length - 1, end);
    } else {
      start = Math.floor(scrollTop / itemHeight);
      end = Math.min(
        items.length - 1,
        Math.ceil((scrollTop + containerHeight) / itemHeight)
      );
    }

    // Add overscan
    start = Math.max(0, start - overscan);
    end = Math.min(items.length - 1, end + overscan);

    return { start, end };
  }, [scrollTop, containerHeight, items.length, itemHeight, overscan, isDynamic, getItemPosition, estimatedItemHeight]);

  // Handle scroll
  const handleScroll = useCallback(
    throttle((event) => {
      const newScrollTop = event.target.scrollTop;
      setScrollTop(newScrollTop);
      setIsScrolling(true);
      onScroll(event);

      // Clear existing timeout
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      // Set scrolling to false after scroll ends
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }, 16), // ~60fps
    [onScroll]
  );

  // Update item height for dynamic lists
  const updateItemHeight = useCallback((index, height) => {
    if (!isDynamic) return;

    const currentHeight = heights.current.get(index);
    if (currentHeight !== height) {
      heights.current.set(index, height);
      calculatePositions();
    }
  }, [isDynamic, calculatePositions]);

  // Calculate positions when items change
  useEffect(() => {
    if (isDynamic) {
      calculatePositions();
    }
  }, [calculatePositions]);

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let i = visibleRange.start; i <= visibleRange.end; i++) {
      if (i >= items.length) break;
      
      const item = items[i];
      const top = getItemPosition(i);
      const height = isDynamic 
        ? (heights.current.get(i) || estimatedItemHeight || itemHeight)
        : itemHeight;

      items_to_render.push({
        index: i,
        item,
        top,
        height
      });
    }
    
    return items_to_render;
  }, [visibleRange, items, getItemPosition, isDynamic, estimatedItemHeight, itemHeight]);

  // Item wrapper component for dynamic heights
  const ItemWrapper = ({ index, item, top, height, children }) => {
    const itemRef = useRef(null);

    useEffect(() => {
      if (isDynamic && itemRef.current) {
        const measuredHeight = itemRef.current.offsetHeight;
        updateItemHeight(index, measuredHeight);
      }
    }, [index, item]);

    return (
      <div
        ref={itemRef}
        style={{
          position: 'absolute',
          top,
          left: 0,
          right: 0,
          height: isDynamic ? 'auto' : height,
          minHeight: isDynamic ? height : undefined
        }}
      >
        {children}
      </div>
    );
  };

  const totalHeight = getTotalHeight();

  return (
    <div
      ref={containerRef}
      className={`virtual-list ${className}`}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ index, item, top, height }) => (
          <ItemWrapper
            key={index}
            index={index}
            item={item}
            top={top}
            height={height}
          >
            {renderItem({
              item,
              index,
              isScrolling,
              style: {
                height: isDynamic ? 'auto' : height,
                minHeight: isDynamic ? height : undefined
              }
            })}
          </ItemWrapper>
        ))}
      </div>
    </div>
  );
};

// Grid virtual list for 2D virtualization
export const VirtualGrid = ({
  items = [],
  itemWidth = 200,
  itemHeight = 200,
  containerWidth = 800,
  containerHeight = 600,
  renderItem,
  gap = 10,
  overscan = 2,
  className = '',
  onScroll = () => {},
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const containerRef = useRef(null);
  const scrollTimeoutRef = useRef(null);

  // Calculate grid dimensions
  const columnsPerRow = Math.floor((containerWidth + gap) / (itemWidth + gap));
  const totalRows = Math.ceil(items.length / columnsPerRow);
  const totalHeight = totalRows * (itemHeight + gap) - gap;

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startRow = Math.floor(scrollTop / (itemHeight + gap));
    const endRow = Math.min(
      totalRows - 1,
      Math.ceil((scrollTop + containerHeight) / (itemHeight + gap))
    );

    // Add overscan
    const startRowWithOverscan = Math.max(0, startRow - overscan);
    const endRowWithOverscan = Math.min(totalRows - 1, endRow + overscan);

    return {
      startRow: startRowWithOverscan,
      endRow: endRowWithOverscan
    };
  }, [scrollTop, containerHeight, itemHeight, gap, totalRows, overscan]);

  // Handle scroll
  const handleScroll = useCallback(
    throttle((event) => {
      const newScrollTop = event.target.scrollTop;
      const newScrollLeft = event.target.scrollLeft;
      
      setScrollTop(newScrollTop);
      setScrollLeft(newScrollLeft);
      setIsScrolling(true);
      onScroll(event);

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    }, 16),
    [onScroll]
  );

  // Render visible items
  const visibleItems = useMemo(() => {
    const items_to_render = [];
    
    for (let row = visibleRange.startRow; row <= visibleRange.endRow; row++) {
      for (let col = 0; col < columnsPerRow; col++) {
        const index = row * columnsPerRow + col;
        
        if (index >= items.length) break;
        
        const item = items[index];
        const left = col * (itemWidth + gap);
        const top = row * (itemHeight + gap);

        items_to_render.push({
          index,
          item,
          left,
          top,
          row,
          col
        });
      }
    }
    
    return items_to_render;
  }, [visibleRange, items, columnsPerRow, itemWidth, itemHeight, gap]);

  return (
    <div
      ref={containerRef}
      className={`virtual-grid ${className}`}
      style={{
        width: containerWidth,
        height: containerHeight,
        overflow: 'auto',
        position: 'relative'
      }}
      onScroll={handleScroll}
      {...props}
    >
      {/* Total height spacer */}
      <div style={{ height: totalHeight, position: 'relative' }}>
        {/* Visible items */}
        {visibleItems.map(({ index, item, left, top, row, col }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              left,
              top,
              width: itemWidth,
              height: itemHeight
            }}
          >
            {renderItem({
              item,
              index,
              row,
              col,
              isScrolling,
              style: {
                width: itemWidth,
                height: itemHeight
              }
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

// Infinite scroll virtual list
export const InfiniteVirtualList = ({
  items = [],
  itemHeight = 50,
  containerHeight = 400,
  renderItem,
  hasNextPage = false,
  isNextPageLoading = false,
  loadNextPage = () => {},
  loadingComponent = null,
  threshold = 5,
  ...props
}) => {
  const [scrollTop, setScrollTop] = useState(0);
  const loadingTriggered = useRef(false);

  // Handle scroll and trigger loading
  const handleScroll = useCallback((event) => {
    const { scrollTop: newScrollTop, scrollHeight, clientHeight } = event.target;
    setScrollTop(newScrollTop);

    // Check if we're near the bottom
    const distanceFromBottom = scrollHeight - (newScrollTop + clientHeight);
    const shouldLoadMore = distanceFromBottom < threshold * itemHeight;

    if (shouldLoadMore && hasNextPage && !isNextPageLoading && !loadingTriggered.current) {
      loadingTriggered.current = true;
      loadNextPage();
    }
  }, [hasNextPage, isNextPageLoading, loadNextPage, threshold, itemHeight]);

  // Reset loading trigger when loading completes
  useEffect(() => {
    if (!isNextPageLoading) {
      loadingTriggered.current = false;
    }
  }, [isNextPageLoading]);

  // Render items with loading indicator
  const renderItemWithLoading = useCallback((itemProps) => {
    const { index } = itemProps;
    
    // Show loading component for the last few items when loading
    if (isNextPageLoading && index >= items.length - 3) {
      return loadingComponent || (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          height: itemHeight 
        }}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
        </div>
      );
    }
    
    return renderItem(itemProps);
  }, [renderItem, isNextPageLoading, items.length, loadingComponent, itemHeight]);

  return (
    <VirtualList
      items={items}
      itemHeight={itemHeight}
      containerHeight={containerHeight}
      renderItem={renderItemWithLoading}
      onScroll={handleScroll}
      {...props}
    />
  );
};

export default VirtualList;
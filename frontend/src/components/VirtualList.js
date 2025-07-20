import React, { useState, useEffect, useRef, useCallback } from "react";
import PropTypes from "prop-types";
import { Box } from "@mui/material";
import { styled } from "@mui/material/styles";

const VirtualListContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  overflow: "auto",
  willChange: "transform",
  direction: "ltr",
  height: "100%",
}));

const VirtualListContent = styled(Box)(({ height }) => ({
  height,
  width: "100%",
  position: "relative",
}));

const VirtualListItems = styled(Box)(() => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
}));

/**
 * VirtualList Component
 *
 * Renders only the visible items in a large list for performance
 *
 * @param {Object} props - Component props
 * @param {Array} props.items - Array of items to render
 * @param {Function} props.renderItem - Function to render each item
 * @param {number} props.itemHeight - Height of each item in pixels
 * @param {number} props.height - Height of the list container
 * @param {number} props.width - Width of the list container
 * @param {number} props.overscanCount - Number of items to render outside of view
 * @param {Function} props.onScroll - Callback when list is scrolled
 * @param {string} props.className - Additional CSS class name
 */
const VirtualList = ({
  items = [],
  renderItem,
  itemHeight = 50,
  height = 400,
  width = "100%",
  overscanCount = 3,
  onScroll,
  className,
}) => {
  // Refs
  const containerRef = useRef(null);

  // State
  const [scrollTop, setScrollTop] = useState(0);
  const [visibleItems, setVisibleItems] = useState([]);

  // Calculate total height
  const totalHeight = items.length * itemHeight;

  // Calculate visible range
  const calculateVisibleRange = useCallback(() => {
    if (!containerRef.current) return;

    const currentScrollTop = containerRef.current.scrollTop;

    // Calculate start and end indices
    const startIndex = Math.max(
      0,
      Math.floor(currentScrollTop / itemHeight) - overscanCount
    );
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((currentScrollTop + height) / itemHeight) + overscanCount
    );

    // Create visible items array
    const visibleItemsArray = [];

    for (let i = startIndex; i <= endIndex; i++) {
      visibleItemsArray.push({
        index: i,
        item: items[i],
        offsetTop: i * itemHeight,
      });
    }

    setVisibleItems(visibleItemsArray);
  }, [items, itemHeight, height, overscanCount]);

  // Handle scroll event
  const handleScroll = useCallback(
    (event) => {
      const currentScrollTop = event.target.scrollTop;

      // Update scroll position
      setScrollTop(currentScrollTop);

      // Calculate visible range
      calculateVisibleRange();

      // Call onScroll callback if provided
      if (onScroll) {
        onScroll(event);
      }
    },
    [calculateVisibleRange, onScroll]
  );

  // Initialize visible items
  useEffect(() => {
    calculateVisibleRange();
  }, [calculateVisibleRange, items]);

  return (
    <VirtualListContainer
      ref={containerRef}
      onScroll={handleScroll}
      height={height}
      width={width}
      className={className}
      sx={{ height, width }}
    >
      <VirtualListContent height={totalHeight}>
        {visibleItems.map(({ index, item, offsetTop }) => (
          <VirtualListItems
            key={index}
            style={{
              transform: `translateY(${offsetTop}px)`,
              height: itemHeight,
            }}
          >
            {renderItem({ item, index })}
          </VirtualListItems>
        ))}
      </VirtualListContent>
    </VirtualListContainer>
  );
};

VirtualList.propTypes = {
  items: PropTypes.array.isRequired,
  renderItem: PropTypes.func.isRequired,
  itemHeight: PropTypes.number,
  height: PropTypes.number,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  overscanCount: PropTypes.number,
  onScroll: PropTypes.func,
  className: PropTypes.string,
};

export default VirtualList;

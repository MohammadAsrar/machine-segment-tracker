import React from 'react';
import { calculateSegmentWidth, calculateSegmentPosition } from '../utils/timeUtils';

const TimelineBar = ({ segments, machineName }) => {
  // Sort segments by start time
  const sortedSegments = [...segments].sort((a, b) => {
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    return 0;
  });

  // Get color for segment type
  const getSegmentColor = segmentType => {
    switch (segmentType.toLowerCase()) {
      case 'uptime':
        return 'bg-green-500';
      case 'idle':
        return 'bg-yellow-400';
      case 'downtime':
        return 'bg-red-500';
      case 'select':
      default:
        return 'bg-gray-300';
    }
  };

  // Calculate the total timeline duration (24 hours in minutes)
  const totalMinutes = 24 * 60;

  return (
    <div className="flex h-4 w-full rounded-full overflow-hidden bg-gray-200 relative">
      {sortedSegments.map((segment, index) => {
        // Calculate segment width based on duration
        const width = calculateSegmentWidth(segment.startTime, segment.endTime, totalMinutes);

        // Calculate segment position
        const position = calculateSegmentPosition(segment.startTime, '00:00:00', totalMinutes);

        return (
          <div
            key={`${machineName}-${index}`}
            className={`${getSegmentColor(segment.segmentType)} absolute`}
            style={{
              width: `${width}%`,
              left: `${position}%`,
              height: '100%',
            }}
          />
        );
      })}
    </div>
  );
};

export default TimelineBar;

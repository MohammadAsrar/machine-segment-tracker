import React from 'react';
import TimelineBar from './TimelineBar';
import { calculateDowntimeAnalytics, groupSegmentsByMachine } from '../utils/timeUtils';

const MachineTimeline = ({ segments }) => {
  // Group segments by machine name
  const machineSegments = groupSegmentsByMachine(segments);

  // Get unique machine names and sort them
  const machineNames = Object.keys(machineSegments).sort();

  // Create a list of default machine names (M1-M7)
  const defaultMachines = Array.from({ length: 7 }, (_, i) => `M${i + 1}`);

  // Combine actual and default machines, removing duplicates
  const allMachines = [...new Set([...machineNames, ...defaultMachines])].sort();

  return (
    <div className="space-y-6 overflow-y-auto custom-scroll flex-grow">
      <table className="min-w-full">
        <thead>
          <tr>
            <th className="w-40 text-left font-medium text-gray-900 p-2">Machine Name</th>
            <th className="text-left font-medium text-gray-900 p-2">Downtime Analytics</th>
          </tr>
        </thead>
        <tbody>
          {allMachines.map(machineName => {
            const machineData = machineSegments[machineName] || [];

            // Filter out segments with 'select' type for analytics calculation
            const activeSegments = machineData.filter(
              segment => segment.segmentType && segment.segmentType !== 'select'
            );

            // Check if any segments have 'select' type
            const hasSelectSegments = machineData.some(segment => segment.segmentType === 'select');

            // Only calculate analytics if there are active segments and no 'select' segments
            const analytics =
              activeSegments.length > 0 && !hasSelectSegments
                ? calculateDowntimeAnalytics(activeSegments)
                : { unplannedDowntime: '00:00:00', plannedDeviated: '00:00:00' };

            return (
              <tr key={machineName} className="border-t border-gray-200">
                <td className="p-4 align-top">
                  <div className="flex-shrink-0 w-16 text-sm font-medium text-gray-900 mt-2">
                    {machineName}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex-grow">
                    <TimelineBar segments={machineData} machineName={machineName} />
                    <p className="text-xs text-gray-600 mt-1">
                      Unplanned downtime duration: {analytics.unplannedDowntime}, Planned deviated
                      duration: {analytics.plannedDeviated}
                    </p>
                  </div>
                </td>
                <td className="w-10 p-4">
                  <button className="flex-shrink-0 text-gray-500 hover:text-gray-700 focus:outline-none mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MachineTimeline;

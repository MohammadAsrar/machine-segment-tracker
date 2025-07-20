import React from 'react';
import { formatDateForDisplay } from '../utils/timeUtils';

const FormTable = ({ rows, onSave, onSegmentTypeChange }) => {
  const segmentOptions = [
    { value: 'select', label: 'Select Segment' },
    { value: 'idle', label: 'Idle' },
    { value: 'uptime', label: 'Uptime' },
    { value: 'downtime', label: 'Downtime' },
  ];

  // Helper function to get the appropriate icon for segment type
  const getSegmentTypeIcon = segmentType => {
    switch (segmentType) {
      case 'idle':
        return (
          <span className="px-1 py-0.5 bg-yellow-400 rounded-sm text-xs text-white">Idle</span>
        );
      case 'uptime':
        return (
          <span className="px-1 py-0.5 bg-green-500 rounded-sm text-xs text-white">Uptime</span>
        );
      case 'downtime':
        return (
          <span className="px-1 py-0.5 bg-red-500 rounded-sm text-xs text-white">Downtime</span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="overflow-x-auto overflow-y-auto custom-scroll flex-grow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Start time
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              End time
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Machine Name
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Segment type
            </th>
            <th
              scope="col"
              className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Save
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map(row => (
            <tr key={row.id}>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                {formatDateForDisplay(row.date)}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{row.startTime}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{row.endTime}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                {row.machineName}
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center">
                  {row.segmentType !== 'select' && getSegmentTypeIcon(row.segmentType)}
                  <select
                    className="block w-full py-1 px-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ml-2"
                    value={row.segmentType}
                    onChange={e => onSegmentTypeChange(row.id, e.target.value)}
                  >
                    {segmentOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                <div className="flex items-center space-x-2">
                  <button
                    className="text-gray-500 hover:text-gray-700 focus:outline-none text-xs px-2 py-1 border rounded"
                    onClick={() => onSave(row)}
                  >
                    Save
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default FormTable;

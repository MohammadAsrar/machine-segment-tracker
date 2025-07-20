import './App.css';
import FormTable from './components/FormTable';
import MachineTimeline from './components/MachineTimeline';
import useSegments from './hooks/useSegments';
import logo from './assets/patternlab-real-logo.png';

import { MdLogout } from 'react-icons/md';

// Import CSS for custom scrollbar.
import './styles/customScrollbar.css';

function App() {
  const { segments, formRows, isLoading, error, handleSegmentTypeChange, handleSave } =
    useSegments();

  return (
    <div className="bg-gray-100 font-sans antialiased text-gray-800 min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="PatternLab AI Logo" className="h-8 cursor-pointer" title="Home" />
        </div>
        <div>
          <MdLogout className="h-6 w-6 text-gray-600 cursor-pointer" title="Logout" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6 md:p-8 flex-grow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex flex-col lg:flex-row lg:space-x-8 space-y-8 lg:space-y-0">
          {/* Form Section */}
          <div className="lg:w-1/2 bg-white rounded-lg shadow-md p-6 flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-700">Form</h2>
              {isLoading && <span className="text-blue-500">Loading...</span>}
            </div>

            <FormTable
              rows={formRows}
              onSave={handleSave}
              onSegmentTypeChange={handleSegmentTypeChange}
            />
          </div>

          {/* Timeline Section */}
          <div className="lg:w-1/2 bg-white rounded-lg shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-semibold text-gray-700 mb-2">Machine Timeline</h2>
            <h3 className="text-lg font-medium text-gray-600 mb-4">Downtime Analytics</h3>

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <span className="text-blue-500">Loading timeline data...</span>
              </div>
            ) : (
              <MachineTimeline segments={segments} />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 px-6 shadow-inner">
        <div className="container mx-auto">
          <p className="text-center text-sm text-gray-600">Machine Segment Tracker v1.0</p>
        </div>
      </footer>
    </div>
  );
}

export default App;

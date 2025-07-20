// jest-dom adds custom jest matchers for asserting on DOM nodes
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// More info: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the window.matchMedia function for tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock the IntersectionObserver API
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// Mock the ResizeObserver API
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'ResizeObserver', {
  writable: true,
  value: MockResizeObserver,
});

// Suppress React 18 console errors/warnings specific to tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = (...args) => {
  if (
    /Warning.*not wrapped in act/i.test(args[0]) ||
    /Warning.*ReactDOM.render is no longer supported/i.test(args[0])
  ) {
    return;
  }
  originalConsoleError(...args);
};

console.warn = (...args) => {
  if (/Warning.*not wrapped in act/i.test(args[0])) {
    return;
  }
  originalConsoleWarn(...args);
};

// Global afterEach to clean up any mounted components
afterEach(() => {
  // Clean up any timers
  jest.clearAllMocks();
  jest.clearAllTimers();
}); 
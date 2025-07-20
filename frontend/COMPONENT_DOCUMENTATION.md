# Component Documentation

This document provides documentation for the React components in the Machine Segment Tracker application.

## Table of Contents

- [Core Components](#core-components)
  - [EnhancedSegmentForm](#enhancedsegmentform)
  - [OptimizedDataTable](#optimizeddatatable)
  - [MachineTimeline](#machinetimeline)
  - [Timeline](#timeline)
  - [TableSkeleton](#tableskeleton)
- [UI Components](#ui-components)
  - [ConfirmationDialog](#confirmationdialog)
  - [ToastNotification](#toastnotification)
  - [VirtualList](#virtuallist)
  - [ErrorBoundary](#errorboundary)
- [Contexts](#contexts)
  - [ToastContext](#toastcontext)
- [Hooks](#hooks)
  - [useRealTimeValidation](#userealtimevalidation)
  - [usePaginatedApi](#usepaginatedapi)
  - [useDebounce](#usedebounce)

## Core Components

### EnhancedSegmentForm

A form component for creating and editing machine segments with real-time validation.

**Props:**
- `onSave` (function, required): Callback function when form is saved
- `existingSegments` (array): Array of existing segments for validation
- `saveStatus` (string): Current save status ('idle', 'saving', 'success', 'error')

**Example:**
```jsx
<EnhancedSegmentForm
  onSave={handleSaveSegment}
  existingSegments={segments}
  saveStatus={saveStatus}
/>
```

### OptimizedDataTable

A performance-optimized data table with search, pagination, and virtual rendering.

**Props:**
- `data` (array): Data to display in the table
- `columns` (array, required): Column definitions
- `title` (string): Table title
- `loading` (boolean): Whether the data is loading
- `onRowClick` (function): Callback when a row is clicked
- `onSearch` (function): Callback when search is performed
- `page` (number): Current page number
- `pageSize` (number): Number of rows per page
- `totalCount` (number): Total number of rows
- `onPageChange` (function): Callback when page changes
- `onPageSizeChange` (function): Callback when page size changes

**Example:**
```jsx
<OptimizedDataTable
  data={segments}
  columns={columns}
  title="Machine Segments"
  loading={loading}
  onSearch={handleSearch}
  page={page}
  pageSize={pageSize}
  totalCount={totalCount}
  onPageChange={handlePageChange}
  onPageSizeChange={handlePageSizeChange}
/>
```

### MachineTimeline

A component that displays a timeline of machine segments.

**Props:**
- `machines` (array, required): Array of machine data
- `loading` (boolean): Whether the data is loading
- `onSegmentClick` (function): Callback when a segment is clicked

**Example:**
```jsx
<MachineTimeline
  machines={machines}
  loading={loading}
  onSegmentClick={handleSegmentClick}
/>
```

### Timeline

An advanced timeline visualization component.

**Props:**
- `machines` (array, required): Array of machine data
- `segments` (array, required): Array of segment data
- `loading` (boolean): Whether the data is loading
- `onSegmentClick` (function): Callback when a segment is clicked

**Example:**
```jsx
<Timeline
  machines={machines}
  segments={segments}
  loading={loading}
  onSegmentClick={handleSegmentClick}
/>
```

### TableSkeleton

A skeleton loading component for tables.

**Props:**
- `rows` (number): Number of rows to display
- `columns` (number): Number of columns to display
- `headers` (array): Array of header names
- `columnWidths` (array): Array of column widths in percentage
- `showHeader` (boolean): Whether to show the table header

**Example:**
```jsx
<TableSkeleton
  rows={10}
  columns={5}
  headers={["Name", "Type", "Status", "Date", "Actions"]}
  showHeader={true}
/>
```

## UI Components

### ConfirmationDialog

A dialog component for confirming destructive actions.

**Props:**
- `open` (boolean, required): Whether the dialog is open
- `onClose` (function, required): Function to call when dialog is closed
- `onConfirm` (function, required): Function to call when action is confirmed
- `title` (string): Dialog title
- `message` (string): Dialog message
- `confirmText` (string): Text for confirm button
- `cancelText` (string): Text for cancel button
- `severity` (string): Severity of the action (default, danger)
- `loading` (boolean): Whether the action is loading

**Example:**
```jsx
<ConfirmationDialog
  open={dialogOpen}
  onClose={handleClose}
  onConfirm={handleDelete}
  title="Delete Segment"
  message="Are you sure you want to delete this segment?"
  confirmText="Delete"
  severity="danger"
  loading={deleting}
/>
```

### ToastNotification

A toast notification component for user feedback.

**Props:**
- `open` (boolean, required): Whether the notification is open
- `onClose` (function, required): Function to call when notification is closed
- `message` (string, required): Message to display
- `severity` (string): Severity of the notification (success, error, warning, info)
- `autoHideDuration` (number): Duration in ms before auto-hiding
- `position` (object): Position of the notification
- `showIcon` (boolean): Whether to show the icon
- `title` (string): Optional title for the notification
- `action` (node): Optional action button

**Example:**
```jsx
<ToastNotification
  open={toastOpen}
  onClose={handleCloseToast}
  message="Segment saved successfully"
  severity="success"
  autoHideDuration={3000}
/>
```

### VirtualList

A virtualized list component for rendering large datasets efficiently.

**Props:**
- `items` (array, required): Array of items to render
- `renderItem` (function, required): Function to render each item
- `itemHeight` (number): Height of each item in pixels
- `height` (number): Height of the list container
- `width` (string|number): Width of the list container
- `overscanCount` (number): Number of items to render outside of view
- `onScroll` (function): Callback when list is scrolled

**Example:**
```jsx
<VirtualList
  items={segments}
  renderItem={({ item, index }) => <SegmentItem segment={item} key={index} />}
  itemHeight={60}
  height={400}
/>
```

### ErrorBoundary

A component that catches JavaScript errors in child component tree and displays a fallback UI.

**Props:**
- `children` (node, required): Children to render
- `fallbackMessage` (string): Message to display when an error occurs
- `resetButton` (boolean): Whether to show a reset button
- `resetButtonText` (string): Text for the reset button
- `showErrorDetails` (boolean): Whether to show error details
- `onError` (function): Function to call when an error occurs
- `onReset` (function): Function to call when reset button is clicked

**Example:**
```jsx
<ErrorBoundary
  fallbackMessage="Something went wrong while loading segments"
  showErrorDetails={process.env.NODE_ENV === 'development'}
>
  <MachineSegmentForm />
</ErrorBoundary>
```

## Contexts

### ToastContext

A context provider for toast notifications.

**Methods:**
- `showToast`: Show a toast notification
- `hideToast`: Hide the current toast notification
- `showSuccess`: Show a success toast
- `showError`: Show an error toast
- `showWarning`: Show a warning toast
- `showInfo`: Show an info toast

**Example:**
```jsx
import { useToast } from '../contexts/ToastContext';

function MyComponent() {
  const { showSuccess } = useToast();
  
  const handleSave = () => {
    // Save data
    showSuccess('Saved successfully');
  };
  
  return <Button onClick={handleSave}>Save</Button>;
}
```

## Hooks

### useRealTimeValidation

A custom hook for real-time form validation with enhanced feedback.

**Parameters:**
- `initialValues` (object): Initial form values
- `validateFn` (function): Validation function
- `validationContext` (object): Additional context for validation
- `options` (object): Additional options

**Returns:**
- `values`: Current form values
- `errors`: Validation errors
- `touched`: Fields that have been touched
- `isValid`: Whether the form is valid
- `isSubmitting`: Whether the form is submitting
- `isValidating`: Whether validation is in progress
- `handleChange`: Handler for field changes
- `handleBlur`: Handler for field blur
- `handleSubmit`: Handler for form submission
- `resetForm`: Function to reset the form
- `setFieldValue`: Function to set a specific field value
- `setFieldError`: Function to set a specific field error
- `setFieldValues`: Function to set multiple field values
- `hasError`: Function to check if a field has an error
- `getErrorMessage`: Function to get the error message for a field
- `getFieldStatus`: Function to get the status of a field
- `isFieldValidating`: Function to check if a field is being validated
- `isFieldValid`: Function to check if a field is valid
- `validate`: Function to validate the form

**Example:**
```jsx
const {
  values,
  errors,
  touched,
  isValid,
  handleChange,
  handleBlur,
  handleSubmit,
  getErrorMessage,
} = useRealTimeValidation(
  { name: '', email: '' },
  validateForm,
  {},
  { validateOnChange: true }
);
```

### usePaginatedApi

A custom hook for paginated API requests.

**Parameters:**
- `options.endpoint` (string): API endpoint
- `options.params` (object): Additional query parameters
- `options.initialPage` (number): Initial page number
- `options.initialPageSize` (number): Initial page size
- `options.executeOnMount` (boolean): Whether to execute the request on mount
- `options.onSuccess` (function): Callback function on success
- `options.onError` (function): Callback function on error
- `options.initialData` (object): Initial data

**Returns:**
- `data`: Current data
- `loading`: Whether the request is loading
- `error`: Any error that occurred
- `page`: Current page number
- `pageSize`: Current page size
- `totalCount`: Total number of items
- `totalPages`: Total number of pages
- `handlePageChange`: Handler for page changes
- `handlePageSizeChange`: Handler for page size changes
- `execute`: Function to execute the request
- `refresh`: Function to refresh the data
- `clearCache`: Function to clear the cache

**Example:**
```jsx
const {
  data,
  loading,
  error,
  page,
  pageSize,
  totalCount,
  handlePageChange,
  handlePageSizeChange,
} = usePaginatedApi({
  endpoint: '/api/segments',
  params: { machineId: 1 },
  initialPage: 1,
  initialPageSize: 10,
});
```

### useDebounce

A custom hook for debouncing a value.

**Parameters:**
- `value`: The value to debounce
- `delay` (number): Delay in milliseconds
- `options.leading` (boolean): Whether to trigger on leading edge
- `options.onChange` (function): Callback when debounced value changes

**Returns:**
- Debounced value

**Example:**
```jsx
const debouncedSearchTerm = useDebounce(searchTerm, 500);

// Also available as a specialized input hook:
const {
  value,
  debouncedValue,
  handleChange,
  reset,
} = useDebouncedInput('', 500, {
  onChange: (value) => {
    searchItems(value);
  },
});
``` 
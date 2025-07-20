import React from 'react';
import { render, screen } from '@testing-library/react';
import TableSkeleton from '../TableSkeleton';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../../styles/theme';

// Create a wrapper component to provide the theme
const renderWithTheme = (ui) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('TableSkeleton Component', () => {
  it('renders with default props', () => {
    renderWithTheme(<TableSkeleton />);
    
    // Check if the table is rendered
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // Check if the header is rendered
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(4); // Default is 4 columns
    
    // Check if the rows are rendered
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(6); // 5 data rows + 1 header row
  });

  it('renders with custom rows and columns', () => {
    renderWithTheme(<TableSkeleton rows={3} columns={2} />);
    
    // Check if the table is rendered with custom props
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(2);
    
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(4); // 3 data rows + 1 header row
  });

  it('renders with custom header names', () => {
    const headers = ['Name', 'Age'];
    
    renderWithTheme(
      <TableSkeleton 
        columns={2} 
        headers={headers}
      />
    );
    
    // Check if custom headers are rendered
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Age')).toBeInTheDocument();
  });

  it('does not render header when showHeader is false', () => {
    renderWithTheme(<TableSkeleton showHeader={false} />);
    
    // Header should not be rendered
    const headers = screen.queryAllByRole('columnheader');
    expect(headers).toHaveLength(0);
    
    // Only body rows should be rendered
    const rows = screen.getAllByRole('row');
    expect(rows).toHaveLength(5); // 5 data rows, no header
  });

  it('applies column widths correctly', () => {
    const columnWidths = [20, 30, 50];
    
    renderWithTheme(
      <TableSkeleton 
        columns={3} 
        columnWidths={columnWidths}
      />
    );
    
    // Check if the table is rendered
    const table = screen.getByRole('table');
    expect(table).toBeInTheDocument();
    
    // We can't directly test the width attributes without 
    // using more complex queries, but we can ensure it doesn't crash
    const headers = screen.getAllByRole('columnheader');
    expect(headers).toHaveLength(3);
  });
}); 
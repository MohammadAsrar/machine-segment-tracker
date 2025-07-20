import React, { useState, useMemo, useCallback, memo } from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Chip,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import designSystem from "../styles/designSystem";
import TableSkeleton from "./TableSkeleton";
import { useDebouncedInput } from "../hooks/useDebounce";

// Styled components
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  marginBottom: theme.spacing(3),
  borderRadius: designSystem.components.card.borderRadius,
  boxShadow: designSystem.shadows.sm,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: theme.spacing(1.5),
}));

const StyledHeaderCell = styled(TableCell)(({ theme }) => ({
  backgroundColor: designSystem.colors.ui.background.paper,
  fontWeight: designSystem.typography.fontWeight.medium,
  padding: theme.spacing(1.5),
}));

const TableToolbar = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: theme.spacing(2),
}));

const SearchField = styled(TextField)(({ theme }) => ({
  width: "100%",
  maxWidth: "300px",
  marginRight: theme.spacing(2),
  "& .MuiOutlinedInput-root": {
    borderRadius: designSystem.components.input.borderRadius,
  },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
}));

// Memoized row component for better performance
const MemoizedTableRow = memo(({ row, columns, onRowClick }) => {
  const handleClick = useCallback(() => {
    if (onRowClick) {
      onRowClick(row);
    }
  }, [onRowClick, row]);

  return (
    <TableRow
      hover
      onClick={handleClick}
      sx={{ cursor: onRowClick ? "pointer" : "default" }}
    >
      {columns.map((column) => {
        const value = row[column.field];
        return (
          <StyledTableCell key={column.field} align={column.align || "left"}>
            {column.renderCell ? column.renderCell(row) : value}
          </StyledTableCell>
        );
      })}
    </TableRow>
  );
});

MemoizedTableRow.displayName = "MemoizedTableRow";

/**
 * OptimizedDataTable Component
 *
 * Performance-optimized data table with search, pagination, and virtual rendering
 *
 * @param {Object} props - Component props
 * @param {Array} props.data - Data to display in the table
 * @param {Array} props.columns - Column definitions
 * @param {string} props.title - Table title
 * @param {boolean} props.loading - Whether the data is loading
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {Function} props.onSearch - Callback when search is performed
 * @param {number} props.page - Current page number
 * @param {number} props.pageSize - Number of rows per page
 * @param {number} props.totalCount - Total number of rows
 * @param {Function} props.onPageChange - Callback when page changes
 * @param {Function} props.onPageSizeChange - Callback when page size changes
 */
const OptimizedDataTable = ({
  data = [],
  columns = [],
  title,
  loading = false,
  onRowClick,
  onSearch,
  page = 0,
  pageSize = 10,
  totalCount = 0,
  onPageChange,
  onPageSizeChange,
}) => {
  // Search state with debounce
  const {
    value: searchValue,
    debouncedValue: debouncedSearchValue,
    handleChange: handleSearchChange,
    reset: resetSearch,
  } = useDebouncedInput("", 300, {
    onChange: (value) => {
      if (onSearch) {
        onSearch(value);
      }
    },
  });

  // Handle page change
  const handlePageChange = useCallback(
    (event, newPage) => {
      if (onPageChange) {
        onPageChange(newPage);
      }
    },
    [onPageChange]
  );

  // Handle rows per page change
  const handleRowsPerPageChange = useCallback(
    (event) => {
      const newPageSize = parseInt(event.target.value, 10);
      if (onPageSizeChange) {
        onPageSizeChange(newPageSize);
      }
    },
    [onPageSizeChange]
  );

  // Clear search
  const handleClearSearch = useCallback(() => {
    resetSearch();
    if (onSearch) {
      onSearch("");
    }
  }, [resetSearch, onSearch]);

  // Memoize table headers to prevent re-renders
  const tableHeaders = useMemo(
    () => (
      <TableRow>
        {columns.map((column) => (
          <StyledHeaderCell
            key={column.field}
            align={column.align || "left"}
            width={column.width}
          >
            {column.headerName}
          </StyledHeaderCell>
        ))}
      </TableRow>
    ),
    [columns]
  );

  // Render empty state
  const renderEmptyState = () => (
    <EmptyStateContainer>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        No data found
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {searchValue
          ? "Try adjusting your search criteria"
          : "Add some data to get started"}
      </Typography>
    </EmptyStateContainer>
  );

  return (
    <Paper sx={{ width: "100%", overflow: "hidden" }}>
      {/* Table toolbar with search */}
      <TableToolbar>
        {title && (
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        )}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <SearchField
            size="small"
            placeholder="Search..."
            value={searchValue}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchValue ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    aria-label="clear search"
                    onClick={handleClearSearch}
                    edge="end"
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
          />

          {debouncedSearchValue && (
            <Chip
              label={`Search: "${debouncedSearchValue}"`}
              size="small"
              onDelete={handleClearSearch}
              sx={{ ml: 1 }}
            />
          )}
        </Box>
      </TableToolbar>

      {/* Table */}
      <StyledTableContainer>
        {loading ? (
          <TableSkeleton
            rows={pageSize}
            columns={columns.length}
            headers={columns.map((col) => col.headerName)}
          />
        ) : (
          <Table size="small" aria-label="data table">
            <TableHead>{tableHeaders}</TableHead>
            <TableBody>
              {data.length > 0 ? (
                data.map((row, index) => (
                  <MemoizedTableRow
                    key={row.id || index}
                    row={row}
                    columns={columns}
                    onRowClick={onRowClick}
                  />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length}>
                    {renderEmptyState()}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </StyledTableContainer>

      {/* Pagination */}
      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={totalCount}
        rowsPerPage={pageSize}
        page={page}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Paper>
  );
};

OptimizedDataTable.propTypes = {
  data: PropTypes.array,
  columns: PropTypes.array.isRequired,
  title: PropTypes.string,
  loading: PropTypes.bool,
  onRowClick: PropTypes.func,
  onSearch: PropTypes.func,
  page: PropTypes.number,
  pageSize: PropTypes.number,
  totalCount: PropTypes.number,
  onPageChange: PropTypes.func,
  onPageSizeChange: PropTypes.func,
};

export default memo(OptimizedDataTable);

import React, { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  TextField,
  Select,
  MenuItem,
  Checkbox,
  IconButton,
  Toolbar,
  Typography,
  Tooltip,
  FormControl,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Chip,
  FormHelperText,
} from "@mui/material";
import { styled, alpha } from "@mui/material/styles";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  FilterList as FilterListIcon,
  Search as SearchIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import designSystem from "../styles/designSystem";
import {
  isValidTimeFormat,
  isEndTimeAfterStartTime,
  hasOverlappingSegments,
  validateSegmentForm,
  formatDateString,
  formatTimeString,
} from "../utils/validation";

// Styled components
const DataTableContainer = styled(Paper)(({ theme }) => ({
  width: "100%",
  marginBottom: theme.spacing(2),
  overflow: "hidden",
  borderRadius: designSystem.components.card.borderRadius,
  boxShadow: designSystem.shadows.sm,
}));

const TableToolbarRoot = styled(Toolbar)(({ theme, numSelected }) => ({
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(1),
  ...(numSelected > 0 && {
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
  }),
}));

const TableToolbarTitle = styled(Typography)(({ theme }) => ({
  flex: "1 1 100%",
  fontWeight: designSystem.typography.fontWeight.medium,
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  flexWrap: "wrap",
}));

const SearchField = styled(FormControl)(({ theme }) => ({
  width: "250px",
  marginRight: theme.spacing(1),
}));

const FilterSelect = styled(FormControl)(({ theme }) => ({
  minWidth: "150px",
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  padding: "8px 16px",
}));

const StyledTableRow = styled(TableRow)(({ theme, status, isSelected }) => {
  let backgroundColor = "transparent";
  let hoverColor = designSystem.colors.ui.background.hover;

  if (isSelected) {
    backgroundColor = alpha(designSystem.colors.ui.primary, 0.08);
    hoverColor = alpha(designSystem.colors.ui.primary, 0.12);
  } else if (status) {
    switch (status.toLowerCase()) {
      case "uptime":
        backgroundColor = alpha(designSystem.colors.status.uptime, 0.05);
        hoverColor = alpha(designSystem.colors.status.uptime, 0.1);
        break;
      case "idle":
        backgroundColor = alpha(designSystem.colors.status.idle, 0.05);
        hoverColor = alpha(designSystem.colors.status.idle, 0.1);
        break;
      case "downtime":
        backgroundColor = alpha(designSystem.colors.status.downtime, 0.05);
        hoverColor = alpha(designSystem.colors.status.downtime, 0.1);
        break;
      default:
        break;
    }
  }

  return {
    backgroundColor,
    "&:hover": {
      backgroundColor: hoverColor,
    },
    "&.Mui-selected, &.Mui-selected:hover": {
      backgroundColor: isSelected ? backgroundColor : "transparent",
    },
  };
});

const EditableCell = styled(Box)(({ theme, isEditing }) => ({
  display: "flex",
  alignItems: "center",
  padding: isEditing ? 0 : "8px 0",
  minHeight: "40px",
  cursor: isEditing ? "default" : "pointer",
  width: "100%",
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  let color;
  switch (status?.toLowerCase()) {
    case "uptime":
      color = designSystem.colors.status.uptime;
      break;
    case "idle":
      color = designSystem.colors.status.idle;
      break;
    case "downtime":
      color = designSystem.colors.status.downtime;
      break;
    default:
      color = theme.palette.grey[500];
  }

  return {
    backgroundColor: alpha(color, 0.1),
    color: color,
    fontWeight: designSystem.typography.fontWeight.medium,
    fontSize: "0.75rem",
    height: "24px",
  };
});

// Helper functions
const descendingComparator = (a, b, orderBy) => {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
};

const getComparator = (order, orderBy) => {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
};

const stableSort = (array, comparator) => {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
};

/**
 * DataTable Component
 *
 * A sophisticated data table with inline editing, sorting, filtering, and more
 *
 * @param {Object} props - Component props
 */
const DataTable = ({
  data = [],
  onSave,
  onDelete,
  onBulkUpdate,
  title = "Data Table",
}) => {
  // State
  const [rows, setRows] = useState([]);
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("date");
  const [selected, setSelected] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    machine: "",
    segmentType: "",
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);
  const [bulkAction, setBulkAction] = useState("");
  const [confirmBulkOpen, setConfirmBulkOpen] = useState(false);

  // Initialize rows from data
  useEffect(() => {
    setRows(
      data.map((row) => ({
        ...row,
        id: row.id || `row-${Math.random().toString(36).substr(2, 9)}`,
        isModified: false,
      }))
    );
  }, [data]);

  // Segment type options
  const segmentTypes = ["Uptime", "Idle", "Downtime"];

  // Get unique machine names for filter
  const machineNames = useMemo(() => {
    const names = [...new Set(rows.map((row) => row.machineName))];
    return names.filter(Boolean).sort();
  }, [rows]);

  // Handle sorting
  const handleRequestSort = (property) => {
    const isAsc =
      orderBy === "date"
        ? order === "asc"
        : orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  // Handle row selection
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = filteredRows.map((n) => n.id);
      setSelected(newSelected);
      return;
    }
    setSelected([]);
  };

  const handleSelectRow = (id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = [...selected, id];
    } else if (selectedIndex === 0) {
      newSelected = [...selected.slice(1)];
    } else if (selectedIndex === selected.length - 1) {
      newSelected = [...selected.slice(0, -1)];
    } else if (selectedIndex > 0) {
      newSelected = [
        ...selected.slice(0, selectedIndex),
        ...selected.slice(selectedIndex + 1),
      ];
    }

    setSelected(newSelected);
  };

  // Handle cell edit
  const handleEditStart = (row) => {
    if (editingId !== null) return;
    setEditingId(row.id);
    setEditingData({ ...row });
    setValidationErrors({});
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditingData({});
    setValidationErrors({});
  };

  const handleEditChange = (field, value) => {
    const updatedData = {
      ...editingData,
      [field]: value,
      isModified: true,
    };

    setEditingData(updatedData);

    // Validate the updated data
    const { errors } = validateSegmentForm(
      updatedData,
      rows.filter((row) => row.id !== editingId)
    );
    setValidationErrors(errors || {});
  };

  const handleEditSave = () => {
    // Validate the form
    const { isValid, errors } = validateSegmentForm(
      editingData,
      rows.filter((row) => row.id !== editingId)
    );

    if (!isValid) {
      setValidationErrors(errors);
      return;
    }

    const updatedRows = rows.map((row) =>
      row.id === editingId ? { ...editingData } : row
    );

    setRows(updatedRows);
    setEditingId(null);
    setEditingData({});
    setValidationErrors({});

    if (onSave && editingData.isModified) {
      onSave(editingData);
    }
  };

  // Handle row deletion
  const handleDeleteClick = (row) => {
    setRowToDelete(row);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!rowToDelete) return;

    const updatedRows = rows.filter((row) => row.id !== rowToDelete.id);
    setRows(updatedRows);

    if (onDelete) {
      onDelete(rowToDelete);
    }

    setConfirmDeleteOpen(false);
    setRowToDelete(null);
  };

  // Handle bulk actions
  const handleBulkActionChange = (event) => {
    setBulkAction(event.target.value);
  };

  const handleBulkActionApply = () => {
    if (!bulkAction || selected.length === 0) return;
    setConfirmBulkOpen(true);
  };

  const handleConfirmBulkAction = () => {
    if (!bulkAction || selected.length === 0) return;

    const updatedRows = rows.map((row) => {
      if (selected.includes(row.id)) {
        return {
          ...row,
          segmentType: bulkAction,
          isModified: true,
        };
      }
      return row;
    });

    setRows(updatedRows);

    if (onBulkUpdate) {
      const selectedRows = updatedRows.filter((row) =>
        selected.includes(row.id)
      );
      onBulkUpdate(selectedRows, bulkAction);
    }

    setSelected([]);
    setBulkAction("");
    setConfirmBulkOpen(false);
  };

  // Handle filtering
  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Apply filters and sorting
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesSearch =
        !filters.search ||
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(filters.search.toLowerCase())
        );

      const matchesMachine =
        !filters.machine || row.machineName === filters.machine;

      const matchesSegmentType =
        !filters.segmentType ||
        (row.segmentType &&
          row.segmentType.toLowerCase() === filters.segmentType.toLowerCase());

      return matchesSearch && matchesMachine && matchesSegmentType;
    });
  }, [rows, filters]);

  const sortedRows = useMemo(() => {
    return stableSort(filteredRows, getComparator(order, orderBy));
  }, [filteredRows, order, orderBy]);

  // Check if a row is selected
  const isSelected = (id) => selected.indexOf(id) !== -1;

  // Check if a field has validation error
  const hasError = (field) => Boolean(validationErrors[field]);

  // Get error message for a field
  const getErrorMessage = (field) => validationErrors[field] || "";

  // Table toolbar component
  const TableToolbar = () => (
    <TableToolbarRoot numSelected={selected.length}>
      {selected.length > 0 ? (
        <TableToolbarTitle variant="subtitle1">
          {selected.length} selected
        </TableToolbarTitle>
      ) : (
        <TableToolbarTitle variant="h6">{title}</TableToolbarTitle>
      )}

      {selected.length > 0 && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Bulk Action</InputLabel>
            <Select
              value={bulkAction}
              onChange={handleBulkActionChange}
              label="Bulk Action"
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {segmentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            size="small"
            disabled={!bulkAction}
            onClick={handleBulkActionApply}
          >
            Apply
          </Button>
        </Box>
      )}
    </TableToolbarRoot>
  );

  // Filter component
  const FilterBar = () => (
    <FilterContainer>
      <SearchField variant="outlined" size="small">
        <InputLabel htmlFor="search-field">Search</InputLabel>
        <OutlinedInput
          id="search-field"
          value={filters.search}
          onChange={(e) => handleFilterChange("search", e.target.value)}
          startAdornment={
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          }
          label="Search"
        />
      </SearchField>

      <FilterSelect variant="outlined" size="small">
        <InputLabel>Machine</InputLabel>
        <Select
          value={filters.machine}
          onChange={(e) => handleFilterChange("machine", e.target.value)}
          label="Machine"
        >
          <MenuItem value="">
            <em>All Machines</em>
          </MenuItem>
          {machineNames.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>

      <FilterSelect variant="outlined" size="small">
        <InputLabel>Segment Type</InputLabel>
        <Select
          value={filters.segmentType}
          onChange={(e) => handleFilterChange("segmentType", e.target.value)}
          label="Segment Type"
        >
          <MenuItem value="">
            <em>All Types</em>
          </MenuItem>
          {segmentTypes.map((type) => (
            <MenuItem key={type} value={type}>
              {type}
            </MenuItem>
          ))}
        </Select>
      </FilterSelect>

      {(filters.search || filters.machine || filters.segmentType) && (
        <Button
          variant="outlined"
          size="small"
          onClick={() =>
            setFilters({ search: "", machine: "", segmentType: "" })
          }
        >
          Clear Filters
        </Button>
      )}
    </FilterContainer>
  );

  // Render editable cell content
  const renderCellContent = (row, field) => {
    const isEditing = editingId === row.id;
    const value = isEditing ? editingData[field] : row[field];
    const error = validationErrors[field];

    if (!isEditing) {
      if (field === "segmentType") {
        return (
          <StatusChip label={value || "Not Set"} status={value} size="small" />
        );
      }
      return value || "-";
    }

    switch (field) {
      case "date":
        return (
          <TextField
            value={value || ""}
            onChange={(e) => handleEditChange(field, e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            type="date"
            InputLabelProps={{ shrink: true }}
            error={hasError(field)}
            helperText={getErrorMessage(field)}
          />
        );
      case "startTime":
      case "endTime":
        return (
          <TextField
            value={value || ""}
            onChange={(e) => handleEditChange(field, e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            placeholder="HH:MM:SS"
            error={hasError(field)}
            helperText={getErrorMessage(field)}
          />
        );
      case "machineName":
        return (
          <TextField
            value={value || ""}
            onChange={(e) => handleEditChange(field, e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            error={hasError(field)}
            helperText={getErrorMessage(field)}
          />
        );
      case "segmentType":
        return (
          <FormControl fullWidth size="small" error={hasError(field)}>
            <Select
              value={value || ""}
              onChange={(e) => handleEditChange(field, e.target.value)}
              variant="outlined"
              size="small"
              fullWidth
            >
              <MenuItem value="">
                <em>Select Type</em>
              </MenuItem>
              {segmentTypes.map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
            {hasError(field) && (
              <FormHelperText>{getErrorMessage(field)}</FormHelperText>
            )}
          </FormControl>
        );
      default:
        return (
          <TextField
            value={value || ""}
            onChange={(e) => handleEditChange(field, e.target.value)}
            variant="outlined"
            size="small"
            fullWidth
            error={hasError(field)}
            helperText={getErrorMessage(field)}
          />
        );
    }
  };

  return (
    <DataTableContainer>
      {validationErrors.general && (
        <Box sx={{ p: 2, pb: 0 }}>
          <Typography color="error" variant="body2">
            {validationErrors.general}
          </Typography>
        </Box>
      )}

      <TableToolbar />
      <FilterBar />

      <TableContainer>
        <Table size="medium" aria-label="data table">
          <TableHead>
            <TableRow>
              <StyledTableCell padding="checkbox">
                <Checkbox
                  indeterminate={
                    selected.length > 0 && selected.length < filteredRows.length
                  }
                  checked={
                    filteredRows.length > 0 &&
                    selected.length === filteredRows.length
                  }
                  onChange={handleSelectAllClick}
                />
              </StyledTableCell>

              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "date"}
                  direction={orderBy === "date" ? order : "asc"}
                  onClick={() => handleRequestSort("date")}
                >
                  Date
                </TableSortLabel>
              </StyledTableCell>

              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "startTime"}
                  direction={orderBy === "startTime" ? order : "asc"}
                  onClick={() => handleRequestSort("startTime")}
                >
                  Start Time
                </TableSortLabel>
              </StyledTableCell>

              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "endTime"}
                  direction={orderBy === "endTime" ? order : "asc"}
                  onClick={() => handleRequestSort("endTime")}
                >
                  End Time
                </TableSortLabel>
              </StyledTableCell>

              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "machineName"}
                  direction={orderBy === "machineName" ? order : "asc"}
                  onClick={() => handleRequestSort("machineName")}
                >
                  Machine Name
                </TableSortLabel>
              </StyledTableCell>

              <StyledTableCell>
                <TableSortLabel
                  active={orderBy === "segmentType"}
                  direction={orderBy === "segmentType" ? order : "asc"}
                  onClick={() => handleRequestSort("segmentType")}
                >
                  Segment Type
                </TableSortLabel>
              </StyledTableCell>

              <StyledTableCell align="right">Actions</StyledTableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedRows.map((row) => {
              const isItemSelected = isSelected(row.id);
              const isItemEditing = editingId === row.id;

              return (
                <StyledTableRow
                  hover
                  key={row.id}
                  selected={isItemSelected}
                  status={row.segmentType}
                  isSelected={isItemSelected}
                >
                  <StyledTableCell padding="checkbox">
                    <Checkbox
                      checked={isItemSelected}
                      onClick={() => handleSelectRow(row.id)}
                      disabled={isItemEditing}
                    />
                  </StyledTableCell>

                  <StyledTableCell>
                    <EditableCell
                      isEditing={isItemEditing}
                      onClick={() => !isItemEditing && handleEditStart(row)}
                    >
                      {renderCellContent(row, "date")}
                    </EditableCell>
                  </StyledTableCell>

                  <StyledTableCell>
                    <EditableCell
                      isEditing={isItemEditing}
                      onClick={() => !isItemEditing && handleEditStart(row)}
                    >
                      {renderCellContent(row, "startTime")}
                    </EditableCell>
                  </StyledTableCell>

                  <StyledTableCell>
                    <EditableCell
                      isEditing={isItemEditing}
                      onClick={() => !isItemEditing && handleEditStart(row)}
                    >
                      {renderCellContent(row, "endTime")}
                    </EditableCell>
                  </StyledTableCell>

                  <StyledTableCell>
                    <EditableCell
                      isEditing={isItemEditing}
                      onClick={() => !isItemEditing && handleEditStart(row)}
                    >
                      {renderCellContent(row, "machineName")}
                    </EditableCell>
                  </StyledTableCell>

                  <StyledTableCell>
                    <EditableCell
                      isEditing={isItemEditing}
                      onClick={() => !isItemEditing && handleEditStart(row)}
                    >
                      {renderCellContent(row, "segmentType")}
                    </EditableCell>
                  </StyledTableCell>

                  <StyledTableCell align="right">
                    {isItemEditing ? (
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Save">
                          <IconButton
                            size="small"
                            onClick={handleEditSave}
                            disabled={Object.keys(validationErrors).length > 0}
                          >
                            <SaveIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <IconButton size="small" onClick={handleEditCancel}>
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    ) : (
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => handleEditStart(row)}
                            disabled={editingId !== null}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(row)}
                            disabled={editingId !== null}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    )}
                  </StyledTableCell>
                </StyledTableRow>
              );
            })}

            {sortedRows.length === 0 && (
              <TableRow>
                <StyledTableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography variant="body1" color="textSecondary">
                    No data available
                  </Typography>
                </StyledTableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Delete confirmation dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this row? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk action confirmation dialog */}
      <Dialog open={confirmBulkOpen} onClose={() => setConfirmBulkOpen(false)}>
        <DialogTitle>Confirm Bulk Update</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to set {selected.length} rows to "{bulkAction}
            "?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmBulkOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmBulkAction} color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>
    </DataTableContainer>
  );
};

DataTable.propTypes = {
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
  onBulkUpdate: PropTypes.func,
  title: PropTypes.string,
};

export default DataTable;

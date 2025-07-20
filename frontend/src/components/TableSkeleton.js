import React from "react";
import PropTypes from "prop-types";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import designSystem from "../styles/designSystem";

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

/**
 * TableSkeleton Component
 *
 * Displays a loading skeleton for tables
 *
 * @param {Object} props - Component props
 * @param {number} props.rows - Number of rows to display
 * @param {number} props.columns - Number of columns to display
 * @param {Array} props.headers - Array of header names
 * @param {Array} props.columnWidths - Array of column widths in percentage
 * @param {boolean} props.showHeader - Whether to show the table header
 */
const TableSkeleton = ({
  rows = 5,
  columns = 4,
  headers = [],
  columnWidths = [],
  showHeader = true,
}) => {
  // Generate header cells
  const headerCells = showHeader
    ? Array.from({ length: columns }).map((_, index) => (
        <StyledHeaderCell
          key={`header-${index}`}
          width={columnWidths[index] ? `${columnWidths[index]}%` : "auto"}
        >
          {headers[index] ? (
            headers[index]
          ) : (
            <Skeleton animation="wave" height={24} width="80%" />
          )}
        </StyledHeaderCell>
      ))
    : null;

  // Generate skeleton rows
  const skeletonRows = Array.from({ length: rows }).map((_, rowIndex) => (
    <TableRow key={`row-${rowIndex}`}>
      {Array.from({ length: columns }).map((_, colIndex) => {
        // Vary the width of skeletons to make it look more natural
        const widthPercent =
          colIndex === 0 ? 60 : Math.floor(Math.random() * 40) + 40;

        return (
          <StyledTableCell
            key={`cell-${rowIndex}-${colIndex}`}
            width={
              columnWidths[colIndex] ? `${columnWidths[colIndex]}%` : "auto"
            }
          >
            <Skeleton
              animation="wave"
              height={24}
              width={`${widthPercent}%`}
              sx={{
                opacity: 1 - rowIndex * 0.1, // Fade out lower rows slightly
                backgroundColor: (theme) => theme.palette.grey[100],
              }}
            />
          </StyledTableCell>
        );
      })}
    </TableRow>
  ));

  return (
    <StyledTableContainer component={Paper}>
      <Box sx={{ position: "relative" }}>
        <Table size="small" aria-label="loading table">
          {showHeader && (
            <TableHead>
              <TableRow>{headerCells}</TableRow>
            </TableHead>
          )}
          <TableBody>{skeletonRows}</TableBody>
        </Table>

        {/* Shimmer effect overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
            animation: "shimmer 2s infinite",
            "@keyframes shimmer": {
              "0%": {
                transform: "translateX(-100%)",
              },
              "100%": {
                transform: "translateX(100%)",
              },
            },
          }}
        />
      </Box>
    </StyledTableContainer>
  );
};

TableSkeleton.propTypes = {
  rows: PropTypes.number,
  columns: PropTypes.number,
  headers: PropTypes.array,
  columnWidths: PropTypes.array,
  showHeader: PropTypes.bool,
};

export default TableSkeleton;

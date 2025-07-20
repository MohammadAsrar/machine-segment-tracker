import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  CircularProgress,
} from "@mui/material";
import { machineApi } from "../services/api";

const MachineList = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMachines();
  }, []);

  const fetchMachines = async () => {
    try {
      setLoading(true);
      const response = await machineApi.getAll();
      setMachines(response.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch machines. Please try again later.");
      console.error("Error fetching machines:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this machine?")) {
      try {
        await machineApi.delete(id);
        setMachines(machines.filter((machine) => machine._id !== id));
      } catch (err) {
        setError("Failed to delete machine. Please try again later.");
        console.error("Error deleting machine:", err);
      }
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ mt: 4 }}>
        <Typography color="error">{error}</Typography>
        <Button variant="contained" onClick={fetchMachines} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Machines
      </Typography>

      {machines.length === 0 ? (
        <Typography>
          No machines found. Add a new machine to get started.
        </Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Serial Number</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Segments</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {machines.map((machine) => (
                <TableRow key={machine._id}>
                  <TableCell>{machine.name}</TableCell>
                  <TableCell>{machine.serialNumber}</TableCell>
                  <TableCell>{machine.type}</TableCell>
                  <TableCell>{machine.status}</TableCell>
                  <TableCell>
                    {machine.segments ? machine.segments.length : 0}
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" sx={{ mr: 1 }}>
                      View
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      onClick={() => handleDelete(machine._id)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Button variant="contained" color="primary" sx={{ mt: 2 }}>
        Add New Machine
      </Button>
    </Box>
  );
};

export default MachineList;

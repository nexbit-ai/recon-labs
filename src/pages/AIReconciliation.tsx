import React, { useState } from 'react';
import { Box, Typography, Paper, Button, TextField, Grid, List, ListItem, ListItemText, Divider, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { Add as AddIcon, CloudUpload as CloudUploadIcon } from '@mui/icons-material';

const AIReconciliation: React.FC = () => {
  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');

  const handleAddSource = () => {
    if (newSource.trim()) {
      setSources([...sources, newSource.trim()]);
      setNewSource('');
    }
  };

  const reconciliationEntries = [
    { id: 1, date: '2024-03-15', description: 'Bank Statement', amount: 1500.00, status: 'Matched' },
    { id: 2, date: '2024-03-14', description: 'ERP Entry', amount: 1500.00, status: 'Matched' },
    { id: 3, date: '2024-03-13', description: 'Excel Import', amount: 2000.00, status: 'Pending' },
  ];

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>AI Reconciliation Dashboard</Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add Ingestion Source</Typography>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <TextField
              fullWidth
              label="Source Name"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddSource}
            >
              Add Source
            </Button>
          </Box>
        </Box>
        <List>
          {sources.map((source, index) => (
            <ListItem key={index}>
              <ListItemText primary={source} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Reconciliation Entries</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {reconciliationEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell>${entry.amount.toFixed(2)}</TableCell>
                  <TableCell>{entry.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AIReconciliation; 
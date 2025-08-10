import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Tabs, Tab, Table, TableHead, TableRow, TableCell, TableBody, TableContainer, Button, Checkbox, Snackbar, Typography, Chip, IconButton, Menu, MenuItem } from '@mui/material';
import { CalendarToday as CalendarTodayIcon, KeyboardArrowDown as KeyboardArrowDownIcon, StorefrontOutlined as StorefrontIcon } from '@mui/icons-material';

const DisputePage: React.FC = () => {
  const [disputeSubTab, setDisputeSubTab] = useState<number>(0); // 0: open, 1: raised
  const [rows, setRows] = useState<Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }>>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  useEffect(() => {
    if (rows.length === 0) {
      const remarks = ['Short Amount Received', 'Excess Amount Received', 'Pending Settlement'];
      const list: Array<{ id: string; orderItemId: string; orderDate: string; difference: number; remark: string; eventType: string; status: 'open' | 'raised'; }> = [];
      for (let i = 0; i < 12; i++) {
        list.push({
          id: `DISP_${1000 + i}`,
          orderItemId: `FK${12345 + i}`,
          orderDate: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
          difference: (i % 2 === 0 ? 1 : -1) * (500 + i * 25),
          remark: remarks[i % remarks.length],
          eventType: i % 3 === 0 ? 'Return' : 'Sale',
          status: i % 3 === 0 ? 'raised' : 'open',
        });
      }
      setRows(list);
    }
  }, []);

  const current = rows.filter(r => (disputeSubTab === 0 ? r.status === 'open' : r.status === 'raised'));
  const allSelected = current.length > 0 && current.every(r => selectedIds.includes(r.id));
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(prev => prev.filter(id => !current.some(r => r.id === id)));
    else setSelectedIds(prev => Array.from(new Set([...prev, ...current.map(r => r.id)])));
  };
  const toggleRow = (id: string) => setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  const sendToFlipkart = () => {
    if (selectedIds.length === 0) return;
    setSnackbarOpen(true);
    setRows(prev => prev.map(r => (selectedIds.includes(r.id) ? { ...r, status: 'raised' } : r)));
    setSelectedIds([]);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Tabs value={disputeSubTab} onChange={(_, v) => setDisputeSubTab(v)} sx={{ '& .MuiTab-root': { textTransform: 'none', minHeight: 32 } }}>
              <Tab label="Open Disputed" />
              <Tab label="Dispute Raised" />
            </Tabs>
            {/* Right controls: month + platform + send button */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<CalendarTodayIcon />}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' }
                }}
              >
                Month
              </Button>
              <Button
                variant="outlined"
                endIcon={<KeyboardArrowDownIcon />}
                startIcon={<StorefrontIcon />}
                sx={{
                  borderColor: '#6B7280', color: '#6B7280', textTransform: 'none',
                  minWidth: 'auto', minHeight: 36, px: 1.5, fontSize: '0.7875rem', '&:hover': { borderColor: '#4B5563', backgroundColor: 'rgba(107,114,128,0.04)' }
                }}
              >
                Flipkart
              </Button>
              <Button variant="contained" onClick={sendToFlipkart} disabled={selectedIds.length === 0} sx={{ backgroundColor: '#1f2937', '&:hover': { backgroundColor: '#374151' }, textTransform: 'none', fontWeight: 600 }}>
                Send to Flipkart ({selectedIds.length})
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent sx={{ p: 0 }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox" />
                  <TableCell>Order Item ID</TableCell>
                  <TableCell>Order Value</TableCell>
                  <TableCell>Settlement Value</TableCell>
                  <TableCell>Order Date</TableCell>
                  <TableCell>Settlement Date</TableCell>
                  <TableCell>Difference</TableCell>
                  <TableCell>Remark</TableCell>
                  <TableCell>Event Type</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {current.map(row => (
                  <TableRow key={row.id} hover>
                    <TableCell padding="checkbox">
                      {row.status === 'open' ? (
                        <Box onClick={() => toggleRow(row.id)} sx={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #1f2937', background: selectedIds.includes(row.id) ? '#1f2937' : 'transparent', cursor: 'pointer' }} />
                      ) : null}
                    </TableCell>
                    <TableCell>{row.orderItemId}</TableCell>
                    <TableCell>₹{(Math.abs(row.difference) + 1000).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>₹{(Math.abs(row.difference) + 900).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{row.orderDate}</TableCell>
                    <TableCell>-</TableCell>
                    <TableCell>₹{Math.abs(row.difference).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                    <TableCell>{row.remark}</TableCell>
                    <TableCell>{row.eventType}</TableCell>
                  </TableRow>
                ))}
                {current.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: '#6b7280' }}>No transactions</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar open={snackbarOpen} autoHideDuration={2500} onClose={() => setSnackbarOpen(false)} message="Sent selected disputes to Flipkart" />
    </Box>
  );
};

export default DisputePage;


import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  Alert
} from '@mui/material';
import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { useOrganization } from '../hooks/useOrganization';

import { adminAPI } from '../services/api/endpoints';

const getIngestionTable = (reportType: string): string => {
  const rt = (reportType || '').toLowerCase().trim();
  const tableMap: Record<string, string> = {
    unicommerce: 'd2c_bigcommerce_collections',
    growsimplee: 'd2c_grow_simple_collections',
    grow_simple: 'd2c_grow_simple_collections',
    blitz: 'd2c_grow_simple_collections',
    blitznow: 'd2c_grow_simple_collections',
    bluedart: 'd2c_bluedart_collections',
    delhivery: 'd2c_delhivery_collections',
    ecomexpress: 'd2c_ecom_express_collections',
    ecom_express: 'd2c_ecom_express_collections',
    shadowfax: 'd2c_shadowfax_collections',
    dtdc: 'd2c_dtdc_collections',
    shiprocket: 'd2c_shiprocket_collections',
    paytm: 'd2c_paytm_collections',
    payu: 'd2c_payu_collections',
    'pay u': 'd2c_payu_collections',
    gokwik: 'd2c_gokwik_collections',
    'go kwik': 'd2c_gokwik_collections',
    cashfree: 'd2c_cashfree_payments',
    cashfree_payments: 'd2c_cashfree_payments',
    'zippee-loginext': 'd2c_zippee_loginext_payments',
    'zippee-blaze': 'd2c_zippee_blaze_payments',
    ekart: 'd2c_ekart_payments',
    cred_sales: 'cred_sales',
    cred_settlement: 'cred_settlements',
    elastic_logistics: 'd2c_elastic_logistics_collections',
    amazon_sales: 'amazon_sales',
    amazon_settlement: 'amazon_settlement',
    flipkart_sales: 'flipkart_sales',
    flipkart_settlement: 'flipkart_settlement',
  };
  return tableMap[rt] || (rt ? `d2c_${rt}_collections` : 'd2c_collections');
};

const isPopulationFailed = (row: any): boolean => {
  if (!row) return false;
  return row.status === 'Failed' || (row.ingestionRows > 0 && row.reconUpsertRows === 0);
};

const getEffectiveStatus = (row: any): string => {
  if (!row) return 'Unknown';
  if (row.status === 'Failed') return 'Failed';
  if (row.ingestionRows > 0 && row.reconUpsertRows === 0) return 'Failed (0 Reconciled)';
  return row.status || 'Success';
};

const formatTimestamp = (raw: string | Date | undefined): string => {
  if (!raw) return '-';
  try {
    let str = String(raw).trim();
    // If backend serialized a local naive timestamp with trailing 'Z', strip it to prevent double timezone conversion
    if (str.endsWith('Z')) {
      str = str.slice(0, -1);
    }
    const d = new Date(str);
    if (isNaN(d.getTime())) return String(raw);
    return d.toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true
    });
  } catch {
    return String(raw);
  }
};

const AdminAnalytics = () => {
  const { organizationId } = useOrganization();
  const [filterOrgId, setFilterOrgId] = useState('all');
  const [reportType, setReportType] = useState('all');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedRow, setSelectedRow] = useState<any | null>(null);

  const [organizations, setOrganizations] = useState<any[]>([]);
  const [reportTypes, setReportTypes] = useState<string[]>([]);

  const PRODUCTION_ADMIN_ORG_ID = '7e708346-5f0d-4112-8b69-78cdab6cc1cc';
  const isLocal = import.meta.env.DEV || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

  useEffect(() => {
    fetchData();
  }, [filterOrgId, reportType]);

  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const response = await adminAPI.getOrganizations();
        setOrganizations(response?.data || []);
      } catch (err) {
        console.error('Failed to fetch organizations:', err);
      }
    };
    fetchOrgs();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      if (!filterOrgId) return;
      try {
        const response = await adminAPI.getReportTypes(filterOrgId);
        setReportTypes(response?.data || []);
        setReportType('all');
      } catch (err) {
        console.error('Failed to fetch report types:', err);
      }
    };
    fetchTypes();
  }, [filterOrgId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminAPI.getMetrics(reportType, filterOrgId);

      const responseData = Array.isArray(response) ? response : (response?.data && Array.isArray(response.data) ? response.data : []);

      if (responseData.length > 0) {
        const mappedData = responseData.map((item: any) => ({
          id: item.hitId || item.id,
          timestamp: item.timestamp,
          orgId: item.orgId,
          reportType: item.reportType,
          isAsync: item.isAsync,
          uploadTime: item.uploadTime,
          reconTime: item.reconTime,
          cacheTime: item.cacheTime,
          totalTime: item.totalTime,
          status: item.status,
          s3Time: item.s3Time,
          clickpostTime: item.clickpostTime,
          ingestionTime: item.ingestionTime,
          ingestionRows: item.ingestionRows,
          reconUpsertTime: item.reconUpsertTime,
          reconUpsertRows: item.reconUpsertRows,
          reconDiffTime: item.reconDiffTime,
          errorLog: item.errorLog
        }));
        setData(mappedData);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // Authorization check
  const hasAccess = organizationId && (isLocal || organizationId.includes(PRODUCTION_ADMIN_ORG_ID));

  if (!hasAccess) {
    return (
      <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 4, maxWidth: 500 }}>
          <Typography variant="h3" color="error" gutterBottom>
            Access Denied
          </Typography>
        </Paper>
      </Box>
    );
  }

  const averageTotal = data.reduce((acc, curr) => acc + curr.totalTime, 0) / (data.length || 1);
  const averageRecon = data.reduce((acc, curr) => acc + curr.reconTime, 0) / (data.length || 1);
  const successRate = (data.filter(d => d.status === 'Success').length / (data.length || 1)) * 100;

  return (
    <React.Fragment>
      <Box sx={{ p: { xs: 2, md: 4 }, background: '#f8fafc', minHeight: '100%', position: 'relative' }}>
        {loading && (
          <LinearProgress
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              zIndex: 10
            }}
          />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, mt: loading ? 1 : 0 }}>
          <Typography variant="h1" sx={{ color: '#111827' }}>
            Uploads Tracking Analytics
          </Typography>
          <Button
            variant="outlined"
            onClick={fetchData}
            disabled={loading}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </Button>
        </Box>

        {/* Filters */}
        <Paper sx={{ p: 3, mb: 4, borderRadius: 3, background: '#ffffff' }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={10}>
              <FormControl fullWidth>
                <InputLabel>Organization</InputLabel>
                <Select
                  value={filterOrgId}
                  label="Organization"
                  onChange={(e) => setFilterOrgId(e.target.value as string)}
                >
                  <MenuItem value="all">All Organizations</MenuItem>
                  <MenuItem value="4b17527a-8a53-4c76-a18e-c31acb3fa421">Schrute Farm Default (4b17527a-8a53-4c76-a18e-c31acb3fa421)</MenuItem>
                  {organizations.map((org) => (
                    <MenuItem key={org.id} value={org.id}>
                      {org.name} ({org.id})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={fetchData}
                sx={{ height: 56, background: '#111', color: '#fff', '&:hover': { background: '#333' } }}
              >
                Apply Filters
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Summary Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Avg Total Latency
              </Typography>
              <Typography variant="h2" color="primary">
                {averageTotal.toFixed(0)} ms
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Avg Recon Latency
              </Typography>
              <Typography variant="h2" color="warning.main">
                {averageRecon.toFixed(0)} ms
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600} textTransform="uppercase">
                Success Rate
              </Typography>
              <Typography variant="h2" color="success.main">
                {successRate.toFixed(1)}%
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} lg={8}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
              <Typography variant="h4" gutterBottom>Latency Breakdown Over Time</Typography>
              <Box sx={{ height: '90%', pointerEvents: loading ? 'none' : 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.slice().reverse()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(val) => new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    />
                    <YAxis label={{ value: 'Latency (ms)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip
                      labelFormatter={(val) => new Date(val).toLocaleString()}
                      contentStyle={{ borderRadius: 8 }}
                    />
                    <Legend />
                    <Bar dataKey="uploadTime" name="Upload (ms)" stackId="a" fill="#3b82f6" isAnimationActive={false} />
                    <Bar dataKey="reconTime" name="Recon (ms)" stackId="a" fill="#f59e0b" isAnimationActive={false} />
                    <Bar dataKey="cacheTime" name="Cache (ms)" stackId="a" fill="#10b981" isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={4}>
            <Paper sx={{ p: 3, borderRadius: 3, height: 400 }}>
              <Typography variant="h4" gutterBottom>Sync vs Async Processing</Typography>
              <Box sx={{ height: '90%', pointerEvents: loading ? 'none' : 'auto' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { name: 'Sync', count: data.filter(d => !d.isAsync).length },
                      { name: 'Async', count: data.filter(d => d.isAsync).length }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 8 }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} isAnimationActive={false} />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Table */}
        <Paper sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box sx={{ p: 3, borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h4">Recent Upload API Hits</Typography>
            <FormControl sx={{ minWidth: 200 }} size="small">
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                label="Report Type"
                onChange={(e) => setReportType(e.target.value as string)}
              >
                <MenuItem value="all">All</MenuItem>
                {reportTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <TableContainer sx={{ height: '500px', overflowY: 'scroll' }}>
            <Table sx={{ tableLayout: 'fixed', minWidth: 1000 }}>
              <TableHead sx={{ background: '#f8fafc' }}>
                <TableRow>
                  <TableCell sx={{ width: '180px' }}>Timestamp</TableCell>
                  <TableCell sx={{ width: '250px' }}>Hit ID</TableCell>
                  <TableCell sx={{ width: '100px' }}>Processing</TableCell>
                  <TableCell sx={{ width: '150px' }} align="right">Upload</TableCell>
                  <TableCell sx={{ width: '150px' }} align="right">Recon</TableCell>
                  <TableCell sx={{ width: '100px' }} align="right">Cache</TableCell>
                  <TableCell sx={{ width: '120px' }} align="right">Total Latency</TableCell>
                  <TableCell sx={{ width: '100px' }} align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody sx={{ pointerEvents: loading ? 'none' : 'auto' }}>
                {data.length === 0 && !loading ? (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                      <Typography color="text.secondary">No API hits found for the selected filters.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((row) => {
                    const rowPopFailed = isPopulationFailed(row);
                    const effectiveStatus = getEffectiveStatus(row);
                    return (
                      <TableRow
                        key={row.id}
                        hover
                        onClick={() => setSelectedRow(row)}
                        sx={{
                          cursor: 'pointer',
                          ...(rowPopFailed ? { bgcolor: '#fff5f5', borderLeft: '4px solid #ef4444' } : {})
                        }}
                      >
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {formatTimestamp(row.timestamp)}
                          </Typography>
                          {rowPopFailed && (
                            <Typography variant="caption" color="error.main" fontWeight={700} display="block">
                              ⚠️ Population Failed
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>
                          <Chip
                            label={row.isAsync ? 'Async' : 'Sync'}
                            size="small"
                            sx={{
                              background: row.isAsync ? '#e0e7ff' : '#f3e8ff',
                              color: row.isAsync ? '#4f46e5' : '#9333ea',
                              fontWeight: 600
                            }}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={500}>
                            {row.uploadTime > 0 ? row.uploadTime : ((row.s3Time || 0) + (row.ingestionTime || 0))} ms
                          </Typography>
                          {(row.s3Time !== undefined || row.ingestionTime !== undefined) && (
                            <>
                              <Typography variant="caption" display="block" color="text.secondary">S3: {row.s3Time || 0}ms</Typography>
                              <Typography variant="caption" display="block" color="text.secondary">Ingest: {row.ingestionTime || 0}ms ({row.ingestionRows || 0} rows)</Typography>
                              {row.clickpostTime > 0 && <Typography variant="caption" display="block" color="text.secondary">Clickpost: {row.clickpostTime}ms</Typography>}
                            </>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={500}>{row.reconTime} ms</Typography>
                          {row.reconUpsertTime !== undefined && (
                            <>
                              <Typography
                                variant="caption"
                                display="block"
                                sx={{
                                  color: rowPopFailed ? '#dc2626' : 'text.secondary',
                                  fontWeight: rowPopFailed ? 700 : 400
                                }}
                              >
                                Upsert: {row.reconUpsertTime}ms ({row.reconUpsertRows} rows)
                                {rowPopFailed && ' ⚠️'}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">Diff: {row.reconDiffTime}ms</Typography>
                            </>
                          )}
                        </TableCell>
                        <TableCell align="right">{row.cacheTime} ms</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>{row.totalTime} ms</Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={effectiveStatus}
                            size="small"
                            color={rowPopFailed ? 'error' : row.status === 'Success' ? 'success' : 'warning'}
                            variant={rowPopFailed ? 'filled' : 'outlined'}
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
        {/* Detail Dialog */}
        <Dialog open={!!selectedRow} onClose={() => setSelectedRow(null)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Upload Details: {selectedRow?.id}</span>
            {selectedRow && (
              <Chip
                label={getEffectiveStatus(selectedRow)}
                size="small"
                color={isPopulationFailed(selectedRow) ? 'error' : selectedRow.status === 'Success' ? 'success' : 'warning'}
                variant="filled"
                sx={{ fontWeight: 700 }}
              />
            )}
          </DialogTitle>
          <DialogContent dividers>
            {selectedRow && (
              <Grid container spacing={3}>
                {/* Warning Alert if population did not happen */}
                {isPopulationFailed(selectedRow) && (
                  <Grid item xs={12}>
                    <Alert severity="error" variant="filled" sx={{ borderRadius: 2 }}>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Reconciliation Population Failed — 0 Rows Reconciled
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        CSV Ingestion successfully saved <strong>{selectedRow.ingestionRows?.toLocaleString()} rows</strong> into <code>{getIngestionTable(selectedRow.reportType)}</code>, but <strong>0 rows</strong> were matched or populated into <code>d2c_sales_reconciliation</code>. Reconciliation was not performed on any sales records.
                      </Typography>
                    </Alert>
                  </Grid>
                )}

                <Grid item xs={12} md={6}>
                  <Typography variant="h6">General</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>Timestamp:</strong> {formatTimestamp(selectedRow.timestamp)}</Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, my: 0.5 }}>
                    <Typography><strong>Status:</strong></Typography>
                    <Chip
                      label={getEffectiveStatus(selectedRow)}
                      size="small"
                      color={isPopulationFailed(selectedRow) ? 'error' : selectedRow.status === 'Success' ? 'success' : 'warning'}
                      variant={isPopulationFailed(selectedRow) ? 'filled' : 'outlined'}
                      sx={{ fontWeight: 600 }}
                    />
                  </Box>
                  <Typography><strong>Report Type:</strong> <code>{selectedRow.reportType}</code></Typography>
                  <Typography><strong>Ingestion Table:</strong> <code>{getIngestionTable(selectedRow.reportType)}</code></Typography>
                  <Typography><strong>Processing:</strong> {selectedRow.isAsync ? 'Async' : 'Sync'}</Typography>
                  <Typography><strong>Total Latency:</strong> {selectedRow.totalTime} ms</Typography>
                  <Typography>
                    <strong>Population Match Rate:</strong>{' '}
                    <span style={{ color: isPopulationFailed(selectedRow) ? '#dc2626' : '#16a34a', fontWeight: 700 }}>
                      {selectedRow.ingestionRows > 0
                        ? `${selectedRow.reconUpsertRows} / ${selectedRow.ingestionRows} (${((selectedRow.reconUpsertRows / selectedRow.ingestionRows) * 100).toFixed(1)}%)`
                        : '0 rows'}
                    </span>
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6">Step Breakdown</Typography>
                  <Divider sx={{ my: 1 }} />
                  <Typography><strong>S3 Upload:</strong> {selectedRow.s3Time} ms</Typography>
                  <Typography><strong>CSV Ingestion:</strong> {selectedRow.ingestionTime} ms ({selectedRow.ingestionRows} rows)</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Table: <code>{getIngestionTable(selectedRow.reportType)}</code></Typography>
                  {selectedRow.clickpostTime > 0 && <Typography><strong>Clickpost Sync:</strong> {selectedRow.clickpostTime} ms</Typography>}
                  
                  {isPopulationFailed(selectedRow) ? (
                    <Box sx={{ p: 1.5, my: 1, bgcolor: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 1.5 }}>
                      <Typography color="error.main" fontWeight={700}>
                        Recon Upsert: {selectedRow.reconUpsertTime} ms (0 rows — NOT POPULATED)
                      </Typography>
                      <Typography variant="caption" color="error.dark" display="block" sx={{ mt: 0.5 }}>
                        ⚠️ Warning: 0 of {selectedRow.ingestionRows} ingested rows matched existing orders in <code>d2c_sales_reconciliation</code>.
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>Table: <code>d2c_sales_reconciliation</code></Typography>
                    </Box>
                  ) : (
                    <>
                      <Typography><strong>Recon Upsert:</strong> {selectedRow.reconUpsertTime} ms ({selectedRow.reconUpsertRows} rows)</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Table: <code>d2c_sales_reconciliation</code></Typography>
                    </>
                  )}
                  <Typography><strong>Recon Diff Calc:</strong> {selectedRow.reconDiffTime} ms</Typography>
                  <Typography><strong>Cache Invalidation:</strong> {selectedRow.cacheTime} ms</Typography>
                </Grid>

                {(isPopulationFailed(selectedRow) || selectedRow.status === 'Failed' || selectedRow.errorLog) && (
                  <Grid item xs={12}>
                    <Typography variant="h6" color="error">Diagnostic / Error Details</Typography>
                    <Divider sx={{ my: 1 }} />
                    <Paper sx={{ p: 2, background: '#fee2e2', color: '#991b1b', wordBreak: 'break-word', borderRadius: 2 }}>
                      {selectedRow.errorLog || (isPopulationFailed(selectedRow)
                        ? `Reconciliation population failed: 0 of ${selectedRow.ingestionRows} rows were matched/settled into d2c_sales_reconciliation. Reconciliation was not performed on any sales orders.`
                        : 'No detailed error log available.')}
                    </Paper>
                  </Grid>
                )}
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelectedRow(null)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </React.Fragment>
  );
};

export default AdminAnalytics;

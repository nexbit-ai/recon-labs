import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  TablePagination,
  Chip,
  Paper,
  TextField,
  InputAdornment,
  Popover,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import TuneIcon from '@mui/icons-material/Tune';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';

import {
  mockPOItems,
  poSummaryMetrics,
  ALL_PO_COLUMNS,
  ColumnDefinition,
  POItem,
} from '../data/mockPOData';
import { POSummaryCard } from '../components/po-dashboard/POSummaryCard';
import { POColumnsModal } from '../components/po-dashboard/POColumnsModal';
import { POFiltersDrawer, POFilterState } from '../components/po-dashboard/POFiltersDrawer';

type MetricMode = 'amount' | 'units' | 'quantity';

const STATUS_FILTERS = [
  'All',
  'Open',
  'Discrepancy',
  'Dispatched',
  'Closed',
  'Expired',
  'Cancelled',
  'Invoiced',
  'Other',
] as const;

export const PODashboard: React.FC = () => {
  const navigate = useNavigate();

  // Metric toggle mode: Amount | Units | Quantity
  const [metricMode, setMetricMode] = useState<MetricMode>('amount');

  // Status pill filter
  const [selectedStatus, setSelectedStatus] = useState<string>('All');

  // Columns state
  const [columns, setColumns] = useState<ColumnDefinition[]>(ALL_PO_COLUMNS);
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);

  // Filters drawer state
  const [filtersDrawerOpen, setFiltersDrawerOpen] = useState(false);
  const [filterState, setFilterState] = useState<POFilterState>({
    channels: [],
    vendors: [],
    cities: [],
    discrepancyOnly: false,
    dateFrom: '',
    dateTo: '',
  });

  // Check if inside B2BShell via outlet context
  let outletContext: { platformFilter?: string } | null = null;
  try {
    outletContext = useOutletContext<{ platformFilter?: string }>();
  } catch {
    outletContext = null;
  }

  const [standaloneEntity, setStandaloneEntity] = useState('all');
  const activeEntity = outletContext?.platformFilter || standaloneEntity;

  const activeFilterCount = useMemo(() => {
    return (
      filterState.channels.length +
      filterState.vendors.length +
      filterState.cities.length +
      (filterState.discrepancyOnly ? 1 : 0) +
      (filterState.dateFrom ? 1 : 0) +
      (filterState.dateTo ? 1 : 0)
    );
  }, [filterState]);

  // Broadcast filter count
  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent('po-filter-count-changed', { detail: { count: activeFilterCount } })
    );
  }, [activeFilterCount]);

  // PO ID Search popover state
  const [searchAnchor, setSearchAnchor] = useState<null | HTMLElement>(null);
  const [poIdSearch, setPoIdSearch] = useState('');

  // Expanded rows state

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Toast notifications
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Status counts
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: mockPOItems.length,
      Open: 0,
      Discrepancy: 0,
      Dispatched: 0,
      Closed: 0,
      Expired: 0,
      Cancelled: 0,
      Invoiced: 0,
      Other: 0,
    };

    mockPOItems.forEach((item) => {
      if (counts[item.status] !== undefined) {
        counts[item.status]++;
      } else {
        counts['Other']++;
      }
      if (item.shortQty > 0 || item.discrepancyAmount > 0) {
        // Discrepancy tab count (if explicit tab)
      }
    });

    return counts;
  }, []);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return mockPOItems.filter((item) => {
      // 1. Status pill filter
      if (selectedStatus === 'Discrepancy') {
        if (item.shortQty === 0 && item.discrepancyAmount === 0) return false;
      } else if (selectedStatus !== 'All') {
        if (item.status !== selectedStatus) return false;
      }

      // 2. Drawer filters
      if (filterState.discrepancyOnly && item.shortQty === 0 && item.discrepancyAmount === 0) {
        return false;
      }

      if (filterState.channels.length > 0 && !filterState.channels.includes(item.channel)) {
        return false;
      }

      if (filterState.vendors.length > 0 && !filterState.vendors.includes(item.vendorName)) {
        return false;
      }

      if (filterState.cities.length > 0 && !filterState.cities.includes(item.city)) {
        return false;
      }

      // Entity filter
      if (activeEntity && activeEntity !== 'all') {
        if (item.entity && item.entity.toLowerCase() !== activeEntity.toLowerCase()) {
          return false;
        }
      }

      // 3. PO ID Search filter
      if (poIdSearch.trim()) {
        const query = poIdSearch.trim().toLowerCase();
        if (!item.id.toLowerCase().includes(query)) return false;
      }

      return true;
    });
  }, [selectedStatus, filterState, poIdSearch, activeEntity]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredData.slice(start, start + rowsPerPage);
  }, [filteredData, page, rowsPerPage]);


  // Export to CSV
  const handleExportCSV = useCallback(() => {
    const visibleCols = columns.filter((c) => c.visible && c.key !== 'expand' && c.key !== 'actions');
    const headers = visibleCols.map((c) => `"${c.label}"`).join(',');

    const rows = filteredData.map((row) => {
      return visibleCols
        .map((col) => {
          const val = row[col.key as keyof POItem];
          if (val === undefined || val === null) return '""';
          if (typeof val === 'number') return val;
          return `"${String(val).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Purchase_Orders_MTD_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Exported ${filteredData.length} purchase order records.`);
  }, [columns, filteredData]);

  // Listen for top bar events (Filters & Export)
  useEffect(() => {
    const handleOpenFilters = () => setFiltersDrawerOpen(true);
    const handleExport = () => handleExportCSV();

    window.addEventListener('open-po-filters', handleOpenFilters);
    window.addEventListener('export-po-data', handleExport);

    return () => {
      window.removeEventListener('open-po-filters', handleOpenFilters);
      window.removeEventListener('export-po-data', handleExport);
    };
  }, [handleExportCSV]);

  // Reset columns
  const handleResetColumns = () => {
    setColumns(ALL_PO_COLUMNS);
    setToastMessage('Columns reset to default view.');
  };

  // Reset drawer filters
  const handleResetFilters = () => {
    setFilterState({
      channels: [],
      vendors: [],
      cities: [],
      discrepancyOnly: false,
      dateFrom: '',
      dateTo: '',
    });
    setToastMessage('All filters cleared.');
  };

  // Status Chip Renderer (Exact Palette: Black, Grey, White, Green #16a34a, Yellow #ca8a04)
  const renderStatusChip = (status: POItem['status']) => {
    let bg = '#f4f4f5';
    let color = '#27272a';
    let border = '#e4e4e7';

    switch (status) {
      case 'Closed':
        bg = '#f0fdf4';
        color = '#16a34a';
        border = '#bbf7d0';
        break;
      case 'Dispatched':
        bg = '#f4f4f5';
        color = '#09090b';
        border = '#e4e4e7';
        break;
      case 'Open':
        bg = '#f4f4f5';
        color = '#27272a';
        border = '#e4e4e7';
        break;
      case 'Discrepancy':
      case 'Expired':
        bg = '#fefce8';
        color = '#ca8a04';
        border = '#fef08a';
        break;
      case 'Invoiced':
        bg = '#f4f4f5';
        color = '#09090b';
        border = '#e4e4e7';
        break;
      case 'Cancelled':
      default:
        bg = '#f4f4f5';
        color = '#71717a';
        border = '#e4e4e7';
    }

    return (
      <Chip
        label={status}
        size="small"
        sx={{
          height: 22,
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: bg,
          color: color,
          borderRadius: '9999px',
          border: `1px solid ${border}`,
          px: 0.5,
        }}
      />
    );
  };

  // Channel badge renderer (Exact Black / Grey Palette)
  const renderChannelBadge = (channel: string) => {
    return (
      <Box
        sx={{
          display: 'inline-block',
          px: '9px',
          py: '2px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 600,
          backgroundColor: '#f4f4f5',
          border: '1px solid #e4e4e7',
          color: '#18181b',
        }}
      >
        {channel}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%', backgroundColor: '#ffffff' }}>
      {/* Top Bar if rendered outside B2BShell (with Filters and Export on left of ENTITY) */}
      {!outletContext && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 1.5,
            mb: 2,
            pb: 1.5,
            borderBottom: '1px solid #eaecf0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<TuneIcon sx={{ fontSize: 15 }} />}
              onClick={() => setFiltersDrawerOpen(true)}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                borderColor: '#eaecf0',
                backgroundColor: '#ffffff',
                color: '#334155',
                height: 32,
                px: 2,
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                '&:hover': {
                  borderColor: '#d0d5dd',
                  backgroundColor: '#f4f4f5',
                },
              }}
            >
              Filters
              {activeFilterCount > 0 && (
                <Box
                  component="span"
                  sx={{
                    ml: 0.75,
                    px: '6px',
                    py: '1px',
                    borderRadius: '9999px',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: '#059669',
                    color: '#ffffff',
                  }}
                >
                  {activeFilterCount}
                </Box>
              )}
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
              onClick={handleExportCSV}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontSize: '12px',
                fontWeight: 600,
                borderColor: '#eaecf0',
                backgroundColor: '#ffffff',
                color: '#334155',
                height: 32,
                px: 2,
                boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
                '&:hover': {
                  borderColor: '#d0d5dd',
                  backgroundColor: '#f4f4f5',
                },
              }}
            >
              Export
            </Button>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 600, color: '#64748b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              ENTITY:
            </Typography>
            <select
              value={standaloneEntity}
              onChange={(e) => setStandaloneEntity(e.target.value)}
              style={{
                padding: '6px 14px',
                border: '1px solid #eaecf0',
                backgroundColor: '#ffffff',
                color: '#0f172a',
                fontSize: 13,
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
                fontFamily: 'inherit',
                borderRadius: '9999px',
              }}
            >
              <option value="all">All Entities</option>
              <option value="nexbit">Nexbit</option>
              <option value="kapiva">Kapiva</option>
              <option value="medkart">Medkart</option>
            </select>
          </Box>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              height: 28,
              px: 1.5,
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              fontSize: '11px',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#64748b',
              borderRadius: '9999px',
            }}
          >
            Oct 2024 - Sep 2025
          </Box>
        </Box>
      )}

      {/* ── 2. Summary Row (Label + Segmented Switcher) ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: '#64748b',
            }}
          >

          </Typography>
        </Box>

        {/* Amount | Units | Quantity segmented switch */}
        <Box
          sx={{
            display: 'inline-flex',
            backgroundColor: '#f1f5f9',
            p: '3px',
            borderRadius: '9999px',
            border: '1px solid #eaecf0',
          }}
        >
          {(['amount', 'units', 'quantity'] as MetricMode[]).map((mode) => {
            const isSelected = metricMode === mode;
            return (
              <Box
                key={mode}
                onClick={() => setMetricMode(mode)}
                sx={{
                  px: 2,
                  py: 0.5,
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  textTransform: 'capitalize',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#ffffff' : 'transparent',
                  color: isSelected ? '#0f172a' : '#64748b',
                  boxShadow: isSelected ? '0 1px 3px rgba(16, 24, 40, 0.08)' : 'none',
                  border: isSelected ? '1px solid #eaecf0' : '1px solid transparent',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    color: '#0f172a',
                  },
                }}
              >
                {mode}
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* ── 3. Summary Cards Grid ── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
          },
          gap: 1.5,
          mb: 3,
        }}
      >
        {/* 1. Total purchase orders */}
        <POSummaryCard
          label="Total purchase orders"
          value={poSummaryMetrics.totalPos[metricMode]}
          trend={poSummaryMetrics.totalPos.trend}
          trendIsPositive={!poSummaryMetrics.totalPos.trendNegative}
          progress={{ percent: 92, label: '92% of MTD target' }}
        />

        {/* 2. Invoiced amount */}
        <POSummaryCard
          label="Invoiced amount"
          value={poSummaryMetrics.invoiced[metricMode]}
          trend={poSummaryMetrics.invoiced.trend}
          trendIsPositive={!poSummaryMetrics.invoiced.trendNegative}
        />

        {/* 3. Discrepancy value */}
        <POSummaryCard
          label="Discrepancy value"
          value={poSummaryMetrics.discrepancy[metricMode]}
          trend="-2 pts"
          trendIsPositive={false}
        />
      </Box>

      {/* ── 4. Filter Status Pills Bar + Expand All ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          flexWrap: 'wrap',
          mb: 1.75,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((status) => {
            const count = statusCounts[status] ?? 0;
            const isSelected = selectedStatus === status;

            return (
              <Box
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setPage(0);
                }}
                sx={{
                  px: 1.75,
                  py: 0.5,
                  borderRadius: '9999px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 600 : 500,
                  cursor: 'pointer',
                  backgroundColor: isSelected ? '#0f172a' : '#ffffff',
                  color: isSelected ? '#ffffff' : '#475569',
                  border: isSelected ? '1px solid #0f172a' : '1px solid #eaecf0',
                  boxShadow: isSelected ? '0 1px 3px rgba(16, 24, 40, 0.12)' : '0 1px 2px rgba(16, 24, 40, 0.03)',
                  transition: 'all 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    borderColor: isSelected ? '#0f172a' : '#d0d5dd',
                    backgroundColor: isSelected ? '#0f172a' : '#f4f4f5',
                    color: isSelected ? '#ffffff' : '#0f172a',
                  },
                }}
              >
                {status} ({count})
              </Box>
            );
          })}
        </Box>


      </Box>

      {/* ── 5. Helper Notice & Columns Button ── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 1.5,
        }}
      >

        <Button
          variant="outlined"
          size="small"
          startIcon={<ViewColumnOutlinedIcon sx={{ fontSize: 16 }} />}
          onClick={() => setColumnsModalOpen(true)}
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontSize: '12px',
            fontWeight: 600,
            borderColor: '#eaecf0',
            backgroundColor: '#ffffff',
            color: '#334155',
            px: 2,
            boxShadow: '0 1px 2px rgba(16, 24, 40, 0.04)',
            '&:hover': {
              borderColor: '#d0d5dd',
              backgroundColor: '#f4f4f5',
            },
          }}
        >
          Columns
        </Button>
      </Box>

      {/* ── 6. The 33-Column Table with Sticky PO ID ── */}
      <Paper
        elevation={0}
        sx={{
          border: '1px solid #eaecf0',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(16, 24, 40, 0.04)',
        }}
      >
        <TableContainer sx={{ maxHeight: 'calc(100vh - 380px)', overflowX: 'auto' }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{ '& th': { backgroundColor: '#fafafa', borderBottom: '1px solid #eaecf0' } }}>
                {columns
                  .filter((c) => c.visible)
                  .map((col) => {
                    if (col.key === 'id') {
                      return (
                        <TableCell
                          key="id"
                          sx={{
                            width: 120,
                            minWidth: 120,
                            position: 'sticky',
                            left: 0,
                            zIndex: 10,
                            backgroundColor: '#fafafa !important',
                            borderRight: '2px solid #eaecf0',
                            boxShadow: '2px 0 4px -2px rgba(0,0,0,0.06)',
                            fontSize: '11px',
                            fontWeight: 700,
                            color: '#475569',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase',
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <span>PO ID</span>
                            <IconButton
                              size="small"
                              onClick={(e) => setSearchAnchor(e.currentTarget)}
                              sx={{
                                p: 0.25,
                                color: poIdSearch ? '#059669' : '#94a3b8',
                              }}
                            >
                              <SearchIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Box>
                        </TableCell>
                      );
                    }

                    return (
                      <TableCell
                        key={col.key}
                        align={col.align || 'left'}
                        sx={{
                          width: col.width,
                          minWidth: col.width,
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#475569',
                          letterSpacing: '0.04em',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                          py: 1.25,
                          px: 1.5,
                        }}
                      >
                        {col.label}
                      </TableCell>
                    );
                  })}
              </TableRow>
            </TableHead>

            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.filter((c) => c.visible).length}
                    align="center"
                    sx={{ py: 6 }}
                  >
                    <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#64748b' }}>
                      No purchase orders match your filter criteria.
                    </Typography>
                    <Button
                      size="small"
                      onClick={() => {
                        setSelectedStatus('All');
                        handleResetFilters();
                        setPoIdSearch('');
                      }}
                      sx={{ mt: 1, textTransform: 'none', color: '#059669', borderRadius: '9999px' }}
                    >
                      Clear all filters
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((po) => {
                  return (
                    <React.Fragment key={po.id}>
                      <TableRow
                        hover
                        onClick={() => navigate(`/b2b/po-dashboard/${po.id}`)}
                        sx={{
                          cursor: 'pointer',
                          backgroundColor: '#ffffff',
                          transition: 'background-color 0.15s ease',
                          '&:hover': {
                            backgroundColor: '#fafafa !important',
                          },
                        }}
                      >
                        {columns
                          .filter((c) => c.visible)
                          .map((col) => {
                            // 2. Sticky PO ID
                            if (col.key === 'id') {
                              return (
                                <TableCell
                                  key="id"
                                  sx={{
                                    width: 120,
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 4,
                                    backgroundColor: '#ffffff !important',
                                    borderRight: '2px solid #e2e8f0',
                                    boxShadow: '2px 0 4px -2px rgba(0,0,0,0.06)',
                                    fontSize: '12.5px',
                                    fontWeight: 700,
                                    fontFamily: 'monospace',
                                    color: '#0f172a',
                                  }}
                                >
                                  {po.id}
                                </TableCell>
                              );
                            }

                            // 3. Status
                            if (col.key === 'status') {
                              return (
                                <TableCell key="status" sx={{ py: 1, px: 1.5 }}>
                                  {renderStatusChip(po.status)}
                                </TableCell>
                              );
                            }

                            // 4. SO #
                            if (col.key === 'soNumber') {
                              return (
                                <TableCell key="soNumber" align="center" sx={{ fontSize: '12px', color: '#94a3b8' }}>
                                  {po.soNumber}
                                </TableCell>
                              );
                            }

                            // Vendor (2 lines)
                            if (col.key === 'vendorName') {
                              return (
                                <TableCell key="vendorName" sx={{ py: 0.75, px: 1.5, minWidth: 200 }}>
                                  <Typography sx={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a', lineHeight: 1.2 }}>
                                    {po.vendorName}
                                  </Typography>
                                  <Typography sx={{ fontSize: '11px', color: '#94a3b8', mt: 0.25 }}>
                                    {po.vendorEntity}
                                  </Typography>
                                </TableCell>
                              );
                            }

                            // Payment Status
                            if (col.key === 'paymentStatus') {
                              let pBg = '#f4f4f5';
                              let pColor = '#52525b';
                              let pBorder = '#e4e4e7';
                              if (po.paymentStatus === 'Paid') {
                                pBg = '#f0fdf4';
                                pColor = '#16a34a';
                                pBorder = '#bbf7d0';
                              } else if (po.paymentStatus === 'Partial') {
                                pBg = '#fefce8';
                                pColor = '#ca8a04';
                                pBorder = '#fef08a';
                              } else if (po.paymentStatus === 'Overdue') {
                                pBg = '#fff1f2';
                                pColor = '#e11d48';
                                pBorder = '#fecdd3';
                              }
                              return (
                                <TableCell key="paymentStatus" align="center" sx={{ py: 1, px: 1.5 }}>
                                  <Chip
                                    label={po.paymentStatus}
                                    size="small"
                                    sx={{
                                      height: 22,
                                      fontSize: '11px',
                                      fontWeight: 600,
                                      backgroundColor: pBg,
                                      color: pColor,
                                      borderRadius: '9999px',
                                      border: `1px solid ${pBorder}`,
                                      px: 0.5,
                                    }}
                                  />
                                </TableCell>
                              );
                            }

                            // Financial amounts
                            if (
                              col.key === 'poAmount' ||
                              col.key === 'invoicedAmount' ||
                              col.key === 'settledAmount'
                            ) {
                              const amount = po[col.key] as number;
                              const isSettled = col.key === 'settledAmount' && amount > 0;
                              return (
                                <TableCell
                                  key={col.key}
                                  align="right"
                                  sx={{
                                    fontSize: '12.5px',
                                    fontWeight: 600,
                                    color: isSettled ? '#16a34a' : '#09090b',
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {amount > 0 ? `₹${amount.toLocaleString('en-IN')}` : '—'}
                                </TableCell>
                              );
                            }

                            // 11. Discrepancy Amount (yellow/amber if discrepancy)
                            if (col.key === 'discrepancyAmount') {
                              return (
                                <TableCell
                                  key="discrepancyAmount"
                                  align="right"
                                  sx={{
                                    fontSize: '12.5px',
                                    fontWeight: po.discrepancyAmount > 0 ? 700 : 500,
                                    color: po.discrepancyAmount > 0 ? '#ca8a04' : '#71717a',
                                    fontVariantNumeric: 'tabular-nums',
                                  }}
                                >
                                  {po.discrepancyAmount > 0 ? `₹${po.discrepancyAmount.toLocaleString('en-IN')}` : '—'}
                                </TableCell>
                              );
                            }

                            // 12. Actions
                            if (col.key === 'actions') {
                              return (
                                <TableCell key="actions" align="center">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => { e.stopPropagation(); handleToggleRow(po.id); }}
                                    sx={{ color: '#64748b' }}
                                  >
                                    <MoreVertIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </TableCell>
                              );
                            }

                            // Default cell
                            const cellVal = po[col.key as keyof POItem];
                            return (
                              <TableCell
                                key={col.key}
                                align={col.align || 'left'}
                                sx={{
                                  fontSize: '12.5px',
                                  color: '#334155',
                                  whiteSpace: 'nowrap',
                                  py: 1,
                                  px: 1.5,
                                }}
                              >
                                {cellVal !== undefined && cellVal !== null ? String(cellVal) : '—'}
                              </TableCell>
                            );
                          })}
                      </TableRow>
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* ── 7. Pagination ── */}
        <TablePagination
          rowsPerPageOptions={[10, 20, 37]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          sx={{
            borderTop: '1px solid #eaecf0',
            backgroundColor: '#ffffff',
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              fontSize: '12px',
              color: '#64748b',
              fontVariantNumeric: 'tabular-nums',
            },
            '.MuiTablePagination-select': {
              fontSize: '12px',
              borderRadius: '8px',
            },
          }}
        />
      </Paper>

      {/* ── PO ID Search Popover ── */}
      <Popover
        open={Boolean(searchAnchor)}
        anchorEl={searchAnchor}
        onClose={() => setSearchAnchor(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        PaperProps={{
          sx: { p: 1.75, width: 250, borderRadius: '12px', border: '1px solid #eaecf0', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)' },
        }}
      >
        <TextField
          autoFocus
          size="small"
          placeholder="Filter PO ID..."
          value={poIdSearch}
          onChange={(e) => {
            setPoIdSearch(e.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: 16, color: '#94a3b8' }} />
              </InputAdornment>
            ),
            sx: { borderRadius: '9999px', fontSize: '12.5px', '& fieldset': { borderColor: '#eaecf0' } },
          }}
        />
        {poIdSearch && (
          <Button
            size="small"
            onClick={() => setPoIdSearch('')}
            sx={{ mt: 1, fontSize: '11px', textTransform: 'none', color: '#e11d48', borderRadius: '9999px' }}
          >
            Clear Filter
          </Button>
        )}
      </Popover>

      {/* ── Columns Customization Modal ── */}
      <POColumnsModal
        open={columnsModalOpen}
        onClose={() => setColumnsModalOpen(false)}
        columns={columns}
        onSave={(updated) => setColumns(updated)}
        onReset={handleResetColumns}
      />

      {/* ── Filters Drawer ── */}
      <POFiltersDrawer
        open={filtersDrawerOpen}
        onClose={() => setFiltersDrawerOpen(false)}
        filters={filterState}
        onChange={(updated) => {
          setFilterState(updated);
          setPage(0);
        }}
        onReset={handleResetFilters}
      />

      {/* ── Notifications Toast ── */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3500}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          sx={{ width: '100%', borderRadius: '8px', fontSize: '12.5px' }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PODashboard;

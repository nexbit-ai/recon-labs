import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { mockPOItems } from '../data/mockPOData';

export const PODetailsPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();

  // Find the PO. If not found, use a fallback from mock
  const po = mockPOItems.find((item) => item.id === poId) || mockPOItems[0];

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* HEADER SECTION */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            onClick={() => navigate('/b2b/po-dashboard')}
            sx={{
              minWidth: 'auto',
              p: 1,
              color: '#71717a',
              borderRadius: '9999px',
              '&:hover': { backgroundColor: '#f4f4f5' },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 20 }} />
          </Button>
          <Box>
            <Typography
            sx={{
              fontSize: '28px',
              fontWeight: 700,
              color: '#09090b',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            {po.id}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#71717a', fontWeight: 500 }}>
            {po.vendorName} · {po.channel} · {po.skusCount} SKUs · Created {po.poDate}
          </Typography>
          </Box>
        </Box>
        <Button
          variant="outlined"
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 16 }} />}
          sx={{
            borderRadius: '9999px',
            textTransform: 'none',
            fontSize: '13px',
            fontWeight: 600,
            borderColor: '#eaecf0',
            backgroundColor: '#ffffff',
            color: '#09090b',
            px: 2,
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            '&:hover': { backgroundColor: '#f4f4f5' },
          }}
        >
          Export
        </Button>
      </Box>

      {/* STATUS BOX */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#ffffff',
          border: '1px solid #eaecf0',
          borderRadius: '12px',
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CheckCircleOutlineIcon sx={{ color: '#16a34a', fontSize: 24 }} />
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#09090b' }}>
              3-Way Match OK
            </Typography>
            <Typography sx={{ fontSize: '12px', color: '#71717a', mt: 0.25 }}>
              Fill rate: {po.fillRatePercent}% · Invoice: {po.invoiceNumber || '—'}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Total PO Amount
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
              ₹{po.poAmount.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Invoice Amount
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
              ₹{po.invoicedAmount.toLocaleString('en-IN')}
            </Typography>
          </Box>
          <Box>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Difference
            </Typography>
            <Typography sx={{ fontSize: '14px', fontWeight: 700, color: po.discrepancyAmount > 0 ? '#ca8a04' : '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
              ₹{po.discrepancyAmount.toLocaleString('en-IN')}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* MIDDLE GRID */}
      <Grid container spacing={3}>
        {/* LEFT: PO DETAILS */}
        <Grid item xs={12} md={5}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: '16px',
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              height: '100%',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
              <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
                PO Details
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EditOutlinedIcon sx={{ fontSize: 14 }} />}
                sx={{
                  borderRadius: '9999px',
                  textTransform: 'none',
                  fontSize: '12px',
                  fontWeight: 600,
                  borderColor: '#eaecf0',
                  color: '#09090b',
                  height: 28,
                  px: 1.5,
                  '&:hover': { backgroundColor: '#f4f4f5' },
                }}
              >
                Edit
              </Button>
            </Box>
            <Grid container spacing={ySpacing}>
              <DetailItem label="PO ID" value={po.id} />
              <DetailItem label="SO NUMBER" value={po.soNumber} />
              <DetailItem label="VENDOR" value={po.vendorName} />
              <DetailItem label="CHANNEL" value={po.channel} />
              <DetailItem label="FACILITY" value={po.facility} />
              <DetailItem label="CITY" value={po.city} />
              <DetailItem label="PO DATE" value={po.poDate} />
              <DetailItem
                label="PO AMOUNT"
                value={po.poAmount > 0 ? `₹${po.poAmount.toLocaleString('en-IN')}` : '—'}
              />
              <DetailItem label="FILL RATE" value={`${po.fillRatePercent}%`} />
              <DetailItem label="DISPATCH DATE" value={po.dispatchedDate} />
              <DetailItem label="EXPIRY DATE" value={po.expiryDate} />
              <DetailItem label="INVOICE #(S)" value={po.invoiceNumber} />
              <DetailItem label="INVOICE DATE(S)" value={po.invoiceDate} />
              <DetailItem label="GRN #(S)" value={po.grnNumber} />
              <DetailItem label="GRN DATE(S)" value={po.grnDate} />
              <DetailItem label="APPOINTMENT" value={po.apptDate} />
            </Grid>
          </Paper>
        </Grid>

        {/* RIGHT: CSV PREVIEW */}
        <Grid item xs={12} md={7}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: '16px',
              border: '1px solid #eaecf0',
              backgroundColor: '#ffffff',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                px: 3,
                py: 1.5,
                backgroundColor: '#fafafa',
                borderBottom: '1px solid #eaecf0',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <Typography
                sx={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#71717a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <TableViewOutlinedIcon sx={{ fontSize: 16, color: '#16a34a' }} />
                {po.id}_{po.channel.replace(' ', '')}.csv
              </Typography>
              <Typography
                sx={{
                  position: 'absolute',
                  right: 24,
                  fontSize: '10px',
                  fontWeight: 700,
                  color: '#16a34a',
                  letterSpacing: '0.04em',
                }}
              >
                CSV
              </Typography>
            </Box>
            <TableContainer sx={{ flex: 1 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <HeaderCell>ASIN</HeaderCell>
                    <HeaderCell>PRODUCT NAME</HeaderCell>
                    <HeaderCell align="right">QTY ORDERED</HeaderCell>
                    <HeaderCell align="right">UNIT COST</HeaderCell>
                    <HeaderCell align="right">TOTAL</HeaderCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {po.skus.map((sku) => (
                    <TableRow key={sku.id}>
                      <DataCell>{sku.ean.substring(0, 10)}</DataCell>
                      <DataCell>{sku.name}</DataCell>
                      <DataCell align="right" tabular>
                        {sku.ordQty}
                      </DataCell>
                      <DataCell align="right" tabular>
                        ₹{sku.unitPrice}
                      </DataCell>
                      <DataCell align="right" tabular>
                        ₹{(sku.ordQty * sku.unitPrice).toLocaleString('en-IN')}
                      </DataCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* BOTTOM: INVOICE MATCHED (replaces Line Items) */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: '16px',
          border: '1px solid #eaecf0',
          backgroundColor: '#ffffff',
          overflow: 'hidden',
        }}
      >
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between' }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
            Invoice matched
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#71717a' }}>
            {po.skus.length} SKUs
          </Typography>
        </Box>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#fafafa' }}>
                <HeaderCell>LINE #</HeaderCell>
                <HeaderCell>SKU ID</HeaderCell>
                <HeaderCell>PRODUCT</HeaderCell>
                <HeaderCell>CATEGORY</HeaderCell>
                <HeaderCell align="right">ORDERED PRICE</HeaderCell>
                <HeaderCell align="right">EXPECTED PRICE</HeaderCell>
                <HeaderCell align="right">MRP</HeaderCell>
                <HeaderCell align="right">ORD QTY</HeaderCell>
                <HeaderCell align="right">REC QTY</HeaderCell>
                <HeaderCell align="right">INV QTY</HeaderCell>
                <HeaderCell align="right">BAL QTY</HeaderCell>
                <HeaderCell align="right">ORD CASES</HeaderCell>
                <HeaderCell align="right">REC CASES</HeaderCell>
                <HeaderCell align="right">INV CASES</HeaderCell>
                <HeaderCell align="right">WEIGHT</HeaderCell>
                <HeaderCell align="right">WEIGHT CASES</HeaderCell>
                <HeaderCell align="right">ITEM AMOUNT</HeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {po.skus.map((sku, index) => {
                const orderedPrice = sku.unitPrice;
                const expectedPrice = sku.unitPrice - 5;
                const mrp = sku.unitPrice + Math.floor(sku.unitPrice * 0.25);
                const invQty = sku.recQty;
                const balQty = sku.ordQty - sku.recQty;
                const ordCases = Math.floor(sku.ordQty / 12);
                const recCases = Math.floor(sku.recQty / 12);
                const invCases = recCases;
                
                return (
                  <TableRow key={sku.id} hover>
                    <DataCell>{`LI-${String(index + 1).padStart(3, '0')}`}</DataCell>
                    <DataCell sx={{ fontWeight: 600 }}>{sku.skuCode}</DataCell>
                    <DataCell>{sku.name}</DataCell>
                    <DataCell>—</DataCell>
                    <DataCell align="right" tabular>₹{orderedPrice}</DataCell>
                    <DataCell align="right" tabular>₹{expectedPrice}</DataCell>
                    <DataCell align="right" tabular>₹{mrp}</DataCell>
                    <DataCell align="right" tabular>{sku.ordQty.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{sku.recQty.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{invQty.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{balQty.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{ordCases.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{recCases.toLocaleString()}</DataCell>
                    <DataCell align="right" tabular>{invCases.toLocaleString()}</DataCell>
                    <DataCell align="right">—</DataCell>
                    <DataCell align="right">—</DataCell>
                    <DataCell align="right" tabular>₹{sku.lineTotal.toLocaleString('en-IN')}</DataCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

// --- HELPER COMPONENTS ---

const ySpacing = 2.5;

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <Grid item xs={6}>
    <Typography
      sx={{
        fontSize: '10.5px',
        fontWeight: 700,
        color: '#71717a',
        letterSpacing: '0.04em',
        mb: 0.5,
      }}
    >
      {label}
    </Typography>
    <Typography
      sx={{
        fontSize: '13px',
        fontWeight: 600,
        color: '#09090b',
        fontVariantNumeric: typeof value === 'string' && value.includes('₹') ? 'tabular-nums' : 'normal',
      }}
    >
      {value || '—'}
    </Typography>
  </Grid>
);

const HeaderCell: React.FC<{ children: React.ReactNode; align?: 'left' | 'right' | 'center' }> = ({ children, align = 'left' }) => (
  <TableCell
    align={align}
    sx={{
      fontSize: '10.5px',
      fontWeight: 700,
      color: '#71717a',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      py: 1.5,
      borderBottom: '1px solid #eaecf0',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </TableCell>
);

const DataCell: React.FC<{
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
  tabular?: boolean;
  sx?: any;
}> = ({ children, align = 'left', tabular, sx = {} }) => (
  <TableCell
    align={align}
    sx={{
      fontSize: '12.5px',
      color: '#3f3f46',
      py: 1.5,
      borderBottom: '1px solid #eaecf0',
      fontVariantNumeric: tabular ? 'tabular-nums' : 'normal',
      whiteSpace: 'nowrap',
      ...sx,
    }}
  >
    {children}
  </TableCell>
);

export default PODetailsPage;

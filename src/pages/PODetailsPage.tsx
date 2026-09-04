import React, { useState } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import TableViewOutlinedIcon from '@mui/icons-material/TableViewOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { mockPOItems } from '../data/mockPOData';

export const PODetailsPage: React.FC = () => {
  const { poId } = useParams<{ poId: string }>();
  const navigate = useNavigate();
  const [isAutomateModalOpen, setIsAutomateModalOpen] = useState(false);
  const [isInvoiceCreated, setIsInvoiceCreated] = useState(false);

  // Find the PO. If not found, use a fallback from mock
  const po = mockPOItems.find((item) => item.id === poId) || mockPOItems[0];

  return (
    <Grid container spacing={4} sx={{ width: '100%', m: 0 }}>
      <Grid item xs={12} md={9} sx={{ pl: '0 !important', pt: '0 !important', display: 'flex', flexDirection: 'column', gap: 3 }}>
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
        <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '15px', fontWeight: 700, color: '#09090b' }}>
            Invoice matched
          </Typography>
          {po.invoicedAmount === 0 && !isInvoiceCreated ? (
            <Button
              variant="outlined"
              size="small"
              onClick={() => setIsAutomateModalOpen(true)}
              sx={{
                borderRadius: '9999px',
                textTransform: 'none',
                fontWeight: 600,
                color: '#09090b',
                borderColor: '#eaecf0',
                px: 2,
                boxShadow: 'none',
                '&:hover': {
                  backgroundColor: '#f4f4f5',
                  borderColor: '#d0d5dd',
                  boxShadow: 'none',
                }
              }}
            >
              Automate Invoice Creation
            </Button>
          ) : (
            <Typography sx={{ fontSize: '13px', color: '#71717a' }}>
              {po.skus.length} SKUs
            </Typography>
          )}
        </Box>
        
        {po.invoicedAmount === 0 && !isInvoiceCreated ? (
          <Box sx={{ p: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
            <Typography sx={{ fontSize: '16px', fontWeight: 600, color: '#09090b', mb: 1 }}>
              No Invoice Found
            </Typography>
            <Typography sx={{ fontSize: '14px', color: '#71717a', maxWidth: 400, mb: 3 }}>
              There is currently no invoice associated with this Purchase Order. You can automate the invoice creation process based on the PO details.
            </Typography>
          </Box>
        ) : (
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
        )}
      </Paper>

      {/* AUTOMATE INVOICE MODAL */}
      <Dialog
        open={isAutomateModalOpen}
        onClose={() => setIsAutomateModalOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '16px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            width: '100%',
            maxWidth: '500px',
            p: 1
          }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#09090b' }}>
            Create an invoice
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 3 }}>
          <Typography sx={{ fontSize: '14px', color: '#71717a', mb: 3 }}>
            Review the invoice details before creation. The following line items and quantities will be used.
          </Typography>
          
          <Box sx={{ border: '1px solid #eaecf0', borderRadius: '12px', p: 2, mb: 2, backgroundColor: '#fafafa' }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  CUSTOMER NAME
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
                  {po.vendorName}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  REFERENCE NUMBER
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                  {po.id}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  TOTAL QUANTITY
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                  {po.ordQty.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  INVOICE TOTAL
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                  ₹{po.poAmount.toLocaleString('en-IN')}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  INVOICE DATE
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                  {new Date().toISOString().split('T')[0]}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  DUE DATE
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b', fontVariantNumeric: 'tabular-nums' }}>
                  Net 30 Days
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  PLACE OF SUPPLY
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#09090b' }}>
                  {po.city}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#71717a', letterSpacing: '0.04em', mb: 0.5 }}>
                  LINE ITEMS
                </Typography>
                <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#09090b' }}>
                  {po.skus.length} matched items
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3, pt: 0, gap: 1 }}>
          <Button
            variant="outlined"
            onClick={() => setIsAutomateModalOpen(false)}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              color: '#09090b',
              borderColor: '#eaecf0',
              px: 3,
              '&:hover': { backgroundColor: '#f4f4f5', borderColor: '#d0d5dd' }
            }}
          >
            Discard
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              setIsInvoiceCreated(true);
              setIsAutomateModalOpen(false);
            }}
            sx={{
              borderRadius: '9999px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '13px',
              color: '#09090b',
              borderColor: '#eaecf0',
              px: 3,
              boxShadow: 'none',
              '&:hover': { backgroundColor: '#f4f4f5', borderColor: '#d0d5dd', boxShadow: 'none' }
            }}
          >
            Approve & Create
          </Button>
        </DialogActions>
      </Dialog>
      </Grid>
      
      {/* RIGHT SIDEBAR: TIMELINE */}
      <Grid item xs={12} md={3} sx={{ pt: '0 !important' }}>
        <TimelineSidebar po={po} />
      </Grid>
    </Grid>
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

const TimelineItem: React.FC<{
  title: string;
  description: string;
  iconBg: string;
  dotColor: string;
  tag: string;
  isAi?: boolean;
  date?: string;
  time: string;
  isLast?: boolean;
}> = ({ title, description, iconBg, dotColor, tag, isAi, date, time, isLast }) => (
  <Box sx={{ display: 'flex', position: 'relative', pb: 3.5 }}>
    {/* Line */}
    {!isLast && (
      <Box sx={{ position: 'absolute', left: '15px', top: '30px', bottom: '-5px', width: '2px', backgroundColor: '#eaecf0' }} />
    )}
    
    {/* Icon Area */}
    <Box sx={{ width: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', mr: 2, zIndex: 1, pt: 0.5 }}>
      <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dotColor, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `3px solid ${iconBg}` }} />
    </Box>
    
    {/* Content Area */}
    <Box sx={{ flex: 1, pt: 0.5 }}>
      {date && (
        <Typography sx={{ fontSize: '10px', fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.06em', textTransform: 'uppercase', mb: 1 }}>
          {date}
        </Typography>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
        <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#09090b', display: 'flex', alignItems: 'center', gap: 0.75 }}>
          {title}
          {isAi && <AutoAwesomeIcon sx={{ fontSize: 14, color: '#8b5cf6' }} />}
        </Typography>
        <Box sx={{ backgroundColor: '#f4f4f5', px: 1, py: 0.25, borderRadius: '4px' }}>
          <Typography sx={{ fontSize: '10px', fontWeight: 600, color: '#3f3f46' }}>
            {tag}
          </Typography>
        </Box>
      </Box>
      <Typography sx={{ fontSize: '13px', color: '#71717a', mb: 0.5, lineHeight: 1.4 }}>
        {description}
      </Typography>
      <Typography sx={{ fontSize: '11px', color: '#a1a1aa' }}>
        {time}
      </Typography>
    </Box>
  </Box>
);

const TimelineSidebar: React.FC<{ po: any }> = ({ po }) => {
  return (
    <Box sx={{ pl: 2, height: '100%' }}>
      <Box sx={{ mb: 4 }}>
        <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#09090b' }}>
          Timeline
        </Typography>
        <Typography sx={{ fontSize: '13px', color: '#71717a', mt: 0.5 }}>
          Activity on {po.id}
        </Typography>
      </Box>

      {/* TIMELINE ITEMS */}
      <Box sx={{ position: 'relative' }}>
        <TimelineItem 
          title="Email Received"
          description="Fetched PO from email contents"
          iconBg="#eff6ff"
          dotColor="#3b82f6"
          tag="PO"
          isAi={true}
          date="FEB 14, 2025"
          time="10:00 AM"
        />
        <TimelineItem 
          title="Invoice Created"
          description="System generated invoice"
          iconBg="#dcfce7"
          dotColor="#22c55e"
          tag="INV"
          isAi={false}
          date="FEB 18, 2025"
          time="02:15 PM"
        />
        <TimelineItem 
          title="Sent invoice to vendor"
          description="System sent invoice"
          iconBg="#e0f2fe"
          dotColor="#0ea5e9"
          tag="Sent"
          isAi={false}
          time="02:20 PM"
        />
        <TimelineItem 
          title="Sent followups for payment"
          description="Automated payment reminder"
          iconBg="#fef3c7"
          dotColor="#f59e0b"
          tag="Alert"
          isAi={true}
          date="FEB 25, 2025"
          time="10:00 AM"
        />
        <TimelineItem 
          title="Emailed asking debit note"
          description="Requested debit note for shortage"
          iconBg="#fee2e2"
          dotColor="#ef4444"
          tag="Note"
          isAi={true}
          date="FEB 28, 2025"
          time="11:30 AM"
          isLast={true}
        />
      </Box>
    </Box>
  );
};

export default PODetailsPage;

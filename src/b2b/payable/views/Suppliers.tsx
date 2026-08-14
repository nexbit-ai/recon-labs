// Suppliers - Vendor master and transaction history.
import React, { useState } from 'react';
import { Box, Typography, Button, Tabs, Tab } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import { StorefrontOutlined, ArrowBackOutlined } from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../../components/primitives';
import { VENDORS, INVOICES, POS, CREDIT_NOTES, CONTRACTS } from '../mock/apData';

function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString('en-IN')}`;
}

const Suppliers: React.FC = () => {
  const reduce = useReducedMotion();
  const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState(0);

  // ── List View ─────────────────────────────────────────────────────────────
  if (selectedVendorId === null) {
    return (
      <Box
        component={motion.div}
        initial={reduce ? false : { opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        <PageTitle sx={{ mb: `${space.xl}px` }}>Supplier Management</PageTitle>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
          {VENDORS.map((vendor) => {
            // Calculate Metrics
            const vendorInvoices = INVOICES.filter((inv) => inv.vendor === vendor.id);
            const vendorPOs = POS.filter((po) => po.vendor === vendor.id);
            const totalVolume = vendorInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
            const openInvoicesCount = vendorInvoices.filter((inv) => inv.invoiceStatus !== 'Paid').length;
            
            return (
              <Box 
                key={vendor.id} 
                onClick={() => setSelectedVendorId(vendor.id)}
                sx={{ 
                  ...cardSx,
                  px: `${space.xl}px`,
                  py: `${space.lg}px`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: `${space.lg}px`,
                  cursor: 'pointer',
                  '&:hover': { bgcolor: colors.grey100 },
                  flexWrap: 'wrap',
                }}
              >
                <StorefrontOutlined sx={{ fontSize: 24, color: colors.grey500, flexShrink: 0 }} />
                
                {/* Vendor Info */}
                <Box sx={{ flex: 1, minWidth: 200 }}>
                  <Typography sx={{ fontSize: 15, fontWeight: 600, color: colors.ink, mb: '2px' }}>
                    {vendor.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
                    {vendor.vendorCode} · {vendor.state} · GSTIN: {vendor.gstin}
                  </Typography>
                </Box>
                
                {/* Metrics */}
                <Box sx={{ display: 'flex', gap: `${space.xl}px`, textAlign: 'right', flexWrap: 'wrap' }}>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                      {vendorPOs.length}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Total POs</Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: openInvoicesCount > 0 ? colors.accent : colors.ink, ...tabularNums }}>
                      {openInvoicesCount}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Open Invoices</Typography>
                  </Box>
                  <Box sx={{ minWidth: 100 }}>
                    <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, ...tabularNums }}>
                      {formatINR(totalVolume)}
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: colors.grey500 }}>Lifetime Vol.</Typography>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  // ── Detail View ───────────────────────────────────────────────────────────
  const vendor = VENDORS.find((v) => v.id === selectedVendorId);
  if (!vendor) return null;

  const vendorInvoices = INVOICES.filter((inv) => inv.vendor === vendor.id);
  const vendorPOs = POS.filter((po) => po.vendor === vendor.id);
  const vendorCNs = CREDIT_NOTES.filter((cn) => cn.vendor === vendor.id);
  const vendorContracts = CONTRACTS.filter((ct) => ct.vendorId === vendor.id);

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Title & Nav */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.lg}px`, mb: `${space.xl}px`, flexWrap: 'wrap' }}>
        <Button
          onClick={() => {
            setSelectedVendorId(null);
            setCurrentTab(0);
          }}
          sx={{
            minWidth: 0,
            p: `${space.sm}px`,
            color: colors.grey700,
            border: hairline,
            bgcolor: colors.paper,
            '&:hover': { bgcolor: colors.grey100, color: colors.ink },
          }}
        >
          <ArrowBackOutlined sx={{ fontSize: 20 }} />
        </Button>
        <PageTitle sx={{ m: 0 }}>Supplier: {vendor.name}</PageTitle>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.xxl}px` }}>
        
        {/* Vendor Meta */}
        <Box sx={{ ...cardSx, p: `${space.xl}px`, display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, gap: `${space.lg}px` }}>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Code</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{vendor.vendorCode}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>State</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{vendor.state}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>GSTIN</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{vendor.gstin}</Typography>
          </Box>
          <Box>
            <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.xs}px` }}>Payment Terms</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink }}>{vendor.paymentTerms}</Typography>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: hairline }}>
          <Tabs 
            value={currentTab} 
            onChange={(_, val) => setCurrentTab(val)}
            TabIndicatorProps={{ style: { backgroundColor: colors.ink, height: '2px' } }}
            sx={{
              minHeight: 40,
              '& .MuiTab-root': { 
                textTransform: 'none', 
                fontWeight: 600, 
                color: colors.grey500, 
                minWidth: 0, 
                minHeight: 40,
                px: `${space.md}px`,
                mr: `${space.lg}px`,
                fontSize: 14,
              },
              '& .Mui-selected': { color: `${colors.ink} !important` }
            }}
          >
            <Tab label={`Invoices (${vendorInvoices.length})`} />
            <Tab label={`Purchase Orders (${vendorPOs.length})`} />
            <Tab label={`Credit Notes (${vendorCNs.length})`} />
            <Tab label={`Contracts (${vendorContracts.length})`} />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box>
          {currentTab === 0 && (
            <Box>
              <Box sx={{ ...cardSx, border: hairline }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '12px', borderBottom: hairline, bgcolor: colors.grey100 }}>
                  <ColumnLabel>Invoice #</ColumnLabel>
                  <ColumnLabel>Date</ColumnLabel>
                  <ColumnLabel align="right">Amount</ColumnLabel>
                  <ColumnLabel>Match</ColumnLabel>
                  <ColumnLabel>Status</ColumnLabel>
                </Box>
                {vendorInvoices.length === 0 && <Typography sx={{ p: `${space.xl}px`, fontSize: 13, color: colors.grey500 }}>No invoices found.</Typography>}
                {vendorInvoices.map((inv, i) => (
                  <Box key={inv.id} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '16px', borderBottom: i < vendorInvoices.length - 1 ? hairline : 'none', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{inv.id}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{inv.date}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>{formatINR(inv.totalAmount)}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: inv.matchStatus === 'Match' ? colors.grey700 : colors.accent }}>{inv.matchStatus}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.grey700 }}>{inv.invoiceStatus}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {currentTab === 1 && (
            <Box>
              <Box sx={{ ...cardSx, border: hairline }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '12px', borderBottom: hairline, bgcolor: colors.grey100 }}>
                  <ColumnLabel>PO #</ColumnLabel>
                  <ColumnLabel>Date</ColumnLabel>
                  <ColumnLabel align="right">Amount</ColumnLabel>
                  <ColumnLabel>Status</ColumnLabel>
                </Box>
                {vendorPOs.length === 0 && <Typography sx={{ p: `${space.xl}px`, fontSize: 13, color: colors.grey500 }}>No POs found.</Typography>}
                {vendorPOs.map((po, i) => (
                  <Box key={po.id} sx={{ display: 'grid', gridTemplateColumns: '150px 1fr 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '16px', borderBottom: i < vendorPOs.length - 1 ? hairline : 'none', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{po.id}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{po.date}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>{formatINR(po.totalValue)}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.grey700 }}>{po.status}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {currentTab === 2 && (
            <Box>
              <Box sx={{ ...cardSx, border: hairline }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '12px', borderBottom: hairline, bgcolor: colors.grey100 }}>
                  <ColumnLabel>CN #</ColumnLabel>
                  <ColumnLabel>Linked Inv</ColumnLabel>
                  <ColumnLabel>Reason</ColumnLabel>
                  <ColumnLabel align="right">Amount</ColumnLabel>
                  <ColumnLabel>Status</ColumnLabel>
                </Box>
                {vendorCNs.length === 0 && <Typography sx={{ p: `${space.xl}px`, fontSize: 13, color: colors.grey500 }}>No credit notes found.</Typography>}
                {vendorCNs.map((cn, i) => (
                  <Box key={cn.id} sx={{ display: 'grid', gridTemplateColumns: '120px 120px 1fr 120px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '16px', borderBottom: i < vendorCNs.length - 1 ? hairline : 'none', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{cn.id}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{cn.linkedInvoice}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{cn.reason}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>{formatINR(cn.amount)}</Typography>
                    <Typography sx={{ fontSize: 12, fontWeight: 500, color: colors.grey700 }}>{cn.status}</Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {currentTab === 3 && (
            <Box>
              <Box sx={{ ...cardSx, border: hairline }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 150px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '12px', borderBottom: hairline, bgcolor: colors.grey100 }}>
                  <ColumnLabel>Contract #</ColumnLabel>
                  <ColumnLabel>Validity</ColumnLabel>
                  <ColumnLabel>Payment Terms</ColumnLabel>
                  <ColumnLabel align="right">Credit Limit</ColumnLabel>
                  <ColumnLabel>Status</ColumnLabel>
                </Box>
                {vendorContracts.length === 0 && <Typography sx={{ p: `${space.xl}px`, fontSize: 13, color: colors.grey500 }}>No active contracts.</Typography>}
                {vendorContracts.map((ct, i) => (
                  <Box key={ct.contractId} sx={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 150px 120px', gap: `${space.md}px`, px: `${space.xl}px`, py: '16px', borderBottom: i < vendorContracts.length - 1 ? hairline : 'none', alignItems: 'center' }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{ct.contractId}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{ct.effectiveDate} to {ct.expiryDate}</Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{ct.paymentTerms}</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, ...tabularNums, textAlign: 'right' }}>{formatINR(ct.creditLimit)}</Typography>
                    <Box>
                      <Box
                        component="span"
                        sx={{
                          border: hairline,
                          bgcolor: ct.status === 'Active' ? colors.grey100 : colors.accentWash,
                          color: ct.status === 'Active' ? colors.grey700 : colors.accent,
                          fontSize: 11,
                          fontWeight: 600,
                          px: `${space.sm}px`,
                          py: '2px',
                          textTransform: 'uppercase',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {ct.status}
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </Box>

      </Box>
    </Box>
  );
};

export default Suppliers;

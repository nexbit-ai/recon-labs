import React, { useState } from 'react';
import { Box, Typography, IconButton, Dialog, Slide, Tabs, Tab } from '@mui/material';
import { CloseOutlined } from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { Vendor } from '../mock';
import { formatRupees } from '../lib/format';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface VendorDetailsPopupProps {
  vendor: any | null;
  onClose: () => void;
}

const VendorDetailsPopup: React.FC<VendorDetailsPopupProps> = ({ vendor, onClose }) => {
  const [tab, setTab] = useState(0);

  if (!vendor) return null;

  return (
    <Dialog
      fullScreen
      open={!!vendor}
      onClose={onClose}
      TransitionComponent={Transition}
      PaperProps={{
        sx: {
          borderRadius: 0,
          bgcolor: colors.paper,
        }
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: `${space.xl}px`,
          py: `${space.md}px`,
          borderBottom: hairline,
          bgcolor: colors.paper,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: type.pageTitle.fontSize, fontWeight: type.pageTitle.fontWeight, color: colors.ink }}>
            {vendor.name}
          </Typography>
          <Typography sx={{ fontSize: 13, color: colors.grey700, mt: '2px' }}>
            Vendor ID: {vendor.id} · Category: {vendor.category || vendor.channel || 'B2B Client'}
          </Typography>
        </Box>
        <IconButton onClick={onClose} sx={{ color: colors.ink }}>
          <CloseOutlined />
        </IconButton>
      </Box>

      {/* MAIN LAYOUT */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* LEFT COLUMN: TABS + CONTENT */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: hairline }}>
          <Box sx={{ borderBottom: hairline }}>
            <Tabs
              value={tab}
              onChange={(_, v) => setTab(v)}
              sx={{
                px: `${space.xl}px`,
                minHeight: 48,
                '& .MuiTab-root': {
                  textTransform: 'none',
                  minHeight: 48,
                  fontSize: 14,
                  fontWeight: 500,
                  color: colors.grey700,
                  px: 0,
                  mr: `${space.xl}px`,
                },
                '& .Mui-selected': { color: `${colors.accent} !important` },
                '& .MuiTabs-indicator': { backgroundColor: colors.accent, height: 2 },
              }}
            >
              <Tab label="Contracts" />
              <Tab label="Invoices" />
              <Tab label="Payment Receipts" />
            </Tabs>
          </Box>
          
          <Box sx={{ flex: 1, overflow: 'auto', p: `${space.xl}px` }}>
            {tab === 0 && (
              <Box>
                <Typography sx={{ fontSize: type.sectionTitle.fontSize, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
                  Active Contracts
                </Typography>
                <Box sx={{ border: hairline, p: `${space.xl}px`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: colors.grey500 }}>
                    Rate card details and secondary discounts would be displayed here.
                  </Typography>
                </Box>
              </Box>
            )}
            {tab === 1 && (
              <Box>
                <Typography sx={{ fontSize: type.sectionTitle.fontSize, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
                  Recent Invoices
                </Typography>
                <Box sx={{ border: hairline }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: `${space.md}px`, px: `${space.lg}px`, py: `${space.sm}px`, bgcolor: colors.grey100, borderBottom: hairline }}>
                    <Typography sx={{ ...type.label, color: colors.grey700 }}>Invoice ID</Typography>
                    <Typography sx={{ ...type.label, color: colors.grey700 }}>Date</Typography>
                    <Typography sx={{ ...type.label, color: colors.grey700, textAlign: 'right' }}>Amount</Typography>
                    <Typography sx={{ ...type.label, color: colors.grey700, textAlign: 'right' }}>Status</Typography>
                  </Box>
                  <Box sx={{ px: `${space.lg}px`, py: `${space.xl}px`, textAlign: 'center' }}>
                    <Typography sx={{ fontSize: 14, color: colors.grey500 }}>
                      No invoices currently matched for {vendor.name}.
                    </Typography>
                  </Box>
                </Box>
              </Box>
            )}
            {tab === 2 && (
              <Box>
                <Typography sx={{ fontSize: type.sectionTitle.fontSize, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
                  Payment Receipts
                </Typography>
                <Box sx={{ border: hairline, p: `${space.xl}px`, textAlign: 'center' }}>
                  <Typography sx={{ fontSize: 14, color: colors.grey500 }}>
                    Payment records will appear here.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </Box>

        {/* RIGHT COLUMN: SIDEBAR */}
        <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', bgcolor: colors.grey100 }}>
          {/* Metrics */}
          <Box sx={{ p: `${space.xl}px`, borderBottom: hairline, bgcolor: colors.paper }}>
            <Typography sx={{ fontSize: type.sectionTitle.fontSize, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
              Vendor Overview
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.lg}px` }}>
              <Box>
                <Typography sx={{ ...type.label, color: colors.grey700, mb: '4px' }}>Invoice Count</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                  {vendor.invoiceCount.toLocaleString('en-IN')}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ ...type.label, color: colors.grey700, mb: '4px' }}>Total Billed</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                  {formatRupees(vendor.totalBilled || vendor.totalTransactions || 0)}
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ ...type.label, color: colors.grey700, mb: '4px' }}>Total Settled</Typography>
                <Typography sx={{ fontSize: 24, fontWeight: 500, color: colors.ink, ...tabularNums }}>
                  {formatRupees(vendor.totalSettled || vendor.totalPaymentReceived || 0)}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Emails */}
          <Box sx={{ p: `${space.xl}px`, flex: 1, overflow: 'auto' }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: colors.ink, mb: `${space.lg}px` }}>
              Communications
            </Typography>
            
            {(!vendor.emails || vendor.emails.length === 0) ? (
              <Typography sx={{ fontSize: 13, color: colors.grey500 }}>No communications found.</Typography>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
                {vendor.emails.map((email: any) => (
                  <Box key={email.id} sx={{ bgcolor: colors.paper, border: hairline, p: `${space.md}px` }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: '4px' }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.ink }}>
                        {email.sender}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: colors.grey500 }}>
                        {email.date}
                      </Typography>
                    </Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink, mb: '4px' }}>
                      {email.subject}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: colors.grey700, display: '-webkit-box', overflow: 'hidden', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>
                      {email.snippet}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Dialog>
  );
};

export default VendorDetailsPopup;

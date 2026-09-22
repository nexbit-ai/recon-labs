import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Paper,
  Button,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { B2BInvoice } from '../mock/b2bReconData';
import { formatRupees } from '../lib/format';
import { shell } from '../theme/b2bTokens';

interface InvoiceDetailsDrawerProps {
  open: boolean;
  onClose: () => void;
  invoice: B2BInvoice | null;
  onOpenLinkedPayment: (utrId: string) => void;
}

export const InvoiceDetailsDrawer: React.FC<InvoiceDetailsDrawerProps> = ({
  open,
  onClose,
  invoice,
  onOpenLinkedPayment,
}) => {
  if (!invoice) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: `calc(100vw - ${shell.sidebarWidth}px)`,
          maxWidth: 1200,
          backgroundColor: '#f8fafc',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* HEADER */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
        <Box>
          <Typography sx={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>
            Invoice {invoice.id}
          </Typography>
          <Typography sx={{ fontSize: '13px', color: '#64748b', mt: 0.5 }}>
            Client: <Box component="span" sx={{ fontWeight: 600, color: '#0f172a' }}>{invoice.clientName}</Box> • Date: {invoice.displayDate}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: '#64748b', '&:hover': { bgcolor: '#f1f5f9', color: '#0f172a' } }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* CONTENT: Split View */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* LEFT PANE: PDF View */}
        <Box sx={{ flex: 1, p: 3, display: 'flex', flexDirection: 'column', borderRight: '1px solid #e2e8f0', bgcolor: '#e2e8f0' }}>
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
            Original Invoice Document
          </Typography>
          <Box sx={{ flex: 1, overflowY: 'auto', display: 'flex', justifyContent: 'center', p: 2 }}>
            <Paper elevation={3} sx={{ width: '100%', maxWidth: '800px', bgcolor: '#ffffff', p: 5, display: 'flex', flexDirection: 'column', color: '#1e293b' }}>
              {/* Header */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #e2e8f0', pb: 3, mb: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: '28px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
                    INVOICE
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748b', mt: 1 }}>
                    Reference: {invoice.id}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>Nexbit Inc.</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748b' }}>123 Tech Park, Sector 4<br/>Bangalore, KA 560001<br/>GSTIN: 29XXXXX0000X1Z5</Typography>
                </Box>
              </Box>

              {/* Bill To & Details */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
                <Box>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', mb: 1 }}>Billed To</Typography>
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>{invoice.clientName}</Typography>
                  <Typography sx={{ fontSize: '12px', color: '#64748b', mt: 0.5 }}>
                    Client ID: {invoice.clientId}<br/>
                    Billing Address on File<br/>
                    India
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>Invoice Date:</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>{invoice.displayDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mb: 1 }}>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>Due Date:</Typography>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, width: '100px' }}>{invoice.dueDate}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Typography sx={{ fontSize: '12px', color: '#64748b' }}>Amount Due:</Typography>
                    <Typography sx={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', width: '100px' }}>{formatRupees(invoice.grossAmount)}</Typography>
                  </Box>
                </Box>
              </Box>

              {/* Items Table */}
              <Box sx={{ mb: 4, flex: 1 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', borderBottom: '1px solid #cbd5e1', pb: 1, mb: 2 }}>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>Description</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'center' }}>Qty</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Rate</Typography>
                  <Typography sx={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', textAlign: 'right' }}>Amount</Typography>
                </Box>
                
                {/* Mock Items based on gross amount */}
                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography sx={{ fontSize: '13px', color: '#334155' }}>Standard Supply / Fulfillment Services</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'center' }}>1</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'right' }}>{formatRupees(invoice.grossAmount * 0.8)}</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'right', fontWeight: 500 }}>{formatRupees(invoice.grossAmount * 0.8)}</Typography>
                </Box>
                <Box sx={{ display: 'grid', gridTemplateColumns: '3fr 1fr 1fr 1fr', py: 1.5, borderBottom: '1px solid #f1f5f9' }}>
                  <Typography sx={{ fontSize: '13px', color: '#334155' }}>Logistics & Handling</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'center' }}>1</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'right' }}>{formatRupees(invoice.grossAmount * 0.2)}</Typography>
                  <Typography sx={{ fontSize: '13px', color: '#334155', textAlign: 'right', fontWeight: 500 }}>{formatRupees(invoice.grossAmount * 0.2)}</Typography>
                </Box>
              </Box>

              {/* Totals */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px solid #e2e8f0', pt: 3 }}>
                <Box sx={{ width: '300px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontSize: '13px', color: '#64748b' }}>Subtotal:</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>{formatRupees(invoice.grossAmount)}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography sx={{ fontSize: '13px', color: '#64748b' }}>Tax (0%):</Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 600 }}>₹0</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#f8fafc', borderRadius: '4px' }}>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Total:</Typography>
                    <Typography sx={{ fontSize: '16px', fontWeight: 700, color: '#16a34a' }}>{formatRupees(invoice.grossAmount)}</Typography>
                  </Box>
                </Box>
              </Box>
            </Paper>
          </Box>
        </Box>

        {/* RIGHT PANE: Details & Notes */}
        <Box sx={{ width: 420, p: 3, overflowY: 'auto', bgcolor: '#ffffff' }}>
          
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
            Settlement Summary
          </Typography>
          
          <Paper elevation={0} sx={{ p: 2, bgcolor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', mb: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '13px', color: '#475569' }}>Gross Billed Amount:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                {formatRupees(invoice.grossAmount)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '13px', color: '#dc2626' }}>TDS Deducted (10%):</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                -{formatRupees(invoice.tds)}
              </Typography>
            </Box>
            
            {(invoice.creditNotesTotal > 0 || invoice.debitNotesTotal > 0) && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
                <Typography sx={{ fontSize: '13px', color: '#dc2626' }}>CN/DN Applied:</Typography>
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: '#dc2626', fontVariantNumeric: 'tabular-nums' }}>
                  -{formatRupees(invoice.creditNotesTotal + invoice.debitNotesTotal)}
                </Typography>
              </Box>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1.5, borderTop: '1px dashed #cbd5e1', mb: 1.5 }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 700 }}>Net Payable:</Typography>
              <Typography sx={{ fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
                {formatRupees(invoice.netPayable)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography sx={{ fontSize: '13px', color: '#16a34a', fontWeight: 600 }}>Settled Amount:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#16a34a', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupees(invoice.settledAmount)}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '13px', color: invoice.balanceDue > 0 ? '#b91c1c' : '#475569', fontWeight: 600 }}>Balance Due:</Typography>
              <Typography sx={{ fontSize: '13px', fontWeight: 700, color: invoice.balanceDue > 0 ? '#b91c1c' : '#475569', fontVariantNumeric: 'tabular-nums' }}>
                {formatRupees(invoice.balanceDue)}
              </Typography>
            </Box>
          </Paper>

          {/* Credit / Debit Notes Section */}
          <Typography sx={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
            Matching Notes (CN/DN)
          </Typography>
          
          {invoice.notes && invoice.notes.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
              {invoice.notes.map((n) => (
                <Paper key={n.id} elevation={0} sx={{ p: 2, border: '1px solid #fed7aa', bgcolor: '#fff7ed', borderRadius: '8px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#9a3412' }}>
                      {n.referenceNo}
                      <Box component="span" sx={{ ml: 1, px: 1, py: 0.25, bgcolor: '#ffedd5', border: '1px solid #fdba74', borderRadius: '4px', fontSize: '10px' }}>
                        {n.type}
                      </Box>
                    </Typography>
                    <Typography sx={{ fontSize: '13px', fontWeight: 700, color: '#9a3412', fontVariantNumeric: 'tabular-nums' }}>
                      {formatRupees(n.amount)}
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '12px', color: '#7c2d12', mb: 0.5 }}>
                    <span style={{ opacity: 0.8 }}>Reason:</span> {n.reason}
                  </Typography>
                  <Typography sx={{ fontSize: '12px', color: '#7c2d12' }}>
                    <span style={{ opacity: 0.8 }}>Status:</span> <strong>{n.status}</strong>
                  </Typography>
                </Paper>
              ))}
            </Box>
          ) : (
            <Typography sx={{ fontSize: '13px', color: '#94a3b8', fontStyle: 'italic', mb: 3, p: 2, bgcolor: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              No Credit Notes or Debit Notes applied to this invoice.
            </Typography>
          )}


        </Box>
      </Box>
    </Drawer>
  );
};

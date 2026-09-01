// AP Ingest — document intake screen.
// Mirrors /b2b/upload exactly: drag-and-drop zone + email forwarding card,
// today's processing counts, recently received feed.
// AP-specific doc types: PO, GRN, Invoice, Credit Note, Ledger.
import React, { useState } from 'react';
import { Box, Typography, Button, IconButton, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CloudUploadOutlined,
  ContentCopyOutlined,
  InsertDriveFileOutlined,
  SyncOutlined,
} from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../../components/primitives';

const INBOX = 'ap-inbox@usenexbit.com';

const RECENT_EMAILS = [
  { subject: 'Fwd: Invoice #INV-7824 - Infosys BPO Services', sender: 'finance@shreecements.com', tag: 'Invoice 1' },
  { subject: 'Purchase Order PO-2024-004 from Tata Motors', sender: 'ap@tataancillaries.in', tag: 'PO 1' },
  { subject: 'Credit Note CN-001 for Short GRN', sender: 'finance@shreecements.com', tag: 'Credit Note 1' },
];

// ── Today's processing ───────────────────────────────────────────────────────
const PROCESSED_TODAY = [
  { value: '5',  label: 'Purchase Orders' },
  { value: '5',  label: 'GRNs' },
  { value: '6',  label: 'Invoices' },
  { value: '2',  label: 'Credit Notes' },
  { value: '2',  label: 'Ledger Files' },
  { value: '14', label: 'Total documents' },
];

// ── Recently received feed ───────────────────────────────────────────────────
type ReceiveStatus = 'Processed' | 'Needs review' | 'Exception';

interface ReceivedFile {
  name: string;
  docType: string;
  source: string;
  time: string;
  confidence: number;
  amount: string;
  status: ReceiveStatus;
  note?: string;
  supplier: string;
  tags: string[];
}

const RECEIVED_FILES: ReceivedFile[] = [
  {
    name: 'PO_TataMotors_PO-2024-004.pdf',
    docType: 'Purchase Order',
    source: 'Auto-fetch',
    time: '8 mins ago',
    confidence: 99,
    amount: '₹2,70,000',
    status: 'Processed',
    supplier: 'Tata Motors Ancillaries Ltd',
    tags: ['PO-2024-004'],
  },
  {
    name: 'INV-7824_InfBPO_Jun.pdf',
    docType: 'Invoice',
    source: 'Email forwarding',
    time: '22 mins ago',
    confidence: 97,
    amount: '₹2,30,400',
    status: 'Exception',
    note: 'GST rate mismatch detected — 28% vs 18% applicable',
    supplier: 'Infosys BPO Services',
    tags: ['INV-7824', 'PO-2024-003'],
  },
  {
    name: 'GRN-002_ShreeCements_scan.jpg',
    docType: 'GRN',
    source: 'Upload',
    time: '40 mins ago',
    confidence: 62,
    amount: '₹6,84,000',
    status: 'Needs review',
    note: 'Scan quality low — short GRN qty partially unreadable',
    supplier: 'Shree Cements Ltd',
    tags: ['GRN-002', 'PO-2024-002'],
  },
  {
    name: 'INV-7825_ShreeCements_Freight.pdf',
    docType: 'Invoice',
    source: 'Email forwarding',
    time: '55 mins ago',
    confidence: 91,
    amount: '₹9,97,040',
    status: 'Exception',
    note: 'Freight line ₹22,000 not in PO-2024-002',
    supplier: 'Shree Cements Ltd',
    tags: ['INV-7825', 'PO-2024-002'],
  },
  {
    name: 'CN-001_ShreeCements.pdf',
    docType: 'Credit Note',
    source: 'Email forwarding',
    time: '1.2 hrs ago',
    confidence: 95,
    amount: '₹76,000',
    status: 'Processed',
    supplier: 'Shree Cements Ltd',
    tags: ['CN-001', 'INV-7826'],
  },
  {
    name: 'LEDGER-Q2_ShrCem_Jul2024.xlsx',
    docType: 'Ledger File',
    source: 'Upload',
    time: '2 hrs ago',
    confidence: 88,
    amount: '₹2,46,200',
    status: 'Processed',
    supplier: 'Shree Cements Ltd',
    tags: ['LEDGER-Q2'],
  },
  {
    name: 'INV-7821_TataMotors_Match.pdf',
    docType: 'Invoice',
    source: 'Auto-fetch',
    time: '3 hrs ago',
    confidence: 99,
    amount: '₹10,08,900',
    status: 'Processed',
    supplier: 'Tata Motors Ancillaries Ltd',
    tags: ['INV-7821', 'PO-2024-001'],
  },
];

const StatusLabel: React.FC<{ status: ReceiveStatus }> = ({ status }) => {
  const neutral = status === 'Processed';
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        border: hairline,
        bgcolor: neutral ? colors.grey100 : colors.paper,
        color: neutral ? colors.grey700 : colors.ink,
        fontWeight: neutral ? 500 : 600,
        fontSize: 11,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        px: `${space.sm}px`,
        py: '3px',
        whiteSpace: 'nowrap',
      }}
    >
      {status}
    </Box>
  );
};

const APIngest: React.FC = () => {
  const reduce = useReducedMotion();
  const [syncing, setSyncing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<ReceivedFile | null>(null);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 2000);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(INBOX);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* Title + primary action */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          flexWrap: 'wrap',
        }}
      >
        <PageTitle>Document Intake</PageTitle>
        <Button
          onClick={handleSync}
          startIcon={
            <SyncOutlined
              sx={{
                fontSize: 18,
                animation: syncing && !reduce ? 'apspin 1s linear infinite' : 'none',
                '@keyframes apspin': { to: { transform: 'rotate(360deg)' } },
              }}
            />
          }
          sx={{
            bgcolor: colors.accent,
            color: colors.paper,
            fontSize: 13,
            fontWeight: 600,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            '&:hover': { bgcolor: colors.accentHover },
          }}
        >
          {syncing ? 'Syncing…' : 'Sync now'}
        </Button>
      </Box>

      {/* ── Intake row: drop zone + email forwarding ─────────────── */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: 'minmax(0, 1.4fr) minmax(0, 1fr)' },
          gap: `${space.xl}px`,
          mb: `${space.xxl}px`,
        }}
      >
        {/* Drop zone */}
        <Box
          role="button"
          tabIndex={0}
          sx={{
            border: `1px dashed ${colors.grey200}`,
            bgcolor: colors.paper,
            p: `${space.xxl}px`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'background-color 0.12s ease, border-color 0.12s ease',
            '&:hover': { bgcolor: colors.grey100, borderColor: colors.grey500 },
            '&:focus-visible': { outline: `2px solid ${colors.accent}`, outlineOffset: '2px' },
          }}
        >
          <CloudUploadOutlined sx={{ fontSize: 28, color: colors.grey700, mb: `${space.md}px` }} />
          <SectionTitle sx={{ mb: `${space.xs}px` }}>Drag &amp; drop AP documents</SectionTitle>
          <Typography sx={{ ...type.body, color: colors.grey700, mb: `${space.lg}px` }}>
            Supports PDF, Excel, CSV, XML · PO · GRN · Invoice · Credit Note · Ledger
          </Typography>
          <Button
            sx={{
              bgcolor: colors.ink,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              '&:hover': { bgcolor: '#000' },
            }}
          >
            Browse files
          </Button>
        </Box>

        {/* Email forwarding */}
        <Box>
          <Box sx={{ ...cardSx, p: `${space.xl}px`, mb: `${space.lg}px` }}>
            <SectionTitle sx={{ mb: `${space.sm}px` }}>Email forwarding</SectionTitle>
            <Typography sx={{ ...type.body, color: colors.grey700, mb: `${space.lg}px`, lineHeight: '20px' }}>
              Forward vendor invoices, POs, GRNs and credit notes directly to your AP AI inbox.
              Nexbit auto-classifies the document type and routes to the right queue.
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${space.sm}px`,
                border: hairline,
                bgcolor: colors.grey100,
                px: `${space.md}px`,
                py: `${space.sm}px`,
              }}
            >
              <Typography
                sx={{
                  flexGrow: 1,
                  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                  fontSize: 13,
                  color: colors.ink,
                }}
              >
                {INBOX}
              </Typography>
              <IconButton
                size="small"
                aria-label="Copy AP inbox address"
                onClick={handleCopy}
                sx={{ color: copied ? colors.accent : colors.grey700, borderRadius: 0, '&:hover': { color: colors.ink, bgcolor: 'transparent' } }}
              >
                <ContentCopyOutlined sx={{ fontSize: 16 }} />
              </IconButton>
            </Box>
            {copied && (
              <Typography sx={{ fontSize: 12, color: colors.accent, mt: `${space.xs}px` }}>
                Copied to clipboard
              </Typography>
            )}
          </Box>

          {/* Recent Email Processings */}
          <Box sx={{ ...cardSx, p: `${space.xl}px` }}>
            <SectionTitle sx={{ mb: `${space.sm}px` }}>Recent Email Processings</SectionTitle>
            <Typography sx={{ ...type.body, color: colors.grey700, lineHeight: '20px', mb: `${space.md}px` }}>
              Emails recently processed by the AP AI inbox.
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
              {RECENT_EMAILS.map((email, i) => (
                <Box key={i} sx={{ border: hairline, p: `${space.md}px`, bgcolor: colors.grey100 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: `${space.xs}px` }}>
                    <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, pr: `${space.sm}px` }}>
                      {email.subject}
                    </Typography>
                    <Box
                      component="span"
                      sx={{
                        border: hairline,
                        bgcolor: colors.paper,
                        color: colors.ink,
                        fontSize: 11,
                        fontWeight: 600,
                        px: `${space.sm}px`,
                        py: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {email.tag}
                    </Box>
                  </Box>
                  <Typography sx={{ fontSize: 12, color: colors.grey700 }}>
                    From: {email.sender}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>

      {/* ── Today's processing ───────────────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Today's processing</SectionTitle>
      <Box sx={{ ...cardSx, mb: `${space.xxl}px` }}>
        <Box sx={{ px: `${space.xl}px`, py: `${space.md}px`, borderBottom: hairline, bgcolor: colors.grey100 }}>
          <ColumnLabel>Auto-detected AP documents</ColumnLabel>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(6, 1fr)' },
          }}
        >
          {PROCESSED_TODAY.map((s, i) => (
            <Box
              key={s.label}
              sx={{
                p: `${space.xl}px`,
                borderLeft: { md: i % 6 === 0 ? 'none' : hairline },
                borderTop: { xs: i >= 2 ? hairline : 'none', md: 'none' },
              }}
            >
              <Typography sx={{ fontSize: 24, lineHeight: '30px', fontWeight: 600, color: colors.ink, ...tabularNums }}>
                {s.value}
              </Typography>
              <Typography sx={{ ...type.label, color: colors.grey700, mt: '2px' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Recently received ────────────────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Recently received</SectionTitle>
      <Box sx={{ ...cardSx }}>
        {RECEIVED_FILES.map((file, idx) => {
          const lowConfidence = file.status !== 'Processed';
          return (
            <Box
              key={file.name}
              onClick={() => setSelectedDoc(file)}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${space.lg}px`,
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderTop: idx === 0 ? 'none' : hairline,
                borderLeft: lowConfidence ? `2px solid ${colors.accent}` : '2px solid transparent',
                cursor: 'pointer',
                transition: 'background-color 0.12s ease',
                '&:hover': { bgcolor: colors.grey100 },
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  border: hairline,
                  bgcolor: colors.grey100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <InsertDriveFileOutlined sx={{ fontSize: 20, color: colors.grey500 }} />
              </Box>

              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.md}px`, mb: '2px', flexWrap: 'wrap' }}>
                  <Typography sx={{ ...type.body, fontWeight: 500, color: colors.ink }}>{file.name}</Typography>
                  <Typography sx={{ ...type.label, color: colors.grey500 }}>{file.docType}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.ink }}>• {file.supplier}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, flexWrap: 'wrap', mb: '4px' }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{file.source}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey500 }}>·</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>{file.time}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey500 }}>·</Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: lowConfidence ? 600 : 400,
                      color: lowConfidence ? colors.ink : colors.grey700,
                      ...tabularNums,
                    }}
                  >
                    {file.confidence}% confidence
                  </Typography>
                  {file.note && (
                    <>
                      <Typography sx={{ fontSize: 13, color: colors.grey500 }}>·</Typography>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{file.note}</Typography>
                    </>
                  )}
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  {file.tags.map(tag => (
                    <Box
                      key={tag}
                      component="span"
                      sx={{
                        border: hairline,
                        bgcolor: colors.paper,
                        color: colors.ink,
                        fontSize: 10,
                        fontWeight: 600,
                        px: '6px',
                        py: '2px',
                        textTransform: 'uppercase',
                      }}
                    >
                      {tag}
                    </Box>
                  ))}
                </Box>
              </Box>

              <Typography
                sx={{
                  flexShrink: 0,
                  ...type.body,
                  fontWeight: 600,
                  color: file.amount === '—' ? colors.grey500 : colors.ink,
                  ...tabularNums,
                }}
              >
                {file.amount}
              </Typography>
              <Box sx={{ flexShrink: 0, display: 'flex', justifyContent: 'flex-end', minWidth: 104 }}>
                <StatusLabel status={file.status} />
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* ── Document Comparison Modal ─────────────────────────────────────── */}
      <Dialog 
        open={!!selectedDoc} 
        onClose={() => setSelectedDoc(null)}
        maxWidth="lg"
        fullWidth
        PaperProps={{ sx: { borderRadius: 0, border: hairline, boxShadow: 'none' } }}
      >
        <DialogTitle sx={{ borderBottom: hairline, bgcolor: colors.grey100, px: `${space.xl}px`, py: `${space.lg}px` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, color: colors.ink }}>
              Document Verification: {selectedDoc?.name}
            </Typography>
            {selectedDoc && <StatusLabel status={selectedDoc.status} />}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: 500 }}>
            {/* Left: Raw Document */}
            <Box sx={{ p: `${space.xl}px`, borderRight: hairline, bgcolor: colors.grey100, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.md}px` }}>Raw Document</Typography>
              <Box sx={{ flex: 1, border: hairline, bgcolor: colors.paper, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: `${space.md}px` }}>
                <InsertDriveFileOutlined sx={{ fontSize: 48, color: colors.grey500 }} />
                <Typography sx={{ fontSize: 13, color: colors.grey700 }}>[Document Preview Rendered Here]</Typography>
              </Box>
            </Box>
            {/* Right: Extracted Data */}
            <Box sx={{ p: `${space.xl}px`, display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ ...type.label, color: colors.grey500, mb: `${space.md}px` }}>Extracted Data</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: `${space.md}px` }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: hairline, pb: `${space.xs}px` }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Document Type</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>{selectedDoc?.docType}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: hairline, pb: `${space.xs}px` }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Source</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>{selectedDoc?.source}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: hairline, pb: `${space.xs}px` }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Amount</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink, ...tabularNums }}>{selectedDoc?.amount}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', borderBottom: hairline, pb: `${space.xs}px` }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>Extraction Confidence</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 600, color: selectedDoc && selectedDoc.confidence < 80 ? colors.accent : colors.ink, ...tabularNums }}>{selectedDoc?.confidence}%</Typography>
                </Box>
                {selectedDoc?.note && (
                   <Box sx={{ mt: `${space.md}px`, p: `${space.md}px`, bgcolor: colors.accentWash, border: `1px solid ${colors.accent}` }}>
                     <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.accent }}>⚠ {selectedDoc.note}</Typography>
                   </Box>
                )}
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: hairline, px: `${space.xl}px`, py: `${space.md}px` }}>
          <Button onClick={() => setSelectedDoc(null)} sx={{ color: colors.ink, fontWeight: 600 }}>Close</Button>
          {selectedDoc?.status !== 'Processed' && (
            <Button sx={{ bgcolor: colors.accent, color: colors.paper, '&:hover': { bgcolor: colors.accentHover } }}>
              Resolve Exception
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default APIngest;

// B2B Upload — document intake. Auto-fetch / email-forwarding / manual drop, a
// daily processing summary, and a "recently received" feed. Conforms to
// docs/B2B_DESIGN_SYSTEM.md: square corners, hairline borders, monochrome + one
// accent (#7A5DBF). Status and low-confidence exceptions are NEVER colour-coded
// — they are expressed through type weight and hairline-bordered labels. The
// accent appears only on the single primary action (Sync) and the modal CTA.
import React, { useState, useRef } from 'react';
import { Box, Typography, Button, IconButton, Tabs, Tab } from '@mui/material';
import { motion, useReducedMotion } from 'framer-motion';
import {
  CloudUploadOutlined,
  ContentCopyOutlined,
  InsertDriveFileOutlined,
  SyncOutlined,
} from '@mui/icons-material';
import { colors, hairline, type, space, tabularNums } from '../theme/b2bTokens';
import { cardSx, PageTitle, SectionTitle, ColumnLabel } from '../components/primitives';
import UploadSettlementModal from '../components/UploadSettlementModal';
import { pendingFromCounterparty } from '../mock';
import { formatRupees } from '../lib/format';

const INBOX = 'inbox-kp@usenexbit.com';

// ── Daily processing counts ─────────────────────────────────────────────────
const PROCESSED_TODAY = [
  { value: '8', label: 'Purchase Orders' },
  { value: '14', label: 'GRNs' },
  { value: '22', label: 'Invoices' },
  { value: '6', label: 'Settlements' },
  { value: '1', label: 'Bank Statements' },
  { value: '4', label: 'Debit / Credit Notes' },
];

// ── Recently received feed ──────────────────────────────────────────────────
// status: 'Processed' is neutral; 'Needs review' / 'Exception' are attention
// states. Differentiated by weight + hairline label, never by hue.
type ReceiveStatus = 'Processed' | 'Needs review' | 'Exception';

interface ReceivedFile {
  name: string;
  docType: string;
  source: string;
  time: string;
  confidence: number;
  amount: string;
  status: ReceiveStatus;
  note?: string; // why confidence is low / what needs attention
}

const TABS = [
  'Purchase Order',
  'Tax invoice',
  'Debit note',
  'Credit note',
  'GRN',
  'Other'
];

const RECEIVED_FILES: ReceivedFile[] = [
  {
    name: 'PO_Zepto_48291.pdf',
    docType: 'Purchase Order',
    source: 'Auto-fetch',
    time: '10 mins ago',
    confidence: 99,
    amount: '₹1.4 L',
    status: 'Processed',
  },
  {
    name: 'Invoice_BlinkitFMCG_Q2.xlsx',
    docType: 'Tax invoice',
    source: 'Email forwarding',
    time: '24 mins ago',
    confidence: 96,
    amount: '₹8.7 L',
    status: 'Processed',
  },
  {
    name: 'GRN_Instamart_scan_0917.jpg',
    docType: 'GRN',
    source: 'Upload',
    time: '38 mins ago',
    confidence: 61,
    amount: '₹2.1 L',
    status: 'Needs review',
    note: 'Low scan quality — line items partially unreadable',
  },
  {
    name: 'Settlement_Swiggy_May.csv',
    docType: 'Other',
    source: 'Auto-fetch',
    time: '1 hour ago',
    confidence: 92,
    amount: '₹14.2 L',
    status: 'Processed',
  },
  {
    name: 'DebitNote_Reliance_unknown.pdf',
    docType: 'Debit note',
    source: 'Email forwarding',
    time: '2 hours ago',
    confidence: 43,
    amount: '—',
    status: 'Exception',
    note: 'Document type ambiguous — could not extract amount',
  },
  {
    name: 'BankStatement_HDFC_Apr.pdf',
    docType: 'Other',
    source: 'Upload',
    time: '3 hours ago',
    confidence: 88,
    amount: '₹52.0 L',
    status: 'Processed',
  },
  {
    name: 'PO_DMart_handwritten.png',
    docType: 'Purchase Order',
    source: 'Upload',
    time: '4 hours ago',
    confidence: 38,
    amount: '₹76 K',
    status: 'Exception',
    note: 'Handwritten fields — vendor & SKU mapping uncertain',
  },
  {
    name: 'CreditNote_Amazon_Q1.pdf',
    docType: 'Credit note',
    source: 'Email forwarding',
    time: '5 hours ago',
    confidence: 100,
    amount: '₹3.4 L',
    status: 'Processed',
  },
];

// Square hairline-bordered status label — ink/grey only, never coloured.
// Neutral states sit on a grey-100 fill at weight 500; attention states use a
// white fill, ink hairline and weight 600 (spec §6 "attention" chip variant).
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

const Upload: React.FC = () => {
  const reduce = useReducedMotion();
  const [uploadOpen, setUploadOpen] = useState(false);
  const openModal = () => setUploadOpen(true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      openModal();
      e.target.value = '';
    }
  };

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const filteredFiles = RECEIVED_FILES.filter(file => file.docType === activeTab);
  const getCountForTab = (tab: string) => RECEIVED_FILES.filter(file => file.docType === tab).length;

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {/* ── Title + primary action ─────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: `${space.lg}px`,
          flexWrap: 'wrap',
        }}
      >
        <PageTitle>Upload</PageTitle>
        <Button
          onClick={openModal}
          startIcon={
            <SyncOutlined
              sx={{
                fontSize: 18,
                animation: uploadOpen && !reduce ? 'b2bspin 1s linear infinite' : 'none',
                '@keyframes b2bspin': { to: { transform: 'rotate(360deg)' } },
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
          Sync
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
        <input 
          type="file" 
          multiple
          hidden 
          ref={fileInputRef} 
          onChange={handleFileChange} 
        />
        {/* Drop zone */}
        <Box
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
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
          <SectionTitle sx={{ mb: `${space.xs}px` }}>Drag & drop files or folders</SectionTitle>
          <Typography sx={{ ...type.body, color: colors.grey700, mb: `${space.lg}px` }}>
            Supports PDF, Excel, CSV, XML and ERP exports
          </Typography>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            sx={{
              bgcolor: colors.ink,
              color: colors.paper,
              fontSize: 13,
              fontWeight: 600,
              px: `${space.xl}px`,
              py: `${space.md}px`,
              '&:hover': { bgcolor: colors.inkHover },
            }}
          >
            Browse files
          </Button>
        </Box>

        {/* Email forwarding */}
        <Box sx={{ ...cardSx, p: `${space.xl}px` }}>
          <SectionTitle sx={{ mb: `${space.sm}px` }}>Email forwarding</SectionTitle>
          <Typography sx={{ ...type.body, color: colors.grey700, mb: `${space.lg}px`, lineHeight: '20px' }}>
            Forward vendor emails, platform reports or internal invoices directly to your AI inbox.
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
              aria-label="Copy inbox address"
              onClick={() => navigator.clipboard.writeText(INBOX)}
              sx={{ color: colors.grey700, borderRadius: 0, '&:hover': { color: colors.ink, bgcolor: 'transparent' } }}
            >
              <ContentCopyOutlined sx={{ fontSize: 16 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* ── Today's processing ───────────────────────────────────── */}
      <SectionTitle sx={{ mb: `${space.lg}px` }}>Today's processing</SectionTitle>
      <Box sx={{ ...cardSx, mb: `${space.xxl}px` }}>
        <Box sx={{ px: `${space.xl}px`, py: `${space.md}px`, borderBottom: hairline, bgcolor: colors.grey100 }}>
          <ColumnLabel>Auto-detected documents</ColumnLabel>
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
              <Typography sx={{ ...type.statValue, color: colors.ink, ...tabularNums }}>{s.value}</Typography>
              <Typography sx={{ ...type.label, color: colors.grey700, mt: '2px' }}>{s.label}</Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Documents by Tab ────────────────────────────────────── */}
      <Box sx={{ borderBottom: hairline, mb: `${space.lg}px`, mt: `${space.xxl}px` }}>
        <Tabs
          value={activeTab}
          onChange={(_, newVal) => setActiveTab(newVal)}
          variant="scrollable"
          scrollButtons="auto"
          TabIndicatorProps={{ style: { backgroundColor: colors.ink } }}
          sx={{
            minHeight: 40,
            '& .MuiTab-root': {
              minHeight: 40,
              textTransform: 'none',
              fontFamily: 'ui-sans-serif, system-ui, sans-serif',
              fontSize: 14,
              fontWeight: 500,
              color: colors.grey500,
              '&.Mui-selected': {
                color: colors.ink,
              },
            }
          }}
        >
          {TABS.map(tab => (
            <Tab
              key={tab}
              value={tab}
              label={`${tab} (${getCountForTab(tab)})`}
            />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ ...cardSx }}>
        {filteredFiles.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Typography sx={{ color: colors.grey500, fontSize: 14 }}>No documents found.</Typography>
          </Box>
        ) : filteredFiles.map((file, idx) => {
          const lowConfidence = file.status !== 'Processed';
          return (
            <Box
              key={file.name}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: `${space.lg}px`,
                px: `${space.xl}px`,
                py: `${space.lg}px`,
                borderTop: idx === 0 ? 'none' : hairline,
                // attention rows carry a 2px accent left-rule (spec §3: emphasis
                // via the accent, never a second hue)
                borderLeft: lowConfidence ? `2px solid ${colors.accent}` : '2px solid transparent',
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
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px`, flexWrap: 'wrap' }}>
                  <Typography sx={{ fontSize: 13, color: colors.grey700 }}>{file.source}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey500 }}>·</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey700, ...tabularNums }}>{file.time}</Typography>
                  <Typography sx={{ fontSize: 13, color: colors.grey500 }}>·</Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      // low confidence emphasised by weight, not colour
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

      {/* ── Awaiting from New Welcome ─────────────────────────────── */}
      <SectionTitle sx={{ mt: `${space.xxl}px`, mb: `${space.lg}px` }}>Awaiting from New Welcome</SectionTitle>
      <Box sx={{ cardSx, border: hairline, mb: `${space.xxl}px` }}>
        {/* Header */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: '1fr 160px 120px 110px',
            gap: `${space.lg}px`,
            px: `${space.xl}px`,
            py: `${space.md}px`,
            bgcolor: colors.grey100,
            borderBottom: hairline,
          }}
        >
          <ColumnLabel>What we expect</ColumnLabel>
          <ColumnLabel>Reference</ColumnLabel>
          <ColumnLabel>Due since</ColumnLabel>
          <ColumnLabel align="right">Amount</ColumnLabel>
        </Box>
        {pendingFromCounterparty.map((doc, idx) => (
          <Box
            key={doc.id}
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 160px 120px 110px',
              gap: `${space.lg}px`,
              px: `${space.xl}px`,
              py: `${space.lg}px`,
              borderBottom: idx < pendingFromCounterparty.length - 1 ? hairline : 'none',
              borderLeft: doc.overdue ? `3px solid ${colors.ink}` : '3px solid transparent',
              '&:hover': { bgcolor: colors.grey100 },
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: colors.ink }}>
                {doc.what}
              </Typography>
            </Box>
            <Typography
              sx={{
                fontSize: 12,
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
                color: colors.grey700,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {doc.reference}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: `${space.sm}px` }}>
              <Typography sx={{ fontSize: 12, color: colors.grey700, ...tabularNums }}>
                {doc.dueSince}
              </Typography>
              {doc.overdue && (
                <Box
                  sx={{
                    display: 'inline-flex',
                    border: hairline,
                    px: `${space.sm}px`,
                    py: '2px',
                    fontSize: 10,
                    fontWeight: 700,
                    color: colors.ink,
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  OVERDUE
                </Box>
              )}
            </Box>
            <Typography sx={{ textAlign: 'right', fontSize: 13, fontWeight: 600, color: doc.amount !== null ? colors.ink : colors.grey500, ...tabularNums }}>
              {doc.amount !== null ? formatRupees(Math.abs(doc.amount)) : '—'}
            </Typography>
          </Box>
        ))}
      </Box>

      <UploadSettlementModal open={uploadOpen} onClose={() => setUploadOpen(false)} />
    </Box>
  );
};

export default Upload;

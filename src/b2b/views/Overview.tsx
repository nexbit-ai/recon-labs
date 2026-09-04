import React, { useState, useEffect } from 'react';
import { Box, Typography, InputBase } from '@mui/material';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { colors, hairline, tabularNums, space } from '../theme/b2bTokens';

// ── PRIMITIVES ──────────────────────────────────────────────────────────────

const Shortcut: React.FC<{ children: React.ReactNode, onClick?: () => void }> = ({ children, onClick }) => (
  <Box component="span" onClick={onClick} sx={{
    fontSize: 12,
    color: colors.grey600,
    cursor: 'pointer',
    px: '12px',
    py: '6px',
    borderRadius: 9999,
    border: hairline,
    bgcolor: '#fafafa',
    transition: 'all 0.15s',
    '&:hover': { bgcolor: colors.grey100, color: colors.ink },
    display: 'inline-flex',
    alignItems: 'center',
  }}>
    {children}
  </Box>
);

const HistoryItem: React.FC<{ time: string, title: string, isActive?: boolean, onClick?: () => void }> = ({ time, title, isActive, onClick }) => (
  <Box onClick={onClick} sx={{ 
    display: 'flex', 
    gap: '12px', 
    alignItems: 'flex-start', 
    cursor: 'pointer',
    py: '6px',
    px: '8px',
    mx: '-8px',
    borderRadius: '8px',
    transition: 'background-color 0.15s',
    bgcolor: isActive ? colors.grey100 : 'transparent',
    '&:hover': { bgcolor: colors.grey100 }
  }}>
    <Typography sx={{ fontSize: 12, color: colors.grey400, minWidth: '42px', ...tabularNums, mt: '1px' }}>{time}</Typography>
    <Typography sx={{ fontSize: 13, color: isActive ? colors.ink : colors.grey700, fontWeight: isActive ? 500 : 400, lineHeight: 1.4 }}>{title}</Typography>
  </Box>
);

const LogEntry: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box sx={{ display: 'flex', gap: '8px', alignItems: 'flex-start', py: '6px', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.5 }}>
      <Typography component="span" sx={{ color: colors.grey600, fontFamily: 'inherit' }}>
        {children}
      </Typography>
    </Box>
  );
};

// ── COMPONENT ───────────────────────────────────────────────────────────────

const Overview: React.FC = () => {
  const reduce = useReducedMotion();
  const [isChatActive, setIsChatActive] = useState(false);
  const [inputValue, setInputValue] = useState('');
  
  // Fake typing state for delay
  const [messages, setMessages] = useState<any[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  const handleAction = (prompt?: string) => {
    const text = prompt || inputValue;
    if (!text.trim()) return;

    if (prompt) {
      setInputValue(''); // Clear input if prompt is provided directly
    } else {
      setInputValue(''); // clear after sending
    }

    if (!isChatActive) {
      setIsChatActive(true);
    }

    // Add user message immediately
    setMessages(prev => [...prev, { role: 'user', text }]);
    
    // Fake agent typing delay
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        role: 'agent', 
        text: `I've prepared the details for "${text}". The discrepancy centers around an unnotified 8.2% trade promotion fee, which exceeds our MSA clause 4.2 cap of 5.0%.`,
        hasArtifact: true
      }]);
    }, 1500); // 1.5s delay
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleAction();
    }
  };

  // Reusable Input Bar
  const InputComponent = () => (
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      border: hairline, 
      borderRadius: '24px', 
      px: '16px', 
      py: '12px', 
      bgcolor: colors.paper, 
      boxShadow: isChatActive ? '0 -4px 20px rgba(0,0,0,0.02)' : '0 4px 24px rgba(0,0,0,0.03)', 
      transition: 'border-color 0.2s, box-shadow 0.2s',
      '&:focus-within': { borderColor: colors.grey400, boxShadow: isChatActive ? '0 -4px 24px rgba(0,0,0,0.04)' : '0 4px 24px rgba(0,0,0,0.06)' } 
    }}>
      <Box component="span" sx={{ color: colors.grey400, mr: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
        </svg>
      </Box>
      <InputBase 
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask Nex to reconcile, audit, or draft dispute notices..." 
        sx={{ flex: 1, fontSize: 15, color: colors.ink, '& input::placeholder': { color: colors.grey400, opacity: 1 } }}
        disabled={isTyping}
      />
      <Box onClick={() => inputValue.trim() && handleAction()} sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        width: 32, 
        height: 32, 
        borderRadius: '50%', 
        border: inputValue.trim() ? `1px solid ${colors.ink}` : hairline, 
        bgcolor: colors.paper, 
        color: inputValue.trim() ? colors.ink : colors.grey300, 
        ml: '12px', 
        cursor: inputValue.trim() ? 'pointer' : 'default', 
        transition: 'opacity 0.15s, background-color 0.15s', 
        '&:hover': { opacity: inputValue.trim() ? 0.6 : 1 } 
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      </Box>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      sx={{ 
        height: '100%',
        width: '100%', 
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Make page fixed
      }}
    >
      <AnimatePresence mode="wait">
        {/* ── STATE A: INITIAL HERO VIEW ── */}
        {!isChatActive && (
          <Box
            component={motion.div}
            key="initial-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }}
            transition={{ duration: 0.3 }}
            sx={{ flex: 1, display: 'flex', flexDirection: 'column', maxWidth: '1000px', mx: 'auto', p: `${space.xl}px`, width: '100%' }}
          >
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', mt: '8vh', mb: '12vh' }}>
              <Typography sx={{ fontSize: 28, fontWeight: 600, color: colors.ink, mb: '32px', letterSpacing: '-0.02em' }}>
                How can Nex assist you today?
              </Typography>
              
              <Box sx={{ width: '100%', maxWidth: '680px' }}>
                <InputComponent />
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: `${space.md}px`, mt: '24px', flexWrap: 'wrap' }}>
                  <Shortcut onClick={() => handleAction('Draft dispute for Zepto PO-445')}>Draft dispute for Zepto PO-445</Shortcut>
                  <Shortcut onClick={() => handleAction('Run Q1 TDS reconciliation')}>Run Q1 TDS reconciliation</Shortcut>
                  <Shortcut onClick={() => handleAction('Check overdue Blinkit payments')}>Check overdue Blinkit payments</Shortcut>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: '64px', alignItems: 'start', pb: '32px' }}>
              {/* Live Executions */}
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.grey400, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '16px' }}>
                  Live Executions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <HistoryItem onClick={() => handleAction('Review Blinkit settlement JE-9042')} time="3m ago" title="Matched & settled 138 invoices for Blinkit (JE-9042)" />
                  <HistoryItem onClick={() => handleAction('Review Adret portal credit notes')} time="14m ago" title="Auto-reconciled 11 credit notes with Adret portal" />
                  <HistoryItem onClick={() => handleAction('Review MSA trade promo variance')} time="1h ago" title="Flagged ₹8.4L trade promo variance against MSA" />
                </Box>
              </Box>

              {/* Logs */}
              <Box>
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.grey400, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '16px' }}>
                  Logs
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <LogEntry>Zepto applied 8.2% trade promotion fee on PO-445 (Exceeds MSA Clause 4.2 cap of 5.0%).</LogEntry>
                  <LogEntry>Zepto Settlement Report (Line #124) matched with MSA_Agreement_v2.pdf.</LogEntry>
                  <LogEntry>Drafted dispute memo #DISP-082.</LogEntry>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* ── STATE B: ACTIVE CHAT VIEW ── */}
        {isChatActive && (
          <Box
            component={motion.div}
            key="chat-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ display: 'flex', height: 'calc(100vh - 64px)', width: '100%', overflow: 'hidden' }}
          >
            
            {/* Main Center Area (75%) */}
            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: colors.paper, position: 'relative' }}>
              
              {/* Scrollable Chat Stream */}
              <Box sx={{ flex: 1, overflowY: 'auto', p: `${space.xl}px`, display: 'flex', flexDirection: 'column', gap: '32px' }}>
                <Box sx={{ maxWidth: '800px', mx: 'auto', width: '100%', display: 'flex', flexDirection: 'column', gap: '32px' }}>
                  
                  {/* Dummy Conversation 1: User */}
                  <Box sx={{ alignSelf: 'flex-end', maxWidth: '85%' }}>
                    <Box sx={{ bgcolor: colors.grey100, color: colors.ink, px: '16px', py: '12px', borderRadius: '16px', borderBottomRightRadius: '4px', fontSize: 14, lineHeight: 1.5 }}>
                      Can you check if there are any overdue payments from Blinkit?
                    </Box>
                  </Box>

                  {/* Dummy Conversation 1: Agent */}
                  <Box sx={{ alignSelf: 'flex-start', maxWidth: '90%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                      <Box sx={{ width: 20, height: 20, borderRadius: '4px', bgcolor: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography sx={{ color: colors.paper, fontSize: 11, fontWeight: 700 }}>N</Typography>
                      </Box>
                      <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Nex Agent</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 14, color: colors.grey700, lineHeight: 1.6 }}>
                      Yes, there are currently 2 overdue invoices from Blinkit totaling ₹4,12,000. They are both overdue by 4 days. Would you like me to send a collection notice?
                    </Typography>
                  </Box>

                  {/* Dynamic Messages */}
                  <AnimatePresence>
                    {messages.map((msg, i) => (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={i}
                        sx={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: msg.role === 'user' ? '85%' : '90%' }}
                      >
                        {msg.role === 'user' ? (
                          <Box sx={{ bgcolor: colors.grey100, color: colors.ink, px: '16px', py: '12px', borderRadius: '16px', borderBottomRightRadius: '4px', fontSize: 14, lineHeight: 1.5 }}>
                            {msg.text}
                          </Box>
                        ) : (
                          <>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', mb: '8px' }}>
                              <Box sx={{ width: 20, height: 20, borderRadius: '4px', bgcolor: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Typography sx={{ color: colors.paper, fontSize: 11, fontWeight: 700 }}>N</Typography>
                              </Box>
                              <Typography sx={{ fontSize: 13, fontWeight: 600, color: colors.ink }}>Nex Agent</Typography>
                            </Box>
                            <Typography sx={{ fontSize: 14, color: colors.grey700, mb: msg.hasArtifact ? '16px' : 0, lineHeight: 1.6 }}>
                              {msg.text}
                            </Typography>
                            
                            {/* Rich Artifact Card (Mock) */}
                            {msg.hasArtifact && (
                              <Box sx={{ border: hairline, borderRadius: '12px', p: '16px', bgcolor: '#fafafa', mb: '16px' }}>
                                <Typography sx={{ fontSize: 12, fontWeight: 600, color: colors.ink, mb: '8px' }}>Draft Memo: #DISP-082</Typography>
                                <Typography sx={{ fontSize: 13, color: colors.grey600, fontFamily: 'monospace', mb: '16px' }}>
                                  To: Zepto Accounts Payable<br/>
                                  Subject: Dispute on Settlement PO-445<br/>
                                  ...
                                </Typography>
                                <Box sx={{ display: 'flex', gap: '8px' }}>
                                  <Box component="button" sx={{ all: 'unset', cursor: 'pointer', borderRadius: 9999, border: `1px solid ${colors.ink}`, color: colors.ink, fontSize: 12, fontWeight: 600, px: '14px', py: '6px', '&:hover': { bgcolor: colors.grey100 } }}>Approve & Send</Box>
                                  <Box component="button" sx={{ all: 'unset', cursor: 'pointer', borderRadius: 9999, border: hairline, bgcolor: colors.paper, color: colors.ink, fontSize: 12, fontWeight: 600, px: '14px', py: '6px', '&:hover': { bgcolor: '#fafafa' } }}>Edit Draft</Box>
                                </Box>
                              </Box>
                            )}
                          </>
                        )}
                      </Box>
                    ))}

                    {isTyping && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Box sx={{ width: 20, height: 20, borderRadius: '4px', bgcolor: colors.ink, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography sx={{ color: colors.paper, fontSize: 11, fontWeight: 700 }}>N</Typography>
                          </Box>
                          <Typography sx={{ fontSize: 13, color: colors.grey500 }}>Nex Agent is thinking...</Typography>
                        </Box>
                      </Box>
                    )}
                  </AnimatePresence>
                  
                </Box>
              </Box>

              {/* Bottom Fixed Prompt Input (Removed top border) */}
              <Box sx={{ p: '24px', pb: '32px', bgcolor: colors.paper }}>
                <Box sx={{ maxWidth: '800px', mx: 'auto', width: '100%' }}>
                  <InputComponent />
                </Box>
              </Box>

            </Box>

            {/* Right Sidebar (25%) */}
            <Box sx={{ 
              width: '280px', 
              borderLeft: hairline, 
              bgcolor: '#fafafa',
              display: { xs: 'none', md: 'flex' },
              flexDirection: 'column',
              overflowY: 'auto'
            }}>
              <Box sx={{ p: '24px' }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '16px' }}>
                  Chat History & Executions
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <HistoryItem isActive time="Now" title="Current Session" />
                  <HistoryItem onClick={() => setInputValue('Review Blinkit settlement JE-9042')} time="3m ago" title="Matched & settled 138 invoices for Blinkit (JE-9042)" />
                  <HistoryItem onClick={() => setInputValue('Review Adret portal credit notes')} time="14m ago" title="Auto-reconciled 11 credit notes with Adret portal" />
                  <HistoryItem onClick={() => setInputValue('Review MSA trade promo variance')} time="1h ago" title="Flagged ₹8.4L trade promo variance against MSA" />
                </Box>
              </Box>
              
              <Box sx={{ p: '24px', borderTop: hairline, flex: 1 }}>
                <Typography sx={{ fontSize: 11, fontWeight: 600, color: colors.grey500, textTransform: 'uppercase', letterSpacing: '0.04em', mb: '16px' }}>
                  Agent Logs
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <LogEntry>Zepto applied 8.2% trade promo on PO-445 (Exceeds MSA Cap).</LogEntry>
                  <LogEntry>Zepto Settlement Report matched with MSA.</LogEntry>
                  <LogEntry>Drafted dispute memo #DISP-082.</LogEntry>
                </Box>
              </Box>
            </Box>

          </Box>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default Overview;

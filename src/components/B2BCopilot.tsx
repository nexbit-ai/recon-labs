import React, { useState, useRef, useEffect } from 'react';
import { Box, Paper, Typography, IconButton, InputBase, Collapse, Button, Chip } from '@mui/material';
import {
  AutoAwesome as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  ArrowForward as ArrowForwardIcon,
  BarChart as ChartIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  action?: {
    label: string;
    path: string;
  };
  dataContext?: React.ReactNode;
}

const initialMessages: Message[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: 'Good morning. I am your financial analyst. I monitor your marketplace data in real-time. What would you like to investigate today?'
  }
];

export default function B2BCopilot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping, isOpen]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: Message = { id: `msg-${Date.now()}`, sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Mock AI Analyst Logic
    setTimeout(() => {
      let aiMsg: Message = { id: `ai-${Date.now()}`, sender: 'ai', text: 'I am analyzing your request...' };
      const query = userMsg.text.toLowerCase();

      if (query.includes('zepto recoveries')) {
        aiMsg.text = 'Zepto recoveries are up 42% this month primarily because Zepto reverted a temporary waiver on logistics SLAs. Our system automatically identified 340 new SLA breaches dating back to May 1st that they missed in their settlement reports.';
        aiMsg.dataContext = (
          <Box sx={{ mt: 1, p: 1.5, bgcolor: '#f8fafc', borderRadius: 2, border: '1px solid #e2e8f0' }}>
            <Typography sx={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, mb: 0.5 }}>IDENTIFIED ANOMALIES</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 700 }}>₹1.42L Commission Overcharge</Typography>
            <Typography sx={{ fontSize: '0.8rem', color: '#475569' }}>Across 340 Zepto orders</Typography>
          </Box>
        );
        aiMsg.action = { label: 'View Zepto Recoveries', path: '/b2b/recoveries' };
      } 
      else if (query.includes('unpaid settlement') && query.includes('30 days')) {
        aiMsg.text = 'You have ₹8.6L in Blinkit settlements and ₹14.8L in Instamart settlements that are unpaid and older than 30 days. Blinkit is usually 6 days on average, so this is highly anomalous. Instamart is currently in a "Critical" health state.';
        aiMsg.action = { label: 'Review Outstanding Aging', path: '/b2b/outstanding' };
      }
      else if (query.includes('deductions') && query.includes('recoverable')) {
        aiMsg.text = 'Based on our historical success rate, logistics SLA penalties and return discrepancies (especially "Damaged in Transit" from Zepto) have a 92% win rate when disputed with WMS proof. I suggest prioritizing these.';
        aiMsg.action = { label: 'Open High-Confidence Disputes', path: '/b2b/disputes' };
      }
      else if (query.includes('warehouse') && query.includes('damage')) {
        aiMsg.text = 'Warehouse WH-4 (Bhiwandi) is responsible for 68% of all "Damaged in Transit" deductions across Amazon and Flipkart this quarter. The average damage rate for WH-4 is 3.2%, while your other warehouses average 0.4%.';
        aiMsg.action = { label: 'View Activity Feed', path: '/b2b/activity' };
      }
      else if (query.includes('disputes expire')) {
        aiMsg.text = 'You have 3 disputes with Amazon regarding missing return shipments (Total: ₹1.24L) that will pass the 60-day dispute window this Friday. I have already gathered the inbound WMS scan logs for you.';
        aiMsg.action = { label: 'Approve Amazon Claims', path: '/b2b/disputes' };
      }
      else {
        aiMsg.text = 'I have cross-referenced the general ledger, platform settlement reports, and your warehouse data. To give you the most accurate insight, could you specify which marketplace or timeframe you are looking into?';
      }

      setIsTyping(false);
      setMessages(prev => [...prev, aiMsg]);
    }, 1200);
  };

  return (
    <Box sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* Chat Window */}
      <Collapse in={isOpen} timeout={300}>
        <Paper 
          sx={{ 
            width: 380, 
            height: 520, 
            mb: 2, 
            borderRadius: 4, 
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 20px 40px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)',
            bgcolor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(16px)'
          }}
        >
          {/* Header */}
          <Box sx={{ p: 2.5, bgcolor: '#111', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ w: 32, h: 32, borderRadius: '50%', bgcolor: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AIIcon sx={{ fontSize: 18, color: '#e2e8f0' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, lineHeight: 1.2 }}>Finance AI Copilot</Typography>
                <Typography sx={{ fontSize: '0.7rem', color: '#94a3b8' }}>Always monitoring</Typography>
              </Box>
            </Box>
            <IconButton size="small" onClick={() => setIsOpen(false)} sx={{ color: '#94a3b8', '&:hover': { color: '#fff' } }}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Messages Area */}
          <Box ref={scrollRef} sx={{ flex: 1, p: 2.5, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {messages.map((msg) => (
              <Box key={msg.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <Box 
                  sx={{ 
                    maxWidth: '85%', 
                    p: 1.8, 
                    borderRadius: 3,
                    borderBottomRightRadius: msg.sender === 'user' ? 4 : 12,
                    borderBottomLeftRadius: msg.sender === 'ai' ? 4 : 12,
                    bgcolor: msg.sender === 'user' ? '#111' : '#f8fafc',
                    color: msg.sender === 'user' ? '#fff' : '#0f172a',
                    border: msg.sender === 'ai' ? '1px solid #e2e8f0' : 'none',
                    boxShadow: msg.sender === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <Typography sx={{ fontSize: '0.85rem', lineHeight: 1.5, fontWeight: msg.sender === 'user' ? 400 : 500 }}>
                    {msg.text}
                  </Typography>
                  {msg.dataContext && (
                    <Box sx={{ mt: 1.5 }}>{msg.dataContext}</Box>
                  )}
                </Box>
                {msg.action && (
                  <Button 
                    variant="outlined" 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => {
                      setIsOpen(false);
                      navigate(msg.action!.path);
                    }}
                    sx={{ 
                      mt: 1, 
                      borderRadius: 2, 
                      textTransform: 'none', 
                      fontWeight: 600, 
                      fontSize: '0.75rem',
                      color: '#4f46e5',
                      borderColor: '#c7d2fe',
                      '&:hover': { bgcolor: '#e0e7ff', borderColor: '#818cf8' }
                    }}
                  >
                    {msg.action.label}
                  </Button>
                )}
              </Box>
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, opacity: 0.5 }}>
                <AIIcon sx={{ fontSize: 16, color: '#64748b', animation: 'spin 2s linear infinite' }} />
                <Typography sx={{ fontSize: '0.75rem', color: '#64748b' }}>Analyzing financial data...</Typography>
              </Box>
            )}
          </Box>

          {/* Input Area */}
          <Box sx={{ p: 2, borderTop: '1px solid #f1f5f9', bgcolor: '#fff' }}>
            <Paper 
              elevation={0}
              sx={{ 
                p: '4px 8px', 
                display: 'flex', 
                alignItems: 'center', 
                borderRadius: 3, 
                border: '1px solid #e2e8f0',
                bgcolor: '#f8fafc',
                '&:focus-within': { borderColor: '#111', bgcolor: '#fff', boxShadow: '0 0 0 2px rgba(0,0,0,0.05)' }
              }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, fontSize: '0.85rem' }}
                placeholder="Ask about recoveries, disputes, or anomalies..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <IconButton color="primary" sx={{ p: '8px', color: input.trim() ? '#111' : '#cbd5e1' }} onClick={handleSend} disabled={!input.trim()}>
                <SendIcon fontSize="small" />
              </IconButton>
            </Paper>
          </Box>
        </Paper>
      </Collapse>

      {/* Floating Action Button */}
      {!isOpen && (
        <Paper
          onClick={() => setIsOpen(true)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            p: '12px 20px',
            borderRadius: 8,
            cursor: 'pointer',
            bgcolor: '#111',
            color: '#fff',
            boxShadow: '0 12px 24px rgba(0,0,0,0.2)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 16px 32px rgba(0,0,0,0.25)',
              bgcolor: '#000'
            }
          }}
        >
          <AIIcon sx={{ fontSize: 20 }} />
          <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, letterSpacing: '0.02em' }}>Ask Copilot</Typography>
        </Paper>
      )}
      
      {/* Global styles for animations if needed */}
      <style>{`
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </Box>
  );
}

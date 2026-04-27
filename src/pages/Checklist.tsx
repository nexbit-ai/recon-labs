import React, { useMemo, useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  Chip,
  Avatar,
  Stack,
  IconButton,
  Collapse,
  TextField,
  Button,
  Divider,
  Grid,
  Select,
  FormControl,
  MenuItem,
  AvatarGroup,
  InputAdornment,
  Fade,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  CalendarToday as CalendarTodayIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  CheckCircle as CheckCircleIcon,
  Add as AddIcon,
  Send as SendIcon,
  History as HistoryIcon,
  AutoAwesome as AIIcon,
  AttachFile as AttachFileIcon,
  PsychologyAlt as BrainIcon,
  PsychologyAlt as AssistantIcon,
} from '@mui/icons-material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const AI_AVATAR_URL = '/ai_avatar.png';

const AI_VIDEO_URL = '/ai_avatar.webm';

const AnimatedAIAvatar: React.FC<{ size?: number, animated?: boolean }> = ({ size = 44, animated = true }) => (
  <Box
    sx={{ 
      width: size, 
      height: size, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '50%',
      p: 0, 
      m: 0,
    }}
  >
    <Box
      component="video"
      autoPlay={animated}
      loop={animated}
      muted
      playsInline
      src={AI_VIDEO_URL}
      sx={{ 
        width: '180%', 
        height: '180%', 
        objectFit: 'contain',
        display: 'block',
      }}
    />
  </Box>
);

// --- Types & Interfaces ---

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Task {
  id: number;
  title: string;
  tag: string;
  due: string;
  users: User[];
  status: 'overdue' | 'upcoming' | 'completed';
}

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  chartData?: any[];
  chartType?: 'bar' | 'line';
}

// --- Mock Data ---

const users: User[] = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Carol', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: 4, name: 'Dan', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
];

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Reconcile March Flipkart orders for Pilgrim',
    tag: 'FLIPKART',
    due: 'Today',
    users: [users[0], users[1]],
    status: 'overdue',
  },
  {
    id: 2,
    title: 'Verify Amazon payment disputes for April',
    tag: 'AMAZON',
    due: '2 days left',
    users: [users[2]],
    status: 'upcoming',
  },
  {
    id: 3,
    title: 'Match website sales with Razorpay settlements',
    tag: 'D2C',
    due: 'Tomorrow',
    users: [users[3], users[0]],
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Download Amazon logistics report for auditing',
    tag: 'LOGISTICS',
    due: 'Completed',
    users: [users[1]],
    status: 'completed',
  },
];

const suggestedQueries = [
  "Do a flipkart Recon for march 26",
  "Is 2025 complete recon completed",
  "Analyze Amazon TAT for Q3",
  "Explain Flipkart fee hike in May",
];

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// --- Sub-Components ---

const Typewriter: React.FC<{ text: string; speed?: number; onComplete?: () => void }> = ({ 
  text, 
  speed = 25, 
  onComplete 
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Type out the first 50% of the message
    if (index < text.length / 2) {
      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + text[index]);
        setIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else {
      // Once 50% is reached, show the rest immediately
      setDisplayedText(text);
      if (onComplete) onComplete();
    }
  }, [index, text, speed, onComplete]);

  return <>{displayedText}</>;
};

const MessageBubble: React.FC<{ msg: Message; isLatestAssistant?: boolean; onStreamingComplete?: () => void }> = ({ 
  msg, 
  isLatestAssistant,
  onStreamingComplete 
}) => {
  const isAssistant = msg.sender === 'assistant';
  const shouldType = isAssistant && isLatestAssistant;
  
  return (
    <Fade in={true} timeout={400}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isAssistant ? 'row' : 'row-reverse',
          gap: 1.25,
          mb: 2,
          alignItems: 'flex-start',
        }}
      >
        <AnimatedAIAvatar size={28} animated={isAssistant && isLatestAssistant} />
        <Box sx={{ maxWidth: '80%', display: 'flex', flexDirection: 'column', alignItems: isAssistant ? 'flex-start' : 'flex-end' }}>
          <Paper
            elevation={0}
            sx={{
              p: 1.75,
              borderRadius: isAssistant ? '0 12px 12px 12px' : '12px 0 12px 12px',
              bgcolor: '#fcfdfe',
              color: '#1e293b',
              border: '1px solid #eef2f6',
              boxShadow: '0 2px 4px rgba(0,0,0,0.01)',
            }}
          >
            <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-line', fontSize: '0.88rem', fontWeight: 450 }}>
              {shouldType ? (
                <Typewriter text={msg.text} onComplete={onStreamingComplete} />
              ) : (
                msg.text
              )}
            </Typography>
            
            {(msg.chartData && !shouldType) && (
              <Box sx={{ mt: 2.5, height: 240, width: '100%', minWidth: 340 }}>
                <Typography variant="caption" sx={{ mb: 1.5, display: 'block', fontWeight: 700, color: '#94a3b8', fontSize: '0.72rem', letterSpacing: '0.02em' }}>
                  WEEKLY PERFORMANCE ANALYSIS
                </Typography>
                <ResponsiveContainer width="100%" height="100%">
                  {msg.chartType === 'bar' ? (
                    <BarChart data={msg.chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} 
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.7rem' }} 
                      />
                      <Bar dataKey="value" fill="#3b82f6" radius={[3, 3, 0, 0]} barSize={20} />
                    </BarChart>
                  ) : (
                    <LineChart data={msg.chartData} margin={{ top: 5, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 600 }} 
                      />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '0.7rem' }} 
                      />
                      <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3, fill: "#3b82f6", strokeWidth: 0 }} activeDot={{ r: 5 }} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </Box>
            )}

            {/* Timestamp removed */}
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

// --- Main Checklist Page ---

const Checklist: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  
  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [streamingMessageId, setStreamingMessageId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm Nex, your Finance Assistant. I can help you with your tasks, analyze discrepancies with professional charts, or explain reconciliation steps.",
      sender: 'assistant',
      timestamp: new Date(),
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getLoadingSteps = (query: string): string[] => {
    const q = query.toLowerCase();
    if (q.includes('flipkart recon') || q.includes('march 26')) {
      return [
        "Scanning Flipkart March settlement data...",
        "Fetching sales manifest from ledger...",
        "Cross-referencing Order IDs against settlements...",
        "Identifying fee and discount discrepancies...",
        "Running reconciliation engine benchmarks...",
      ];
    }
    if (q.includes('2025') || q.includes('completed')) {
      return [
        "Accessing FY 2025 marketplace archives...",
        "Aggregating monthly settlement reports...",
        "Verifying Amazon pending dispute counts...",
        "Scanning D2C gateway logs for Sept-Dec...",
        "Validating net-to-gross revenue mapping...",
      ];
    }
    if (q.includes('tat') || q.includes('amazon')) {
      return [
        "Fetching provider settlement ageing logs...",
        "Calculating weighted average TAT for Q3...",
        "Aggregating COD partner performance metrics...",
        "Compiling quarterly trend distribution...",
      ];
    }
    if (q.includes('fee') || q.includes('may')) {
      return [
        "Retrieving Flipkart historical rate cards...",
        "Detecting marketplace fee structure changes...",
        "Calculating commission impact on beauty categories...",
        "Benchmarking net settlement vs expected sales...",
      ];
    }
    return [
      "Accessing financial data vault...",
      "Cross-referencing transaction logs...",
      "Anonymizing sensitive customer profiles...",
      "Generating operations summary...",
    ];
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, loadingStep]);

  const handleSendMessage = (textOverride?: string) => {
    const text = textOverride || chatMessage;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setChatMessage('');
    setIsTyping(true);

    const steps = getLoadingSteps(text);
    let stepIdx = 0;
    setLoadingStep(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setLoadingStep(steps[stepIdx]);
      } else {
        clearInterval(interval);
      }
    }, 750);

    // Simulated AI response with artificial delay
    setTimeout(() => {
      clearInterval(interval);
      setIsTyping(false);
      setLoadingStep('');
      const data = getAIResponse(text);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.text,
        sender: 'assistant',
        timestamp: new Date(),
        chartData: data.chartData,
        chartType: data.chartType,
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingMessageId(assistantMsg.id);
    }, 4000);
  };

  const getAIResponse = (query: string): { text: string; chartData?: any[]; chartType?: 'bar' | 'line' } => {
    const q = query.toLowerCase();
    
    if (q.includes('flipkart recon') || q.includes('march 26')) {
      return {
        text: "I've initiated the Flipkart reconciliation for March 2026. Data ingestion is 100% complete. I found a gross discrepancy of ₹12,45,600 across 114 transactions, primarily due to 'Seller Share Discount' mismatches.\n\nMatching the dashboard figures: Gross Revenue is recorded at ₹4.41 Cr with Net settlement at ₹3.70 Cr.\n\nWould you like me to flag these 114 items for dispute?",
        chartType: 'bar',
        chartData: [
          { name: 'Matched', value: 2450 },
          { name: 'Mismatch', value: 114 },
          { name: 'Pending', value: 12 },
        ]
      };
    }

    if (q.includes('2025') && q.includes('completed')) {
      return {
        text: "Summary for FY 2025 (Dashboard Integrety):\n\n• Flipkart: 100% Completed\n• Amazon: 98.2% Completed (Sept pending)\n• D2C/Razorpay: 100% Completed\n\nTotal Net Revenue: ₹3,85,76,000 (₹3.85 Cr)\nTotal Gross Revenue: ₹4,03,00,000 (₹4.03 Cr)\nTotal Returns: ₹82,90,258\n\nThe 8.2% leakage is primarily attributed to unrecovered Amazon RTO claims.",
      };
    }

    if (q.includes('tat') || q.includes('amazon')) {
      return {
        text: "Amazon TAT analysis compared to platform benchmarks:\n\nAverage settlement is 2.3 days. Razorpay is leading at 1.8d. Current pending settlements for Q3 total ₹12.4 Lakh. Here is the ageing trend for the last 3 months:",
        chartType: 'line',
        chartData: [
          { name: 'July', value: 2.1 },
          { name: 'Aug', value: 2.5 },
          { name: 'Sept', value: 2.3 },
        ]
      };
    }
    
    if (q.includes('fee') || q.includes('may')) {
      return {
        text: "In May 2025, the rate card shift (+5% Fixed Fee) impacted 14% of Beauty category orders. This aligns with the dashboard dip in Net Revenue for that period. Impact analysis:\n\nExpected Fees: ₹32,00,000\nActual Charged: ₹34,20,000\nVariance: ₹2,20,000",
        chartType: 'bar',
        chartData: [
          { name: 'Apr Fees', value: 32.0 },
          { name: 'May Fees', value: 34.2 },
          { name: 'Jun Fees', value: 34.0 },
        ]
      };
    }
    
    if (q.includes('amazon') || q.includes('trend')) {
      return {
        text: "Amazon payments are trending positive compared to February. Your settlement-to-sale ratio has improved by 4.2% across major categories.",
        chartType: 'line',
        chartData: [
          { name: 'Feb W1', value: 85 },
          { name: 'Feb W2', value: 87 },
          { name: 'Feb W3', value: 86 },
          { name: 'Feb W4', value: 88 },
          { name: 'Mar W1', value: 90 },
          { name: 'Mar W2', value: 92.2 },
        ]
      };
    }

    return {
      text: "I'm on it. I've scanned the relevant reports. Most operations are within tolerance levels. I recommend focusing on the Amazon weight disputes for this peak period.",
    };
  };

  const handleAskAI = (task: Task) => {
    handleSendMessage(`Help me with this task: "${task.title}"`);
  };

  const handleToggleTask = (id: number) => {
    setTasks(prev => prev.map(t => 
      t.id === id 
        ? { ...t, status: t.status === 'completed' ? 'upcoming' : 'completed' } 
        : t
    ));
  };

  return (
    <Box sx={{ 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      flexDirection: 'column',
      bgcolor: '#fff',
      pt: 0.75,
    }}>
      {/* Page Header */}
      <Box sx={{ 
        px: 3, 
        py: 1, 
        borderBottom: '1px solid #f1f5f9', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        bgcolor: '#fcfdfe'
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography sx={{ fontWeight: 800, color: '#111', letterSpacing: '-0.02em', fontSize: '1.15rem' }}>
            Operations Center
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip label="5 Pending" size="small" sx={{ bgcolor: '#111', color: '#fff', fontWeight: 700, fontSize: '0.6rem', height: 16 }} />
            <Chip label="1 Urgent" size="small" sx={{ bgcolor: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.6rem', height: 16, border: '1px solid #fee2e2' }} />
          </Box>
        </Box>
        
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <FormControl size="small" variant="standard">
            <Select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              sx={{ fontWeight: 700, fontSize: '0.75rem' }}
              disableUnderline
            >
              {monthNames.map((m, i) => (
                <MenuItem key={m} value={i} sx={{ fontSize: '0.75rem' }}>{m} 2026</MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon sx={{ fontSize: 14 }} />}
            sx={{ borderRadius: '6px', color: '#111', borderColor: '#e2e8f0', textTransform: 'none', px: 1.5, py: 0.25, fontSize: '0.7rem', fontWeight: 700 }}
          >
             New Task
          </Button>
        </Stack>
      </Box>

      <Grid container sx={{ flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Task List */}
        <Grid item xs={12} md={6} sx={{ 
          height: '100%', 
          borderRight: '1px solid #f1f5f9',
          overflowY: 'auto',
          px: 4,
          py: 3,
        }}>
          {/* Overdue Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#dc2626', letterSpacing: '0.05em', fontSize: '0.6rem' }}>
                OVERDUE
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: '#fee2e2' }} />
            </Box>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tasks.filter(t => t.status === 'overdue').map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  isExpanded={expandedTask === task.id}
                  onExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onAskAI={() => handleAskAI(task)}
                />
              ))}
            </List>
          </Box>

          {/* Pending Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#64748b', letterSpacing: '0.05em', fontSize: '0.66rem' }}>
                FOR REVIEW
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: '#f1f5f9' }} />
            </Box>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {tasks.filter(t => t.status === 'upcoming').map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  isExpanded={expandedTask === task.id}
                  onExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onAskAI={() => handleAskAI(task)}
                />
              ))}
            </List>
          </Box>

          {/* Completed Section */}
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#22c55e', letterSpacing: '0.05em', fontSize: '0.66rem' }}>
                COMPLETED
              </Typography>
              <Box sx={{ flex: 1, height: '1px', bgcolor: '#f0fdf4' }} />
            </Box>
            <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, opacity: 0.6 }}>
              {tasks.filter(t => t.status === 'completed').map(task => (
                <TaskItem 
                  key={task.id} 
                  task={task} 
                  isExpanded={expandedTask === task.id}
                  onExpand={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                  onToggle={() => handleToggleTask(task.id)}
                  onAskAI={() => handleAskAI(task)}
                />
              ))}
            </List>
          </Box>
        </Grid>

        {/* Right Column: Nex Assistant */}
        <Grid item xs={12} md={6} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fcfdfe' }}>
          {/* Chat Header */}
          <Box sx={{ px: 3, py: 1.5, borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#fff' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <AnimatedAIAvatar size={42} animated={true} />
              <Box>
                <Typography sx={{ fontWeight: 800, letterSpacing: '-0.01em', fontSize: '0.88rem' }}>
                  Nex AI Assistant
                </Typography>
              </Box>
            </Box>
            <IconButton size="small"><HistoryIcon sx={{ fontSize: 16 }} /></IconButton>
          </Box>

          {/* Chat Body */}
          <Box sx={{ px: 3, pt: 3, pb: 2, flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {messages.map(msg => (
              <MessageBubble 
                key={msg.id} 
                msg={msg} 
                isLatestAssistant={msg.id === streamingMessageId}
                onStreamingComplete={() => setStreamingMessageId(null)}
              />
            ))}
            {isTyping && (
              <Box sx={{ display: 'flex', gap: 1.25, mb: 2 }}>
                <AnimatedAIAvatar size={28} animated={true} />
                <Paper elevation={0} sx={{ p: 1.25, px: 1.75, borderRadius: '0 10px 10px 10px', bgcolor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' }}>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box component="span" sx={{ display: 'flex', gap: 0.5 }}>
                      <Box sx={{ width: 4, height: 4, bgcolor: '#0ea5e9', borderRadius: '50%', animation: 'pulse 1.5s infinite 0s' }} />
                      <Box sx={{ width: 4, height: 4, bgcolor: '#0ea5e9', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.3s' }} />
                      <Box sx={{ width: 4, height: 4, bgcolor: '#0ea5e9', borderRadius: '50%', animation: 'pulse 1.5s infinite 0.6s' }} />
                    </Box>
                    {loadingStep}
                  </Typography>
                </Paper>
              </Box>
            )}
            <style>{`
              @keyframes pulse {
                0% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
                100% { opacity: 0.3; transform: scale(1); }
              }
            `}</style>
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area (Pinned to Bottom) */}
          <Box sx={{ bgcolor: '#fcfdfe', borderTop: 'none', px: 3, pb: 0, pt: 0 }}>
            {/* Suggested Queries */}
            <Box sx={{ pb: 1, display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
              {suggestedQueries.map((q, i) => (
                <Chip 
                  key={i} 
                  label={q} 
                  size="small"
                  onClick={() => handleSendMessage(q)}
                  sx={{ 
                    bgcolor: '#fff', 
                    border: '1px solid #e2e8f0', 
                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#111' },
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    height: 24
                  }} 
                />
              ))}
            </Box>

            <Paper
              elevation={0}
              sx={{
                p: 1,
                borderRadius: '10px',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                bgcolor: '#fff',
                mb: 0,
                '&:focus-within': { borderColor: '#111' }
              }}
            >
              <IconButton size="small"><AttachFileIcon sx={{ fontSize: 16 }} /></IconButton>
              <TextField
                fullWidth
                placeholder="Type a message..."
                variant="standard"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                InputProps={{ disableUnderline: true, sx: { fontSize: '0.785rem' } }}
              />
              <IconButton
                size="small"
                onClick={() => handleSendMessage()}
                sx={{
                  bgcolor: chatMessage.trim() ? '#111' : 'transparent',
                  color: chatMessage.trim() ? '#fff' : '#cbd5e1',
                  '&:hover': { bgcolor: '#000' },
                  width: 30,
                  height: 30,
                }}
              >
                <SendIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Paper>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

// --- Task Item Sub-component ---

const TaskItem: React.FC<{ 
  task: Task; 
  isExpanded: boolean; 
  onExpand: () => void;
  onToggle: () => void;
  onAskAI: () => void;
}> = ({ task, isExpanded, onExpand, onToggle, onAskAI }) => {
  const isCompleted = task.status === 'completed';
  const isOverdue = task.status === 'overdue';

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: '10px',
        border: '1px solid',
        borderColor: isExpanded ? '#111' : '#f1f5f9',
        bgcolor: '#fff',
        transition: 'all 0.15s ease',
        '&:hover': {
          borderColor: isExpanded ? '#111' : '#e2e8f0',
        }
      }}
    >
      <Box
        sx={{
          p: 1.75,
          display: 'flex',
          alignItems: 'center',
          cursor: 'pointer',
        }}
        onClick={onExpand}
      >
        <ListItemIcon 
          sx={{ minWidth: 32 }}
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
        >
          {isCompleted ? (
            <CheckCircleIcon sx={{ color: '#22c55e', fontSize: 18 }} />
          ) : (
            <RadioButtonUncheckedIcon sx={{ color: isOverdue ? '#dc2626' : '#cbd5e1', fontSize: 18 }} />
          )}
        </ListItemIcon>
        
        <Box sx={{ flex: 1 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: isCompleted ? '#94a3b8' : '#1e293b',
              textDecoration: isCompleted ? 'line-through' : 'none',
              fontSize: '0.86rem',
              letterSpacing: '-0.01em'
            }}
          >
            {task.title}
          </Typography>
          <Stack direction="row" spacing={0.75} sx={{ mt: 0.25 }}>
            <Chip 
              label={task.tag} 
              size="small" 
              sx={{ 
                fontSize: '0.62rem', 
                height: 16, 
                bgcolor: isOverdue ? '#fef2f2' : '#f1f5f9', 
                color: isOverdue ? '#dc2626' : '#64748b',
                fontWeight: 800,
                borderRadius: '3px'
              }} 
            />
            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.35, fontWeight: 600, fontSize: '0.66rem', color: isOverdue ? '#dc2626' : '#94a3b8' }}>
              <CalendarTodayIcon sx={{ fontSize: 10 }} />
              {task.due}
            </Typography>
          </Stack>
        </Box>

        <AvatarGroup max={2} sx={{ '& .MuiAvatar-root': { width: 22, height: 22, fontSize: 8, border: '1.5px solid #fff' }, mr: 1 }}>
          {task.users.map(u => (
            <Avatar key={u.id} src={u.avatar} title={u.name} />
          ))}
        </AvatarGroup>

        <IconButton size="small">
          {isExpanded ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
        </IconButton>
      </Box>

      <Collapse in={isExpanded}>
        <Box sx={{ px: 5.75, pb: 2, pt: 0.25 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75, lineHeight: 1.5, fontSize: '0.80rem' }}>
            Run the automated reconciliation engine. Review mismatch flag if discrepancy {'>'} 2%. 
          </Typography>
          
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<AnimatedAIAvatar size={20} animated={false} />}
              sx={{ borderRadius: '6px', color: '#111', borderColor: '#111', textTransform: 'none', fontWeight: 700, px: 2, height: 28, fontSize: '0.72rem' }}
              onClick={(e) => { e.stopPropagation(); onAskAI(); }}
            >
              Ask Nex
            </Button>
            <Button
              size="small"
              variant="outlined"
              sx={{ borderRadius: '6px', color: '#64748b', borderColor: '#e2e8f0', textTransform: 'none', fontWeight: 700, px: 2, height: 28, fontSize: '0.72rem' }}
              onClick={(e) => { e.stopPropagation(); onToggle(); }}
            >
              {isCompleted ? 'Pending' : 'Done'}
            </Button>
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default Checklist;
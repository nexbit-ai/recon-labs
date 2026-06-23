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
  Tooltip as MuiTooltip,
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
  PersonAddOutlined as PersonAddIcon,
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

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  chartData?: any[];
  chartType?: 'bar' | 'line';
  hasDownload?: boolean;
  downloadName?: string;
}

interface User {
  id: number;
  name: string;
  avatar: string;
}

interface Task {
  id: number;
  title: string;
  tags: { label: string; type: 'danger' | 'warning' | 'default' }[];
  subtitle: string;
  amount?: string;
  actionText: string;
  status: 'requires_action' | 'review' | 'completed';
  aiConfidence?: number;
  aiInsights?: string;
  trendData?: { val: number }[];
}

// --- Mock Data ---

const initialTasks: Task[] = [
  {
    id: 1,
    title: 'Automated Dispute Filing',
    tags: [
      { label: 'Pending', type: 'danger' },
      { label: 'Aggregator', type: 'default' }
    ],
    subtitle: 'REC-001 · Zomato · Identified 156 orders with incorrect commission tier applied',
    amount: '₹1,45,000',
    actionText: 'Assign to Agent',
    status: 'requires_action',
    aiConfidence: 96,
    aiInsights: "Nex AI Analysis: Zomato applied Gold-tier commission (28%) to orders that qualify for Silver-tier (22%) under the April promotional contract.",
    trendData: [{val: 10}, {val: 15}, {val: 20}, {val: 18}, {val: 45}, {val: 90}, {val: 145}],
  },
  {
    id: 2,
    title: 'Aggregator Commission Audit',
    tags: [
      { label: 'Done', type: 'default' },
      { label: 'Platform', type: 'default' }
    ],
    subtitle: 'REC-002 · Swiggy · Excess commission on promotional orders not pre-approved by outlet',
    amount: '₹2,10,500',
    actionText: 'Assign to Agent',
    status: 'review',
    aiConfidence: 88,
    aiInsights: "Nex AI Analysis: Swiggy auto-enrolled 214 orders into a platform-wide discount campaign without outlet consent, deducting promo costs from net payout.",
    trendData: [{val: 210}, {val: 210}, {val: 210}, {val: 210}, {val: 210}, {val: 210}, {val: 210}],
  },
  {
    id: 3,
    title: 'Payout Shortfall Alert',
    tags: [
      { label: 'Pending', type: 'danger' },
      { label: 'Rules', type: 'default' }
    ],
    subtitle: 'REC-003 · Swiggy · 23% deviation in expected weekly payout vs POS-recorded gross sales',
    amount: '₹56,550',
    actionText: 'Assign to Agent',
    status: 'requires_action',
    aiConfidence: 91,
    aiInsights: "Nex AI Analysis: Settlement cycle delay of 9 days detected for week ending Jun 14. Expected ₹2.4L; received ₹1.84L. TDS and GST on fees account for only 4.2% delta; remaining 18.8% gap is unexplained.",
    trendData: [{val: 5}, {val: 6}, {val: 5}, {val: 8}, {val: 25}, {val: 45}, {val: 56}],
  },
];

const cfoDailyTasks: Task[] = [
  {
    id: 101,
    title: 'Daily Aggregator Payout Summary',
    tags: [{ label: 'Done', type: 'default' }],
    subtitle: 'REC-CFO-1 · Verify T-1 net payouts from Zomato, Swiggy, and Direct ordering channel',
    actionText: 'Assign to Agent',
    status: 'review',
  },
  {
    id: 102,
    title: 'Order Cancellation Reconciliation',
    tags: [{ label: 'Pending', type: 'danger' }],
    subtitle: 'REC-CFO-2 · Match platform-cancelled orders against POS records and verify refund credits',
    actionText: 'Assign to Agent',
    status: 'requires_action',
  },
  {
    id: 103,
    title: 'Net Margin vs Gross Sales Report',
    tags: [{ label: 'Done', type: 'default' }],
    subtitle: 'REC-CFO-3 · Validate 6.2% dip in net margins vs POS gross — attributed to Swiggy commission hike in May',
    actionText: 'Assign to Agent',
    status: 'review',
  },
  {
    id: 104,
    title: 'Weekly Aggregator Settlement Report',
    tags: [{ label: 'Pending', type: 'danger' }],
    subtitle: 'REC-CFO-4 · Reconcile weekly net settlements from Zomato and Swiggy against outlet-level POS data',
    actionText: 'Assign to Agent',
    status: 'requires_action',
  },
];

const suggestedQueries = [
  "Do a Zomato recon for June 2026",
  "Is Q1 FY26 aggregator recon complete?",
  "Analyze Swiggy settlement TAT for Q3",
  "Explain Swiggy commission hike in May",
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

            {(msg.hasDownload && !shouldType) && (
              <Button
                variant="outlined"
                sx={{ 
                  mt: 2.5, 
                  borderRadius: '8px', 
                  fontSize: '0.75rem', 
                  fontWeight: 600, 
                  color: '#111', 
                  borderColor: '#e2e8f0', 
                  textTransform: 'none',
                  '&:hover': { bgcolor: '#f8fafc' } 
                }}
              >
                Download {msg.downloadName}
              </Button>
            )}
          </Paper>
        </Box>
      </Box>
    </Fade>
  );
};

// --- Main Checklist Page ---

const Checklist: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'daily'>('all');
  const [allTasks, setAllTasks] = useState<Task[]>(initialTasks);
  const [dailyTasks, setDailyTasks] = useState<Task[]>(cfoDailyTasks);
  
  const displayedTasks = activeTab === 'all' ? allTasks : dailyTasks;

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
    if (q.includes('zomato recon') || q.includes('june 2026') || q.includes('june')) {
      return [
        "Scanning Zomato June settlement data...",
        "Fetching POS gross sales manifest from ledger...",
        "Cross-referencing Order IDs against Zomato payouts...",
        "Identifying commission tier and promo deduction discrepancies...",
        "Running reconciliation engine benchmarks...",
      ];
    }
    if (q.includes('q1') || q.includes('fy26') || q.includes('complete')) {
      return [
        "Accessing Q1 FY2026 aggregator settlement archives...",
        "Aggregating monthly Zomato and Swiggy payout reports...",
        "Verifying pending dispute counts with Swiggy...",
        "Scanning direct ordering channel logs for Dec-Mar...",
        "Validating net payout vs POS gross revenue mapping...",
      ];
    }
    if (q.includes('tat') || q.includes('swiggy settlement')) {
      return [
        "Fetching Swiggy settlement ageing logs...",
        "Calculating weighted average settlement TAT for Q3...",
        "Aggregating weekly payout cycle metrics...",
        "Compiling quarterly delay trend distribution...",
      ];
    }
    if (q.includes('commission') || q.includes('fee') || q.includes('may')) {
      return [
        "Retrieving Swiggy historical commission rate cards...",
        "Detecting aggregator fee structure changes...",
        "Calculating commission impact on promotional orders...",
        "Benchmarking net payout vs contracted commission rates...",
      ];
    }
    return [
      "Accessing aggregator settlement data vault...",
      "Cross-referencing POS and platform transaction logs...",
      "Validating commission, TDS, and GST deductions...",
      "Generating payout reconciliation summary...",
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
        hasDownload: data.hasDownload,
        downloadName: data.downloadName
      };
      setMessages(prev => [...prev, assistantMsg]);
      setStreamingMessageId(assistantMsg.id);
    }, 4000);
  };

  const getAIResponse = (query: string): { text: string; chartData?: any[]; chartType?: 'bar' | 'line'; hasDownload?: boolean; downloadName?: string } => {
    const q = query.toLowerCase();
    
    if (q.includes('automated dispute filing') || q.includes('zomato') || q.includes('commission tier')) {
      return {
        text: "I've analyzed the Zomato commission tier discrepancy (REC-001). We identified 156 orders where the Gold-tier commission (28%) was applied instead of the contracted Silver-tier rate (22%) for outlet ID ZOM-BLR-042.\n\nSummary:\n• Total Orders Flagged: 156\n• Overcharge Value: ₹1,45,000\n• Root Cause: Rate card not updated after April 1st contract renewal.\n\nHere is the trend of overcharges over the past 7 days. Would you like me to automatically file a bulk dispute with Zomato with the attached evidence, or would you like to close this action item?",
        chartType: 'line',
        chartData: [
          { name: 'Mon', value: 10 },
          { name: 'Tue', value: 15 },
          { name: 'Wed', value: 20 },
          { name: 'Thu', value: 18 },
          { name: 'Fri', value: 45 },
          { name: 'Sat', value: 90 },
          { name: 'Sun', value: 145 },
        ]
      };
    }

    if (q.includes('daily aggregator payout summary') || q.includes('cfo-1') || q.includes('payout summary')) {
      return {
        text: "I've compiled the T-1 Aggregator Payout Summary (REC-CFO-1). We've processed the incoming net settlements for Zomato, Swiggy, and Direct ordering channel.\n\nSummary:\n• Total Expected: ₹14,50,000\n• Actual Received: ₹14,25,000\n• Variance: ₹25,000 (Swiggy TDS hold pending adjustment)\n\nThe chart below compares expected vs actual payout by aggregator. Shall I authorize the ledger sync for the verified amounts?",
        chartType: 'bar',
        chartData: [
          { name: 'Zomato', value: 580000 },
          { name: 'Swiggy', value: 620000 },
          { name: 'Direct', value: 225000 },
        ]
      };
    }

    if (q.includes('order cancellation') || q.includes('cfo-2') || q.includes('cancellation')) {
      return {
        text: "Generating Order Cancellation Reconciliation (REC-CFO-2)...\n\nThe report has been compiled successfully. It includes all platform-cancelled orders and verifies credits issued against POS records.\n\nSummary:\n• Total Cancelled Orders: 312\n• Unmatched Credits: 38\n• Avg. delay in credit posting: 3.2 days\n\nYou can download the full reconciliation report below. Shall I automatically flag the unmatched credits for dispute?",
        hasDownload: true,
        downloadName: 'Order_Cancellation_Reconciliation.csv'
      };
    }

    if (q.includes('net margin') || q.includes('gross sales report') || q.includes('cfo-3')) {
      return {
        text: "I've analyzed the Net Margin vs Gross Sales variance (REC-CFO-3). Net margins have dipped by 6.2% compared to the Q2 baseline.\n\nSummary:\n• Total Variance: -6.2%\n• Root Cause: 72% of the drop correlates with Swiggy raising platform commission from 22% to 26% in May for Bangalore outlets.\n\nThe chart below tracks net margin vs POS gross by week. Would you like me to flag the impacted outlet-weeks for contract review?",
        chartType: 'line',
        chartData: [
          { name: 'Week 1', value: 22.5 },
          { name: 'Week 2', value: 21.0 },
          { name: 'Week 3', value: 18.5 },
          { name: 'Week 4', value: 16.3 },
        ]
      };
    }

    if (q.includes('weekly aggregator settlement') || q.includes('cfo-4') || q.includes('settlement report')) {
      return {
        text: "Generating Weekly Aggregator Settlement Report (REC-CFO-4)...\n\nThe report is ready. It aggregates net payouts from Zomato and Swiggy for all outlets, cross-matched against POS gross sales and deduction breakdowns (commission, GST on fees, TDS, promo costs).\n\nYou can download the detailed settlement reconciliation below.",
        hasDownload: true,
        downloadName: 'Weekly_Aggregator_Settlement_Report.csv'
      };
    }

    if (q.includes('payout shortfall') || q.includes('shortfall') || q.includes('deviation')) {
      return {
        text: "I've investigated the Swiggy payout shortfall (REC-003). There's a 23% deviation between the expected weekly payout and actual net received, based on POS-recorded gross sales.\n\nSummary:\n• Total Shortfall: ₹56,550\n• Settlement Cycle: 9 days vs contracted 7-day cycle\n• Known deductions (TDS 1% + GST on fees 18%): account for 4.2% delta\n• Unexplained gap: 18.8% — likely unapproved promo deduction from Swiggy's end.\n\nI recommend raising a formal query with Swiggy Seller Support. Shall I auto-draft the dispute or close this alert?",
        chartType: 'line',
        chartData: [
          { name: 'W1', value: 5 },
          { name: 'W2', value: 6 },
          { name: 'W3', value: 5 },
          { name: 'W4', value: 8 },
          { name: 'W5', value: 25 },
          { name: 'W6', value: 45 },
          { name: 'W7', value: 56 },
        ]
      };
    }

    if (q.includes('zomato recon') || q.includes('june 2026')) {
      return {
        text: "I've initiated the Zomato reconciliation for June 2026. Data ingestion is 100% complete. I found a gross discrepancy of ₹12,45,600 across 114 orders, primarily due to 'Unapproved Promo Deduction' and 'Commission Tier Mismatch'.\n\nMatching POS figures: Gross Order Value is recorded at ₹4.41 Cr with Zomato net payout at ₹3.07 Cr (after 28% commission + GST on fees + TDS).\n\nWould you like me to flag these 114 orders for dispute?",
        chartType: 'bar',
        chartData: [
          { name: 'Matched', value: 2450 },
          { name: 'Mismatch', value: 114 },
          { name: 'Pending', value: 12 },
        ]
      };
    }

    if ((q.includes('q1') || q.includes('fy26')) && q.includes('complete')) {
      return {
        text: "Summary for Q1 FY2026 Aggregator Reconciliation:\n\n• Zomato: 100% Completed\n• Swiggy: 97.8% Completed (June week 4 pending)\n• Direct Channel: 100% Completed\n\nTotal Net Payout Received: ₹3,85,76,000 (₹3.85 Cr)\nTotal POS Gross Sales: ₹5,18,00,000 (₹5.18 Cr)\nTotal Platform Deductions: ₹1,32,23,742 (commission + GST on fees + TDS)\n\nThe 2.2% unreconciled gap is primarily attributed to unapproved Swiggy promo deductions in June.",
      };
    }

    if (q.includes('tat') || q.includes('settlement tat') || q.includes('swiggy settlement')) {
      return {
        text: "Swiggy settlement TAT analysis for Q3:\n\nAverage settlement cycle is 7.4 days vs contracted 7 days. Zomato is at 6.8 days. Current pending settlements for Q3 total ₹12.4 Lakh. Here is the ageing trend for the last 3 months:",
        chartType: 'line',
        chartData: [
          { name: 'April', value: 6.8 },
          { name: 'May', value: 7.2 },
          { name: 'June', value: 7.4 },
        ]
      };
    }
    
    if (q.includes('commission') || q.includes('fee') || q.includes('may')) {
      return {
        text: "In May 2026, the Swiggy commission rate hike (+4% for Bangalore outlets) impacted 26% of all delivery orders. This aligns with the dashboard dip in Net Payout for that period. Impact analysis:\n\nExpected Commission (22%): ₹32,00,000\nActual Commission Charged (26%): ₹38,86,000\nVariance: ₹6,86,000",
        chartType: 'bar',
        chartData: [
          { name: 'Apr Fees', value: 32.0 },
          { name: 'May Fees', value: 38.86 },
          { name: 'Jun Fees', value: 38.5 },
        ]
      };
    }

    return {
      text: "I'm on it. I've scanned the relevant Zomato and Swiggy settlement reports. Most payout cycles are within tolerance. I recommend focusing on the Swiggy commission discrepancies for this settlement period. Shall I run a deep dive or close this item?",
    };
  };

  const handleAskAI = (task: Task) => {
    handleSendMessage(`Help me with this task: "${task.title}"`);
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
            Actions
          </Typography>
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Chip label="5 Pending" size="small" sx={{ bgcolor: '#111', color: '#fff', fontWeight: 700, fontSize: '0.6rem', height: 16 }} />
            <Chip label="1 Urgent" size="small" sx={{ bgcolor: '#fef2f2', color: '#EF4545', fontWeight: 700, fontSize: '0.6rem', height: 16, border: '1px solid #fee2e2' }} />
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

      <Grid container sx={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        {/* Left Column: Task List */}
        <Grid item xs={12} md={7} sx={{ 
          height: '100%', 
          borderRight: '1px solid #f1f5f9',
          overflowY: 'auto',
          px: 6,
          py: 4,
        }}>
          {/* Action Items Header */}
          <Box sx={{ mb: 3 }}>
            <Stack direction="row" spacing={3} sx={{ borderBottom: '1px solid #f1f5f9', pb: 1 }}>
              <Typography 
                onClick={() => setActiveTab('all')}
                sx={{ fontWeight: activeTab === 'all' ? 700 : 600, color: activeTab === 'all' ? '#111' : '#64748b', fontSize: '0.85rem', cursor: 'pointer', borderBottom: activeTab === 'all' ? '2px solid #111' : 'none', pb: 1, mb: -1.25 }}
              >
                All ({allTasks.length})
              </Typography>
              <Typography 
                onClick={() => setActiveTab('daily')}
                sx={{ fontWeight: activeTab === 'daily' ? 700 : 600, color: activeTab === 'daily' ? '#111' : '#64748b', fontSize: '0.85rem', cursor: 'pointer', borderBottom: activeTab === 'daily' ? '2px solid #111' : 'none', pb: 1, mb: -1.25 }}
              >
                Daily ({dailyTasks.length})
              </Typography>
            </Stack>
          </Box>

          <Paper elevation={0} sx={{ border: '1px solid #f1f5f9', borderRadius: '12px', overflow: 'hidden' }}>
            <List sx={{ p: 0 }}>
              {displayedTasks.map((task, index) => (
                <React.Fragment key={task.id}>
                  <TaskItem 
                    task={task} 
                    onAskAI={() => handleAskAI(task)}
                  />
                  {index < displayedTasks.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Right Column: Nex Assistant */}
        <Grid item xs={12} md={5} sx={{ height: '100%', display: 'flex', flexDirection: 'column', bgcolor: '#fcfdfe' }}>
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
  onAskAI: () => void;
}> = ({ task, onAskAI }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2.5,
        bgcolor: '#fff',
        transition: 'all 0.15s ease',
        '&:hover': {
          bgcolor: '#f8fafc',
        }
      }}
    >
      {/* Left side: Title, Tags, Subtitle */}
      <Box sx={{ flex: 1, minWidth: 0, pr: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
          <Typography
            sx={{
              fontWeight: 700,
              color: '#111',
              fontSize: '0.9rem',
              letterSpacing: '-0.01em',
            }}
          >
            {task.title}
          </Typography>
          
          <Stack direction="row" spacing={1} alignItems="center">
            {task.tags.map((tag, i) => (
              <Chip 
                key={i}
                label={tag.label} 
                size="small" 
                sx={{ 
                  fontSize: '0.65rem', 
                  height: 20, 
                  bgcolor: tag.type === 'danger' ? '#fef2f2' : (tag.type === 'warning' ? '#fffbeb' : '#f1f5f9'), 
                  color: tag.type === 'danger' ? '#EF4545' : (tag.type === 'warning' ? '#d97706' : '#64748b'),
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: '1px solid',
                  borderColor: tag.type === 'danger' ? '#fecaca' : (tag.type === 'warning' ? '#fde68a' : 'transparent'),
                }} 
              />
            ))}
          </Stack>
        </Box>

        <Typography
          sx={{
            color: '#94a3b8',
            fontSize: '0.8rem',
            fontWeight: 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {task.subtitle}
        </Typography>
      </Box>

      {/* Right side: Amount and Buttons */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <Typography
          sx={{
            fontWeight: 700,
            color: '#111',
            fontSize: '0.95rem',
            letterSpacing: '-0.02em',
            minWidth: '70px',
            textAlign: 'right'
          }}
        >
          {task.amount}
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="center">
          {task.status !== 'completed' && (
            <Button
              variant="outlined"
              onClick={() => {}}
              startIcon={<PersonAddIcon sx={{ fontSize: '14px !important', color: '#64748b' }} />}
              sx={{ 
                color: '#64748b',
                borderColor: '#e2e8f0',
                textTransform: 'none', 
                fontWeight: 600, 
                fontSize: '0.75rem',
                height: 28,
                px: 1.5,
                borderRadius: '6px',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  color: '#111',
                  borderColor: '#cbd5e1',
                }
              }}
            >
              Teammate
            </Button>
          )}
          <Button
            variant="text"
            onClick={onAskAI}
            sx={{ 
              color: '#64748b',
              textTransform: 'none', 
              fontWeight: 600, 
              fontSize: '0.8rem',
              height: 28,
              px: 1,
              minWidth: 'auto',
              '&:hover': {
                bgcolor: '#f1f5f9',
                color: '#111',
              }
            }}
          >
            {task.actionText}
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};

export default Checklist;
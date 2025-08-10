import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Avatar,
  Chip,
  Card,
  CardContent,
  Stack,
  IconButton,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  CircularProgress,
  Container,
} from '@mui/material';
import {
  AutoAwesome as AutoAwesomeIcon,
  TrendingUp as TrendingUpIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  AccountBalance as AccountBalanceIcon,
  Timeline as TimelineIcon,
  Send as SendIcon,
  Psychology as PsychologyIcon,
  Analytics as AnalyticsIcon,
  Receipt as ReceiptIcon,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface ChatMessage {
  id: number;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'analysis' | 'audit' | 'report' | 'general';
}

interface Capability {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  examples: string[];
}

const capabilities: Capability[] = [
  {
    title: 'Flux Analysis',
    description: 'Analyze variances and trends with detailed commentary',
    icon: <TrendingUpIcon />,
  color: '#111111',
    examples: [
      'What changed in COGS last month?',
      'Analyze revenue variance vs budget',
      'Explain the increase in operating expenses'
    ]
  },
  {
    title: 'Accounting Audits',
    description: 'Perform comprehensive accounting reviews and audits',
    icon: <SecurityIcon />,
    color: '#dc2626',
    examples: [
      'Review expense categories for anomalies',
      'Audit journal entries for compliance',
      'Check for duplicate transactions'
    ]
  },
  {
    title: 'Custom Reporting',
    description: 'Generate tailored reports for any business need',
    icon: <AssessmentIcon />,
    color: '#059669',
    examples: [
      'Generate P&L summary for board meeting',
      'Create cash flow analysis report',
      'Build custom KPI dashboard'
    ]
  },
  {
    title: 'Financial Analysis',
    description: 'Deep dive into financial data with AI insights',
    icon: <AnalyticsIcon />,
    color: '#7c3aed',
    examples: [
      'What drove the margin improvement?',
      'Analyze working capital trends',
      'Compare performance vs industry benchmarks'
    ]
  },
  {
    title: 'Reconciliation Help',
    description: 'Streamline reconciliation processes with AI assistance',
    icon: <AccountBalanceIcon />,
    color: '#ea580c',
    examples: [
      'Explain discrepancies in cash accounts',
      'Help reconcile credit card statements',
      'Identify unmatched transactions'
    ]
  },
  {
    title: 'Compliance Checks',
    description: 'Ensure regulatory compliance with automated reviews',
    icon: <ReceiptIcon />,
    color: '#0891b2',
    examples: [
      'Verify journal entries for compliance',
      'Check expense policy adherence',
      'Review tax calculation accuracy'
    ]
  }
];

const quickPrompts = [
  'What changed in COGS last month?',
  'Generate P&L summary for board meeting',
  'Review expense categories for anomalies',
  'Analyze revenue variance vs budget',
  'Explain discrepancies in cash accounts',
  'Create cash flow analysis report'
];

const recentConversations = [
  {
    id: 1,
    title: 'Revenue Analysis Q3',
    lastMessage: 'The 15% increase in revenue was primarily driven by...',
    timestamp: '2 hours ago',
    type: 'analysis' as const
  },
  {
    id: 2,
    title: 'Expense Audit Review',
    lastMessage: 'Found 3 potential anomalies in travel expenses...',
    timestamp: '1 day ago',
    type: 'audit' as const
  },
  {
    id: 3,
    title: 'Board Report Generation',
    lastMessage: 'Your custom P&L report has been generated...',
    timestamp: '3 days ago',
    type: 'report' as const
  }
];

const OscarAI: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      text: "Hi! I'm Oscar, your AI-powered accounting teammate. I can help you with flux analysis, audits, custom reporting, and financial analysis. What would you like to explore today?",
      isUser: false,
      timestamp: new Date(),
      type: 'general'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      text: inputText,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: messages.length + 2,
        text: generateAIResponse(inputText),
        isUser: false,
        timestamp: new Date(),
        type: determineMessageType(inputText)
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  };

  const generateAIResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('cogs') || lowerInput.includes('cost of goods')) {
      return "I've analyzed your COGS for last month. Here's what I found:\n\n• COGS increased by 12% compared to the previous month\n• Raw materials costs rose by 8% due to supplier price increases\n• Labor costs increased by 15% due to overtime during peak production\n• Manufacturing overhead remained stable at 3.2% of revenue\n\nRecommendation: Consider renegotiating supplier contracts and optimizing production scheduling to reduce overtime costs.";
    } else if (lowerInput.includes('revenue') || lowerInput.includes('sales')) {
      return "Revenue analysis shows strong performance:\n\n• Total revenue: $2.4M (+15% vs last month)\n• Recurring revenue: $1.8M (+8% growth)\n• New customer acquisition: $600K (+35% increase)\n• Customer retention rate: 94% (industry avg: 89%)\n\nKey drivers: Successful Q4 marketing campaign and new product launch contributed to the growth.";
    } else if (lowerInput.includes('expense') || lowerInput.includes('audit')) {
      return "Expense audit completed. Here are the findings:\n\n• Total expenses reviewed: $1.2M across 2,847 transactions\n• Potential anomalies found: 3 items requiring attention\n• Policy violations: 2 instances of over-limit meals\n• Duplicate transactions: 1 potential duplicate payment\n\nNext steps: I've flagged these items for your review. Would you like me to generate a detailed audit report?";
    } else if (lowerInput.includes('report') || lowerInput.includes('p&l')) {
      return "I'll generate a comprehensive P&L report for your board meeting:\n\n• Executive summary with key metrics\n• Revenue breakdown by segment\n• Cost analysis and margin trends\n• Year-over-year comparisons\n• Forward-looking projections\n\nThe report will be ready in 2-3 minutes. Would you like me to include any specific KPIs or focus areas?";
    } else {
      return "I understand you're looking for financial insights. I can help you with:\n\n• Flux analysis and variance reporting\n• Comprehensive accounting audits\n• Custom report generation\n• Financial trend analysis\n• Reconciliation assistance\n• Compliance reviews\n\nCould you provide more specific details about what you'd like to analyze?";
    }
  };

  const determineMessageType = (input: string): 'analysis' | 'audit' | 'report' | 'general' => {
    const lowerInput = input.toLowerCase();
    if (lowerInput.includes('audit') || lowerInput.includes('review')) return 'audit';
    if (lowerInput.includes('report') || lowerInput.includes('generate')) return 'report';
    if (lowerInput.includes('analysis') || lowerInput.includes('trend')) return 'analysis';
    return 'general';
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
  };

  const getMessageTypeColor = (type?: string) => {
    switch (type) {
  case 'analysis': return '#111111';
      case 'audit': return '#dc2626';
      case 'report': return '#059669';
      default: return '#6b7280';
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 64, height: 64, mr: 2 }}>
              <PsychologyIcon sx={{ fontSize: 32 }} />
            </Avatar>
  <Typography variant="h3" sx={{ fontWeight: 800, background: 'linear-gradient(45deg, #111111, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Oscar AI
            </Typography>
          </Box>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto', lineHeight: 1.6 }}>
            Oscar is your AI-powered teammate. Automate complex tasks like flux analysis with commentary, performing accounting audits, and custom reporting. Ask questions like "What changed in COGS last month?" and get instant answers. Oscar brings AI to every corner of your accounting workflow and financial analysis.
          </Typography>
        </Box>
      </Container>

      <Grid container spacing={4}>
        {/* Capabilities Grid */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3, height: 'fit-content', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ mr: 1, color: 'primary.main' }} />
              AI Capabilities
            </Typography>
            <Grid container spacing={2}>
              {capabilities.map((capability, index) => (
                <Grid item xs={12} sm={6} lg={12} key={index}>
                  <Card sx={{ p: 2, cursor: 'pointer', transition: 'all 0.2s', '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 } }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Avatar sx={{ bgcolor: capability.color, width: 32, height: 32, mr: 1.5 }}>
                        {capability.icon}
                      </Avatar>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {capability.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {capability.description}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Example: "{capability.examples[0]}"
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>

          {/* Recent Conversations */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center' }}>
              <HistoryIcon sx={{ mr: 1, color: 'primary.main' }} />
              Recent Conversations
            </Typography>
            <List>
              {recentConversations.map((conversation) => (
                <ListItem key={conversation.id} sx={{ px: 0, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getMessageTypeColor(conversation.type), width: 32, height: 32 }}>
                      {conversation.type === 'analysis' && <TrendingUpIcon />}
                      {conversation.type === 'audit' && <SecurityIcon />}
                      {conversation.type === 'report' && <AssessmentIcon />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={conversation.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                          {conversation.lastMessage}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {conversation.timestamp}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Chat Interface */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ height: 600, display: 'flex', flexDirection: 'column' }}>
            {/* Chat Header */}
            <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Chat with Oscar
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ask me anything about your financial data and accounting processes
              </Typography>
            </Box>

            {/* Messages */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
              {messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    display: 'flex',
                    justifyContent: message.isUser ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Box
                    sx={{
                      maxWidth: '70%',
                      p: 2,
                      borderRadius: 2,
                      bgcolor: message.isUser ? 'primary.main' : 'grey.100',
                      color: message.isUser ? 'white' : 'text.primary'
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                      {message.text}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.7, mt: 1, display: 'block' }}>
                      {message.timestamp.toLocaleTimeString()}
                    </Typography>
                  </Box>
                </Box>
              ))}
              {isLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    <Typography variant="body2">Oscar is thinking...</Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Quick Prompts */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Quick prompts:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                {quickPrompts.map((prompt, index) => (
                  <Chip
                    key={index}
                    label={prompt}
                    onClick={() => handleQuickPrompt(prompt)}
                    sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
                    variant="outlined"
                  />
                ))}
              </Box>
            </Box>

            {/* Input */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  placeholder="Ask Oscar about your financial data..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                  disabled={isLoading}
                />
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  sx={{ bgcolor: 'primary.main', color: 'white', '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  <SendIcon />
                </IconButton>
              </Box>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default OscarAI; 
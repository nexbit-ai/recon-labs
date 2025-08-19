import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  IconButton,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemButton,
  Button,
  Divider,
  Chip,
  Stack,
  Menu,
  MenuItem,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import {
  Send as SendIcon,
  History as HistoryIcon,
  MoreVert as MoreVertIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  StarBorder as StarBorderIcon,
  Star as StarIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Menu as MenuIcon,
} from '@mui/icons-material';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  lastMessage: Date;
  starred: boolean;
}

// Mock chat history
const mockChatHistory: ChatSession[] = [
  {
    id: '1',
    title: 'Reconciliation Query',
    messages: [
      { id: '1', text: 'How do I reconcile bank accounts?', sender: 'user', timestamp: new Date(Date.now() - 86400000) },
      { id: '2', text: 'I can help you with bank reconciliation. Here are the key steps:\n\n1. Compare your bank statement with your accounting records\n2. Identify and mark transactions that appear in both\n3. Note any discrepancies\n4. Investigate unmatched items\n5. Make necessary adjustments\n\nWould you like me to walk you through any specific step?', sender: 'assistant', timestamp: new Date(Date.now() - 86400000 + 30000) },
    ],
    lastMessage: new Date(Date.now() - 86400000),
    starred: true,
  },
  {
    id: '2',
    title: 'Month-end Process',
    messages: [
      { id: '3', text: 'What tasks should I prioritize for month-end close?', sender: 'user', timestamp: new Date(Date.now() - 172800000) },
      { id: '4', text: 'For an efficient month-end close, prioritize these tasks:\n\n1. **High Priority:**\n   - Bank reconciliations\n   - Accounts receivable review\n   - Accruals and deferrals\n\n2. **Medium Priority:**\n   - Expense report processing\n   - Inventory valuation\n   - Fixed asset depreciation\n\n3. **Lower Priority:**\n   - Management reports\n   - Variance analysis\n\nWould you like specific guidance on any of these areas?', sender: 'assistant', timestamp: new Date(Date.now() - 172800000 + 45000) },
    ],
    lastMessage: new Date(Date.now() - 172800000),
    starred: false,
  },
  {
    id: '3',
    title: 'Variance Analysis',
    messages: [
      { id: '5', text: 'How can I analyze budget variances effectively?', sender: 'user', timestamp: new Date(Date.now() - 259200000) },
      { id: '6', text: 'Effective variance analysis involves:\n\n1. **Calculate variances** between actual and budgeted amounts\n2. **Categorize by type:** favorable vs. unfavorable\n3. **Focus on material variances** (typically >5-10%)\n4. **Investigate root causes:**\n   - Volume changes\n   - Price fluctuations\n   - Timing differences\n   - Operational issues\n\n5. **Document explanations** for significant variances\n6. **Take corrective actions** where needed\n\nWhat specific area would you like to dive deeper into?', sender: 'assistant', timestamp: new Date(Date.now() - 259200000 + 60000) },
    ],
    lastMessage: new Date(Date.now() - 259200000),
    starred: false,
  },
];

const Assistant: React.FC = () => {
  const [message, setMessage] = useState('');
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [chatHistory, setChatHistory] = useState<ChatSession[]>(mockChatHistory);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false); // history sidebar collapsed by default

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentSession?.messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: message,
      sender: 'user',
      timestamp: new Date(),
    };

    // If no current session, create a new one
    if (!currentSession) {
      const newSession: ChatSession = {
        id: Date.now().toString(),
        title: message.slice(0, 30) + (message.length > 30 ? '...' : ''),
        messages: [newMessage],
        lastMessage: new Date(),
        starred: false,
      };
      
      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'm here to help you with finance and accounting questions. How can I assist you today?",
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        newSession.messages.push(assistantMessage);
        setCurrentSession({ ...newSession });
        setChatHistory(prev => [newSession, ...prev]);
      }, 1000);

      setCurrentSession(newSession);
      setChatHistory(prev => [newSession, ...prev]);
    } else {
      // Add to existing session
      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, newMessage],
        lastMessage: new Date(),
      };

      // Simulate assistant response
      setTimeout(() => {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thank you for your question. Let me help you with that. Based on your query, here are some insights and recommendations...",
          sender: 'assistant',
          timestamp: new Date(),
        };
        
        updatedSession.messages.push(assistantMessage);
        setCurrentSession({ ...updatedSession });
        setChatHistory(prev => 
          prev.map(session => 
            session.id === updatedSession.id ? updatedSession : session
          )
        );
      }, 1000);

      setCurrentSession(updatedSession);
      setChatHistory(prev => 
        prev.map(session => 
          session.id === updatedSession.id ? updatedSession : session
        )
      );
    }

    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setCurrentSession(null);
    setMenuAnchorEl(null);
  };

  const selectChatSession = (session: ChatSession) => {
    setCurrentSession(session);
  };

  const toggleStar = (sessionId: string) => {
    setChatHistory(prev =>
      prev.map(session =>
        session.id === sessionId ? { ...session, starred: !session.starred } : session
      )
    );
    setMenuAnchorEl(null);
  };

  const deleteSession = (sessionId: string) => {
    setChatHistory(prev => prev.filter(session => session.id !== sessionId));
    if (currentSession?.id === sessionId) {
      setCurrentSession(null);
    }
    setMenuAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, sessionId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      {/* Main Header Bar */}
      <Paper
        sx={{
          p: 2,
          borderRadius: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: 'none',
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton size="small" onClick={() => setSidebarOpen((v) => !v)} aria-label={sidebarOpen ? 'Collapse history' : 'Expand history'}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Chat
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            startIcon={<SettingsIcon />}
            variant="outlined"
            size="small"
            sx={{ 
              borderRadius: 0,
              px: 1.5,
              py: 0.5,
            }}
          >
            Options
          </Button>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={startNewChat}
            sx={{ 
              borderRadius: 0,
              px: 1.5,
              py: 0.5,
            }}
          >
            New Conversation
          </Button>
        </Box>
      </Paper>

      {/* Horizontal Divider */}
      <Divider />

      {/* Main Content Area */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Chat History Bar */}
        <Box
          sx={{
            width: sidebarOpen ? 320 : 0,
            borderRight: sidebarOpen ? '1px solid #e0e0e0' : 'none',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'width 0.3s ease',
          }}
        >
          <List sx={{ p: 0, flex: 1, overflow: 'auto' }}>
            {chatHistory.map((session) => (
              <ListItem
                key={session.id}
                sx={{
                  p: 0,
                }}
                secondaryAction={
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuClick(e, session.id);
                    }}
                  >
                    <MoreVertIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  selected={currentSession?.id === session.id}
                  onClick={() => selectChatSession(session)}
                  sx={{
                    py: 1,
                    px: 2,
                    minHeight: 'auto',
                    '&.Mui-selected': {
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {session.starred ? (
                      <StarIcon color="warning" fontSize="small" />
                    ) : (
                      <HistoryIcon color="disabled" fontSize="small" />
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {session.title}
                      </Typography>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Chat Area */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
          {!currentSession ? (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              <Box sx={{ width: '100%', maxWidth: 900, px: 2 }}>
                <Typography variant="h3" sx={{ textAlign: 'center', fontWeight: 800, mb: 4 }}>
                  What can I help with?
                </Typography>
                <Paper elevation={0} sx={{
                  mx: 'auto',
                  p: 2,
                  borderRadius: 1,
                  border: '1px solid #e5e7eb',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <TextField
                    fullWidth
                    placeholder="Ask anything"
                    value={message}
                    sx={{ borderRadius: 2 }}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    variant="standard"
                    InputProps={{ disableUnderline: true, sx: { fontSize: 18 } }}
                  />
                  <IconButton color="primary" onClick={handleSendMessage} sx={{color: '#111', '&:hover': { bgcolor: '#000' } }}>
                    <SendIcon />
                  </IconButton>
                </Paper>
              </Box>
            </Box>
          ) : (
            <>
              {currentSession.messages.map((msg) => (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    mb: 1,
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      maxWidth: '70%',
                      flexDirection: msg.sender === 'user' ? 'row-reverse' : 'row',
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.300',
                      }}
                    >
                      {msg.sender === 'user' ? 'U' : 'AI'}
                    </Avatar>
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: msg.sender === 'user' ? 'primary.main' : 'grey.100',
                        color: msg.sender === 'user' ? 'white' : 'text.primary',
                        borderRadius: 0,
                      }}
                    >
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                        {msg.text}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.7,
                          display: 'block',
                          mt: 0.5,
                        }}
                      >
                        {msg.timestamp.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </Paper>
                  </Box>
                </Box>
              ))}
              <div ref={messagesEndRef} />
            </>
          )}
        </Box>

      
        </Box>
      </Box>

      {/* Context Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={() => setMenuAnchorEl(null)}
      >
        <MenuItem
          onClick={() => selectedSessionId && toggleStar(selectedSessionId)}
        >
          <ListItemIcon>
            {chatHistory.find(s => s.id === selectedSessionId)?.starred ? (
              <StarIcon fontSize="small" />
            ) : (
              <StarBorderIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {chatHistory.find(s => s.id === selectedSessionId)?.starred ? 'Unstar' : 'Star'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={() => setMenuAnchorEl(null)}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Rename</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => selectedSessionId && deleteSession(selectedSessionId)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Assistant; 
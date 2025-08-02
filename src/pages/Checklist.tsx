import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
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
  Tabs,
  Tab,
  Drawer,
  CircularProgress,
  List as MUIList,
  ListItem as MUIListItem,
  ListItemText as MUIListItemText,
  Select,
  FormControl,
  MenuItem,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  FilterList as FilterListIcon,
  CalendarToday as CalendarTodayIcon,
  ErrorOutline as ErrorOutlineIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  Share as ShareIcon,
  Close as CloseIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// Mock users
const users = [
  { id: 1, name: 'Alice', avatar: 'https://randomuser.me/api/portraits/women/1.jpg' },
  { id: 2, name: 'Bob', avatar: 'https://randomuser.me/api/portraits/men/2.jpg' },
  { id: 3, name: 'Carol', avatar: 'https://randomuser.me/api/portraits/women/3.jpg' },
  { id: 4, name: 'Dan', avatar: 'https://randomuser.me/api/portraits/men/4.jpg' },
  { id: 5, name: 'Eve', avatar: 'https://randomuser.me/api/portraits/women/5.jpg' },
];

// Mock tasks
const overdueTasks = [
  {
    id: 1,
    title: 'Reconcile HSBC operating bank account #100013',
    tag: 'INC.',
    due: '2 Feb',
    users: [users[2], users[3]],
    status: 'overdue',
  },
  {
    id: 2,
    title: 'Post payroll and benefits from payroll system',
    tag: 'INC.',
    due: '2 Feb',
    users: [users[1], users[0]],
    status: 'overdue',
  },
];

const upcomingTasks = [
  {
    id: 3,
    title: 'Reconcile Goldman Sachs money market account *100030',
    tag: 'LTD',
    due: '3 Feb',
    users: [users[0], users[4]],
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Reconcile Revolut collections bank account *100020',
    tag: 'INC.',
    due: '3 Feb',
    users: [users[2], users[3], users[1]],
    status: 'upcoming',
  },
  {
    id: 5,
    title: 'Reconcile ING operating bank account *100040',
    tag: 'INC.',
    due: '3 Feb',
    users: [users[4], users[0]],
    status: 'upcoming',
  },
];

// Mock progress data
const progressData = [
  { name: 'Jan 1', completed: 10 },
  { name: 'Jan 5', completed: 30 },
  { name: 'Jan 10', completed: 50 },
  { name: 'Jan 15', completed: 70 },
  { name: 'Jan 20', completed: 90 },
  { name: 'Jan 25', completed: 100 },
  { name: 'Jan 31', completed: 113 },
];

// Mock links for tasks
interface TaskLink {
  label: string;
  url: string;
  icon: string;
}

const taskLinks: { [key: number]: TaskLink[] } = {
  2: [
    {
      label: 'Netsuite - Journal entries',
      url: 'www.netsuite.com/journal_entry?=44/43828394900202',
      icon: 'netsuite',
    },
    {
      label: 'Drive - Invoices',
      url: 'www.drive.google.com/mydrive_invoices234?',
      icon: 'drive',
    },
  ],
};

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

// Add mock comments data
const initialComments = [
  {
    id: 1,
    user: users[0],
    text: 'Please double-check the supporting document.',
    timestamp: '2024-06-01T10:15:00Z',
  },
  {
    id: 2,
    user: users[1],
    text: 'Reviewed and looks good to me.',
    timestamp: '2024-06-01T12:30:00Z',
  },
];

const Checklist: React.FC = () => {
  const [showOverdue, setShowOverdue] = useState(true);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // default to current month
  const [comments, setComments] = useState<{ [taskId: number]: typeof initialComments }>({});
  const [newComment, setNewComment] = useState<{ [taskId: number]: string }>({});
  const [aiPanel, setAIPanel] = useState<{ open: boolean; taskId: number | null; loading: boolean; answer: string[]; prompt: string; generated: boolean }>({ open: false, taskId: null, loading: false, answer: [], prompt: '', generated: false });

  // For demo, use same tasks for all months
  const getMonthTasks = (monthIdx: number) => ({ overdue: overdueTasks, upcoming: upcomingTasks });
  const { overdue: monthOverdue, upcoming: monthUpcoming } = getMonthTasks(selectedMonth);
  const filteredOverdue = monthOverdue.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));
  const filteredUpcoming = monthUpcoming.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()));

  // Helper for rendering links
  const renderLinkIcon = (icon: string) => {
    if (icon === 'netsuite') return <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/Oracle_NetSuite_logo.png" alt="netsuite" style={{ height: 20, marginLeft: 8 }} />;
    if (icon === 'drive') return <img src="https://upload.wikimedia.org/wikipedia/commons/1/1d/Google_Drive_logo.png" alt="drive" style={{ height: 20, marginLeft: 8 }} />;
    return null;
  };

  const handleAddComment = (taskId: number) => {
    const text = newComment[taskId]?.trim();
    if (!text) return;
    const comment = {
      id: Date.now(),
      user: users[0], // Assume current user is users[0] for demo
      text,
      timestamp: new Date().toISOString(),
    };
    setComments((prev) => ({
      ...prev,
      [taskId]: [...(prev[taskId] || initialComments), comment],
    }));
    setNewComment((prev) => ({ ...prev, [taskId]: '' }));
  };

  const handleAskAI = (task: any) => {
    setAIPanel({ open: true, taskId: task.id, loading: false, answer: [], prompt: task.title, generated: false });
  };

  const handleGenerateAIAnswer = () => {
    setAIPanel((prev) => ({ ...prev, loading: true }));
    setTimeout(() => {
      setAIPanel((prev) => ({
        ...prev,
        loading: false,
        generated: true,
        answer: [
          '1. Review the supporting documents attached to the task.',
          '2. Verify the transaction details with the bank statement.',
          '3. Ensure all discrepancies are noted and explained.',
          '4. Mark the checklist as complete once all steps are done.'
        ],
      }));
    }, 1800);
  };

  const handleEditAIPrompt = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAIPanel((prev) => ({ ...prev, prompt: e.target.value }));
  };

  const handleCloseAIPanel = () => setAIPanel({ open: false, taskId: null, loading: false, answer: [], prompt: '', generated: false });

  // Helper to get the current expanded task object
  const allTasks = [...overdueTasks, ...upcomingTasks];
  const currentTask = allTasks.find((t) => t.id === aiPanel.taskId);

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      {/* Progress Bar Section */}
      <Paper sx={{ mb: 3, p: 3, borderRadius: 3, boxShadow: 'none', border: '1.5px solid #e5e7eb' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Close Month Progress
          </Typography>
          <Typography variant="body2" color="text.secondary">
            3/15 tasks completed
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ width: '100%', height: 10, bgcolor: '#f3f3f3', borderRadius: 5, overflow: 'hidden', mb: 1 }}>
              <Box sx={{ width: '20%', height: '100%', bgcolor: '#22c55e' }} />
            </Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              20% complete
            </Typography>
          </Box>
          <Chip label="In progress" icon={<span style={{ display: 'flex', alignItems: 'center', color: '#f59e42', fontSize: 18, marginRight: 4 }}>⏲️</span>} sx={{ bgcolor: 'rgba(245, 158, 66, 0.08)', color: '#f59e42', fontWeight: 700, fontSize: 15, borderRadius: 2, height: 32 }} />
        </Box>
        <Box sx={{ mt: 2, bgcolor: '#fffbe6', borderRadius: 2, p: 1.5, border: '1px solid #ffe58f' }}>
          <Typography variant="body2" sx={{ color: '#b26a00', fontWeight: 600 }}>
            Note: You need to complete all pre-lock tasks before you can lock this period.
          </Typography>
        </Box>
      </Paper>
      {/* Title Row and Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mr: 2 }}>
          Month-end close
        </Typography>
        <Box sx={{ flex: 1 }} />
        <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value as number)}
            displayEmpty
            sx={{ borderRadius: 2 }}
          >
            {monthNames.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month} {new Date().getFullYear()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button startIcon={<FilterListIcon />} variant="outlined" sx={{ borderRadius: 2, mr: 2 }}>
          Filters
        </Button>
        <Button startIcon={<ShareIcon />} variant="outlined" sx={{ borderRadius: 2, mr: 2 }}>
          Share
        </Button>
        <Button startIcon={<CloseIcon />} variant="outlined" sx={{ borderRadius: 2 }}>
          Close period
        </Button>
      </Box>
      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1 }}>
          <TextField
            placeholder="Search"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 240, background: '#fff', borderRadius: 2 }}
          />
        </Box>
        <Divider />
        {/* Overdue Group */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#fafbfc', cursor: 'pointer' }} onClick={() => setShowOverdue((v) => !v)}>
            <IconButton size="small">
              {showOverdue ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Typography sx={{ fontWeight: 600 }}>Overdue {filteredOverdue.length}</Typography>
          </Box>
          <Collapse in={showOverdue}>
            <List disablePadding>
              {filteredOverdue.map((task) => (
                <React.Fragment key={task.id}>
                  <ListItem
                    sx={{ pl: 8, pr: 2, py: 1, borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                    onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                    secondaryAction={
                      <IconButton edge="end" size="small" onClick={e => { e.stopPropagation(); setExpandedTask(expandedTask === task.id ? null : task.id); }}>
                        {expandedTask === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                  >
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <ErrorOutlineIcon color="warning" />
                    </ListItemIcon>
                    <ListItemText primary={task.title} />
                    <Chip label={task.tag} size="small" sx={{ mr: 1, bgcolor: '#f5f5f7', fontWeight: 500 }} />
                    <Chip icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} label={task.due} size="small" sx={{ mr: 1, bgcolor: '#f5f5f7' }} />
                    <Stack direction="row" spacing={-1} sx={{ mr: 1 }}>
                      {task.users.map((user) => (
                        <Avatar key={user.id} src={user.avatar} sx={{ width: 28, height: 28, border: '2px solid #fff' }} />
                      ))}
                    </Stack>
                  </ListItem>
                  <Collapse in={expandedTask === task.id} timeout="auto" unmountOnExit>
                    <Box sx={{ mx: 8, my: 2, p: 2, bgcolor: '#fff', borderRadius: 2, boxShadow: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="h6" sx={{ fontWeight: 600, wordBreak: 'break-word' }}>
                          {task.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button variant="outlined" color="inherit">Reject</Button>
                          <Button variant="contained" color="primary" sx={{ boxShadow: 'none' }}>Approve</Button>
                          <Button variant="outlined" color="secondary" onClick={() => handleAskAI(task)}>
                            AskAI
                          </Button>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <Chip label="Waiting for review" color="info" />
                        <Chip label="Assigned to you" color="success" size="small" sx={{ fontWeight: 600, bgcolor: '#e6f4ea', color: '#15803d' }} />
                        <Chip icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} label={task.due} size="small" sx={{ bgcolor: '#f5f5f7' }} />
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Links</Typography>
                      <Box>
                        {(taskLinks[task.id] || []).map((link, idx) => (
                          <Paper key={idx} sx={{ display: 'flex', alignItems: 'center', p: 1.5, mb: 1, borderRadius: 2, boxShadow: 0 }}>
                            <Box sx={{ flex: 1 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{link.label}</Typography>
                              <Typography variant="body2" color="text.secondary">{link.url}</Typography>
                            </Box>
                            {renderLinkIcon(link.icon)}
                          </Paper>
                        ))}
                        <Button startIcon={<AddIcon />} variant="text" sx={{ mt: 1 }}>
                          Add link
                        </Button>
                      </Box>
                      {/* Comments Section */}
                      <Box sx={{ mt: 3 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Comments</Typography>
                        <Box sx={{ maxHeight: 180, overflowY: 'auto', mb: 2 }}>
                          {(comments[task.id] || initialComments).map((comment) => (
                            <Box key={comment.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                              <Avatar src={comment.user.avatar} sx={{ width: 32, height: 32, mr: 1 }} />
                              <Box sx={{ flex: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mr: 1 }}>{comment.user.name}</Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {new Date(comment.timestamp).toLocaleString()}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{comment.text}</Typography>
                              </Box>
                            </Box>
                          ))}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                          <Avatar src={users[0].avatar} sx={{ width: 32, height: 32 }} />
                          <TextField
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            placeholder="Add a comment..."
                            value={newComment[task.id] || ''}
                            onChange={(e) => setNewComment((prev) => ({ ...prev, [task.id]: e.target.value }))}
                            sx={{ flex: 1 }}
                            size="small"
                          />
                          <Button
                            variant="contained"
                            sx={{ minWidth: 0, px: 2, py: 1, borderRadius: 2 }}
                            disabled={!(newComment[task.id] && newComment[task.id].trim())}
                            onClick={() => handleAddComment(task.id)}
                          >
                            Post
                          </Button>
                        </Box>
                      </Box>
                    </Box>
                  </Collapse>
                </React.Fragment>
              ))}
            </List>
          </Collapse>
        </Box>
        {/* Upcoming Group */}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#fafbfc', cursor: 'pointer' }} onClick={() => setShowUpcoming((v) => !v)}>
            <IconButton size="small">
              {showUpcoming ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
            <Typography sx={{ fontWeight: 600 }}>Upcoming {filteredUpcoming.length}</Typography>
          </Box>
          <Collapse in={showUpcoming}>
            <List disablePadding>
              {filteredUpcoming.map((task) => (
                <ListItem key={task.id} sx={{ pl: 8, pr: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <RadioButtonUncheckedIcon color="disabled" />
                  </ListItemIcon>
                  <ListItemText primary={task.title} />
                  <Chip label={task.tag} size="small" sx={{ mr: 1, bgcolor: '#f5f5f7', fontWeight: 500 }} />
                  <Chip icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} label={task.due} size="small" sx={{ mr: 1, bgcolor: '#f5f5f7' }} />
                  <Stack direction="row" spacing={-1} sx={{ mr: 1 }}>
                    {task.users.map((user) => (
                      <Avatar key={user.id} src={user.avatar} sx={{ width: 28, height: 28, border: '2px solid #fff' }} />
                    ))}
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Collapse>
        </Box>
      </Paper>
      {/* Drawer for AskAI */}
      {currentTask && (
        <Drawer
          anchor="right"
          open={aiPanel.open}
          onClose={handleCloseAIPanel}
          PaperProps={{ sx: { width: 400, p: 3 } }}
        >
          <Box sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>Ask AI</Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Task</Typography>
            <TextField
              value={aiPanel.prompt}
              onChange={handleEditAIPrompt}
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              sx={{ mb: 2, bgcolor: '#f5f5f7' }}
              size="small"
            />
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>AI Answer</Typography>
            {aiPanel.loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                <CircularProgress size={24} />
                <Typography>Answer is generating...</Typography>
              </Box>
            ) : aiPanel.generated ? (
              <MUIList>
                {aiPanel.answer.map((step, idx) => (
                  <MUIListItem key={idx}>
                    <MUIListItemText primary={step} />
                  </MUIListItem>
                ))}
              </MUIList>
            ) : (
              <Typography color="text.secondary" sx={{ mb: 2 }}>No answer generated yet.</Typography>
            )}
            <Box sx={{ flex: 1 }} />
            {!aiPanel.generated ? (
              <Button variant="contained" onClick={handleGenerateAIAnswer} sx={{ mt: 2 }} disabled={aiPanel.loading || !aiPanel.prompt.trim()}>
                Just Ask
              </Button>
            ) : (
              <>
                <Button variant="contained" color="success" sx={{ mb: 1 }}>
                  Execute
                </Button>
                <Button variant="outlined" onClick={handleCloseAIPanel} sx={{ mt: 0 }}>Close</Button>
              </>
            )}
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default Checklist; 
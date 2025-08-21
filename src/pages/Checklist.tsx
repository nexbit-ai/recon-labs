import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Input,
  InputAdornment,
  Link,
  ButtonBase,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
} from '@mui/material';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import Badge from '@mui/material/Badge';
import Popover from '@mui/material/Popover';
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
  Flag as FlagIcon,
  TableChart as TableIcon,
  OpenInNew as OpenInNewIcon,
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
    title: 'Reconcile March flipkart orders',
    tag: 'LTD',
    due: '3 Feb',
    users: [users[0], users[4]],
    status: 'upcoming',
  },
  {
    id: 4,
    title: 'Reconcile April flipkart orders',
    tag: 'INC.',
    due: '3 Feb',
    users: [users[2], users[3], users[1]],
    status: 'upcoming',
  },
  {
    id: 5,
    title: 'Reconcile Website orders',
    tag: 'INC.',
    due: '3 Feb',
    users: [users[4], users[0]],
    status: 'upcoming',
  },
];

const completedTasks = [
  {
    id: 6,
    title: 'Reconcile February flipkart orders',
    tag: 'INC.',
    completedDate: '1 Feb',
    users: [users[2], users[3]],
    status: 'completed',
  },
  {
    id: 7,
    title: 'Reconcile February website orders',
    tag: 'INC.',
    completedDate: '31 Jan',
    users: [users[1], users[0]],
    status: 'completed',
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
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showCompleted, setShowCompleted] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedTask, setExpandedTask] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth()); // default to current month
  const [comments, setComments] = useState<{ [taskId: number]: typeof initialComments }>({});
  const [newComment, setNewComment] = useState<{ [taskId: number]: string }>({});
  const [aiPanel, setAIPanel] = useState<{ open: boolean; taskId: number | null; loading: boolean; answer: string[]; prompt: string; generated: boolean }>({ open: false, taskId: null, loading: false, answer: [], prompt: '', generated: false });

  // Task creation modal state
  type TaskType = 'manual_recon' | 'exception_review' | 'data_validation' | 'custom';
  const [createOpen, setCreateOpen] = useState(false);
  const [taskType, setTaskType] = useState<TaskType>('manual_recon');
  const [taskTitle, setTaskTitle] = useState<string>('');
  const [period, setPeriod] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`; // YYYY-MM
  });
  const [marketplace, setMarketplace] = useState<string>('flipkart');
  const [amountMin, setAmountMin] = useState<string>('');
  const [amountMax, setAmountMax] = useState<string>('');
  const [remark, setRemark] = useState<string>('');
  const [assignee, setAssignee] = useState<number | ''>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [priority, setPriority] = useState<'urgent' | 'high' | 'medium' | 'low'>('medium');
  const [instructions, setInstructions] = useState<string>('');
  const [autoClose, setAutoClose] = useState<boolean>(true);
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customDescription, setCustomDescription] = useState<string>('');
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState<string>('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState<string>('');
  const [fetchingUnreconciled, setFetchingUnreconciled] = useState<boolean>(false);
  const [unreconciledCount, setUnreconciledCount] = useState<number | null>(null);
  const [notifAnchor, setNotifAnchor] = useState<HTMLElement | null>(null);

  // Notifications persisted by Dispute page
  const [notifications, setNotifications] = useState<Array<{id:number;text:string;time:string;meta?:any}>>([]);
  const [nudgeCount, setNudgeCount] = useState<number>(0);

  React.useEffect(() => {
    try {
      const notifKey = 'recon_notifications';
      const nudgeKey = 'recon_nudge_count';
      const stored = JSON.parse(localStorage.getItem(notifKey) || '[]');
      setNotifications(Array.isArray(stored) ? stored : []);
      const count = parseInt(localStorage.getItem(nudgeKey) || '0', 10) || 0;
      setNudgeCount(count);
    } catch (_) {
      setNotifications([]);
      setNudgeCount(0);
    }
    const onNudge = () => {
      try {
        const notifKey = 'recon_notifications';
        const nudgeKey = 'recon_nudge_count';
        const stored = JSON.parse(localStorage.getItem(notifKey) || '[]');
        setNotifications(Array.isArray(stored) ? stored : []);
        const count = parseInt(localStorage.getItem(nudgeKey) || '0', 10) || 0;
        setNudgeCount(count);
      } catch (_) {
        // ignore
      }
    };
    window.addEventListener('recon_nudge_updated', onNudge as EventListener);
    return () => window.removeEventListener('recon_nudge_updated', onNudge as EventListener);
  }, []);

  const navigate = useNavigate();

  const assigneeOptions = useMemo(() => users.map(u => ({ id: u.id, name: u.name })), []);

  const resetCreateForm = () => {
    setTaskType('manual_recon');
    setTaskTitle('');
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setPeriod(`${y}-${m}`);
    setMarketplace('flipkart');
    setAmountMin('');
    setAmountMax('');
    setRemark('');
    setAssignee('');
    setDueDate('');
    setPriority('medium');
    setInstructions('');
    setAutoClose(true);
    setCustomTitle('');
    setCustomDescription('');
    setSubtasks([]);
    setNewSubtask('');
    setTags([]);
    setNewTag('');
  };

  const handleCreateTasks = () => {
    // Stub: Replace with API call POST /tasks/bulk
    console.log('Create tasks payload', {
      taskType,
      period,
      filters: { marketplace, amountMin, amountMax, remark },
      assignee,
      dueDate,
      priority,
      instructions,
      autoClose,
    });
    // Add a new pending task locally
    const newTask = {
      id: Date.now(),
      title: (taskType === 'custom' ? customTitle : taskTitle) || 'Untitled task',
      tag: marketplace?.toUpperCase?.().slice(0, 3) || 'GEN',
      due: dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No due',
      users: assignee ? [users.find((u) => u.id === assignee) || users[0]] : [users[0]],
      status: 'upcoming',
    } as any;
    upcomingTasks.push(newTask);
    setShowUpcoming(true);
    setCreateOpen(false);
    resetCreateForm();
  };

  // For demo, use same tasks for all months
  const getMonthTasks = (monthIdx: number) => ({ upcoming: upcomingTasks });
  const { upcoming: monthUpcoming } = getMonthTasks(selectedMonth);
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
      {/* Title Row and Actions */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 1 }}>
        <Typography variant="h4" sx={{ 
          fontWeight: 700, 
          color: '#1a1a1a',
          letterSpacing: '-0.01em',
          fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
          mr: 2 
        }}>
          Checklist
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton color="inherit" sx={{ mr: 1 }} onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge color="error" badgeContent={nudgeCount} overlap="circular">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value as number)}
            displayEmpty
            sx={{ 
              borderRadius: '6px',
              borderColor: '#6B7280',
              '& .MuiOutlinedInput-root': {
                height: 20, 
                color: '#6B7280',
                fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
                fontWeight: 500,
                minHeight: 36,
                fontSize: '0.7875rem',
              },
              '& .MuiSelect-select': {
                paddingY: 0.3,               // control vertical spacing of text
                paddingX: 1,                 // control horizontal padding
                minHeight: 'unset !important', // remove default min height
              },
            }}
          >
            {monthNames.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month} {new Date().getFullYear()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button 
          startIcon={<AddIcon />} 
          variant="outlined" 
          onClick={() => setCreateOpen(true)}
          sx={{
            borderRadius: '6px',
            borderColor: '#6B7280',
            color: '#6B7280',
            textTransform: 'none',
            fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            fontWeight: 500,
            minHeight: 36,
            px: 1.5,
            fontSize: '0.7875rem',
            '&:hover': {
              borderColor: '#4B5563',
              backgroundColor: 'rgba(107, 114, 128, 0.04)',
            },
          }}
        >
          Create New Task
        </Button>
      </Box>
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { p: 2, borderRadius: 2, minWidth: 600 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Notifications</Typography>
        <List dense sx={{ width: 600 }}>
          {notifications.length === 0 ? (
            <ListItem sx={{ px: 0 }}>
              <ListItemText primary="No notifications" />
            </ListItem>
          ) : (
            notifications.map((n) => (
              <ListItem
                key={n.id}
                sx={{ px: 0, cursor: 'pointer' }}
                onClick={() => { setNotifAnchor(null); navigate('/dispute'); }}
                secondaryAction={
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      sx={{ px: 1, py: 0.25, minHeight: 0, borderColor: '#111', color: '#111' }}
                      onClick={(e) => { e.stopPropagation(); /* TODO: handle approve */ }}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="outlined"
                      size="small"
                      color="inherit"
                      sx={{ px: 1, py: 0.25, minHeight: 0, borderColor: '#111', color: '#111' }}
                      onClick={(e) => { e.stopPropagation(); /* TODO: handle reject */ }}
                    >
                      Reject
                    </Button>
                  </Box>
                }
              >
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
                </ListItemIcon>
                <ListItemText primary={n.text} secondary={new Date(n.time).toLocaleString()} sx={{ pr: 10 }} />
              </ListItem>
            ))
          )}
        </List>
      </Popover>
      <Grid container spacing={3}>
        {/* Left side - Pending Tasks (reduced width) */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            {/* Upcoming Group */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#fafbfc', cursor: 'pointer' }} onClick={() => setShowUpcoming((v) => !v)}>
                <IconButton size="small">
                  {showUpcoming ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Typography sx={{ fontWeight: 600 }}>Pending {filteredUpcoming.length}</Typography>
              </Box>
              <Collapse in={showUpcoming}>
                <List disablePadding>
                  {filteredUpcoming.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        sx={{ pl: 8, pr: 2, py: 1, borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); setExpandedTask(expandedTask === task.id ? null : task.id); }}>
                            {expandedTask === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        }
                      >
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
          </Paper>

          {/* Completed Tasks Group */}
          <Paper sx={{ p: 0, overflow: 'hidden' }}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1, bgcolor: '#f0fdf4', cursor: 'pointer' }} onClick={() => setShowCompleted((v) => !v)}>
                <IconButton size="small">
                  {showCompleted ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </IconButton>
                <Typography sx={{ fontWeight: 600, color: '#15803d' }}>Completed {completedTasks.length}</Typography>
              </Box>
              <Collapse in={showCompleted}>
                <List disablePadding>
                  {completedTasks.map((task) => (
                    <React.Fragment key={task.id}>
                      <ListItem
                        sx={{ pl: 8, pr: 2, py: 1, borderBottom: '1px solid #f0f0f0', cursor: 'pointer' }}
                        onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={(e) => { e.stopPropagation(); setExpandedTask(expandedTask === task.id ? null : task.id); }}>
                            {expandedTask === task.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                          </IconButton>
                        }
                      >
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <CheckCircleIcon sx={{ color: '#10b981' }} />
                        </ListItemIcon>
                        <ListItemText primary={task.title} />
                        <Chip label={task.tag} size="small" sx={{ mr: 1, bgcolor: '#f0fdf4', color: '#15803d', fontWeight: 500 }} />
                        <Chip icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} label={task.completedDate} size="small" sx={{ mr: 1, bgcolor: '#f0fdf4', color: '#15803d' }} />
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
                              <Chip label="Completed" color="success" size="small" />
                              <Button variant="outlined" color="secondary" onClick={() => handleAskAI(task)}>
                                AskAI
                              </Button>
                            </Box>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Chip label="Completed on time" color="success" size="small" sx={{ fontWeight: 600, bgcolor: '#f0fdf4', color: '#15803d' }} />
                            <Chip icon={<CalendarTodayIcon sx={{ fontSize: 16 }} />} label={task.completedDate} size="small" sx={{ mr: 1, bgcolor: '#f0fdf4', color: '#15803d' }} />
                          </Box>
                          <Divider sx={{ mb: 2 }} />
                          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>Completion Summary</Typography>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              Task was completed successfully within the allocated timeframe. All required documentation and approvals have been obtained.
                            </Typography>
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
                                        {new Date(comment.timestamp).toLocaleString() }
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
          </Paper>
        </Grid>

        {/* Right side - Task Tracker and Recent Activities */}
        <Grid item xs={12} md={5}>
          {/* Task Tracker Donut Graph */}
          <Paper sx={{ 
            p: 3, 
            mb: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
            borderRadius: '16px',
            border: '1px solid #f1f3f4',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-2px)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a',
              mb: 2,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}>
              Progress
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', width: 140, height: 140 }}>
                <CircularProgress
                  variant="determinate"
                  value={50}
                  size={140}
                  thickness={2}
                  sx={{
                    color: '#3b82f6',
                    position: 'absolute',
                    left: 0,
                    '& .MuiCircularProgress-circle': {
                      strokeLinecap: 'round',
                    },
                  }}
                />
                <Box sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center',
                }}>
                  <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                    1/4
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#6b7280', display: 'block' }}>
                    tasks
                  </Typography>
                </Box>
              </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#3b82f6' }}>
                  1
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Pending
                </Typography>
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#10b981' }}>
                  3
                </Typography>
                <Typography variant="caption" sx={{ color: '#6b7280' }}>
                  Completed
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Recent Activities */}
          <Paper sx={{ 
            p: 3,
            background: 'linear-gradient(135deg, #ffffff 0%, #fafbfc 100%)',
            borderRadius: '16px',
            border: '1px solid #f1f3f4',
            boxShadow: '0 2px 20px rgba(0, 0, 0, 0.04)',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.08)',
              transform: 'translateY(-2px)',
            }
          }}>
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              color: '#1a1a1a',
              mb: 2,
              fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
            }}>
              Recent Activities
            </Typography>
            <Stack spacing={2}>
              {[
                { text: 'fetch April sales data from flipkart', time: '4 hours ago', icon: <TableIcon sx={{ color: '#8b5cf6', fontSize: 20 }} /> },
                { text: 'fetch march sales data from flipkart ', time: '6 hours ago', icon: <TableIcon sx={{ color: '#8b5cf6', fontSize: 20 }} />},
                { text: 'fetch April sales data from flipkart ', time: '1 day ago', icon: <TableIcon sx={{ color: '#8b5cf6', fontSize: 20 }} /> },
                { text: 'fetch march sales data from flipkart ', time: '2 days ago', icon: <TableIcon sx={{ color: '#8b5cf6', fontSize: 20 }} /> },
              ].map((activity, idx) => (
                <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                  <Box sx={{ mt: 0.5 }}>
                    {activity.icon}
                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.4 }}>
                      {activity.text}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6b7280' }}>
                      {activity.time}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
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

      {/* Create Task Modal */}
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 1 } }}>
        <DialogTitle sx={{ py: 2, px: 3, position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', borderBottom: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mr: 1, whiteSpace: 'nowrap' }}>Create New Task </Typography>
              <Input
                placeholder="Add title"
                value={taskType === 'custom' ? customTitle : taskTitle}
                onChange={(e) => taskType === 'custom' ? setCustomTitle(e.target.value) : setTaskTitle(e.target.value)}
                sx={{ flex: 1 }}
                disableUnderline
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button onClick={() => setCreateOpen(false)} color="inherit">Cancel</Button>
              <Button
                variant="contained"
                onClick={handleCreateTasks}
                disabled={(taskType === 'manual_recon' && (!assignee || !dueDate))}
              >
                Save
              </Button>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ pt: 0 }}>
          {/* Two-column layout inspired by reference */}
          <Grid container spacing={8}>
            <Grid item xs={12} md={7}>
              {/* Task type selector moved into left column to allow sidebar to sit at top */}
              <Box sx={{ mb: 2, mt: 1 }}>
                <FormControl  size="small" variant="standard" sx={{ p: 1 }}>
                  <Select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} displayEmpty disableUnderline>
                    <MenuItem value={'manual_recon'}> Manual Reconciliation</MenuItem>
                    <MenuItem value={'exception_review'}>Exception Review</MenuItem>
                    <MenuItem value={'journal_entry'}>Journal Entry</MenuItem>
                    <MenuItem value={'custom'}>Custom</MenuItem>
                  </Select>
                </FormControl>
              </Box>

                <TextField placeholder="Details"value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} fullWidth multiline minRows={4}  variant="standard"   InputProps={{
    disableUnderline: true,   // ✅ removes the underline
  }} sx={{ mb: 2, p: 1, '& .MuiInputBase-input': {
      padding: '2px',   // inner padding for textarea
    }, }} />

          
                <Box sx={{ mb: 2, p: 1 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                    <TextField type="month"  InputProps={{
    disableUnderline: true,   // ✅ removes the underline
  }} value={period} onChange={(e) => { setPeriod(e.target.value); setFetchingUnreconciled(true); setUnreconciledCount(null); setTimeout(() => { setFetchingUnreconciled(false); setUnreconciledCount(1000); }, 1200); }} variant="standard" InputLabelProps={{ shrink: true }} />
                    <FormControl fullWidth variant="standard">
                      <Select value={marketplace} onChange={(e) => setMarketplace(e.target.value)} displayEmpty disableUnderline>
                        <MenuItem value="flipkart">Flipkart</MenuItem>
                        <MenuItem value="amazon">Amazon</MenuItem>
                        <MenuItem value="website">Website</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  {fetchingUnreconciled && (
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1 }}>
                      <CircularProgress size={14} />
                      <Typography variant="caption" color="text.secondary">Fetching orders...</Typography>
                    </Stack>
                  )}
                  {unreconciledCount !== null && (
                    <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>Total {unreconciledCount.toLocaleString()} unreconciled orders found</Typography>
                      <ButtonBase onClick={() => navigate('/marketplace-reconciliation?openTs=1&tab=unreconciled')} sx={{ borderRadius: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ p: 1, pr: 1.25, bgcolor: '#F3F4F6', borderRadius: 1, '&:hover': { bgcolor: '#E5E7EB' } }}>
                          <Box sx={{ width: 28, height: 20, borderRadius: 0.5, bgcolor: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb' }}>
                            <TableIcon sx={{ fontSize: 14, color: '#6b7280' }} />
                          </Box>
                          <Typography variant="body2" sx={{ color: '#111827', fontWeight: 600 }}>Open in Transaction Sheet</Typography>
                          <OpenInNewIcon sx={{ fontSize: 16, color: '#6b7280' }} />
                        </Stack>
                      </ButtonBase>
                    </Stack>
                  )}
                </Box>


              {/* Comment input */}
              <TextField placeholder="Add a comment" fullWidth multiline minRows={2} sx={{ p: 1 }} variant='standard' InputProps={{
    disableUnderline: true,   // ✅ removes the underline
  }} />
              <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={autoClose} onChange={(e) => setAutoClose(e.target.checked)} />} label="Auto-close task on resolution" />
            
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ p: 4, borderRadius: 1, position: 'sticky', bgcolor: '#F9FAFB' }}>
                {/* Created by */}
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Avatar src={users[0].avatar} sx={{ width: 32, height:32 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created by</Typography>
                    <Typography variant="body2">{users[0].name}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

                {/* Assignee */}
                <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>Assignee</Typography>
                <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }} variant="standard">
                  <Select value={assignee} onChange={(e) => setAssignee(e.target.value as number | '')} displayEmpty disableUnderline>
                    <MenuItem value=""><em>Select assignee</em></MenuItem>
                    {assigneeOptions.map(a => (
                      <MenuItem key={a.id} value={a.id}>{a.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

                {/* Due date */}
                <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>Due Date</Typography>
                <TextField
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  fullWidth
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    disableUnderline: true, 
                    startAdornment: (
                      <InputAdornment position="start">
                        <CalendarTodayIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mt: 0.5, mb: 2 }}
                />
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

                {/* Priority */}
                <Typography variant="caption" color="text.secondary" sx={{ p: 2 }}>Set Priority</Typography>
                <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }} variant="standard">
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as any)} displayEmpty disableUnderline>
                    <MenuItem value={'urgent'}><FlagIcon sx={{ mr: 1, color: '#ef4444' }} />Urgent</MenuItem>
                    <MenuItem value={'high'}><FlagIcon sx={{ mr: 1, color: '#f59e0b' }} />High</MenuItem>
                    <MenuItem value={'medium'}><FlagIcon sx={{ mr: 1, color: '#3b82f6' }} />Medium</MenuItem>
                    <MenuItem value={'low'}><FlagIcon sx={{ mr: 1, color: '#10b981' }} />Low</MenuItem>
                  </Select>
                </FormControl>
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
      </Dialog>
    </Box>
  );
};

export default Checklist; 
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
  const [showUpcoming, setShowUpcoming] = useState(true);
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
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main', mr: 2 }}>
          Checklist
        </Typography>
        <Box sx={{ flex: 1 }} />
        <IconButton color="inherit" sx={{ mr: 1 }} onClick={(e) => setNotifAnchor(e.currentTarget)}>
          <Badge color="error" badgeContent={5} overlap="circular">
            <NotificationsNoneIcon />
          </Badge>
        </IconButton>
        <FormControl size="small" sx={{ mr: 2, minWidth: 120 }}>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value as number)}
            displayEmpty
            sx={{ borderRadius: 2}}
          >
            {monthNames.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month} {new Date().getFullYear()}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button startIcon={<AddIcon />} variant="contained" sx={{ borderRadius: 2 }} onClick={() => setCreateOpen(true)}>
          Create New Task
        </Button>
      </Box>
      <Popover
        open={Boolean(notifAnchor)}
        anchorEl={notifAnchor}
        onClose={() => setNotifAnchor(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        sx={{ '& .MuiPaper-root': { p: 2, borderRadius: 2 } }}
      >
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 700 }}>Notifications</Typography>
        <List dense sx={{ width: 320 }}>
          {[
            'Fetched Flipkart March sales data',
            'Fetched Flipkart April sales data',
            'Fetched Flipkart March settlement data',
            'Fetched Flipkart April sales data',
            'Reconciliation for March orders done',
            'Found 1000 unreconciled orders',
          ].map((text, idx) => (
            <ListItem key={idx} sx={{ px: 0 }}>
              <ListItemIcon sx={{ minWidth: 28 }}>
                <RadioButtonUncheckedIcon fontSize="small" color="disabled" />
              </ListItemIcon>
              <ListItemText primary={text} />
            </ListItem>
          ))}
        </List>
      </Popover>
      <Paper sx={{ p: 0, overflow: 'hidden' }}>
        {/* Overdue group removed */}
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
      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, boxShadow: '0 12px 40px rgba(16,24,40,0.12)' } }}>
        <DialogTitle sx={{ py: 2, px: 3, position: 'sticky', top: 0, zIndex: 2, bgcolor: 'background.paper', borderBottom: '1px solid #eee' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mr: 1, whiteSpace: 'nowrap' }}>Create New Task</Typography>
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
          <Grid container spacing={2}>
            <Grid item xs={12} md={7}>
              {/* Task type selector moved into left column to allow sidebar to sit at top */}
              <Box sx={{ mb: 2, mt: 1 }}>
                <FormControl  size="small" variant="standard">
                  <Select value={taskType} onChange={(e) => setTaskType(e.target.value as TaskType)} displayEmpty disableUnderline>
                    <MenuItem value={'manual_recon'}>Assign Manual Reconciliation</MenuItem>
                    <MenuItem value={'exception_review'}>Exception Review</MenuItem>
                    <MenuItem value={'data_validation'}>Data Validation</MenuItem>
                    <MenuItem value={'custom'}>Custom</MenuItem>
                  </Select>
                </FormControl>
              </Box>

                <TextField label="Description" value={customDescription} onChange={(e) => setCustomDescription(e.target.value)} fullWidth multiline minRows={4} sx={{ mb: 2 }} />

              {taskType === 'manual_recon' && (
                <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2, mt: 1 }}>
                    <TextField type="month" value={period} onChange={(e) => { setPeriod(e.target.value); setFetchingUnreconciled(true); setUnreconciledCount(null); setTimeout(() => { setFetchingUnreconciled(false); setUnreconciledCount(1000); }, 1200); }} variant="standard" InputLabelProps={{ shrink: true }} />
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
              )}

              {/* Comment input */}
              <TextField placeholder="Add a comment" fullWidth multiline minRows={2} />
              <FormControlLabel sx={{ mt: 1 }} control={<Switch checked={autoClose} onChange={(e) => setAutoClose(e.target.checked)} />} label="Auto-close task on resolution" />
            
            </Grid>

            <Grid item xs={12} md={5}>
              <Box sx={{ p: 1.5, borderRadius: 0, position: 'sticky', top: 0, bgcolor: '#F9FAFB' }}>
                {/* Created by */}
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Avatar src={users[0].avatar} sx={{ width: 28, height: 28 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Created by</Typography>
                    <Typography variant="body2">{users[0].name}</Typography>
                  </Box>
                </Stack>
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

                {/* Assignee */}
                <Typography variant="caption" color="text.secondary">Assignee</Typography>
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
                <Typography variant="caption" color="text.secondary">Due Date</Typography>
                <TextField
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  fullWidth
                  variant="standard"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
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
                <Typography variant="caption" color="text.secondary">Set Priority</Typography>
                <FormControl fullWidth sx={{ mt: 0.5, mb: 2 }} variant="standard">
                  <Select value={priority} onChange={(e) => setPriority(e.target.value as any)} displayEmpty disableUnderline>
                    <MenuItem value={'urgent'}><FlagIcon sx={{ mr: 1, color: '#ef4444' }} />Urgent</MenuItem>
                    <MenuItem value={'high'}><FlagIcon sx={{ mr: 1, color: '#f59e0b' }} />High</MenuItem>
                    <MenuItem value={'medium'}><FlagIcon sx={{ mr: 1, color: '#3b82f6' }} />Medium</MenuItem>
                    <MenuItem value={'low'}><FlagIcon sx={{ mr: 1, color: '#10b981' }} />Low</MenuItem>
                  </Select>
                </FormControl>
                <Divider sx={{ my: 2, borderColor: '#eee' }} />

                {/* Tags */}
                <Typography variant="caption" color="text.secondary">Tags</Typography>
                <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, my: 1 }}>
                  {tags.map((t, i) => (
                    <Chip key={i} label={t} onDelete={() => setTags(tags.filter((_, idx) => idx !== i))} size="small" />
                  ))}
                </Stack>
                <TextField
                  size="small"
                  placeholder="Add tag and press Enter"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (newTag.trim()) { setTags([...tags, newTag.trim()]); setNewTag(''); } } }}
                  fullWidth
                  variant="standard"
                  sx={{ mb: 2 }}
                />
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        
      </Dialog>
    </Box>
  );
};

export default Checklist; 
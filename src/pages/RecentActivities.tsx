import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Stack,
  Divider,
  Chip,
  Button,
} from '@mui/material';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

// Mock users
const users = [
  { id: 1, name: 'Claudia Smith', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
  { id: 2, name: 'Brandie C.', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
  { id: 3, name: 'Stacks', avatar: null },
  { id: 4, name: 'Rajiv Menon', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { id: 5, name: 'Priya Patel', avatar: 'https://randomuser.me/api/portraits/women/12.jpg' },
];

// Mock activities
const activitiesData = [
  {
    id: 1,
    user: users[0],
    action: 'Reviewed a task',
    timestamp: '2025-01-05T09:01:00Z',
    comment: 'Thanks for that - approved!',
    type: 'review',
  },
  {
    id: 2,
    user: users[1],
    action: 'Submitted a task',
    timestamp: '2025-01-04T14:22:00Z',
    comment: 'Found a transaction that did not belong here. Already moved it to the right account and updated the file.',
    attachment: {
      name: '1020 Accounts Receivable_January2025.xsl',
      size: '125 Mb',
      type: 'xls',
    },
    type: 'submission',
  },
  {
    id: 3,
    user: users[2],
    action: 'Reopened a task',
    timestamp: '2025-01-03T17:45:00Z',
    type: 'reopen',
  },
  {
    id: 4,
    user: users[3],
    action: 'Logged in',
    timestamp: '2025-01-05T08:00:00Z',
    type: 'login',
  },
  {
    id: 5,
    user: users[4],
    action: 'Logged out',
    timestamp: '2025-01-05T18:30:00Z',
    type: 'logout',
  },
  {
    id: 6,
    user: users[0],
    action: 'Added a comment',
    timestamp: '2025-01-05T10:10:00Z',
    comment: 'Please review the attached file.',
    type: 'comment',
  },
  {
    id: 7,
    user: users[1],
    action: 'Uploaded a file',
    timestamp: '2025-01-05T10:12:00Z',
    attachment: {
      name: 'BankStatement_Jan2025.pdf',
      size: '2.1 Mb',
      type: 'pdf',
    },
    type: 'upload',
  },
  {
    id: 8,
    user: users[3],
    action: 'Completed checklist',
    timestamp: '2025-01-04T16:00:00Z',
    comment: 'All items for January are done.',
    type: 'checklist-complete',
  },
  {
    id: 9,
    user: users[4],
    action: 'Generated AI answer',
    timestamp: '2025-01-05T11:30:00Z',
    comment: 'AI suggested 3 steps to complete the task.',
    type: 'ai',
  },
  {
    id: 10,
    user: users[2],
    action: 'Approved transaction',
    timestamp: '2025-01-05T12:00:00Z',
    type: 'approve',
  },
];

const activityTypes = [
  { value: '', label: 'All Types' },
  { value: 'review', label: 'Review' },
  { value: 'submission', label: 'Submission' },
  { value: 'reopen', label: 'Reopen' },
  { value: 'login', label: 'Login' },
  { value: 'logout', label: 'Logout' },
  { value: 'comment', label: 'Comment' },
  { value: 'upload', label: 'Upload' },
  { value: 'checklist-complete', label: 'Checklist Complete' },
  { value: 'ai', label: 'AI Answer' },
  { value: 'approve', label: 'Approve' },
];

const RecentActivities: React.FC = () => {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');

  // Filtered and searched activities
  const filteredActivities = activitiesData.filter((activity) => {
    const matchesType = !typeFilter || activity.type === typeFilter;
    const matchesUser = !userFilter || activity.user.id.toString() === userFilter;
    const matchesSearch =
      !search ||
      activity.action.toLowerCase().includes(search.toLowerCase()) ||
      (activity.comment && activity.comment.toLowerCase().includes(search.toLowerCase())) ||
      (activity.attachment && activity.attachment.name.toLowerCase().includes(search.toLowerCase()));
    return matchesType && matchesUser && matchesSearch;
  });

  // Helper to format date and time
  const formatDateTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 } }}>
      <Typography variant="h4" gutterBottom>
        Recent Activities
      </Typography>
      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: 1, minWidth: 220 }}>
          <input
            type="text"
            placeholder="Search activities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              fontSize: 16,
              outline: 'none',
              background: '#fff',
            }}
          />
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              fontSize: 16,
              outline: 'none',
              background: '#fff',
            }}
          >
            {activityTypes.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #e0e0e0',
              fontSize: 16,
              outline: 'none',
              background: '#fff',
            }}
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </Box>
      </Box>
      <Box sx={{ mt: 2 }}>
        {filteredActivities.length === 0 && (
          <Typography variant="body1" sx={{ color: 'text.secondary', textAlign: 'center', mt: 6 }}>
            No activities found.
          </Typography>
        )}
        {filteredActivities.map((activity, idx) => (
          <Box key={activity.id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 4, position: 'relative' }}>
            {/* Timeline dot/line */}
            <Box sx={{ width: 32, display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 1 }}>
              <Box sx={{ width: 12, height: 12, bgcolor: '#d1d5db', borderRadius: '50%', mb: 0.5 }} />
              {idx < filteredActivities.length - 1 && (
                <Box sx={{ width: 2, flex: 1, bgcolor: '#e0e0e0', minHeight: 32 }} />
              )}
            </Box>
            {/* Activity card */}
            <Paper sx={{ flex: 1, p: 2.5, ml: 1, background: '#fafbfc', boxShadow: 'none', border: '1px solid #f0f1f3' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar src={activity.user.avatar || undefined} sx={{ width: 36, height: 36, mr: 1.5, bgcolor: activity.user.avatar ? undefined : '#222' }}>
                  {!activity.user.avatar && activity.user.name[0]}
                </Avatar>
                <Typography variant="subtitle1" sx={{ fontWeight: 600, mr: 1 }}>
                  {activity.user.name}
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', fontWeight: 500, mr: 1 }}>
                  {activity.action}
                </Typography>
                <Box sx={{ flex: 1 }} />
                <Typography variant="body2" sx={{ color: 'text.secondary', minWidth: 150, textAlign: 'right' }}>
                  {formatDateTime(activity.timestamp)}
                </Typography>
              </Box>
              {/* Activity content */}
              {activity.comment && (
                <Paper sx={{ p: 2, background: '#fff', mb: activity.attachment ? 2 : 0, borderRadius: 2, boxShadow: 'none', border: '1px solid #f0f1f3' }}>
                  <Typography variant="body1" sx={{ color: 'text.primary' }}>{activity.comment}</Typography>
                </Paper>
              )}
              {activity.attachment && (
                <Paper sx={{ p: 2, background: '#f5f5f7', borderRadius: 2, boxShadow: 'none', border: '1px solid #e0e0e0', display: 'flex', alignItems: 'center', mt: 0 }}>
                  <InsertDriveFileIcon sx={{ color: '#43a047', fontSize: 32, mr: 2 }} />
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{activity.attachment.name}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{activity.attachment.size}</Typography>
                  </Box>
                  <Box sx={{ flex: 1 }} />
                  <Button size="small" variant="text">...</Button>
                </Paper>
              )}
            </Paper>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default RecentActivities; 
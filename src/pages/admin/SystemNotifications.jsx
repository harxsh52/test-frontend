import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, Checkbox, FormControlLabel, Grid, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { notificationService } from '../../services/notificationService';
import { formatDate, formatTime } from '../../utils/dateUtils';
import { ROLES } from '../../utils/roles';

const notificationTypes = ['SYSTEM', 'SECURITY', 'TASK', 'ATTENDANCE', 'LEAVE', 'FEEDBACK', 'REPORT', 'INTERVIEW', 'RESUME_SCREENING', 'USER_MANAGEMENT', 'DEPARTMENT'];
const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

const SystemNotifications = () => {
  const [form, setForm] = useState({
    title: '',
    message: '',
    roles: [ROLES.INTERN],
    userIds: '',
    type: 'SYSTEM',
    priority: 'MEDIUM',
    actionUrl: '/notifications'
  });
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      setNotifications(await notificationService.getAllNotificationsAdmin());
    } catch (notificationError) {
      setError(notificationError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const toggleRole = (role) => {
    setForm((current) => ({
      ...current,
      roles: current.roles.includes(role) ? current.roles.filter((item) => item !== role) : [...current.roles, role]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSending(true);
    try {
      const userIds = form.userIds
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean)
        .map(Number);

      await notificationService.createSystemNotification({
        title: form.title,
        message: form.message,
        roles: form.roles,
        userIds,
        type: form.type,
        priority: form.priority,
        actionUrl: form.actionUrl
      });

      setSnackbar({ open: true, message: 'System notification sent successfully.', severity: 'success' });
      setForm((current) => ({ ...current, title: '', message: '', userIds: '' }));
      loadNotifications();
    } catch (sendError) {
      setSnackbar({ open: true, message: sendError.message, severity: 'error' });
    } finally {
      setSending(false);
    }
  };

  const columns = [
    { field: 'title', headerName: 'Title', sx: { minWidth: 180 } },
    { field: 'recipientName', headerName: 'Recipient' },
    { field: 'type', headerName: 'Type', render: (row) => <StatusChip status={row.type} variant="outlined" /> },
    { field: 'priority', headerName: 'Priority', render: (row) => <StatusChip status={row.priority} variant="outlined" /> },
    { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { field: 'message', headerName: 'Message', sx: { minWidth: 260 } },
    { field: 'createdAt', headerName: 'Created', render: (row) => row.createdAt ? `${formatDate(row.createdAt)} ${formatTime(row.createdAt)}` : '-' }
  ];

  return (
    <Box>
      <PageHeader title="System Notifications" subtitle="Send role-based or user-specific in-app notifications and monitor delivery." />
      <ErrorMessage message={error} />
      <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField label="Title" value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} required fullWidth />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select label="Type" value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))} fullWidth>
              {notificationTypes.map((type) => <MenuItem key={type} value={type}>{type.replaceAll('_', ' ')}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField select label="Priority" value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value }))} fullWidth>
              {priorities.map((priority) => <MenuItem key={priority} value={priority}>{priority}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <TextField label="Message" value={form.message} onChange={(event) => setForm((current) => ({ ...current, message: event.target.value }))} required multiline minRows={3} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Action URL" value={form.actionUrl} onChange={(event) => setForm((current) => ({ ...current, actionUrl: event.target.value }))} fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField label="Specific user IDs" helperText="Optional comma-separated user IDs." value={form.userIds} onChange={(event) => setForm((current) => ({ ...current, userIds: event.target.value }))} fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Target roles</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              {Object.values(ROLES).map((role) => (
                <FormControlLabel key={role} control={<Checkbox checked={form.roles.includes(role)} onChange={() => toggleRole(role)} />} label={role} />
              ))}
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Button type="submit" variant="contained" startIcon={<SendIcon />} disabled={sending || !form.title.trim() || !form.message.trim()}>
              {sending ? 'Sending...' : 'Send Notification'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <DataTable columns={columns} rows={notifications} loading={loading} searchPlaceholder="Search system notifications" />

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SystemNotifications;

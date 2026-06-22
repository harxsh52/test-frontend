import DoneAllIcon from '@mui/icons-material/DoneAll';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Alert,
  Box,
  Button,
  List,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import NotificationItem from '../../components/notifications/NotificationItem';
import { notificationService } from '../../services/notificationService';

const statusFilters = ['', 'UNREAD', 'READ', 'ARCHIVED'];
const typeFilters = ['', 'ATTENDANCE', 'LEAVE', 'TASK', 'FEEDBACK', 'REPORT', 'INTERVIEW', 'RESUME_SCREENING', 'USER_MANAGEMENT', 'DEPARTMENT', 'SYSTEM', 'SECURITY'];

const formatLabel = (value) => (value ? value.replaceAll('_', ' ') : 'All');

const Notifications = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ status: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      setNotifications(await notificationService.getMyNotifications());
    } catch (notificationError) {
      setError(notificationError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const filteredNotifications = useMemo(
    () => notifications.filter((notification) =>
      (!filters.status || notification.status === filters.status)
      && (!filters.type || notification.type === filters.type)
    ),
    [filters, notifications]
  );

  const handleOpenNotification = async (notification) => {
    if (notification.status === 'UNREAD') {
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkRead = async (notification) => {
    setActionLoading(true);
    try {
      await notificationService.markAsRead(notification.id);
      await loadNotifications();
      setSnackbar({ open: true, message: 'Notification marked as read.', severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleArchive = async (notification) => {
    setActionLoading(true);
    try {
      await notificationService.archiveNotification(notification.id);
      await loadNotifications();
      setSnackbar({ open: true, message: 'Notification archived.', severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    setActionLoading(true);
    try {
      await notificationService.markAllAsRead();
      await loadNotifications();
      setSnackbar({ open: true, message: 'All notifications marked as read.', severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle="Review in-app updates across tasks, attendance, feedback, interviews, reports, and system events."
        actions={(
          <>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={loadNotifications}>
              Refresh
            </Button>
            <Button variant="contained" startIcon={<DoneAllIcon />} onClick={handleMarkAllRead} disabled={actionLoading}>
              Mark All Read
            </Button>
          </>
        )}
      />
      <ErrorMessage message={error} />

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <TextField
            select
            label="Status"
            value={filters.status}
            onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            sx={{ minWidth: 180 }}
          >
            {statusFilters.map((status) => (
              <MenuItem key={status || 'all'} value={status}>{formatLabel(status)}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Type"
            value={filters.type}
            onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
            sx={{ minWidth: 240 }}
          >
            {typeFilters.map((type) => (
              <MenuItem key={type || 'all'} value={type}>{formatLabel(type)}</MenuItem>
            ))}
          </TextField>
        </Stack>
      </Paper>

      {loading ? (
        <Loader />
      ) : filteredNotifications.length ? (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <List disablePadding>
            {filteredNotifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onOpen={handleOpenNotification}
                onMarkRead={handleMarkRead}
                onArchive={handleArchive}
              />
            ))}
          </List>
        </Paper>
      ) : (
        <EmptyState title="No notifications" message="Notifications matching your filters will appear here." />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Notifications;

import RefreshIcon from '@mui/icons-material/Refresh';
import ReplayIcon from '@mui/icons-material/Replay';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/dateUtils';
import { ROLES } from '../../utils/roles';

const notificationTypes = [
  '',
  'OFFER_LETTER_SENT',
  'INTERVIEW_SCHEDULED',
  'CANDIDATE_SELECTED',
  'CANDIDATE_REJECTED',
  'CANDIDATE_SHORTLISTED',
  'RESUME_SCREENING_COMPLETED',
  'DEPARTMENT_ASSIGNED',
  'MANAGER_ASSIGNED',
  'INTERN_ONBOARDED'
];

const statuses = ['', 'PENDING', 'SENT', 'FAILED', 'MOCKED'];

const statusColors = {
  SENT: 'success',
  MOCKED: 'info',
  FAILED: 'error',
  PENDING: 'warning'
};

const formatLabel = (value) => value ? value.replaceAll('_', ' ') : 'All';

const HRNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [filters, setFilters] = useState({ type: '', status: '', search: '' });
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadNotifications = async (nextFilters = filters) => {
    setLoading(true);
    try {
      const records = user.role === ROLES.ADMIN
        ? await notificationService.getAdminNotifications(nextFilters)
        : await notificationService.getHrNotifications(nextFilters);
      setNotifications(records);
      setError('');
    } catch (notificationError) {
      setError(notificationError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role]);

  const handleFilterChange = (event) => {
    const nextFilters = { ...filters, [event.target.name]: event.target.value };
    setFilters(nextFilters);
  };

  const handleApplyFilters = () => {
    loadNotifications(filters);
  };

  const handleClearFilters = () => {
    const nextFilters = { type: '', status: '', search: '' };
    setFilters(nextFilters);
    loadNotifications(nextFilters);
  };

  const handleResend = async (notification) => {
    setActionLoading(notification.id);
    try {
      await notificationService.resendNotification(notification.id, user.role === ROLES.ADMIN);
      setSnackbar({ open: true, message: 'Email resend processed successfully.', severity: 'success' });
      await loadNotifications(filters);
    } catch (resendError) {
      setSnackbar({ open: true, message: resendError.message, severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const columns = useMemo(() => [
    { field: 'recipientName', headerName: 'Recipient Name', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.recipientName}</Typography> },
    { field: 'recipientEmail', headerName: 'Recipient Email' },
    { field: 'notificationType', headerName: 'Type', valueGetter: (row) => formatLabel(row.notificationType) },
    { field: 'subject', headerName: 'Subject' },
    {
      field: 'status',
      headerName: 'Status',
      render: (row) => <Chip size="small" label={row.status} color={statusColors[row.status] || 'default'} />
    },
    { field: 'sentAt', headerName: 'Sent At', valueGetter: (row) => formatDate(row.sentAt || row.createdAt) },
    {
      field: 'actions',
      headerName: 'Actions',
      align: 'right',
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button size="small" startIcon={<VisibilityIcon />} onClick={() => setSelectedNotification(row)}>
            View
          </Button>
          <Button
            size="small"
            variant={row.status === 'FAILED' ? 'contained' : 'outlined'}
            startIcon={<ReplayIcon />}
            onClick={() => handleResend(row)}
            disabled={actionLoading === row.id}
          >
            Resend
          </Button>
        </Stack>
      )
    }
  ], [actionLoading]);

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <PageHeader title="HR Email Notifications" subtitle="Track every HR email attempt, including mocked messages when SMTP is disabled." />
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => loadNotifications(filters)}>
          Refresh
        </Button>
      </Stack>

      <ErrorMessage message={error} />

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select name="type" label="Notification Type" value={filters.type} onChange={handleFilterChange} sx={{ minWidth: 240 }}>
            {notificationTypes.map((type) => <MenuItem key={type || 'all'} value={type}>{formatLabel(type)}</MenuItem>)}
          </TextField>
          <TextField select name="status" label="Status" value={filters.status} onChange={handleFilterChange} sx={{ minWidth: 160 }}>
            {statuses.map((status) => <MenuItem key={status || 'all'} value={status}>{formatLabel(status)}</MenuItem>)}
          </TextField>
          <TextField name="search" label="Search recipient/email/subject" value={filters.search} onChange={handleFilterChange} fullWidth />
          <Button variant="contained" onClick={handleApplyFilters}>Apply</Button>
          <Button variant="outlined" onClick={handleClearFilters}>Clear</Button>
        </Stack>
      </Paper>

      {loading ? (
        <Loader />
      ) : (
        <DataTable rows={notifications} columns={columns} emptyMessage="No email notifications found." />
      )}

      <Dialog open={Boolean(selectedNotification)} onClose={() => setSelectedNotification(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 850 }}>{selectedNotification?.subject}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Typography color="text.secondary">
              To: {selectedNotification?.recipientName} ({selectedNotification?.recipientEmail})
            </Typography>
            <Chip
              label={`${formatLabel(selectedNotification?.notificationType)} - ${selectedNotification?.status || '-'}`}
              color={statusColors[selectedNotification?.status] || 'default'}
              sx={{ alignSelf: 'flex-start' }}
            />
            {selectedNotification?.errorMessage ? <Alert severity="error">{selectedNotification.errorMessage}</Alert> : null}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2, whiteSpace: 'pre-wrap' }}>
              {selectedNotification?.body}
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSelectedNotification(null)}>Close</Button>
          {selectedNotification ? (
            <Button variant="contained" startIcon={<ReplayIcon />} onClick={() => handleResend(selectedNotification)} disabled={actionLoading === selectedNotification.id}>
              Resend
            </Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default HRNotifications;

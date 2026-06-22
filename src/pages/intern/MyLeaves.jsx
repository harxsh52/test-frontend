import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Box, Button, Grid, IconButton, Snackbar, Stack, Tooltip, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { leaveService } from '../../services/leaveService';
import { formatDate } from '../../utils/dateUtils';

const MyLeaves = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      const [leaveRecords, leaveBalance] = await Promise.all([
        leaveService.getMyLeaves(),
        leaveService.getMyLeaveBalance()
      ]);
      setLeaves(leaveRecords);
      setBalance(leaveBalance);
    } catch (leaveError) {
      setError(leaveError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const handleCancel = async (leaveId) => {
    try {
      const cancelledLeave = await leaveService.cancelLeave(leaveId);
      setLeaves((current) => current.map((leave) => (leave.id === cancelledLeave.id ? cancelledLeave : leave)));
      setSnackbar({ open: true, message: 'Leave request cancelled successfully.', severity: 'success' });
      loadLeaves();
    } catch (cancelError) {
      setSnackbar({ open: true, message: cancelError.message, severity: 'error' });
    }
  };

  const columns = [
    { field: 'leaveType', headerName: 'Type', render: (row) => <StatusChip status={row.leaveType} variant="outlined" /> },
    { field: 'startDate', headerName: 'Start', render: (row) => formatDate(row.startDate) },
    { field: 'endDate', headerName: 'End', render: (row) => formatDate(row.endDate) },
    { field: 'totalDays', headerName: 'Days' },
    { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { field: 'reason', headerName: 'Reason', sx: { minWidth: 220 } },
    { field: 'managerComment', headerName: 'Manager comment', sx: { minWidth: 220 } },
    { field: 'createdAt', headerName: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={1}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`/intern/leaves/${row.id}`)}>
              <VisibilityIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {row.status === 'PENDING' ? (
            <Button color="error" size="small" onClick={() => handleCancel(row.id)}>
              Cancel
            </Button>
          ) : null}
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title="Leaves"
        subtitle="Track leave balance, requests, and manager decisions."
        actions={<Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/intern/apply-leave')}>Apply Leave</Button>}
      />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Grid container spacing={2.5} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Total Leaves" value={balance?.totalLeaves ?? 12} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Used Leaves" value={balance?.usedLeaves ?? 0} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Pending Leaves" value={balance?.pendingLeaves ?? 0} /></Grid>
            <Grid item xs={12} sm={6} md={3}><StatCard title="Remaining Leaves" value={balance?.remainingLeaves ?? 12} /></Grid>
          </Grid>
          {leaves.length ? (
            <DataTable columns={columns} rows={leaves} searchPlaceholder="Search leave requests" />
          ) : (
            <EmptyState
              title="No leave requests yet"
              message="Your leave history will appear here after you apply."
              actionLabel="Apply Leave"
              onAction={() => navigate('/intern/apply-leave')}
              actionProps={{ startIcon: <AddIcon /> }}
            />
          )}
        </>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyLeaves;

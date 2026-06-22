import RateReviewIcon from '@mui/icons-material/RateReview';
import { Alert, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Snackbar, Stack, TextField } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { leaveService, leaveStatuses, leaveTypes } from '../../services/leaveService';
import { formatDate } from '../../utils/dateUtils';

const formatLabel = (value) => (value ? value.replaceAll('_', ' ') : 'All');

const LeaveRequests = ({ mode = 'manager' }) => {
  const [leaves, setLeaves] = useState([]);
  const [filters, setFilters] = useState({ status: '', leaveType: '' });
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [review, setReview] = useState({ status: 'APPROVED', managerComment: '' });
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const isManager = mode === 'manager';
  const title = isManager ? 'Leave Requests' : mode === 'admin' ? 'All Leaves' : 'Leave Management';

  const loadLeaves = async () => {
    setLoading(true);
    setError('');
    try {
      setLeaves(isManager ? await leaveService.getManagerLeaves() : await leaveService.getAllLeaves());
    } catch (leaveError) {
      setError(leaveError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeaves();
  }, []);

  const filteredLeaves = useMemo(
    () => leaves.filter((leave) =>
      (!filters.status || leave.status === filters.status)
      && (!filters.leaveType || leave.leaveType === filters.leaveType)
    ),
    [filters, leaves]
  );

  const openReview = (leave, status) => {
    setSelectedLeave(leave);
    setReview({ status, managerComment: '' });
  };

  const submitReview = async () => {
    setReviewing(true);
    try {
      const updatedLeave = await leaveService.updateLeaveStatus(selectedLeave.id, review);
      setLeaves((current) => current.map((leave) => (leave.id === updatedLeave.id ? updatedLeave : leave)));
      setSnackbar({ open: true, message: `Leave ${review.status.toLowerCase()} successfully.`, severity: 'success' });
      setSelectedLeave(null);
    } catch (reviewError) {
      setSnackbar({ open: true, message: reviewError.message, severity: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  const columns = [
    { field: 'internName', headerName: 'Intern', sx: { minWidth: 150 } },
    { field: 'departmentName', headerName: 'Department' },
    { field: 'leaveType', headerName: 'Type', render: (row) => <StatusChip status={row.leaveType} variant="outlined" /> },
    { field: 'startDate', headerName: 'Start', render: (row) => formatDate(row.startDate) },
    { field: 'endDate', headerName: 'End', render: (row) => formatDate(row.endDate) },
    { field: 'totalDays', headerName: 'Days' },
    { field: 'reason', headerName: 'Reason', sx: { minWidth: 220 } },
    { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
    { field: 'managerComment', headerName: 'Comment', sx: { minWidth: 200 } },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      searchable: false,
      render: (row) => row.status === 'PENDING' ? (
        <Stack direction="row" spacing={1}>
          <Button size="small" variant="contained" onClick={() => openReview(row, 'APPROVED')}>Approve</Button>
          <Button size="small" color="error" variant="outlined" onClick={() => openReview(row, 'REJECTED')}>Reject</Button>
        </Stack>
      ) : null
    }
  ];

  return (
    <Box>
      <PageHeader title={title} subtitle="Review, approve, and reject intern leave requests." />
      <ErrorMessage message={error} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ minWidth: 180 }}>
          {['', ...leaveStatuses].map((status) => <MenuItem key={status || 'all'} value={status}>{formatLabel(status)}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Leave type" value={filters.leaveType} onChange={(event) => setFilters((current) => ({ ...current, leaveType: event.target.value }))} sx={{ minWidth: 220 }}>
          {['', ...leaveTypes].map((type) => <MenuItem key={type || 'all'} value={type}>{formatLabel(type)}</MenuItem>)}
        </TextField>
      </Stack>
      <DataTable
        columns={columns}
        rows={filteredLeaves}
        loading={loading}
        emptyTitle="No leave requests"
        emptyMessage="Leave requests matching your filters will appear here."
        searchPlaceholder="Search leave requests"
      />

      <Dialog open={Boolean(selectedLeave)} onClose={() => setSelectedLeave(null)} fullWidth maxWidth="sm">
        <DialogTitle>{review.status === 'APPROVED' ? 'Approve Leave' : 'Reject Leave'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField select label="Decision" value={review.status} onChange={(event) => setReview((current) => ({ ...current, status: event.target.value }))}>
              <MenuItem value="APPROVED">Approve</MenuItem>
              <MenuItem value="REJECTED">Reject</MenuItem>
            </TextField>
            <TextField
              label="Manager comment"
              value={review.managerComment}
              onChange={(event) => setReview((current) => ({ ...current, managerComment: event.target.value }))}
              multiline
              minRows={3}
              inputProps={{ maxLength: 500 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedLeave(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<RateReviewIcon />} onClick={submitReview} disabled={reviewing}>
            {reviewing ? 'Saving...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveRequests;

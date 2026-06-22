import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Alert, Box, Button, Divider, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { leaveService } from '../../services/leaveService';
import { formatDate, formatTime } from '../../utils/dateUtils';

const DetailRow = ({ label, value }) => (
  <Stack spacing={0.5}>
    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>{label}</Typography>
    <Typography>{value || '-'}</Typography>
  </Stack>
);

const LeaveDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [leave, setLeave] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;
    leaveService.getLeaveById(id)
      .then((record) => mounted && setLeave(record))
      .catch((leaveError) => mounted && setError(leaveError.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleCancel = async () => {
    try {
      const cancelledLeave = await leaveService.cancelLeave(id);
      setLeave(cancelledLeave);
      setSnackbar({ open: true, message: 'Leave request cancelled successfully.', severity: 'success' });
    } catch (cancelError) {
      setSnackbar({ open: true, message: cancelError.message, severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader
        title="Leave Details"
        subtitle="Review the leave request timeline and decision notes."
        actions={<Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/intern/leaves')}>Back</Button>}
      />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : leave ? (
        <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{leave.leaveType?.replaceAll('_', ' ')}</Typography>
                <Typography color="text.secondary">{formatDate(leave.startDate)} to {formatDate(leave.endDate)}</Typography>
              </Box>
              <StatusChip status={leave.status} />
            </Stack>
            <Divider />
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={4}>
              <DetailRow label="Total days" value={leave.totalDays} />
              <DetailRow label="Manager" value={leave.managerName} />
              <DetailRow label="Reviewed by" value={leave.reviewedByName} />
              <DetailRow label="Reviewed at" value={leave.reviewedAt ? `${formatDate(leave.reviewedAt)} ${formatTime(leave.reviewedAt)}` : '-'} />
            </Stack>
            <DetailRow label="Reason" value={leave.reason} />
            <DetailRow label="Manager comment" value={leave.managerComment} />
            <DetailRow label="Created at" value={leave.createdAt ? `${formatDate(leave.createdAt)} ${formatTime(leave.createdAt)}` : '-'} />
            {leave.status === 'PENDING' ? (
              <Button color="error" variant="outlined" onClick={handleCancel} sx={{ alignSelf: 'flex-start' }}>
                Cancel Leave Request
              </Button>
            ) : null}
          </Stack>
        </Paper>
      ) : null}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default LeaveDetails;

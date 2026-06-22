import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LoginIcon from '@mui/icons-material/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import { Alert, Box, Button, Chip, CircularProgress, Divider, Paper, Snackbar, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { attendanceService } from '../../services/attendanceService';
import { formatTime } from '../../utils/dateUtils';
import Loader from '../common/Loader';

const getStatusLabel = (record) => {
  if (!record) return 'Not punched in';
  if (record.punchOut) return 'Today completed';
  return 'Punched in';
};

const PunchCard = ({ initialRecord = null, onAttendanceChange }) => {
  const [record, setRecord] = useState(initialRecord);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const workingHours = attendanceService.getWorkingHours(record);

  useEffect(() => {
    setRecord(initialRecord);
  }, [initialRecord]);

  useEffect(() => {
    let mounted = true;

    const loadTodayAttendance = async () => {
      try {
        const todayRecord = await attendanceService.getTodayAttendance();
        if (mounted) {
          setRecord(todayRecord);
          onAttendanceChange?.(todayRecord);
        }
      } catch (error) {
        if (mounted) {
          setSnackbar({ open: true, message: error.message, severity: 'error' });
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTodayAttendance();

    return () => {
      mounted = false;
    };
  }, []);

  const runAttendanceAction = async (action, successMessage) => {
    setActionLoading(true);

    try {
      const nextRecord = await action();
      setRecord(nextRecord);
      onAttendanceChange?.(nextRecord);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handlePunchIn = () => runAttendanceAction(attendanceService.punchIn, 'Punch-in successful.');
  const handlePunchOut = () => runAttendanceAction(attendanceService.punchOut, 'Punch-out successful.');

  if (loading) {
    return (
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Loader minHeight={290} />
      </Paper>
    );
  }

  return (
    <>
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Attendance Punch
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track today's work session
            </Typography>
          </Box>
          <Chip label={getStatusLabel(record)} color={record?.punchOut ? 'success' : record ? 'primary' : 'default'} />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Punch in</Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatTime(record?.punchIn)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Punch out</Typography>
            <Typography sx={{ fontWeight: 600 }}>{formatTime(record?.punchOut)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography color="text.secondary">Working hours</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <AccessTimeIcon fontSize="small" color="action" />
              <Typography sx={{ fontWeight: 700 }}>{workingHours}</Typography>
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ mt: 3 }}>
          {!record ? (
            <Button
              fullWidth
              variant="contained"
              size="large"
              startIcon={actionLoading ? <CircularProgress color="inherit" size={18} /> : <LoginIcon />}
              onClick={handlePunchIn}
              disabled={actionLoading}
            >
              Punch In
            </Button>
          ) : !record.punchOut ? (
            <Button
              fullWidth
              variant="contained"
              color="secondary"
              size="large"
              startIcon={actionLoading ? <CircularProgress color="inherit" size={18} /> : <LogoutIcon />}
              onClick={handlePunchOut}
              disabled={actionLoading}
            >
              Punch Out
            </Button>
          ) : (
            <Button fullWidth variant="outlined" color="success" size="large" disabled>
              Today Completed
            </Button>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PunchCard;

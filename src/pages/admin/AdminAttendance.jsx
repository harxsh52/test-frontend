import SyncIcon from '@mui/icons-material/Sync';
import { Alert, Box, Button, Grid, Snackbar } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const load = async () => {
    setLoading(true);
    try {
      const [rows, stats] = await Promise.all([adminService.getAttendance(), adminService.getAttendanceSummary()]);
      setRecords(rows);
      setSummary(stats.metrics || {});
      setError('');
    } catch (attendanceError) {
      setError(attendanceError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const sync = async () => {
    try {
      await adminService.syncAttendance();
      setSnackbar({ open: true, message: 'Attendance sync logged.', severity: 'success' });
      await load();
    } catch (syncError) {
      setSnackbar({ open: true, message: syncError.message, severity: 'error' });
    }
  };

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="System-wide attendance visibility and sync monitoring." action={<Button startIcon={<SyncIcon />} variant="contained" onClick={sync}>Sync</Button>} />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}><StatCard title="Records" value={summary.totalRecords || 0} /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Average Attendance" value={`${summary.averageAttendance || 0}%`} color="success.main" /></Grid>
            <Grid item xs={12} sm={4}><StatCard title="Working Hours" value={summary.totalWorkingHours || 0} color="info.main" /></Grid>
          </Grid>
          <DataTable rows={records} emptyMessage="No attendance records found." searchPlaceholder="Search attendance" columns={[
            { field: 'internName', headerName: 'Intern' },
            { field: 'department', headerName: 'Department' },
            { field: 'date', headerName: 'Date' },
            { field: 'punchInTime', headerName: 'Punch In' },
            { field: 'punchOutTime', headerName: 'Punch Out' },
            { field: 'totalHours', headerName: 'Hours' },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> }
          ]} />
        </>
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminAttendance;

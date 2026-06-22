import { Box, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { internService } from '../../services/internService';
import { formatDate } from '../../utils/dateUtils';

const MyAttendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [summary, setSummary] = useState(null);
  const [history, setHistory] = useState([]);
  const [filters, setFilters] = useState({ fromDate: '', toDate: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadAttendance = async () => {
      setLoading(true);
      try {
        const [today, attendanceSummary, records] = await Promise.all([
          internService.getTodayAttendance(),
          internService.getAttendanceSummary(),
          internService.getAttendanceHistory(filters)
        ]);
        if (mounted) {
          setTodayRecord(today);
          setSummary(attendanceSummary);
          setHistory(records);
          setError('');
        }
      } catch (attendanceError) {
        if (mounted) setError(attendanceError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadAttendance();

    return () => {
      mounted = false;
    };
  }, [filters]);

  return (
    <Box>
      <PageHeader title="Attendance" subtitle="Backend-synced attendance records for your own Emp ID. Manual punch is disabled for interns." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Attendance" value={`${summary?.attendancePercentage || 0}%`} subtitle={`${summary?.totalRecordedDays || 0} recorded days`} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Present" value={summary?.presentDays || 0} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Half Day / Leave" value={`${summary?.halfDays || 0} / ${summary?.leaveDays || 0}`} color="warning.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Working Hours" value={summary?.totalWorkingHoursText || '0h 00m'} color="info.main" />
          </Grid>

          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={1}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Today
                </Typography>
                <StatusChip status={todayRecord?.status || 'NOT_FOUND'} />
                <Typography color="text.secondary">{todayRecord?.message || 'Attendance loaded from backend attendance records.'}</Typography>
                <Typography>Punch in: {todayRecord?.punchInTime || '-'}</Typography>
                <Typography>Punch out: {todayRecord?.punchOutTime || '-'}</Typography>
                <Typography>Working hours: {todayRecord?.totalWorkingHoursText || '0h 00m'}</Typography>
                <Typography color="text.secondary">Source: {todayRecord?.source || 'SYSTEM_SYNC'}</Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
              <TextField type="date" label="From date" value={filters.fromDate} onChange={(event) => setFilters((current) => ({ ...current, fromDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
              <TextField type="date" label="To date" value={filters.toDate} onChange={(event) => setFilters((current) => ({ ...current, toDate: event.target.value }))} InputLabelProps={{ shrink: true }} />
            </Stack>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Punch In</TableCell>
                    <TableCell>Punch Out</TableCell>
                    <TableCell>Hours</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Source</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.length ? (
                    history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{formatDate(record.attendanceDate || record.date)}</TableCell>
                        <TableCell>{record.punchInTime || '-'}</TableCell>
                        <TableCell>{record.punchOutTime || '-'}</TableCell>
                        <TableCell>{record.totalWorkingHoursText}</TableCell>
                        <TableCell><StatusChip status={record.status} /></TableCell>
                        <TableCell>{record.source || '-'}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <EmptyState title="No attendance records" message="No backend attendance records were found for your Emp ID." compact />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default MyAttendance;

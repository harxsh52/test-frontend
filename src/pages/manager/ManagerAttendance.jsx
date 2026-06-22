import { Box, Button, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { managerService } from '../../services/managerService';
import { formatDate } from '../../utils/dateUtils';

const ManagerAttendance = () => {
  const [interns, setInterns] = useState([]);
  const [records, setRecords] = useState([]);
  const [filters, setFilters] = useState({ internId: '', fromDate: '', toDate: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAttendance = async (internId = filters.internId, nextFilters = filters) => {
    if (!internId) return;
    setLoading(true);
    try {
      const attendance = await managerService.getInternAttendance(internId, nextFilters);
      setRecords(attendance);
      setError('');
    } catch (attendanceError) {
      setError(attendanceError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const internRecords = await managerService.getAssignedInterns();
        const selectedInternId = internRecords[0]?.id || '';
        const attendance = selectedInternId ? await managerService.getInternAttendance(selectedInternId) : [];
        if (mounted) {
          setInterns(internRecords);
          setFilters((current) => ({ ...current, internId: selectedInternId }));
          setRecords(attendance);
        }
      } catch (pageError) {
        if (mounted) setError(pageError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <Box>
      <PageHeader title="Manager Attendance" subtitle="Attendance records for interns assigned to you only." />
      <ErrorMessage message={error} />

      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField select name="internId" label="Intern" value={filters.internId} onChange={handleChange} sx={{ minWidth: 220 }}>
            {interns.map((intern) => <MenuItem key={intern.id} value={intern.id}>{intern.name} - {intern.empId}</MenuItem>)}
          </TextField>
          <TextField name="fromDate" label="From" type="date" value={filters.fromDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField name="toDate" label="To" type="date" value={filters.toDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          <TextField select name="status" label="Status" value={filters.status} onChange={handleChange} sx={{ minWidth: 160 }}>
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PRESENT">Present</MenuItem>
            <MenuItem value="ABSENT">Absent</MenuItem>
            <MenuItem value="HALF_DAY">Half Day</MenuItem>
            <MenuItem value="LEAVE">Leave</MenuItem>
          </TextField>
          <Button variant="contained" onClick={() => loadAttendance(filters.internId, filters)} disabled={!filters.internId}>Apply</Button>
        </Stack>
      </Paper>

      {loading ? (
        <Loader />
      ) : records.length ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Intern</TableCell>
                <TableCell>Emp ID</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Punch In</TableCell>
                <TableCell>Punch Out</TableCell>
                <TableCell>Hours</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Source</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.map((record) => (
                <TableRow key={record.id || `${record.internId}-${record.date}`}>
                  <TableCell sx={{ fontWeight: 700 }}>{record.internName}</TableCell>
                  <TableCell>{record.empId}</TableCell>
                  <TableCell>{formatDate(record.date)}</TableCell>
                  <TableCell>{record.punchInTime || '-'}</TableCell>
                  <TableCell>{record.punchOutTime || '-'}</TableCell>
                  <TableCell>{record.totalWorkingHoursText || record.totalHours || '-'}</TableCell>
                  <TableCell><StatusChip status={record.status} /></TableCell>
                  <TableCell>{record.source || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState title="No attendance records" message="No attendance records match your filters." />
      )}
    </Box>
  );
};

export default ManagerAttendance;

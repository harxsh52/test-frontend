import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Button, Grid, MenuItem, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/dateUtils';
import { ROLES } from '../../utils/roles';

const initialFilters = {
  internId: '',
  departmentId: '',
  fromDate: '',
  toDate: ''
};

const AttendanceReport = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [interns, setInterns] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextFilters = filters) => {
    setLoading(true);
    try {
      setError('');
      const reportData = await reportService.getAttendanceReport(nextFilters);
      setReport(reportData);
    } catch (reportError) {
      setError(reportError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadOptionsAndReport = async () => {
      try {
        const [internRecords, departmentRecords] = user.role === ROLES.INTERN
          ? [[], []]
          : await Promise.all([userService.getInterns(), userService.getDepartments()]);
        if (mounted) {
          setInterns(internRecords);
          setDepartments(departmentRecords);
        }
      } catch (optionsError) {
        if (mounted) setError(optionsError.message);
      } finally {
        if (mounted) loadReport(initialFilters);
      }
    };

    loadOptionsAndReport();

    return () => {
      mounted = false;
    };
  }, [user.role]);

  const handleChange = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
    loadReport(initialFilters);
  };

  return (
    <Box>
      <ErrorMessage message={error} />
      <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, '@media print': { display: 'none' } }}>
        <Grid container spacing={2}>
          {user.role !== ROLES.INTERN ? (
            <>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Intern" name="internId" value={filters.internId} onChange={handleChange}>
                  <MenuItem value="">All interns</MenuItem>
                  {interns.map((intern) => (
                    <MenuItem key={intern.internId || intern.id} value={intern.internId || intern.id}>
                      {intern.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Department" name="departmentId" value={filters.departmentId} onChange={handleChange}>
                  <MenuItem value="">All departments</MenuItem>
                  {departments.map((department) => (
                    <MenuItem key={department.id} value={department.id}>
                      {department.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </>
          ) : null}
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="From" name="fromDate" type="date" value={filters.fromDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField fullWidth label="To" name="toDate" type="date" value={filters.toDate} onChange={handleChange} InputLabelProps={{ shrink: true }} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Stack direction="row" spacing={1} sx={{ height: '100%' }} alignItems="center">
              <Button variant="contained" startIcon={<SearchIcon />} onClick={() => loadReport()}>
                Apply
              </Button>
              <Button variant="outlined" startIcon={<FilterAltOffIcon />} onClick={clearFilters}>
                Clear
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Loader />
      ) : report ? (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Records" value={report.totalRecords || 0} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Present Days" value={report.presentDays || 0} color="success.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Working Hours" value={`${Number(report.totalWorkingHours || 0).toFixed(2)}h`} color="info.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Attendance" value={`${Number(report.attendancePercentage || 0).toFixed(0)}%`} color="warning.main" />
            </Grid>
          </Grid>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Intern</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Punch In</TableCell>
                  <TableCell>Punch Out</TableCell>
                  <TableCell>Hours</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.records?.length ? (
                  report.records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{formatDate(record.date)}</TableCell>
                      <TableCell>{record.internName}</TableCell>
                      <TableCell>{record.departmentName || '-'}</TableCell>
                      <TableCell>{record.punchInTime || '-'}</TableCell>
                      <TableCell>{record.punchOutTime || '-'}</TableCell>
                      <TableCell>{Number(record.totalHours || 0).toFixed(2)}</TableCell>
                      <TableCell><StatusChip status={record.status} /></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState title="No attendance records found" message="Try adjusting filters or check again after attendance is recorded." compact />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      ) : null}
    </Box>
  );
};

export default AttendanceReport;

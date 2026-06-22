import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import SearchIcon from '@mui/icons-material/Search';
import { Alert, Box, Button, Grid, MenuItem, Paper, Rating, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
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
  managerId: '',
  status: '',
  priority: '',
  fromDate: '',
  toDate: ''
};

const TaskReport = () => {
  const { user } = useAuth();
  const [filters, setFilters] = useState(initialFilters);
  const [interns, setInterns] = useState([]);
  const [managers, setManagers] = useState([]);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadReport = async (nextFilters = filters) => {
    setLoading(true);
    try {
      setError('');
      const reportData = await reportService.getTaskReport(nextFilters);
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
        const internRecords = user.role === ROLES.INTERN ? [] : await userService.getInterns();
        const managerRecords = [ROLES.HR, ROLES.ADMIN].includes(user.role) ? await userService.getUsersByRole(ROLES.MANAGER) : [];
        if (mounted) {
          setInterns(internRecords);
          setManagers(managerRecords);
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
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Intern" name="internId" value={filters.internId} onChange={handleChange}>
                <MenuItem value="">All interns</MenuItem>
                {interns.map((intern) => (
                  <MenuItem key={intern.internId || intern.id} value={intern.internId || intern.id}>
                    {intern.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}
          {managers.length ? (
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Manager" name="managerId" value={filters.managerId} onChange={handleChange}>
                <MenuItem value="">All managers</MenuItem>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          ) : null}
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Status" name="status" value={filters.status} onChange={handleChange}>
              <MenuItem value="">All statuses</MenuItem>
              {['PENDING', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'REJECTED'].map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField select fullWidth label="Priority" name="priority" value={filters.priority} onChange={handleChange}>
              <MenuItem value="">All priorities</MenuItem>
              {['LOW', 'MEDIUM', 'HIGH'].map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
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
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Total Tasks" value={report.totalTasks || 0} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Completed" value={report.completedTasks || 0} color="success.main" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Submitted" value={report.submittedTasks || 0} color="warning.main" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Completion" value={`${Number(report.completionPercentage || 0).toFixed(0)}%`} color="info.main" /></Grid>
          </Grid>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Task</TableCell>
                  <TableCell>Intern</TableCell>
                  <TableCell>Manager</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell>Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report.records?.length ? (
                  report.records.map((task) => (
                    <TableRow key={task.id}>
                      <TableCell>{task.title}</TableCell>
                      <TableCell>{task.internName}</TableCell>
                      <TableCell>{task.managerName}</TableCell>
                      <TableCell>{task.priority}</TableCell>
                      <TableCell><StatusChip status={task.status} /></TableCell>
                      <TableCell>{formatDate(task.dueDate)}</TableCell>
                      <TableCell>{task.rating ? <Rating value={Number(task.rating)} readOnly size="small" /> : '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <EmptyState title="No tasks found" message="Try adjusting filters or create tasks first." compact />
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

export default TaskReport;

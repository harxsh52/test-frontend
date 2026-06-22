import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminService.getTasks(), adminService.getTasksSummary()])
      .then(([taskRows, stats]) => {
        setTasks(taskRows);
        setSummary(stats.metrics || {});
      })
      .catch((taskError) => setError(taskError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Tasks" subtitle="Admin overview of assigned, submitted, reviewed, and completed task work." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}><StatCard title="Total Tasks" value={summary.totalTasks || 0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Submitted" value={summary.submitted || 0} color="warning.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Completed" value={summary.completed || 0} color="success.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Avg Rating" value={summary.averageRating || 0} color="info.main" /></Grid>
          </Grid>
          <DataTable rows={tasks} emptyMessage="No tasks found." searchPlaceholder="Search tasks" columns={[
            { field: 'title', headerName: 'Task' },
            { field: 'assignedToName', headerName: 'Intern' },
            { field: 'assignedByName', headerName: 'Assigned By' },
            { field: 'priority', headerName: 'Priority', render: (row) => <StatusChip status={row.priority} /> },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
            { field: 'dueDate', headerName: 'Due Date' },
            { field: 'rating', headerName: 'Rating' }
          ]} />
        </>
      )}
    </Box>
  );
};

export default AdminTasks;

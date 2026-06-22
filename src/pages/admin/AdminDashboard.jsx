import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import InsightsIcon from '@mui/icons-material/Insights';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Box, Grid, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import adminService from '../../services/adminService';

const metric = (value) => value ?? 0;

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const data = await adminService.getDashboard();
        if (mounted) setDashboard(data);
      } catch (dashboardError) {
        if (mounted) setError(dashboardError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDashboard();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = dashboard?.summaryCards || {};

  return (
    <Box>
      <PageHeader title="Admin Dashboard" subtitle="System-wide control center for users, interns, departments, tasks, reports, and platform activity." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard title="Total Users" value={metric(cards.totalUsers)} icon={GroupsIcon} />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard title="Interns" value={metric(cards.totalInterns)} icon={SupervisorAccountIcon} color="success.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard title="Departments" value={metric(cards.totalDepartments)} icon={BusinessIcon} color="info.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard title="Tasks" value={metric(cards.totalTasks)} icon={AssignmentIcon} color="warning.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={2.4}>
              <StatCard title="Avg Intern Score" value={`${metric(cards.averageInternScore)}%`} icon={InsightsIcon} color="secondary.main" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={7}>
              <DataTable
                rows={dashboard?.topInterns || []}
                emptyMessage="No intern performance data found."
                searchPlaceholder="Search top interns"
                columns={[
                  { field: 'name', headerName: 'Intern', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
                  { field: 'empId', headerName: 'Emp ID' },
                  { field: 'department', headerName: 'Department' },
                  { field: 'assignedCompany', headerName: 'Company' },
                  { field: 'finalScore', headerName: 'Final Score', valueGetter: (row) => `${row.finalScore || 0}%` }
                ]}
              />
            </Grid>
            <Grid item xs={12} lg={5}>
              <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, p: 2, height: '100%' }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <PersonSearchIcon color="warning" />
                  <Typography variant="h6">Recent Activity</Typography>
                </Stack>
                <Stack spacing={1.5}>
                  {(dashboard?.recentActivity || []).map((activity, index) => (
                    <Box key={`${activity.action}-${index}`} sx={{ borderBottom: '1px solid', borderColor: 'divider', pb: 1 }}>
                      <Typography sx={{ fontWeight: 700 }}>{activity.action}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {activity.actorName} • {activity.entityType}
                      </Typography>
                    </Box>
                  ))}
                  {!dashboard?.recentActivity?.length && <Typography color="text.secondary">No recent audit activity.</Typography>}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          <DataTable
            rows={dashboard?.managerPerformance || []}
            emptyMessage="No manager performance data found."
            searchPlaceholder="Search managers"
            columns={[
              { field: 'name', headerName: 'Manager', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
              { field: 'department', headerName: 'Department' },
              { field: 'assignedInterns', headerName: 'Assigned Interns' },
              { field: 'averageInternScore', headerName: 'Avg Intern Score', valueGetter: (row) => `${row.averageInternScore || 0}%` },
              { field: 'pendingReviews', headerName: 'Pending Reviews' },
              { field: 'averageFeedbackRating', headerName: 'Avg Rating' }
            ]}
          />
        </Stack>
      )}
    </Box>
  );
};

export default AdminDashboard;

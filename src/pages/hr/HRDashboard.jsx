import BusinessIcon from '@mui/icons-material/Business';
import GroupsIcon from '@mui/icons-material/Groups';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { userService } from '../../services/userService';

const HRDashboard = () => {
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    departments: 0,
    completedInternships: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const dashboardStats = await userService.getHrStats();
        if (mounted) {
          setStats(dashboardStats);
        }
      } catch (statsError) {
        if (mounted) {
          setError(statsError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <PageHeader title="HR Dashboard" subtitle="Track intern onboarding, departments, and hiring activity." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Total Interns" value={stats.totalInterns} icon={GroupsIcon} />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Active Interns" value={stats.activeInterns} icon={SupervisorAccountIcon} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Departments" value={stats.departments} icon={BusinessIcon} color="info.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <StatCard title="Completed Internships" value={stats.completedInternships} icon={HowToRegIcon} color="secondary.main" />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default HRDashboard;

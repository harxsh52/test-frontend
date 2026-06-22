import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';

const ManagerDashboard = () => {
  const [stats, setStats] = useState({
    totalInterns: 0,
    activeInterns: 0,
    tasksAssigned: 0,
    tasksCompleted: 0,
    pendingReviews: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const [interns, tasks] = await Promise.all([userService.getInternsByManager(), taskService.getAssignedByMe()]);
        const userStats = userService.getManagerStats(interns);
        const taskStats = taskService.getManagerTaskStats(tasks);

        if (mounted) {
          setStats({ ...userStats, ...taskStats });
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
      <PageHeader title="Manager Dashboard" subtitle="Monitor assigned interns, task progress, and pending reviews." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard title="Total Interns" value={stats.totalInterns} icon={GroupIcon} />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard title="Active Interns" value={stats.activeInterns} icon={VerifiedUserIcon} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard title="Tasks Assigned" value={stats.tasksAssigned} icon={AssignmentIcon} />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard title="Tasks Completed" value={stats.tasksCompleted} icon={DoneAllIcon} color="success.main" />
          </Grid>
          <Grid item xs={12} sm={6} lg={2.4}>
            <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={PendingActionsIcon} color="warning.main" />
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default ManagerDashboard;

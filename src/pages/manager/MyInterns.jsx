import AssignmentIcon from '@mui/icons-material/Assignment';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { Box, Chip, Grid, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';

const MyInterns = () => {
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadPageData = async () => {
      try {
        const [internRecords, taskRecords] = await Promise.all([userService.getInternsByManager(), taskService.getAssignedByMe()]);
        if (mounted) {
          setInterns(internRecords);
          setTasks(taskRecords);
        }
      } catch (pageError) {
        if (mounted) {
          setError(pageError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadPageData();

    return () => {
      mounted = false;
    };
  }, []);

  const getTaskStatsForIntern = (internId) => taskService.getTaskStats(tasks.filter((task) => task.internId === internId));

  return (
    <Box>
      <PageHeader title="My Interns" subtitle="Interns assigned to you and their current task workload." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <StatCard title="Assigned Interns" value={interns.length} icon={AssignmentIcon} />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Submitted Tasks"
                value={tasks.filter((task) => task.status === 'SUBMITTED').length}
                icon={PendingActionsIcon}
                color="warning.main"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <StatCard
                title="Approved Tasks"
                value={tasks.filter((task) => task.status === 'APPROVED').length}
                icon={DoneAllIcon}
                color="success.main"
              />
            </Grid>
          </Grid>
          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>College</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Skills</TableCell>
                  <TableCell>Task Load</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {interns.length ? (
                  interns.map((intern) => {
                    const taskStats = getTaskStatsForIntern(intern.id);

                    return (
                      <TableRow key={intern.id}>
                        <TableCell sx={{ fontWeight: 600 }}>{intern.name}</TableCell>
                        <TableCell>{intern.department}</TableCell>
                        <TableCell>{intern.college || '-'}</TableCell>
                        <TableCell>
                          <Chip size="small" label={intern.status} color={intern.status === 'ACTIVE' ? 'success' : 'default'} />
                        </TableCell>
                        <TableCell>{(intern.skills || []).join(', ') || '-'}</TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography variant="body2">Total: {taskStats.totalTasks}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Pending review: {taskStats.inReviewTasks}
                            </Typography>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <EmptyState title="No interns assigned" message="Assigned interns will appear here once HR connects them to you." compact />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </>
      )}
    </Box>
  );
};

export default MyInterns;

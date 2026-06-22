import RateReviewIcon from '@mui/icons-material/RateReview';
import { Alert, Box, Button, Grid, Paper, Rating, Snackbar, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import TaskReviewDialog from '../../components/tasks/TaskReviewDialog';
import { taskService } from '../../services/taskService';
import { formatDate } from '../../utils/dateUtils';

const ReviewTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadTasks = async () => {
      try {
        const taskRecords = await taskService.getAssignedByMe();
        if (mounted) {
          setTasks(taskRecords);
        }
      } catch (taskError) {
        if (mounted) {
          setError(taskError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      mounted = false;
    };
  }, []);

  const submittedTasks = tasks.filter((task) => task.status === 'SUBMITTED');
  const reviewedTasks = tasks.filter((task) => ['APPROVED', 'REJECTED'].includes(task.status));

  const handleReview = async ({ decision, feedback, rating }) => {
    setReviewing(true);

    try {
      const reviewedTask = await taskService.reviewTask(selectedTask.id, { decision, feedback, rating });
      setTasks((current) => current.map((task) => (task.id === reviewedTask.id ? reviewedTask : task)));
      setSnackbar({
        open: true,
        message: `Task ${decision === 'APPROVED' ? 'approved' : 'rejected'} successfully.`,
        severity: 'success'
      });
      setSelectedTask(null);
    } catch (reviewError) {
      setSnackbar({ open: true, message: reviewError.message, severity: 'error' });
    } finally {
      setReviewing(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Review Tasks" subtitle="Review submitted intern tasks, approve or reject, and leave feedback." />
      <ErrorMessage message={error} />

      {loading ? (
        <Loader />
      ) : (
        <>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Submitted Tasks
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {submittedTasks.length ? (
              submittedTasks.map((task) => (
                <Grid item xs={12} md={6} key={task.id}>
                  <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                    <Stack spacing={2}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {task.title}
                          </Typography>
                          <Typography color="text.secondary">Intern: {task.internName || '-'}</Typography>
                        </Box>
                        <StatusChip status={task.status} />
                      </Stack>
                      <Typography color="text.secondary">{task.description}</Typography>
                      {task.submissionLink ? (
                        <Typography variant="body2" color="text.secondary">
                          Submission: {task.submissionLink}
                        </Typography>
                      ) : null}
                      {task.submissionNote ? (
                        <Typography variant="body2" color="text.secondary">
                          Note: {task.submissionNote}
                        </Typography>
                      ) : null}
                      <Typography variant="body2" color="text.secondary">
                        Due date: {formatDate(task.dueDate)} | Submitted: {formatDate(task.submittedAt)}
                      </Typography>
                      <Button
                        data-testid={`review-task-${task.id}`}
                        variant="contained"
                        startIcon={<RateReviewIcon />}
                        onClick={() => setSelectedTask(task)}
                        sx={{ alignSelf: 'flex-start' }}
                      >
                        Review Task
                      </Button>
                    </Stack>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <EmptyState title="No tasks waiting for review" message="Submitted intern work will appear here." />
              </Grid>
            )}
          </Grid>

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            Reviewed Tasks
          </Typography>
          <Grid container spacing={3}>
            {reviewedTasks.length ? (
              reviewedTasks.map((task) => (
                <Grid item xs={12} md={6} lg={4} key={task.id}>
                  <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                    <Stack spacing={1.5}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                          {task.title}
                        </Typography>
                        <StatusChip status={task.status} />
                      </Stack>
                      <Typography color="text.secondary">Intern: {task.internName || '-'}</Typography>
                      <Typography color="text.secondary">{task.managerFeedback}</Typography>
                      {task.rating ? <Rating value={Number(task.rating)} readOnly /> : null}
                      <Typography variant="body2" color="text.secondary">
                        Reviewed: {formatDate(task.reviewedAt)}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))
            ) : (
              <Grid item xs={12}>
                <EmptyState title="No reviewed tasks yet" message="Approved and rejected tasks will appear here after review." />
              </Grid>
            )}
          </Grid>
        </>
      )}

      <TaskReviewDialog
        open={Boolean(selectedTask)}
        task={selectedTask}
        onClose={() => setSelectedTask(null)}
        onSubmit={handleReview}
        loading={reviewing}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewTasks;

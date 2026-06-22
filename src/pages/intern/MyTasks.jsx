import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import TaskCard from '../../components/tasks/TaskCard';
import { internService } from '../../services/internService';
import { formatDate } from '../../utils/dateUtils';

const statusTabs = ['ALL', 'ASSIGNED', 'IN_PROGRESS', 'SUBMITTED', 'REVIEWED', 'COMPLETED', 'REJECTED'];
const priorities = ['', 'LOW', 'MEDIUM', 'HIGH'];
const submittableStatuses = ['ASSIGNED', 'IN_PROGRESS', 'REJECTED'];

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState('ALL');
  const [filters, setFilters] = useState({ search: '', priority: '', dueDate: '' });
  const [selectedTask, setSelectedTask] = useState(null);
  const [submission, setSubmission] = useState({ submissionText: '', githubLink: '', deploymentLink: '', attachmentUrl: '' });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadTasks = async () => {
    setLoading(true);
    try {
      const taskRecords = await internService.getInternTasks({
        status: status === 'ALL' ? '' : status,
        ...filters
      });
      setTasks(taskRecords);
      setError('');
    } catch (taskError) {
      setError(taskError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, filters.priority, filters.dueDate]);

  const visibleTasks = useMemo(() => {
    const search = filters.search.trim().toLowerCase();
    return tasks.filter((task) => !search || task.title.toLowerCase().includes(search));
  }, [tasks, filters.search]);

  const handleStartTask = async (task) => {
    setActionLoading(true);
    try {
      const updatedTask = await internService.startTask(task.id);
      setTasks((current) => current.map((item) => (item.id === updatedTask.id ? updatedTask : item)));
      setSnackbar({ open: true, message: 'Task started.', severity: 'success' });
    } catch (startError) {
      setSnackbar({ open: true, message: startError.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const openSubmitDialog = (task) => {
    setSelectedTask(task);
    setSubmission({
      submissionText: task.submissionText || task.submissionNote || '',
      githubLink: task.githubLink || '',
      deploymentLink: task.deploymentLink || '',
      attachmentUrl: task.attachmentUrl || ''
    });
  };

  const handleSubmitTask = async () => {
    if (!selectedTask) return;
    setActionLoading(true);
    try {
      const submittedTask = await internService.submitTask(selectedTask.id, submission);
      setTasks((current) => current.map((task) => (task.id === submittedTask.id ? submittedTask : task)));
      setSelectedTask(null);
      setSnackbar({ open: true, message: 'Task submitted for manager review.', severity: 'success' });
    } catch (submitError) {
      setSnackbar({ open: true, message: submitError.message, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Tasks" subtitle="Backend-owned tasks assigned to your logged-in intern profile only." />
      <ErrorMessage message={error} />

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Tabs value={status} onChange={(_, value) => setStatus(value)} variant="scrollable" scrollButtons="auto">
          {statusTabs.map((tab) => <Tab key={tab} value={tab} label={tab.replaceAll('_', ' ')} />)}
        </Tabs>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField label="Search by title" value={filters.search} onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))} fullWidth />
          <TextField select label="Priority" value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value }))} sx={{ minWidth: 180 }}>
            {priorities.map((priority) => <MenuItem key={priority || 'all'} value={priority}>{priority || 'All priorities'}</MenuItem>)}
          </TextField>
          <TextField type="date" label="Due date" value={filters.dueDate} onChange={(event) => setFilters((current) => ({ ...current, dueDate: event.target.value }))} InputLabelProps={{ shrink: true }} sx={{ minWidth: 180 }} />
          <Button variant="outlined" onClick={loadTasks}>Apply</Button>
        </Stack>
      </Stack>

      {loading ? (
        <Loader />
      ) : visibleTasks.length ? (
        <Grid container spacing={3}>
          {visibleTasks.map((task) => (
            <Grid item xs={12} md={6} lg={4} key={task.id}>
              <TaskCard
                task={task}
                actions={
                  <Stack spacing={1.25}>
                    <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => setSelectedTask(task)}>
                      View Details
                    </Button>
                    {task.status === 'ASSIGNED' ? (
                      <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => handleStartTask(task)} disabled={actionLoading}>
                        Start Task
                      </Button>
                    ) : null}
                    {submittableStatuses.includes(task.status) ? (
                      <Button variant="contained" startIcon={<SendIcon />} onClick={() => openSubmitDialog(task)} disabled={actionLoading}>
                        Submit Work
                      </Button>
                    ) : null}
                  </Stack>
                }
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <EmptyState title="No tasks found" message="No backend tasks match your current filters." />
      )}

      <Dialog open={Boolean(selectedTask)} onClose={() => setSelectedTask(null)} fullWidth maxWidth="md">
        <DialogTitle sx={{ fontWeight: 850 }}>{submittableStatuses.includes(selectedTask?.status) ? 'Task Details & Submission' : 'Task Details'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2.25} sx={{ mt: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>{selectedTask?.title}</Typography>
            <StatusChip status={selectedTask?.status} />
            <Typography color="text.secondary">{selectedTask?.description}</Typography>
            <Typography>Due date: {formatDate(selectedTask?.dueDate)}</Typography>
            <Typography>Assigned by: {selectedTask?.assignedByName || selectedTask?.assignedBy || '-'}</Typography>
            <Typography>Assigned: {formatDate(selectedTask?.assignedAt || selectedTask?.createdAt)}</Typography>
            {selectedTask?.managerFeedback ? <Alert severity="info">Manager feedback: {selectedTask.managerFeedback}</Alert> : null}
            {selectedTask?.rating ? <Typography>Rating: {selectedTask.rating}/5</Typography> : null}
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Timeline</Typography>
            <Typography color="text.secondary">{'Assigned > In Progress > Submitted > Reviewed > Completed'}</Typography>
            {submittableStatuses.includes(selectedTask?.status) ? (
              <>
                <TextField label="Submission text" value={submission.submissionText} onChange={(event) => setSubmission((current) => ({ ...current, submissionText: event.target.value }))} multiline minRows={4} fullWidth />
                <TextField label="GitHub link" value={submission.githubLink} onChange={(event) => setSubmission((current) => ({ ...current, githubLink: event.target.value }))} fullWidth />
                <TextField label="Deployment link" value={submission.deploymentLink} onChange={(event) => setSubmission((current) => ({ ...current, deploymentLink: event.target.value }))} fullWidth />
                <TextField label="Attachment URL" value={submission.attachmentUrl} onChange={(event) => setSubmission((current) => ({ ...current, attachmentUrl: event.target.value }))} fullWidth />
              </>
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setSelectedTask(null)} disabled={actionLoading}>Close</Button>
          {submittableStatuses.includes(selectedTask?.status) ? (
            <Button variant="contained" onClick={handleSubmitTask} disabled={actionLoading}>{actionLoading ? 'Submitting...' : 'Submit'}</Button>
          ) : null}
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyTasks;

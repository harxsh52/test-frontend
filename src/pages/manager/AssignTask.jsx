import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, Stack, TextField } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import PermissionGate from '../../components/auth/PermissionGate';
import TaskCard from '../../components/tasks/TaskCard';
import { taskService } from '../../services/taskService';
import { userService } from '../../services/userService';
import { futureOrToday, required } from '../../utils/validation';

const getDefaultDueDate = () => {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toISOString().slice(0, 10);
};

const initialFormData = {
  internId: '',
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: getDefaultDueDate()
};

const AssignTask = () => {
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadPageData = async () => {
      try {
        const [internRecords, taskRecords] = await Promise.all([userService.getInternsByManager(), taskService.getAssignedByMe()]);
        if (mounted) {
          setInterns(internRecords);
          setTasks(taskRecords);
          setFormData((current) => ({ ...current, internId: internRecords[0]?.id || '' }));
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

  const getInternName = (internId) => interns.find((intern) => Number(intern.id) === Number(internId))?.name || '-';

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
    setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      internId: required(formData.internId, 'Intern'),
      title: required(formData.title, 'Task title'),
      description: required(formData.description, 'Description'),
      dueDate: required(formData.dueDate, 'Due date') || futureOrToday(formData.dueDate, 'Due date')
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);

    try {
      const newTask = await taskService.createTask(formData);
      setTasks((current) => [newTask, ...current]);
      setSnackbar({ open: true, message: 'Task assigned successfully.', severity: 'success' });
      setFormData({
        ...initialFormData,
        internId: interns[0]?.id || '',
        dueDate: getDefaultDueDate()
      });
    } catch (submitError) {
      setSnackbar({ open: true, message: submitError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Assign Task" subtitle="Create manager-assigned tasks for your interns." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={5}>
            <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={2}>
                <TextField select label="Intern" name="internId" value={formData.internId} onChange={handleChange} required error={Boolean(formErrors.internId)} helperText={formErrors.internId}>
                  {interns.map((intern) => (
                    <MenuItem key={intern.id} value={intern.id}>
                      {intern.name}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField label="Task title" name="title" value={formData.title} onChange={handleChange} required error={Boolean(formErrors.title)} helperText={formErrors.title} />
                <TextField
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  multiline
                  minRows={4}
                  required
                  error={Boolean(formErrors.description)}
                  helperText={formErrors.description}
                />
                <TextField select label="Priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                </TextField>
                <TextField
                  label="Due date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  required
                  error={Boolean(formErrors.dueDate)}
                  helperText={formErrors.dueDate}
                />
                <PermissionGate permission="MANAGER_TASK_CREATE">
                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<AssignmentTurnedInIcon />}
                    sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                    disabled={saving || !interns.length}
                  >
                    {saving ? 'Assigning...' : 'Assign Task'}
                  </Button>
                </PermissionGate>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={7}>
            <Grid container spacing={2}>
              {tasks.slice(0, 4).map((task) => (
                <Grid item xs={12} md={6} key={task.id}>
                  <TaskCard task={task} internName={getInternName(task.internId)} />
                </Grid>
              ))}
              {!tasks.length ? (
                <Grid item xs={12}>
                  <EmptyState title="No tasks assigned yet" message="Create a task using the form to start tracking intern work." />
                </Grid>
              ) : null}
            </Grid>
          </Grid>
        </Grid>
      )}

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

export default AssignTask;

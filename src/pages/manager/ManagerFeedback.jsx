import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, Grid, MenuItem, Paper, Rating, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { managerService } from '../../services/managerService';
import { formatDate } from '../../utils/dateUtils';

const initialForm = {
  internId: '',
  taskId: '',
  ratingOverall: 4,
  ratingTechnical: 4,
  ratingCommunication: 4,
  ratingDiscipline: 4,
  ratingTaskQuality: 4,
  strengths: '',
  improvementAreas: '',
  comment: ''
};

const ratingFields = [
  ['ratingOverall', 'Overall'],
  ['ratingTechnical', 'Technical'],
  ['ratingCommunication', 'Communication'],
  ['ratingDiscipline', 'Discipline'],
  ['ratingTaskQuality', 'Task Quality']
];

const ManagerFeedback = () => {
  const [searchParams] = useSearchParams();
  const [interns, setInterns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadFeedback = async (internId) => {
    if (!internId) return;
    const [taskRecords, feedbackRecords] = await Promise.all([
      managerService.getManagerTasks({ internId }),
      managerService.getInternFeedback(internId)
    ]);
    setTasks(taskRecords);
    setFeedback(feedbackRecords);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const internRecords = await managerService.getAssignedInterns();
        const selectedInternId = searchParams.get('internId') || internRecords[0]?.id || '';
        const [taskRecords, feedbackRecords] = selectedInternId
          ? await Promise.all([managerService.getManagerTasks({ internId: selectedInternId }), managerService.getInternFeedback(selectedInternId)])
          : [[], []];
        if (mounted) {
          setInterns(internRecords);
          setTasks(taskRecords);
          setFeedback(feedbackRecords);
          setForm((current) => ({ ...current, internId: selectedInternId }));
        }
      } catch (pageError) {
        if (mounted) setError(pageError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [searchParams]);

  const handleChange = async (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === 'internId') {
      await loadFeedback(value);
      setForm((current) => ({ ...current, taskId: '' }));
    }
  };

  const handleSubmit = async () => {
    if (!form.internId) return;
    setSaving(true);
    try {
      await managerService.createInternFeedback(form.internId, {
        ...form,
        taskId: form.taskId || null
      });
      await loadFeedback(form.internId);
      setForm((current) => ({ ...initialForm, internId: current.internId }));
      setSnackbar({ open: true, message: 'Feedback submitted successfully.', severity: 'success' });
    } catch (feedbackError) {
      setSnackbar({ open: true, message: feedbackError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Manager Feedback" subtitle="Give structured feedback only to interns assigned to you." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} lg={5}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={2}>
                <TextField select label="Intern" name="internId" value={form.internId} onChange={handleChange} required>
                  {interns.map((intern) => <MenuItem key={intern.id} value={intern.id}>{intern.name} - {intern.empId}</MenuItem>)}
                </TextField>
                <TextField select label="Task (optional)" name="taskId" value={form.taskId} onChange={handleChange}>
                  <MenuItem value="">General feedback</MenuItem>
                  {tasks.map((task) => <MenuItem key={task.id} value={task.id}>{task.title}</MenuItem>)}
                </TextField>
                <Grid container spacing={2}>
                  {ratingFields.map(([key, label]) => (
                    <Grid item xs={12} sm={6} key={key}>
                      <Typography variant="body2" color="text.secondary">{label}</Typography>
                      <Rating value={form[key]} onChange={(_, value) => setForm((current) => ({ ...current, [key]: value || 1 }))} />
                    </Grid>
                  ))}
                </Grid>
                <TextField label="Strengths" name="strengths" value={form.strengths} onChange={handleChange} multiline minRows={2} />
                <TextField label="Improvement areas" name="improvementAreas" value={form.improvementAreas} onChange={handleChange} multiline minRows={2} />
                <TextField label="Comment" name="comment" value={form.comment} onChange={handleChange} multiline minRows={4} required />
                <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmit} disabled={saving || !form.internId || !form.comment.trim()}>
                  {saving ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} lg={7}>
            {feedback.length ? (
              <Stack spacing={2}>
                {feedback.map((item) => (
                  <Paper key={item.id} elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                    <Typography sx={{ fontWeight: 800 }}>{item.taskTitle || 'General Feedback'} - {formatDate(item.createdAt)}</Typography>
                    <Typography color="text.secondary">{item.comment}</Typography>
                    <Typography variant="body2" color="text.secondary">Overall {item.ratingOverall}/5 | Technical {item.ratingTechnical}/5 | Communication {item.ratingCommunication}/5</Typography>
                  </Paper>
                ))}
              </Stack>
            ) : (
              <EmptyState title="No feedback yet" message="Feedback history for the selected intern will appear here." />
            )}
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default ManagerFeedback;

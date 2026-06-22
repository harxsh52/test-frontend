import SendIcon from '@mui/icons-material/Send';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  FormControlLabel,
  Grid,
  Paper,
  Rating,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { internService } from '../../services/internService';
import { formatDate } from '../../utils/dateUtils';

const initialManagerForm = {
  ratingSupport: 5,
  ratingCommunication: 5,
  ratingGuidance: 5,
  ratingAvailability: 5,
  comment: '',
  anonymous: false
};

const ratingFields = [
  ['ratingSupport', 'Support'],
  ['ratingCommunication', 'Communication'],
  ['ratingGuidance', 'Guidance'],
  ['ratingAvailability', 'Availability']
];

const MyFeedback = () => {
  const [feedbackData, setFeedbackData] = useState(null);
  const [form, setForm] = useState(initialManagerForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadFeedback = async () => {
    setLoading(true);
    try {
      const data = await internService.getInternFeedback();
      setFeedbackData(data);
      setError('');
    } catch (feedbackError) {
      setError(feedbackError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await internService.getInternFeedback();
        if (mounted) {
          setFeedbackData(data);
          setError('');
        }
      } catch (feedbackError) {
        if (mounted) setError(feedbackError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSubmitManagerFeedback = async () => {
    setSaving(true);
    try {
      await internService.submitManagerFeedback(form);
      setForm(initialManagerForm);
      setSnackbar({ open: true, message: 'Your manager feedback was submitted.', severity: 'success' });
      await loadFeedback();
    } catch (feedbackError) {
      setSnackbar({ open: true, message: feedbackError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const managerFeedback = feedbackData?.managerFeedback || [];
  const feedbackGivenToManager = feedbackData?.feedbackGivenToManager || [];
  const summary = feedbackData?.summary || {};

  return (
    <Box>
      <PageHeader title="Feedback" subtitle="Manager reviews and your feedback for the assigned manager, loaded from your JWT-owned intern profile." />
      <ErrorMessage message={error} />

      {loading ? (
        <Loader />
      ) : (
        <Stack spacing={3}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Average Rating" value={Number(summary.averageRating || 0).toFixed(1)} />
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <StatCard title="Manager Reviews" value={summary.totalFeedbacks || 0} />
            </Grid>
            <Grid item xs={12} sm={12} md={4}>
              <StatCard title="Feedback Given" value={feedbackGivenToManager.length} />
            </Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 2 }}>
              Feedback From Manager
            </Typography>
            {managerFeedback.length ? (
              <Grid container spacing={3}>
                {managerFeedback.map((item) => (
                  <Grid item xs={12} md={6} key={item.id}>
                    <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
                      <Stack spacing={1.25}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{item.taskName || 'General Feedback'}</Typography>
                        <Typography variant="body2" color="text.secondary">By {item.managerName || 'Manager'}</Typography>
                        <Rating value={Number(item.rating) || 0} readOnly />
                        <Typography color="text.secondary">{item.feedbackText || item.feedback}</Typography>
                        <Typography variant="body2" color="text.secondary">Review date: {formatDate(item.reviewDate || item.createdAt)}</Typography>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <EmptyState title="No manager feedback yet" message="Task reviews and ratings will appear here after your manager reviews submitted work." />
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 2 }}>
              Give Feedback To Manager
            </Typography>
            <Grid container spacing={2.5}>
              {ratingFields.map(([key, label]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>{label}</Typography>
                  <Rating
                    value={form[key]}
                    onChange={(_, value) => setForm((current) => ({ ...current, [key]: value || 1 }))}
                  />
                </Grid>
              ))}
              <Grid item xs={12}>
                <TextField
                  label="Comment"
                  value={form.comment}
                  onChange={(event) => setForm((current) => ({ ...current, comment: event.target.value }))}
                  multiline
                  minRows={4}
                  fullWidth
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={<Checkbox checked={form.anonymous} onChange={(event) => setForm((current) => ({ ...current, anonymous: event.target.checked }))} />}
                  label="Submit anonymously"
                />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmitManagerFeedback} disabled={saving}>
                  {saving ? 'Submitting...' : 'Submit Feedback'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 2 }}>
              Feedback You Submitted
            </Typography>
            {feedbackGivenToManager.length ? (
              <Stack spacing={2}>
                {feedbackGivenToManager.map((item) => (
                  <Alert key={item.id} severity="info">
                    {item.comment} - {formatDate(item.createdAt)}
                  </Alert>
                ))}
              </Stack>
            ) : (
              <Typography color="text.secondary">You have not submitted manager feedback yet.</Typography>
            )}
          </Paper>
        </Stack>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyFeedback;

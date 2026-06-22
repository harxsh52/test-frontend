import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Rating, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

const TaskReviewDialog = ({ open, task, onClose, onSubmit, loading = false }) => {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(4);

  useEffect(() => {
    if (open) {
      setFeedback(task?.managerFeedback || '');
      setRating(task?.rating || 4);
    }
  }, [open, task]);

  const handleDecision = (decision) => {
    onSubmit({
      decision,
      feedback,
      rating
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>Review Task</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box>
            <Typography variant="body2" color="text.secondary">
              Task
            </Typography>
            <Typography sx={{ fontWeight: 700 }}>{task?.title}</Typography>
          </Box>
          <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75 }}>
              Rating
            </Typography>
            <Rating value={rating} onChange={(_, nextValue) => setRating(nextValue || 1)} />
          </Box>
          <TextField
            inputProps={{ 'data-testid': 'review-feedback-input' }}
            label="Feedback"
            value={feedback}
            onChange={(event) => setFeedback(event.target.value)}
            multiline
            minRows={4}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3, flexWrap: 'wrap', gap: 1 }}>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button data-testid="reject-task-button" color="error" variant="outlined" onClick={() => handleDecision('REJECTED')} disabled={loading || !feedback.trim()}>
          Reject
        </Button>
        <Button data-testid="approve-task-button" variant="contained" onClick={() => handleDecision('APPROVED')} disabled={loading || !feedback.trim()}>
          {loading ? 'Saving...' : 'Approve'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskReviewDialog;

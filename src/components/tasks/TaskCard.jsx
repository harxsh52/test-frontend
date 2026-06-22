import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import PersonIcon from '@mui/icons-material/Person';
import { Box, Chip, Divider, Paper, Rating, Stack, Typography } from '@mui/material';
import StatusChip from '../common/StatusChip';
import { formatDate } from '../../utils/dateUtils';

const priorityColors = {
  High: 'error',
  Medium: 'warning',
  Low: 'default',
  HIGH: 'error',
  MEDIUM: 'warning',
  LOW: 'default'
};

const TaskCard = ({ task, actions, internName }) => (
  <Paper
    data-testid={`task-card-${task.id}`}
    elevation={0}
    sx={{
      p: 3,
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2
    }}
  >
    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={2}>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, overflowWrap: 'anywhere' }}>
          {task.title}
        </Typography>
        {internName ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Intern: {internName}
          </Typography>
        ) : null}
      </Box>
      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.75, fontWeight: 700 }}>
          Status
        </Typography>
        <StatusChip status={task.status} />
      </Box>
    </Stack>

    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700 }}>
        Description
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, overflowWrap: 'anywhere' }}>
        {task.description}
      </Typography>
    </Box>

    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
      <Chip size="small" label={`Priority: ${task.priority}`} color={priorityColors[task.priority] || 'default'} />
      {task.submittedAt ? <Chip size="small" label={`Submitted: ${formatDate(task.submittedAt)}`} variant="outlined" /> : null}
    </Stack>

    <Stack spacing={1} sx={{ mt: 'auto' }}>
      <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
        <CalendarMonthIcon fontSize="small" />
        <Typography variant="body2">Due date: {formatDate(task.dueDate)}</Typography>
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
        <PersonIcon fontSize="small" />
        <Typography variant="body2">Assigned by: {task.assignedBy}</Typography>
      </Stack>
      {task.submissionLink ? (
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          Submission: {task.submissionLink}
        </Typography>
      ) : null}
      {task.submissionNote ? (
        <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
          Note: {task.submissionNote}
        </Typography>
      ) : null}
    </Stack>

    {task.managerFeedback ? (
      <>
        <Divider />
        <Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 700, mb: 0.75 }}>
            Manager Feedback
          </Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>{task.managerFeedback}</Typography>
          {task.rating ? <Rating value={Number(task.rating)} readOnly sx={{ mt: 1 }} /> : null}
        </Box>
      </>
    ) : null}

    {actions ? <Box>{actions}</Box> : null}
  </Paper>
);

export default TaskCard;

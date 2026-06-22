import { Chip } from '@mui/material';

const statusColors = {
  PRESENT: 'success',
  ABSENT: 'error',
  LATE: 'warning',
  COMPLETED: 'success',
  ASSIGNED: 'info',
  SUBMITTED: 'warning',
  APPROVED: 'success',
  REVIEWED: 'success',
  REJECTED: 'error',
  IN_PROGRESS: 'primary',
  PUNCHED_IN: 'primary',
  IN_REVIEW: 'warning',
  OPEN: 'default',
  BLOCKED: 'error',
  PENDING: 'warning',
  SCHEDULED: 'info',
  SCREENED: 'info',
  SHORTLISTED: 'success',
  INTERVIEW_SCHEDULED: 'secondary',
  HIRED: 'success',
  NEW: 'default',
  ACTIVE: 'success',
  INACTIVE: 'default',
  CANCELLED: 'default',
  HALF_DAY: 'warning',
  LEAVE: 'info',
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error',
  SICK_LEAVE: 'error',
  CASUAL_LEAVE: 'info',
  EMERGENCY_LEAVE: 'error',
  EXAM_LEAVE: 'secondary',
  WORK_FROM_HOME: 'primary',
  OFFER_LETTER: 'success',
  SELECTION_LETTER: 'info',
  REJECTION_LETTER: 'error',
  COMPLETION_CERTIFICATE: 'primary',
  EXPERIENCE_LETTER: 'secondary',
  GENERATED: 'info',
  SENT: 'success',
  DRAFT: 'default',
  ACCEPTED: 'success',
  NOT_FOUND: 'default'
};

const formatStatus = (status) => {
  if (!status) return '-';
  return status.replaceAll('_', ' ');
};

const StatusChip = ({ status, size = 'small', variant = 'filled' }) => (
  <Chip
    size={size}
    label={formatStatus(status)}
    color={statusColors[status] || 'default'}
    variant={variant}
    sx={{ fontWeight: 700, whiteSpace: 'nowrap' }}
  />
);

export default StatusChip;

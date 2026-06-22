import AccessTimeIcon from '@mui/icons-material/AccessTime';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import PeopleIcon from '@mui/icons-material/People';
import RateReviewIcon from '@mui/icons-material/RateReview';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import { Box } from '@mui/material';

const iconMap = {
  TASK: AssignmentIcon,
  ATTENDANCE: AccessTimeIcon,
  LEAVE: EventBusyIcon,
  FEEDBACK: RateReviewIcon,
  REPORT: AssessmentIcon,
  INTERVIEW: RecordVoiceOverIcon,
  RESUME_SCREENING: DescriptionIcon,
  USER_MANAGEMENT: PeopleIcon,
  DEPARTMENT: BusinessIcon,
  SYSTEM: SettingsIcon,
  SECURITY: SecurityIcon
};

const NotificationIcon = ({ type }) => {
  const Icon = iconMap[type] || SettingsIcon;

  return (
    <Box
      sx={{
        width: 36,
        height: 36,
        flex: '0 0 auto',
        borderRadius: 2,
        display: 'grid',
        placeItems: 'center',
        color: 'primary.main',
        bgcolor: 'rgba(37, 99, 235, 0.08)'
      }}
    >
      <Icon fontSize="small" />
    </Box>
  );
};

export default NotificationIcon;

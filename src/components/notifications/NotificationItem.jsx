import ArchiveIcon from '@mui/icons-material/Archive';
import DoneIcon from '@mui/icons-material/Done';
import {
  Box,
  Chip,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import NotificationIcon from './NotificationIcon';

const priorityColors = {
  LOW: 'default',
  MEDIUM: 'info',
  HIGH: 'warning',
  URGENT: 'error'
};

const statusColors = {
  UNREAD: 'primary',
  READ: 'default',
  ARCHIVED: 'default'
};

const formatLabel = (value) => value?.replaceAll('_', ' ') || '-';

const formatCreatedAt = (value) => {
  if (!value) return '';
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(value));
};

const NotificationItem = ({ notification, compact = false, onOpen, onMarkRead, onArchive }) => (
  <ListItem
    disablePadding
    secondaryAction={!compact ? (
      <Stack direction="row" spacing={0.5}>
        {notification.status === 'UNREAD' ? (
          <Tooltip title="Mark read">
            <IconButton edge="end" size="small" onClick={() => onMarkRead?.(notification)}>
              <DoneIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
        {notification.status !== 'ARCHIVED' ? (
          <Tooltip title="Archive">
            <IconButton edge="end" size="small" onClick={() => onArchive?.(notification)}>
              <ArchiveIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        ) : null}
      </Stack>
    ) : null}
    sx={{
      bgcolor: notification.status === 'UNREAD' ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
      borderBottom: '1px solid',
      borderColor: 'divider'
    }}
  >
    <ListItemButton onClick={() => onOpen?.(notification)} sx={{ alignItems: 'flex-start', gap: 1.5, py: compact ? 1.25 : 1.75 }}>
      <NotificationIcon type={notification.type} />
      <ListItemText
        primary={(
          <Stack spacing={0.75}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography sx={{ fontWeight: 850, lineHeight: 1.25 }}>{notification.title}</Typography>
              <Chip size="small" label={formatLabel(notification.type)} variant="outlined" />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {notification.message}
            </Typography>
          </Stack>
        )}
        secondary={(
          <Box sx={{ mt: 1 }}>
            <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
              <Chip size="small" label={notification.priority} color={priorityColors[notification.priority] || 'default'} variant="outlined" />
              <Chip size="small" label={notification.status} color={statusColors[notification.status] || 'default'} />
              <Typography variant="caption" color="text.secondary">
                {formatCreatedAt(notification.createdAt)}
              </Typography>
            </Stack>
          </Box>
        )}
      />
    </ListItemButton>
  </ListItem>
);

export default NotificationItem;

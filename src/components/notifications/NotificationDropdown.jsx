import DoneAllIcon from '@mui/icons-material/DoneAll';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { Box, Button, Divider, List, Menu, Stack, Typography } from '@mui/material';
import EmptyState from '../common/EmptyState';
import Loader from '../common/Loader';
import NotificationItem from './NotificationItem';

const NotificationDropdown = ({
  anchorEl,
  open,
  onClose,
  notifications = [],
  loading = false,
  onOpenNotification,
  onMarkAllRead,
  onViewAll
}) => (
  <Menu
    anchorEl={anchorEl}
    open={open}
    onClose={onClose}
    PaperProps={{
      sx: {
        width: { xs: 340, sm: 420 },
        maxWidth: 'calc(100vw - 24px)',
        borderRadius: 2
      }
    }}
  >
    <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 2, py: 1.5 }}>
      <Typography sx={{ fontWeight: 850 }}>Notifications</Typography>
      <Button size="small" startIcon={<DoneAllIcon />} onClick={onMarkAllRead}>
        Mark All Read
      </Button>
    </Stack>
    <Divider />
    <Box sx={{ maxHeight: 420, overflowY: 'auto' }}>
      {loading ? (
        <Loader minHeight={180} />
      ) : notifications.length ? (
        <List disablePadding>
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              compact
              onOpen={onOpenNotification}
            />
          ))}
        </List>
      ) : (
        <Box sx={{ p: 2 }}>
          <EmptyState compact title="No notifications" message="New updates will appear here." />
        </Box>
      )}
    </Box>
    <Divider />
    <Box sx={{ p: 1.5 }}>
      <Button fullWidth variant="outlined" startIcon={<OpenInFullIcon />} onClick={onViewAll}>
        View All
      </Button>
    </Box>
  </Menu>
);

export default NotificationDropdown;

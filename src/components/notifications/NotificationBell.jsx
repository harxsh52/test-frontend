import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton, Tooltip } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/notificationService';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const [records, count] = await Promise.all([
        notificationService.getMyNotifications(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(records);
      setUnreadCount(count);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();

    const intervalId = window.setInterval(async () => {
      try {
        setUnreadCount(await notificationService.getUnreadCount());
      } catch {
        setUnreadCount(0);
      }
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  const handleOpenBell = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleOpenNotification = async (notification) => {
    if (notification.status === 'UNREAD') {
      await notificationService.markAsRead(notification.id);
    }
    setAnchorEl(null);
    await loadNotifications();
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  const handleMarkAllRead = async () => {
    await notificationService.markAllAsRead();
    await loadNotifications();
  };

  const latestNotifications = notifications
    .filter((notification) => notification.status !== 'ARCHIVED')
    .slice(0, 5);

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton color="inherit" onClick={handleOpenBell}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>
      <NotificationDropdown
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        notifications={latestNotifications}
        loading={loading}
        onOpenNotification={handleOpenNotification}
        onMarkAllRead={handleMarkAllRead}
        onViewAll={() => {
          setAnchorEl(null);
          navigate('/notifications');
        }}
      />
    </>
  );
};

export default NotificationBell;

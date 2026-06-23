import AddCircleIcon from '@mui/icons-material/AddCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DescriptionIcon from '@mui/icons-material/Description';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import FeedbackIcon from '@mui/icons-material/Feedback';
import GroupIcon from '@mui/icons-material/Group';
import LogoutIcon from '@mui/icons-material/Logout';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ReviewsIcon from '@mui/icons-material/Reviews';
import SettingsIcon from '@mui/icons-material/Settings';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import WorkIcon from '@mui/icons-material/Work';
import { Box, Button, Divider, Drawer, List, ListItemButton, ListItemIcon, ListItemText, Stack, Toolbar, Typography } from '@mui/material';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getNavigationForRole } from '../../config/navigationConfig';
import { roleLabels } from '../../utils/roleUtils';

const iconMap = {
  AddCircle: AddCircleIcon,
  AdminPanelSettings: AdminPanelSettingsIcon,
  Assessment: AssessmentIcon,
  Assignment: AssignmentIcon,
  AssignmentTurnedIn: AssignmentTurnedInIcon,
  Badge: BadgeIcon,
  Business: BusinessIcon,
  Dashboard: DashboardIcon,
  Description: DescriptionIcon,
  EventAvailable: EventAvailableIcon,
  EventBusy: EventBusyIcon,
  FactCheck: FactCheckIcon,
  Feedback: FeedbackIcon,
  Group: GroupIcon,
  ManageAccounts: ManageAccountsIcon,
  Notifications: NotificationsIcon,
  NotificationsActive: NotificationsActiveIcon,
  PersonAdd: PersonAddIcon,
  Psychology: PsychologyIcon,
  Reviews: ReviewsIcon,
  Settings: SettingsIcon,
  SmartToy: SmartToyIcon,
  Work: WorkIcon
};

const SidebarContent = ({ onNavigate }) => {
  const { user, logout } = useAuth();
  const menuItems = getNavigationForRole(user?.role, user?.permissions);

  return (
    <Box sx={{ height: '100%', bgcolor: '#101827', color: '#f9fafb', display: 'flex', flexDirection: 'column' }}>
      <Toolbar sx={{ px: 3, minHeight: 72 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            InternIQ
          </Typography>
        </Box>
      </Toolbar>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <List sx={{ px: 1.5, py: 2, overflowY: 'auto', flex: 1 }}>
        {menuItems.map((item) => {
          const Icon = iconMap[item.icon] || DashboardIcon;

          return (
            <ListItemButton
              key={item.path}
              component={NavLink}
              to={item.path}
              onClick={onNavigate}
              sx={{
                mb: 0.5,
                borderRadius: 1.5,
                color: '#d1d5db',
                minHeight: 44,
                '& .MuiListItemIcon-root': { color: 'inherit', minWidth: 38 },
                '&.active': {
                  color: '#ffffff',
                  bgcolor: 'rgba(37, 99, 235, 0.9)'
                },
                '&:hover': {
                  bgcolor: 'rgba(255,255,255,0.08)'
                }
              }}
            >
              <ListItemIcon>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 650, noWrap: true }}
              />
            </ListItemButton>
          );
        })}
      </List>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
      <Stack sx={{ p: 1.5 }}>
        <Button
          startIcon={<LogoutIcon />}
          onClick={logout}
          sx={{ justifyContent: 'flex-start', color: '#d1d5db', borderRadius: 1.5, py: 1.2 }}
        >
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

const Sidebar = ({ drawerWidth, mobileOpen, onClose }) => (
  <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': { width: { xs: Math.min(drawerWidth, 300), sm: drawerWidth }, boxSizing: 'border-box' }
      }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>
    <Drawer
      variant="permanent"
      open
      sx={{
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box', borderRight: 0 }
      }}
    >
      <SidebarContent />
    </Drawer>
  </Box>
);

export default Sidebar;

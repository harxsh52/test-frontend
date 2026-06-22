import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import { AppBar, Avatar, Box, Chip, IconButton, ListItemIcon, Menu, MenuItem, Tooltip, Toolbar, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { roleLabels } from '../../utils/roleUtils';
import NotificationBell from '../notifications/NotificationBell';

const Navbar = ({ drawerWidth, onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileAnchor, setProfileAnchor] = useState(null);

  const profilePath = user?.role ? `/${String(user.role).toLowerCase()}/profile` : '/change-password';

  const closeProfileMenu = () => setProfileAnchor(null);

  const handleLogout = async () => {
    closeProfileMenu();
    await logout();
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={0}
      sx={{
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(10px)',
        width: { md: `calc(100% - ${drawerWidth}px)` },
        ml: { md: `${drawerWidth}px` }
      }}
    >
      <Toolbar sx={{ gap: { xs: 1, sm: 2 }, minHeight: { xs: 64, sm: 72 } }}>
        <Tooltip title="Open navigation">
          <IconButton color="inherit" edge="start" onClick={onToggleSidebar} sx={{ display: { md: 'none' } }}>
            <MenuIcon />
          </IconButton>
        </Tooltip>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
            InternIQ
          </Typography>
        </Box>
        <Box sx={{ display: { xs: 'none', sm: 'flex' }, alignItems: 'center', gap: 1.5 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {user?.name}
          </Typography>
          <Chip size="small" label={roleLabels[user?.role] || user?.role} color="primary" variant="outlined" />
        </Box>
        <NotificationBell />
        <Tooltip title="Profile">
          <IconButton color="inherit" onClick={(event) => setProfileAnchor(event.currentTarget)}>
            <Avatar sx={{ width: 34, height: 34, fontSize: 14, fontWeight: 800 }}>
              {user?.name?.[0] || 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>
        <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={closeProfileMenu}>
          <MenuItem
            onClick={() => {
              closeProfileMenu();
              navigate(profilePath);
            }}
          >
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            Profile
          </MenuItem>
          <MenuItem
            onClick={() => {
              closeProfileMenu();
              navigate('/change-password');
            }}
          >
            Change Password
          </MenuItem>
          <MenuItem onClick={handleLogout}>
            <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

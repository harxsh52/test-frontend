import { Box, Container, Toolbar } from '@mui/material';
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const drawerWidth = 260;

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f7fb' }}>
      <Navbar drawerWidth={drawerWidth} onToggleSidebar={() => setMobileOpen((open) => !open)} />
      <Sidebar drawerWidth={drawerWidth} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1, minWidth: 0, width: { md: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2.5, md: 4 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;

import SearchOffIcon from '@mui/icons-material/SearchOff';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';

const NotFound = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fb', px: 2, py: 4 }}>
      <Paper elevation={0} sx={{ maxWidth: 520, p: { xs: 3, sm: 4 }, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <SearchOffIcon color="primary" sx={{ fontSize: 52, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Page not found
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          The page you opened does not exist in InternIQ.
        </Typography>
        <Button component={RouterLink} to={isAuthenticated ? getDashboardPath(user?.role) : '/login'} variant="contained" sx={{ minWidth: 160 }}>
          Back Home
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;

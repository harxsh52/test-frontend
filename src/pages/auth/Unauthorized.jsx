import BlockIcon from '@mui/icons-material/Block';
import { Box, Button, Paper, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';

const Unauthorized = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fb', px: 2, py: 4 }}>
      <Paper elevation={0} sx={{ maxWidth: 520, p: { xs: 3, sm: 4 }, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <BlockIcon color="error" sx={{ fontSize: 52, mb: 2 }} />
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
          Unauthorized
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 3 }}>
          Your role does not have access to this page.
        </Typography>
        <Button component={RouterLink} to={getDashboardPath(user?.role)} variant="contained" sx={{ minWidth: 160 }}>
          Go to Dashboard
        </Button>
      </Paper>
    </Box>
  );
};

export default Unauthorized;

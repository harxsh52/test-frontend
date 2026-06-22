import BlockIcon from '@mui/icons-material/Block';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';

const Forbidden = () => {
  const { user } = useAuth();

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fb', px: 2 }}>
      <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 520, textAlign: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <BlockIcon color="error" sx={{ fontSize: 52 }} />
          <Typography variant="h4" sx={{ fontWeight: 850 }}>Access Forbidden</Typography>
          <Typography color="text.secondary">You are logged in, but your role does not have permission to open this page.</Typography>
          <Button component={RouterLink} to={getDashboardPath(user?.role)} variant="contained">Go to Dashboard</Button>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Forbidden;

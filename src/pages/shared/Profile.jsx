import { Avatar, Box, Chip, Paper, Stack, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { roleLabels } from '../../utils/roleUtils';

const Profile = () => {
  const { user } = useAuth();

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Your signed-in account details." />
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
          <Avatar sx={{ width: 76, height: 76, fontWeight: 900 }}>{user?.name?.[0] || 'U'}</Avatar>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 850 }}>{user?.name || '-'}</Typography>
            <Typography color="text.secondary">{user?.email || '-'}</Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
              <Chip label={roleLabels[user?.role] || user?.role || 'User'} color="primary" variant="outlined" />
              {user?.department ? <Chip label={user.department} /> : null}
              {user?.manager ? <Chip label={`Manager: ${user.manager}`} /> : null}
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Profile;

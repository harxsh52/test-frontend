import { Box, Grid, Paper, Typography } from '@mui/material';
import PageHeader from '../../components/common/PageHeader';
import { ROLES } from '../../utils/roles';
import { roleLabels } from '../../utils/roleUtils';

const roleDescriptions = {
  [ROLES.INTERN]: 'Personal dashboard, attendance, tasks, feedback, profile.',
  [ROLES.MANAGER]: 'Intern oversight, task assignment, task review.',
  [ROLES.HR]: 'Candidate pipeline, intern onboarding, resume screening.',
  [ROLES.ADMIN]: 'Users, departments, role management, settings.'
};

const Roles = () => (
  <Box>
    <PageHeader title="Roles" subtitle="Role boundaries used by route protection and backend authorization." />
    <Grid container spacing={3}>
      {Object.values(ROLES).map((role) => (
        <Grid item xs={12} md={3} key={role}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
              {roleLabels[role]}
            </Typography>
            <Typography color="text.secondary">{roleDescriptions[role]}</Typography>
          </Paper>
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default Roles;

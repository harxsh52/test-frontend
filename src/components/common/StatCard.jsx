import { Box, Paper, Typography } from '@mui/material';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary.main' }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2.25, sm: 2.5 },
      height: '100%',
      minHeight: 132,
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      backgroundColor: 'background.paper',
      transition: 'border-color 160ms ease, box-shadow 160ms ease, transform 160ms ease',
      '&:hover': {
        borderColor: 'primary.light',
        boxShadow: '0 14px 34px rgba(15, 23, 42, 0.08)',
        transform: 'translateY(-1px)'
      }
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', height: '100%' }}>
      <Box sx={{ minWidth: 0 }}>
        <Typography color="text.secondary" variant="body2" sx={{ mb: 1, fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 850, lineHeight: 1.1, overflowWrap: 'anywhere' }}>
          {value}
        </Typography>
        {subtitle ? (
          <Typography color="text.secondary" variant="body2" sx={{ mt: 1, lineHeight: 1.45 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {Icon ? (
        <Box
          sx={{
            width: 42,
            height: 42,
            borderRadius: 2,
            flex: '0 0 auto',
            display: 'grid',
            placeItems: 'center',
            color,
            bgcolor: 'rgba(37, 99, 235, 0.08)'
          }}
        >
          <Icon fontSize="small" />
        </Box>
      ) : null}
    </Box>
  </Paper>
);

export default StatCard;

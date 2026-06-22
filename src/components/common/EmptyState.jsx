import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

const EmptyState = ({
  title = 'No data yet',
  message = 'Records will appear here once they are available.',
  icon: Icon = InboxOutlinedIcon,
  actionLabel,
  onAction,
  actionProps = {},
  compact = false
}) => (
  <Paper
    elevation={0}
    sx={{
      p: compact ? 2.5 : { xs: 3, sm: 4 },
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      bgcolor: 'background.paper'
    }}
  >
    <Stack spacing={1.5} alignItems="center" textAlign="center">
      <Box
        sx={{
          width: compact ? 42 : 52,
          height: compact ? 42 : 52,
          display: 'grid',
          placeItems: 'center',
          borderRadius: 2,
          color: 'primary.main',
          bgcolor: 'rgba(37, 99, 235, 0.08)'
        }}
      >
        <Icon fontSize={compact ? 'small' : 'medium'} />
      </Box>
      <Box>
        <Typography variant={compact ? 'subtitle1' : 'h6'} sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5, maxWidth: 460 }}>
          {message}
        </Typography>
      </Box>
      {actionLabel ? (
        <Button variant="contained" onClick={onAction} {...actionProps}>
          {actionLabel}
        </Button>
      ) : null}
    </Stack>
  </Paper>
);

export default EmptyState;

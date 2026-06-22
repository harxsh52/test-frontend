import { Box, CircularProgress, Stack, Typography } from '@mui/material';

const Loader = ({ minHeight = 240, label = 'Loading...' }) => (
  <Box sx={{ minHeight, display: 'grid', placeItems: 'center', px: 2 }}>
    <Stack spacing={1.5} alignItems="center">
      <CircularProgress size={34} thickness={4} />
      {label ? (
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
      ) : null}
    </Stack>
  </Box>
);

export default Loader;

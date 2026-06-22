import { Box, Stack, Typography } from '@mui/material';

const PageHeader = ({ title, subtitle, actions }) => (
  <Stack
    spacing={2}
    alignItems="center"
    justifyContent="center"
    sx={{
      width: '100%',
      mb: { xs: 3, sm: 4 },
      textAlign: 'center'
    }}
  >
    <Box
      sx={{
        width: '100%',
        maxWidth: 820,
        mx: 'auto',
        px: { xs: 1.5, sm: 2 }
      }}
    >
      <Typography
        component="h1"
        sx={{
          fontWeight: 900,
          letterSpacing: '-0.04em',
          lineHeight: 1.15,
          color: '#111827',
          fontSize: {
            xs: '28px',
            sm: '34px',
            md: '40px'
          }
        }}
      >
        {title}
      </Typography>

      {subtitle ? (
        <Typography
          color="text.secondary"
          sx={{
            mt: 1,
            maxWidth: 680,
            mx: 'auto',
            lineHeight: 1.6,
            fontSize: {
              xs: '14px',
              sm: '15px',
              md: '16px'
            }
          }}
        >
          {subtitle}
        </Typography>
      ) : null}
    </Box>

    {actions ? (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          width: '100%'
        }}
      >
        {actions}
      </Box>
    ) : null}
  </Stack>
);

export default PageHeader;
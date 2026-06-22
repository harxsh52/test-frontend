import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { Box, Button, Divider, Paper, Stack, Typography } from '@mui/material';
import { formatDate } from '../../utils/dateUtils';

const LetterPreview = ({ letter, onCopy }) => {
  if (!letter) return null;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, md: 4 },
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'background.paper'
      }}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={2}>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 900 }}>{letter.companyName || 'InternIQ'}</Typography>
            <Typography color="text.secondary">{formatDate(letter.createdAt || new Date())}</Typography>
          </Box>
          {onCopy ? (
            <Button startIcon={<ContentCopyIcon />} onClick={() => onCopy(letter.bodyText)} variant="outlined">
              Copy Text
            </Button>
          ) : null}
        </Stack>
        <Divider />
        <Box>
          <Typography variant="overline" color="text.secondary">Subject</Typography>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>{letter.subject}</Typography>
        </Box>
        <Box
          sx={{
            whiteSpace: 'pre-wrap',
            lineHeight: 1.75,
            color: 'text.primary',
            fontSize: 15
          }}
        >
          {letter.bodyText}
        </Box>
      </Stack>
    </Paper>
  );
};

export default LetterPreview;

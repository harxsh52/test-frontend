import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';

const ConfirmDialog = ({
  open,
  title = 'Confirm action',
  message = 'Are you sure you want to continue?',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = 'primary',
  loading = false,
  onClose,
  onConfirm
}) => (
  <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="xs">
    <DialogTitle sx={{ pb: 1 }}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 38,
            height: 38,
            display: 'grid',
            placeItems: 'center',
            borderRadius: 2,
            bgcolor: 'rgba(245, 158, 11, 0.12)',
            color: 'warning.main'
          }}
        >
          <WarningAmberIcon fontSize="small" />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {title}
        </Typography>
      </Stack>
    </DialogTitle>
    <DialogContent>
      <Typography color="text.secondary">{message}</Typography>
    </DialogContent>
    <DialogActions sx={{ px: 3, pb: 3 }}>
      <Button onClick={onClose} disabled={loading}>
        {cancelLabel}
      </Button>
      <Button variant="contained" color={confirmColor} onClick={onConfirm} disabled={loading}>
        {loading ? 'Working...' : confirmLabel}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;

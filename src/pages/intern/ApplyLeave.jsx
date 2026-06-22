import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { leaveService, leaveTypes } from '../../services/leaveService';
import { getTodayKey } from '../../utils/dateUtils';

const labelFor = (value) => value.replaceAll('_', ' ');

const ApplyLeave = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    leaveType: 'SICK_LEAVE',
    startDate: getTodayKey(),
    endDate: getTodayKey(),
    reason: ''
  });

  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (field) => (event) => {
    const value = event.target.value;

    setForm((current) => {
      const next = {
        ...current,
        [field]: value
      };

      if (field === 'leaveType' && value === 'HALF_DAY') {
        next.endDate = next.startDate;
      }

      if (field === 'startDate' && current.leaveType === 'HALF_DAY') {
        next.endDate = value;
      }

      return next;
    });

    setErrors((current) => ({
      ...current,
      [field]: ''
    }));
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.reason.trim()) {
      nextErrors.reason = 'Reason is required.';
    }

    if (form.startDate > form.endDate) {
      nextErrors.endDate = 'End date cannot be before start date.';
    }

    if (form.leaveType === 'HALF_DAY' && form.startDate !== form.endDate) {
      nextErrors.endDate = 'Half-day leave must use one date.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validate()) return;

    setLoading(true);

    try {
      await leaveService.createLeaveRequest(form);

      setSnackbar({
        open: true,
        message: 'Leave request submitted successfully.',
        severity: 'success'
      });

      setTimeout(() => {
        navigate('/intern/leaves');
      }, 700);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || 'Failed to submit leave request.',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 140px)',
        width: '100%',
        display: 'grid',
        placeItems: 'center',
        px: { xs: 1.5, sm: 2 },
        py: { xs: 3, sm: 4 },
        animation: 'leavePageIn 0.35s ease both',
        '@keyframes leavePageIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)'
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <Stack
        spacing={3}
        alignItems="center"
        sx={{
          width: '100%',
          maxWidth: 760,
          mx: 'auto',
          textAlign: 'center'
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: '-0.04em',
              color: '#111827'
            }}
          >
            Apply Leave
          </Typography>

          <Typography
            sx={{
              mt: 0.8,
              color: 'text.secondary',
              fontSize: 15
            }}
          >
            Submit your leave request for manager review.
          </Typography>
        </Box>

        <Paper
          component="form"
          onSubmit={handleSubmit}
          noValidate
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 680,
            mx: 'auto',
            p: { xs: 2.5, sm: 3.5 },
            border: '1px solid',
            borderColor: 'rgba(148, 163, 184, 0.24)',
            borderRadius: 4,
            boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
            bgcolor: '#ffffff'
          }}
        >
          <Stack spacing={3} alignItems="center">
            <Box
              sx={{
                width: '100%',
                p: 2,
                borderRadius: 3,
                bgcolor: '#eff6ff',
                border: '1px solid #dbeafe',
                textAlign: 'center'
              }}
            >
              <Stack spacing={1} alignItems="center">
                <InfoOutlinedIcon sx={{ color: '#2563eb' }} />

                <Typography sx={{ fontWeight: 850, color: '#1e3a8a' }}>
                  Leave request
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#475569',
                    maxWidth: 520,
                    mx: 'auto',
                    lineHeight: 1.6
                  }}
                >
                  Select your leave type, choose dates, and write a clear reason.
                  Your manager will review it after submission.
                </Typography>
              </Stack>
            </Box>

            <Stack spacing={2.5} alignItems="center" sx={{ width: '100%' }}>
              <TextField
                select
                label="Leave type"
                value={form.leaveType}
                onChange={handleChange('leaveType')}
                fullWidth
              >
                {leaveTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {labelFor(type)}
                  </MenuItem>
                ))}
              </TextField>

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                sx={{ width: '100%' }}
              >
                <TextField
                  label="Start date"
                  type="date"
                  value={form.startDate}
                  onChange={handleChange('startDate')}
                  inputProps={{ min: getTodayKey() }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  label="End date"
                  type="date"
                  value={form.endDate}
                  onChange={handleChange('endDate')}
                  inputProps={{ min: form.startDate }}
                  InputLabelProps={{ shrink: true }}
                  error={Boolean(errors.endDate)}
                  helperText={errors.endDate}
                  disabled={form.leaveType === 'HALF_DAY'}
                  fullWidth
                />
              </Stack>

              {form.leaveType === 'HALF_DAY' && (
                <Chip
                  label="Half-day leave uses only one selected date"
                  color="primary"
                  variant="outlined"
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2
                  }}
                />
              )}

              <TextField
                label="Reason"
                value={form.reason}
                onChange={handleChange('reason')}
                multiline
                minRows={5}
                error={Boolean(errors.reason)}
                helperText={errors.reason || `${form.reason.length}/500 characters`}
                inputProps={{ maxLength: 500 }}
                placeholder="Example: I am not feeling well and need leave for recovery."
                fullWidth
              />

              <Stack
                direction={{ xs: 'column-reverse', sm: 'row' }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
                sx={{ width: '100%', pt: 1 }}
              >
                <Button
                  variant="outlined"
                  disabled={loading}
                  onClick={() => navigate('/intern/leaves')}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    minHeight: 44,
                    fontWeight: 800,
                    minWidth: 150
                  }}
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<EventBusyIcon />}
                  disabled={loading}
                  sx={{
                    borderRadius: 2,
                    px: 4,
                    minHeight: 44,
                    fontWeight: 850,
                    minWidth: 220,
                    boxShadow: '0 14px 28px rgba(37, 99, 235, 0.25)'
                  }}
                >
                  {loading ? 'Submitting...' : 'Submit Leave Request'}
                </Button>
              </Stack>
            </Stack>
          </Stack>
        </Paper>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() =>
          setSnackbar((current) => ({
            ...current,
            open: false
          }))
        }
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplyLeave;

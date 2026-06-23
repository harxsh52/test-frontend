import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { Alert, Avatar, Box, Button, Container, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { isEmail, required } from '../../utils/validation';
import '../../css/forgotPassword.css';

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const validationError = required(email, 'Email') || (!isEmail(email) ? 'Enter a valid email address.' : '');

    if (validationError) {
      setFieldError(validationError);
      return;
    }

    setLoading(true);

    try {
      await authService.forgotPassword(email);

      setSuccess('Reset instructions sent successfully.');
      setShowSuccessAnimation(true);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (forgotError) {
      setError(forgotError.message || 'Failed to send reset instructions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fb', px: 2, py: 4 }}>
      {showSuccessAnimation ? (
        <div className="forgot-success-overlay">
          <div className="forgot-success-card">
            <div className="forgot-success-icon">
              <CheckCircleIcon />
            </div>

            <h2 className="forgot-success-title">Reset Link Sent</h2>
            <p className="forgot-success-text">Check your email. Redirecting to login...</p>
          </div>
        </div>
      ) : null}

      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
              <LockResetIcon />
            </Avatar>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>
                Forgot Password
              </Typography>
              <Typography color="text.secondary">
                Enter your email to request a reset link.
              </Typography>
            </Box>

            <ErrorMessage message={error} />

            {success ? <Alert severity="success">{success}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  label="Email"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setFieldError('');
                  }}
                  error={Boolean(fieldError)}
                  helperText={fieldError}
                  fullWidth
                  disabled={loading || showSuccessAnimation}
                />

                <Button type="submit" variant="contained" disabled={loading || showSuccessAnimation} size="large">
                  {loading ? 'Sending...' : 'Send Reset Instructions'}
                </Button>

                <Button component={RouterLink} to="/login" disabled={loading || showSuccessAnimation}>
                  Back to Login
                </Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
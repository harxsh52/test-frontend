import LockResetIcon from '@mui/icons-material/LockReset';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Container,
  Paper,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { Link as RouterLink, useNavigate, useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { validateStrongPassword } from '../../utils/passwordValidation';
import '../../css/resetPassword.css';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState('');
  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  useEffect(() => {
    const urlToken = searchParams.get('token') || '';

    if (urlToken) {
      setToken(urlToken);

      // Hide token from browser URL after reading it
      window.history.replaceState({}, document.title, '/reset-password');
    }
  }, [searchParams]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    const nextErrors = {
      newPassword: validateStrongPassword(formData.newPassword),
      confirmPassword:
        formData.newPassword === formData.confirmPassword ? '' : 'Passwords do not match.'
    };

    if (!token) {
      nextErrors.token = 'Reset token is missing.';
    }

    if (nextErrors.newPassword || nextErrors.confirmPassword || nextErrors.token) {
      setFormErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      await authService.resetPassword({
        token,
        newPassword: formData.newPassword
      });

      setSuccess('Password reset successfully. Please login again.');
      setShowSuccessAnimation(true);

      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } catch (resetError) {
      setError(resetError.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const update = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));

    setFormErrors((current) => ({
      ...current,
      [event.target.name]: ''
    }));
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: '#f5f7fb',
        px: 2,
        py: 4
      }}
    >
      {showSuccessAnimation ? (
        <div className="reset-success-overlay">
  <div className="reset-success-card">
    <div className="reset-success-icon">
      <CheckCircleIcon />
    </div>

    <h2 className="reset-success-title">Password Changed</h2>
    <p className="reset-success-text">Redirecting to login...</p>
  </div>
</div>
      ) : null}

      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 3, sm: 4 },
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Stack spacing={2.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}>
              <LockResetIcon />
            </Avatar>

            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Reset Password
            </Typography>

            <ErrorMessage message={error || formErrors.token} />

            {success ? <Alert severity="success">{success}</Alert> : null}

            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField
                  label="New password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={update}
                  error={Boolean(formErrors.newPassword)}
                  helperText={
                    formErrors.newPassword ||
                    'Use uppercase, lowercase, number, and special character.'
                  }
                  fullWidth
                  disabled={loading || showSuccessAnimation}
                />

                <TextField
                  label="Confirm password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={update}
                  error={Boolean(formErrors.confirmPassword)}
                  helperText={formErrors.confirmPassword}
                  fullWidth
                  disabled={loading || showSuccessAnimation}
                />

                <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !token || showSuccessAnimation}
                  size="large"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>

                <Button
                  component={RouterLink}
                  to="/login"
                  disabled={loading || showSuccessAnimation}
                >
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

export default ResetPassword;
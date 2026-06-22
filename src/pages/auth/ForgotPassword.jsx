import LockResetIcon from '@mui/icons-material/LockReset';
import { Avatar, Box, Button, Container, Paper, Stack, TextField, Typography, Alert } from '@mui/material';
import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { authService } from '../../services/authService';
import { isEmail, required } from '../../utils/validation';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

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
      setSuccess('If this email exists, reset instructions have been sent.');
    } catch (forgotError) {
      setError(forgotError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center', bgcolor: '#f5f7fb', px: 2, py: 4 }}>
      <Container maxWidth="xs">
        <Paper elevation={0} sx={{ p: { xs: 3, sm: 4 }, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={2.5} alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', width: 52, height: 52 }}><LockResetIcon /></Avatar>
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" sx={{ fontWeight: 800 }}>Forgot Password</Typography>
              <Typography color="text.secondary">Enter your email to request a reset link.</Typography>
            </Box>
            <ErrorMessage message={error} />
            {success ? <Alert severity="success">{success}</Alert> : null}
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                <TextField label="Email" value={email} onChange={(event) => { setEmail(event.target.value); setFieldError(''); }} error={Boolean(fieldError)} helperText={fieldError} fullWidth />
                <Button type="submit" variant="contained" disabled={loading} size="large">{loading ? 'Sending...' : 'Send Reset Instructions'}</Button>
                <Button component={RouterLink} to="/login">Back to Login</Button>
              </Stack>
            </Box>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default ForgotPassword;

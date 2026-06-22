import { Alert, Box, Button, Paper, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { validateStrongPassword } from '../../utils/passwordValidation';

const ChangePassword = () => {
  const { logout } = useAuth();
  const [formData, setFormData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const nextErrors = {
      currentPassword: formData.currentPassword ? '' : 'Current password is required.',
      newPassword: validateStrongPassword(formData.newPassword),
      confirmPassword: formData.newPassword === formData.confirmPassword ? '' : 'Passwords do not match.'
    };
    if (nextErrors.currentPassword || nextErrors.newPassword || nextErrors.confirmPassword) {
      setFormErrors(nextErrors);
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword: formData.currentPassword, newPassword: formData.newPassword });
      setSuccess('Password changed successfully. Please login again.');
      await logout();
    } catch (changeError) {
      setError(changeError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Change Password" subtitle="Update your password. All active sessions will be revoked." />
      <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 560 }}>
        <ErrorMessage message={error} />
        {success ? <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert> : null}
        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField label="Current password" name="currentPassword" type="password" value={formData.currentPassword} onChange={update} error={Boolean(formErrors.currentPassword)} helperText={formErrors.currentPassword} fullWidth />
            <TextField label="New password" name="newPassword" type="password" value={formData.newPassword} onChange={update} error={Boolean(formErrors.newPassword)} helperText={formErrors.newPassword || 'Use uppercase, lowercase, number, and special character.'} fullWidth />
            <TextField label="Confirm password" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={update} error={Boolean(formErrors.confirmPassword)} helperText={formErrors.confirmPassword} fullWidth />
            <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</Button>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChangePassword;

import EmailIcon from '@mui/icons-material/Email';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import SettingsSuggestIcon from '@mui/icons-material/SettingsSuggest';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  Paper,
  Snackbar,
  Stack,
  Switch,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import adminService from '../../services/adminService';
import { notificationService } from '../../services/notificationService';
import { isEmail, required } from '../../utils/validation';

const Settings = () => {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [systemSettings, setSystemSettings] = useState([]);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState('');
  const [emailSettings, setEmailSettings] = useState(null);
  const [emailLoading, setEmailLoading] = useState(true);
  const [emailError, setEmailError] = useState('');
  const [testRecipient, setTestRecipient] = useState(user?.email || '');
  const [testRecipientError, setTestRecipientError] = useState('');
  const [sendingTestEmail, setSendingTestEmail] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadEmailSettings = async () => {
      try {
        const [settings, emailConfig] = await Promise.all([
          adminService.getSettings(),
          notificationService.getEmailSettings()
        ]);
        if (mounted) {
          setSystemSettings(settings);
          setEmailSettings(emailConfig);
          setSettingsError('');
          setEmailError('');
        }
      } catch (settingsError) {
        if (mounted) {
          setSettingsError(settingsError.message);
          setEmailError(settingsError.message);
        }
      } finally {
        if (mounted) {
          setSettingsLoading(false);
          setEmailLoading(false);
        }
      }
    };

    loadEmailSettings();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const saved = await adminService.updateSettings(systemSettings);
      setSystemSettings(saved);
      setSnackbar({ open: true, message: 'System settings saved.', severity: 'success' });
    } catch (saveError) {
      setSnackbar({ open: true, message: saveError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestEmail = async () => {
    const validationMessage = required(testRecipient, 'Recipient email') || (isEmail(testRecipient) ? '' : 'Recipient email must be valid.');

    if (validationMessage) {
      setTestRecipientError(validationMessage);
      return;
    }

    setSendingTestEmail(true);
    setTestRecipientError('');

    try {
      await notificationService.sendTestEmail(testRecipient.trim());
      const message = emailSettings?.realEmailEnabled
        ? 'Test email sent. Check the recipient inbox or SMTP provider logs.'
        : 'Mock test email processed. Backend logs will show the mock email.';
      setSnackbar({ open: true, message, severity: 'success' });
    } catch (testEmailError) {
      setSnackbar({ open: true, message: testEmailError.message, severity: 'error' });
    } finally {
      setSendingTestEmail(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Settings" subtitle="Workspace settings, feature toggles, and backend notification status." />
      <Stack spacing={3}>
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 900 }}>
          <Stack spacing={2}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              System Settings
            </Typography>
            <ErrorMessage message={settingsError} />
            {settingsLoading ? (
              <Loader />
            ) : (
              systemSettings.map((setting, index) => (
                <Grid container spacing={2} key={setting.key} alignItems="center">
                  <Grid item xs={12} md={4}>
                    <TextField label="Key" value={setting.key} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      label="Value"
                      value={setting.value || ''}
                      fullWidth
                      onChange={(event) => setSystemSettings((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, value: event.target.value } : item))}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      label="Description"
                      value={setting.description || ''}
                      fullWidth
                      onChange={(event) => setSystemSettings((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, description: event.target.value } : item))}
                    />
                  </Grid>
                </Grid>
              ))
            )}
            <FormControlLabel control={<Switch checked disabled />} label="JWT auth enforced for Admin APIs" />
            <Button variant="contained" startIcon={<SaveIcon />} sx={{ alignSelf: 'flex-start' }} onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Stack spacing={2.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Email Notifications
                </Typography>
                <Typography color="text.secondary">
                  Email is configured on the backend through environment variables. SMTP secrets are never shown in the browser.
                </Typography>
              </Box>
              {emailSettings ? (
                <Chip
                  icon={<EmailIcon />}
                  color={emailSettings.realEmailEnabled ? 'success' : 'info'}
                  label={emailSettings.realEmailEnabled ? 'Real SMTP enabled' : 'Mock email mode'}
                  sx={{ fontWeight: 700 }}
                />
              ) : null}
            </Stack>

            <ErrorMessage message={emailError} />

            {emailLoading ? (
              <Loader />
            ) : emailSettings ? (
              <>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="Provider" value={emailSettings.provider || 'MOCK'} icon={EmailIcon} color={emailSettings.realEmailEnabled ? 'success.main' : 'info.main'} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="SMTP Host" value={emailSettings.smtpHost || 'Not configured'} icon={SettingsSuggestIcon} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="SMTP Port" value={emailSettings.smtpPort || '-'} icon={SettingsSuggestIcon} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <StatCard title="StartTLS" value={emailSettings.smtpStartTls ? 'Enabled' : 'Off'} icon={SettingsSuggestIcon} color={emailSettings.smtpStartTls ? 'success.main' : 'text.secondary'} />
                  </Grid>
                </Grid>

                <Divider />

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <TextField label="From email" value={emailSettings.fromEmail || ''} fullWidth disabled />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField label="App URL" value={emailSettings.appUrl || ''} fullWidth disabled />
                  </Grid>
                </Grid>

                <Alert severity={emailSettings.realEmailEnabled ? 'success' : 'info'}>
                  {emailSettings.realEmailEnabled
                    ? 'Real SMTP email is active. Triggered notifications will be sent by the backend.'
                    : 'Mock mode is active. Email actions are logged by the backend but not sent to real inboxes.'}
                </Alert>

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'flex-start' }}>
                  <TextField
                    label="Test recipient"
                    value={testRecipient}
                    onChange={(event) => {
                      setTestRecipient(event.target.value);
                      setTestRecipientError('');
                    }}
                    error={Boolean(testRecipientError)}
                    helperText={testRecipientError || 'Send a test email using the current backend email provider.'}
                    sx={{ minWidth: { sm: 340 } }}
                  />
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={handleSendTestEmail}
                    disabled={sendingTestEmail}
                    sx={{ minHeight: 56 }}
                  >
                    {sendingTestEmail ? 'Sending...' : 'Send Test Email'}
                  </Button>
                </Stack>
              </>
            ) : null}
          </Stack>
        </Paper>
      </Stack>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Settings;

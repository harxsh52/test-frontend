import SaveIcon from '@mui/icons-material/Save';
import { Avatar, Box, Button, Chip, Grid, Paper, Snackbar, Stack, TextField, Typography, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { internService } from '../../services/internService';
import { formatDate } from '../../utils/dateUtils';

const MyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ phone: '', profileImageUrl: '', skills: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      try {
        const profileData = await internService.getInternProfile();
        if (mounted) {
          setProfile(profileData);
          setForm({
            phone: profileData.phone || '',
            profileImageUrl: profileData.profileImageUrl || '',
            skills: (profileData.skills || []).join(', ')
          });
        }
      } catch (profileError) {
        if (mounted) setError(profileError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedProfile = await internService.updateInternProfile({
        phone: form.phone,
        profileImageUrl: form.profileImageUrl,
        skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean)
      });
      setProfile(updatedProfile);
      setSnackbar({ open: true, message: 'Profile updated successfully.', severity: 'success' });
    } catch (saveError) {
      setSnackbar({ open: true, message: saveError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const readOnlyFields = [
    ['Emp ID', profile?.empId],
    ['Name', profile?.name],
    ['Email', profile?.email],
    ['Designation', profile?.designation],
    ['Department', profile?.department],
    ['Sub Department', profile?.subDepartment],
    ['Assigned Company', profile?.assignedCompany],
    ['Manager', profile?.managerName],
    ['College', profile?.college],
    ['Joining Date', formatDate(profile?.joiningDate)],
    ['Internship Start', formatDate(profile?.internshipStartDate)],
    ['Internship End', formatDate(profile?.internshipEndDate)],
    ['Internship Type', profile?.internshipType],
    ['Stipend', profile?.stipend ? `₹${profile.stipend}` : '-']
  ];

  return (
    <Box>
      <PageHeader title="Profile" subtitle="Your backend-owned intern profile. HR/Admin controls department, manager, company, and role fields." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : profile ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <Avatar src={profile.profileImageUrl || ''} sx={{ width: 76, height: 76, fontWeight: 900 }}>
                {profile.name?.[0] || 'I'}
              </Avatar>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 850 }}>{profile.name}</Typography>
                <Typography color="text.secondary">{profile.email}</Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
                  <Chip label={profile.empId || '-'} size="small" />
                  <StatusChip status={profile.status || 'ACTIVE'} />
                </Stack>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Editable Fields</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField label="Phone" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12} md={8}>
                <TextField label="Profile image URL" value={form.profileImageUrl} onChange={(event) => setForm((current) => ({ ...current, profileImageUrl: event.target.value }))} fullWidth />
              </Grid>
              <Grid item xs={12}>
                <TextField label="Skills" value={form.skills} onChange={(event) => setForm((current) => ({ ...current, skills: event.target.value }))} helperText="Comma-separated skills. Example: Java, Spring Boot, React" fullWidth />
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Allowed Changes'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Profile Details</Typography>
            <Grid container spacing={2.5}>
              {readOnlyFields.map(([label, value]) => (
                <Grid item xs={12} sm={6} md={4} key={label}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>{value || '-'}</Typography>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Stack>
      ) : (
        <EmptyState title="Profile not found" message="No backend intern profile was found for your logged-in account." />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default MyProfile;

import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Alert, Box, Button, Paper, Snackbar, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { ROLES } from '../../utils/roles';
import { isEmail, required } from '../../utils/validation';

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  appliedRole: '',
  skills: ''
};

const AddCandidate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = user.role === ROLES.ADMIN ? '/admin' : '/hr';
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (event) => {
    setFormData((current) => ({ ...current, [event.target.name]: event.target.value }));
    setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = {
      name: required(formData.name, 'Full name'),
      email: required(formData.email, 'Email') || (!isEmail(formData.email) ? 'Enter a valid email address.' : ''),
      appliedRole: required(formData.appliedRole, 'Applied role')
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors);
      setSnackbar({ open: true, message: 'Fix the highlighted fields before saving.', severity: 'error' });
      return;
    }

    setSaving(true);

    try {
      const candidate = await candidateService.createCandidate(formData);
      setSnackbar({ open: true, message: 'Candidate created successfully.', severity: 'success' });
      setTimeout(() => navigate(`${basePath}/candidates/${candidate.id}`), 400);
    } catch (error) {
      setSnackbar({ open: true, message: error.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Add Candidate" subtitle="Create a candidate profile before uploading a resume for AI screening." />
      <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 760 }}>
        <Stack spacing={2}>
          <TextField label="Full name" name="name" value={formData.name} onChange={handleChange} required error={Boolean(formErrors.name)} helperText={formErrors.name} />
          <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required error={Boolean(formErrors.email)} helperText={formErrors.email} />
          <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
          <TextField label="Applied role" name="appliedRole" value={formData.appliedRole} onChange={handleChange} required error={Boolean(formErrors.appliedRole)} helperText={formErrors.appliedRole} />
          <TextField label="Skills" name="skills" value={formData.skills} onChange={handleChange} helperText="Separate skills with commas" />
          <Button type="submit" variant="contained" startIcon={<PersonAddIcon />} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }} disabled={saving}>
            {saving ? 'Saving...' : 'Add Candidate'}
          </Button>
        </Stack>
      </Paper>

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddCandidate;

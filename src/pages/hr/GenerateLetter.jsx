import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, Stack, TextField } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/common/PageHeader';
import LetterPreview from '../../components/letters/LetterPreview';
import { letterService, letterTypes } from '../../services/letterService';

const today = new Date().toISOString().slice(0, 10);

const initialForm = {
  letterType: 'OFFER_LETTER',
  candidateName: '',
  candidateEmail: '',
  candidateId: '',
  internId: '',
  roleName: '',
  department: '',
  joiningDate: today,
  internshipStartDate: today,
  internshipEndDate: '',
  stipend: '',
  workLocation: 'Remote',
  reportingManager: '',
  companyName: 'InternIQ Technologies',
  hrName: 'HR Team'
};

const label = (value) => value.replaceAll('_', ' ');

const GenerateLetter = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [letter, setLetter] = useState(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleChange = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: '' }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.candidateName.trim()) nextErrors.candidateName = 'Candidate name is required.';
    if (!form.candidateEmail.trim()) nextErrors.candidateEmail = 'Candidate email is required.';
    if (!form.roleName.trim()) nextErrors.roleName = 'Role name is required.';
    if (!form.companyName.trim()) nextErrors.companyName = 'Company name is required.';
    if (form.letterType === 'OFFER_LETTER') {
      if (!form.joiningDate) nextErrors.joiningDate = 'Joining date is required for offer letters.';
      if (!form.internshipStartDate) nextErrors.internshipStartDate = 'Start date is required for offer letters.';
      if (!form.internshipEndDate) nextErrors.internshipEndDate = 'End date is required for offer letters.';
    }
    if (form.internshipStartDate && form.internshipEndDate && form.internshipStartDate > form.internshipEndDate) {
      nextErrors.internshipEndDate = 'End date cannot be before start date.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const payload = () => ({
    ...form,
    candidateId: form.candidateId ? Number(form.candidateId) : null,
    internId: form.internId ? Number(form.internId) : null,
    stipend: form.stipend ? Number(form.stipend) : null,
    joiningDate: form.joiningDate || null,
    internshipStartDate: form.internshipStartDate || null,
    internshipEndDate: form.internshipEndDate || null
  });

  const handleGenerate = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const generatedLetter = await letterService.generateLetter(payload());
      setLetter(generatedLetter);
      setSnackbar({ open: true, message: 'Letter generated successfully.', severity: 'success' });
    } catch (generateError) {
      setSnackbar({ open: true, message: generateError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSend = async () => {
    if (!letter?.id) return;
    setSaving(true);
    try {
      const sentLetter = await letterService.sendLetter(letter.id);
      setLetter(sentLetter);
      setSnackbar({ open: true, message: 'Letter sent successfully.', severity: 'success' });
    } catch (sendError) {
      setSnackbar({ open: true, message: sendError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (text) => {
    await navigator.clipboard.writeText(text);
    setSnackbar({ open: true, message: 'Letter text copied.', severity: 'success' });
  };

  return (
    <Box>
      <PageHeader title="Generate Letter" subtitle="Create professional offer, selection, rejection, and certificate placeholders." />
      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField select label="Letter type" value={form.letterType} onChange={handleChange('letterType')} fullWidth>
              {letterTypes.map((type) => <MenuItem key={type} value={type}>{label(type)}</MenuItem>)}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}><TextField label="Candidate name" value={form.candidateName} onChange={handleChange('candidateName')} error={Boolean(errors.candidateName)} helperText={errors.candidateName} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Candidate email" value={form.candidateEmail} onChange={handleChange('candidateEmail')} error={Boolean(errors.candidateEmail)} helperText={errors.candidateEmail} fullWidth /></Grid>
          <Grid item xs={12} md={3}><TextField label="Candidate ID" value={form.candidateId} onChange={handleChange('candidateId')} fullWidth /></Grid>
          <Grid item xs={12} md={3}><TextField label="Intern ID" value={form.internId} onChange={handleChange('internId')} fullWidth /></Grid>
          <Grid item xs={12} md={6}><TextField label="Role name" value={form.roleName} onChange={handleChange('roleName')} error={Boolean(errors.roleName)} helperText={errors.roleName} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Department" value={form.department} onChange={handleChange('department')} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Reporting manager" value={form.reportingManager} onChange={handleChange('reportingManager')} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Work location" value={form.workLocation} onChange={handleChange('workLocation')} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Joining date" type="date" value={form.joiningDate} onChange={handleChange('joiningDate')} error={Boolean(errors.joiningDate)} helperText={errors.joiningDate} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Internship start" type="date" value={form.internshipStartDate} onChange={handleChange('internshipStartDate')} error={Boolean(errors.internshipStartDate)} helperText={errors.internshipStartDate} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Internship end" type="date" value={form.internshipEndDate} onChange={handleChange('internshipEndDate')} error={Boolean(errors.internshipEndDate)} helperText={errors.internshipEndDate} InputLabelProps={{ shrink: true }} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Stipend" type="number" value={form.stipend} onChange={handleChange('stipend')} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="Company name" value={form.companyName} onChange={handleChange('companyName')} error={Boolean(errors.companyName)} helperText={errors.companyName} fullWidth /></Grid>
          <Grid item xs={12} md={4}><TextField label="HR name" value={form.hrName} onChange={handleChange('hrName')} fullWidth /></Grid>
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleGenerate} disabled={saving}>
                {saving ? 'Generating...' : 'Generate Preview & Save'}
              </Button>
              {letter ? <Button startIcon={<SendIcon />} onClick={handleSend} disabled={saving || letter.status === 'SENT'}>Send Letter</Button> : null}
              {letter ? <Button startIcon={<DownloadIcon />} onClick={() => letterService.downloadLetter(letter.id)}>Download</Button> : null}
              {letter ? <Button onClick={() => navigate(`/hr/letters/${letter.id}`)}>Open Details</Button> : null}
            </Stack>
          </Grid>
        </Grid>
      </Paper>
      <LetterPreview letter={letter} onCopy={handleCopy} />
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default GenerateLetter;

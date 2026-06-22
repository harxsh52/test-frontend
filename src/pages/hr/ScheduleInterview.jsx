import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { interviewService } from '../../services/interviewService';
import { userService } from '../../services/userService';
import { futureOrToday, required } from '../../utils/validation';

const getDefaultSchedule = () => {
  const date = new Date();
  date.setDate(date.getDate() + 1);
  date.setMinutes(0, 0, 0);
  return date.toISOString().slice(0, 16);
};

const initialForm = {
  targetType: 'INTERN',
  internId: '',
  candidateId: '',
  role: 'React Intern',
  scheduledAt: getDefaultSchedule()
};

const ScheduleInterview = () => {
  const [interns, setInterns] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const [internRecords, candidateRecords] = await Promise.all([userService.getInterns(), userService.getCandidates()]);
        if (mounted) {
          setInterns(internRecords);
          setCandidates(candidateRecords);
          setFormData((current) => ({
            ...current,
            internId: internRecords[0]?.id || '',
            candidateId: candidateRecords[0]?.id || ''
          }));
        }
      } catch (optionsError) {
        if (mounted) {
          setError(optionsError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
    setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const targetField = formData.targetType === 'INTERN' ? 'internId' : 'candidateId';
    const nextErrors = {
      internId: formData.targetType === 'INTERN' ? required(formData.internId, 'Intern') : '',
      candidateId: formData.targetType === 'CANDIDATE' ? required(formData.candidateId, 'Candidate') : '',
      role: required(formData.role, 'Role'),
      scheduledAt: required(formData.scheduledAt, 'Scheduled time') || futureOrToday(formData.scheduledAt, 'Scheduled time')
    };

    if (nextErrors[targetField] || nextErrors.role || nextErrors.scheduledAt) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);

    try {
      await interviewService.scheduleInterview({
        role: formData.role,
        scheduledAt: formData.scheduledAt ? `${formData.scheduledAt}:00` : null,
        internId: formData.targetType === 'INTERN' ? formData.internId : null,
        candidateId: formData.targetType === 'CANDIDATE' ? formData.candidateId : null
      });
      setSnackbar({ open: true, message: 'Interview scheduled successfully.', severity: 'success' });
      setFormData((current) => ({ ...current, role: 'React Intern', scheduledAt: getDefaultSchedule() }));
    } catch (scheduleError) {
      setSnackbar({ open: true, message: scheduleError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Schedule Interview" subtitle="Create AI interview sessions for interns or candidates." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 760 }}>
          <Stack spacing={2}>
            <TextField select label="Interview target" name="targetType" value={formData.targetType} onChange={handleChange}>
              <MenuItem value="INTERN">Intern</MenuItem>
              <MenuItem value="CANDIDATE">Candidate</MenuItem>
            </TextField>

            {formData.targetType === 'INTERN' ? (
              <TextField select label="Intern" name="internId" value={formData.internId} onChange={handleChange} required error={Boolean(formErrors.internId)} helperText={formErrors.internId}>
                {interns.map((intern) => (
                  <MenuItem key={intern.id} value={intern.id}>
                    {intern.name}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField select label="Candidate" name="candidateId" value={formData.candidateId} onChange={handleChange} required error={Boolean(formErrors.candidateId)} helperText={formErrors.candidateId}>
                {candidates.map((candidate) => (
                  <MenuItem key={candidate.id} value={candidate.id}>
                    {candidate.name} - {candidate.appliedRole}
                  </MenuItem>
                ))}
              </TextField>
            )}

            <TextField label="Role" name="role" value={formData.role} onChange={handleChange} required error={Boolean(formErrors.role)} helperText={formErrors.role} />
            <TextField
              label="Scheduled at"
              name="scheduledAt"
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={handleChange}
              InputLabelProps={{ shrink: true }}
              required
              error={Boolean(formErrors.scheduledAt)}
              helperText={formErrors.scheduledAt}
            />
            <Typography variant="body2" color="text.secondary">
              Candidate interviews can be operated by HR/Admin in this phase. Interns can take their own scheduled interviews after login.
            </Typography>
            <Button
              type="submit"
              variant="contained"
              startIcon={<EventAvailableIcon />}
              disabled={saving || (formData.targetType === 'INTERN' ? !formData.internId : !formData.candidateId)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
            >
              {saving ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </Stack>
        </Paper>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ScheduleInterview;

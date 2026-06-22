import FactCheckIcon from '@mui/icons-material/FactCheck';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Alert, Box, Button, Chip, Grid, LinearProgress, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import PermissionGate from '../../components/auth/PermissionGate';
import StatCard from '../../components/common/StatCard';
import { aiService } from '../../services/aiService';
import { candidateService } from '../../services/candidateService';
import { required } from '../../utils/validation';

const allowedResumeTypes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

const ResumeScreening = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [candidates, setCandidates] = useState([]);
  const [candidateId, setCandidateId] = useState(searchParams.get('candidateId') || '');
  const [file, setFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadCandidates = async () => {
      try {
        const records = await candidateService.getCandidates();
        if (mounted) {
          setCandidates(records);
          setCandidateId((current) => current || records[0]?.id || '');
        }
      } catch (candidateError) {
        if (mounted) setError(candidateError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCandidates();

    return () => {
      mounted = false;
    };
  }, []);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => String(candidate.id) === String(candidateId)),
    [candidateId, candidates]
  );

  const handleCandidateChange = (event) => {
    const nextCandidateId = event.target.value;
    setCandidateId(nextCandidateId);
    setFormErrors((current) => ({ ...current, candidateId: '' }));
    setResult(null);
    setSearchParams(nextCandidateId ? { candidateId: nextCandidateId } : {});
  };

  const handleFileChange = (event) => {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
    setFormErrors((current) => ({ ...current, file: '' }));
  };

  const handleScreenResume = async () => {
    const fileTypeAllowed = !file || allowedResumeTypes.includes(file.type) || /\.(pdf|doc|docx|txt)$/i.test(file.name);
    const nextErrors = {
      candidateId: required(candidateId, 'Candidate'),
      file: required(file?.name, 'Resume file') || (!fileTypeAllowed ? 'Upload a PDF, DOC, DOCX, or TXT file.' : '')
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors);
      setSnackbar({ open: true, message: 'Fix the highlighted fields before screening.', severity: 'error' });
      return;
    }

    setScreening(true);
    setError('');

    try {
      const screeningResult = await aiService.screenResume(candidateId, file);
      setResult(screeningResult);
      setSnackbar({ open: true, message: 'Resume screened successfully.', severity: 'success' });
    } catch (screenError) {
      setSnackbar({ open: true, message: screenError.message, severity: 'error' });
    } finally {
      setScreening(false);
    }
  };

  return (
    <Box>
      <PageHeader title="Resume Screening" subtitle="Upload candidate resumes and run structured AI screening." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={2}>
                <TextField select label="Candidate" value={candidateId} onChange={handleCandidateChange} required error={Boolean(formErrors.candidateId)} helperText={formErrors.candidateId}>
                  {candidates.map((candidate) => (
                    <MenuItem key={candidate.id} value={candidate.id}>
                      {candidate.name} - {candidate.appliedRole}
                    </MenuItem>
                  ))}
                </TextField>
                <Button variant="outlined" component="label" startIcon={<UploadFileIcon />} sx={{ justifyContent: 'flex-start', overflow: 'hidden' }}>
                  {file ? file.name : 'Choose Resume'}
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
                    onChange={handleFileChange}
                  />
                </Button>
                {formErrors.file ? <Alert severity="error">{formErrors.file}</Alert> : null}
                <PermissionGate permission="HR_RESUME_SCREEN">
                  <Button variant="contained" startIcon={<FactCheckIcon />} onClick={handleScreenResume} disabled={screening || !candidateId || !file}>
                    {screening ? 'Screening...' : 'Run AI Screening'}
                  </Button>
                </PermissionGate>
                {screening ? <LinearProgress /> : null}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            {result ? (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <StatCard title="Final Score" value={`${result.finalScore}/100`} />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatCard title="Role Match" value={`${result.roleMatchScore}/100`} color="success.main" />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <StatCard title="Recommendation" value={result.recommendation} color="warning.main" />
                  </Grid>
                </Grid>
                <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {result.candidateName} - {result.appliedRole}
                    </Typography>
                    {result.mockResult ? <Chip size="small" color="info" label="Mock AI Result" /> : null}
                  </Stack>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {result.aiSummary}
                  </Typography>
                  <Typography sx={{ fontWeight: 700 }}>Strong Skills</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>{result.strongAreas?.join(', ') || '-'}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>Weak Areas</Typography>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>{result.weakAreas?.join(', ') || '-'}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>Project Quality</Typography>
                  <Typography color="text.secondary">{result.projectQuality || '-'}</Typography>
                </Paper>
              </Stack>
            ) : (
              <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {selectedCandidate ? selectedCandidate.name : 'Select a candidate'}
                </Typography>
                <Typography color="text.secondary">
                  Upload a PDF, DOC, DOCX, or TXT resume. Screening uses local mock AI unless the backend is configured with `AI_PROVIDER=openai-compatible` and a valid `AI_API_KEY`.
                </Typography>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ResumeScreening;

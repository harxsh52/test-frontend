import FactCheckIcon from '@mui/icons-material/FactCheck';
import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { candidateService } from '../../services/candidateService';
import { ROLES } from '../../utils/roles';

const CandidateDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const basePath = user.role === ROLES.ADMIN ? '/admin' : '/hr';
  const [candidate, setCandidate] = useState(null);
  const [screeningResult, setScreeningResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadCandidate = async () => {
      try {
        const candidateData = await candidateService.getCandidate(id);
        let result = null;

        try {
          result = await aiService.getResumeScreeningResult(id);
        } catch {
          result = null;
        }

        if (mounted) {
          setCandidate(candidateData);
          setScreeningResult(result);
        }
      } catch (candidateError) {
        if (mounted) setError(candidateError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadCandidate();

    return () => {
      mounted = false;
    };
  }, [id]);

  return (
    <Box>
      <PageHeader title="Candidate Details" subtitle="Candidate profile and latest AI screening result." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : candidate ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={1.25}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>{candidate.name}</Typography>
                <Typography color="text.secondary">{candidate.email}</Typography>
                <Typography>Phone: {candidate.phone || '-'}</Typography>
                <Typography>Applied Role: {candidate.appliedRole}</Typography>
                <Typography>Skills: {candidate.skills || '-'}</Typography>
                <Typography>Resume: {candidate.resumeFileName || '-'}</Typography>
                <Chip label={(candidate.status || 'NEW').replaceAll('_', ' ')} sx={{ alignSelf: 'flex-start' }} />
                <Button component={RouterLink} to={`${basePath}/resume-screening?candidateId=${candidate.id}`} variant="contained" startIcon={<FactCheckIcon />} sx={{ alignSelf: 'flex-start' }}>
                  Screen Resume
                </Button>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              {screeningResult ? (
                <Stack spacing={2}>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>AI Screening Result</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{screeningResult.finalScore}/100</Typography>
                  <LinearProgress variant="determinate" value={screeningResult.finalScore || 0} sx={{ height: 10, borderRadius: 5 }} />
                  <Typography>Recommendation: {screeningResult.recommendation}</Typography>
                  <Typography>Role Match: {screeningResult.roleMatchScore}/100</Typography>
                  <Typography>Project Quality: {screeningResult.projectQuality}</Typography>
                  <Typography color="text.secondary">{screeningResult.aiSummary}</Typography>
                </Stack>
              ) : (
                <Alert severity="info">No AI screening result yet.</Alert>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default CandidateDetails;

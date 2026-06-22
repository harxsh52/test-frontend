import PsychologyIcon from '@mui/icons-material/Psychology';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { aiService } from '../../services/aiService';
import { candidateService } from '../../services/candidateService';
import { ROLES } from '../../utils/roles';

const AIResults = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const basePath = user.role === ROLES.ADMIN ? '/admin' : '/hr';
  const [candidates, setCandidates] = useState([]);
  const [selectedCandidateId, setSelectedCandidateId] = useState(searchParams.get('candidateId') || '');
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resultLoading, setResultLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadResults = async () => {
      try {
        const candidateRecords = await candidateService.getCandidates();
        const screenedCandidates = candidateRecords.filter((candidate) => candidate.aiScore != null);
        if (mounted) {
          setCandidates(screenedCandidates);
          setSelectedCandidateId((current) => current || screenedCandidates[0]?.id || '');
        }
      } catch (resultsError) {
        if (mounted) setError(resultsError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedCandidateId) return undefined;

    let mounted = true;

    const loadResult = async () => {
      setResultLoading(true);
      try {
        const result = await aiService.getResumeScreeningResult(selectedCandidateId);
        if (mounted) setSelectedResult(result);
      } catch (resultError) {
        if (mounted) setError(resultError.message);
      } finally {
        if (mounted) setResultLoading(false);
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [selectedCandidateId]);

  const averageScore = useMemo(() => {
    if (!candidates.length) return 0;
    return Math.round(candidates.reduce((sum, candidate) => sum + Number(candidate.aiScore || 0), 0) / candidates.length);
  }, [candidates]);

  const handleSelectCandidate = (candidateId) => {
    setSelectedCandidateId(candidateId);
    setSearchParams(candidateId ? { candidateId } : {});
  };

  return (
    <Box>
      <PageHeader title="AI Results" subtitle="Structured resume screening results and interview preparation signals." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <StatCard title="Screened" value={candidates.length} icon={PsychologyIcon} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <StatCard title="Avg Score" value={`${averageScore}/100`} icon={PsychologyIcon} color="success.main" />
              </Grid>
            </Grid>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Candidate</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="right">View</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {candidates.length ? (
                    candidates.map((candidate) => (
                      <TableRow key={candidate.id} selected={String(candidate.id) === String(selectedCandidateId)}>
                        <TableCell sx={{ fontWeight: 600 }}>{candidate.name}</TableCell>
                        <TableCell>{candidate.aiScore}</TableCell>
                        <TableCell><Chip size="small" label={candidate.status} /></TableCell>
                        <TableCell align="right">
                          <Button size="small" startIcon={<VisibilityIcon />} onClick={() => handleSelectCandidate(candidate.id)}>
                            Result
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <EmptyState title="No screened candidates yet" message="Run resume screening to populate AI results." compact />
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              {resultLoading ? (
                <Loader />
              ) : selectedResult ? (
                <Stack spacing={2}>
                  <Typography variant="h5" sx={{ fontWeight: 800 }}>
                    {selectedResult.candidateName}
                  </Typography>
                  {selectedResult.mockResult ? (
                    <Chip size="small" color="info" label="Mock AI Result" sx={{ alignSelf: 'flex-start' }} />
                  ) : null}
                  <Typography color="text.secondary">{selectedResult.appliedRole}</Typography>
                  <Typography variant="h3" sx={{ fontWeight: 900 }}>{selectedResult.finalScore}/100</Typography>
                  <LinearProgress variant="determinate" value={selectedResult.finalScore || 0} sx={{ height: 10, borderRadius: 5 }} />
                  <Typography>Recommendation: {selectedResult.recommendation}</Typography>
                  <Typography>Role Match: {selectedResult.roleMatchScore}/100</Typography>
                  <Typography>Communication: {selectedResult.communicationScore}/100</Typography>
                  <Typography sx={{ fontWeight: 700 }}>Strong Areas</Typography>
                  <Typography color="text.secondary">{selectedResult.strongAreas?.join(', ') || '-'}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>Weak Areas</Typography>
                  <Typography color="text.secondary">{selectedResult.weakAreas?.join(', ') || '-'}</Typography>
                  <Typography sx={{ fontWeight: 700 }}>Suggested Interview Questions</Typography>
                  <Stack component="ul" sx={{ pl: 3, m: 0 }}>
                    {selectedResult.suggestedInterviewQuestions?.map((question) => (
                      <Typography component="li" key={question}>{question}</Typography>
                    ))}
                  </Stack>
                  <Button component={RouterLink} to={`${basePath}/candidates/${selectedResult.candidateId}`} sx={{ alignSelf: 'flex-start' }}>
                    Open Candidate
                  </Button>
                </Stack>
              ) : (
                <EmptyState title="Select a candidate" message="Choose a screened candidate to review the AI summary and interview signals." compact />
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AIResults;

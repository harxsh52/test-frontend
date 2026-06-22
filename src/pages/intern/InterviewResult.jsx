import { Box, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { interviewService } from '../../services/interviewService';

const InterviewResult = () => {
  const { id } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadResult = async () => {
      try {
        const resultData = await interviewService.getResult(id);
        if (mounted) {
          setResult(resultData);
        }
      } catch (resultError) {
        if (mounted) {
          setError(resultError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResult();

    return () => {
      mounted = false;
    };
  }, [id]);

  const scores = [
    ['Technical', result?.technicalScore],
    ['Communication', result?.communicationScore],
    ['Problem solving', result?.problemSolvingScore],
    ['Confidence', result?.confidenceScore]
  ];

  return (
    <Box>
      <PageHeader title="Interview Result" subtitle="AI evaluation summary for the completed interview." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : result ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <StatCard title="Final Score" value={`${result.finalScore}/100`} />
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, height: '100%' }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Recommendation
                </Typography>
                {result.mockResult ? <Chip size="small" color="info" label="Mock AI Result" /> : null}
              </Stack>
              <Typography color="text.secondary">{result.recommendation}</Typography>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={2}>
                {scores.map(([label, score]) => (
                  <Box key={label}>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
                      <Typography sx={{ fontWeight: 700 }}>{label}</Typography>
                      <Typography>{score}/100</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={score || 0} sx={{ height: 8, borderRadius: 4 }} />
                  </Box>
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Strengths
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(result.strengths || []).map((item) => (
                  <Chip key={item} label={item} color="success" variant="outlined" />
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                Weaknesses
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {(result.weaknesses || []).map((item) => (
                  <Chip key={item} label={item} color="warning" variant="outlined" />
                ))}
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                AI Summary
              </Typography>
              <Typography color="text.secondary">{result.aiSummary}</Typography>
            </Paper>
          </Grid>
        </Grid>
      ) : null}
    </Box>
  );
};

export default InterviewResult;

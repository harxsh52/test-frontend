import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SendIcon from '@mui/icons-material/Send';
import { Alert, Box, Button, LinearProgress, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/interviewService';

const InterviewRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'HR' ? '/hr' : '/intern';
  const [interview, setInterview] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadInterview = async () => {
      try {
        const interviewData = await interviewService.getInterview(id);
        if (mounted) {
          setInterview(interviewData);
        }
      } catch (interviewError) {
        if (mounted) {
          setError(interviewError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadInterview();

    return () => {
      mounted = false;
    };
  }, [id]);

  const questions = useMemo(() => interview?.questions || [], [interview]);
  const currentQuestion = questions[questionIndex];
  const progressValue = questions.length ? ((questionIndex + 1) / questions.length) * 100 : 0;

  useEffect(() => {
    setAnswerText(currentQuestion?.answer?.answerText || '');
  }, [currentQuestion]);

  const handleStart = async () => {
    setSaving(true);
    try {
      const startedInterview = await interviewService.startInterview(id);
      setInterview(startedInterview);
      setSnackbar({ open: true, message: 'Interview started.', severity: 'success' });
    } catch (startError) {
      setSnackbar({ open: true, message: startError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    setSaving(true);
    try {
      const savedAnswer = await interviewService.submitAnswer(id, {
        questionId: currentQuestion.id,
        answerText
      });

      setInterview((current) => ({
        ...current,
        questions: current.questions.map((question) =>
          question.id === currentQuestion.id ? { ...question, answer: savedAnswer } : question
        )
      }));
      setSnackbar({ open: true, message: 'Answer saved.', severity: 'success' });
    } catch (answerError) {
      setSnackbar({ open: true, message: answerError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    setSaving(true);
    try {
      await interviewService.completeInterview(id);
      navigate(`${basePath}/interviews/${id}/result`);
    } catch (completeError) {
      setSnackbar({ open: true, message: completeError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <Box>
      <PageHeader title="Interview Room" subtitle={interview ? `${interview.role} interview` : 'Text-based AI interview'} />
      <ErrorMessage message={error} />

      {!interview ? null : (
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          {interview.status === 'SCHEDULED' ? (
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Ready to begin?
              </Typography>
              <Typography color="text.secondary">
                Starting will generate questions if needed and mark this interview as in progress.
              </Typography>
              <Button variant="contained" onClick={handleStart} disabled={saving} sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}>
                {saving ? 'Starting...' : 'Start Interview'}
              </Button>
            </Stack>
          ) : questions.length ? (
            <Stack spacing={3}>
              <Box>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Question {questionIndex + 1} of {questions.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {currentQuestion?.questionType?.replaceAll('_', ' ')}
                  </Typography>
                </Stack>
                <LinearProgress variant="determinate" value={progressValue} sx={{ height: 8, borderRadius: 4 }} />
              </Box>

              <Paper elevation={0} sx={{ p: 2.5, bgcolor: '#f9fafb', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Typography sx={{ fontWeight: 700 }}>{currentQuestion?.questionText}</Typography>
              </Paper>

              <TextField
                label="Your answer"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                multiline
                minRows={8}
                fullWidth
              />

              {currentQuestion?.answer ? (
                <Alert severity="info">
                  Score: {currentQuestion.answer.score}/100. {currentQuestion.answer.feedback}
                </Alert>
              ) : null}

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ '& .MuiButton-root': { minHeight: 42 } }}>
                <Button variant="contained" startIcon={<SendIcon />} onClick={handleSubmitAnswer} disabled={saving || !answerText.trim()}>
                  {saving ? 'Saving...' : 'Submit Answer'}
                </Button>
                <Button
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => setQuestionIndex((current) => Math.min(current + 1, questions.length - 1))}
                  disabled={questionIndex >= questions.length - 1}
                >
                  Next
                </Button>
                <Button color="success" variant="contained" startIcon={<CheckCircleIcon />} onClick={handleComplete} disabled={saving}>
                  Complete Interview
                </Button>
              </Stack>
            </Stack>
          ) : (
            <Alert severity="info">Questions are not generated yet. Ask HR/Admin to generate questions.</Alert>
          )}
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

export default InterviewRoom;

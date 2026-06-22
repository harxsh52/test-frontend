import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QuizIcon from '@mui/icons-material/Quiz';
import EmailIcon from '@mui/icons-material/Email';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Box, Button, Chip, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/interviewService';
import { notificationService } from '../../services/notificationService';
import { formatDate } from '../../utils/dateUtils';

const Interviews = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMIN' ? '/admin' : '/hr';
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadInterviews = async () => {
    const interviewRecords = await interviewService.getInterviews();
    setInterviews(interviewRecords);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const interviewRecords = await interviewService.getInterviews();
        if (mounted) {
          setInterviews(interviewRecords);
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

    load();

    return () => {
      mounted = false;
    };
  }, []);

  const handleGenerateQuestions = async (interviewId) => {
    setActionLoading(interviewId);

    try {
      await interviewService.generateQuestions(interviewId);
      await loadInterviews();
      setSnackbar({ open: true, message: 'Questions generated successfully.', severity: 'success' });
    } catch (generateError) {
      setSnackbar({ open: true, message: generateError.message, severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSendInterviewEmail = async (interviewId) => {
    setActionLoading(interviewId);

    try {
      await notificationService.sendInterviewEmail(interviewId);
      setSnackbar({ open: true, message: 'Interview email processed successfully.', severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <Box>
      <PageHeader title="AI Interviews" subtitle="Schedule, prepare, and monitor text-based AI interviews." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : interviews.length ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Participant</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{interview.participantName}</TableCell>
                  <TableCell>{interview.role}</TableCell>
                  <TableCell>{formatDate(interview.scheduledAt)}</TableCell>
                  <TableCell>
                    <StatusChip status={interview.status} />
                  </TableCell>
                  <TableCell>{interview.finalScore ? <Chip size="small" color="primary" label={`${interview.finalScore}/100`} /> : '-'}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<QuizIcon />}
                        onClick={() => handleGenerateQuestions(interview.id)}
                        disabled={actionLoading === interview.id || interview.status === 'COMPLETED'}
                      >
                        Questions
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EmailIcon />}
                        onClick={() => handleSendInterviewEmail(interview.id)}
                        disabled={actionLoading === interview.id}
                      >
                        Email
                      </Button>
                      {interview.status === 'COMPLETED' ? (
                        <Button size="small" variant="contained" startIcon={<VisibilityIcon />} onClick={() => navigate(`${basePath}/interviews/${interview.id}/result`)}>
                          Result
                        </Button>
                      ) : interview.candidateId ? (
                        <Button size="small" variant="contained" startIcon={<PlayArrowIcon />} onClick={() => navigate(`${basePath}/interviews/${interview.id}`)}>
                          Open
                        </Button>
                      ) : (
                        <Button size="small" variant="outlined" disabled>
                          Intern to take
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState title="No interviews scheduled" message="Schedule an interview to begin the AI interview flow." />
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

export default Interviews;

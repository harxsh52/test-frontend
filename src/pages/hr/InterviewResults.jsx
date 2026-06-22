import { Box, Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { interviewService } from '../../services/interviewService';
import { managerService } from '../../services/managerService';
import { formatDate } from '../../utils/dateUtils';

const InterviewResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const basePath = user?.role === 'ADMIN' ? '/admin' : user?.role === 'MANAGER' ? '/manager' : '/hr';
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadResults = async () => {
      try {
        const interviewRecords = user?.role === 'MANAGER'
          ? await managerService.getManagerInterviewResults()
          : await interviewService.getInterviews();
        if (mounted) {
          setInterviews(interviewRecords.filter((interview) => interview.status === 'COMPLETED' || interview.finalScore != null));
        }
      } catch (resultsError) {
        if (mounted) {
          setError(resultsError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <PageHeader title="Interview Results" subtitle="Review completed AI interview scores and recommendations." />
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
                <TableCell>Completed</TableCell>
                <TableCell>Final Score</TableCell>
                <TableCell>Recommendation</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id} hover onClick={() => navigate(`${basePath}/interviews/${interview.id}/result`)} sx={{ cursor: 'pointer' }}>
                  <TableCell sx={{ fontWeight: 700 }}>{interview.participantName}</TableCell>
                  <TableCell>{interview.role}</TableCell>
                  <TableCell>{formatDate(interview.completedAt)}</TableCell>
                  <TableCell>
                    <Chip size="small" color="primary" label={`${interview.finalScore}/100`} />
                  </TableCell>
                  <TableCell>{interview.recommendation || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState title="No completed interviews" message="Completed interview evaluations will appear here." />
      )}
    </Box>
  );
};

export default InterviewResults;

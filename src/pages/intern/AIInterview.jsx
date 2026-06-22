import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Alert, Box, Button, Chip, Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import EmptyState from '../../components/common/EmptyState';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import { interviewService } from '../../services/interviewService';
import { formatDate } from '../../utils/dateUtils';

const AIInterview = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadInterviews = async () => {
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

    loadInterviews();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <PageHeader title="AI Interviews" subtitle="Take scheduled text-based AI interviews and review completed results." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : interviews.length ? (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Role</TableCell>
                <TableCell>Scheduled</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Score</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {interviews.map((interview) => (
                <TableRow key={interview.id}>
                  <TableCell sx={{ fontWeight: 700 }}>{interview.role}</TableCell>
                  <TableCell>{formatDate(interview.scheduledAt)}</TableCell>
                  <TableCell>
                    <StatusChip status={interview.status} />
                  </TableCell>
                  <TableCell>{interview.finalScore ? <Chip label={`${interview.finalScore}/100`} size="small" color="primary" /> : '-'}</TableCell>
                  <TableCell align="right">
                    {interview.status === 'COMPLETED' ? (
                      <Button variant="outlined" onClick={() => navigate(`/intern/interviews/${interview.id}/result`)}>
                        View Result
                      </Button>
                    ) : (
                      <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/intern/interviews/${interview.id}`)}>
                        Start
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <EmptyState title="No AI interviews scheduled" message="Scheduled interview sessions will appear here when HR or admin creates them." />
      )}
    </Box>
  );
};

export default AIInterview;

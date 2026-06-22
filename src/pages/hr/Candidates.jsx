import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import FactCheckIcon from '@mui/icons-material/FactCheck';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import StarIcon from '@mui/icons-material/Star';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Box, Button, Chip, Snackbar, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { candidateService } from '../../services/candidateService';
import { notificationService } from '../../services/notificationService';
import { ROLES } from '../../utils/roles';

const statusColors = {
  NEW: 'default',
  SCREENED: 'info',
  SHORTLISTED: 'success',
  REJECTED: 'error',
  SELECTED: 'success',
  INTERVIEW_SCHEDULED: 'secondary',
  HIRED: 'success'
};

const Candidates = () => {
  const { user } = useAuth();
  const basePath = user.role === ROLES.ADMIN ? '/admin' : '/hr';
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadCandidates = async () => {
    const candidateRecords = await candidateService.getCandidates();
    setCandidates(candidateRecords);
  };

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const candidateRecords = await candidateService.getCandidates();
        if (mounted) {
          setCandidates(candidateRecords);
        }
      } catch (candidateError) {
        if (mounted) {
          setError(candidateError.message);
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

  const handleNotificationAction = async (candidate, action, successMessage) => {
    const key = `${action}-${candidate.id}`;
    setActionLoading(key);

    try {
      await notificationService[action](candidate.id);
      await loadCandidates();
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} sx={{ mb: 3 }}>
        <PageHeader title="Candidates" subtitle="Manage applicants and run AI resume screening." />
        <Button component={RouterLink} to={`${basePath}/add-candidate`} variant="contained" startIcon={<AddIcon />}>
          Add Candidate
        </Button>
      </Stack>

      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <DataTable
          rows={candidates}
          emptyMessage="No candidates added yet."
          columns={[
            { field: 'name', headerName: 'Name', render: (candidate) => <Typography sx={{ fontWeight: 600 }}>{candidate.name}</Typography> },
            { field: 'email', headerName: 'Email' },
            { field: 'appliedRole', headerName: 'Applied Role', valueGetter: (candidate) => candidate.appliedRole || candidate.role },
            {
              field: 'status',
              headerName: 'Status',
              render: (candidate) => (
                <Chip size="small" label={(candidate.status || 'NEW').replaceAll('_', ' ')} color={statusColors[candidate.status] || 'default'} />
              )
            },
            { field: 'aiScore', headerName: 'AI Score', valueGetter: (candidate) => candidate.aiScore ?? '-' },
            {
              field: 'actions',
              headerName: 'Actions',
              align: 'right',
              sortable: false,
              searchable: false,
              render: (candidate) => (
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button size="small" component={RouterLink} to={`${basePath}/candidates/${candidate.id}`} startIcon={<VisibilityIcon />}>
                    Details
                  </Button>
                  <Button size="small" component={RouterLink} to={`${basePath}/resume-screening?candidateId=${candidate.id}`} startIcon={<FactCheckIcon />}>
                    Screen
                  </Button>
                  <Button
                    size="small"
                    startIcon={<EmailIcon />}
                    onClick={() => handleNotificationAction(candidate, 'sendOfferLetter', 'Offer letter email processed.')}
                    disabled={actionLoading === `sendOfferLetter-${candidate.id}`}
                  >
                    Offer
                  </Button>
                  <Button
                    size="small"
                    color="secondary"
                    startIcon={<StarIcon />}
                    onClick={() => handleNotificationAction(candidate, 'sendShortlistedEmail', 'Shortlisted email processed.')}
                    disabled={actionLoading === `sendShortlistedEmail-${candidate.id}`}
                  >
                    Shortlist
                  </Button>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleNotificationAction(candidate, 'sendSelectedEmail', 'Selected email processed.')}
                    disabled={actionLoading === `sendSelectedEmail-${candidate.id}`}
                  >
                    Select
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<HighlightOffIcon />}
                    onClick={() => handleNotificationAction(candidate, 'sendRejectionEmail', 'Rejection email processed.')}
                    disabled={actionLoading === `sendRejectionEmail-${candidate.id}`}
                  >
                    Reject
                  </Button>
                </Stack>
              )
            }
          ]}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Candidates;

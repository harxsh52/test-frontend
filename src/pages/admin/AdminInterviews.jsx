import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminInterviews = () => {
  const [interviews, setInterviews] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminService.getInterviews(), adminService.getInterviewsSummary()])
      .then(([rows, stats]) => {
        setInterviews(rows);
        setSummary(stats.metrics || {});
      })
      .catch((interviewError) => setError(interviewError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Interviews" subtitle="Admin view of AI interview scheduling, completion, and readiness results." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}><StatCard title="Total" value={summary.totalInterviews || 0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Scheduled" value={summary.scheduled || 0} color="info.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Completed" value={summary.completed || 0} color="success.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Avg Score" value={summary.averageScore || 0} color="secondary.main" /></Grid>
          </Grid>
          <DataTable rows={interviews} emptyMessage="No interviews found." searchPlaceholder="Search interviews" columns={[
            { field: 'role', headerName: 'Role' },
            { field: 'candidateName', headerName: 'Candidate', valueGetter: (row) => row.candidateName || '-' },
            { field: 'internName', headerName: 'Intern', valueGetter: (row) => row.internName || '-' },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
            { field: 'scheduledAt', headerName: 'Scheduled' },
            { field: 'finalScore', headerName: 'Score' },
            { field: 'recommendation', headerName: 'Recommendation' }
          ]} />
        </>
      )}
    </Box>
  );
};

export default AdminInterviews;

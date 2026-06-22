import { Box, Grid, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import adminService from '../../services/adminService';

const AdminFeedback = () => {
  const [feedback, setFeedback] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([adminService.getManagerFeedback(), adminService.getFeedbackSummary()])
      .then(([rows, stats]) => {
        setFeedback(rows);
        setSummary(stats.metrics || {});
      })
      .catch((feedbackError) => setError(feedbackError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Feedback" subtitle="System-wide manager feedback, ratings, and coaching history." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={3}><StatCard title="Feedback" value={summary.totalFeedback || 0} /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Avg Rating" value={summary.averageRating || 0} color="info.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="High Rated" value={summary.highRated || 0} color="success.main" /></Grid>
            <Grid item xs={12} sm={3}><StatCard title="Needs Improvement" value={summary.needsImprovement || 0} color="warning.main" /></Grid>
          </Grid>
          <DataTable rows={feedback} emptyMessage="No feedback found." searchPlaceholder="Search feedback" columns={[
            { field: 'internName', headerName: 'Intern', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.internName}</Typography> },
            { field: 'managerName', headerName: 'Manager' },
            { field: 'taskTitle', headerName: 'Task' },
            { field: 'rating', headerName: 'Rating' },
            { field: 'feedbackText', headerName: 'Feedback' },
            { field: 'createdAt', headerName: 'Created' }
          ]} />
        </>
      )}
    </Box>
  );
};

export default AdminFeedback;

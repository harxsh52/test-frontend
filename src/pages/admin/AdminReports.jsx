import { Box, Grid } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import adminService from '../../services/adminService';

const AdminReports = () => {
  const [report, setReport] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getReportsSummary()
      .then((data) => setReport(data.metrics || {}))
      .catch((reportError) => setError(reportError.message))
      .finally(() => setLoading(false));
  }, []);

  const dashboard = report.dashboard || {};

  return (
    <Box>
      <PageHeader title="Reports" subtitle="Admin analytics across attendance, tasks, feedback, candidates, interviews, and departments." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}><StatCard title="Users" value={dashboard.totalUsers || 0} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Average Attendance" value={`${dashboard.averageAttendance || 0}%`} color="success.main" /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Average Intern Score" value={`${dashboard.averageInternScore || 0}%`} color="secondary.main" /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Tasks" value={report.tasks?.totalTasks || 0} /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Feedback" value={report.feedback?.totalFeedback || 0} color="info.main" /></Grid>
          <Grid item xs={12} sm={4}><StatCard title="Candidates" value={report.candidates?.totalCandidates || 0} color="warning.main" /></Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdminReports;

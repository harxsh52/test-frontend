import AssessmentIcon from '@mui/icons-material/Assessment';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import { Box, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { managerService } from '../../services/managerService';

const ManagerReports = () => {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [interns, setInterns] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState(searchParams.get('internId') || '');
  const [internReport, setInternReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const [summaryData, internRecords] = await Promise.all([
          managerService.getManagerReports(),
          managerService.getAssignedInterns()
        ]);
        const nextInternId = selectedInternId || internRecords[0]?.id || '';
        const report = nextInternId ? await managerService.getInternReport(nextInternId) : null;
        if (mounted) {
          setSummary(summaryData);
          setInterns(internRecords);
          setSelectedInternId(nextInternId);
          setInternReport(report);
        }
      } catch (reportError) {
        if (mounted) setError(reportError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [selectedInternId]);

  const handleInternChange = async (event) => {
    const internId = event.target.value;
    setSelectedInternId(internId);
    setReportLoading(true);
    try {
      setInternReport(await managerService.getInternReport(internId));
    } catch (reportError) {
      setError(reportError.message);
    } finally {
      setReportLoading(false);
    }
  };

  const cards = summary?.summaryCards || {};

  return (
    <Box>
      <PageHeader title="Manager Reports" subtitle="Reports scoped to interns assigned to you only." />
      <ErrorMessage message={error} />

      {loading ? (
        <Loader />
      ) : summary ? (
        <Stack spacing={3}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Assigned Interns" value={cards.totalAssignedInterns || 0} icon={GroupIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Tasks Assigned" value={cards.tasksAssigned || 0} icon={AssessmentIcon} /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Completed Tasks" value={cards.tasksCompleted || 0} icon={AssessmentIcon} color="success.main" /></Grid>
            <Grid item xs={12} sm={6} lg={3}><StatCard title="Pending Reviews" value={cards.pendingReviews || 0} icon={PendingActionsIcon} color="warning.main" /></Grid>
          </Grid>

          <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <TextField select label="Intern report" value={selectedInternId} onChange={handleInternChange} fullWidth>
              {interns.map((intern) => <MenuItem key={intern.id} value={intern.id}>{intern.name} - {intern.empId}</MenuItem>)}
            </TextField>
          </Paper>

          {reportLoading ? (
            <Loader />
          ) : internReport ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}><StatCard title="Final Score" value={`${internReport.finalScore || 0}%`} icon={AssessmentIcon} /></Grid>
              <Grid item xs={12} md={4}><StatCard title="Attendance" value={`${internReport.intern?.attendancePercentage || 0}%`} icon={AssessmentIcon} color="success.main" /></Grid>
              <Grid item xs={12} md={4}><StatCard title="Task Progress" value={`${internReport.intern?.taskProgressPercentage || 0}%`} icon={AssessmentIcon} color="info.main" /></Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>Intern</Typography>
                  <Typography sx={{ fontWeight: 800 }}>{internReport.intern?.name}</Typography>
                  <Typography color="text.secondary">{internReport.intern?.department} / {internReport.intern?.subDepartment} / {internReport.intern?.assignedCompany}</Typography>
                  <Typography color="text.secondary">Average rating: {Number(internReport.intern?.averageRating || 0).toFixed(1)}</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 850, mb: 1 }}>Feedback</Typography>
                  {internReport.feedback?.length ? internReport.feedback.slice(0, 3).map((item) => (
                    <Typography key={item.id} color="text.secondary">{item.comment}</Typography>
                  )) : <Typography color="text.secondary">No feedback recorded yet.</Typography>}
                </Paper>
              </Grid>
            </Grid>
          ) : (
            <EmptyState title="No intern report" message="Select an intern to view their manager-scoped report." />
          )}
        </Stack>
      ) : null}
    </Box>
  );
};

export default ManagerReports;

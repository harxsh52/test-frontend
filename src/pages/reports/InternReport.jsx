import BadgeIcon from '@mui/icons-material/Badge';
import PrintIcon from '@mui/icons-material/Print';
import StarIcon from '@mui/icons-material/Star';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TimerIcon from '@mui/icons-material/Timer';
import { Alert, Box, Button, Chip, Grid, MenuItem, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { internService } from '../../services/internService';
import { reportService } from '../../services/reportService';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/dateUtils';
import { ROLES } from '../../utils/roles';

const asNumber = (value) => Number(value || 0);
const formatPercent = (value) => `${asNumber(value).toFixed(0)}%`;
const formatHours = (value) => `${asNumber(value).toFixed(2)}h`;
const splitSkills = (skills) =>
  Array.isArray(skills)
    ? skills
    : String(skills || '')
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);

const normalizeInternSelfReport = (selfReport) => {
  const profile = selfReport.profile || {};
  const attendanceSummary = selfReport.attendanceSummary || {};
  const taskSummary = selfReport.taskSummary || {};
  const feedbackSummary = selfReport.feedbackSummary || {};
  const reportSummary = selfReport.reportSummary || {};
  const managerFeedback = [...(selfReport.strengths || []), ...(selfReport.improvementAreas || [])].filter(Boolean);

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    status: profile.status,
    departmentName: profile.department,
    managerName: profile.managerName,
    joiningDate: profile.joiningDate,
    internshipStartDate: profile.internshipStartDate,
    internshipEndDate: profile.internshipEndDate,
    college: profile.college,
    skills: profile.skills,
    totalWorkingDays: selfReport.workingDays ?? attendanceSummary.totalRecordedDays,
    totalWorkingHours: asNumber(attendanceSummary.totalWorkingMinutes) / 60,
    attendancePercentage: attendanceSummary.attendancePercentage,
    tasksAssigned: taskSummary.totalTasks,
    tasksCompleted: taskSummary.completedTasks,
    pendingTasks: taskSummary.pendingTasks,
    submittedTasks: taskSummary.submittedTasks,
    averageTaskRating: feedbackSummary.averageRating,
    averageFeedbackRating: selfReport.averageManagerRating ?? feedbackSummary.averageRating,
    managerFeedback,
    finalExperienceScore: reportSummary.finalScore,
    overallExperienceSummary: reportSummary.scoreMessage
  };
};

const InternReport = ({ embedded = false }) => {
  const { user } = useAuth();
  const [interns, setInterns] = useState([]);
  const [selectedInternId, setSelectedInternId] = useState('');
  const [report, setReport] = useState(null);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [loadingReport, setLoadingReport] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        setError('');

        if (user.role === ROLES.INTERN) {
          const profile = await internService.getInternProfile();
          if (mounted) {
            setInterns([profile]);
            setSelectedInternId('self');
          }
          return;
        }

        const internRecords = await userService.getInterns();
        if (mounted) {
          setInterns(internRecords);
          setSelectedInternId(internRecords[0]?.internId || internRecords[0]?.id || '');
        }
      } catch (optionsError) {
        if (mounted) {
          setError(optionsError.message);
        }
      } finally {
        if (mounted) {
          setLoadingOptions(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, [user.role]);

  useEffect(() => {
    if (!selectedInternId) return undefined;

    let mounted = true;

    const loadReport = async () => {
      setLoadingReport(true);
      try {
        const reportData = user.role === ROLES.INTERN
          ? normalizeInternSelfReport(await internService.getInternReport())
          : await reportService.getInternReport(selectedInternId);
        if (mounted) {
          setReport(reportData);
        }
      } catch (reportError) {
        if (mounted) {
          setError(reportError.message);
        }
      } finally {
        if (mounted) {
          setLoadingReport(false);
        }
      }
    };

    loadReport();

    return () => {
      mounted = false;
    };
  }, [selectedInternId, user.role]);

  if (loadingOptions) {
    return <Loader />;
  }

  return (
    <Box>
      {!embedded ? (
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ mb: 3 }} spacing={2}>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Intern Final Report
            </Typography>
            <Typography color="text.secondary">Professional internship summary with attendance, tasks, feedback, and final score.</Typography>
          </Box>
          <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()}>
            Print
          </Button>
        </Stack>
      ) : null}

      <ErrorMessage message={error} />

      {user.role !== ROLES.INTERN ? (
        <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, '@media print': { display: 'none' } }}>
          <TextField
            select
            fullWidth
            label="Intern"
            value={selectedInternId}
            onChange={(event) => setSelectedInternId(event.target.value)}
          >
            {interns.map((intern) => (
              <MenuItem key={intern.internId || intern.id} value={intern.internId || intern.id}>
                {intern.name}
              </MenuItem>
            ))}
          </TextField>
        </Paper>
      ) : null}

      {loadingReport ? (
        <Loader />
      ) : report ? (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            '@media print': { border: 0, p: 0 }
          }}
        >
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {report.name}
              </Typography>
              <Typography color="text.secondary">
                {report.departmentName || '-'} | Manager: {report.managerName || '-'}
              </Typography>
              <Typography color="text.secondary">
                {report.email} | Status: {report.status || '-'}
              </Typography>
            </Box>
            <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
              <Typography variant="body2" color="text.secondary">
                Final Score
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 900 }}>
                {formatPercent(report.finalExperienceScore)}
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Working Days" value={report.totalWorkingDays || 0} icon={TimerIcon} />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Working Hours" value={formatHours(report.totalWorkingHours)} icon={TimerIcon} color="info.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Attendance" value={formatPercent(report.attendancePercentage)} icon={BadgeIcon} color="success.main" />
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <StatCard title="Avg Rating" value={asNumber(report.averageTaskRating || report.averageFeedbackRating).toFixed(1)} icon={StarIcon} color="warning.main" />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Internship Details
              </Typography>
              <Stack spacing={0.75}>
                <Typography>Joining Date: {formatDate(report.joiningDate)}</Typography>
                <Typography>Start Date: {formatDate(report.internshipStartDate)}</Typography>
                <Typography>End Date: {formatDate(report.internshipEndDate)}</Typography>
                <Typography>College: {report.college || '-'}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {splitSkills(report.skills).map((skill) => (
                    <Chip key={skill} label={skill} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Task Summary
              </Typography>
              <Stack spacing={0.75}>
                <Typography>Tasks Assigned: {report.tasksAssigned || 0}</Typography>
                <Typography>Tasks Completed: {report.tasksCompleted || 0}</Typography>
                <Typography>Pending Tasks: {report.pendingTasks || 0}</Typography>
                <Typography>Submitted Tasks: {report.submittedTasks || 0}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                Manager Feedback
              </Typography>
              {report.managerFeedback?.length ? (
                <Stack spacing={1}>
                  {report.managerFeedback.map((feedback, index) => (
                    <Alert key={`${feedback}-${index}`} severity="info">
                      {feedback}
                    </Alert>
                  ))}
                </Stack>
              ) : (
                <Typography color="text.secondary">No manager feedback recorded yet.</Typography>
              )}
            </Grid>
            <Grid item xs={12}>
              <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                  <TaskAltIcon color="success" />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    Overall Experience Summary
                  </Typography>
                </Stack>
                <Typography>{report.overallExperienceSummary}</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
      ) : (
        <Alert severity="info">No intern report available.</Alert>
      )}
    </Box>
  );
};

export default InternReport;

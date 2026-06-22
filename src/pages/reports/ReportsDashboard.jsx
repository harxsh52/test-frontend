import AssessmentIcon from '@mui/icons-material/Assessment';
import AssignmentIcon from '@mui/icons-material/Assignment';
import BadgeIcon from '@mui/icons-material/Badge';
import BusinessIcon from '@mui/icons-material/Business';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import GroupIcon from '@mui/icons-material/Group';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import PeopleIcon from '@mui/icons-material/People';
import PrintIcon from '@mui/icons-material/Print';
import TimerIcon from '@mui/icons-material/Timer';
import { Box, Button, Grid, Paper, Stack, Tab, Tabs, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { ROLES } from '../../utils/roles';
import AttendanceReport from './AttendanceReport';
import DepartmentReport from './DepartmentReport';
import InternReport from './InternReport';
import TaskReport from './TaskReport';

const formatValue = (value, type) => {
  const numericValue = Number(value || 0);
  if (type === 'percent') return `${numericValue.toFixed(0)}%`;
  if (type === 'hours') return `${numericValue.toFixed(2)}h`;
  if (type === 'rating') return numericValue.toFixed(1);
  return numericValue;
};

const getStatCards = (role, stats = {}) => {
  const cardsByRole = {
    [ROLES.INTERN]: [
      ['Total Tasks', stats.totalTasks, AssignmentIcon],
      ['Completed Tasks', stats.completedTasks, DoneAllIcon, 'success.main'],
      ['Pending Tasks', stats.pendingTasks, PendingActionsIcon, 'warning.main'],
      ['Attendance', stats.attendancePercentage, BadgeIcon, 'info.main', 'percent'],
      ['Working Hours', stats.totalWorkingHours, TimerIcon, 'primary.main', 'hours'],
      ['Average Rating', stats.averageRating, AssessmentIcon, 'warning.main', 'rating'],
      ['Experience Score', stats.experienceScore, AssessmentIcon, 'success.main', 'percent']
    ],
    [ROLES.MANAGER]: [
      ['Total Interns', stats.totalInterns, GroupIcon],
      ['Active Interns', stats.activeInterns, BadgeIcon, 'success.main'],
      ['Tasks Assigned', stats.tasksAssigned, AssignmentIcon],
      ['Pending Reviews', stats.pendingReviews, PendingActionsIcon, 'warning.main'],
      ['Completed Tasks', stats.completedTasks, DoneAllIcon, 'success.main'],
      ['Avg Intern Score', stats.averageInternScore, AssessmentIcon, 'info.main', 'percent']
    ],
    [ROLES.HR]: [
      ['Candidates', stats.totalCandidates, PeopleIcon],
      ['Total Interns', stats.totalInterns, GroupIcon],
      ['Active Interns', stats.activeInterns, BadgeIcon, 'success.main'],
      ['Completed Internships', stats.completedInternships, DoneAllIcon, 'success.main'],
      ['Avg Attendance', stats.averageAttendance, AssessmentIcon, 'info.main', 'percent'],
      ['Departments', stats.departmentsCount, BusinessIcon]
    ],
    [ROLES.ADMIN]: [
      ['Total Users', stats.totalUsers, PeopleIcon],
      ['Departments', stats.totalDepartments, BusinessIcon],
      ['Interns', stats.totalInterns, GroupIcon],
      ['Managers', stats.totalManagers, BadgeIcon],
      ['HR Users', stats.totalHR, PeopleIcon],
      ['Active Users', stats.activeUsers, DoneAllIcon, 'success.main']
    ]
  };

  return cardsByRole[role] || [];
};

const ReportsDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState(user.role === ROLES.INTERN ? 'intern' : 'attendance');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadStats = async () => {
      try {
        const statsData = await reportService.getDashboardStats();
        if (mounted) setStats(statsData);
      } catch (statsError) {
        if (mounted) setError(statsError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadStats();

    return () => {
      mounted = false;
    };
  }, []);

  const tabs = useMemo(() => {
    if (user.role === ROLES.INTERN) return [];

    const baseTabs = [
      ['attendance', 'Attendance'],
      ['tasks', 'Tasks'],
      ['intern', 'Intern Report']
    ];

    if ([ROLES.HR, ROLES.ADMIN].includes(user.role)) {
      baseTabs.push(['departments', 'Departments']);
    }

    return baseTabs;
  }, [user.role]);

  const renderActiveReport = () => {
    if (user.role === ROLES.INTERN) return <InternReport embedded />;
    if (activeTab === 'tasks') return <TaskReport />;
    if (activeTab === 'intern') return <InternReport embedded />;
    if (activeTab === 'departments') return <DepartmentReport />;
    return <AttendanceReport />;
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2}>
        <PageHeader title="Reports" subtitle="Role-aware analytics for attendance, tasks, departments, and intern outcomes." />
        <Button variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' }, '@media print': { display: 'none' } }}>
          Print
        </Button>
      </Stack>

      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            {getStatCards(user.role, stats).map(([title, value, Icon, color, type]) => (
              <Grid item xs={12} sm={6} lg={3} key={title}>
                <StatCard title={title} value={formatValue(value, type)} icon={Icon} color={color} />
              </Grid>
            ))}
          </Grid>

          {tabs.length ? (
            <Paper elevation={0} sx={{ mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2, '@media print': { display: 'none' } }}>
              <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)} variant="scrollable" scrollButtons="auto">
                {tabs.map(([value, label]) => (
                  <Tab key={value} value={value} label={label} />
                ))}
              </Tabs>
            </Paper>
          ) : null}

          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
            {user.role === ROLES.INTERN ? 'Final Intern Report' : tabs.find(([value]) => value === activeTab)?.[1]}
          </Typography>
          {renderActiveReport()}
        </>
      )}
    </Box>
  );
};

export default ReportsDashboard;

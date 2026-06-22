import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import BadgeIcon from '@mui/icons-material/Badge';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import StarIcon from '@mui/icons-material/Star';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import TimerIcon from '@mui/icons-material/Timer';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import {
  Avatar,
  Box,
  Chip,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatCard from '../../components/common/StatCard';
import StatusChip from '../../components/common/StatusChip';
import TaskCard from '../../components/tasks/TaskCard';
import { internService } from '../../services/internService';

const cardSx = {
  border: '1px solid',
  borderColor: 'rgba(148, 163, 184, 0.22)',
  borderRadius: 4,
  boxShadow: '0 18px 45px rgba(15, 23, 42, 0.06)',
  transition: '0.25s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 24px 60px rgba(15, 23, 42, 0.10)'
  }
};

const InternDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        const data = await internService.getInternDashboard();

        if (mounted) {
          setDashboard(data);
        }
      } catch (dashboardError) {
        if (mounted) {
          setError(dashboardError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const profile = dashboard?.internProfile;
  const today = dashboard?.todayAttendance;
  const attendanceSummary = dashboard?.attendanceSummary || {};
  const taskSummary = dashboard?.taskSummary || {};
  const feedbackSummary = dashboard?.feedbackSummary || {};
  const reportSummary = dashboard?.reportSummary || {};

  const attendancePercentage = Number(attendanceSummary.attendancePercentage || 0);
  const finalScore = Number(reportSummary.finalScore || 0);
  const averageRating = Number(feedbackSummary.averageRating || 0);
  const feedbackProgress = Math.min((averageRating / 5) * 100, 100);

  return (
    <Box
      sx={{
        animation: 'dashboardFadeIn 0.45s ease both',
        '@keyframes dashboardFadeIn': {
          from: {
            opacity: 0,
            transform: 'translateY(10px)'
          },
          to: {
            opacity: 1,
            transform: 'translateY(0)'
          }
        }
      }}
    >
      <PageHeader
        title={profile ? `${profile.name} ☺️` : 'Intern Dashboard'}
        subtitle="Your profile, attendance, tasks, feedback, and report score from backend data."
      />

      <ErrorMessage message={error} />

      {loading ? (
        <Loader />
      ) : dashboard ? (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                ...cardSx,
                position: 'relative',
                p: { xs: 2.5, sm: 3.5 },
                color: '#ffffff',
                background:
                  'linear-gradient(135deg, #0f172a 0%, #1e293b 48%, #2563eb 120%)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 260,
                  height: 260,
                  right: -90,
                  top: -120,
                  borderRadius: '50%',
                  background: 'rgba(96, 165, 250, 0.24)',
                  filter: 'blur(2px)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  left: -70,
                  bottom: -90,
                  borderRadius: '50%',
                  background: 'rgba(34, 197, 94, 0.16)'
                }
              }}
            >
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                spacing={3}
                alignItems={{ xs: 'flex-start', md: 'center' }}
                justifyContent="space-between"
                sx={{ position: 'relative', zIndex: 1 }}
              >
                <Stack direction="row" spacing={2.5} alignItems="center">
                  <Avatar
                    src={profile?.profileImageUrl || ''}
                    sx={{
                      width: 78,
                      height: 78,
                      fontWeight: 900,
                      fontSize: 30,
                      color: '#ffffff',
                      bgcolor: 'rgba(255, 255, 255, 0.18)',
                      border: '3px solid rgba(255,255,255,0.28)'
                    }}
                  >
                    {profile?.name?.[0] || 'I'}
                  </Avatar>

                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 900, letterSpacing: '-0.04em' }}>
                      {profile?.name || 'Intern'}
                    </Typography>

                    <Typography sx={{ color: 'rgba(255,255,255,0.78)', mt: 0.5 }}>
                      {profile?.designation || 'Intern'} | Emp ID: {profile?.empId || '-'}
                    </Typography>

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
                      <Chip
                        size="small"
                        label={profile?.department || 'Department'}
                        sx={{
                          color: '#ffffff',
                          bgcolor: 'rgba(255,255,255,0.14)',
                          fontWeight: 700
                        }}
                      />

                      <Chip
                        size="small"
                        label={profile?.assignedCompany || 'Company'}
                        sx={{
                          color: '#ffffff',
                          bgcolor: 'rgba(255,255,255,0.14)',
                          fontWeight: 700
                        }}
                      />

                      <Chip
                        size="small"
                        label={`Manager: ${profile?.managerName || '-'}`}
                        sx={{
                          color: '#ffffff',
                          bgcolor: 'rgba(255,255,255,0.14)',
                          fontWeight: 700
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.12)',
                    border: '1px solid rgba(255,255,255,0.18)',
                    borderRadius: 3,
                    px: 2,
                    py: 1.5
                  }}
                >
                  <StatusChip status={profile?.status || 'ACTIVE'} />
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Attendance"
              value={`${attendancePercentage}%`}
              subtitle={`${attendanceSummary.presentDays || 0} present days`}
              icon={EventAvailableIcon}
              color="success.main"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Working Hours"
              value={attendanceSummary.totalWorkingHoursText || '0h 00m'}
              subtitle="Total recorded time"
              icon={TimerIcon}
              color="info.main"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Tasks"
              value={taskSummary.totalTasks || 0}
              subtitle={`${taskSummary.pendingTasks || 0} pending`}
              icon={AssignmentTurnedInIcon}
              color="primary.main"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <StatCard
              title="Final Score"
              value={`${finalScore}%`}
              subtitle={reportSummary.scoreMessage || 'Performance score'}
              icon={BadgeIcon}
              color="warning.main"
            />
          </Grid>

          <Grid item xs={12} md={5}>
            <Paper
              elevation={0}
              sx={{
                ...cardSx,
                p: 3,
                height: '100%',
                bgcolor: '#ffffff'
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 900 }}>
                      Today's Attendance
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Synced from backend records
                    </Typography>
                  </Box>

                  <StatusChip status={today?.status || 'NOT_FOUND'} />
                </Stack>

                <Box>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.8 }}>
                    <Typography variant="body2" color="text.secondary">
                      Monthly attendance
                    </Typography>

                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      {attendancePercentage}%
                    </Typography>
                  </Stack>

                  <LinearProgress
                    variant="determinate"
                    value={Math.min(attendancePercentage, 100)}
                    sx={{
                      height: 9,
                      borderRadius: 99,
                      bgcolor: '#e5e7eb',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 99
                      }
                    }}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gap: 1.4,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: '#f8fafc',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Punch in</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{today?.punchInTime || '-'}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Punch out</Typography>
                    <Typography sx={{ fontWeight: 800 }}>{today?.punchOutTime || '-'}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between">
                    <Typography color="text.secondary">Working hours</Typography>
                    <Typography sx={{ fontWeight: 800 }}>
                      {today?.totalWorkingHoursText || '0h 00m'}
                    </Typography>
                  </Stack>
                </Box>

                <Typography color="text.secondary">
                  {today?.message ||
                    'Attendance is synced from backend records. Manual punch is disabled for interns.'}
                </Typography>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            <Paper
              elevation={0}
              sx={{
                ...cardSx,
                position: 'relative',
                p: 3,
                height: '100%',
                overflow: 'hidden',
                color: '#ffffff',
                background:
                  'linear-gradient(135deg, #111827 0%, #1e1b4b 48%, #7c2d12 120%)',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  width: 240,
                  height: 240,
                  right: -90,
                  top: -110,
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.22)',
                  filter: 'blur(4px)'
                },
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  width: 180,
                  height: 180,
                  left: -70,
                  bottom: -100,
                  borderRadius: '50%',
                  background: 'rgba(124, 58, 237, 0.25)'
                }
              }}
            >
              <Stack spacing={2.5} sx={{ position: 'relative', zIndex: 1 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(255,255,255,0.12)',
                        border: '1px solid rgba(255,255,255,0.18)'
                      }}
                    >
                      <StarIcon sx={{ color: '#fbbf24' }} />
                    </Box>

                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 900 }}>
                        Feedback Summary
                      </Typography>

                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.68)' }}>
                        Your growth signal from manager reviews
                      </Typography>
                    </Box>
                  </Stack>

                  <Chip
                    icon={<AutoAwesomeIcon />}
                    label="Manager Review"
                    size="small"
                    sx={{
                      color: '#ffffff',
                      fontWeight: 800,
                      bgcolor: 'rgba(255,255,255,0.14)',
                      border: '1px solid rgba(255,255,255,0.16)',
                      '& .MuiChip-icon': {
                        color: '#fbbf24'
                      }
                    }}
                  />
                </Stack>

                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2.5}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Box
                    sx={{
                      width: 132,
                      height: 132,
                      borderRadius: '50%',
                      display: 'grid',
                      placeItems: 'center',
                      background: `conic-gradient(#fbbf24 ${feedbackProgress}%, rgba(255,255,255,0.14) 0)`,
                      boxShadow: '0 20px 45px rgba(245, 158, 11, 0.24)'
                    }}
                  >
                    <Box
                      sx={{
                        width: 104,
                        height: 104,
                        borderRadius: '50%',
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'rgba(15, 23, 42, 0.92)',
                        border: '1px solid rgba(255,255,255,0.14)'
                      }}
                    >
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 950, lineHeight: 1 }}>
                          {averageRating}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color: 'rgba(255,255,255,0.62)',
                            fontWeight: 800
                          }}
                        >
                          / 5
                        </Typography>
                      </Box>
                    </Box>
                  </Box>

                  <Box sx={{ flex: 1, width: '100%' }}>
                    <Typography sx={{ color: 'rgba(255,255,255,0.7)', mb: 1 }}>
                      Overall feedback strength
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={feedbackProgress}
                      sx={{
                        height: 10,
                        borderRadius: 99,
                        bgcolor: 'rgba(255,255,255,0.14)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 99,
                          bgcolor: '#fbbf24'
                        }
                      }}
                    />

                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2 }}>
                      <Chip
                        size="small"
                        label={`${feedbackSummary.totalFeedbacks || 0} feedbacks`}
                        sx={{
                          color: '#ffffff',
                          bgcolor: 'rgba(255,255,255,0.12)',
                          fontWeight: 800
                        }}
                      />

                      <Chip
                        size="small"
                        icon={<TrendingUpIcon />}
                        label={
                          averageRating >= 4
                            ? 'Strong progress'
                            : averageRating >= 3
                              ? 'Good progress'
                              : 'Needs improvement'
                        }
                        sx={{
                          color: '#ffffff',
                          bgcolor:
                            averageRating >= 4
                              ? 'rgba(34,197,94,0.2)'
                              : 'rgba(245,158,11,0.18)',
                          fontWeight: 800,
                          '& .MuiChip-icon': {
                            color: averageRating >= 4 ? '#86efac' : '#fbbf24'
                          }
                        }}
                      />
                    </Stack>
                  </Box>
                </Stack>

                <Box
                  sx={{
                    p: 2.2,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.10)',
                    border: '1px solid rgba(255,255,255,0.14)'
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <FormatQuoteIcon sx={{ color: '#fbbf24', mt: 0.3 }} />

                    <Box>
                      <Typography sx={{ fontWeight: 800, lineHeight: 1.6 }}>
                        {feedbackSummary.latestFeedbackComment || 'No manager feedback yet.'}
                      </Typography>

                      <Typography
                        variant="caption"
                        sx={{
                          color: 'rgba(255,255,255,0.58)',
                          display: 'block',
                          mt: 1
                        }}
                      >
                        Latest manager comment
                      </Typography>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Paper
              elevation={0}
              sx={{
                ...cardSx,
                p: { xs: 2.2, sm: 3 },
                bgcolor: '#ffffff',
                borderRadius: 4
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
                sx={{ mb: 3 }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 3,
                      display: 'grid',
                      placeItems: 'center',
                      color: '#2563eb',
                      bgcolor: '#eff6ff',
                      border: '1px solid #dbeafe'
                    }}
                  >
                    <TaskAltIcon />
                  </Box>

                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 950, letterSpacing: '-0.02em' }}>
                      Latest Tasks
                    </Typography>

                    <Typography variant="body2" color="text.secondary">
                      Your recently assigned manager tasks
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`${dashboard.latestTasks?.length || 0} latest`}
                    color="primary"
                    variant="outlined"
                    sx={{ fontWeight: 850, borderRadius: 2 }}
                  />

                  <Chip
                    label={`${taskSummary.pendingTasks || 0} pending`}
                    sx={{
                      fontWeight: 850,
                      borderRadius: 2,
                      color: '#92400e',
                      bgcolor: '#fffbeb',
                      border: '1px solid #fde68a'
                    }}
                  />

                  <Chip
                    label={`${taskSummary.completedTasks || 0} completed`}
                    sx={{
                      fontWeight: 850,
                      borderRadius: 2,
                      color: '#166534',
                      bgcolor: '#f0fdf4',
                      border: '1px solid #bbf7d0'
                    }}
                  />
                </Stack>
              </Stack>

              {dashboard.latestTasks?.length ? (
                <Grid container spacing={2.2}>
                  {dashboard.latestTasks.map((task, index) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      lg={4}
                      key={task.id}
                      sx={{
                        animation: `taskCardIn 0.42s ease ${index * 0.08}s both`,
                        '@keyframes taskCardIn': {
                          from: {
                            opacity: 0,
                            transform: 'translateY(14px) scale(0.98)'
                          },
                          to: {
                            opacity: 1,
                            transform: 'translateY(0) scale(1)'
                          }
                        }
                      }}
                    >
                      <Box
                        sx={{
                          height: '100%',
                          borderRadius: 3,
                          transition: '0.25s ease',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            filter: 'drop-shadow(0 18px 28px rgba(15, 23, 42, 0.12))'
                          },
                          '& > *': {
                            height: '100%',
                            borderRadius: '18px !important'
                          }
                        }}
                      >
                        <TaskCard task={task} />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box
                  sx={{
                    minHeight: 260,
                    display: 'grid',
                    placeItems: 'center',
                    borderRadius: 4,
                    bgcolor: '#f8fafc',
                    border: '1px dashed #cbd5e1'
                  }}
                >
                  <EmptyState
                    title="No tasks assigned yet"
                    message="Your manager-assigned tasks will appear here."
                  />
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <EmptyState
          title="Dashboard unavailable"
          message="No intern dashboard data was returned."
        />
      )}
    </Box>
  );
};

export default InternDashboard;

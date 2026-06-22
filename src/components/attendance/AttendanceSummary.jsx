import { Grid, Paper, Typography } from '@mui/material';
import { attendanceService } from '../../services/attendanceService';

const AttendanceSummary = ({ record, summary }) => {
  const workingHours = attendanceService.getWorkingHours(record);

  return (
    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
        Attendance Summary
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">
            Today's status
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{record?.punchOut ? 'Completed' : record ? 'Punched in' : 'Not started'}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">
            Working hours
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{workingHours}</Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">
            Present days
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>
            {summary.presentDays}/{summary.totalDays}
          </Typography>
        </Grid>
        <Grid item xs={6} md={3}>
          <Typography variant="body2" color="text.secondary">
            Attendance
          </Typography>
          <Typography sx={{ fontWeight: 700 }}>{summary.attendancePercentage}%</Typography>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AttendanceSummary;

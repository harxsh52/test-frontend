import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { useEffect, useState } from 'react';
import EmptyState from '../../components/common/EmptyState';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import { reportService } from '../../services/reportService';
import { ROLES } from '../../utils/roles';

const DepartmentReport = () => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDepartments = async () => {
      if (![ROLES.HR, ROLES.ADMIN].includes(user.role)) {
        setLoading(false);
        return;
      }

      try {
        const records = await reportService.getDepartmentReport();
        if (mounted) setDepartments(records);
      } catch (departmentError) {
        if (mounted) setError(departmentError.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadDepartments();

    return () => {
      mounted = false;
    };
  }, [user.role]);

  if (![ROLES.HR, ROLES.ADMIN].includes(user.role)) {
    return <Alert severity="info">Department reports are available to HR and admin users.</Alert>;
  }

  return (
    <Box>
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Department</TableCell>
                <TableCell>Total Interns</TableCell>
                <TableCell>Active Interns</TableCell>
                <TableCell>Avg Attendance</TableCell>
                <TableCell>Avg Task Completion</TableCell>
                <TableCell>Avg Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departments.length ? (
                departments.map((department) => (
                  <TableRow key={department.departmentId}>
                    <TableCell>{department.departmentName}</TableCell>
                    <TableCell>{department.totalInterns || 0}</TableCell>
                    <TableCell>{department.activeInterns || 0}</TableCell>
                    <TableCell>{Number(department.averageAttendance || 0).toFixed(0)}%</TableCell>
                    <TableCell>{Number(department.averageTaskCompletion || 0).toFixed(0)}%</TableCell>
                    <TableCell>{Number(department.averageRating || 0).toFixed(1)}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6}>
                    <EmptyState title="No department report data" message="Department metrics will appear after interns, tasks, and attendance exist." compact />
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DepartmentReport;

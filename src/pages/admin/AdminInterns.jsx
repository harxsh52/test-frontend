import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminInterns = () => {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getInterns()
      .then(setInterns)
      .catch((internError) => setError(internError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Interns" subtitle="Admin view of every intern profile, manager assignment, company, and performance score." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <DataTable
          rows={interns}
          emptyMessage="No intern profiles found."
          searchPlaceholder="Search interns"
          columns={[
            { field: 'name', headerName: 'Intern', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
            { field: 'empId', headerName: 'Emp ID' },
            { field: 'departmentName', headerName: 'Department' },
            { field: 'subDepartment', headerName: 'Sub Department' },
            { field: 'assignedCompany', headerName: 'Company' },
            { field: 'managerName', headerName: 'Manager' },
            { field: 'finalScore', headerName: 'Final Score', valueGetter: (row) => `${row.finalScore || 0}%` },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> }
          ]}
        />
      )}
    </Box>
  );
};

export default AdminInterns;

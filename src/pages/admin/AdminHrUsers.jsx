import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminHrUsers = () => {
  const [hrUsers, setHrUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getHrUsers()
      .then(setHrUsers)
      .catch((hrError) => setError(hrError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="HR Users" subtitle="Admin visibility over HR accounts and onboarding access." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <DataTable
          rows={hrUsers}
          emptyMessage="No HR users found."
          searchPlaceholder="Search HR users"
          columns={[
            { field: 'name', headerName: 'Name', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
            { field: 'email', headerName: 'Email' },
            { field: 'department', headerName: 'Department' },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> }
          ]}
        />
      )}
    </Box>
  );
};

export default AdminHrUsers;

import { Box, Button, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const AdminManagers = () => {
  const [managers, setManagers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getManagers()
      .then(setManagers)
      .catch((managerError) => setError(managerError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Managers" subtitle="Review all manager accounts and their admin-controlled account status." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <DataTable
          rows={managers}
          emptyMessage="No managers found."
          searchPlaceholder="Search managers"
          columns={[
            { field: 'name', headerName: 'Manager', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
            { field: 'email', headerName: 'Email' },
            { field: 'department', headerName: 'Department' },
            { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
            { field: 'actions', headerName: 'Assigned Interns', sortable: false, searchable: false, render: (row) => <Button size="small" href={`/admin/interns?managerId=${row.id}`}>View</Button> }
          ]}
        />
      )}
    </Box>
  );
};

export default AdminManagers;

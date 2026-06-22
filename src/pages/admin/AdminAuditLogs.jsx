import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import adminService from '../../services/adminService';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminService.getAuditLogs({ page: 0, size: 100 })
      .then((response) => setLogs(response.content || response.data || []))
      .catch((auditError) => setError(auditError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <PageHeader title="Audit Logs" subtitle="Admin-only trace of security-sensitive and operational actions." />
      <ErrorMessage message={error} />
      {loading ? <Loader /> : (
        <DataTable rows={logs} emptyMessage="No audit logs found." searchPlaceholder="Search audit logs" columns={[
          { field: 'actionType', headerName: 'Action', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.actionType}</Typography> },
          { field: 'actorName', headerName: 'Actor' },
          { field: 'entityName', headerName: 'Entity' },
          { field: 'entityId', headerName: 'Entity ID' },
          { field: 'timestamp', headerName: 'Timestamp' }
        ]} />
      )}
    </Box>
  );
};

export default AdminAuditLogs;

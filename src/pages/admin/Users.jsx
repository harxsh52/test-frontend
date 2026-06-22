import LockResetIcon from '@mui/icons-material/LockReset';
import { Box, Button, MenuItem, Select, Snackbar, Stack, Typography, Alert } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import PermissionGate from '../../components/auth/PermissionGate';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';
import { userService } from '../../services/userService';
import { roleLabels } from '../../utils/roleUtils';

const roles = ['INTERN', 'MANAGER', 'HR', 'ADMIN'];
const statuses = ['ACTIVE', 'INACTIVE', 'BLOCKED'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadUsers = async () => {
    setLoading(true);
    try {
      setUsers(await adminService.getUsers());
      setError('');
    } catch (userError) {
      setError(userError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const updateStatus = async (user, status) => {
    setActionLoading(`status-${user.id}`);
    try {
      const updated = await adminService.updateUserStatus(user.id, status);
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
      setSnackbar({ open: true, message: 'User status updated.', severity: 'success' });
    } catch (statusError) {
      setSnackbar({ open: true, message: statusError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const updateRole = async (user, role) => {
    setActionLoading(`role-${user.id}`);
    try {
      const updated = await adminService.updateUserRole(user.id, role);
      setUsers((current) => current.map((item) => (item.id === user.id ? updated : item)));
      setSnackbar({ open: true, message: 'User role updated.', severity: 'success' });
    } catch (roleError) {
      setSnackbar({ open: true, message: roleError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const generateCredentials = async (user) => {
    setActionLoading(`reset-${user.id}`);
    try {
      const result = await userService.generateCredentials(user.id);
      setSnackbar({ open: true, message: `New credentials: ${result.email} / ${result.temporaryPassword}`, severity: 'success' });
    } catch (resetError) {
      setSnackbar({ open: true, message: resetError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Box>
      <PageHeader title="Users" subtitle="Admin-only user, role, status, and password controls." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <DataTable
          rows={users}
          emptyMessage="No users found."
          searchPlaceholder="Search users by name, email, role, or department"
          columns={[
            { field: 'name', headerName: 'Name', render: (user) => <Typography sx={{ fontWeight: 700 }}>{user.name}</Typography> },
            { field: 'email', headerName: 'Email' },
            {
              field: 'role',
              headerName: 'Role',
              render: (user) => (
                <Select
                  size="small"
                  value={user.role}
                  onChange={(event) => updateRole(user, event.target.value)}
                  disabled={Boolean(actionLoading)}
                  sx={{ minWidth: 120 }}
                >
                  {roles.map((role) => <MenuItem key={role} value={role}>{roleLabels[role] || role}</MenuItem>)}
                </Select>
              )
            },
            { field: 'department', headerName: 'Department', valueGetter: (user) => user.department || '-' },
            {
              field: 'status',
              headerName: 'Status',
              render: (user) => (
                <Stack spacing={1} direction="row" alignItems="center">
                  <StatusChip status={user.status} />
                  <Select
                    size="small"
                    value={user.status || 'ACTIVE'}
                    onChange={(event) => updateStatus(user, event.target.value)}
                    disabled={Boolean(actionLoading)}
                    sx={{ minWidth: 120 }}
                  >
                    {statuses.map((status) => <MenuItem key={status} value={status}>{status}</MenuItem>)}
                  </Select>
                </Stack>
              )
            },
            {
              field: 'actions',
              headerName: 'Actions',
              sortable: false,
              searchable: false,
              render: (user) => (
                <PermissionGate permission="ADMIN_USER_MANAGE">
                  <Button
                    size="small"
                    startIcon={<LockResetIcon />}
                    disabled={Boolean(actionLoading)}
                    onClick={() => generateCredentials(user)}
                  >
                    Generate
                  </Button>
                </PermissionGate>
              )
            }
          ]}
        />
      )}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Users;

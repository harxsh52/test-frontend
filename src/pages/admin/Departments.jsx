import AddIcon from '@mui/icons-material/Add';
import BlockIcon from '@mui/icons-material/Block';
import { Alert, Box, Button, Grid, MenuItem, Paper, Snackbar, Stack, Tab, Tabs, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import StatusChip from '../../components/common/StatusChip';
import adminService from '../../services/adminService';

const emptyForm = { departmentId: '', name: '', description: '', status: 'ACTIVE' };

const Departments = () => {
  const [tab, setTab] = useState('departments');
  const [departments, setDepartments] = useState([]);
  const [subDepartments, setSubDepartments] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const loadCatalog = async () => {
    setLoading(true);
    try {
      const [departmentRows, subDepartmentRows, companyRows] = await Promise.all([
        adminService.getDepartments(),
        adminService.getSubDepartments(),
        adminService.getAssignedCompanies()
      ]);
      setDepartments(departmentRows);
      setSubDepartments(subDepartmentRows);
      setCompanies(companyRows);
      setError('');
    } catch (catalogError) {
      setError(catalogError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  const rows = useMemo(() => {
    if (tab === 'subDepartments') return subDepartments;
    if (tab === 'companies') return companies;
    return departments;
  }, [companies, departments, subDepartments, tab]);

  const createItem = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (tab === 'departments') {
        await adminService.createDepartment(form);
      } else if (tab === 'subDepartments') {
        await adminService.createSubDepartment({ ...form, departmentId: Number(form.departmentId) });
      } else {
        await adminService.createAssignedCompany({ ...form, departmentId: Number(form.departmentId) });
      }
      setForm(emptyForm);
      setSnackbar({ open: true, message: 'Catalog item saved.', severity: 'success' });
      await loadCatalog();
    } catch (saveError) {
      setSnackbar({ open: true, message: saveError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const disableItem = async (row) => {
    setSaving(true);
    try {
      if (tab === 'departments') await adminService.disableDepartment(row.id);
      if (tab === 'subDepartments') await adminService.disableSubDepartment(row.id);
      if (tab === 'companies') await adminService.disableAssignedCompany(row.id);
      setSnackbar({ open: true, message: 'Catalog item disabled.', severity: 'success' });
      await loadCatalog();
    } catch (disableError) {
      setSnackbar({ open: true, message: disableError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const catalogColumns = [
    { field: 'name', headerName: 'Name', render: (row) => <Typography sx={{ fontWeight: 700 }}>{row.name}</Typography> },
    ...(tab === 'departments' ? [] : [{ field: 'departmentName', headerName: 'Department' }]),
    { field: 'description', headerName: 'Description', valueGetter: (row) => row.description || '-' },
    { field: 'status', headerName: 'Status', render: (row) => <StatusChip status={row.status} /> },
    ...(tab === 'departments'
      ? [
          { field: 'totalInterns', headerName: 'Interns' },
          { field: 'activeInterns', headerName: 'Active' }
        ]
      : []),
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      searchable: false,
      render: (row) => (
        <Button size="small" color="warning" startIcon={<BlockIcon />} disabled={saving || row.status === 'INACTIVE'} onClick={() => disableItem(row)}>
          Disable
        </Button>
      )
    }
  ];

  return (
    <Box>
      <PageHeader title="Departments" subtitle="Manage departments, sub departments, and assigned companies used across intern allocation." />
      <ErrorMessage message={error} />
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, mb: 3 }}>
        <Tabs value={tab} onChange={(_, value) => { setTab(value); setForm(emptyForm); }} variant="scrollable">
          <Tab label="Departments" value="departments" />
          <Tab label="Sub Departments" value="subDepartments" />
          <Tab label="Assigned Companies" value="companies" />
        </Tabs>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={2}>
            {tab !== 'departments' && (
              <Grid item xs={12} md={3}>
                <TextField select fullWidth label="Department" value={form.departmentId} onChange={(event) => setForm({ ...form, departmentId: event.target.value })}>
                  {departments.map((department) => <MenuItem key={department.id} value={department.id}>{department.name}</MenuItem>)}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} md={tab === 'departments' ? 4 : 3}>
              <TextField fullWidth label="Name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField fullWidth label="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField select fullWidth label="Status" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                <MenuItem value="ACTIVE">ACTIVE</MenuItem>
                <MenuItem value="INACTIVE">INACTIVE</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button fullWidth variant="contained" startIcon={<AddIcon />} disabled={saving || !form.name || (tab !== 'departments' && !form.departmentId)} onClick={createItem} sx={{ height: '100%' }}>
                Add
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>

      {loading ? <Loader /> : <DataTable rows={rows} columns={catalogColumns} emptyMessage="No catalog records found." searchPlaceholder="Search catalog" />}
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar({ ...snackbar, open: false })}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Departments;

import EmailIcon from '@mui/icons-material/Email';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { Alert, Box, Button, MenuItem, Paper, Snackbar, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import Loader from '../../components/common/Loader';
import PageHeader from '../../components/common/PageHeader';
import { notificationService } from '../../services/notificationService';
import { userService } from '../../services/userService';
import { futureOrToday, isEmail, minLength, required } from '../../utils/validation';

const initialFormData = {
  name: '',
  email: '',
  password: '123456',
  departmentId: '',
  managerId: '',
  phone: '',
  college: '',
  skills: '',
  joiningDate: '',
  internshipStartDate: '',
  internshipEndDate: '',
  status: 'ACTIVE'
};

const AddIntern = () => {
  const [departments, setDepartments] = useState([]);
  const [managers, setManagers] = useState([]);
  const [interns, setInterns] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionLoading, setActionLoading] = useState('');
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    let mounted = true;

    const loadOptions = async () => {
      try {
        const [departmentRecords, managerRecords, internRecords] = await Promise.all([
          userService.getDepartments(),
          userService.getUsersByRole('MANAGER'),
          userService.getInterns()
        ]);

        if (mounted) {
          setDepartments(departmentRecords);
          setManagers(managerRecords);
          setInterns(internRecords);
          setFormData((current) => ({
            ...current,
            departmentId: departmentRecords[0]?.id || '',
            managerId: managerRecords[0]?.id || ''
          }));
        }
      } catch (optionsError) {
        if (mounted) {
          setError(optionsError.message);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));
    setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
  };

  const reloadInterns = async () => {
    const internRecords = await userService.getInterns();
    setInterns(internRecords);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {
      name: required(formData.name, 'Full name'),
      email: required(formData.email, 'Email') || (!isEmail(formData.email) ? 'Enter a valid email address.' : ''),
      password: required(formData.password, 'Temporary password') || minLength(formData.password, 6, 'Temporary password'),
      departmentId: required(formData.departmentId, 'Department'),
      managerId: required(formData.managerId, 'Manager'),
      internshipStartDate: futureOrToday(formData.internshipStartDate, 'Start date'),
      internshipEndDate: futureOrToday(formData.internshipEndDate, 'End date')
    };

    if (Object.values(nextErrors).some(Boolean)) {
      setFormErrors(nextErrors);
      return;
    }

    setSaving(true);

    try {
      const internUser = await userService.registerInternUser(formData);
      await userService.createInternProfile({
        userId: internUser.id,
        departmentId: formData.departmentId,
        managerId: formData.managerId,
        phone: formData.phone,
        college: formData.college,
        skills: formData.skills
          .split(',')
          .map((skill) => skill.trim())
          .filter(Boolean),
        joiningDate: formData.joiningDate || null,
        internshipStartDate: formData.internshipStartDate || null,
        internshipEndDate: formData.internshipEndDate || null,
        status: formData.status
      });

      setSnackbar({ open: true, message: 'Intern profile created successfully.', severity: 'success' });
      await reloadInterns();
      setFormData({
        ...initialFormData,
        departmentId: departments[0]?.id || '',
        managerId: managers[0]?.id || ''
      });
    } catch (submitError) {
      setSnackbar({ open: true, message: submitError.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleInternNotification = async (intern, action, successMessage) => {
    const key = `${action}-${intern.id}`;
    setActionLoading(key);

    try {
      await notificationService[action](intern.id);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
    } catch (notificationError) {
      setSnackbar({ open: true, message: notificationError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  const handleGenerateCredentials = async (intern) => {
    const userId = intern.userId || intern.id;
    setActionLoading(`credentials-${intern.id}`);

    try {
      const result = await userService.generateCredentials(userId);
      setSnackbar({ open: true, message: `New credentials: ${result.email} / ${result.temporaryPassword}`, severity: 'success' });
    } catch (credentialsError) {
      setSnackbar({ open: true, message: credentialsError.message, severity: 'error' });
    } finally {
      setActionLoading('');
    }
  };

  return (
    <Box>
      <PageHeader title="Add Intern" subtitle="Create an intern login and connect it to department and manager details." />
      <ErrorMessage message={error} />
      {loading ? (
        <Loader />
      ) : (
        <Stack spacing={3}>
          <Paper component="form" onSubmit={handleSubmit} elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, border: '1px solid', borderColor: 'divider', borderRadius: 2, maxWidth: 760 }}>
            <Stack spacing={2}>
              <TextField label="Full name" name="name" value={formData.name} onChange={handleChange} required error={Boolean(formErrors.name)} helperText={formErrors.name} />
              <TextField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} required error={Boolean(formErrors.email)} helperText={formErrors.email} />
              <TextField
                label="Temporary password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                error={Boolean(formErrors.password)}
                helperText={formErrors.password || 'Minimum 6 characters'}
              />
              <TextField select label="Department" name="departmentId" value={formData.departmentId} onChange={handleChange} required error={Boolean(formErrors.departmentId)} helperText={formErrors.departmentId}>
                {departments.map((department) => (
                  <MenuItem key={department.id} value={department.id}>
                    {department.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField select label="Manager" name="managerId" value={formData.managerId} onChange={handleChange} required error={Boolean(formErrors.managerId)} helperText={formErrors.managerId}>
                {managers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                    {manager.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Phone" name="phone" value={formData.phone} onChange={handleChange} />
              <TextField label="College" name="college" value={formData.college} onChange={handleChange} />
              <TextField label="Skills" name="skills" value={formData.skills} onChange={handleChange} helperText="Separate skills with commas" />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  label="Joining date"
                  name="joiningDate"
                  type="date"
                  value={formData.joiningDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={Boolean(formErrors.internshipStartDate)}
                  helperText={formErrors.internshipStartDate}
                />
                <TextField
                  label="Start date"
                  name="internshipStartDate"
                  type="date"
                  value={formData.internshipStartDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  error={Boolean(formErrors.internshipEndDate)}
                  helperText={formErrors.internshipEndDate}
                />
                <TextField
                  label="End date"
                  name="internshipEndDate"
                  type="date"
                  value={formData.internshipEndDate}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />
              </Stack>
              <Button
                type="submit"
                variant="contained"
                startIcon={<PersonAddIcon />}
                sx={{ alignSelf: { xs: 'stretch', sm: 'flex-start' } }}
                disabled={saving || !departments.length || !managers.length}
              >
                {saving ? 'Adding...' : 'Add Intern'}
              </Button>
            </Stack>
          </Paper>

          <Box>
            <Typography variant="h6" sx={{ fontWeight: 850, mb: 1.5 }}>Intern Email Actions</Typography>
            <DataTable
              rows={interns}
              emptyMessage="No intern profiles found."
              columns={[
                { field: 'name', headerName: 'Intern', render: (intern) => <Typography sx={{ fontWeight: 700 }}>{intern.name}</Typography> },
                { field: 'email', headerName: 'Email' },
                { field: 'department', headerName: 'Department', valueGetter: (intern) => intern.department || intern.departmentName || '-' },
                { field: 'manager', headerName: 'Manager', valueGetter: (intern) => intern.manager || intern.managerName || '-' },
                {
                  field: 'actions',
                  headerName: 'Email Actions',
                  align: 'right',
                  sortable: false,
                  searchable: false,
                  render: (intern) => (
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" startIcon={<EmailIcon />} onClick={() => handleInternNotification(intern, 'sendDepartmentAssignment', 'Department assignment email processed.')} disabled={actionLoading === `sendDepartmentAssignment-${intern.id}`}>
                        Department
                      </Button>
                      <Button size="small" startIcon={<EmailIcon />} onClick={() => handleInternNotification(intern, 'sendManagerAssignment', 'Manager assignment email processed.')} disabled={actionLoading === `sendManagerAssignment-${intern.id}`}>
                        Manager
                      </Button>
                      <Button size="small" variant="outlined" startIcon={<EmailIcon />} onClick={() => handleInternNotification(intern, 'sendOnboarding', 'Onboarding email processed.')} disabled={actionLoading === `sendOnboarding-${intern.id}`}>
                        Onboarding
                      </Button>
                      <Button size="small" startIcon={<LockResetIcon />} onClick={() => handleGenerateCredentials(intern)} disabled={actionLoading === `credentials-${intern.id}`}>
                        Credentials
                      </Button>
                    </Stack>
                  )
                }
              ]}
            />
          </Box>
        </Stack>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AddIntern;

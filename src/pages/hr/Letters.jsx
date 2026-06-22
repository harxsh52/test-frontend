import AddIcon from '@mui/icons-material/Add';
import DownloadIcon from '@mui/icons-material/Download';
import SendIcon from '@mui/icons-material/Send';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { Alert, Box, Button, IconButton, MenuItem, Snackbar, Stack, TextField, Tooltip } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataTable from '../../components/common/DataTable';
import ErrorMessage from '../../components/common/ErrorMessage';
import PageHeader from '../../components/common/PageHeader';
import LetterStatusChip from '../../components/letters/LetterStatusChip';
import LetterTypeChip from '../../components/letters/LetterTypeChip';
import { letterService, letterStatuses, letterTypes } from '../../services/letterService';
import { formatDate } from '../../utils/dateUtils';

const label = (value) => (value ? value.replaceAll('_', ' ') : 'All');

const Letters = ({ admin = false }) => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState([]);
  const [filters, setFilters] = useState({ letterType: '', status: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const basePath = admin ? '/admin/letters' : '/hr/letters';

  const loadLetters = async () => {
    setLoading(true);
    setError('');
    try {
      setLetters(await letterService.getLetters());
    } catch (letterError) {
      setError(letterError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLetters();
  }, []);

  const filteredLetters = useMemo(
    () => letters.filter((letter) =>
      (!filters.letterType || letter.letterType === filters.letterType)
      && (!filters.status || letter.status === filters.status)
    ),
    [filters, letters]
  );

  const handleSend = async (letterId) => {
    try {
      const sentLetter = await letterService.sendLetter(letterId);
      setLetters((current) => current.map((letter) => (letter.id === sentLetter.id ? sentLetter : letter)));
      setSnackbar({ open: true, message: 'Letter sent successfully.', severity: 'success' });
    } catch (sendError) {
      setSnackbar({ open: true, message: sendError.message, severity: 'error' });
    }
  };

  const handleDownload = async (letterId) => {
    try {
      await letterService.downloadLetter(letterId);
    } catch (downloadError) {
      setSnackbar({ open: true, message: downloadError.message, severity: 'error' });
    }
  };

  const columns = [
    { field: 'candidateName', headerName: 'Candidate', sx: { minWidth: 180 } },
    { field: 'candidateEmail', headerName: 'Email', sx: { minWidth: 220 } },
    { field: 'letterType', headerName: 'Type', render: (row) => <LetterTypeChip type={row.letterType} /> },
    { field: 'roleName', headerName: 'Role', sx: { minWidth: 180 } },
    { field: 'status', headerName: 'Status', render: (row) => <LetterStatusChip status={row.status} /> },
    { field: 'createdAt', headerName: 'Created', render: (row) => formatDate(row.createdAt) },
    {
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      searchable: false,
      render: (row) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => navigate(`${basePath}/${row.id}`)}><VisibilityIcon fontSize="small" /></IconButton>
          </Tooltip>
          <Tooltip title="Send">
            <span><IconButton size="small" color="primary" onClick={() => handleSend(row.id)} disabled={row.status === 'SENT'}><SendIcon fontSize="small" /></IconButton></span>
          </Tooltip>
          <Tooltip title="Download">
            <IconButton size="small" onClick={() => handleDownload(row.id)}><DownloadIcon fontSize="small" /></IconButton>
          </Tooltip>
        </Stack>
      )
    }
  ];

  return (
    <Box>
      <PageHeader
        title={admin ? 'All Letters' : 'Letters'}
        subtitle="Generate, preview, send, and track internship letters."
        actions={!admin ? <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/hr/generate-letter')}>Generate Letter</Button> : null}
      />
      <ErrorMessage message={error} />
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2.5 }}>
        <TextField select size="small" label="Letter type" value={filters.letterType} onChange={(event) => setFilters((current) => ({ ...current, letterType: event.target.value }))} sx={{ minWidth: 240 }}>
          {['', ...letterTypes].map((type) => <MenuItem key={type || 'all'} value={type}>{label(type)}</MenuItem>)}
        </TextField>
        <TextField select size="small" label="Status" value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))} sx={{ minWidth: 180 }}>
          {['', ...letterStatuses].map((status) => <MenuItem key={status || 'all'} value={status}>{label(status)}</MenuItem>)}
        </TextField>
      </Stack>
      <DataTable columns={columns} rows={filteredLetters} loading={loading} searchPlaceholder="Search by candidate, email, or role" emptyTitle="No letters found" emptyMessage="Generated letters will appear here." />
      <Snackbar open={snackbar.open} autoHideDuration={3500} onClose={() => setSnackbar((current) => ({ ...current, open: false }))}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default Letters;

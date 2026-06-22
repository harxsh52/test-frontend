import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  TextField
} from '@mui/material';
import { useMemo, useState } from 'react';
import EmptyState from './EmptyState';
import ErrorMessage from './ErrorMessage';
import Loader from './Loader';

const getCellValue = (row, column) => {
  if (column.valueGetter) return column.valueGetter(row);
  return row[column.field];
};

const DataTable = ({
  columns,
  rows = [],
  emptyMessage = 'No records found.',
  emptyTitle = 'No records found',
  getRowId = (row) => row.id,
  loading = false,
  error = '',
  searchPlaceholder = 'Search records'
}) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [orderBy, setOrderBy] = useState(columns[0]?.field || '');
  const [order, setOrder] = useState('asc');

  const filteredRows = useMemo(() => {
    const query = search.trim().toLowerCase();
    const searchableRows = query
      ? rows.filter((row) =>
          columns.some((column) => {
            if (column.searchable === false) return false;
            const value = getCellValue(row, column);
            return String(value ?? '').toLowerCase().includes(query);
          })
        )
      : rows;

    return [...searchableRows].sort((first, second) => {
      const firstValue = getCellValue(first, columns.find((column) => column.field === orderBy) || {});
      const secondValue = getCellValue(second, columns.find((column) => column.field === orderBy) || {});
      const comparison = String(firstValue ?? '').localeCompare(String(secondValue ?? ''), undefined, { numeric: true });
      return order === 'asc' ? comparison : -comparison;
    });
  }, [columns, order, orderBy, rows, search]);

  const pagedRows = filteredRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const handleSort = (field) => {
    setOrder((currentOrder) => (orderBy === field && currentOrder === 'asc' ? 'desc' : 'asc'));
    setOrderBy(field);
  };

  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <TextField
          fullWidth
          size="small"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(0);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
      </Box>
      {error ? <Box sx={{ px: 2, pt: 2 }}><ErrorMessage message={error} /></Box> : null}
      {loading ? (
        <Loader minHeight={260} />
      ) : (
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell key={column.field} align={column.align || 'left'} sx={{ whiteSpace: 'nowrap' }}>
                  {column.sortable === false ? (
                    column.headerName
                  ) : (
                    <TableSortLabel
                      active={orderBy === column.field}
                      direction={orderBy === column.field ? order : 'asc'}
                      onClick={() => handleSort(column.field)}
                    >
                      {column.headerName}
                    </TableSortLabel>
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {pagedRows.length ? (
              pagedRows.map((row, rowIndex) => (
                <TableRow hover key={getRowId(row) ?? `${page}-${rowIndex}`}>
                  {columns.map((column) => (
                    <TableCell key={column.field} align={column.align || 'left'} sx={column.sx}>
                      {column.render ? column.render(row) : getCellValue(row, column) || '-'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 4 }}>
                  <EmptyState title={emptyTitle} message={emptyMessage} compact />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        </TableContainer>
      )}
      <Stack direction={{ xs: 'column', sm: 'row' }} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <TablePagination
          component="div"
          count={filteredRows.length}
          page={Math.min(page, Math.max(Math.ceil(filteredRows.length / rowsPerPage) - 1, 0))}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          sx={{
            width: '100%',
            '.MuiTablePagination-toolbar': {
              flexWrap: 'wrap',
              gap: 1,
              justifyContent: { xs: 'center', sm: 'flex-end' },
              minHeight: 56
            },
            '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
              m: 0
            }
          }}
        />
      </Stack>
    </Paper>
  );
};

export default DataTable;

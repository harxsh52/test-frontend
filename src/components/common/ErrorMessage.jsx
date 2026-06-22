import { Alert, AlertTitle } from '@mui/material';

const ErrorMessage = ({ message, title = 'Something needs attention' }) => {
  if (!message) return null;

  return (
    <Alert severity="error" sx={{ mb: 3, alignItems: 'flex-start' }}>
      <AlertTitle sx={{ fontWeight: 800 }}>{title}</AlertTitle>
      {message}
    </Alert>
  );
};

export default ErrorMessage;

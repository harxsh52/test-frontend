import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import ErrorMessage from '../../components/common/ErrorMessage';
import { useAuth } from '../../context/AuthContext';
import { getDashboardPath } from '../../utils/roleUtils';
import { isEmail, minLength, required } from '../../utils/validation';
import '../../css/Login.css';

const Login = () => {
  const { isAuthenticated, login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user && !loginSuccess) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [isAuthenticated, navigate, user, loginSuccess]);

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value
    }));

    setFormErrors((current) => ({
      ...current,
      [event.target.name]: ''
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const nextErrors = {
      email:
        required(formData.email, 'Email') ||
        (!isEmail(formData.email) ? 'Enter a valid email address.' : ''),
      password:
        required(formData.password, 'Password') ||
        minLength(formData.password, 6, 'Password')
    };

    if (nextErrors.email || nextErrors.password) {
      setFormErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const loggedInUser = await login(formData);

      const requestedPath = location.state?.from?.pathname;
      const rolePathPrefix = `/${loggedInUser.role.toLowerCase()}/`;

      const redirectPath = requestedPath?.startsWith(rolePathPrefix)
        ? requestedPath
        : getDashboardPath(loggedInUser.role);

      setLoginSuccess(true);

      setTimeout(() => {
        navigate(redirectPath, { replace: true });
      }, 2000);
    } catch (loginError) {
      setLoginSuccess(false);
      setError(loginError.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-blur login-blur-one"></div>
      <div className="login-blur login-blur-two"></div>
      <div className="login-blur login-blur-three"></div>

      <section className={`login-card ${loginSuccess ? 'login-card-approved' : ''}`}>
        {loginSuccess ? (
          <div className="login-success-box">
            <div className="success-animation-wrap">
              <svg className="success-svg" viewBox="0 0 120 120" aria-hidden="true">
                <circle className="success-circle-bg" cx="60" cy="60" r="42" />
                <circle className="success-circle-progress" cx="60" cy="60" r="42" />
                <path className="success-check-path" d="M38 62 L54 78 L84 46" />
              </svg>
            </div>

            <h2 className="success-title">You are logged in</h2>
            <p className="success-subtitle">Taking you to your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="login-header">
              <div className="login-logo">IQ</div>
              <h1>InternIQ</h1>
              <p>Sign in to your workspace</p>
            </div>

            <ErrorMessage message={error} />

            <ErrorMessage
              message={
                location.state?.reason === 'SESSION_EXPIRED'
                  ? 'Your session expired. Please sign in again.'
                  : ''
              }
            />

            <form onSubmit={handleSubmit} noValidate className="login-form">
              <div className="login-field">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  required
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={loading}
                  className={formErrors.email ? 'input-error' : ''}
                />

                {formErrors.email && <p className="field-error">{formErrors.email}</p>}
              </div>

              <div className="login-field">
                <label htmlFor="password">Password</label>

                <input
                  id="password"
                  required
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                  className={formErrors.password ? 'input-error' : ''}
                />

                {formErrors.password && <p className="field-error">{formErrors.password}</p>}
              </div>

              <button type="submit" disabled={loading} className="login-button">
                {loading && <span className="button-loader"></span>}
                {loading ? 'Signing in...' : 'Login'}
              </button>

              <div className="forgot-password">
                <RouterLink to="/forgot-password">Forgot password?</RouterLink>
              </div>
            </form>
          </>
        )}
      </section>
    </main>
  );
};

export default Login;




// import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
// import { Avatar, Box, Button, CircularProgress, Container, Paper, Stack, TextField, Typography } from '@mui/material';
// import { useEffect, useState } from 'react';
// import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
// import ErrorMessage from '../../components/common/ErrorMessage';
// import { useAuth } from '../../context/AuthContext';
// import { getDashboardPath } from '../../utils/roleUtils';
// import { isEmail, minLength, required } from '../../utils/validation';

// const Login = () => {
//   const { isAuthenticated, login, user } = useAuth();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [formData, setFormData] = useState({ email: '', password: '' });
//   const [formErrors, setFormErrors] = useState({});
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (isAuthenticated && user) {
//       navigate(getDashboardPath(user.role), { replace: true });
//     }
//   }, [isAuthenticated, navigate, user]);

//   const handleChange = (event) => {
//     setFormData((current) => ({
//       ...current,
//       [event.target.name]: event.target.value
//     }));
//     setFormErrors((current) => ({ ...current, [event.target.name]: '' }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();
//     setError('');

//     const nextErrors = {
//       email: required(formData.email, 'Email') || (!isEmail(formData.email) ? 'Enter a valid email address.' : ''),
//       password: required(formData.password, 'Password') || minLength(formData.password, 6, 'Password')
//     };

//     if (nextErrors.email || nextErrors.password) {
//       setFormErrors(nextErrors);
//       return;
//     }

//     setLoading(true);

//     try {
//       const loggedInUser = await login(formData);
//       const requestedPath = location.state?.from?.pathname;
//       const rolePathPrefix = `/${loggedInUser.role.toLowerCase()}/`;
//       const redirectPath = requestedPath?.startsWith(rolePathPrefix) ? requestedPath : getDashboardPath(loggedInUser.role);
//       navigate(redirectPath, { replace: true });
//     } catch (loginError) {
//       setError(loginError.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box
//       sx={{
//         minHeight: '100vh',
//         display: 'grid',
//         placeItems: 'center',
//         bgcolor: '#f5f7fb',
//         px: 2,
//         py: 4
//       }}
//     >
//       <Container maxWidth="xs">
//         <Paper
//           elevation={0}
//           sx={{
//             p: { xs: 3, sm: 4 },
//             borderRadius: 2,
//             border: '1px solid',
//             borderColor: 'divider',
//             boxShadow: '0 24px 70px rgba(15, 23, 42, 0.10)'
//           }}
//         >
//           <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
//             <Avatar sx={{ mb: 2, bgcolor: 'primary.main', width: 52, height: 52 }}>
//               <LockOutlinedIcon />
//             </Avatar>
//             <Typography component="h1" variant="h4" sx={{ fontWeight: 800 }}>
//               InternIQ
//             </Typography>
//             <Typography color="text.secondary">Sign in to your workspace</Typography>
//           </Box>

//           <ErrorMessage message={error} />
//           <ErrorMessage message={location.state?.reason === 'SESSION_EXPIRED' ? 'Your session expired. Please sign in again.' : ''} />

//           <Box component="form" onSubmit={handleSubmit} noValidate>
//             <Stack spacing={2}>
//               <TextField
//                 fullWidth
//                 required
//                 label="Email"
//                 name="email"
//                 autoComplete="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 error={Boolean(formErrors.email)}
//                 helperText={formErrors.email}
//               />
//               <TextField
//                 fullWidth
//                 required
//                 label="Password"
//                 name="password"
//                 type="password"
//                 autoComplete="current-password"
//                 value={formData.password}
//                 onChange={handleChange}
//                 error={Boolean(formErrors.password)}
//                 helperText={formErrors.password}
//               />
//             </Stack>
//             <Button
//               fullWidth
//               type="submit"
//               variant="contained"
//               size="large"
//               disabled={loading}
//               startIcon={loading ? <CircularProgress color="inherit" size={18} /> : null}
//               sx={{ mt: 3, minHeight: 46 }}
//             >
//               {loading ? 'Signing in' : 'Login'}
//             </Button>
//             <Button component={RouterLink} to="/forgot-password" fullWidth sx={{ mt: 1 }}>
//               Forgot password?
//             </Button>
//           </Box>
//         </Paper>
//       </Container>
//     </Box>
//   );
// };

// export default Login;

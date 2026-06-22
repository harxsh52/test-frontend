import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Unauthorized from '../pages/auth/Unauthorized';
import Forbidden from '../pages/auth/Forbidden';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

let authState;

vi.mock('../context/AuthContext', () => ({
  useAuth: () => authState
}));

const renderProtectedRoute = (initialPath = '/intern/dashboard') =>
  render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/intern/dashboard" element={<h1>Intern Dashboard</h1>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );

describe('Route protection', () => {
  beforeEach(() => {
    authState = {
      authLoading: false,
      isAuthenticated: false,
      sessionExpired: false,
      user: null,
      logout: vi.fn()
    };
  });

  it('blocks unauthenticated users from protected routes', () => {
    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Login Page' })).toBeInTheDocument();
  });

  it('allows authenticated users into protected routes', () => {
    authState = {
      ...authState,
      isAuthenticated: true,
      user: { id: 1, role: 'INTERN', name: 'Aarav Mehta' }
    };

    renderProtectedRoute();

    expect(screen.getByRole('heading', { name: 'Intern Dashboard' })).toBeInTheDocument();
  });

  it('renders the Unauthorized page', () => {
    authState = {
      ...authState,
      isAuthenticated: true,
      user: { id: 1, role: 'INTERN', name: 'Aarav Mehta' }
    };

    render(
      <MemoryRouter initialEntries={['/unauthorized']}>
        <Routes>
          <Route path="/unauthorized" element={<Unauthorized />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Unauthorized' })).toBeInTheDocument();
    expect(screen.getByText('Your role does not have access to this page.')).toBeInTheDocument();
  });

  it('redirects authenticated users with the wrong role to forbidden', () => {
    authState = {
      ...authState,
      isAuthenticated: true,
      user: { id: 1, role: 'INTERN', name: 'Aarav Mehta' }
    };

    render(
      <MemoryRouter initialEntries={['/admin/users']}>
        <Routes>
          <Route path="/forbidden" element={<Forbidden />} />
          <Route element={<RoleRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/users" element={<h1>Users Page</h1>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Access Forbidden' })).toBeInTheDocument();
  });
});

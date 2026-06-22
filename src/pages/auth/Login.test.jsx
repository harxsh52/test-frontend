import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Login from './Login';

const loginMock = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    login: loginMock,
    user: null
  })
}));

const renderLogin = () =>
  render(
    <MemoryRouter initialEntries={['/login']}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/manager/dashboard" element={<h1>Manager Dashboard</h1>} />
      </Routes>
    </MemoryRouter>
  );

const passwordInput = () => screen.getByLabelText(/Password/);

describe('Login page', () => {
  beforeEach(() => {
    loginMock.mockReset();
  });

  it('renders the login form', () => {
    renderLogin();

    expect(screen.getByRole('heading', { name: 'InternIQ' })).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Email' })).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
  });

  it('shows validation errors for invalid login input', async () => {
    renderLogin();

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'not-an-email');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Enter a valid email address.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it('redirects to the dashboard for a valid role login', async () => {
    loginMock.mockResolvedValue({
      id: 2,
      name: 'Nisha Rao',
      email: 'manager@test.com',
      role: 'MANAGER'
    });

    renderLogin();

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'manager@test.com');
    await userEvent.type(passwordInput(), '123456');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByRole('heading', { name: 'Manager Dashboard' })).toBeInTheDocument();
  });

  it('shows backend login errors', async () => {
    loginMock.mockRejectedValue(new Error('Invalid email or password.'));

    renderLogin();

    await userEvent.type(screen.getByRole('textbox', { name: 'Email' }), 'manager@test.com');
    await userEvent.type(passwordInput(), 'wrong-password');
    await userEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument();
  });
});

import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import Sidebar from './Sidebar';

let mockedUser = { id: 2, name: 'Nisha Rao', role: 'MANAGER' };

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: mockedUser })
}));

const renderSidebar = () =>
  render(
    <MemoryRouter>
      <Sidebar drawerWidth={260} mobileOpen={false} onClose={vi.fn()} />
    </MemoryRouter>
  );

describe('Sidebar', () => {
  it('renders the manager role menu', () => {
    mockedUser = { id: 2, name: 'Nisha Rao', role: 'MANAGER' };

    renderSidebar();

    expect(screen.getByRole('link', { name: 'My Interns' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assign Task' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Users' })).not.toBeInTheDocument();
  });

  it('renders the admin role menu', () => {
    mockedUser = { id: 4, name: 'Rahul Admin', role: 'ADMIN' };

    renderSidebar();

    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Departments' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Settings' })).toBeInTheDocument();
  });
});

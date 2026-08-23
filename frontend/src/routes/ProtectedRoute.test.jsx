import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './ProtectedRoute';

const useAuthMock = vi.fn();
vi.mock('../auth/AuthContext', () => ({ useAuth: () => useAuthMock() }));

function renderGuard({ roles, authState }) {
  useAuthMock.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <Routes>
        <Route path="/secret" element={<RequireAuth roles={roles}><div>protected content</div></RequireAuth>} />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/dashboard" element={<div>dashboard page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  it('shows spinner while bootstrapping', () => {
    renderGuard({ roles: undefined, authState: { user: null, role: null, bootstrapped: false } });
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redirects unauthenticated users to login', () => {
    renderGuard({ roles: undefined, authState: { user: null, role: 'student', bootstrapped: true } });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children for authenticated users', () => {
    renderGuard({
      roles: undefined,
      authState: { user: { id: 1, name: 'Ada', role: 'student' }, role: 'student', bootstrapped: true },
    });
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
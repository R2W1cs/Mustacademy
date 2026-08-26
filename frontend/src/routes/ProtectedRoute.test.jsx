import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { RequireAuth } from './ProtectedRoute';

const useAuthMock = vi.fn();
vi.mock('../auth/AuthContext', () => ({ useAuth: () => useAuthMock() }));

function renderGuard({ roles, allowIncompleteProfile, authState, initial = '/secret' }) {
  useAuthMock.mockReturnValue(authState);
  return render(
    <MemoryRouter initialEntries={[initial]}>
      <Routes>
        <Route
          path="/secret"
          element={
            <RequireAuth roles={roles} allowIncompleteProfile={allowIncompleteProfile}>
              <div>protected content</div>
            </RequireAuth>
          }
        />
        <Route path="/login" element={<div>login page</div>} />
        <Route path="/dashboard" element={<div>dashboard page</div>} />
        <Route path="/profile/setup" element={<div>profile setup page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RequireAuth', () => {
  it('shows spinner while bootstrapping', () => {
    renderGuard({
      roles: undefined,
      authState: { user: null, role: null, bootstrapped: false, profileComplete: false },
    });
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('redirects unauthenticated users to login', () => {
    renderGuard({
      roles: undefined,
      authState: { user: null, role: 'student', bootstrapped: true, profileComplete: false },
    });
    expect(screen.getByText('login page')).toBeInTheDocument();
  });

  it('renders children for authenticated users with complete profile', () => {
    renderGuard({
      roles: undefined,
      authState: {
        user: { id: 1, name: 'Ada', role: 'student', profile_complete: true },
        role: 'student',
        bootstrapped: true,
        profileComplete: true,
      },
    });
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('redirects incomplete student profiles to setup', () => {
    renderGuard({
      roles: undefined,
      authState: {
        user: { id: 1, name: 'Ada', role: 'student', profile_complete: false },
        role: 'student',
        bootstrapped: true,
        profileComplete: false,
      },
    });
    expect(screen.getByText('profile setup page')).toBeInTheDocument();
  });

  it('allows incomplete profile on setup route', () => {
    renderGuard({
      allowIncompleteProfile: true,
      authState: {
        user: { id: 1, name: 'Ada', role: 'student', profile_complete: false },
        role: 'student',
        bootstrapped: true,
        profileComplete: false,
      },
    });
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});

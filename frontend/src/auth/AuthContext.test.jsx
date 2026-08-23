import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const mockGet = vi.fn();
const mockPost = vi.fn();

vi.mock('../api/axios', () => ({
  default: {
    get: (...args) => mockGet(...args),
    post: (...args) => mockPost(...args),
  },
}));

function Probe() {
  const { user, isAuthenticated, bootstrapped } = useAuth();
  if (!bootstrapped) return <div data-testid="loading">loading</div>;
  return (
    <div>
      <span data-testid="auth">{isAuthenticated ? 'yes' : 'no'}</span>
      <span data-testid="name">{user?.name ?? 'none'}</span>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    localStorage.clear();
  });

  it('bootstraps session from /auth/session', async () => {
    mockGet.mockResolvedValueOnce({ data: { user: { id: 1, name: 'Ada', role: 'student' } } });
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('yes'));
    expect(localStorage.getItem('userId')).toBe('1');
  });

  it('clears user when session fails', async () => {
    mockGet.mockRejectedValueOnce(new Error('401'));
    render(<AuthProvider><Probe /></AuthProvider>);
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('no'));
  });

  it('login persists user metadata', async () => {
    mockGet.mockRejectedValueOnce(new Error('401'));
    function LoginProbe() {
      const { login, user } = useAuth();
      return (
        <div>
          <button type="button" onClick={() => login({ id: 2, name: 'Grace', role: 'admin' })}>sign-in</button>
          <span data-testid="name">{user?.name ?? 'none'}</span>
        </div>
      );
    }
    render(<AuthProvider><LoginProbe /></AuthProvider>);
    await waitFor(() => screen.getByRole('button', { name: 'sign-in' }));
    await act(async () => { screen.getByRole('button', { name: 'sign-in' }).click(); });
    expect(screen.getByTestId('name')).toHaveTextContent('Grace');
  });
});
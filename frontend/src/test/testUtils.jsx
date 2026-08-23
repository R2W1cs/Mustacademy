import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../auth/AuthContext';

export function renderWithRouter(ui, { route = '/', auth = true } = {}) {
  const Wrapper = ({ children }) => (
    <MemoryRouter initialEntries={[route]}>
      {auth ? <AuthProvider>{children}</AuthProvider> : children}
    </MemoryRouter>
  );
  return render(ui, { wrapper: Wrapper });
}
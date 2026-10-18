import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import LoginPage from '../src/pages/auth/LoginPage';
import ProtectedRoute from '../src/components/auth/ProtectedRoute';
import authReducer from '../src/store/slices/authSlice';
import { AuthService } from '../src/services/AuthService';

vi.mock('../src/services/AuthService', () => ({
  AuthService: {
    login: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Stage 7B.5: Fail-Closed Authentication & Protected Route Security', () => {
  let store: any;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  afterEach(() => {
    localStorage.clear();
  });

  const renderLoginPage = (initialPath = '/login') => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={[initialPath]}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
              <Route path="/admin" element={<div data-testid="admin-page">Admin Dashboard</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  it('1. HTTP 503 during login leaves the user unauthenticated and shows service unavailable error', async () => {
    vi.mocked(AuthService.login).mockRejectedValueOnce({
      response: { status: 503, data: { message: 'Service Unavailable' } },
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Client Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

    fireEvent.change(emailInput, { target: { value: 'admin@ecommerce.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Authentication service is currently unavailable/i)).toBeInTheDocument();
    });

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
  });

  it('2. A network failure leaves the user unauthenticated and displays connection error', async () => {
    vi.mocked(AuthService.login).mockRejectedValueOnce(new Error('Network Error'));

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Client Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

    fireEvent.change(emailInput, { target: { value: 'admin@ecommerce.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Unable to reach authentication services/i)).toBeInTheDocument();
    });

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('3. Invalid credentials do not activate demo login and leave user unauthenticated', async () => {
    vi.mocked(AuthService.login).mockRejectedValueOnce({
      response: { status: 401, data: { message: 'Bad credentials' } },
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Client Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

    fireEvent.change(emailInput, { target: { value: 'admin@ecommerce.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Invalid credentials/i)).toBeInTheDocument();
    });

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('4. Demo fill buttons only populate form values without bypassing authentication', async () => {
    renderLoginPage();

    const fillAdminBtn = screen.getByRole('button', { name: /Fill Admin Atelier/i });
    fireEvent.click(fillAdminBtn);

    const emailInput = screen.getByLabelText(/Client Email Address/i) as HTMLInputElement;
    const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;

    expect(emailInput.value).toBe('admin@ecommerce.com');
    expect(passwordInput.value).toBe('admin123');

    // AuthService.login must not have been called simply by filling the form
    expect(AuthService.login).not.toHaveBeenCalled();

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
  });

  it('5. No demo token or admin session is persisted in localStorage on failed login', async () => {
    localStorage.setItem('token', 'stale-token-from-prior-session');

    vi.mocked(AuthService.login).mockRejectedValueOnce({
      response: { status: 503, data: { message: 'Outage' } },
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Client Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

    fireEvent.change(emailInput, { target: { value: 'admin@ecommerce.com' } });
    fireEvent.change(passwordInput, { target: { value: 'admin123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Authentication service is currently unavailable/i)).toBeInTheDocument();
    });

    // Stale token must be expunged fail-closed
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('6. Unauthenticated users are redirected from /admin and /admin/orders', () => {
    render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/admin/orders']}>
            <Routes>
              <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin" element={<Outlet />}>
                  <Route path="orders" element={<div data-testid="admin-orders">Orders</div>} />
                </Route>
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-orders')).not.toBeInTheDocument();
  });

  it('7. Customer roles cannot enter admin routes and are redirected fail-closed', () => {
    const customerStore = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: {
            id: 'cust-1',
            email: 'client@lumiere.com',
            firstName: 'Client',
            lastName: 'User',
            roles: ['CUSTOMER'],
          },
          token: 'valid-customer-token',
          isAuthenticated: true,
        },
      },
    });

    render(
      <Provider store={customerStore}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/admin/products']}>
            <Routes>
              <Route path="/" element={<div data-testid="storefront-home">Home</div>} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin/products" element={<div data-testid="admin-products">Products</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    // Blocked from admin route and redirected to home (/)
    expect(screen.getByTestId('storefront-home')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-products')).not.toBeInTheDocument();
  });

  it('8. A successful real authentication still works correctly', async () => {
    vi.mocked(AuthService.login).mockResolvedValueOnce({
      token: 'real-backend-jwt-token-xyz',
      user: {
        id: 'user-real-uuid',
        email: 'director@lumiere.com',
        firstName: 'Directeur',
        lastName: 'Maison',
        roles: ['ADMIN'],
      },
    });

    renderLoginPage();

    const emailInput = screen.getByLabelText(/Client Email Address/i);
    const passwordInput = screen.getByLabelText(/^Password/i);
    const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

    fireEvent.change(emailInput, { target: { value: 'director@lumiere.com' } });
    fireEvent.change(passwordInput, { target: { value: 'SecretPassword@123' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByTestId('home-page')).toBeInTheDocument();
    });

    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(true);
    expect(state.token).toBe('real-backend-jwt-token-xyz');
    expect(state.user?.roles).toEqual(['ADMIN']);
    // Stage 9F: Fix 4 — Tokens must strictly remain in memory and NEVER be written to localStorage or sessionStorage
    expect(localStorage.getItem('token')).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('9. Malformed, untrusted, or non-array roles strictly fail closed', () => {
    const malformedStore = configureStore({
      reducer: { auth: authReducer },
      preloadedState: {
        auth: {
          user: {
            id: 'malicious-user',
            email: 'attacker@evil.com',
            firstName: 'Attacker',
            lastName: 'Evil',
            roles: ['MODERATOR', 'GUEST', null as any, 12345 as any],
          },
          token: 'some-token',
          isAuthenticated: true,
        },
      },
    });

    render(
      <Provider store={malformedStore}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/admin']}>
            <Routes>
              <Route path="/" element={<div data-testid="storefront-home">Home</div>} />
              <Route element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route path="/admin" element={<div data-testid="admin-page">Admin</div>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );

    expect(screen.getByTestId('storefront-home')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-page')).not.toBeInTheDocument();
  });
});

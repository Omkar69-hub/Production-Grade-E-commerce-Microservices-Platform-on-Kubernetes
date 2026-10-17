import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import LoginPage from '../src/pages/auth/LoginPage';
import RegisterPage from '../src/pages/auth/RegisterPage';
import authReducer from '../src/store/slices/authSlice';
import { AuthService } from '../src/services/AuthService';
import apiClient from '../src/config/axios';

vi.mock('../src/services/AuthService', () => ({
  AuthService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    refreshToken: vi.fn(),
    getProfile: vi.fn(),
  },
}));

describe('Stage 9B: Auth UI, Password Policy, and Session Remediation', () => {
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

  const renderLoginPage = () => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/login']}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<div data-testid="home-page">Home Page</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  const renderRegisterPage = () => {
    return render(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <MemoryRouter initialEntries={['/register']}>
            <Routes>
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
            </Routes>
          </MemoryRouter>
        </ThemeProvider>
      </Provider>
    );
  };

  describe('Task 1 & Task 6: Login UI, Password Policy & Demo Account', () => {
    it('1. Show/hide password control toggles input type on LoginPage', () => {
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      // Click show password toggle
      const toggleBtn = screen.getByRole('button', { name: /Show password/i });
      fireEvent.click(toggleBtn);

      expect(passwordInput.type).toBe('text');

      // Click hide password toggle
      const hideBtn = screen.getByRole('button', { name: /Hide password/i });
      fireEvent.click(hideBtn);

      expect(passwordInput.type).toBe('password');
    });

    it('2. Password validation boundary: rejects fewer than 8 characters on LoginPage', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/Client Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

      // Enter 7 characters (boundary: min 8)
      fireEvent.change(emailInput, { target: { value: 'client@lumiere.com' } });
      fireEvent.change(passwordInput, { target: { value: '1234567' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });

      expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('3. Password validation boundary: rejects more than 50 characters on LoginPage', async () => {
      renderLoginPage();

      const emailInput = screen.getByLabelText(/Client Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitBtn = screen.getByRole('button', { name: /Enter Salon/i });

      // Enter 51 characters (boundary: max 50)
      const longPassword = 'a'.repeat(51);
      fireEvent.change(emailInput, { target: { value: 'client@lumiere.com' } });
      fireEvent.change(passwordInput, { target: { value: longPassword } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Password must not exceed 50 characters/i)).toBeInTheDocument();
      });

      expect(AuthService.login).not.toHaveBeenCalled();
    });

    it('4. Customer demo-fill button is removed to prevent advertising non-existent credentials', () => {
      renderLoginPage();

      // Customer demo button must NOT exist
      expect(screen.queryByRole('button', { name: /Fill Customer Demo/i })).not.toBeInTheDocument();

      // Admin button remains available for the seeded admin account
      expect(screen.getByRole('button', { name: /Fill Admin Atelier/i })).toBeInTheDocument();
    });
  });

  describe('Task 1: RegisterPage Visibility & Policy', () => {
    it('5. Show/hide password control toggles input type on RegisterPage', () => {
      renderRegisterPage();

      const passwordInput = screen.getByLabelText(/^Password/i) as HTMLInputElement;
      expect(passwordInput.type).toBe('password');

      const toggleBtn = screen.getByRole('button', { name: /Show password/i });
      fireEvent.click(toggleBtn);

      expect(passwordInput.type).toBe('text');

      const hideBtn = screen.getByRole('button', { name: /Hide password/i });
      fireEvent.click(hideBtn);

      expect(passwordInput.type).toBe('password');
    });

    it('6. Password validation boundary: rejects invalid password lengths on RegisterPage', async () => {
      renderRegisterPage();

      const firstNameInput = screen.getByLabelText(/First Name/i);
      const lastNameInput = screen.getByLabelText(/Last Name/i);
      const emailInput = screen.getByLabelText(/Client Email Address/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitBtn = screen.getByRole('button', { name: /Create Account/i });

      fireEvent.change(firstNameInput, { target: { value: 'Jean' } });
      fireEvent.change(lastNameInput, { target: { value: 'Valjean' } });
      fireEvent.change(emailInput, { target: { value: 'jean@lumiere.com' } });

      // 7 chars: too short
      fireEvent.change(passwordInput, { target: { value: 'short7!' } });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
      });

      expect(AuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('Task 2 & Task 3: Axios Session Configuration & Proxying', () => {
    it('7. Axios client is configured with withCredentials enabled', () => {
      expect(apiClient.defaults.withCredentials).toBe(true);
    });

    it('8. Relative or configured base URL is preserved for same-origin proxying', () => {
      // Base URL should be string (relative empty string or configured URL)
      expect(typeof apiClient.defaults.baseURL).toBe('string');
    });
  });
});

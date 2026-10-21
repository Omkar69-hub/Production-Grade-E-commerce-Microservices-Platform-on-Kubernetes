import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../src/styles/theme';
import { HomePage } from '../src/pages/home/HomePage';
import RegisterPage from '../src/pages/auth/RegisterPage';
import { store } from '../src/store';
import { AuthService } from '../src/services/AuthService';
import apiClient from '../src/config/axios';
import { EffectsProvider } from '../src/context/EffectsContext';
import { ComparisonProvider } from '../src/context/ComparisonContext';

vi.mock('../src/hooks/useProducts', () => ({
  useProducts: () => ({
    data: {
      content: [
        { id: '1', name: 'Cashmere Cape', price: 150000, description: 'Luxury apparel', imageUrl: 'https://example.com/img.jpg', categoryId: 'cat-1' }
      ]
    },
    isLoading: false,
    error: null
  })
}));

describe('Stage 13A: Homepage Brand Ticker Removal & Auth Defect Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  describe('Task 1: Unwanted Brand Ticker Removal from Homepage', () => {
    it('does NOT render the repeated marquee ticker or marquee items', () => {
      const { container } = render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <EffectsProvider>
              <ComparisonProvider>
                <MemoryRouter initialEntries={['/']}>
                  <HomePage />
                </MemoryRouter>
              </ComparisonProvider>
            </EffectsProvider>
          </ThemeProvider>
        </Provider>
      );

      // Verify no marquee container or track exists in the DOM
      expect(container.querySelector('.marquee-container')).toBeNull();
      expect(container.querySelector('.marquee-track')).toBeNull();
      expect(container.querySelector('.marquee-item')).toBeNull();

      // Verify the repeated ticker separator '//' is not rendered
      expect(screen.queryByText('//')).not.toBeInTheDocument();
    });

    it('preserves surrounding hero layout, authenticity guarantees, and atelier universe sections', () => {
      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <EffectsProvider>
              <ComparisonProvider>
                <MemoryRouter initialEntries={['/']}>
                  <HomePage />
                </MemoryRouter>
              </ComparisonProvider>
            </EffectsProvider>
          </ThemeProvider>
        </Provider>
      );

      // Verify Hero section content is intact
      expect(screen.getByText(/Zero Counterfeits/i)).toBeInTheDocument();
      expect(screen.getByText(/Direct referrals exclusively to certified brand flagships/i)).toBeInTheDocument();
      expect(screen.getByText(/AUTHENTICITY/i)).toBeInTheDocument();

      // Verify Atelier universe / curations section is intact
      expect(screen.getByText(/Choose Your Atelier Universe/i)).toBeInTheDocument();
      expect(screen.getByText(/DISTINCT CURATIONS/i)).toBeInTheDocument();
    });
  });

  describe('Task 2 & 3: Error Message & Fallback Handling', () => {
    it('RegisterPage displays backend RFC-7807 detail message when duplicate email occurs', async () => {
      vi.spyOn(AuthService, 'register').mockRejectedValueOnce({
        response: {
          status: 409,
          data: {
            type: 'https://api.ecommerce.com/errors/409',
            title: 'Conflict',
            status: 409,
            detail: 'Email is already in use',
            message: 'Email is already in use'
          }
        }
      });

      render(
        <Provider store={store}>
          <ThemeProvider theme={theme}>
            <MemoryRouter initialEntries={['/register']}>
              <RegisterPage />
            </MemoryRouter>
          </ThemeProvider>
        </Provider>
      );

      fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Jane' } });
      fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByLabelText(/Client Email Address/i), { target: { value: 'existing@lumiere.com' } });
      fireEvent.change(screen.getByLabelText(/^Password/i), { target: { value: 'SecurePass123#' } });

      fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

      await waitFor(() => {
        expect(screen.getByText(/Email is already in use/i)).toBeInTheDocument();
      });
    });

    it('AuthService.register rejects SPA fallback HTML instead of silently treating it as success', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: '<!doctype html><html><head><title>LUMIERE</title></head><body><div id="root"></div></body></html>'
      });

      await expect(
        AuthService.register({
          email: 'test@example.com',
          password: 'Password123#',
          firstName: 'Test',
          lastName: 'User'
        })
      ).rejects.toThrow('Backend unavailable: Endpoint returned SPA fallback HTML instead of API response.');
    });

    it('AuthService.login rejects SPA fallback HTML when access token is missing', async () => {
      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        status: 200,
        headers: { 'content-type': 'text/html' },
        data: '<!doctype html><html><head><title>LUMIERE</title></head><body><div id="root"></div></body></html>'
      });

      await expect(
        AuthService.login({
          email: 'test@example.com',
          password: 'Password123#'
        })
      ).rejects.toThrow('Authentication response format invalid. Expected backend JSON access token.');
    });
  });
});

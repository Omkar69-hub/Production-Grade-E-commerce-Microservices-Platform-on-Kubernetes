import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { tokenStorage } from '../src/services/tokenStorage';
import { AuthService } from '../src/services/AuthService';
import apiClient from '../src/config/axios';
import { store } from '../src/store';
import { setCredentials, logout } from '../src/store/slices/authSlice';

describe('Stage 9F: Fix 4 — Frontend Secure Session and Refresh-Token Lifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    tokenStorage.clearToken();
    store.dispatch(logout());
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    tokenStorage.clearToken();
  });

  describe('1. In-Memory Token Storage & Zero Local/Session Storage Persistence', () => {
    it('proves access tokens are held in-memory only and NEVER persisted to localStorage or sessionStorage', async () => {
      // Simulate login
      const mockUser = {
        id: 'user-123',
        email: 'client@lumiere.com',
        firstName: 'Elena',
        lastName: 'Rostova',
        roles: ['CUSTOMER'],
      };
      const mockToken = 'mock-access-token-jwt-value';

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: { data: { accessToken: mockToken, expiresIn: 900000 } },
      } as any);

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { data: mockUser },
      } as any);

      const loginResult = await AuthService.login({
        email: 'client@lumiere.com',
        password: 'Password123',
      });

      expect(loginResult.token).toBe(mockToken);
      expect(loginResult.user.email).toBe('client@lumiere.com');

      // Verify in-memory storage holds token
      expect(tokenStorage.getAccessToken()).toBe(mockToken);

      // Verify Redux store holds token in memory
      store.dispatch(setCredentials({ user: loginResult.user, token: loginResult.token }));
      expect(store.getState().auth.token).toBe(mockToken);
      expect(store.getState().auth.isAuthenticated).toBe(true);

      // Verify strictly NOTHING is written to localStorage or sessionStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('accessToken')).toBeNull();
      expect(localStorage.getItem('refreshToken')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('accessToken')).toBeNull();
      expect(sessionStorage.getItem('refreshToken')).toBeNull();
    });
  });

  describe('2. Page Reload Session Restoration', () => {
    it('restores a valid session on reload via the HTTP-only cookie and sets in-memory state', async () => {
      const mockRestoredToken = 'restored-jwt-token-on-reload';
      const mockUser = {
        id: 'user-789',
        email: 'director@lumiere.com',
        firstName: 'Marie',
        lastName: 'Laurent',
        roles: ['ADMIN'],
      };

      vi.spyOn(apiClient, 'post').mockResolvedValueOnce({
        data: { data: { accessToken: mockRestoredToken, expiresIn: 900000 } },
      } as any);

      vi.spyOn(apiClient, 'get').mockResolvedValueOnce({
        data: { data: mockUser },
      } as any);

      const session = await AuthService.restoreSession();

      expect(session).not.toBeNull();
      expect(session?.token).toBe(mockRestoredToken);
      expect(session?.user.email).toBe('director@lumiere.com');
      expect(tokenStorage.getAccessToken()).toBe(mockRestoredToken);

      // Update Redux state as App.tsx does
      store.dispatch(setCredentials(session!));
      expect(store.getState().auth.isAuthenticated).toBe(true);
      expect(store.getState().auth.token).toBe(mockRestoredToken);

      // Zero storage persistence
      expect(localStorage.getItem('token')).toBeNull();
      expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('returns null and leaves user unauthenticated when refresh cookie is missing or invalid on reload', async () => {
      vi.spyOn(apiClient, 'post').mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Refresh token is missing' } },
      });

      const session = await AuthService.restoreSession();

      expect(session).toBeNull();
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });
  });

  describe('3. 401 Response Coordination, Single Retry & Loop Prevention', () => {
    it('refreshes token on 401 and retries original request at most once', async () => {
      tokenStorage.setAccessToken('expired-access-token');

      let callCount = 0;
      // Mock axios request execution
      const mockAdapter = vi.fn(async (config: any) => {
        if (config.url === '/api/v1/auth/refresh') {
          return {
            status: 200,
            data: { data: { accessToken: 'new-refreshed-jwt-token', expiresIn: 900000 } },
            headers: {},
            config,
          };
        }

        if (config.url === '/api/v1/user/orders') {
          callCount++;
          if (callCount === 1) {
            // First attempt with expired token fails with 401
            const err: any = new Error('Request failed with status code 401');
            err.response = { status: 401 };
            err.config = config;
            throw err;
          }
          // Retry attempt succeeds with refreshed token
          return {
            status: 200,
            data: { items: ['order-1', 'order-2'] },
            headers: {},
            config,
          };
        }

        return { status: 200, data: {}, headers: {}, config };
      });

      // Temporarily swap adapter to test interceptor retry behavior
      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = mockAdapter;

      try {
        const response = await apiClient.get('/api/v1/user/orders');
        expect(response.status).toBe(200);
        expect(response.data.items).toEqual(['order-1', 'order-2']);
        expect(callCount).toBe(2); // exactly 1 retry
        expect(tokenStorage.getAccessToken()).toBe('new-refreshed-jwt-token');
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    });

    it('prevents infinite loops and clears state when refresh itself fails or is rejected', async () => {
      tokenStorage.setAccessToken('expired-token');

      const mockAdapter = vi.fn(async (config: any) => {
        if (config.url === '/api/v1/auth/refresh') {
          const err: any = new Error('Refresh rejected');
          err.response = { status: 401 };
          err.config = config;
          throw err;
        }

        const err: any = new Error('Unauthorized');
        err.response = { status: 401 };
        err.config = config;
        throw err;
      });

      const originalAdapter = apiClient.defaults.adapter;
      apiClient.defaults.adapter = mockAdapter;

      try {
        await expect(apiClient.get('/api/v1/profile')).rejects.toThrow();
        // Tokens cleared in-memory without retry loop
        expect(tokenStorage.getAccessToken()).toBeNull();
        expect(localStorage.getItem('token')).toBeNull();
      } finally {
        apiClient.defaults.adapter = originalAdapter;
      }
    });
  });

  describe('4. Logout Invalidation and CSRF Attachment', () => {
    it('logout clears in-memory token and sends logout request', async () => {
      tokenStorage.setAccessToken('active-token-before-logout');
      store.dispatch(setCredentials({
        user: { id: 'u1', email: 'test@lumiere.com', firstName: 'A', lastName: 'B', roles: ['CUSTOMER'] },
        token: 'active-token-before-logout',
      }));

      const postSpy = vi.spyOn(apiClient, 'post').mockResolvedValueOnce({ data: {} } as any);

      await AuthService.logout();

      expect(postSpy).toHaveBeenCalledWith('/api/v1/auth/logout');
      expect(tokenStorage.getAccessToken()).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('attaches X-XSRF-TOKEN header to refresh and logout requests when XSRF-TOKEN cookie is present', () => {
      // Simulate browser setting XSRF-TOKEN cookie
      Object.defineProperty(document, 'cookie', {
        writable: true,
        value: 'XSRF-TOKEN=test-csrf-proof-cookie-value; other=123',
      });

      // Run interceptor handler directly to assert header attachment
      const interceptorHandler = (apiClient.interceptors.request as any).handlers[0].fulfilled;

      const refreshConfig = interceptorHandler({
        url: '/api/v1/auth/refresh',
        headers: {},
      });
      expect(refreshConfig.headers['X-XSRF-TOKEN']).toBe('test-csrf-proof-cookie-value');

      const logoutConfig = interceptorHandler({
        url: '/api/v1/auth/logout',
        headers: {},
      });
      expect(logoutConfig.headers['X-XSRF-TOKEN']).toBe('test-csrf-proof-cookie-value');

      // Regular data endpoints do not have CSRF cookie header attached
      const dataConfig = interceptorHandler({
        url: '/api/v1/products',
        headers: {},
      });
      expect(dataConfig.headers['X-XSRF-TOKEN']).toBeUndefined();
    });
  });
});

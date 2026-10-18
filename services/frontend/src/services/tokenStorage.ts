/**
 * Stage 9F: Fix 4 — In-Memory Token Storage
 *
 * Keeps access tokens in memory ONLY. Never writes or persists access tokens
 * or refresh tokens to localStorage or sessionStorage.
 */

let inMemoryAccessToken: string | null = null;

export const tokenStorage = {
  getAccessToken(): string | null {
    return inMemoryAccessToken;
  },

  setAccessToken(token: string | null): void {
    inMemoryAccessToken = token;
  },

  clearToken(): void {
    inMemoryAccessToken = null;
    if (typeof localStorage !== 'undefined') {
      try {
        localStorage.removeItem('token');
      } catch {
        // Ignore environments where localStorage access is restricted
      }
    }
    if (typeof sessionStorage !== 'undefined') {
      try {
        sessionStorage.removeItem('token');
      } catch {
        // Ignore environments where sessionStorage access is restricted
      }
    }
  },
};

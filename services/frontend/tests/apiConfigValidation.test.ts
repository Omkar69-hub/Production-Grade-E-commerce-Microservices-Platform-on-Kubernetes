import { describe, it, expect } from 'vitest';
import { validateApiGatewayUrl, resolveApiBaseUrl } from '../src/config/apiConfigValidator';

describe('Stage 9D: Fix 2 — API Gateway URL & Proxy Configuration Validation', () => {
  describe('validateApiGatewayUrl in Production Build', () => {
    it('1. Production build fails clearly when VITE_API_GATEWAY_URL is missing, undefined, or empty', () => {
      expect(() => validateApiGatewayUrl(undefined, 'production')).toThrowError(
        /\[Production Build Security Error\] VITE_API_GATEWAY_URL is missing or empty/
      );
      expect(() => validateApiGatewayUrl(null, 'production')).toThrowError(
        /\[Production Build Security Error\] VITE_API_GATEWAY_URL is missing or empty/
      );
      expect(() => validateApiGatewayUrl('', 'production')).toThrowError(
        /\[Production Build Security Error\] VITE_API_GATEWAY_URL is missing or empty/
      );
      expect(() => validateApiGatewayUrl('   ', 'production')).toThrowError(
        /\[Production Build Security Error\] VITE_API_GATEWAY_URL is missing or empty/
      );
    });

    it('2. Production build rejects localhost or 127.0.0.1 API URLs', () => {
      expect(() => validateApiGatewayUrl('http://localhost:8080', 'production')).toThrowError(
        /cannot point to localhost \('http:\/\/localhost:8080'\)/
      );
      expect(() => validateApiGatewayUrl('http://127.0.0.1:8080', 'production')).toThrowError(
        /cannot point to localhost \('http:\/\/127.0.0.1:8080'\)/
      );
      expect(() => validateApiGatewayUrl('http://localhost', 'production')).toThrowError(
        /cannot point to localhost \('http:\/\/localhost'\)/
      );
      expect(() => validateApiGatewayUrl('https://localhost:8443', 'production')).toThrowError(
        /cannot point to localhost \('https:\/\/localhost:8443'\)/
      );
    });

    it('3. Production build rejects non-HTTPS absolute URLs', () => {
      expect(() => validateApiGatewayUrl('http://api.lumiere-store.com', 'production')).toThrowError(
        /must use the HTTPS scheme in production/
      );
    });

    it('4. Production build accepts valid HTTPS URLs', () => {
      expect(() => validateApiGatewayUrl('https://api.lumiere.com', 'production')).not.toThrow();
      expect(() => validateApiGatewayUrl('https://gateway.lumiere-atelier.store', 'production')).not.toThrow();
      expect(() => validateApiGatewayUrl('https://api.lumiere.com/subpath', 'production')).not.toThrow();
    });

    it('5. Production build accepts the supported relative /api proxy configuration', () => {
      expect(() => validateApiGatewayUrl('/api', 'production')).not.toThrow();
    });
  });

  describe('validateApiGatewayUrl in Development and Test Modes', () => {
    it('6. Development mode works without production-only environment variables', () => {
      expect(() => validateApiGatewayUrl(undefined, 'development')).not.toThrow();
      expect(() => validateApiGatewayUrl('', 'development')).not.toThrow();
      expect(() => validateApiGatewayUrl('http://localhost:8080', 'development')).not.toThrow();
    });

    it('7. Test mode allows unset or local configuration without failing', () => {
      expect(() => validateApiGatewayUrl(undefined, 'test')).not.toThrow();
      expect(() => validateApiGatewayUrl('http://localhost:8080', 'test')).not.toThrow();
    });
  });

  describe('resolveApiBaseUrl', () => {
    it('8. Resolves relative proxy /api and empty strings to empty baseURL to avoid duplicate /api prefixes', () => {
      expect(resolveApiBaseUrl('/api')).toBe('');
      expect(resolveApiBaseUrl('')).toBe('');
      expect(resolveApiBaseUrl(undefined)).toBe('');
      expect(resolveApiBaseUrl(null)).toBe('');
    });

    it('9. Resolves full HTTPS URLs stripping any trailing slashes', () => {
      expect(resolveApiBaseUrl('https://api.lumiere.com')).toBe('https://api.lumiere.com');
      expect(resolveApiBaseUrl('https://api.lumiere.com/')).toBe('https://api.lumiere.com');
      expect(resolveApiBaseUrl('https://api.lumiere.com///')).toBe('https://api.lumiere.com');
    });
  });
});

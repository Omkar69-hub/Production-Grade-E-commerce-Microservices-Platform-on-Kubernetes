/**
 * Stage 9D: Fix 2 — API Gateway URL Validator and Base URL Resolver
 *
 * Validates VITE_API_GATEWAY_URL during production builds and resolves the
 * appropriate Axios baseURL for both full HTTPS endpoints and relative /api proxies.
 */

export function validateApiGatewayUrl(url: string | undefined | null, mode: string = 'production'): void {
  // Development and test modes preserve non-production workflows
  if (mode !== 'production') {
    return;
  }

  if (url === undefined || url === null || url.trim() === '') {
    throw new Error(
      `[Production Build Security Error] VITE_API_GATEWAY_URL is missing or empty for production build.\n` +
      `You must configure either:\n` +
      `  1) A valid HTTPS URL (e.g., 'https://api.yourdomain.com'), or\n` +
      `  2) The relative proxy configuration ('/api').\n` +
      `Silent fallback to localhost or unconfigured backend is disallowed.`
    );
  }

  const trimmed = url.trim();

  // Supported relative proxy configuration
  if (trimmed === '/api') {
    return;
  }

  // Strictly reject localhost and loopback addresses in production builds
  if (/^(https?:\/\/)?(localhost|127\.0\.0\.1)(:\d+)?(\/.*)?$/i.test(trimmed)) {
    throw new Error(
      `[Production Build Security Error] VITE_API_GATEWAY_URL cannot point to localhost ('${trimmed}') in a production build.\n` +
      `You must configure a valid HTTPS URL (e.g., 'https://api.yourdomain.com') or the relative proxy configuration ('/api').`
    );
  }

  // Enforce HTTPS for absolute URLs in production
  if (!trimmed.toLowerCase().startsWith('https://')) {
    throw new Error(
      `[Production Build Security Error] VITE_API_GATEWAY_URL must use the HTTPS scheme in production. Received: '${trimmed}'. (Use '/api' for relative proxy).`
    );
  }

  try {
    new URL(trimmed);
  } catch {
    throw new Error(
      `[Production Build Security Error] VITE_API_GATEWAY_URL is not a well-formed URL: '${trimmed}'`
    );
  }
}

/**
 * Resolves the Axios baseURL.
 * For the supported relative '/api' proxy or empty string, returns an empty string
 * because all service paths in the codebase are already prefixed with '/api/v1/...'.
 * For absolute URLs, returns the origin/path with any trailing slashes stripped.
 */
export function resolveApiBaseUrl(url: string | undefined | null): string {
  if (!url || url === '/api') {
    return '';
  }
  return url.replace(/\/+$/, '');
}

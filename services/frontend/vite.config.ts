import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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

export default defineConfig(({ command, mode }) => {
  if (command === 'build') {
    validateApiGatewayUrl(process.env.VITE_API_GATEWAY_URL, mode);
  }

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: process.env.VITE_API_GATEWAY_URL || 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
  };
})

import { resolveApiBaseUrl } from './apiConfigValidator';

export const isInternalCheckoutEnabled = (rawVal: string | boolean | undefined | null): boolean => {
  return rawVal === true || rawVal === 'true';
};

export const env = {
  API_GATEWAY_URL: resolveApiBaseUrl(import.meta.env.VITE_API_GATEWAY_URL),
  ENABLE_INTERNAL_CHECKOUT: isInternalCheckoutEnabled(import.meta.env.VITE_ENABLE_INTERNAL_CHECKOUT),
};

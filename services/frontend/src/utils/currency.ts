/**
 * LUMIÈRE Currency Utilities — Indian Rupee (₹ INR) Standard
 * Enforces correct ₹ INR display across catalog, cart, checkout, profile, and admin.
 */

export const formatINR = (amount: number | string | undefined | null): string => {
  if (amount === undefined || amount === null) {
    return '₹0.00';
  }
  const numeric = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numeric)) {
    return '₹0.00';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
};

export const isDemoPrice = (sku?: string): boolean => {
  // Flags seed/demo records so they are not misrepresented as genuine Indian market feeds
  return sku === 'SKU-001' || !sku || sku.startsWith('DEMO');
};

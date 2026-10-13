import { useState, useEffect, useCallback } from 'react';

const WISHLIST_STORAGE_KEY = 'lumiere_wishlist';
const WISHLIST_EVENT_NAME = 'lumiere-wishlist-updated';

/**
 * Safely retrieves wishlisted item IDs from localStorage.
 */
export const getWishlistIds = (): string[] => {
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(id => typeof id === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * Checks if a product ID is currently wishlisted.
 */
export const isInWishlist = (id: string): boolean => {
  if (!id) return false;
  return getWishlistIds().includes(id);
};

/**
 * Adds or removes a product ID from the wishlist.
 * Returns the new wishlisted state (true if added, false if removed).
 */
export const toggleWishlistItem = (id: string): boolean => {
  if (!id) return false;
  try {
    const current = getWishlistIds();
    const index = current.indexOf(id);
    let updated: string[];
    let isAdded = false;

    if (index >= 0) {
      updated = current.filter(item => item !== id);
    } else {
      updated = [...current, id];
      isAdded = true;
    }

    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(WISHLIST_EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
    return isAdded;
  } catch {
    return false;
  }
};

/**
 * Removes a specific item from the wishlist.
 */
export const removeWishlistItem = (id: string): void => {
  if (!id) return;
  try {
    const current = getWishlistIds();
    const updated = current.filter(item => item !== id);
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event(WISHLIST_EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Clears the entire wishlist from storage.
 */
export const clearWishlist = (): void => {
  try {
    localStorage.removeItem(WISHLIST_STORAGE_KEY);
    window.dispatchEvent(new Event(WISHLIST_EVENT_NAME));
    window.dispatchEvent(new Event('storage'));
  } catch {
    // Ignore storage errors
  }
};

/**
 * Reactive React hook for accessing and mutating the wishlist state across components.
 */
export const useWishlist = () => {
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => getWishlistIds());

  const syncWishlist = useCallback(() => {
    setWishlistIds(getWishlistIds());
  }, []);

  useEffect(() => {
    window.addEventListener(WISHLIST_EVENT_NAME, syncWishlist);
    window.addEventListener('storage', syncWishlist);
    return () => {
      window.removeEventListener(WISHLIST_EVENT_NAME, syncWishlist);
      window.removeEventListener('storage', syncWishlist);
    };
  }, [syncWishlist]);

  const toggle = useCallback((id: string) => toggleWishlistItem(id), []);
  const remove = useCallback((id: string) => removeWishlistItem(id), []);
  const isWishlisted = useCallback((id: string) => wishlistIds.includes(id), [wishlistIds]);

  return {
    wishlistIds,
    wishlistCount: wishlistIds.length,
    toggleWishlist: toggle,
    removeWishlistItem: remove,
    clearWishlist,
    isWishlisted,
  };
};

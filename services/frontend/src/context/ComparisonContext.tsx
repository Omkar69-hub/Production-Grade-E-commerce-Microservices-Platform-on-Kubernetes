import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product } from '../types/product';

interface ComparisonContextType {
  comparisonItems: Product[];
  addToComparison: (product: Product) => { success: boolean; message?: string };
  removeFromComparison: (productId: string) => void;
  clearComparison: () => void;
  isInComparison: (productId: string) => boolean;
  isComparisonOpen: boolean;
  setIsComparisonOpen: (open: boolean) => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export const ComparisonProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [comparisonItems, setComparisonItems] = useState<Product[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('lumiere_comparison');
      if (saved) {
        setComparisonItems(JSON.parse(saved));
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveItems = (items: Product[]) => {
    setComparisonItems(items);
    try {
      localStorage.setItem('lumiere_comparison', JSON.stringify(items));
    } catch {
      // Ignore
    }
  };

  const addToComparison = (product: Product): { success: boolean; message?: string } => {
    if (comparisonItems.some(item => item.id === product.id)) {
      return { success: false, message: 'This piece is already in your comparison salon.' };
    }
    if (comparisonItems.length >= 4) {
      return { success: false, message: 'You can compare up to 4 pieces simultaneously.' };
    }
    // Check compatibility: if already comparing items, warn if different category
    if (comparisonItems.length > 0) {
      const existingCategory = comparisonItems[0].categoryName || comparisonItems[0].categoryId;
      const targetCategory = product.categoryName || product.categoryId;
      if (existingCategory && targetCategory && existingCategory !== targetCategory) {
        return { 
          success: false, 
          message: `Incompatible types: Selected piece belongs to ${targetCategory}, while current comparison contains ${existingCategory}. Comparison is optimized for identical categories.` 
        };
      }
    }

    const next = [...comparisonItems, product];
    saveItems(next);
    return { success: true };
  };

  const removeFromComparison = (productId: string) => {
    const next = comparisonItems.filter(item => item.id !== productId);
    saveItems(next);
  };

  const clearComparison = () => {
    saveItems([]);
  };

  const isInComparison = (productId: string) => {
    return comparisonItems.some(item => item.id === productId);
  };

  return (
    <ComparisonContext.Provider value={{
      comparisonItems,
      addToComparison,
      removeFromComparison,
      clearComparison,
      isInComparison,
      isComparisonOpen,
      setIsComparisonOpen
    }}>
      {children}
    </ComparisonContext.Provider>
  );
};

export const useComparison = (): ComparisonContextType => {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
};

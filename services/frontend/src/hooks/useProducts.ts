import { useQuery } from '@tanstack/react-query';
import { ProductService } from '../services/ProductService';
import { PaginationParams } from '../types/product';

export const useProducts = (params: PaginationParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => ProductService.getProducts(params),
    staleTime: 60000, // Cache for 1 minute
  });
};

export const useProductDetails = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => ProductService.getProductById(id),
    enabled: !!id,
  });
};

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  categoryId: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  imageUrl?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  categoryId?: string;
  search?: string;
}

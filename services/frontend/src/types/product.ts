export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  brand?: string;
  categoryId: string;
  categoryName?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK';
  imageUrl?: string;
  attributes?: string;
}

export interface ProductAttributes {
  sizes?: string;
  colors?: string;
  material?: string;
  fit?: string;
  specifications?: string;
  compatibility?: string;
  warranty?: string;
  sole?: string;
  dimensions?: string;
  [key: string]: string | undefined;
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
  brand?: string;
  includeAll?: boolean;
}

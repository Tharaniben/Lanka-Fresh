// TypeScript types for the Product & Inventory module.
// These match exactly what the backend DTOs return.

export interface Category {
  id: number;
  name: string;
  description: string | null;
}

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  expiryDate: string | null;
  active: boolean;
  categoryId: number;
  categoryName: string;
  stockQuantity: number | null;
  createdAt: string;
}

export interface Stock {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}

// All API calls for the Product & Inventory module.
// Uses the shared axios instance from src/services/api.ts
// which automatically attaches the Clerk JWT to every request.

import api from "../../services/api";
import type { ApiResponse, Category, Product, Stock } from "./types";

// ── Categories ──────────────────────────────────────────────

export async function getAllCategories(): Promise<Category[]> {
  const res = await api.get<ApiResponse<Category[]>>("/inventory/categories");
  return res.data.data;
}

export async function createCategory(data: {
  name: string;
  description: string;
}): Promise<Category> {
  const res = await api.post<ApiResponse<Category>>("/inventory/categories", data);
  return res.data.data;
}

export async function updateCategory(
  id: number,
  data: { name: string; description: string }
): Promise<Category> {
  const res = await api.put<ApiResponse<Category>>(`/inventory/categories/${id}`, data);
  return res.data.data;
}

export async function deleteCategory(id: number): Promise<void> {
  await api.delete(`/inventory/categories/${id}`);
}

// ── Products ─────────────────────────────────────────────────

export async function getAllActiveProducts(): Promise<Product[]> {
  const res = await api.get<ApiResponse<Product[]>>("/inventory/products");
  return res.data.data;
}

export async function getAllProducts(): Promise<Product[]> {
  const res = await api.get<ApiResponse<Product[]>>("/inventory/products/all");
  return res.data.data;
}

export async function createProduct(data: {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  expiryDate: string | null;
  categoryId: number;
}): Promise<Product> {
  const res = await api.post<ApiResponse<Product>>("/inventory/products", data);
  return res.data.data;
}

export async function updateProduct(
  id: number,
  data: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    expiryDate: string | null;
    categoryId: number;
  }
): Promise<Product> {
  const res = await api.put<ApiResponse<Product>>(`/inventory/products/${id}`, data);
  return res.data.data;
}

export async function deactivateProduct(id: number): Promise<void> {
  await api.delete(`/inventory/products/${id}`);
}

// ── Stock ────────────────────────────────────────────────────

export async function getAllStock(): Promise<Stock[]> {
  const res = await api.get<ApiResponse<Stock[]>>("/inventory/stock");
  return res.data.data;
}

export async function getLowStockItems(): Promise<Stock[]> {
  const res = await api.get<ApiResponse<Stock[]>>("/inventory/stock/low-stock");
  return res.data.data;
}

export async function updateStock(
  productId: number,
  data: { quantity: number; lowStockThreshold: number }
): Promise<Stock> {
  const res = await api.put<ApiResponse<Stock>>(
    `/inventory/stock/product/${productId}`,
    data
  );
  return res.data.data;
}

export async function reactivateProduct(id: number): Promise<Product> {
  const res = await api.patch<ApiResponse<Product>>(
    `/inventory/products/${id}/reactivate`
  );
  return res.data.data;
}

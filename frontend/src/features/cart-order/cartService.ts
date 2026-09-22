// All API calls for the Cart module.
// Uses the shared axios instance from src/services/api.ts
// which automatically attaches the Clerk JWT to every request.
// The backend reads the current user off that JWT, so we never
// send a userId from here.

import api from "../../services/api";
import type { ApiResponse, CartSummary } from "./types";

export async function getMyCart(): Promise<CartSummary> {
  const res = await api.get<ApiResponse<CartSummary>>("/cart");
  return res.data.data;
}

export async function addItemToCart(
  productId: number,
  quantity: number
): Promise<CartSummary> {
  const res = await api.post<ApiResponse<CartSummary>>("/cart/items", {
    productId,
    quantity,
  });
  return res.data.data;
}

export async function updateCartItemQuantity(
  cartItemId: number,
  quantity: number
): Promise<CartSummary> {
  const res = await api.put<ApiResponse<CartSummary>>(
    `/cart/items/${cartItemId}`,
    { quantity }
  );
  return res.data.data;
}

export async function removeCartItem(cartItemId: number): Promise<CartSummary> {
  const res = await api.delete<ApiResponse<CartSummary>>(
    `/cart/items/${cartItemId}`
  );
  return res.data.data;
}

export async function clearCart(): Promise<CartSummary> {
  const res = await api.delete<ApiResponse<CartSummary>>("/cart");
  return res.data.data;
}

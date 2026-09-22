// All API calls for the Order module (checkout + order history).
// Uses the shared axios instance from src/services/api.ts.

import api from "../../services/api";
import type { ApiResponse, Order } from "./types";

export async function checkout(deliveryAddress: string): Promise<Order> {
  const res = await api.post<ApiResponse<Order>>("/orders/checkout", {
    deliveryAddress,
  });
  return res.data.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>("/orders");
  return res.data.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}

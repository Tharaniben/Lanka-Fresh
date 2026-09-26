import api from "../../services/api";
import type { ApiResponse, Order, CheckoutPayload } from "./types";

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const res = await api.post<ApiResponse<Order>>("/orders/checkout", payload);
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
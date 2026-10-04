import api from "../../services/api";
import type { ApiResponse, Order, CheckoutPayload, OrderStatus, Notification } from "./types";

export async function checkout(payload: CheckoutPayload): Promise<Order> {
  const res = await api.post<ApiResponse<Order>>("/orders/checkout", payload);
  return res.data.data;
}

export async function getMyOrders(): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>("/orders");
  return res.data.data;
}

export async function getAllOrders(): Promise<Order[]> {
  const res = await api.get<ApiResponse<Order[]>>("/orders/all");
  return res.data.data;
}

export async function getOrderById(id: number): Promise<Order> {
  const res = await api.get<ApiResponse<Order>>(`/orders/${id}`);
  return res.data.data;
}

export async function updateOrderStatus(id: number, status: OrderStatus): Promise<Order> {
  const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
  return res.data.data;
}

export async function cancelOrder(id: number): Promise<Order> {
  const res = await api.patch<ApiResponse<Order>>(`/orders/${id}/cancel`);
  return res.data.data;
}

// Notifications API
export async function getMyNotifications(): Promise<Notification[]> {
  const res = await api.get<ApiResponse<Notification[]>>("/notifications");
  return res.data.data;
}

export async function markNotificationAsRead(id: number): Promise<Notification> {
  const res = await api.patch<ApiResponse<Notification>>(`/notifications/${id}/read`);
  return res.data.data;
}

export async function markAllNotificationsAsRead(): Promise<string> {
  const res = await api.patch<ApiResponse<string>>("/notifications/read-all");
  return res.data.data;
}
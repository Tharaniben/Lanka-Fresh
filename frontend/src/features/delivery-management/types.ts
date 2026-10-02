// Types mirroring the backend DTOs in
// com.lankafresh.backend.deliverymanagement.dto — keep these two in sync
// by hand; the PRD doesn't set up shared codegen for this project.

export type DeliveryStatus =
  | "ORDER_PLACED"
  | "ASSIGNED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface Delivery {
  id: number;
  orderId: number;
  deliveryAddress: string;
  status: DeliveryStatus;
  assignedAgentId: number | null;
  currentLatitude: number | null;
  currentLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryAssignment {
  id: number;
  deliveryId: number;
  agentUserId: number;
  assignedAt: string;
  cancelledAt: string | null;
  active: boolean;
}

export interface AssignDeliveryRequest {
  agentUserId: number;
}

export interface UpdateDeliveryStatusRequest {
  status: DeliveryStatus;
}

export interface UpdateDeliveryAddressRequest {
  deliveryAddress: string;
}

// Mirrors the shared { success, data, message } envelope from PRD 4.5.
export interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  message: string | null;
}

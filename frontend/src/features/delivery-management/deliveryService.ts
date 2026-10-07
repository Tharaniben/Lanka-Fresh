// Calls the backend endpoints from PRD 5.4, through the shared axios
// instance in src/services/api.ts (already attaches the Clerk token to
// every request — see PRD 4.4/4.9).
//
// NOTE: PRD 4.5 says response-envelope ({success, data, message}) unwrapping
// should eventually live in api.ts itself, done once for every module. If
// that hasn't been added yet when you wire this in, the unwrap*() helpers
// below do it locally so this module works either way. Once api.ts
// unwraps automatically, delete the local unwrap*() calls and just
// `return res.data;`.

import api from "../../services/api";
import type {
  ApiEnvelope,
  AssignDeliveryRequest,
  Delivery,
  DeliveryAssignment,
  UpdateDeliveryAddressRequest,
  UpdateDeliveryStatusRequest,
} from "./types";

const BASE = "/deliveries";

function unwrap<T>(envelope: ApiEnvelope<T>): T {
  if (!envelope.success || envelope.data === null) {
    throw new Error(envelope.message ?? "Request failed");
  }
  return envelope.data;
}

export const deliveryService = {
  // Master registry — backs the "All Deliveries" tab and the stats row.
  async getAllDeliveries(): Promise<Delivery[]> {
    const res = await api.get<ApiEnvelope<Delivery[]>>(BASE);
    return unwrap(res.data);
  },

  async getUnassignedDeliveries(): Promise<Delivery[]> {
    const res = await api.get<ApiEnvelope<Delivery[]>>(`${BASE}/unassigned`);
    return unwrap(res.data);
  },

  async getAssignedDeliveries(agentUserId: number): Promise<Delivery[]> {
    const res = await api.get<ApiEnvelope<Delivery[]>>(`${BASE}/assigned`, {
      params: { agentUserId },
    });
    return unwrap(res.data);
  },

  async getDeliveryById(id: number): Promise<Delivery> {
    const res = await api.get<ApiEnvelope<Delivery>>(`${BASE}/${id}`);
    return unwrap(res.data);
  },

  async getDeliveryByOrderId(orderId: number): Promise<Delivery> {
    const res = await api.get<ApiEnvelope<Delivery>>(`${BASE}/order/${orderId}`);
    return unwrap(res.data);
  },

  async assignDelivery(
    deliveryId: number,
    payload: AssignDeliveryRequest
  ): Promise<DeliveryAssignment> {
    const res = await api.post<ApiEnvelope<DeliveryAssignment>>(
      `${BASE}/${deliveryId}/assign`,
      payload
    );
    return unwrap(res.data);
  },

  async updateStatus(
    deliveryId: number,
    payload: UpdateDeliveryStatusRequest
  ): Promise<Delivery> {
    const res = await api.patch<ApiEnvelope<Delivery>>(
      `${BASE}/${deliveryId}/status`,
      payload
    );
    return unwrap(res.data);
  },

  // This is the "Delete" in the module's CRUD — it unassigns the agent
  // (deletes the DeliveryAssignment). It never deletes a Delivery row;
  // PRD 5.4 is explicit that Delivery only gets Update, never Delete.
  // Call this "Unassign" in the UI, not "Delete", so it's not read as
  // removing the delivery itself.
  async unassignDelivery(deliveryId: number): Promise<void> {
    await api.delete<ApiEnvelope<null>>(`${BASE}/${deliveryId}/assignment`);
  },

  async updateAddress(
    deliveryId: number,
    payload: UpdateDeliveryAddressRequest
  ): Promise<Delivery> {
    const res = await api.patch<ApiEnvelope<Delivery>>(
      `${BASE}/${deliveryId}/address`,
      payload
    );
    return unwrap(res.data);
  },
};

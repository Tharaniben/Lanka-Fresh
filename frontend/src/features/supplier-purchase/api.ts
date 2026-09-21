// Thin wrapper functions around the shared `api` axios client (which already
// attaches the Clerk bearer token — see src/services/api.ts). Every backend
// response is wrapped in { success, data, message } (see ApiResponse.java on
// the backend) — these functions unwrap that envelope so the rest of the
// module just works with plain Supplier / PurchaseOrder objects.

import api from "../../services/api";
import type {
  Supplier,
  SupplierInput,
  PurchaseOrder,
  PurchaseOrderInput,
  PurchaseOrderStatus,
} from "./types";

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
}

// Axios throws on non-2xx responses. The backend's GlobalExceptionHandler
// always returns { success: false, message: "..." } as the body, so this
// pulls that message out for display instead of a generic "Request failed".
export function getErrorMessage(err: unknown): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as any).response?.data?.message === "string"
  ) {
    return (err as any).response.data.message as string;
  }
  return "Something went wrong. Please try again.";
}

// ---- Suppliers ----

export interface SupplierSearchParams {
  search?: string; // matches supplier name
  contactPerson?: string;
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
}

export async function getSuppliers(
  params?: SupplierSearchParams,
): Promise<Supplier[]> {
  const res = await api.get<ApiEnvelope<Supplier[]>>("/suppliers", {
    params,
  });
  return res.data.data;
}

export async function createSupplier(input: SupplierInput): Promise<Supplier> {
  const res = await api.post<ApiEnvelope<Supplier>>("/suppliers", input);
  return res.data.data;
}

export async function updateSupplier(
  id: number,
  input: SupplierInput,
): Promise<Supplier> {
  const res = await api.patch<ApiEnvelope<Supplier>>(
    `/suppliers/${id}`,
    input,
  );
  return res.data.data;
}

export async function deleteSupplier(id: number): Promise<void> {
  await api.delete(`/suppliers/${id}`);
}

// ---- Purchase Orders ----

export interface PurchaseOrderSearchParams {
  supplierId?: number;
  status?: PurchaseOrderStatus | "";
  contactPerson?: string;
  dateFrom?: string; // "YYYY-MM-DD"
  dateTo?: string; // "YYYY-MM-DD"
}

export async function getPurchaseOrders(
  params?: PurchaseOrderSearchParams,
): Promise<PurchaseOrder[]> {
  // Don't send an empty-string status - the backend treats a *missing*
  // param as "no filter", but an empty string would fail PurchaseOrderStatus.valueOf(...).
  const cleaned: PurchaseOrderSearchParams = { ...params };
  if (!cleaned.status) delete cleaned.status;

  const res = await api.get<ApiEnvelope<PurchaseOrder[]>>(
    "/purchase-orders",
    { params: cleaned },
  );
  return res.data.data;
}

export async function createPurchaseOrder(
  input: PurchaseOrderInput,
): Promise<PurchaseOrder> {
  const res = await api.post<ApiEnvelope<PurchaseOrder>>(
    "/purchase-orders",
    input,
  );
  return res.data.data;
}

export async function updatePurchaseOrderStatus(
  id: number,
  status: PurchaseOrderStatus,
): Promise<PurchaseOrder> {
  const res = await api.patch<ApiEnvelope<PurchaseOrder>>(
    `/purchase-orders/${id}/status`,
    { status },
  );
  return res.data.data;
}

export async function deletePurchaseOrder(id: number): Promise<void> {
  await api.delete(`/purchase-orders/${id}`);
}

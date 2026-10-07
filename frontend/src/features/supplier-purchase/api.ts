// Thin wrapper functions around the shared `api` axios client (which already
// attaches the Clerk bearer token and has baseURL = http://localhost:8080/api/v1
// - see src/services/api.ts, so paths here never include a leading /v1).
// Every backend response is wrapped in { success, data, message } (see
// ApiResponse.java on the backend) - these functions unwrap that envelope.

import api from "../../services/api";
import type {
  Supplier,
  SupplierInput,
  PurchaseOrder,
  PurchaseOrderInput,
  PurchaseOrderStatus,
  Product,
  LowStockItem,
  NearExpiryItem,
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
  search?: string;
  contactPerson?: string;
  dateFrom?: string;
  dateTo?: string;
}

export async function getSuppliers(
  params?: SupplierSearchParams,
): Promise<Supplier[]> {
  const res = await api.get<ApiEnvelope<Supplier[]>>("/suppliers", { params });
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
  const res = await api.patch<ApiEnvelope<Supplier>>(`/suppliers/${id}`, input);
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
  dateFrom?: string;
  dateTo?: string;
}

export async function getPurchaseOrders(
  params?: PurchaseOrderSearchParams,
): Promise<PurchaseOrder[]> {
  const cleaned: PurchaseOrderSearchParams = { ...params };
  if (!cleaned.status) delete cleaned.status;

  const res = await api.get<ApiEnvelope<PurchaseOrder[]>>("/purchase-orders", {
    params: cleaned,
  });
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

// Confirms a RECEIVED order's stock arrival. Pass an empty object to accept
// every item at its full ordered quantity, or key specific item ids to
// override the accepted amount for that item (e.g. { 15: 18 } if 2 units
// of item 15 were damaged).
export async function confirmStockReceipt(
  id: number,
  acceptedQuantitiesByItemId: Record<number, number>,
): Promise<PurchaseOrder> {
  const res = await api.patch<ApiEnvelope<PurchaseOrder>>(
    `/purchase-orders/${id}/confirm-stock`,
    acceptedQuantitiesByItemId,
  );
  return res.data.data;
}

export async function deletePurchaseOrder(id: number): Promise<void> {
  await api.delete(`/purchase-orders/${id}`);
}

// ---- Product & Inventory (read-only, from the other module) ----

export async function getProducts(): Promise<Product[]> {
  const res = await api.get<ApiEnvelope<Product[]>>("/inventory/products");
  return res.data.data;
}

// ---- Restock alerts ----

export async function getLowStockItems(): Promise<LowStockItem[]> {
  const res = await api.get<ApiEnvelope<LowStockItem[]>>(
    "/inventory/stock/low-stock",
  );
  return res.data.data;
}

export async function getNearExpiryItems(
  days: number = 7,
): Promise<NearExpiryItem[]> {
  const res = await api.get<ApiEnvelope<NearExpiryItem[]>>(
    "/purchase-orders/alerts/near-expiry",
    { params: { days } },
  );
  return res.data.data;
}

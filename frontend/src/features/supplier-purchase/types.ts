// Types for this module only. Shapes here mirror the backend entities in
// backend/.../supplierpurchase/model — keep them in sync if those change.

export type PurchaseOrderStatus = "DRAFT" | "SENT" | "RECEIVED" | "CANCELLED";

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  suppliedItems?: string;
  createdAt?: string;
}

// What we send when creating/editing a supplier — no id (server assigns it)
// and no createdAt (server sets it).
export type SupplierInput = Omit<Supplier, "id" | "createdAt">;

export interface PurchaseOrderItem {
  id?: number;
  productName: string;
  quantity: number;
  unitCost: number;
  subtotal?: number; // calculated by the backend, read-only
}

export interface PurchaseOrder {
  id: number;
  supplier: Supplier;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  totalAmount: number;
  items: PurchaseOrderItem[];
}

// Shape the backend expects on create — just enough to identify the
// supplier (by id) plus the line items, matching PurchaseOrderService.
export interface PurchaseOrderInput {
  supplier: { id: number };
  expectedDeliveryDate?: string;
  items: { productName: string; quantity: number; unitCost: number }[];
}

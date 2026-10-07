// Types for this module. Shapes here mirror the backend entities/DTOs in
// backend/.../supplierpurchase and the Product & Inventory module it reads
// from - keep them in sync if those change.

export type PurchaseOrderStatus =
  | "DRAFT"
  | "SENT"
  | "RECEIVED"
  | "COMPLETED"
  | "CANCELLED";

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

export type SupplierInput = Omit<Supplier, "id" | "createdAt">;

// A product as returned by Product & Inventory's own API
// (GET /inventory/products) - only the fields this module actually uses.
export interface Product {
  id: number;
  name: string;
  price: number;
  stockQuantity: number | null;
}

export interface PurchaseOrderItem {
  id?: number;
  product: { id: number; name?: string };
  productName: string; // snapshot taken at creation time, set by the backend
  quantity: number;
  acceptedQuantity?: number | null; // set once staff confirms stock receipt
  unitCost: number;
  subtotal?: number;
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

// Shape the backend expects on create - a productId per item, not free text.
export interface PurchaseOrderInput {
  supplier: { id: number };
  expectedDeliveryDate?: string;
  items: { product: { id: number }; quantity: number; unitCost: number }[];
}

// ---- Restock alerts ----

// Matches StockResponseDto from Product & Inventory's low-stock endpoint.
export interface LowStockItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  lowStockThreshold: number;
  lowStock: boolean;
}

// Matches NearExpiryProductDto from this module's own alerts endpoint.
export interface NearExpiryItem {
  id: number;
  name: string;
  expiryDate: string;
}

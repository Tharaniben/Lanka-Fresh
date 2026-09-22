// TypeScript types for the Cart & Order module.
// These match exactly what the backend DTOs return.

export interface CartItem {
  cartItemId: number;
  productId: number;
  productName: string;
  productImageUrl: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface CartSummary {
  cartId: number;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
}

export type OrderStatus =
  | "PLACED"
  | "CONFIRMED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  productName: string;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}

export interface Order {
  id: number;
  deliveryAddress: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  grandTotal: number;
  status: OrderStatus;
  createdAt: string;
  paymentTransactionId?: string | null;
  paymentStatus?: "SUCCESS" | "FAILED" | null;
}

export interface CheckoutPayload {
  deliveryAddress: string;
  cardNumber: string;
  cardHolderName: string;
  expiryDate: string;
  cvv: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string | null;
}
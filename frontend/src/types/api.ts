// Shared types for talking to the backend. Add module-specific types
// (Product, Order, etc.) inside each feature folder, e.g.
// src/features/product-inventory/types.ts — only promote a type here if
// more than one module actually needs it.

/** Standard shape returned by every backend error response. */
export interface ApiError {
  status: number;
  message: string;
  timestamp: string;
}

/** Generic wrapper for paginated list endpoints. */
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

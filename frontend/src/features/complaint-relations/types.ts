export type ComplaintCategory =
  | "DELIVERY"
  | "PRODUCT_QUALITY"
  | "BILLING_PAYMENT"
  | "CUSTOMER_SERVICE"
  | "OTHER";

export type ComplaintStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export interface Complaint {
  id: number;
  userId: number;
  customerName: string | null;
  orderId: number | null;
  subject: string;
  description: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  resolutionNotes: string | null;
  createdAt: string;
  updatedAt: string;
  resolvedAt: string | null;
}

export interface ComplaintSubmitPayload {
  subject: string;
  description: string;
  category: ComplaintCategory;
  orderId?: number | null;
}

export interface ComplaintStatusUpdatePayload {
  status: ComplaintStatus;
  resolutionNotes?: string;
}

export interface Feedback {
  id: number;
  userId: number;
  customerName: string | null;
  orderId: number | null;
  rating: number;
  comment: string | null;
  createdAt: string;
}

export interface FeedbackSubmitPayload {
  rating: number;
  comment?: string;
  orderId?: number | null;
}

export const COMPLAINT_CATEGORY_LABELS: Record<ComplaintCategory, string> = {
  DELIVERY: "Delivery",
  PRODUCT_QUALITY: "Product quality",
  BILLING_PAYMENT: "Billing / payment",
  CUSTOMER_SERVICE: "Customer service",
  OTHER: "Other",
};

export const COMPLAINT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

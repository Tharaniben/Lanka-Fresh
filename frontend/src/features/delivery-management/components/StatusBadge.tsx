import type { DeliveryStatus } from "../types";
import "./StatusBadge.css";

const LABELS: Record<DeliveryStatus, string> = {
  ORDER_PLACED: "Order Placed",
  ASSIGNED: "Assigned",
  OUT_FOR_DELIVERY: "Out for Delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function StatusBadge({ status }: { status: DeliveryStatus }) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {LABELS[status]}
    </span>
  );
}

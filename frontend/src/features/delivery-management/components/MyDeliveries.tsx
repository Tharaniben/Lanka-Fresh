import { useState } from "react";
import { deliveryService } from "../deliveryService";
import { usePolling } from "../hooks/usePolling";
import type { Delivery, DeliveryStatus } from "../types";
import StatusBadge from "./StatusBadge";
import "./MyDeliveries.css";

// Forward transitions this screen exposes a one-click button for. Must
// match DeliveryServiceImpl.ALLOWED_TRANSITIONS on the backend — see PRD
// 5.4's lifecycle: ORDER_PLACED -> ASSIGNED -> OUT_FOR_DELIVERY -> DELIVERED.
const NEXT_STATUS: Partial<Record<DeliveryStatus, DeliveryStatus>> = {
  ASSIGNED: "OUT_FOR_DELIVERY",
  OUT_FOR_DELIVERY: "DELIVERED",
};

const NEXT_LABEL: Partial<Record<DeliveryStatus, string>> = {
  ASSIGNED: "Mark Out for Delivery",
  OUT_FOR_DELIVERY: "Mark Delivered",
};

export default function MyDeliveries({ agentUserId }: { agentUserId: number }) {
  const { data, error, loading, refetch } = usePolling<Delivery[]>(
    () => deliveryService.getAssignedDeliveries(agentUserId),
    7000
  );
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  async function advance(delivery: Delivery) {
    const next = NEXT_STATUS[delivery.status];
    if (!next) return;
    setUpdatingId(delivery.id);
    try {
      await deliveryService.updateStatus(delivery.id, { status: next });
      refetch();
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p>Loading your deliveries...</p>;
  if (error) return <p className="my-deliveries__error">{error}</p>;

  const deliveries = data ?? [];

  return (
    <div className="my-deliveries">
      <h2>My Deliveries</h2>
      {deliveries.length === 0 ? (
        <p className="my-deliveries__empty">No active deliveries assigned to you.</p>
      ) : (
        <ul className="my-deliveries__list">
          {deliveries.map((d) => {
            const nextLabel = NEXT_LABEL[d.status];
            return (
              <li key={d.id} className="my-deliveries__item">
                <div>
                  <strong>Order #{d.orderId}</strong>
                  <p>{d.deliveryAddress}</p>
                </div>
                <div className="my-deliveries__item-right">
                  <StatusBadge status={d.status} />
                  {nextLabel && (
                    <button
                      onClick={() => advance(d)}
                      disabled={updatingId === d.id}
                    >
                      {updatingId === d.id ? "Updating..." : nextLabel}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import { deliveryService } from "../deliveryService";
import { usePolling } from "../hooks/usePolling";
import type { Delivery } from "../types";
import StatusBadge from "./StatusBadge";
import "./DeliveryTrackingCard.css";

// This component is exported for reuse by Order Mgmt's order-status page
// (PRD 5.4: "Delivery status is readable by the customer through Order
// Mgmt's order status view"). Cross-module component imports aren't
// covered explicitly by PRD 9.3's "staying in your lane" table, so check
// with Gunasekara before importing this directly from cartorder/ — the
// safer route per that table is promoting it into src/components/ once
// both sides agree, rather than reaching into this feature folder.
export default function DeliveryTrackingCard({ orderId }: { orderId: number }) {
  const { data, error, loading } = usePolling<Delivery>(
    () => deliveryService.getDeliveryByOrderId(orderId),
    7000
  );

  if (loading) return <p>Loading delivery status...</p>;
  if (error) return <p className="delivery-tracking-card__error">{error}</p>;
  if (!data) return null;

  return (
    <div className="delivery-tracking-card">
      <div className="delivery-tracking-card__header">
        <h3>Delivery Status</h3>
        <StatusBadge status={data.status} />
      </div>
      <p className="delivery-tracking-card__address">{data.deliveryAddress}</p>
      {data.status === "OUT_FOR_DELIVERY" &&
        data.currentLatitude !== null &&
        data.currentLongitude !== null && (
          <p className="delivery-tracking-card__coords">
            Driver near {data.currentLatitude.toFixed(4)}, {data.currentLongitude.toFixed(4)}
            {" "}
            <span className="delivery-tracking-card__mock-note">
              (simulated location — no live GPS in this build)
            </span>
          </p>
        )}
      <p className="delivery-tracking-card__updated">
        Last updated {new Date(data.updatedAt).toLocaleString()}
      </p>
    </div>
  );
}

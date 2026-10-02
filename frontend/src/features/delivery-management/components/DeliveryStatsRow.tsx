import { deliveryService } from "../deliveryService";
import { usePolling } from "../hooks/usePolling";
import type { Delivery } from "../types";
import "./DeliveryStatsRow.css";

// Staff/admin only, per the RBAC table: "Top Stats Row ... Hidden (Not
// visible to customer)". Not a separate backend endpoint — just counts
// derived from GET /api/v1/deliveries, since the dataset is demo-scale
// (PRD 4.5 explicitly skips pagination for this reason).
export default function DeliveryStatsRow() {
  const { data, loading } = usePolling<Delivery[]>(
    () => deliveryService.getAllDeliveries(),
    7000
  );

  const deliveries = data ?? [];
  const total = deliveries.length;
  const pending = deliveries.filter((d) => d.status === "ORDER_PLACED").length;
  const outForDelivery = deliveries.filter((d) => d.status === "OUT_FOR_DELIVERY").length;
  const delivered = deliveries.filter((d) => d.status === "DELIVERED").length;

  const stats = [
    { label: "Total Deliveries", value: total },
    { label: "Pending", value: pending },
    { label: "Out for Delivery", value: outForDelivery },
    { label: "Delivered", value: delivered },
  ];

  return (
    <div className="delivery-stats-row">
      {stats.map((s) => (
        <div key={s.label} className="delivery-stats-row__card">
          <span className="delivery-stats-row__value">{loading ? "…" : s.value}</span>
          <span className="delivery-stats-row__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

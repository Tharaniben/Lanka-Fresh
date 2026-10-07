import { deliveryService } from "../deliveryService";
import { usePolling } from "../hooks/usePolling";
import type { Delivery } from "../types";
import StatusBadge from "./StatusBadge";
import AssignDeliveryForm from "./AssignDeliveryForm";
import "./UnassignedDeliveries.css";

export default function UnassignedDeliveries() {
  const { data, error, loading, refetch } = usePolling<Delivery[]>(
    () => deliveryService.getUnassignedDeliveries(),
    7000
  );

  if (loading) return <p>Loading unassigned deliveries...</p>;
  if (error) return <p className="unassigned-deliveries__error">{error}</p>;

  const deliveries = data ?? [];

  return (
    <div className="unassigned-deliveries">
      <h2>Unassigned Deliveries</h2>
      {deliveries.length === 0 ? (
        <p className="unassigned-deliveries__empty">
          Nothing waiting on assignment right now.
        </p>
      ) : (
        <table className="unassigned-deliveries__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Address</th>
              <th>Status</th>
              <th>Assign</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>#{d.orderId}</td>
                <td>{d.deliveryAddress}</td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td>
                  <AssignDeliveryForm deliveryId={d.id} onAssigned={refetch} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

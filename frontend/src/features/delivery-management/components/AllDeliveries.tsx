import { useState } from "react";
import { deliveryService } from "../deliveryService";
import { usePolling } from "../hooks/usePolling";
import type { Delivery } from "../types";
import StatusBadge from "./StatusBadge";
import AssignDeliveryForm from "./AssignDeliveryForm";
import "./AllDeliveries.css";

// Master registry for staff — full CRUD on this module's owned entities:
//   Create/Update  -> AssignDeliveryForm (assign or reassign an agent)
//   Update         -> inline address edit
//   Delete         -> "Unassign" button, which deletes the DeliveryAssignment,
//                      never the Delivery row (PRD 5.4: Delivery gets no Delete).
export default function AllDeliveries() {
  const { data, error, loading, refetch } = usePolling<Delivery[]>(
    () => deliveryService.getAllDeliveries(),
    7000
  );
  const [editingId, setEditingId] = useState<number | null>(null);
  const [addressDraft, setAddressDraft] = useState("");
  const [savingId, setSavingId] = useState<number | null>(null);
  const [unassigningId, setUnassigningId] = useState<number | null>(null);

  function startEdit(delivery: Delivery) {
    setEditingId(delivery.id);
    setAddressDraft(delivery.deliveryAddress);
  }

  async function saveAddress(deliveryId: number) {
    setSavingId(deliveryId);
    try {
      await deliveryService.updateAddress(deliveryId, { deliveryAddress: addressDraft });
      setEditingId(null);
      refetch();
    } finally {
      setSavingId(null);
    }
  }

  async function handleUnassign(deliveryId: number) {
    setUnassigningId(deliveryId);
    try {
      await deliveryService.unassignDelivery(deliveryId);
      refetch();
    } finally {
      setUnassigningId(null);
    }
  }

  if (loading) return <p>Loading deliveries...</p>;
  if (error) return <p className="all-deliveries__error">{error}</p>;

  const deliveries = data ?? [];

  return (
    <div className="all-deliveries">
      <h2>All Deliveries</h2>
      {deliveries.length === 0 ? (
        <p className="all-deliveries__empty">No deliveries recorded yet.</p>
      ) : (
        <table className="all-deliveries__table">
          <thead>
            <tr>
              <th>Order</th>
              <th>Address</th>
              <th>Status</th>
              <th>Agent</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map((d) => (
              <tr key={d.id}>
                <td>#{d.orderId}</td>
                <td>
                  {editingId === d.id ? (
                    <div className="all-deliveries__address-edit">
                      <input
                        value={addressDraft}
                        onChange={(e) => setAddressDraft(e.target.value)}
                        disabled={savingId === d.id}
                      />
                      <button
                        onClick={() => saveAddress(d.id)}
                        disabled={savingId === d.id}
                      >
                        {savingId === d.id ? "Saving..." : "Save"}
                      </button>
                      <button
                        className="all-deliveries__cancel-btn"
                        onClick={() => setEditingId(null)}
                        disabled={savingId === d.id}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <span onClick={() => startEdit(d)} className="all-deliveries__address">
                      {d.deliveryAddress}
                    </span>
                  )}
                </td>
                <td>
                  <StatusBadge status={d.status} />
                </td>
                <td>{d.assignedAgentId ?? "—"}</td>
                <td className="all-deliveries__actions">
                  {(d.status === "ORDER_PLACED" || d.status === "ASSIGNED") && (
                    <AssignDeliveryForm deliveryId={d.id} onAssigned={refetch} />
                  )}
                  {d.assignedAgentId !== null && d.status === "ASSIGNED" && (
                    <button
                      className="all-deliveries__unassign-btn"
                      onClick={() => handleUnassign(d.id)}
                      disabled={unassigningId === d.id}
                    >
                      {unassigningId === d.id ? "Unassigning..." : "Unassign"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

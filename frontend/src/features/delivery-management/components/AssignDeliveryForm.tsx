import { useEffect, useState } from "react";
import { deliveryService } from "../deliveryService";
import type { DeliveryDriver } from "../types";
import "./AssignDeliveryForm.css";

interface Props {
  deliveryId: number;
  onAssigned: () => void;
  drivers?: DeliveryDriver[];
}

const DEFAULT_STAFF: DeliveryDriver[] = [
  { id: 1, email: "deliverystaff@gmail.com", firstName: null, lastName: null, role: "DELIVERY_STAFF" },
  { id: 2, email: "kamal.delivery@lankafresh.lk", firstName: "Kamal", lastName: "Perera", role: "DELIVERY_STAFF" },
  { id: 3, email: "nimal.delivery@lankafresh.lk", firstName: "Nimal", lastName: "Silva", role: "DELIVERY_STAFF" },
];

export default function AssignDeliveryForm({
  deliveryId,
  onAssigned,
  drivers: initialDrivers,
}: Props) {
  const [drivers, setDrivers] = useState<DeliveryDriver[]>(
    initialDrivers && initialDrivers.length > 0 ? initialDrivers : DEFAULT_STAFF
  );
  const [selectedAgentId, setSelectedAgentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialDrivers && initialDrivers.length > 0) {
      setDrivers(initialDrivers);
      return;
    }

    deliveryService
      .getDeliveryStaff()
      .then((data) => {
        if (data && data.length > 0) {
          setDrivers(data);
        }
      })
      .catch((err) => {
        console.error("Failed to load delivery staff:", err);
      });
  }, [initialDrivers]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(selectedAgentId);
    if (!id || id <= 0) {
      setError("Please select a delivery staff ID");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deliveryService.assignDelivery(deliveryId, { agentUserId: id });
      setSelectedAgentId("");
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="assign-delivery-form" onSubmit={handleSubmit}>
      <select
        value={selectedAgentId}
        onChange={(e) => setSelectedAgentId(e.target.value)}
        disabled={submitting}
        className="assign-delivery-form__select"
      >
        <option value="">-- Select Delivery Staff ID --</option>
        {drivers.map((d) => (
          <option key={d.id} value={d.id}>
            Delivery Staff ID: {d.id}
          </option>
        ))}
      </select>
      <button type="submit" disabled={submitting || !selectedAgentId}>
        {submitting ? "Assigning..." : "Assign"}
      </button>
      {error && <span className="assign-delivery-form__error">{error}</span>}
    </form>
  );
}

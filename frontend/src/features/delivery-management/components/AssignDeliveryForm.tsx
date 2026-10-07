import { useState } from "react";
import { deliveryService } from "../deliveryService";
import "./AssignDeliveryForm.css";

interface Props {
  deliveryId: number;
  onAssigned: () => void;
}

export default function AssignDeliveryForm({ deliveryId, onAssigned }: Props) {
  // TODO: replace this free-text field with a real driver picker once
  // there's an endpoint to list Users with role DELIVERY_STAFF. Out of
  // scope for this module (User is Tharaniben's shared entity — PRD 4.6),
  // so raise it in the group chat if you need that list endpoint.
  const [agentUserId, setAgentUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(agentUserId.trim());
    if (!id || id <= 0 || !Number.isInteger(id)) {
      setError("Enter a valid positive agent user ID (cannot be negative or zero)");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deliveryService.assignDelivery(deliveryId, { agentUserId: id });
      setAgentUserId("");
      onAssigned();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to assign");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="assign-delivery-form" onSubmit={handleSubmit}>
      <input
        type="number"
        min="1"
        step="1"
        placeholder="Agent user ID"
        value={agentUserId}
        onChange={(e) => {
          const val = e.target.value;
          if (val === "" || (!val.includes("-") && Number(val) >= 0)) {
            setAgentUserId(val);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
            e.preventDefault();
          }
        }}
        disabled={submitting}
      />
      <button type="submit" disabled={submitting}>
        {submitting ? "Assigning..." : "Assign"}
      </button>
      {error && <span className="assign-delivery-form__error">{error}</span>}
    </form>
  );
}

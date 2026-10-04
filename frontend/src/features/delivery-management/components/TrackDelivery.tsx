import { useState } from "react";
import { deliveryService } from "../deliveryService";
import type { Delivery } from "../types";
import StatusBadge from "./StatusBadge";
import "./TrackDelivery.css";

const STEPS: Array<{ status: Delivery["status"]; label: string }> = [
  { status: "ORDER_PLACED", label: "Placed" },
  { status: "ASSIGNED", label: "Assigned" },
  { status: "OUT_FOR_DELIVERY", label: "Out for Delivery" },
  { status: "DELIVERED", label: "Delivered" },
];

function stepIndex(status: Delivery["status"]): number {
  const idx = STEPS.findIndex((s) => s.status === status);
  return idx === -1 ? 0 : idx; // CANCELLED falls back to step 0 visually
}

// Available to both Customer and Staff, per the RBAC plan — the default
// landing view. Customers look up their own order; staff can look up any
// delivery. Lookup mode (Delivery ID vs Order ID) matches the two GET
// endpoints the backend actually exposes (PRD 5.4).
export default function TrackDelivery() {
  const [mode, setMode] = useState<"delivery" | "order">("order");
  const [idInput, setIdInput] = useState("");
  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const id = Number(idInput);
    if (!id || id <= 0 || !Number.isInteger(id)) {
      setError(`Please enter a valid positive ${mode === "order" ? "Order ID" : "Delivery ID"}`);
      return;
    }
    setLoading(true);
    setError(null);
    setDelivery(null);
    try {
      const result =
        mode === "order"
          ? await deliveryService.getDeliveryByOrderId(id)
          : await deliveryService.getDeliveryById(id);
      setDelivery(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delivery not found");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-delivery">
      <h2>Track a Delivery</h2>

      <form className="track-delivery__search" onSubmit={handleSearch}>
        <select value={mode} onChange={(e) => setMode(e.target.value as "delivery" | "order")}>
          <option value="order">By Order ID</option>
          <option value="delivery">By Delivery ID</option>
        </select>
        <input
          type="number"
          min="1"
          step="1"
          placeholder={mode === "order" ? "Order ID" : "Delivery ID"}
          value={idInput}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || (!val.includes("-") && Number(val) >= 0)) {
              setIdInput(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
              e.preventDefault();
            }
          }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Searching..." : "Track"}
        </button>
      </form>

      {error && <p className="track-delivery__error">{error}</p>}

      {delivery && (
        <div className="track-delivery__result">
          <div className="track-delivery__header">
            <h3>Order #{delivery.orderId}</h3>
            <StatusBadge status={delivery.status} />
          </div>

          <p className="track-delivery__address">{delivery.deliveryAddress}</p>

          {delivery.status !== "CANCELLED" && (
            <div className="track-delivery__progress">
              {STEPS.map((step, i) => (
                <div
                  key={step.status}
                  className={`track-delivery__step ${
                    i <= stepIndex(delivery.status) ? "track-delivery__step--done" : ""
                  }`}
                >
                  <div className="track-delivery__dot" />
                  <span>{step.label}</span>
                </div>
              ))}
            </div>
          )}

          {delivery.status === "OUT_FOR_DELIVERY" &&
            delivery.currentLatitude !== null &&
            delivery.currentLongitude !== null && (
              <p className="track-delivery__coords">
                Driver near {delivery.currentLatitude.toFixed(4)},{" "}
                {delivery.currentLongitude.toFixed(4)}{" "}
                <span className="track-delivery__mock-note">
                  (simulated location — no live GPS in this build)
                </span>
              </p>
            )}
        </div>
      )}
    </div>
  );
}

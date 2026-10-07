import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { deliveryService } from "../deliveryService";
import type { Delivery } from "../types";
import { useUserRole } from "../../../auth/useUserRole";
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
// landing view. Manager sees every customer's order; Customer sees their own orders.
export default function TrackDelivery() {
  const { role } = useUserRole();
  const isManager = role === "BRANCH_MANAGER";
  const [searchParams] = useSearchParams();

  const [orders, setOrders] = useState<Delivery[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string>("");
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [delivery, setDelivery] = useState<Delivery | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Load available orders for dropdown on mount
  useEffect(() => {
    deliveryService
      .getTrackableOrders()
      .then((data) => {
        setOrders(data ?? []);
        if (data && data.length > 0) {
          const orderIdParam = searchParams.get("orderId");
          const target =
            (orderIdParam && data.find((d) => String(d.orderId) === orderIdParam)) ||
            data[0];
          setSelectedOrderId(String(target.orderId));
          setDelivery(target);
        }
      })
      .catch((err) => {
        console.error("Failed to load orders for tracking:", err);
      })
      .finally(() => {
        setLoadingOrders(false);
      });
  }, [searchParams]);

  async function handleOrderSelect(orderIdStr: string) {
    setSelectedOrderId(orderIdStr);
    if (!orderIdStr) {
      setDelivery(null);
      return;
    }
    const orderId = Number(orderIdStr);
    setLoading(true);
    setError(null);
    try {
      const result = await deliveryService.getDeliveryByOrderId(orderId);
      setDelivery(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delivery not found");
      setDelivery(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-delivery">
      <h2>Track a Delivery</h2>

      {/* Customer / Manager order dropdown */}
      <div className="track-delivery__picker">
        <label htmlFor="customer-order-select">
          <strong>
            {isManager
              ? "Select Customer Order to Track (All Orders — Manager View):"
              : "Select Your Order to Track:"}
          </strong>
        </label>
        <div className="track-delivery__picker-row">
          <select
            id="customer-order-select"
            value={selectedOrderId}
            onChange={(e) => handleOrderSelect(e.target.value)}
            disabled={loadingOrders || loading}
            className="track-delivery__order-dropdown"
          >
            <option value="">
              {loadingOrders
                ? "Loading orders..."
                : isManager
                ? "-- Select Any Customer Order to Track --"
                : orders.length === 0
                ? "-- No Orders Found For Your Account --"
                : "-- Select Your Order to Track --"}
            </option>
            {orders.map((o) => (
              <option key={o.orderId} value={o.orderId}>
                Order #{o.orderId} — {o.deliveryAddress} ({o.status})
              </option>
            ))}
          </select>
        </div>
        {!isManager && orders.length === 0 && !loadingOrders && (
          <p className="track-delivery__no-orders-hint">
            No orders found under your customer account yet.
          </p>
        )}
      </div>

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
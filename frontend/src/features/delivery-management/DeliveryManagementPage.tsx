import { useState } from "react";
import { useUserRole } from "../../auth/useUserRole";
import TrackDelivery from "./components/TrackDelivery";
import DeliveryStatsRow from "./components/DeliveryStatsRow";
import UnassignedDeliveries from "./components/UnassignedDeliveries";
import MyDeliveries from "./components/MyDeliveries";
import AllDeliveries from "./components/AllDeliveries";
import "./DeliveryManagementPage.css";

type Tab = "tracking" | "unassigned" | "mine" | "all";

export default function DeliveryManagementPage() {
  const { role, userId, loading } = useUserRole();
  const [tab, setTab] = useState<Tab>("tracking");

  if (loading) {
    return <p className="delivery-management-page__loading">Loading delivery portal…</p>;
  }

  const isStaff = role === "DELIVERY_STAFF" || role === "BRANCH_MANAGER";

  return (
    <div className="delivery-management-page">
      <div className="delivery-management-page__top">
        <h1>Delivery Management</h1>
      </div>

      {isStaff && <DeliveryStatsRow />}

      <div className="delivery-management-page__tabs">
        <button
          className={tab === "tracking" ? "active" : ""}
          onClick={() => setTab("tracking")}
        >
          📍 Live Tracking
        </button>

        {isStaff && (
          <>
            <button
              className={tab === "unassigned" ? "active" : ""}
              onClick={() => setTab("unassigned")}
            >
              📋 Unassigned
            </button>
            <button
              className={tab === "mine" ? "active" : ""}
              onClick={() => setTab("mine")}
            >
              🚚 My Deliveries
            </button>
            <button
              className={tab === "all" ? "active" : ""}
              onClick={() => setTab("all")}
            >
              📦 All Deliveries
            </button>
          </>
        )}
      </div>

      {tab === "tracking" && <TrackDelivery />}

      {isStaff && tab === "unassigned" && <UnassignedDeliveries />}

      {isStaff && tab === "mine" && (
        <MyDeliveries agentUserId={userId ?? 0} />
      )}

      {isStaff && tab === "all" && <AllDeliveries />}
    </div>
  );
}

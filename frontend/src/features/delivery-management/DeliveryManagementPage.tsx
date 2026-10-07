import { useEffect, useState } from "react";
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

  const isManager = role === "BRANCH_MANAGER";
  const isDeliveryStaff = role === "DELIVERY_STAFF";

  const [tab, setTab] = useState<Tab>("tracking");

  // Automatically switch to the proper default tab once the role loads
  useEffect(() => {
    if (!loading) {
      if (isManager) {
        setTab((prev) => (prev === "mine" ? "all" : prev === "tracking" ? "all" : prev));
      } else if (isDeliveryStaff) {
        setTab("mine");
      }
    }
  }, [role, loading, isManager, isDeliveryStaff]);

  if (loading) {
    return <p className="delivery-management-page__loading">Loading delivery portal…</p>;
  }

  return (
    <div className="delivery-management-page">
      <div className="delivery-management-page__top">
        <h1>Delivery Management</h1>
      </div>

      {/* Top stats summary is for Branch Managers overseeing all deliveries */}
      {isManager && <DeliveryStatsRow />}

      <div className="delivery-management-page__tabs">
        {/* Branch Manager tabs */}
        {isManager && (
          <>
            <button
              className={tab === "all" ? "active" : ""}
              onClick={() => setTab("all")}
            >
              📦 All Deliveries
            </button>
            <button
              className={tab === "unassigned" ? "active" : ""}
              onClick={() => setTab("unassigned")}
            >
              📋 Unassigned
            </button>
          </>
        )}

        {/* Delivery Staff tab */}
        {isDeliveryStaff && (
          <button
            className={tab === "mine" ? "active" : ""}
            onClick={() => setTab("mine")}
          >
            🚚 My Deliveries
          </button>
        )}

        {/* Available to all */}
        <button
          className={tab === "tracking" ? "active" : ""}
          onClick={() => setTab("tracking")}
        >
          📍 Live Tracking
        </button>
      </div>

      {tab === "tracking" && <TrackDelivery />}

      {isManager && tab === "unassigned" && <UnassignedDeliveries />}

      {isDeliveryStaff && tab === "mine" && (
        <MyDeliveries agentUserId={userId ?? 0} />
      )}

      {isManager && tab === "all" && <AllDeliveries />}
    </div>
  );
}

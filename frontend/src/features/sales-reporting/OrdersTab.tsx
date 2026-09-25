import React, { useState, useEffect } from "react";
import type { OrderReportData } from "./types";
import { getOrderReport } from "./reportingService";

interface Props {
  onSaveReportClick: (reportType: "ORDERS", params: string) => void;
}

export const OrdersTab: React.FC<Props> = ({ onSaveReportClick }) => {
  const [data, setData] = useState<OrderReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getOrderReport();
      setData(res);
    } catch (err) {
      console.error("Failed to load order report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatRs = (val: number) =>
    "Rs. " +
    Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div>
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">Order Pipeline Health</span>
        </div>

        <button
          className="sr-btn sr-btn-primary"
          onClick={() =>
            onSaveReportClick("ORDERS", JSON.stringify({ timestamp: new Date() }))
          }
        >
          💾 Save Order Activity Report
        </button>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Tracking supermarket order volume...</span>
        </div>
      ) : data ? (
        <>
          <div className="sr-kpi-grid">
            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Gross Orders</div>
              <div className="sr-kpi-value">{data.totalOrders}</div>
              <div className="sr-kpi-subtext">All historical transactions</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Successfully Delivered</div>
              <div className="sr-kpi-value" style={{ color: "var(--primary-dark)" }}>
                {data.completedOrders}
              </div>
              <div className="sr-kpi-subtext positive">Completed orders</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Active / In Progress</div>
              <div className="sr-kpi-value" style={{ color: "#e67700" }}>
                {data.pendingOrders}
              </div>
              <div className="sr-kpi-subtext warning">Pending fulfillment</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Cancelled</div>
              <div className="sr-kpi-value" style={{ color: "#e03131" }}>
                {data.cancelledOrders}
              </div>
              <div className="sr-kpi-subtext danger">Cancelled or aborted</div>
            </div>
          </div>

          <div className="sr-card">
            <div className="sr-card-header">
              <div>
                <h2 className="sr-card-title">Recent Order Transactions</h2>
                <div className="sr-card-subtitle">
                  Last recorded supermarket customer purchases
                </div>
              </div>
            </div>

            <div className="sr-table-responsive">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer Name</th>
                    <th style={{ textAlign: "right" }}>Total Amount</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.recentOrders || []).map((o, idx) => {
                    let badge = <span className="sr-badge sr-badge-info">{o.status}</span>;
                    if (o.status === "DELIVERED") badge = <span className="sr-badge sr-badge-success">Delivered</span>;
                    if (o.status === "PENDING") badge = <span className="sr-badge sr-badge-warning">Pending</span>;
                    if (o.status === "CANCELLED") badge = <span className="sr-badge sr-badge-danger">Cancelled</span>;

                    return (
                      <tr key={o.orderId || idx}>
                        <td style={{ fontWeight: 600 }}>#{o.orderId}</td>
                        <td>{o.customerName}</td>
                        <td style={{ textAlign: "right", fontWeight: 600 }}>
                          {formatRs(o.totalAmount)}
                        </td>
                        <td>{badge}</td>
                        <td style={{ color: "var(--text-muted)" }}>{o.createdAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="sr-empty-state">No order activity data found.</div>
      )}
    </div>
  );
};

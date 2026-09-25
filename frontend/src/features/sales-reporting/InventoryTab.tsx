import React, { useState, useEffect } from "react";
import type { InventoryReportData } from "./types";
import { getInventoryReport } from "./reportingService";

interface Props {
  onSaveReportClick: (reportType: "INVENTORY", params: string) => void;
}

export const InventoryTab: React.FC<Props> = ({ onSaveReportClick }) => {
  const [data, setData] = useState<InventoryReportData | null>(null);
  const [filter, setFilter] = useState<"all" | "low" | "out" | "expiry">("all");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getInventoryReport();
      setData(res);
    } catch (err) {
      console.error("Failed to load inventory report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredItems = (data?.items || []).filter((item) => {
    if (filter === "low") return item.status === "LOW_STOCK";
    if (filter === "out") return item.status === "OUT_OF_STOCK";
    if (filter === "expiry") return item.nearExpiry;
    return true;
  });

  return (
    <div>
      {/* Controls Bar */}
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">Filter Status:</span>
          <select
            className="sr-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
          >
            <option value="all">All Products</option>
            <option value="low">Low Stock Alert Items</option>
            <option value="out">Out of Stock Only</option>
            <option value="expiry">Near Expiry (&lt; 7 Days)</option>
          </select>
        </div>

        <button
          className="sr-btn sr-btn-primary"
          onClick={() =>
            onSaveReportClick("INVENTORY", JSON.stringify({ filter }))
          }
        >
          💾 Save Inventory Health Report
        </button>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Auditing warehouse inventory...</span>
        </div>
      ) : data ? (
        <>
          {/* Inventory Summary Cards */}
          <div className="sr-kpi-grid">
            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Catalog Size</div>
              <div className="sr-kpi-value">{data.totalProducts}</div>
              <div className="sr-kpi-subtext">Active supermarket SKUs</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Low Stock Alert</div>
              <div
                className="sr-kpi-value"
                style={{
                  color: data.lowStockCount > 0 ? "#e67700" : "var(--text)",
                }}
              >
                {data.lowStockCount}
              </div>
              <div className="sr-kpi-subtext warning">
                Needs restocking soon
              </div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Out of Stock</div>
              <div
                className="sr-kpi-value"
                style={{
                  color: data.outOfStockCount > 0 ? "#e03131" : "var(--text)",
                }}
              >
                {data.outOfStockCount}
              </div>
              <div className="sr-kpi-subtext danger">Immediate reorder required</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Near Expiry (&lt; 7d)</div>
              <div
                className="sr-kpi-value"
                style={{
                  color: data.nearExpiryCount > 0 ? "#e67700" : "var(--text)",
                }}
              >
                {data.nearExpiryCount}
              </div>
              <div className="sr-kpi-subtext warning">Perishable alert</div>
            </div>
          </div>

          {/* Items Table */}
          <div className="sr-card">
            <div className="sr-card-header">
              <div>
                <h2 className="sr-card-title">Inventory Stock Levels</h2>
                <div className="sr-card-subtitle">
                  Warehouse availability cross-referenced with low-stock limits
                </div>
              </div>
            </div>

            <div className="sr-table-responsive">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Current Stock</th>
                    <th style={{ textAlign: "right" }}>Low Threshold</th>
                    <th>Stock Status</th>
                    <th>Expiry Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item, idx) => {
                    let badge = (
                      <span className="sr-badge sr-badge-success">Optimal</span>
                    );
                    if (item.status === "LOW_STOCK") {
                      badge = (
                        <span className="sr-badge sr-badge-warning">
                          Low Stock
                        </span>
                      );
                    } else if (item.status === "OUT_OF_STOCK") {
                      badge = (
                        <span className="sr-badge sr-badge-danger">
                          Out of Stock
                        </span>
                      );
                    }

                    return (
                      <tr key={item.productId || idx}>
                        <td style={{ fontWeight: 600 }}>{item.productName}</td>
                        <td>
                          <span className="sr-badge sr-badge-info">
                            {item.category}
                          </span>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color:
                              item.currentStock <= item.lowStockThreshold
                                ? "#e67700"
                                : "var(--text)",
                          }}
                        >
                          {item.currentStock} units
                        </td>
                        <td style={{ textAlign: "right", color: "var(--text-muted)" }}>
                          {item.lowStockThreshold} units
                        </td>
                        <td>{badge}</td>
                        <td>
                          {item.expiryDate ? (
                            <span
                              style={{
                                color: item.nearExpiry
                                  ? "#e03131"
                                  : "var(--text-muted)",
                                fontWeight: item.nearExpiry ? 600 : 400,
                              }}
                            >
                              {item.expiryDate} {item.nearExpiry && "⚠️ Expiring"}
                            </span>
                          ) : (
                            <span style={{ color: "var(--text-muted)" }}>—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="sr-empty-state">No inventory data available.</div>
      )}
    </div>
  );
};

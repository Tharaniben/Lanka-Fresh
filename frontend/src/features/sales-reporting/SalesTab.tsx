import React, { useState, useEffect } from "react";
import type { SalesReportData } from "./types";
import { getSalesReport } from "./reportingService";

interface Props {
  onSaveReportClick: (reportType: "SALES", params: string) => void;
}

export const SalesTab: React.FC<Props> = ({ onSaveReportClick }) => {
  const [range, setRange] = useState("daily");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<SalesReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getSalesReport(
        range,
        fromDate || undefined,
        toDate || undefined
      );
      setData(res);
    } catch (err) {
      console.error("Failed to load sales report", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [range]);

  const formatRs = (val: number) =>
    "Rs. " +
    Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const exportCSV = () => {
    if (!data || !data.timeline) return;
    const header = "Date,Revenue,Orders\n";
    const rows = data.timeline
      .map((t) => `${t.label},${t.value},${t.count}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales-report-${range}-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      {/* Controls Bar */}
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">Interval:</span>
          <select
            className="sr-select"
            value={range}
            onChange={(e) => setRange(e.target.value)}
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly (Monday start)</option>
            <option value="monthly">Monthly Breakdown</option>
          </select>

          <span className="sr-filter-label" style={{ marginLeft: "12px" }}>
            From:
          </span>
          <input
            type="date"
            className="sr-input"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />

          <span className="sr-filter-label">To:</span>
          <input
            type="date"
            className="sr-input"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />

          <button className="sr-btn sr-btn-secondary" onClick={loadData}>
            Apply Filter
          </button>
        </div>

        <div className="sr-filter-group">
          <button className="sr-btn sr-btn-secondary" onClick={exportCSV}>
            📥 Export CSV
          </button>
          <button
            className="sr-btn sr-btn-primary"
            onClick={() =>
              onSaveReportClick(
                "SALES",
                JSON.stringify({ range, fromDate, toDate })
              )
            }
          >
            💾 Save This Report
          </button>
        </div>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Compiling sales metrics...</span>
        </div>
      ) : data ? (
        <>
          {/* Summary KPIs */}
          <div className="sr-kpi-grid">
            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Gross Period Sales</div>
              <div className="sr-kpi-value">{formatRs(data.totalSales)}</div>
              <div className="sr-kpi-subtext positive">
                {data.startDate} to {data.endDate}
              </div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Total Orders Fulfilled</div>
              <div className="sr-kpi-value">{data.totalOrders}</div>
              <div className="sr-kpi-subtext">Completed retail orders</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Average Order Value (AOV)</div>
              <div className="sr-kpi-value">
                {formatRs(data.averageOrderValue)}
              </div>
              <div className="sr-kpi-subtext positive">Per transaction mean</div>
            </div>
          </div>

          {/* Timeline Table */}
          <div className="sr-card">
            <div className="sr-card-header">
              <div>
                <h2 className="sr-card-title">Sales Breakdown</h2>
                <div className="sr-card-subtitle">
                  Detailed timeline of order transactions and gross revenues
                </div>
              </div>
            </div>

            <div className="sr-table-responsive">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>Date / Period</th>
                    <th style={{ textAlign: "right" }}>Orders Count</th>
                    <th style={{ textAlign: "right" }}>Gross Sales</th>
                    <th style={{ textAlign: "right" }}>Est. Avg per Order</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.timeline || []).map((t, idx) => {
                    const avg =
                      t.count > 0
                        ? (Number(t.value) / Number(t.count)).toFixed(2)
                        : "0.00";
                    return (
                      <tr key={idx}>
                        <td style={{ fontWeight: 500 }}>{t.label}</td>
                        <td style={{ textAlign: "right" }}>{t.count}</td>
                        <td
                          style={{
                            textAlign: "right",
                            fontWeight: 600,
                            color: "var(--primary-dark)",
                          }}
                        >
                          {formatRs(t.value)}
                        </td>
                        <td style={{ textAlign: "right", color: "var(--text-muted)" }}>
                          Rs. {avg}
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
        <div className="sr-empty-state">No sales data available.</div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from "react";
import type { RevenueReportData } from "./types";
import { getRevenueReport } from "./reportingService";

interface Props {
  onSaveReportClick: (reportType: "REVENUE", params: string) => void;
}

export const RevenueTab: React.FC<Props> = ({ onSaveReportClick }) => {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [data, setData] = useState<RevenueReportData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getRevenueReport(
        fromDate || undefined,
        toDate || undefined
      );
      setData(res);
    } catch (err) {
      console.error("Failed to load revenue report", err);
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
      {/* Controls Bar */}
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">From:</span>
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
            Filter Range
          </button>
        </div>

        <button
          className="sr-btn sr-btn-primary"
          onClick={() =>
            onSaveReportClick(
              "REVENUE",
              JSON.stringify({ fromDate, toDate })
            )
          }
        >
          💾 Save Revenue Report
        </button>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Analyzing revenue streams...</span>
        </div>
      ) : data ? (
        <>
          {/* Revenue KPI Cards */}
          <div className="sr-kpi-grid">
            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Gross Revenue</div>
              <div className="sr-kpi-value">{formatRs(data.grossRevenue)}</div>
              <div className="sr-kpi-subtext positive">Total billing volume</div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Net Realized Revenue</div>
              <div className="sr-kpi-value">{formatRs(data.netRevenue)}</div>
              <div className="sr-kpi-subtext positive">
                Excludes cancelled orders
              </div>
            </div>

            <div className="sr-kpi-card">
              <div className="sr-kpi-title">Deductions / Cancelled</div>
              <div className="sr-kpi-value">
                {formatRs(data.cancelledAmount)}
              </div>
              <div className="sr-kpi-subtext warning">
                Unrealized / returned orders
              </div>
            </div>
          </div>

          {/* Category Revenue Breakdown */}
          <div className="sr-card">
            <div className="sr-card-header">
              <div>
                <h2 className="sr-card-title">Revenue by Department & Category</h2>
                <div className="sr-card-subtitle">
                  Contribution share of each supermarket department
                </div>
              </div>
            </div>

            <div className="sr-table-responsive">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th style={{ textAlign: "right" }}>Units Sold</th>
                    <th style={{ textAlign: "right" }}>Revenue</th>
                    <th style={{ width: "30%" }}>Revenue Share</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.categoryBreakdown || []).map((cat, idx) => (
                    <tr key={idx}>
                      <td style={{ fontWeight: 600 }}>{cat.category}</td>
                      <td style={{ textAlign: "right" }}>{cat.unitsSold}</td>
                      <td
                        style={{
                          textAlign: "right",
                          fontWeight: 600,
                          color: "var(--primary-dark)",
                        }}
                      >
                        {formatRs(cat.revenue)}
                      </td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          <div
                            className="sr-progress-bar-bg"
                            style={{ margin: 0, flex: 1 }}
                          >
                            <div
                              className="sr-progress-bar-fill"
                              style={{ width: `${cat.percentage}%` }}
                            />
                          </div>
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 600,
                              minWidth: "40px",
                            }}
                          >
                            {cat.percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="sr-empty-state">No revenue data found.</div>
      )}
    </div>
  );
};

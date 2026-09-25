import React from "react";
import type { DashboardSummary } from "./types";

interface Props {
  data: DashboardSummary;
  onNavigateTab: (tab: string) => void;
  onSaveReportClick: () => void;
}

export const OverviewTab: React.FC<Props> = ({
  data,
  onNavigateTab,
  onSaveReportClick,
}) => {
  // Format currency helper
  const formatRs = (val: number) =>
    "Rs. " +
    Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Calculate SVG points for 14-day trend
  const trend = data.salesTrend || [];
  const maxVal = Math.max(...trend.map((t) => t.value), 1000);
  const svgWidth = 800;
  const svgHeight = 220;
  const padding = 30;

  const getX = (idx: number) =>
    trend.length > 1
      ? padding + (idx / (trend.length - 1)) * (svgWidth - padding * 2)
      : svgWidth / 2;

  const getY = (val: number) =>
    svgHeight - padding - (val / maxVal) * (svgHeight - padding * 2);

  const pointsString = trend
    .map((t, idx) => `${getX(idx)},${getY(t.value)}`)
    .join(" ");

  const areaString =
    pointsString.length > 0
      ? `${padding},${svgHeight - padding} ${pointsString} ${
          svgWidth - padding
        },${svgHeight - padding}`
      : "";

  return (
    <div>
      {/* KPI Cards */}
      <div className="sr-kpi-grid">
        <div className="sr-kpi-card">
          <div className="sr-kpi-title">Today's Sales</div>
          <div className="sr-kpi-value">{formatRs(data.todaySales)}</div>
          <div className="sr-kpi-subtext positive">
            <span>●</span> Live branch revenue today
          </div>
        </div>

        <div className="sr-kpi-card">
          <div className="sr-kpi-title">Weekly Revenue</div>
          <div className="sr-kpi-value">{formatRs(data.weekRevenue)}</div>
          <div className="sr-kpi-subtext">Last 7 days cumulative</div>
        </div>

        <div className="sr-kpi-card">
          <div className="sr-kpi-title">Total Orders (30d)</div>
          <div className="sr-kpi-value">{data.totalOrders}</div>
          <div className="sr-kpi-subtext positive">
            {data.orderStatus?.DELIVERED || 0} completed successfully
          </div>
        </div>

        <div className="sr-kpi-card">
          <div className="sr-kpi-title">Low Stock Alerts</div>
          <div className="sr-kpi-value">{data.lowStockCount}</div>
          <div
            className={`sr-kpi-subtext ${
              data.lowStockCount > 0 ? "warning" : "positive"
            }`}
          >
            {data.lowStockCount > 0
              ? "Items at or below restock threshold"
              : "All stock levels optimal"}
          </div>
        </div>
      </div>

      {/* 14-Day Sales Trend Chart */}
      <div className="sr-card">
        <div className="sr-card-header">
          <div>
            <h2 className="sr-card-title">14-Day Sales Trend</h2>
            <div className="sr-card-subtitle">
              Daily revenue fluctuation across the current billing period
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="sr-btn sr-btn-secondary sr-btn-sm"
              onClick={() => onNavigateTab("sales")}
            >
              Full Sales Report →
            </button>
            <button
              className="sr-btn sr-btn-primary sr-btn-sm"
              onClick={onSaveReportClick}
            >
              Save Snapshot
            </button>
          </div>
        </div>

        <div className="sr-chart-container">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="sr-trend-svg"
          >
            {/* Horizontal Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => {
              const y = svgHeight - padding - pct * (svgHeight - padding * 2);
              return (
                <g key={i}>
                  <line
                    x1={padding}
                    y1={y}
                    x2={svgWidth - padding}
                    y2={y}
                    className="sr-grid-line"
                  />
                  <text
                    x={padding - 5}
                    y={y + 4}
                    textAnchor="end"
                    className="sr-axis-label"
                  >
                    {(maxVal * pct).toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Area Fill */}
            {areaString && (
              <polygon points={areaString} className="sr-area-path" />
            )}

            {/* Trend Line */}
            {pointsString && (
              <polyline points={pointsString} className="sr-line-path" />
            )}

            {/* Data Points */}
            {trend.map((t, idx) => {
              const cx = getX(idx);
              const cy = getY(t.value);
              return (
                <circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="4"
                  className="sr-chart-point"
                >
                  <title>{`${t.label}: ${formatRs(t.value)} (${t.count} orders)`}</title>
                </circle>
              );
            })}

            {/* X-axis date labels */}
            {trend
              .filter((_, idx) => idx % 2 === 0 || idx === trend.length - 1)
              .map((t, idx) => {
                const actualIdx = trend.indexOf(t);
                const cx = getX(actualIdx);
                const shortDate = t.label.slice(5);
                return (
                  <text
                    key={idx}
                    x={cx}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="sr-axis-label"
                  >
                    {shortDate}
                  </text>
                );
              })}
          </svg>
        </div>
      </div>

      {/* Two-Column Section: Top Products & Order Status */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
          gap: "24px",
        }}
      >
        {/* Top 5 Products */}
        <div className="sr-card" style={{ marginBottom: 0 }}>
          <div className="sr-card-header">
            <div>
              <h2 className="sr-card-title">Top-Selling Products</h2>
              <div className="sr-card-subtitle">
                Ranked by volume sold this month
              </div>
            </div>
            <button
              className="sr-btn sr-btn-secondary sr-btn-sm"
              onClick={() => onNavigateTab("bestsellers")}
            >
              View All
            </button>
          </div>

          <div className="sr-table-responsive">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th style={{ textAlign: "right" }}>Sold</th>
                  <th style={{ textAlign: "right" }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data.topProducts || []).slice(0, 5).map((p, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>
                      <span className="sr-badge sr-badge-info">
                        {p.category}
                      </span>
                    </td>
                    <td style={{ textAlign: "right" }}>{p.quantitySold}</td>
                    <td style={{ textAlign: "right", fontWeight: 600 }}>
                      {formatRs(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="sr-card" style={{ marginBottom: 0 }}>
          <div className="sr-card-header">
            <div>
              <h2 className="sr-card-title">Order Fulfillment Status</h2>
              <div className="sr-card-subtitle">
                Operational pipeline overview
              </div>
            </div>
            <button
              className="sr-btn sr-btn-secondary sr-btn-sm"
              onClick={() => onNavigateTab("orders")}
            >
              Order Details
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              paddingTop: "8px",
            }}
          >
            {Object.entries(data.orderStatus || {}).map(([st, cnt]) => {
              const total = data.totalOrders || 1;
              const pct = Math.round((cnt / total) * 100);
              let badgeClass = "sr-badge-info";
              let fillClass = "var(--primary)";

              if (st === "DELIVERED") {
                badgeClass = "sr-badge-success";
                fillClass = "var(--primary)";
              } else if (st === "PENDING") {
                badgeClass = "sr-badge-warning";
                fillClass = "#f59f00";
              } else if (st === "CANCELLED") {
                badgeClass = "sr-badge-danger";
                fillClass = "#e03131";
              }

              return (
                <div key={st}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "13px",
                      marginBottom: "4px",
                    }}
                  >
                    <span
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      <span className={`sr-badge ${badgeClass}`}>{st}</span>
                      <span style={{ color: "var(--text-muted)" }}>
                        {cnt} orders
                      </span>
                    </span>
                    <span style={{ fontWeight: 600 }}>{pct}%</span>
                  </div>
                  <div className="sr-progress-bar-bg">
                    <div
                      className="sr-progress-bar-fill"
                      style={{ width: `${pct}%`, background: fillClass }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

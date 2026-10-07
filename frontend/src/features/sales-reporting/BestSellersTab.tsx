import React, { useState, useEffect } from "react";
import type { BestSellerProduct } from "./types";
import { getBestSellers } from "./reportingService";

interface Props {
  onSaveReportClick: (reportType: "BEST_SELLERS", params: string) => void;
}

export const BestSellersTab: React.FC<Props> = ({ onSaveReportClick }) => {
  const [products, setProducts] = useState<BestSellerProduct[]>([]);
  const [limit, setLimit] = useState(10);
  const [sortBy, setSortBy] = useState<"units" | "revenue">("units");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getBestSellers(limit);
      setProducts(res);
    } catch (err) {
      console.error("Failed to load best sellers", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [limit]);

  const formatRs = (val: number) =>
    "Rs. " +
    Number(val || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const sortedList = [...products].sort((a, b) =>
    sortBy === "units"
      ? b.quantitySold - a.quantitySold
      : b.revenue - a.revenue
  );

  return (
    <div>
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">Display Top:</span>
          <select
            className="sr-select"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
          >
            <option value={5}>Top 5 SKUs</option>
            <option value={10}>Top 10 SKUs</option>
            <option value={20}>Top 20 SKUs</option>
          </select>

          <span className="sr-filter-label" style={{ marginLeft: "12px" }}>
            Sort By:
          </span>
          <select
            className="sr-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "units" | "revenue")}
          >
            <option value="units">Volume (Units Sold)</option>
            <option value="revenue">Gross Revenue Generated</option>
          </select>
        </div>

        <button
          className="sr-btn sr-btn-primary"
          onClick={() =>
            onSaveReportClick(
              "BEST_SELLERS",
              JSON.stringify({ limit, sortBy })
            )
          }
        >
          💾 Save Top Products Report
        </button>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Ranking top products...</span>
        </div>
      ) : (
        <div className="sr-card">
          <div className="sr-card-header">
            <div>
              <h2 className="sr-card-title">Best-Selling Products Leaderboard</h2>
              <div className="sr-card-subtitle">
                Supermarket items driving maximum volume and revenue
              </div>
            </div>
          </div>

          <div className="sr-table-responsive">
            <table className="sr-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Product</th>
                  <th>Department</th>
                  <th style={{ textAlign: "right" }}>Quantity Sold</th>
                  <th style={{ textAlign: "right" }}>Total Revenue</th>
                </tr>
              </thead>
              <tbody>
                {sortedList.map((p, idx) => (
                  <tr key={p.productId || idx}>
                    <td>
                      <span
                        style={{
                          fontWeight: 700,
                          fontSize: "14px",
                          color: idx < 3 ? "var(--primary-dark)" : "var(--text-muted)",
                        }}
                      >
                        #{idx + 1}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span className="sr-badge sr-badge-info">
                        {p.category}
                      </span>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: 500 }}>
                      {p.quantitySold} units
                    </td>
                    <td
                      style={{
                        textAlign: "right",
                        fontWeight: 600,
                        color: "var(--primary-dark)",
                      }}
                    >
                      {formatRs(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

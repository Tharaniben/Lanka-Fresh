import React from "react";
import type { SavedReport } from "./types";

interface Props {
  report: SavedReport | null;
  onClose: () => void;
}

export const ReportDetailModal: React.FC<Props> = ({ report, onClose }) => {
  if (!report) return null;

  let parsedNotes = "";
  if (report.summaryJson) {
    try {
      const parsed = JSON.parse(report.summaryJson);
      parsedNotes = parsed.notes || "";
    } catch {
      parsedNotes = report.summaryJson;
    }
  }

  return (
    <div className="sr-modal-overlay">
      <div className="sr-modal">
        <h3 className="sr-modal-title">{report.name}</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
              Category
            </span>
            <span className="sr-badge sr-badge-info">{report.reportType}</span>
          </div>

          <div>
            <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
              Author & Creation Date
            </span>
            <span style={{ fontSize: "14px", fontWeight: 500 }}>
              {report.createdByName || "Manager"} on{" "}
              {report.createdAt ? report.createdAt.slice(0, 10) : "N/A"}
            </span>
          </div>

          {report.parameters && (
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                Filter Parameters
              </span>
              <pre
                style={{
                  background: "#f8fafc",
                  padding: "8px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  margin: "4px 0 0 0",
                  overflowX: "auto",
                }}
              >
                {report.parameters}
              </pre>
            </div>
          )}

          {parsedNotes && (
            <div>
              <span style={{ fontSize: "12px", color: "var(--text-muted)", display: "block" }}>
                Manager Notes
              </span>
              <p
                style={{
                  margin: "4px 0 0 0",
                  fontSize: "14px",
                  background: "#fff9db",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ffe066",
                }}
              >
                {parsedNotes}
              </p>
            </div>
          )}
        </div>

        <div className="sr-modal-footer">
          <button className="sr-btn sr-btn-secondary" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

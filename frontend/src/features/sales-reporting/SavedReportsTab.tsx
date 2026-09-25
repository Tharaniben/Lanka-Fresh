import React, { useState, useEffect } from "react";
import type { SavedReport } from "./types";
import {
  getAllSavedReports,
  deleteSavedReport,
  updateSavedReport,
} from "./reportingService";

interface Props {
  onOpenCreateModal: () => void;
  onViewReport: (report: SavedReport) => void;
}

export const SavedReportsTab: React.FC<Props> = ({
  onOpenCreateModal,
  onViewReport,
}) => {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState<SavedReport | null>(null);
  const [editName, setEditName] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await getAllSavedReports();
      setReports(res);
    } catch (err) {
      console.error("Failed to load saved reports", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this saved report?"))
      return;
    try {
      await deleteSavedReport(id);
      setReports((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const handleStartEdit = (report: SavedReport) => {
    setEditingReport(report);
    setEditName(report.name);
  };

  const handleSaveEdit = async () => {
    if (!editingReport) return;
    try {
      const updated = await updateSavedReport(editingReport.id, {
        name: editName,
        reportType: editingReport.reportType,
        dateRangeStart: editingReport.dateRangeStart || undefined,
        dateRangeEnd: editingReport.dateRangeEnd || undefined,
        parameters: editingReport.parameters || undefined,
        summaryJson: editingReport.summaryJson || undefined,
      });
      setReports((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setEditingReport(null);
    } catch (err) {
      alert("Failed to update report name.");
    }
  };

  return (
    <div>
      <div className="sr-filters">
        <div className="sr-filter-group">
          <span className="sr-filter-label">
            Archived Business Reports ({reports.length})
          </span>
        </div>

        <button className="sr-btn sr-btn-primary" onClick={onOpenCreateModal}>
          ➕ Create New Saved Report
        </button>
      </div>

      {loading ? (
        <div className="sr-loading">
          <div className="sr-spinner" />
          <span>Loading saved archives...</span>
        </div>
      ) : reports.length === 0 ? (
        <div className="sr-card" style={{ textAlign: "center", padding: "40px" }}>
          <div style={{ fontSize: "36px", marginBottom: "12px" }}>📁</div>
          <h3 style={{ margin: "0 0 6px 0", color: "var(--text)" }}>
            No Saved Reports Yet
          </h3>
          <p style={{ color: "var(--text-muted)", margin: "0 0 16px 0" }}>
            You can save any sales, revenue, or inventory report snapshot to
            revisit or print later.
          </p>
          <button className="sr-btn sr-btn-primary" onClick={onOpenCreateModal}>
            Save Your First Report
          </button>
        </div>
      ) : (
        <div className="sr-card">
          <div className="sr-table-responsive">
            <table className="sr-table">
              <thead>
                <tr>
                  <th>Report Title</th>
                  <th>Category</th>
                  <th>Date Coverage</th>
                  <th>Saved By</th>
                  <th>Saved At</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 600 }}>{r.name}</td>
                    <td>
                      <span className="sr-badge sr-badge-info">
                        {r.reportType}
                      </span>
                    </td>
                    <td style={{ color: "var(--text-muted)" }}>
                      {r.dateRangeStart && r.dateRangeEnd
                        ? `${r.dateRangeStart} → ${r.dateRangeEnd}`
                        : "Current live"}
                    </td>
                    <td>{r.createdByName || "Manager"}</td>
                    <td style={{ color: "var(--text-muted)", fontSize: "13px" }}>
                      {r.createdAt ? r.createdAt.slice(0, 10) : "Today"}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div
                        style={{
                          display: "inline-flex",
                          gap: "6px",
                          justifyContent: "flex-end",
                        }}
                      >
                        <button
                          className="sr-btn sr-btn-secondary sr-btn-sm"
                          onClick={() => onViewReport(r)}
                        >
                          View
                        </button>
                        <button
                          className="sr-btn sr-btn-secondary sr-btn-sm"
                          onClick={() => handleStartEdit(r)}
                        >
                          Rename
                        </button>
                        <button
                          className="sr-btn sr-btn-danger sr-btn-sm"
                          onClick={() => handleDelete(r.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {editingReport && (
        <div className="sr-modal-overlay">
          <div className="sr-modal">
            <h3 className="sr-modal-title">Rename Saved Report</h3>
            <div className="sr-form-group">
              <label className="sr-form-label">Report Title</label>
              <input
                type="text"
                className="sr-form-input"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="sr-modal-footer">
              <button
                className="sr-btn sr-btn-secondary"
                onClick={() => setEditingReport(null)}
              >
                Cancel
              </button>
              <button
                className="sr-btn sr-btn-primary"
                onClick={handleSaveEdit}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

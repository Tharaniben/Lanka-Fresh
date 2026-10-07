import React, { useState } from "react";
import type { ReportType, SavedReportRequest } from "./types";

interface Props {
  isOpen: boolean;
  defaultType?: ReportType;
  defaultParams?: string;
  onClose: () => void;
  onSave: (data: SavedReportRequest) => Promise<void>;
}

export const SaveReportModal: React.FC<Props> = ({
  isOpen,
  defaultType = "SALES",
  defaultParams = "",
  onClose,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [reportType, setReportType] = useState<ReportType>(defaultType);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please provide a name for this report.");
      return;
    }

    try {
      setSaving(true);
      await onSave({
        name: name.trim(),
        reportType,
        parameters: defaultParams,
        summaryJson: notes ? JSON.stringify({ notes }) : undefined,
      });
      setName("");
      setNotes("");
      onClose();
    } catch (err) {
      alert("Failed to save report.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="sr-modal-overlay">
      <div className="sr-modal">
        <h3 className="sr-modal-title">Save Report to Archives</h3>
        <form onSubmit={handleSubmit}>
          <div className="sr-form-group">
            <label className="sr-form-label">Report Name *</label>
            <input
              type="text"
              className="sr-form-input"
              placeholder="e.g. Q3 Weekly Produce Sales Breakdown"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Report Category</label>
            <select
              className="sr-select"
              style={{ width: "100%" }}
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
            >
              <option value="SALES">Sales Performance</option>
              <option value="REVENUE">Revenue & Financial</option>
              <option value="BEST_SELLERS">Best-Selling Products</option>
              <option value="INVENTORY">Inventory & Stock Health</option>
              <option value="ORDERS">Order Activity</option>
              <option value="DASHBOARD">Executive Summary</option>
            </select>
          </div>

          <div className="sr-form-group">
            <label className="sr-form-label">Notes / Description (Optional)</label>
            <textarea
              className="sr-form-textarea"
              rows={3}
              placeholder="Add internal notes or observation remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="sr-modal-footer">
            <button
              type="button"
              className="sr-btn sr-btn-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="sr-btn sr-btn-primary"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Report Snapshot"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

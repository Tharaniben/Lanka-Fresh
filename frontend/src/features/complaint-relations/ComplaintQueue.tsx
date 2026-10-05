import { useEffect, useState } from "react";
import { complaintService } from "./complaintService";
import {
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUS_LABELS,
  type Complaint,
  type ComplaintStatus,
} from "./types";
import "./ComplaintQueue.css";

const STATUS_FILTERS: Array<ComplaintStatus | "ALL"> = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];
const NEXT_STATUS_OPTIONS: ComplaintStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export default function ComplaintQueue() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [filter, setFilter] = useState<ComplaintStatus | "ALL">("OPEN");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  async function load() {
    setLoading(true);
    try {
      const data = await complaintService.getAllComplaints(filter === "ALL" ? undefined : filter);
      setComplaints(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not load complaints.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  return (
    <div className="complaint-queue">
      <div className="complaint-queue__header">
        <h2>Complaint queue</h2>
        <div className="complaint-queue__filters">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`complaint-queue__filter ${filter === f ? "complaint-queue__filter--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "ALL" ? "All" : COMPLAINT_STATUS_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {loading && <p className="complaint-queue__status">Loading…</p>}
      {error && <p className="complaint-queue__status complaint-queue__status--error">{error}</p>}
      {!loading && !error && complaints.length === 0 && (
        <p className="complaint-queue__status">Nothing here right now.</p>
      )}

      <ul className="complaint-queue__list">
        {complaints.map((c) => (
          <ComplaintRow
            key={c.id}
            complaint={c}
            expanded={expandedId === c.id}
            onToggle={() => setExpandedId(expandedId === c.id ? null : c.id)}
            onUpdated={(updated) => {
              setComplaints((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            }}
          />
        ))}
      </ul>
    </div>
  );
}

function ComplaintRow({
  complaint,
  expanded,
  onToggle,
  onUpdated,
}: {
  complaint: Complaint;
  expanded: boolean;
  onToggle: () => void;
  onUpdated: (c: Complaint) => void;
}) {
  const [nextStatus, setNextStatus] = useState<ComplaintStatus>(complaint.status);
  const [notes, setNotes] = useState(complaint.resolutionNotes ?? "");
  const [saving, setSaving] = useState(false);
  const [rowError, setRowError] = useState<string | null>(null);

  async function handleSave() {
    setRowError(null);
    if ((nextStatus === "RESOLVED" || nextStatus === "CLOSED") && !notes.trim()) {
      setRowError("Resolution notes are required when marking a complaint as Resolved or Closed.");
      return;
    }

    setSaving(true);
    try {
      const updated = await complaintService.updateStatus(complaint.id, {
        status: nextStatus,
        resolutionNotes: notes.trim() || undefined,
      });
      onUpdated(updated);
    } catch (err: any) {
      const backendMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Could not update this complaint.";
      setRowError(backendMessage);
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="complaint-queue__row">
      <button className="complaint-queue__summary" onClick={onToggle}>
        <span className="complaint-queue__subject">
          #{complaint.id} — {complaint.subject}
        </span>
        <span className="complaint-queue__customer">{complaint.customerName ?? "Unknown customer"}</span>
        <span className={`status-badge status-badge--${complaint.status.toLowerCase()}`}>
          {COMPLAINT_STATUS_LABELS[complaint.status]}
        </span>
      </button>

      {expanded && (
        <div className="complaint-queue__details">
          <p className="complaint-queue__meta">
            {COMPLAINT_CATEGORY_LABELS[complaint.category]}
            {complaint.orderId ? ` · Order #${complaint.orderId}` : ""} ·{" "}
            {new Date(complaint.createdAt).toLocaleString()}
          </p>
          <p className="complaint-queue__description">{complaint.description}</p>

          <label className="complaint-queue__field">
            <span>Status</span>
            <select
              value={nextStatus}
              onChange={(e) => {
                setNextStatus(e.target.value as ComplaintStatus);
                setRowError(null);
              }}
            >
              {NEXT_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {COMPLAINT_STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </label>

          <label className="complaint-queue__field">
            <span>
              Resolution notes (visible to the customer)
              {(nextStatus === "RESOLVED" || nextStatus === "CLOSED") && (
                <span style={{ color: "#e03131", fontWeight: "bold" }}> * (Required for {COMPLAINT_STATUS_LABELS[nextStatus]})</span>
              )}
            </span>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                if (rowError) setRowError(null);
              }}
              placeholder={
                nextStatus === "RESOLVED" || nextStatus === "CLOSED"
                  ? "Describe how this complaint was resolved (required)..."
                  : "Internal notes or resolution details..."
              }
            />
          </label>

          {rowError && <p className="complaint-queue__error">{rowError}</p>}

          <button className="complaint-queue__save" onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      )}
    </li>
  );
}

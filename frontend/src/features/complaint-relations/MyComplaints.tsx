import { useEffect, useRef, useState } from "react";
import { complaintService } from "./complaintService";
import {
  COMPLAINT_CATEGORY_LABELS,
  COMPLAINT_STATUS_LABELS,
  type Complaint,
  type ComplaintStatus,
} from "./types";
import "./MyComplaints.css";

const POLL_INTERVAL_MS = 8000;

const TRACK_STEPS: Array<{ key: string; label: string }> = [
  { key: "OPEN", label: "Submitted" },
  { key: "IN_PROGRESS", label: "Under Review" },
  { key: "RESOLVED", label: "Resolved / Closed" },
];

function getStepIndex(status: ComplaintStatus): number {
  switch (status) {
    case "OPEN":
      return 0;
    case "IN_PROGRESS":
      return 1;
    case "RESOLVED":
    case "CLOSED":
      return 2;
    default:
      return 0;
  }
}

interface MyComplaintsProps {
  initialComplaintId?: number | null;
}

export default function MyComplaints({ initialComplaintId }: MyComplaintsProps) {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tracking by Complaint ID
  const [searchId, setSearchId] = useState<string>(
    initialComplaintId ? String(initialComplaintId) : ""
  );
  const [trackedComplaint, setTrackedComplaint] = useState<Complaint | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackError, setTrackError] = useState<string | null>(null);

  // Status Filter for list
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "ALL">("ALL");

  const pollRef = useRef<number | undefined>(undefined);

  async function load(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const data = await complaintService.getMyComplaints();
      setComplaints(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not load your complaints.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  async function handleTrackById(idToTrack?: number) {
    const rawId = idToTrack !== undefined ? idToTrack : Number(searchId.trim());
    if (!rawId || isNaN(rawId) || rawId <= 0 || !Number.isInteger(rawId)) {
      setTrackError("Please enter a valid positive Complaint ID number.");
      return;
    }

    setTrackingLoading(true);
    setTrackError(null);
    try {
      const result = await complaintService.getById(rawId);
      setTrackedComplaint(result);
      if (idToTrack !== undefined) {
        setSearchId(String(idToTrack));
      }
    } catch (err: any) {
      setTrackedComplaint(null);
      setTrackError(err?.message ?? `Complaint #${rawId} not found.`);
    } finally {
      setTrackingLoading(false);
    }
  }

  useEffect(() => {
    load(true);
    if (initialComplaintId) {
      handleTrackById(initialComplaintId);
    }
    pollRef.current = window.setInterval(() => load(false), POLL_INTERVAL_MS);
    return () => window.clearInterval(pollRef.current);
  }, [initialComplaintId]);

  const filteredComplaints =
    statusFilter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === statusFilter);

  return (
    <div className="my-complaints">
      {/* Search / Track by Complaint ID Box */}
      <div className="complaint-tracker-box">
        <h2 className="complaint-tracker-box__title">Track Complaint by ID</h2>
        <p className="complaint-tracker-box__subtitle">
          Enter any Complaint ID number to check its real-time resolution status and updates.
        </p>

        <form
          className="complaint-tracker-box__form"
          onSubmit={(e) => {
            e.preventDefault();
            handleTrackById();
          }}
        >
          <div className="complaint-tracker-box__input-wrap">
            <span className="complaint-tracker-box__prefix">#</span>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 1"
              value={searchId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (!val.includes("-") && Number(val) >= 0)) {
                  setSearchId(val);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
                  e.preventDefault();
                }
              }}
              disabled={trackingLoading}
            />
          </div>
          <button
            type="submit"
            className="complaint-tracker-box__btn"
            disabled={trackingLoading || !searchId.trim()}
          >
            {trackingLoading ? "Tracking…" : "Track"}
          </button>
          {trackedComplaint && (
            <button
              type="button"
              className="complaint-tracker-box__clear-btn"
              onClick={() => {
                setTrackedComplaint(null);
                setSearchId("");
                setTrackError(null);
              }}
            >
              Clear
            </button>
          )}
        </form>

        {trackError && <p className="complaint-tracker-box__error">{trackError}</p>}

        {/* Tracked Complaint Detailed View */}
        {trackedComplaint && (
          <div className="complaint-track-result">
            <div className="complaint-track-result__header">
              <div className="complaint-track-result__title-area">
                <span className="complaint-track-result__id">Complaint #{trackedComplaint.id}</span>
                <h3 className="complaint-track-result__subject">{trackedComplaint.subject}</h3>
              </div>
              <StatusBadge status={trackedComplaint.status} />
            </div>

            {/* Visual Step Progress Tracker */}
            <div className="complaint-track-progress">
              {TRACK_STEPS.map((step, idx) => {
                const currentIdx = getStepIndex(trackedComplaint.status);
                const isDone = idx <= currentIdx;
                const isCurrent = idx === currentIdx;
                return (
                  <div
                    key={step.key}
                    className={`complaint-track-step ${isDone ? "complaint-track-step--done" : ""} ${
                      isCurrent ? "complaint-track-step--current" : ""
                    }`}
                  >
                    <div className="complaint-track-step__indicator">
                      {isDone ? "✓" : idx + 1}
                    </div>
                    <span className="complaint-track-step__label">{step.label}</span>
                  </div>
                );
              })}
            </div>

            <div className="complaint-track-result__meta">
              <span>
                <strong>Category:</strong> {COMPLAINT_CATEGORY_LABELS[trackedComplaint.category]}
              </span>
              {trackedComplaint.orderId && (
                <span>
                  <strong>Order ID:</strong> #{trackedComplaint.orderId}
                </span>
              )}
              <span>
                <strong>Submitted:</strong> {new Date(trackedComplaint.createdAt).toLocaleString()}
              </span>
              {trackedComplaint.customerName && (
                <span>
                  <strong>Raised By:</strong> {trackedComplaint.customerName}
                </span>
              )}
            </div>

            <div className="complaint-track-result__details">
              <strong>Complaint Details:</strong>
              <p>{trackedComplaint.description}</p>
            </div>

            {trackedComplaint.resolutionNotes ? (
              <div className="my-complaints__resolution">
                <strong>Response from Customer Relations:</strong>
                <p>{trackedComplaint.resolutionNotes}</p>
              </div>
            ) : (
              <p className="complaint-track-result__pending-note">
                Our customer relations team is actively reviewing this complaint. Resolution notes will appear here once updated.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Your Complaints List Section */}
      <div className="my-complaints__list-section">
        <div className="my-complaints__list-header">
          <h2 className="my-complaints__title">All Complaints ({complaints.length})</h2>
          {complaints.length > 0 && (
            <div className="my-complaints__filters">
              {(["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const).map((filter) => {
                const count =
                  filter === "ALL"
                    ? complaints.length
                    : complaints.filter((c) => c.status === filter).length;
                return (
                  <button
                    key={filter}
                    type="button"
                    className={`my-complaints__filter-btn ${
                      statusFilter === filter ? "my-complaints__filter-btn--active" : ""
                    }`}
                    onClick={() => setStatusFilter(filter)}
                  >
                    {filter === "ALL"
                      ? `All (${count})`
                      : `${COMPLAINT_STATUS_LABELS[filter]} (${count})`}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {loading && <p className="my-complaints__status">Loading your complaints…</p>}
        {error && <p className="my-complaints__status my-complaints__status--error">{error}</p>}

        {!loading && !error && complaints.length === 0 && (
          <p className="my-complaints__status">You haven't raised any complaints yet.</p>
        )}

        {!loading && complaints.length > 0 && filteredComplaints.length === 0 && (
          <p className="my-complaints__status">No complaints matching filter "{statusFilter}".</p>
        )}

        <ul className="my-complaints__list">
          {filteredComplaints.map((c) => (
            <li
              key={c.id}
              className={`my-complaints__item ${
                trackedComplaint?.id === c.id ? "my-complaints__item--highlight" : ""
              }`}
            >
              <div className="my-complaints__row">
                <div className="my-complaints__heading-group">
                  <span className="my-complaints__id-tag">Complaint #{c.id}</span>
                  <span className="my-complaints__subject">{c.subject}</span>
                </div>
                <div className="my-complaints__actions">
                  <StatusBadge status={c.status} />
                  <button
                    type="button"
                    className="my-complaints__track-btn"
                    onClick={() => {
                      setSearchId(String(c.id));
                      handleTrackById(c.id);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    title="Track this complaint"
                  >
                    Track
                  </button>
                </div>
              </div>
              <p className="my-complaints__meta">
                {COMPLAINT_CATEGORY_LABELS[c.category]}
                {c.orderId ? ` · Order #${c.orderId}` : ""} ·{" "}
                {new Date(c.createdAt).toLocaleDateString()}
              </p>
              <p className="my-complaints__description">{c.description}</p>
              {c.resolutionNotes && (
                <div className="my-complaints__resolution">
                  <strong>Response from Customer Relations:</strong>
                  <p>{c.resolutionNotes}</p>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Complaint["status"] }) {
  return (
    <span className={`status-badge status-badge--${status.toLowerCase()}`}>
      {COMPLAINT_STATUS_LABELS[status]}
    </span>
  );
}

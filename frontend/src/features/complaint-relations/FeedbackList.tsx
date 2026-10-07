import { useEffect, useRef, useState } from "react";
import { feedbackService } from "./complaintService";
import type { Feedback } from "./types";
import "./FeedbackList.css";

const POLL_INTERVAL_MS = 8000;

export default function FeedbackList() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const pollRef = useRef<number | undefined>(undefined);

  async function loadFeedbacks(showSpinner = false) {
    if (showSpinner) setLoading(true);
    try {
      const data = await feedbackService.getAllFeedback();
      setFeedbacks(data);
      setError(null);
    } catch (err: any) {
      setError(err?.message ?? "Could not load customer feedback.");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }

  useEffect(() => {
    loadFeedbacks(true);
    pollRef.current = window.setInterval(() => loadFeedbacks(false), POLL_INTERVAL_MS);
    return () => window.clearInterval(pollRef.current);
  }, []);

  // Filtered feedbacks
  const filtered = feedbacks.filter((fb) => {
    if (ratingFilter !== "ALL" && fb.rating !== ratingFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      const nameMatch = fb.customerName?.toLowerCase().includes(query) ?? false;
      const commentMatch = fb.comment?.toLowerCase().includes(query) ?? false;
      const orderMatch = fb.orderId ? String(fb.orderId).includes(query) : false;
      if (!nameMatch && !commentMatch && !orderMatch) {
        return false;
      }
    }
    return true;
  });

  // Calculate statistics
  const totalCount = feedbacks.length;
  const avgRating =
    totalCount > 0
      ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / totalCount).toFixed(1)
      : "0.0";
  const fiveStars = feedbacks.filter((f) => f.rating === 5).length;
  const fourStars = feedbacks.filter((f) => f.rating === 4).length;
  const positivePct =
    totalCount > 0
      ? Math.round(((fiveStars + fourStars) / totalCount) * 100)
      : 0;

  return (
    <div className="feedback-list">
      <div className="feedback-list__header">
        <div>
          <h2 className="feedback-list__title">Customer Feedback</h2>
          <p className="feedback-list__subtitle">
            Review customer ratings, comments, and order satisfaction.
          </p>
        </div>
        <button
          type="button"
          className="feedback-list__refresh-btn"
          onClick={() => loadFeedbacks(true)}
          disabled={loading}
        >
          {loading ? "Refreshing…" : "↻ Refresh"}
        </button>
      </div>

      {/* Stats Summary Cards */}
      <div className="feedback-list__stats">
        <div className="feedback-list__stat-card">
          <span className="feedback-list__stat-label">Average Rating</span>
          <div className="feedback-list__stat-val">
            <span className="feedback-list__rating-number">{avgRating}</span>
            <span className="feedback-list__rating-stars">
              {"★".repeat(Math.round(Number(avgRating)))}
              {"☆".repeat(5 - Math.round(Number(avgRating)))}
            </span>
          </div>
          <span className="feedback-list__stat-sub">Across {totalCount} reviews</span>
        </div>

        <div className="feedback-list__stat-card">
          <span className="feedback-list__stat-label">Total Reviews</span>
          <span className="feedback-list__stat-number">{totalCount}</span>
          <span className="feedback-list__stat-sub">Customer submissions</span>
        </div>

        <div className="feedback-list__stat-card">
          <span className="feedback-list__stat-label">Satisfaction Rate</span>
          <span className="feedback-list__stat-number">{positivePct}%</span>
          <span className="feedback-list__stat-sub">4 & 5 star ratings</span>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="feedback-list__controls">
        <div className="feedback-list__filters">
          <button
            type="button"
            className={`feedback-list__filter-btn ${
              ratingFilter === "ALL" ? "feedback-list__filter-btn--active" : ""
            }`}
            onClick={() => setRatingFilter("ALL")}
          >
            All Ratings ({totalCount})
          </button>
          {[5, 4, 3, 2, 1].map((r) => {
            const count = feedbacks.filter((f) => f.rating === r).length;
            return (
              <button
                key={r}
                type="button"
                className={`feedback-list__filter-btn ${
                  ratingFilter === r ? "feedback-list__filter-btn--active" : ""
                }`}
                onClick={() => setRatingFilter(r)}
              >
                {r} ★ ({count})
              </button>
            );
          })}
        </div>

        <div className="feedback-list__search">
          <input
            type="text"
            placeholder="Search by customer, comment, or order #..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="feedback-list__search-clear"
              onClick={() => setSearchQuery("")}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Loading & Error Indicators */}
      {loading && feedbacks.length === 0 && (
        <p className="feedback-list__status">Loading customer feedbacks…</p>
      )}
      {error && <p className="feedback-list__status feedback-list__status--error">{error}</p>}

      {!loading && !error && feedbacks.length === 0 && (
        <div className="feedback-list__empty">
          <p>No customer feedback has been submitted yet.</p>
        </div>
      )}

      {!loading && feedbacks.length > 0 && filtered.length === 0 && (
        <div className="feedback-list__empty">
          <p>No feedbacks match your current filter or search criteria.</p>
        </div>
      )}

      {/* Feedback Cards List */}
      <ul className="feedback-list__items">
        {filtered.map((fb) => (
          <li key={fb.id} className="feedback-list__item">
            <div className="feedback-list__item-header">
              <div className="feedback-list__customer-info">
                <span className="feedback-list__avatar">
                  {(fb.customerName || "Customer").charAt(0).toUpperCase()}
                </span>
                <div>
                  <h4 className="feedback-list__customer-name">
                    {fb.customerName || "Customer"}
                  </h4>
                  <span className="feedback-list__date">
                    {new Date(fb.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>

              <div className="feedback-list__rating-badge">
                <span className="feedback-list__stars-display" aria-label={`${fb.rating} out of 5 stars`}>
                  {"★".repeat(fb.rating)}
                  <span className="feedback-list__empty-stars">
                    {"★".repeat(5 - fb.rating)}
                  </span>
                </span>
                <span className="feedback-list__rating-tag">{fb.rating} / 5</span>
              </div>
            </div>

            {fb.orderId && (
              <div className="feedback-list__order-tag">
                <span>Related Order:</span>
                <strong>#{fb.orderId}</strong>
              </div>
            )}

            <div className="feedback-list__comment-area">
              {fb.comment ? (
                <p className="feedback-list__comment">{fb.comment}</p>
              ) : (
                <p className="feedback-list__no-comment">No written comment provided.</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

import { useState, type FormEvent } from "react";
import { feedbackService } from "./complaintService";
import "./FeedbackForm.css";

export default function FeedbackForm() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (rating < 1) {
      setError("Please choose a rating.");
      return;
    }

    let parsedOrderId: number | null = null;
    if (orderId.trim()) {
      parsedOrderId = Number(orderId.trim());
      if (!parsedOrderId || parsedOrderId <= 0 || !Number.isInteger(parsedOrderId)) {
        setError("Related order number must be a valid positive number.");
        return;
      }
    }

    setSubmitting(true);
    try {
      await feedbackService.submit({
        rating,
        comment: comment.trim() || undefined,
        orderId: parsedOrderId,
      });
      setSuccess(true);
      setRating(0);
      setComment("");
      setOrderId("");
    } catch (err: any) {
      setError(err?.message ?? "Could not submit your feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h2 className="feedback-form__title">Share feedback</h2>

      <div className="feedback-form__stars">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            type="button"
            key={n}
            className={`feedback-form__star ${n <= rating ? "feedback-form__star--filled" : ""}`}
            onClick={() => setRating(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
          >
            ★
          </button>
        ))}
      </div>

      <label className="feedback-form__field">
        <span>Related order number (optional)</span>
        <input
          type="number"
          min="1"
          step="1"
          value={orderId}
          onChange={(e) => {
            const val = e.target.value;
            if (val === "" || (!val.includes("-") && Number(val) >= 0)) {
              setOrderId(val);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e" || e.key === "+" || e.key === ".") {
              e.preventDefault();
            }
          }}
          placeholder="e.g. 1024"
          disabled={submitting}
        />
      </label>

      <label className="feedback-form__field">
        <span>Comments (optional)</span>
        <textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="What went well, what could be better?"
          disabled={submitting}
        />
      </label>

      {error && <p className="feedback-form__error">{error}</p>}
      {success && <p className="feedback-form__success">Thanks for the feedback!</p>}

      <button type="submit" className="feedback-form__submit" disabled={submitting}>
        {submitting ? "Sending…" : "Send feedback"}
      </button>
    </form>
  );
}

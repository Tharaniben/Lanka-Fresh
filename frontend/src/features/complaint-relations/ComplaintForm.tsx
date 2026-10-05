import { useState, type FormEvent } from "react";
import { complaintService } from "./complaintService";
import { COMPLAINT_CATEGORY_LABELS, type Complaint, type ComplaintCategory } from "./types";
import "./ComplaintForm.css";

interface ComplaintFormProps {
  onSubmitted?: (complaint: Complaint) => void;
}

const CATEGORIES = Object.keys(COMPLAINT_CATEGORY_LABELS) as ComplaintCategory[];

export default function ComplaintForm({ onSubmitted }: ComplaintFormProps) {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("OTHER");
  const [orderId, setOrderId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!subject.trim() || !description.trim()) {
      setError("Please fill in both a subject and a description.");
      return;
    }

    let parsedOrderId: number | null = null;
    if (orderId.trim()) {
      const num = Number(orderId.trim());
      if (isNaN(num) || num <= 0 || !Number.isInteger(num)) {
        setError("Order number must be a valid positive whole number (e.g. 1024). Cannot be negative or zero.");
        return;
      }
      parsedOrderId = num;
    }

    setSubmitting(true);
    try {
      const created = await complaintService.submit({
        subject: subject.trim(),
        description: description.trim(),
        category,
        orderId: parsedOrderId,
      });
      setSuccess(true);
      setSubject("");
      setDescription("");
      setCategory("OTHER");
      setOrderId("");
      onSubmitted?.(created);
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong submitting your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="complaint-form" onSubmit={handleSubmit}>
      <h2 className="complaint-form__title">Raise a complaint</h2>

      <label className="complaint-form__field">
        <span>Subject</span>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={150}
          placeholder="Short summary of the issue"
          disabled={submitting}
        />
      </label>

      <label className="complaint-form__field">
        <span>Category</span>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
          disabled={submitting}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {COMPLAINT_CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
      </label>

      <label className="complaint-form__field">
        <span>Related order number (optional, must be positive)</span>
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

      <label className="complaint-form__field">
        <span>Details</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Tell us what happened"
          disabled={submitting}
        />
      </label>

      {error && <p className="complaint-form__error">{error}</p>}
      {success && <p className="complaint-form__success">Complaint submitted — we'll get back to you soon.</p>}

      <button type="submit" className="complaint-form__submit" disabled={submitting}>
        {submitting ? "Submitting…" : "Submit complaint"}
      </button>
    </form>
  );
}

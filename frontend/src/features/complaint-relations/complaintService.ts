import api from "../../services/api"; // shared axios instance, already attaches Clerk JWT (4.4/4.9)
import type {
  Complaint,
  ComplaintStatusUpdatePayload,
  ComplaintSubmitPayload,
  Feedback,
  FeedbackSubmitPayload,
} from "./types";

/**
 * Small local helper to unwrap the { success, data, message } envelope (4.5).
 * If the shared api.ts has already added envelope-unwrapping by the time you read
 * this, res.data will already be the payload and this just passes it through -
 * either way this stays safe.
 */
function unwrap<T>(res: { data: any }): T {
  const body = res.data;
  if (body && typeof body === "object" && "success" in body) {
    if (!body.success) {
      throw new Error(body.message ?? "Request failed");
    }
    return body.data as T;
  }
  return body as T;
}

const BASE = "/complaints";
const FEEDBACK_BASE = "/feedback";

export const complaintService = {
  submit(payload: ComplaintSubmitPayload): Promise<Complaint> {
    return api.post(BASE, payload).then((res) => unwrap<Complaint>(res));
  },

  getMyComplaints(): Promise<Complaint[]> {
    return api.get(`${BASE}/my`).then((res) => unwrap<Complaint[]>(res));
  },

  getAllComplaints(status?: ComplaintStatus_): Promise<Complaint[]> {
    return api
      .get(BASE, { params: status ? { status } : {} })
      .then((res) => unwrap<Complaint[]>(res));
  },

  getById(id: number): Promise<Complaint> {
    return api.get(`${BASE}/${id}`).then((res) => unwrap<Complaint>(res));
  },

  updateStatus(id: number, payload: ComplaintStatusUpdatePayload): Promise<Complaint> {
    return api.patch(`${BASE}/${id}/status`, payload).then((res) => unwrap<Complaint>(res));
  },
};

export const feedbackService = {
  submit(payload: FeedbackSubmitPayload): Promise<Feedback> {
    return api.post(FEEDBACK_BASE, payload).then((res) => unwrap<Feedback>(res));
  },

  getMyFeedback(): Promise<Feedback[]> {
    return api.get(`${FEEDBACK_BASE}/my`).then((res) => unwrap<Feedback[]>(res));
  },

  getAllFeedback(): Promise<Feedback[]> {
    return api.get(FEEDBACK_BASE).then((res) => unwrap<Feedback[]>(res));
  },
};

// avoid a circular-looking import just for one type alias
type ComplaintStatus_ = Complaint["status"];
